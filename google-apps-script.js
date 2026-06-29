const DEFAULT_TASKLIST = '@default';
const APP_MARKER = 'BetriebsleiterPlan';
const SALES_SHEET_NAME = 'Tagesmeldungen';
const TARGETS_SHEET_NAME = 'Verkäuferziele';
const EMPLOYEES_SHEET_NAME = 'Mitarbeiter';
const KPI_SHEET_NAME = 'KPIs';
const INVENTORY_SHEET_NAME = 'Fahrzeugbestand';
const WORKSHOP_SHEET_NAME = 'Werkstatt';
const ACTIONS_SHEET_NAME = 'Maßnahmen';
const MEETINGS_SHEET_NAME = 'Meetings';
const MEETING_DRIVE_FOLDER_NAME = 'Operative Steuerung - Meetingprotokolle';
const BACKUP_ROOT_FOLDER_NAME = 'Operative Steuerung - Sicherungen';
const WEEKLY_BACKUP_FOLDER_NAME = 'Woechentliche Datenbackups';
const MONTHLY_BACKUP_FOLDER_NAME = 'Monatliche Tabellenkopien';
const SPREADSHEET_ID_PROPERTY = 'BETRIEBSLEITER_SPREADSHEET_ID';

function authorizeOnce() {
  getEmployeesSheet();
  getSalesSheet();
  getTargetsSheet();
  ensureOperationsSheets();
  CalendarApp.getDefaultCalendar().getName();
  Tasks.Tasklists.list();
  DriveApp.getRootFolder().getName();
  return 'Berechtigungen wurden angefragt und geprüft.';
}

function doGet(e) {
  try {
    const date = e.parameter.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const tasklist = e.parameter.tasklist || DEFAULT_TASKLIST;
    return json({
      ok: true,
      events: getCalendarEvents(date),
      tasks: getTasks(date, tasklist),
      records: getSalesRecords(),
      employees: getEmployeeRows(),
      targets: getSalesTargets(),
      kpis: getKpiRows(),
      inventory: getInventoryRows(),
      workshop: getWorkshopRows(),
      actions: getActionRows(),
      meetings: getMeetingRows(),
      boardTodos: getBoardTodosFromTasks(tasklist),
    });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'sync') {
      return json(syncPlan(data));
    }
    if (data.action === 'board-sync') {
      return json({
        ok: true,
        boardTodos: syncBoardTodos(data.tasklist || DEFAULT_TASKLIST, data.boardTodos || [], data.deletedBoardTodoIds || []),
      });
    }
    if (data.action === 'data-upsert') {
      return json(saveDataRows(data));
    }
    if (data.action === 'meeting-save') {
      upsertMeetingRows(data.meetings || []);
      return json({ ok: true, meetings: getMeetingRows() });
    }
    if (data.action === 'meeting-pdf-drive') {
      return json(saveMeetingPdfToDrive(data));
    }
    if (data.action === 'backup-setup') {
      return json(setupAutomaticBackups());
    }
    if (!data.action && data.seller) {
      saveSalesReport(data);
      return json({ ok: true, records: getSalesRecords(), targets: getSalesTargets() });
    }
    if (data.action === 'calendar') {
      const startTime = data.startTime || '09:00';
      const endTime = data.endTime || '09:30';
      const start = new Date(data.date + 'T' + startTime + ':00');
      const end = new Date(data.date + 'T' + endTime + ':00');
      CalendarApp.getDefaultCalendar().createEvent(data.title, start, end, {
        description: APP_MARKER + ':quick-calendar\nErstellt aus dem Betriebsleiter-Plan',
      });
    }
    if (data.action === 'task') {
      Tasks.Tasks.insert({
        title: data.title,
        due: data.date + 'T12:00:00.000Z',
        notes: APP_MARKER + ':quick-task\nErstellt aus dem Betriebsleiter-Plan',
      }, data.tasklist || DEFAULT_TASKLIST);
    }
    return json({
      ok: true,
      events: getCalendarEvents(data.date),
      tasks: getTasks(data.date, data.tasklist || DEFAULT_TASKLIST),
      checkStates: getManagedTaskStates(data.tasklist || DEFAULT_TASKLIST),
    });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function syncPlan(data) {
  const dateKey = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const tasklist = data.tasklist || DEFAULT_TASKLIST;
  const allowCalendarWrite = data.calendarWrite === true;
  const allowCleanup = data.cleanup === true;
  if (allowCleanup) {
    cleanupLegacyCalendarNoise();
    cleanupComplexTaskNoise(dateKey, tasklist);
  }
  if (allowCalendarWrite && isBusinessDay(dateKey) && data.businessDay !== false) {
    syncCalendarBlocks(dateKey, data.blocks || [], data.note || '');
  } else if (allowCleanup && (!isBusinessDay(dateKey) || data.businessDay === false)) {
    cleanupDailyPlan(dateKey, tasklist);
  }
  const boardTodos = syncBoardTodos(tasklist, data.boardTodos || [], data.deletedBoardTodoIds || []);
  syncPeriodicPlans(tasklist, data.periodicPlans || [], allowCalendarWrite, allowCleanup);
  saveActionRows(data.actions || []);
  upsertMeetingRows(data.meetings || []);
  return {
    ok: true,
    events: getCalendarEvents(dateKey),
    tasks: getTasks(dateKey, tasklist),
    checkStates: {},
    boardTodos: boardTodos,
    records: getSalesRecords(),
    employees: getEmployeeRows(),
    targets: getSalesTargets(),
    kpis: getKpiRows(),
    inventory: getInventoryRows(),
    workshop: getWorkshopRows(),
    actions: getActionRows(),
    meetings: getMeetingRows(),
  };
}

function syncBoardTodos(tasklist, boardTodos, deletedIds) {
  const existing = getManagedTasks(tasklist);
  const rawTasks = getAllTaskItems(tasklist);
  const rawTasksById = {};
  rawTasks.forEach(function(task) {
    rawTasksById[task.id] = task;
  });
  (deletedIds || []).forEach(function(id) {
    const marker = APP_MARKER + ':board:' + id;
    if (existing[marker]) Tasks.Tasks.remove(tasklist, existing[marker].id);
    else if (rawTasksById[id]) Tasks.Tasks.remove(tasklist, rawTasksById[id].id);
  });
  const returned = [];
  boardTodos.forEach(function(todo) {
    const marker = APP_MARKER + ':board:' + todo.id;
    const task = existing[marker] || (todo.googleTaskId ? rawTasksById[todo.googleTaskId] : null) || rawTasksById[todo.id];
    const remoteUpdatedAt = task ? latestTimestamp(markerValue(task.notes, 'updatedAt'), task.updated) : '';
    const localWins = !task || timestampValue(todo.updatedAt) >= timestampValue(remoteUpdatedAt);
    const status = localWins ? todo.status : googleTaskBoardStatus(task);
    const priority = localWins ? todo.priority : markerValue(task.notes, 'priority') || todo.priority || 'mittel';
    const due = localWins ? todo.due : (task.due ? task.due.slice(0, 10) : todo.due || '');
    const updatedAt = localWins ? todo.updatedAt || new Date().toISOString() : remoteUpdatedAt || new Date().toISOString();
    const synced = {
      id: todo.id,
      title: localWins ? todo.title : task.title,
      priority: priority,
      due: due,
      status: status,
      updatedAt: updatedAt,
      googleTaskId: task ? task.id : '',
    };
    const savedTask = upsertTask(tasklist, task, {
      title: synced.title,
      notes: [
        marker,
        'status=' + synced.status,
        'priority=' + synced.priority,
        'updatedAt=' + synced.updatedAt,
        'googleTaskId=' + (synced.googleTaskId || ''),
        'Betriebsleiter To-do-Board',
      ].join('\n'),
      due: synced.due ? synced.due + 'T12:00:00.000Z' : '',
      done: synced.status === 'done',
    });
    synced.googleTaskId = savedTask.id;
    returned.push(synced);
  });
  return mergeBoardTodos(returned, getBoardTodosFromTasks(tasklist));
}

function getBoardTodosFromTasks(tasklist) {
  return getAllTaskItems(tasklist).reduce(function(items, task) {
    const notes = task.notes || '';
    const boardMarker = firstMarker(notes, APP_MARKER + ':board:');
    const periodMarker = firstMarker(notes, APP_MARKER + ':task-period:');
    if (periodMarker) return items;
    const id = boardMarker ? boardMarker.replace(APP_MARKER + ':board:', '') : task.id;
    const status = googleTaskBoardStatus(task);
    items.push({
      id: id,
      googleTaskId: task.id,
      title: task.title || 'Ohne Titel',
      priority: markerValue(notes, 'priority') || 'mittel',
      due: task.due ? task.due.slice(0, 10) : '',
      status: status,
      updatedAt: latestTimestamp(markerValue(notes, 'updatedAt'), task.updated),
      source: boardMarker ? 'board' : 'google',
    });
    return items;
  }, []);
}

function mergeBoardTodos(localItems, remoteItems) {
  const map = {};
  remoteItems.concat(localItems).forEach(function(item) {
    const current = map[item.id];
    if (!current || timestampValue(item.updatedAt) >= timestampValue(current.updatedAt)) map[item.id] = item;
  });
  return Object.keys(map).map(function(id) { return map[id]; });
}

function latestTimestamp(first, second) {
  return timestampValue(first) >= timestampValue(second) ? (first || second || '') : (second || first || '');
}

function timestampValue(value) {
  const parsed = value ? new Date(value).getTime() : 0;
  return isNaN(parsed) ? 0 : parsed;
}

function getAllTaskItems(tasklist) {
  try {
    const response = Tasks.Tasks.list(tasklist || DEFAULT_TASKLIST, {
      showCompleted: true,
      showHidden: false,
      maxResults: 100,
    });
    return response.items || [];
  } catch (error) {
    return [];
  }
}

function normalizeBoardStatus(value) {
  if (value === 'doing' || value === 'done') return value;
  return 'open';
}

function googleTaskBoardStatus(task) {
  if (task.status === 'completed') return 'done';
  const markerStatus = normalizeBoardStatus(markerValue(task.notes || '', 'status') || 'open');
  return markerStatus === 'done' ? 'open' : markerStatus;
}

function syncPeriodicPlans(tasklist, periodicPlans, allowCalendarWrite, allowCleanup) {
  const existingTasks = getManagedTasks(tasklist);
  const activeTaskMarkers = {};
  const activeCalendarMarkers = {};
  periodicPlans.forEach(function(plan) {
    const dateKey = nextBusinessDayKey(plan.date);
    const calendarMarker = APP_MARKER + ':calendar-period-routine:' + plan.id;
    activeCalendarMarkers[calendarMarker] = true;
    const title = periodLabel(plan.period) + ': ' + plan.title;
    const description = [
      calendarMarker,
      'Fällig: ' + dateKey,
      plan.tagline || '',
      'Betriebsleiter-Plan',
    ].filter(Boolean).join('\n');
    if (allowCalendarWrite) upsertAllDayEvent(dateKey, calendarMarker, title, description);

    const taskMarker = APP_MARKER + ':task-period:' + plan.id;
    activeTaskMarkers[taskMarker] = true;
    const existingTask = existingTasks[taskMarker];
    const previousDueKey = existingTask ? markerValue(existingTask.notes, 'dueKey') : '';
    const previousCycleKey = existingTask ? markerValue(existingTask.notes, 'cycleKey') : '';
    const sameCycle = previousCycleKey
      ? previousCycleKey === plan.cycleKey
      : periodicCycleKey(plan.period, previousDueKey) === plan.cycleKey;
    const keepCompleted = Boolean(existingTask && existingTask.status === 'completed' && sameCycle);
    upsertTask(tasklist, existingTask, {
      title: title,
      notes: [
        taskMarker,
        'dueKey=' + dateKey,
        'cycleKey=' + (plan.cycleKey || ''),
        plan.tagline || '',
        'Prüfpunkte: ' + (plan.items || []).map(function(item) { return item.title; }).join(' · '),
      ].filter(Boolean).join('\n'),
      due: dateKey + 'T12:00:00.000Z',
      done: keepCompleted,
    });
  });
  if (allowCleanup) cleanupObsoletePeriodicRoutines(tasklist, existingTasks, activeTaskMarkers, activeCalendarMarkers, allowCalendarWrite);
}

function periodicCycleKey(period, dateKey) {
  if (!dateKey) return '';
  const date = new Date(dateKey + 'T12:00:00');
  const year = date.getFullYear();
  const month = date.getMonth();
  if (period === 'week') return year + '-W' + String(weekNumber(date)).padStart(2, '0');
  if (period === 'month') return year + '-' + String(month + 1).padStart(2, '0');
  if (period === 'quarter') return year + '-Q' + (Math.floor(month / 3) + 1);
  if (period === 'halfyear') return year + '-H' + (month < 6 ? 1 : 2);
  return String(year);
}

function weekNumber(date) {
  const target = new Date(date);
  target.setHours(12, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const weekOne = new Date(target.getFullYear(), 0, 4, 12);
  return 1 + Math.round(((target - weekOne) / 86400000 - 3 + ((weekOne.getDay() + 6) % 7)) / 7);
}

function saveDataRows(data) {
  const rows = data.rows || [];
  if (data.type === 'employees') rows.forEach(saveEmployeeRow);
  if (data.type === 'targets') rows.forEach(saveTargetRow);
  if (data.type === 'results') rows.forEach(saveSalesReport);
  if (data.type === 'kpis') rows.forEach(saveKpiRow);
  if (data.type === 'inventory') rows.forEach(saveInventoryRow);
  if (data.type === 'workshop') rows.forEach(saveWorkshopRow);
  return {
    ok: true,
    employees: getEmployeeRows(),
    records: getSalesRecords(),
    targets: getSalesTargets(),
    kpis: getKpiRows(),
    inventory: getInventoryRows(),
    workshop: getWorkshopRows(),
    actions: getActionRows(),
    meetings: getMeetingRows(),
  };
}

function saveActionRows(actions) {
  const sheet = ensureSheet(ACTIONS_SHEET_NAME, ['id', 'title', 'owner', 'due', 'priority', 'status', 'source', 'meetingId'], []);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 8).setValues([['id', 'title', 'owner', 'due', 'priority', 'status', 'source', 'meetingId']]);
  if (!actions.length) return;
  sheet.getRange(2, 1, actions.length, 8).setValues(actions.map(function(action) {
    return [action.id || '', action.title || '', action.owner || '', action.due || '', action.priority || 'mittel', action.status || 'open', action.source || '', action.meetingId || ''];
  }));
}

function saveMeetingRows(meetings) {
  const headers = ['id', 'title', 'area', 'date', 'startTime', 'endTime', 'status', 'moderatorId', 'participantIds', 'agenda', 'notes', 'decisions', 'issues', 'tasks', 'updatedAt', 'driveFileUrl'];
  const sheet = ensureSheet(MEETINGS_SHEET_NAME, headers, []);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (!meetings.length) return;
  sheet.getRange(2, 1, meetings.length, headers.length).setValues(meetings.map(meetingRowValues));
}

function upsertMeetingRows(meetings) {
  if (!meetings.length) return;
  const headers = ['id', 'title', 'area', 'date', 'startTime', 'endTime', 'status', 'moderatorId', 'participantIds', 'agenda', 'notes', 'decisions', 'issues', 'tasks', 'updatedAt', 'driveFileUrl'];
  const sheet = ensureSheet(MEETINGS_SHEET_NAME, headers, []);
  ensureSheetColumns(sheet, headers);
  const values = sheet.getDataRange().getValues();
  const rowById = {};
  const updatedAtById = {};
  values.slice(1).forEach(function(row, index) {
    if (row[0]) {
      rowById[String(row[0])] = index + 2;
      updatedAtById[String(row[0])] = new Date(row[14] || 0).getTime() || 0;
    }
  });
  meetings.forEach(function(meeting) {
    const incomingTime = new Date(meeting.updatedAt || meeting.createdAt || 0).getTime() || Date.now();
    if (rowById[String(meeting.id)] && updatedAtById[String(meeting.id)] > incomingTime) return;
    const row = meetingRowValues(meeting);
    const targetRow = rowById[String(meeting.id)] || sheet.getLastRow() + 1;
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
    rowById[String(meeting.id)] = targetRow;
  });
}

function meetingRowValues(meeting) {
  return [
    meeting.id || '', meeting.title || '', meeting.area || '', meeting.date || '', meeting.startTime || '', meeting.endTime || '',
    meeting.status || 'planned', meeting.moderatorId || '', JSON.stringify(meeting.participantIds || []), JSON.stringify(meeting.agenda || []),
    meeting.notes || '', JSON.stringify(meeting.decisions || []), JSON.stringify(meeting.issues || []), JSON.stringify(meeting.tasks || []),
    meeting.updatedAt || new Date().toISOString(), meeting.driveFileUrl || '',
  ];
}

function getMeetingRows() {
  const headers = ['id', 'title', 'area', 'date', 'startTime', 'endTime', 'status', 'moderatorId', 'participantIds', 'agenda', 'notes', 'decisions', 'issues', 'tasks', 'updatedAt', 'driveFileUrl'];
  const sheet = ensureSheet(MEETINGS_SHEET_NAME, headers, []);
  ensureSheetColumns(sheet, headers);
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(function(row) { return row[0]; }).map(function(row) {
    return {
      id: row[0], title: row[1], area: row[2], date: normalizeSheetDate(row[3]), startTime: row[4], endTime: row[5],
      status: row[6], moderatorId: row[7], participantIds: parseJsonCell(row[8], []), agenda: parseJsonCell(row[9], []),
      notes: row[10], decisions: parseJsonCell(row[11], []), issues: parseJsonCell(row[12], []), tasks: parseJsonCell(row[13], []),
      updatedAt: row[14] || '', driveFileUrl: row[15] || '',
    };
  });
}

function saveMeetingPdfToDrive(data) {
  if (!data.base64) throw new Error('Keine PDF-Daten empfangen.');
  const folder = getMeetingDriveFolder();
  const filename = data.filename || 'meetingprotokoll.pdf';
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(data.base64), 'application/pdf', filename));
  const meeting = data.meeting || {};
  meeting.driveFileUrl = file.getUrl();
  meeting.updatedAt = new Date().toISOString();
  if (meeting.id) upsertMeetingRows([meeting]);
  return { ok: true, driveFileId: file.getId(), driveFileUrl: file.getUrl() };
}

function getMeetingDriveFolder() {
  const folders = DriveApp.getFoldersByName(MEETING_DRIVE_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(MEETING_DRIVE_FOLDER_NAME);
}

function setupAutomaticBackups() {
  const handlers = ['runWeeklyDataBackup', 'runMonthlySpreadsheetBackup'];
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (handlers.indexOf(trigger.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('runWeeklyDataBackup').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
  ScriptApp.newTrigger('runMonthlySpreadsheetBackup').timeBased().onMonthDay(1).atHour(4).create();
  runWeeklyDataBackup();
  return {
    ok: true,
    message: 'Automatische Sicherung eingerichtet: montags Datenbackup, monatlich Tabellenkopie.',
    backupFolderUrl: getBackupRootFolder().getUrl(),
  };
}

function runWeeklyDataBackup() {
  const folder = getOrCreateChildFolder(getBackupRootFolder(), WEEKLY_BACKUP_FOLDER_NAME);
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
  const payload = {
    version: 1,
    createdAt: new Date().toISOString(),
    spreadsheetId: getOperationsSpreadsheet().getId(),
    employees: getEmployeeRows(),
    salesRecords: getSalesRecords(),
    salesTargets: getSalesTargets(),
    kpis: getKpiRows(),
    inventory: getInventoryRows(),
    workshop: getWorkshopRows(),
    actions: getActionRows(),
    meetings: getMeetingRows(),
    boardTodos: safeBackupValue(function() { return getBoardTodosFromTasks(DEFAULT_TASKLIST); }, []),
  };
  folder.createFile(`betriebsleiter-datenbackup_${timestamp}.json`, JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);
  cleanupOldBackupFiles(folder, 26);
}

function safeBackupValue(getter, fallback) {
  try {
    return getter();
  } catch (error) {
    return fallback;
  }
}

function runMonthlySpreadsheetBackup() {
  const folder = getOrCreateChildFolder(getBackupRootFolder(), MONTHLY_BACKUP_FOLDER_NAME);
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  const spreadsheet = getOperationsSpreadsheet();
  DriveApp.getFileById(spreadsheet.getId()).makeCopy(`Betriebsleiter-Dashboard_${timestamp}`, folder);
  cleanupOldBackupFiles(folder, 24);
}

function getBackupRootFolder() {
  const folders = DriveApp.getFoldersByName(BACKUP_ROOT_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(BACKUP_ROOT_FOLDER_NAME);
}

function getOrCreateChildFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function cleanupOldBackupFiles(folder, keepCount) {
  const files = [];
  const iterator = folder.getFiles();
  while (iterator.hasNext()) files.push(iterator.next());
  files.sort(function(a, b) { return b.getDateCreated().getTime() - a.getDateCreated().getTime(); });
  files.slice(keepCount).forEach(function(file) { file.setTrashed(true); });
}

function parseJsonCell(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveKpiRow(data) {
  const sheet = ensureSheet(KPI_SHEET_NAME, ['key', 'value', 'area', 'metric', 'kind'], []);
  ensureSheetColumns(sheet, ['key', 'value', 'area', 'metric', 'kind', 'updatedAt']);
  const rows = sheet.getDataRange().getValues();
  const key = data.key || data.metric || '';
  const existingRow = rows.findIndex(function(row, index) {
    return index > 0 && row[0] === key;
  });
  const values = [
    key,
    data.value === undefined || data.value === null ? '' : data.value,
    data.area || '',
    data.metric || '',
    data.kind || '',
    new Date(),
  ];
  if (existingRow > 0) sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}

function saveEmployeeRow(data) {
  const sheet = getEmployeesSheet();
  ensureSheetColumns(sheet, ['active','deactivatedAt']);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(header) { return normalizeHeader(header); });
  const id = data.id || slugify(data.name || '');
  const existingRow = rows.findIndex(function(row, index) {
    return index > 0 && (row[0] === id || row[1] === data.name);
  });
  const rowObject = {
    id: id,
    name: data.name || '',
    bereich: data.area || '',
    area: data.area || '',
    funktion: data.role || data.function || data.funktion || '',
    role: data.role || data.function || data.funktion || '',
    kontaktziel: Number(data.monthlyContactTarget || data.contactTarget || 0),
    monthlycontacttarget: Number(data.monthlyContactTarget || data.contactTarget || 0),
    verkaufsziel: Number(data.monthlySalesTarget || data.salesTarget || 0),
    monthlysalestarget: Number(data.monthlySalesTarget || data.salesTarget || 0),
    vorname: data.firstName || '',
    firstname: data.firstName || '',
    nachname: data.lastName || '',
    lastname: data.lastName || '',
    rolle: data.function || data.funktion || data.role || '',
    function: data.function || data.funktion || data.role || '',
    active: data.active === false ? false : true,
    deactivatedat: data.deactivatedAt || '',
  };
  const values = headers.map(function(header) {
    return rowObject[header] !== undefined ? rowObject[header] : '';
  });
  if (existingRow > 0) sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}

function saveTargetRow(data) {
  const sheet = getTargetsSheet();
  const rows = sheet.getDataRange().getValues();
  const existingRow = rows.findIndex(function(row, index) {
    return index > 0 && formatMonth(row[0]) === data.month && row[1] === data.seller;
  });
  const values = [
    data.month ? new Date(data.month + '-01T12:00:00') : new Date(),
    data.seller || '',
    Number(data.contactTarget || 0),
    Number(data.salesTarget || 0),
  ];
  if (existingRow > 0) sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}

function saveSalesReport(data) {
  const sheet = getSalesSheet();
  ensureSheetColumns(sheet, ['Eingang','Datum','Verkäufer','Kontakte','Leads','Angebote','Probefahrten','Verkäufe','Quelle','Meldungs-ID']);
  const rows = sheet.getDataRange().getValues();
  const existingRow = rows.findIndex(function(row, index) {
    return index > 0 && row[1] === data.date && row[2] === data.seller;
  });
  const values = [
    new Date(),
    data.date,
    data.seller,
    Number(data.contacts || 0),
    Number(data.leads || 0),
    Number(data.offers || 0),
    Number(data.testDrives || 0),
    Number(data.sales || 0),
    data.source || 'Mobile Mitarbeiter-App',
    data.id || '',
  ];
  if (existingRow > 0) sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}

function saveInventoryRow(data) {
  const sheet = ensureSheet(INVENTORY_SHEET_NAME, ['stock', 'vehicle', 'days', 'price', 'marketDelta', 'photos', 'online', 'margin', 'status', 'standzeit0', 'standzeit1', 'standzeit2', 'standzeit3'], []);
  ensureSheetColumns(sheet, ['stock', 'vehicle', 'days', 'price', 'marketDelta', 'photos', 'online', 'margin', 'status', 'standzeit0', 'standzeit1', 'standzeit2', 'standzeit3', 'updatedAt']);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(header) { return normalizeHeader(header); });
  const stock = data.stock || data.id || '';
  const existingRow = rows.findIndex(function(row, index) {
    return index > 0 && row[0] === stock;
  });
  const rowObject = {
    stock: stock,
    vehicle: data.vehicle || '',
    days: Number(data.days || 0),
    price: Number(data.price || 0),
    marketDelta: Number(data.marketDelta || 0),
    photos: Number(data.photos || 0),
    online: data.online === true || String(data.online).toLowerCase() === 'true' || String(data.online).toLowerCase() === 'ja',
    margin: Number(data.margin || 0),
    status: data.status || '',
    standzeit0: Number(data.standzeit0 || 0),
    standzeit1: Number(data.standzeit1 || 0),
    standzeit2: Number(data.standzeit2 || 0),
    standzeit3: Number(data.standzeit3 || 0),
    updatedAt: new Date(),
  };
  const values = headers.map(function(header) { return rowObject[header] !== undefined ? rowObject[header] : ''; });
  if (existingRow > 0) sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}

function saveWorkshopRow(data) {
  const sheet = ensureSheet(WORKSHOP_SHEET_NAME, ['area', 'capacity', 'soldHours', 'openOrders', 'missingParts', 'completions', 'complaints'], []);
  ensureSheetColumns(sheet, ['area', 'capacity', 'soldHours', 'openOrders', 'missingParts', 'completions', 'complaints', 'updatedAt']);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(header) { return normalizeHeader(header); });
  const area = data.area || '';
  const existingRow = rows.findIndex(function(row, index) {
    return index > 0 && row[0] === area;
  });
  const rowObject = {
    area: area,
    capacity: Number(data.capacity || 0),
    soldHours: Number(data.soldHours || 0),
    openOrders: Number(data.openOrders || 0),
    missingParts: Number(data.missingParts || 0),
    completions: Number(data.completions || 0),
    complaints: Number(data.complaints || 0),
    updatedAt: new Date(),
  };
  const values = headers.map(function(header) { return rowObject[header] !== undefined ? rowObject[header] : ''; });
  if (existingRow > 0) sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}

function getSalesRecords() {
  try {
    return getSalesSheet().getDataRange().getValues().slice(1)
      .filter(function(row) { return row[1] && row[2]; })
      .map(function(row) {
        return {
          received_at: row[0],
          date: formatDate(row[1]),
          seller: row[2],
          contacts: Number(row[3] || 0),
          leads: Number(row[4] || 0),
          offers: Number(row[5] || 0),
          testDrives: Number(row[6] || 0),
          sales: Number(row[7] || 0),
          source: row[8] || '',
          id: row[9] || '',
        };
      });
  } catch (error) {
    return [];
  }
}

function getSalesTargets() {
  try {
    return getTargetsSheet().getDataRange().getValues().slice(1)
      .filter(function(row) { return row[0] && row[1]; })
      .map(function(row) {
        return {
          month: formatMonth(row[0]),
          seller: row[1],
          contactTarget: Number(row[2] || 0),
          salesTarget: Number(row[3] || 0),
        };
      });
  } catch (error) {
    return defaultSalesTargets();
  }
}

function getEmployeeRows() {
  try {
    const sheet = getEmployeesSheet();
    ensureSheetColumns(sheet, ['active','deactivatedAt']);
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(function(header) { return normalizeHeader(header); });
    return values.slice(1)
      .filter(function(row) { return row[1]; })
      .map(function(row) {
        const activeIndex = headers.indexOf('active');
        const deactivatedIndex = headers.indexOf('deactivatedat');
        const activeValue = activeIndex >= 0 ? row[activeIndex] : true;
        return {
          id: row[0],
          name: row[1],
          area: row[2],
          role: row[3],
          monthlyContactTarget: Number(row[4] || 0),
          monthlySalesTarget: Number(row[5] || 0),
          firstName: row[6] || '',
          lastName: row[7] || '',
          function: row[8] || row[3] || '',
          active: activeValue === false || ['false', 'nein', 'inaktiv', 'deaktiviert', '0'].indexOf(String(activeValue).toLowerCase()) !== -1 ? false : true,
          deactivatedAt: deactivatedIndex >= 0 ? row[deactivatedIndex] || '' : '',
        };
      });
  } catch (error) {
    return [];
  }
}

function defaultSalesTargets() {
  const sellers = [
    ['Kaan Coban', 250, 20],
    ['Ailton Muja', 250, 15],
    ['Shvan Ahmad', 250, 12],
  ];
  const rows = [];
  for (let month = 1; month <= 12; month += 1) {
    sellers.forEach(function(seller) {
      rows.push({
        month: '2026-' + String(month).padStart(2, '0'),
        seller: seller[0],
        contactTarget: seller[1],
        salesTarget: seller[2],
      });
    });
  }
  return rows;
}

function getKpiRows() {
  return readObjectSheet(KPI_SHEET_NAME);
}

function getInventoryRows() {
  return readObjectSheet(INVENTORY_SHEET_NAME);
}

function getWorkshopRows() {
  return readObjectSheet(WORKSHOP_SHEET_NAME);
}

function getActionRows() {
  return readObjectSheet(ACTIONS_SHEET_NAME);
}

function readObjectSheet(name) {
  try {
    const spreadsheet = getOperationsSpreadsheet();
    const sheet = spreadsheet.getSheetByName(name);
    if (!sheet || sheet.getLastRow() < 2) return [];
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(function(header) {
      return normalizeHeader(header);
    });
    return values.slice(1).filter(function(row) {
      return row.some(function(cell) { return cell !== ''; });
    }).map(function(row) {
      const item = {};
      headers.forEach(function(header, index) {
        if (header) item[header] = row[index];
      });
      return item;
    });
  } catch (error) {
    return [];
  }
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+(.)/g, function(_, chr) { return chr.toUpperCase(); });
}

function ensureOperationsSheets() {
  getEmployeesSheet();
  ensureSheet(KPI_SHEET_NAME, ['key', 'value', 'area', 'metric', 'kind', 'updatedAt'], [
    ['Umsatz', '68400 €', 'Gesamtbetrieb', 'Umsatz', 'actual', new Date()],
    ['Ziel Umsatz', '250000 €', 'Gesamtbetrieb', 'Umsatz', 'target', new Date()],
    ['Ertrag', '11900 €', 'Gesamtbetrieb', 'Ertrag', 'actual', new Date()],
    ['Ziel Ertrag', '42000 €', 'Gesamtbetrieb', 'Ertrag', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Gesamtdeckungsbeitrag', '80000 €', 'Gesamtbetrieb', 'Gesamtdeckungsbeitrag', 'target', new Date()],
    ['Ziel Gesamtbetrieb · DB-Quote gesamt', '30%', 'Gesamtbetrieb', 'DB-Quote gesamt', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Deckungsbeitrag II', '25000 €', 'Gesamtbetrieb', 'Deckungsbeitrag II', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Absorption', '100%', 'Gesamtbetrieb', 'Absorption', 'target', new Date()],
    ['Ziel Verkauf · DB I Verkauf', '40000 €', 'Verkauf', 'DB I Verkauf', 'target', new Date()],
    ['Ziel Werkstatt · DB Werkstatt', '25000 €', 'Werkstatt', 'DB Werkstatt', 'target', new Date()],
    ['Ziel Teilelager · DB Teile', '15000 €', 'Teilelager', 'DB Teile', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Preisquote', '100%', 'Gesamtbetrieb', 'Preisquote', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Bildquote 15+', '100%', 'Gesamtbetrieb', 'Bildquote 15+', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Anteil verkaufsfertig', '85%', 'Gesamtbetrieb', 'Anteil verkaufsfertig', 'target', new Date()],
    ['Ziel Gesamtbetrieb · Anteil >90 Tage', '10%', 'Gesamtbetrieb', 'Anteil >90 Tage', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Onlinequote', '100%', 'Fahrzeugbestand', 'Onlinequote', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Preisquote', '100%', 'Fahrzeugbestand', 'Preisquote', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Bildquote 15+', '100%', 'Fahrzeugbestand', 'Bildquote 15+', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Anteil verkaufsfertig', '85%', 'Fahrzeugbestand', 'Anteil verkaufsfertig', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Anteil >90 Tage', '10%', 'Fahrzeugbestand', 'Anteil >90 Tage', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Ø Bestandsalter', '45', 'Fahrzeugbestand', 'Ø Bestandsalter', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Median Bestandsalter', '40', 'Fahrzeugbestand', 'Median Bestandsalter', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Bestandsalter 91-180 Tage', '0', 'Fahrzeugbestand', 'Bestandsalter 91-180 Tage', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Bestandsalter >180 Tage', '0', 'Fahrzeugbestand', 'Bestandsalter >180 Tage', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Standzeit 0', '1', 'Fahrzeugbestand', 'Standzeit 0', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Standzeit 1', '5', 'Fahrzeugbestand', 'Standzeit 1', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Standzeit 2', '45', 'Fahrzeugbestand', 'Standzeit 2', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Standzeit 3', '5', 'Fahrzeugbestand', 'Standzeit 3', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Fahrzeuge ohne Bilder', '0', 'Fahrzeugbestand', 'Fahrzeuge ohne Bilder', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Fahrzeuge ohne Preis', '0', 'Fahrzeugbestand', 'Fahrzeuge ohne Preis', 'target', new Date()],
    ['Ziel Fahrzeugbestand · Fahrzeuge nicht online', '0', 'Fahrzeugbestand', 'Fahrzeuge nicht online', 'target', new Date()],
    ['Ziel Verkauf · Conversion', '39%', 'Verkauf', 'Conversion', 'target', new Date()],
    ['Ziel Verkauf · Lead->Angebot', '54%', 'Verkauf', 'Lead->Angebot', 'target', new Date()],
    ['Ziel Verkauf · Probefahrtquote', '54%', 'Verkauf', 'Probefahrtquote', 'target', new Date()],
    ['Liquidität', 'stabil', 'Gesamtbetrieb', 'Liquidität', 'actual', new Date()],
    ['CSI/Kundenzufriedenheit', '91%', 'Gesamtbetrieb', 'CSI/Kundenzufriedenheit', 'actual', new Date()],
    ['Google-Bewertungen', '4,6', 'Gesamtbetrieb', 'Google-Bewertungen', 'actual', new Date()],
    ['Krankenquote', '3,2%', 'Gesamtbetrieb', 'Krankenquote', 'actual', new Date()],
  ]);
  ensureSheet(INVENTORY_SHEET_NAME, ['stock', 'vehicle', 'days', 'price', 'marketDelta', 'photos', 'online', 'margin', 'status', 'standzeit0', 'standzeit1', 'standzeit2', 'standzeit3'], [
    ['GW-1842', 'VW Golf Variant 1.5 TSI', 86, 21980, -3, 22, true, 2450, 'kritisch', 1, 5, 80, 3],
    ['GW-2012', 'Skoda Octavia Combi', 49, 23940, 5, 0, false, 2100, 'kritisch', 2, 7, 39, 0],
  ]);
  ensureSheet(WORKSHOP_SHEET_NAME, ['area', 'capacity', 'soldHours', 'openOrders', 'missingParts', 'completions', 'complaints'], [
    ['Mechanik', 72, 63, 18, 3, 11, 1],
    ['Diagnose', 18, 19, 7, 1, 4, 0],
  ]);
  ensureSheet(ACTIONS_SHEET_NAME, ['id', 'title', 'owner', 'due', 'priority', 'status'], [
    ['sheet-1', 'Langsteher GW-1842 Preisstrategie prüfen', 'Verkauf', nextBusinessDayKey(formatDate(new Date())), 'hoch', 'open'],
  ]);
  ensureSheet(MEETINGS_SHEET_NAME, ['id', 'title', 'area', 'date', 'startTime', 'endTime', 'status', 'moderatorId', 'participantIds', 'agenda', 'notes', 'decisions', 'issues', 'tasks'], []);
}

function normalizeSheetDate(value) {
  if (value instanceof Date) return formatDate(value);
  return String(value || '').slice(0, 10);
}

function ensureSheet(name, headers, rows) {
  const spreadsheet = getOperationsSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() > 0) return sheet;
  sheet.appendRow(headers);
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureSheetColumns(sheet, headers) {
  const current = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  headers.forEach(function(header) {
    if (current.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      current.push(header);
    }
  });
}

function getOperationsSpreadsheet() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const properties = PropertiesService.getScriptProperties();
  const storedId = properties.getProperty(SPREADSHEET_ID_PROPERTY);
  if (storedId) {
    try {
      return SpreadsheetApp.openById(storedId);
    } catch (error) {
      properties.deleteProperty(SPREADSHEET_ID_PROPERTY);
    }
  }
  const spreadsheet = SpreadsheetApp.create('Betriebsleiter Dashboard Daten');
  properties.setProperty(SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  return spreadsheet;
}

function getSalesSheet() {
  const spreadsheet = getOperationsSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SALES_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SALES_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Eingang','Datum','Verkäufer','Kontakte','Leads','Angebote','Probefahrten','Verkäufe','Quelle','Meldungs-ID']);
    sheet.setFrozenRows(1);
  } else {
    ensureSheetColumns(sheet, ['Eingang','Datum','Verkäufer','Kontakte','Leads','Angebote','Probefahrten','Verkäufe','Quelle','Meldungs-ID']);
  }
  return sheet;
}

function getEmployeesSheet() {
  const spreadsheet = getOperationsSpreadsheet();
  let sheet = spreadsheet.getSheetByName(EMPLOYEES_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(EMPLOYEES_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id','name','area','role','monthlyContactTarget','monthlySalesTarget','firstName','lastName','function']);
    sheet.getRange(2, 1, 3, 9).setValues([
      ['kaan-coban', 'Kaan Coban', 'Verkauf', 'Verkäufer', 250, 20, 'Kaan', 'Coban', 'Verkäufer'],
      ['ailton-muja', 'Ailton Muja', 'Verkauf', 'Verkäufer', 250, 15, 'Ailton', 'Muja', 'Verkäufer'],
      ['shvan-ahmad', 'Shvan Ahmad', 'Verkauf', 'Verkäufer', 250, 12, 'Shvan', 'Ahmad', 'Verkäufer'],
    ]);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() < 9) {
    sheet.getRange(1, 7, 1, 3).setValues([['firstName','lastName','function']]);
  }
  return sheet;
}

function getTargetsSheet() {
  const spreadsheet = getOperationsSpreadsheet();
  let sheet = spreadsheet.getSheetByName(TARGETS_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(TARGETS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Monat','Verkäufer','Kontaktziel','Verkaufsziel']);
    const sellers = [
      ['Kaan Coban', 250, 20],
      ['Ailton Muja', 250, 15],
      ['Shvan Ahmad', 250, 12],
    ];
    const rows = [];
    for (let month = 1; month <= 12; month += 1) {
      sellers.forEach(function(seller) {
        rows.push([new Date(2026, month - 1, 1), seller[0], seller[1], seller[2]]);
      });
    }
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
    sheet.setFrozenRows(1);
  } else {
    ensureSheetColumns(sheet, ['Monat','Verkäufer','Kontaktziel','Verkaufsziel']);
  }
  return sheet;
}

function syncCalendarBlocks(dateKey, blocks, note) {
  const calendar = CalendarApp.getDefaultCalendar();
  blocks.forEach(function(block) {
    const marker = APP_MARKER + ':calendar-routine:' + block.id;
    const times = splitTimeRange(block.time);
    const start = new Date(dateKey + 'T' + times.start + ':00');
    const end = new Date(dateKey + 'T' + times.end + ':00');
    const title = block.done ? '✓ ' + block.title : block.title;
    const description = [
      marker,
      'Fällig: ' + dateKey,
      block.meta || '',
      block.done ? 'Status: erledigt' : 'Status: offen',
      note ? 'Notiz: ' + note : '',
    ].filter(Boolean).join('\n');
    const event = getManagedEvent(marker);
    if (event) {
      event.setTitle(title);
      event.setTime(start, end);
      event.setDescription(description);
    } else {
      calendar.createEvent(title, start, end, { description: description });
    }
  });
}

function cleanupDailyPlan(dateKey, tasklist) {
  getDailyManagedEvents(dateKey).forEach(function(event) {
    event.deleteEvent();
  });
  const tasks = getManagedTasks(tasklist);
  Object.keys(tasks).forEach(function(marker) {
    if (marker.indexOf(APP_MARKER + ':task:' + dateKey + ':') === 0 || marker.indexOf(APP_MARKER + ':task-block:' + dateKey + ':') === 0) {
      Tasks.Tasks.remove(tasklist, tasks[marker].id);
    }
  });
}

function cleanupComplexTaskNoise(dateKey, tasklist) {
  const tasks = getManagedTasks(tasklist);
  Object.keys(tasks).forEach(function(marker) {
    const isDailyChecklist =
      marker.indexOf(APP_MARKER + ':task:' + dateKey + ':') === 0 ||
      marker.indexOf(APP_MARKER + ':task-block:' + dateKey + ':') === 0;
    const isOldPeriodSubtask = marker.indexOf(APP_MARKER + ':task-period-item:') === 0;
    const markerParts = marker.split(':');
    const isOldDateBasedPeriod =
      marker.indexOf(APP_MARKER + ':task-period:') === 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(markerParts[2] || '');
    if (isDailyChecklist || isOldPeriodSubtask || isOldDateBasedPeriod) Tasks.Tasks.remove(tasklist, tasks[marker].id);
  });
}

function upsertTask(tasklist, task, values) {
  if (task) {
    task.title = values.title;
    task.notes = values.notes;
    if (values.due) task.due = values.due;
    else delete task.due;
    task.status = values.done ? 'completed' : 'needsAction';
    if (values.done) task.completed = task.completed || new Date().toISOString();
    else delete task.completed;
    return Tasks.Tasks.update(task, tasklist, task.id);
  }
  const newTask = {
    title: values.title,
    notes: values.notes,
    status: values.done ? 'completed' : 'needsAction',
  };
  if (values.due) newTask.due = values.due;
  if (values.done) newTask.completed = new Date().toISOString();
  const options = values.parent ? { parent: values.parent } : {};
  return Tasks.Tasks.insert(newTask, tasklist, options);
}

function getCalendarEvents(dateKey) {
  const start = new Date(dateKey + 'T00:00:00');
  const end = new Date(dateKey + 'T23:59:59');
  return CalendarApp.getDefaultCalendar().getEvents(start, end).map(function(event) {
    const description = event.getDescription() || '';
    const isQuickCalendar = description.indexOf(APP_MARKER + ':quick-calendar') !== -1;
    const isManagedRoutine =
      description.indexOf(APP_MARKER + ':calendar-routine:') !== -1 ||
      description.indexOf(APP_MARKER + ':calendar-block:') !== -1 ||
      description.indexOf(APP_MARKER + ':calendar-period-routine:') !== -1 ||
      description.indexOf(APP_MARKER + ':calendar-period:') !== -1 ||
      (!isQuickCalendar && description.indexOf(APP_MARKER + ':calendar:') !== -1);
    return {
      id: event.getId(),
      title: event.getTitle(),
      time: Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'HH:mm'),
      endTime: Utilities.formatDate(event.getEndTime(), Session.getScriptTimeZone(), 'HH:mm'),
      managed: isManagedRoutine,
      source: isQuickCalendar ? 'quick-calendar' : 'google-calendar',
    };
  });
}

function getTasks(dateKey, tasklist) {
  try {
    const response = Tasks.Tasks.list(tasklist || DEFAULT_TASKLIST, {
      showCompleted: false,
      showHidden: false,
      maxResults: 20,
    });
    return (response.items || []).map(function(task) {
      const boardMarker = firstMarker(task.notes, APP_MARKER + ':board:');
      const periodMarker = firstMarker(task.notes, APP_MARKER + ':task-period:');
      return {
        id: task.id,
        title: task.title,
        due: task.due ? task.due.slice(0, 10) : '',
        done: task.status === 'completed',
        parent: task.parent || '',
        type: boardMarker ? 'board' : periodMarker ? 'period' : 'task',
        managed: Boolean(boardMarker || periodMarker),
      };
    }).filter(function(task) {
      return task.managed || !task.due || task.due <= dateKey;
    });
  } catch (error) {
    return [{
      title: 'Google Tasks Dienst aktivieren',
      due: 'Apps Script: Dienste -> Tasks API',
    }];
  }
}

function getManagedEvents(dateKey) {
  const start = new Date(dateKey + 'T00:00:00');
  const end = new Date(dateKey + 'T23:59:59');
  const events = CalendarApp.getDefaultCalendar().getEvents(start, end);
  const map = {};
  events.forEach(function(event) {
    const marker = firstMarker(event.getDescription(), APP_MARKER + ':calendar:');
    if (marker) map[marker] = event;
  });
  return map;
}

function getDailyManagedEvents(dateKey) {
  const start = new Date(dateKey + 'T00:00:00');
  const end = new Date(dateKey + 'T23:59:59');
  return CalendarApp.getDefaultCalendar().getEvents(start, end).filter(function(event) {
    return firstMarker(event.getDescription(), APP_MARKER + ':calendar:' + dateKey + ':');
  });
}

function upsertAllDayEvent(dateKey, marker, title, description) {
  const existing = getManagedEvent(marker);
  if (existing) {
    existing.setTitle(title);
    existing.setDescription(description);
    existing.setAllDayDate(new Date(dateKey + 'T12:00:00'));
    return existing;
  }
  return CalendarApp.getDefaultCalendar().createAllDayEvent(title, new Date(dateKey + 'T12:00:00'), {
    description: description,
  });
}

function getManagedEvent(marker) {
  const start = managedWindowStart();
  const end = managedWindowEnd();
  const events = CalendarApp.getDefaultCalendar().getEvents(start, end);
  for (let index = 0; index < events.length; index += 1) {
    if (String(events[index].getDescription() || '').split('\n')[0] === marker) return events[index];
  }
  return null;
}

function cleanupLegacyCalendarNoise() {
  const events = CalendarApp.getDefaultCalendar().getEvents(managedWindowStart(), managedWindowEnd());
  events.forEach(function(event) {
    const marker = String(event.getDescription() || '').split('\n')[0] || '';
    const isOldDailyCopy = marker.indexOf(APP_MARKER + ':calendar:') === 0;
    const isOldPeriodCopy = marker.indexOf(APP_MARKER + ':calendar-period:') === 0;
    if (isOldDailyCopy || isOldPeriodCopy) event.deleteEvent();
  });
}

function cleanupObsoletePeriodicRoutines(tasklist, existingTasks, activeTaskMarkers, activeCalendarMarkers, allowCalendarWrite) {
  Object.keys(existingTasks).forEach(function(marker) {
    if (marker.indexOf(APP_MARKER + ':task-period:') === 0 && !activeTaskMarkers[marker]) {
      Tasks.Tasks.remove(tasklist, existingTasks[marker].id);
    }
  });
  if (!allowCalendarWrite) return;
  const events = CalendarApp.getDefaultCalendar().getEvents(managedWindowStart(), managedWindowEnd());
  events.forEach(function(event) {
    const marker = String(event.getDescription() || '').split('\n')[0] || '';
    if (marker.indexOf(APP_MARKER + ':calendar-period-routine:') === 0 && !activeCalendarMarkers[marker]) {
      event.deleteEvent();
    }
  });
}

function managedWindowStart() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  date.setHours(0, 0, 0, 0);
  return date;
}

function managedWindowEnd() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getManagedTasks(tasklist) {
  const response = Tasks.Tasks.list(tasklist || DEFAULT_TASKLIST, {
    showCompleted: true,
    showHidden: true,
    maxResults: 1000,
  });
  const map = {};
  (response.items || []).forEach(function(task) {
    const marker =
      firstMarker(task.notes, APP_MARKER + ':board:') ||
      firstMarker(task.notes, APP_MARKER + ':task-period-item:') ||
      firstMarker(task.notes, APP_MARKER + ':task-period:') ||
      firstMarker(task.notes, APP_MARKER + ':task-block:') ||
      firstMarker(task.notes, APP_MARKER + ':task:');
    if (marker) map[marker] = task;
  });
  return map;
}

function markerValue(notes, key) {
  const prefix = key + '=';
  const line = String(notes || '').split('\n').find(function(item) {
    return item.indexOf(prefix) === 0;
  });
  return line ? line.slice(prefix.length) : '';
}

function getManagedTaskStates(tasklist) {
  return {};
}

function firstMarker(text, prefix) {
  return String(text || '').split('\n').filter(function(line) {
    return line.indexOf(prefix) === 0;
  })[0] || '';
}

function splitTimeRange(value) {
  const parts = String(value || '09:00 - 09:30').split(' - ');
  return {
    start: parts[0] || '09:00',
    end: parts[1] || '09:30',
  };
}

function periodLabel(period) {
  const labels = {
    week: 'Wochenaufgabe',
    month: 'Monatsaufgabe',
    quarter: 'Quartalsaufgabe',
    halfyear: 'Halbjahresaufgabe',
    year: 'Jahresaufgabe',
  };
  return labels[period] || 'Aufgabe';
}

function formatMonth(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (date instanceof Date && !isNaN(date.getTime())) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value || '').slice(0, 10);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function nextBusinessDayKey(dateKey) {
  let date = new Date(dateKey + 'T12:00:00');
  while (!isBusinessDay(formatDate(date))) date.setDate(date.getDate() + 1);
  return formatDate(date);
}

function isBusinessDay(dateKey) {
  const date = new Date(dateKey + 'T12:00:00');
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return badenWuerttembergHolidays(date.getFullYear()).indexOf(formatDate(date)) === -1;
}

function badenWuerttembergHolidays(year) {
  const easter = easterSunday(year);
  return [
    year + '-01-01',
    year + '-01-06',
    formatDate(addDays(easter, -2)),
    formatDate(addDays(easter, 1)),
    year + '-05-01',
    formatDate(addDays(easter, 39)),
    formatDate(addDays(easter, 50)),
    formatDate(addDays(easter, 60)),
    year + '-10-03',
    year + '-11-01',
    year + '-12-25',
    year + '-12-26',
  ];
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
