/* Pure validation, aggregation and export helpers for the classroom feedback page. */
(function (scope) {
  'use strict';

  const VERSION = 1;
  const FORMAT = 'motion-lab-feedback';
  const MAX_RECORDS = 5000;
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const GOALS = Object.freeze([
    Object.freeze({ id: 'life', label: '生活中的平移与旋转' }),
    Object.freeze({ id: 'translation', label: '平移方向与路线' }),
    Object.freeze({ id: 'rotation', label: '顺时针与逆时针' }),
    Object.freeze({ id: 'overlap', label: '平移与图案重合' }),
    Object.freeze({ id: 'clock', label: '分针走过的时间' })
  ]);
  const MASTERY_LABELS = Object.freeze({ confident: '我会了', practice: '再练练', help: '请帮我', not_practiced: '今天没练过' });
  const EXPERIENCE_LABELS = Object.freeze({ confident: '有信心', okay: '还在练', difficult: '有点难' });
  const GOAL_IDS = GOALS.map(goal => goal.id);
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const errorResult = errors => ({ ok: false, errors });

  function byteLength(text) {
    let count = 0;
    for (const symbol of text) {
      const code = symbol.codePointAt(0);
      count += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    }
    return count;
  }

  function normalizeDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return null;
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return null;
    const normalized = new Date(timestamp).toISOString();
    // Date.parse can normalize impossible calendar dates, such as February 30.
    const expected = value.length === 20 ? value.slice(0, -1) + '.000Z' : value;
    return normalized === expected ? normalized : null;
  }

  function optionalText(value, label, limit, multiline, errors) {
    if (value === undefined) return '';
    if (typeof value !== 'string') { errors.push(label + '必须是文字。'); return ''; }
    const text = value.replace(/\r\n?/g, '\n').trim();
    if (text.length > limit) errors.push(label + '最多填写' + limit + '个字符。');
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text) || (!multiline && /[\n\t]/.test(text))) errors.push(label + '含有不支持的控制字符。');
    return text;
  }

  function validateRecord(value) {
    if (!isObject(value)) return errorResult(['每份反馈必须是一个有效的记录对象。']);
    const errors = [];
    const id = value.id;
    if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(id)) errors.push('反馈编号必须是1至80位字母、数字或 . _ : -。');
    const createdAt = normalizeDate(value.createdAt);
    if (!createdAt) errors.push('提交时间必须是有效的UTC ISO时间，例如2026-10-31T08:00:00.000Z。');
    const className = optionalText(value.className, '课堂名称', 40, false, errors);
    const studentCode = optionalText(value.studentCode, '学生代号', 30, false, errors);
    const note = optionalText(value.note, '想对老师说的话', 300, true, errors);
    const mastery = {};
    if (!isObject(value.mastery)) errors.push('请为五个学习目标各选一项；没有练过的目标可选“今天没练过”。');
    else {
      for (const goal of GOALS) {
        const answer = value.mastery[goal.id];
        if (typeof answer !== 'string' || !owns(MASTERY_LABELS, answer)) errors.push('请为“' + goal.label + '”选择有效的掌握情况。');
        else mastery[goal.id] = answer;
      }
      if (Object.keys(value.mastery).some(key => !GOAL_IDS.includes(key))) errors.push('掌握情况中含有不属于本课的学习目标。');
    }
    const experience = value.experience;
    if (typeof experience !== 'string' || !owns(EXPERIENCE_LABELS, experience)) errors.push('请选择本节课的学习感受。');
    let practice = [];
    if (value.practice !== undefined) {
      if (!Array.isArray(value.practice) || value.practice.length > GOALS.length || value.practice.some(id => typeof id !== 'string' || !GOAL_IDS.includes(id))) errors.push('想再练的内容只能从本课的五个学习目标中选择。');
      else practice = GOAL_IDS.filter(id => value.practice.includes(id));
    }
    if (errors.length) return errorResult(errors);
    return { ok: true, record: { id, createdAt, className, studentCode, mastery, experience, practice, note }, errors: [] };
  }

  function validateRecords(values) {
    if (!Array.isArray(values)) return errorResult(['反馈列表必须是数组。']);
    if (values.length > MAX_RECORDS) return errorResult(['一次最多处理' + MAX_RECORDS + '份反馈，请分批整理。']);
    const errors = [], records = [], found = new Map();
    let duplicates = 0;
    values.forEach((value, index) => {
      const result = validateRecord(value);
      if (!result.ok) {
        for (const error of result.errors) if (errors.length < 50) errors.push('第' + (index + 1) + '份反馈：' + error);
        return;
      }
      const serialized = JSON.stringify(result.record);
      if (found.has(result.record.id)) {
        if (found.get(result.record.id) === serialized) duplicates++;
        else if (errors.length < 50) errors.push('第' + (index + 1) + '份反馈的编号与已有记录相同，但内容不同；请核对来源后再导入。');
      } else {
        found.set(result.record.id, serialized);
        records.push(result.record);
      }
    });
    if (errors.length) return errorResult(errors);
    return { ok: true, records, duplicates, errors: [] };
  }

  function parseImport(text) {
    if (typeof text !== 'string') return errorResult(['请选择有效的JSON反馈文件。']);
    if (byteLength(text) > MAX_IMPORT_BYTES) return errorResult(['反馈文件超过5MiB，请按课堂分批导入。']);
    let data;
    try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch (_) { return errorResult(['文件不是有效的JSON，原有反馈未被修改。']); }
    if (!isObject(data) || data.format !== FORMAT || data.version !== VERSION) return errorResult(['文件不是本课件支持的反馈备份（motion-lab-feedback，版本1）。']);
    if (!normalizeDate(data.exportedAt)) return errorResult(['反馈备份的导出时间无效。']);
    return validateRecords(data.records);
  }

  function mergeRecords(existing, incoming) {
    const current = validateRecords(existing);
    if (!current.ok) return errorResult(current.errors.map(error => '本机记录：' + error));
    const next = validateRecords(incoming);
    if (!next.ok) return errorResult(next.errors);
    const records = current.records.slice();
    const found = new Map(records.map(record => [record.id, JSON.stringify(record)]));
    let added = 0, duplicates = next.duplicates;
    for (const record of next.records) {
      if (found.has(record.id)) {
        if (found.get(record.id) !== JSON.stringify(record)) return errorResult(['反馈编号“' + record.id + '”已存在，但内容不同；本次导入未合并任何记录。']);
        duplicates++;
      } else {
        if (records.length >= MAX_RECORDS) return errorResult(['合并后将超过' + MAX_RECORDS + '份反馈；本次导入未合并任何记录。']);
        records.push(record);
        found.set(record.id, JSON.stringify(record));
        added++;
      }
    }
    return { ok: true, records, added, duplicates, errors: [] };
  }

  function checkedRecords(records) {
    const result = validateRecords(records);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    return result.records;
  }

  function summarize(values) {
    const records = checkedRecords(values);
    const summary = { total: records.length, needsHelp: 0, mastery: {}, experience: { confident: 0, okay: 0, difficult: 0 }, practice: {} };
    for (const goal of GOALS) {
      summary.mastery[goal.id] = { confident: 0, practice: 0, help: 0, not_practiced: 0, assessed: 0 };
      summary.practice[goal.id] = 0;
    }
    for (const record of records) {
      if (GOALS.some(goal => record.mastery[goal.id] === 'help')) summary.needsHelp++;
      summary.experience[record.experience]++;
      for (const goal of GOALS) {
        const answer = record.mastery[goal.id];
        summary.mastery[goal.id][answer]++;
        if (answer !== 'not_practiced') summary.mastery[goal.id].assessed++;
        if (record.practice.includes(goal.id)) summary.practice[goal.id]++;
      }
    }
    return summary;
  }

  function spreadsheetCell(value) {
    let text = String(value);
    // Quoting alone does not prevent spreadsheet programs from executing formulas.
    if (/^[\s\uFEFF]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function beijingTime(iso) {
    const value = new Date(Date.parse(iso) + 8 * 60 * 60 * 1000);
    const pad = number => String(number).padStart(2, '0');
    return String(value.getUTCFullYear()).padStart(4, '0') + '-' + pad(value.getUTCMonth() + 1) + '-' + pad(value.getUTCDate()) + ' ' + pad(value.getUTCHours()) + ':' + pad(value.getUTCMinutes()) + ':' + pad(value.getUTCSeconds());
  }

  function csv(values) {
    const records = checkedRecords(values);
    const headers = ['反馈编号', '提交时间（北京时间）', '课堂名称', '学生代号', ...GOALS.map(goal => goal.label), '学习感受', '想再练的内容', '想对老师说的话'];
    const rows = records.map(record => [record.id, beijingTime(record.createdAt), record.className, record.studentCode, ...GOALS.map(goal => MASTERY_LABELS[record.mastery[goal.id]]), EXPERIENCE_LABELS[record.experience], GOALS.filter(goal => record.practice.includes(goal.id)).map(goal => goal.label).join('；'), record.note]);
    return '\uFEFF' + [headers, ...rows].map(row => row.map(spreadsheetCell).join(',')).join('\r\n') + '\r\n';
  }

  function exportJson(values) {
    const records = checkedRecords(values);
    const text = JSON.stringify({ format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), records }, null, 2);
    if (byteLength(text) > MAX_IMPORT_BYTES) throw new Error('反馈备份超过5MiB，请按课堂筛选后分批导出。');
    return text;
  }

  scope.CoursewareFeedbackData = Object.freeze({ VERSION, FORMAT, MAX_RECORDS, MAX_IMPORT_BYTES, GOALS, MASTERY_LABELS, EXPERIENCE_LABELS, validateRecord, validateRecords, parseImport, mergeRecords, summarize, csv, exportJson });
})(typeof window === 'object' ? window : globalThis);
