import assert from 'node:assert/strict';
import '../src/feedback-data.js';

const data = globalThis.CoursewareFeedbackData;
let checks = 0;
function test(label, check) { check(); checks++; console.log('PASS ' + label); }
const make = (id = 'feedback-1', overrides = {}) => ({ id, createdAt: '2026-10-31T08:00:00.000Z', mastery: { life: 'confident', translation: 'practice', rotation: 'help', overlap: 'not_practiced', clock: 'confident' }, experience: 'okay', practice: ['rotation', 'translation'], ...overrides });

test('Valid feedback normalizes optional text, UTC dates and practice order without mutating its input', () => {
  const original = make('r1', { createdAt: '2026-10-31T08:00:00Z', className: ' 三年级二班 ', note: ' 第一行\r\n第二行 ' });
  const snapshot = JSON.stringify(original), result = data.validateRecord(original);
  assert(result.ok); assert.equal(result.record.className, '三年级二班'); assert.equal(result.record.studentCode, '');
  assert.equal(result.record.note, '第一行\n第二行'); assert.equal(result.record.createdAt, '2026-10-31T08:00:00.000Z');
  assert.deepEqual(result.record.practice, ['translation', 'rotation']); assert.equal(JSON.stringify(original), snapshot);
});

test('All five mastery answers are required while not-practiced remains a valid answer', () => {
  const original = make(); delete original.mastery.rotation;
  assert(!data.validateRecord(original).ok); assert(data.validateRecord(make()).ok);
  original.mastery.rotation = 'constructor'; assert(!data.validateRecord(original).ok);
  original.mastery.rotation = 'not_practiced'; assert(data.validateRecord(original).ok);
  original.mastery.extra = 'confident'; assert(!data.validateRecord(original).ok);
});

test('Validation rejects missing feelings, impossible dates, unsafe IDs, unknown targets and oversized fields', () => {
  for (const override of [{ experience: '' }, { experience: '__proto__' }, { id: '=danger' }, { id: 'x'.repeat(81) }, { createdAt: '2026-02-30T08:00:00.000Z' }, { createdAt: '2026-10-31T08:00:00+08:00' }, { className: '长'.repeat(41) }, { studentCode: 'a'.repeat(31) }, { note: '字'.repeat(301) }, { note: 'a\u0000b' }, { className: '第一行\n第二行' }, { practice: ['unknown'] }, { practice: 'life' }]) {
    const result = data.validateRecord(make('record', override)); assert(!result.ok, JSON.stringify(override)); assert(result.errors.every(error => typeof error === 'string'));
  }
  for (const invalid of [null, [], 'record', 1]) assert(!data.validateRecord(invalid).ok);
});

test('Feedback lists deduplicate matching IDs and reject conflicting content without returning partial data', () => {
  const first = make('same'), duplicate = make('same', { className: '' });
  const valid = data.validateRecords([first, duplicate]); assert(valid.ok); assert.equal(valid.records.length, 1); assert.equal(valid.duplicates, 1);
  const conflict = data.validateRecords([first, make('different'), make('same', { note: '修改过' })]);
  assert(!conflict.ok); assert.equal(conflict.records, undefined);
  assert(!data.validateRecords(Array.from({ length: 5001 }, (_, index) => make('r-' + index))).ok);
});

test('Import and export round-trip all fields and preserve learner text as inert data', () => {
  const record = make('script-text', { note: '<img src=x onerror="alert(1)">\n=SUM(1,2)', studentCode: '匿名' });
  const exported = data.exportJson([record]), parsed = data.parseImport('\uFEFF' + exported);
  assert(parsed.ok); assert.deepEqual(parsed.records, data.validateRecords([record]).records);
  assert.equal(parsed.records[0].note, record.note); assert.equal(JSON.parse(exported).format, 'motion-lab-feedback');
});

test('Import validates the entire envelope and every record before exposing accepted data', () => {
  for (const text of ['{broken', '{}', '[]', JSON.stringify({ format: 'other', version: 1, exportedAt: '2026-10-31T08:00:00.000Z', records: [] }), JSON.stringify({ format: data.FORMAT, version: 2, exportedAt: '2026-10-31T08:00:00.000Z', records: [] }), JSON.stringify({ format: data.FORMAT, version: 1, exportedAt: 'yesterday', records: [] })]) assert(!data.parseImport(text).ok);
  const bundle = JSON.parse(data.exportJson([make('okay')])); bundle.records.push(make('bad', { experience: 'invalid' }));
  const result = data.parseImport(JSON.stringify(bundle)); assert(!result.ok); assert.equal(result.records, undefined);
  assert(!data.parseImport(' '.repeat(data.MAX_IMPORT_BYTES + 1)).ok);
});

test('Merging skips identical IDs, rejects conflicting IDs atomically and never mutates either input', () => {
  const current = [make('old')], incoming = [make('old'), make('new')];
  const snapshot = JSON.stringify([current, incoming]), result = data.mergeRecords(current, incoming);
  assert(result.ok); assert.equal(result.added, 1); assert.equal(result.duplicates, 1); assert.equal(result.records.length, 2);
  assert.equal(JSON.stringify([current, incoming]), snapshot);
  const conflict = data.mergeRecords(current, [make('new'), make('old', { note: '另一份内容' })]); assert(!conflict.ok); assert.equal(conflict.records, undefined);
  assert.equal(JSON.stringify(current), JSON.stringify([make('old')]));
  assert(!data.mergeRecords(Array.from({ length: 5000 }, (_, index) => make('old-' + index)), [make('new')]).ok);
});

test('Summary counts feedback forms and excludes not-practiced answers from the assessed denominator', () => {
  const first = make('one');
  const second = make('two', { mastery: { life: 'not_practiced', translation: 'practice', rotation: 'not_practiced', overlap: 'not_practiced', clock: 'help' }, experience: 'difficult', practice: ['clock'] });
  const summary = data.summarize([first, second]);
  assert.equal(summary.total, 2); assert.equal(summary.needsHelp, 2);
  assert.deepEqual(summary.mastery.life, { confident: 1, practice: 0, help: 0, not_practiced: 1, assessed: 1 });
  assert.deepEqual(summary.mastery.overlap, { confident: 0, practice: 0, help: 0, not_practiced: 2, assessed: 0 });
  assert.deepEqual(summary.experience, { confident: 0, okay: 1, difficult: 1 }); assert.equal(summary.practice.clock, 1);
  const onlyFeelings = make('feelings', { mastery: Object.fromEntries(data.GOALS.map(goal => [goal.id, 'confident'])), experience: 'difficult' });
  assert.equal(data.summarize([onlyFeelings]).needsHelp, 0);
  assert.equal(data.summarize([]).total, 0); assert.equal(data.summarize([]).mastery.life.assessed, 0);
});

test('Filtered summary does not borrow counts from another classroom or merge matching student codes', () => {
  const records = [make('one', { className: '一班', studentCode: 'A' }), make('two', { className: '二班', studentCode: 'A' }), make('three', { className: '一班', studentCode: 'A' })];
  assert.equal(data.summarize(records.filter(record => record.className === '一班')).total, 2);
  assert.equal(data.summarize(records).total, 3);
});

test('CSV preserves Chinese text and multiline quotes, uses Beijing time and neutralizes spreadsheet formulas', () => {
  const output = data.csv([make('one', { studentCode: '=1+1', className: '@课堂', note: '第一行,"引号"\n第二行' }), make('two', { note: '  -SUM(1,2)' }), make('three', { note: '+cmd' })]);
  assert(output.startsWith('\uFEFF')); assert(output.endsWith('\r\n')); assert(output.includes('"提交时间（北京时间）"'));
  assert(output.includes('"2026-10-31 16:00:00"')); assert(output.includes('"\'=1+1"')); assert(output.includes('"\'@课堂"'));
  assert(output.includes('"第一行,""引号""\n第二行"')); assert(output.includes('"\'-SUM(1,2)"')); assert(output.includes('"\'+cmd"'));
  assert(output.includes('今天没练过'));
});

test('Exports and aggregation reject invalid records rather than quietly producing incorrect totals', () => {
  for (const method of [data.csv, data.exportJson, data.summarize]) assert.throws(() => method([make('invalid', { experience: 'wrong' })]));
});

console.log('Passed ' + checks + ' feedback data validation, aggregation, import and export checks.');
