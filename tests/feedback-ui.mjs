import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApp} from './dom-fixture.mjs';
import '../src/feedback-data.js';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const Data=globalThis.CoursewareFeedbackData;
const ids=['life','translation','rotation','overlap','clock','feedback'];
const key='motion-lab-feedback-v1';
const app=options=>createApp(repo,ids,{hash:'#feedback',...options});
let checks=0;
async function check(label,test){await test();checks++;console.log('PASS '+label);}
const saved=a=>JSON.parse(a.storage.get(key)).records;
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function makeRecord(id,overrides={}){return{id,createdAt:'2026-10-31T08:00:00.000Z',className:'A班',studentCode:'',mastery:Object.fromEntries(Data.GOALS.map(g=>[g.id,'confident'])),experience:'okay',practice:[],note:'',...overrides};}
function goals(a,values={}){for(const goal of Data.GOALS)a.click('[data-fb-goal="'+goal.id+'"][data-fb-value="'+(values[goal.id]||'confident')+'"]');}
function submit(a,options={}){
  goals(a,options.mastery);a.click('[data-fb-continue]');a.click('[data-fb-feeling="'+(options.experience||'okay')+'"]');
  if(options.className!==undefined)a.input('[data-fb-class]',options.className);
  if(options.studentCode!==undefined)a.input('[data-fb-student-code]',options.studentCode);
  if(options.note!==undefined)a.input('[data-fb-note]',options.note);
  for(const id of options.practice||[])a.click('[data-fb-practice="'+id+'"]');
  a.$('[data-fb-form]').dispatch('submit');
}
async function importText(a,text,size=new Blob([text]).size){
  const input=a.$('[data-fb-import]');input.files=[{size,async text(){return text;}}];input.dispatch('change');await settle();
}

await check('The lesson ending opens feedback without counting it as a sixth learning activity',()=>{
  const a=createApp(repo,ids,{hash:'#clock'});assert.equal(a.$('#module-nav').dataset.count,'6');assert.match(a.$('#next-module').textContent,/填写课后反馈/);
  a.click('#next-module');assert.equal(a.$('#module-host').dataset.module,'feedback');assert.match(a.$('#lesson-progress').textContent,/0 \/ 5/);assert.equal(a.$('#current-step').textContent,'课后反馈');
  assert(a.document.activeElement===a.$('#module-host'));assert(a.$('#lesson-title').scrolledIntoView);assert(a.$('#next-module').disabled);
  const single=createApp(repo,['feedback']);assert.equal(single.$('#module-host').dataset.module,'feedback');assert(single.$('#lesson-progress').hidden);assert(single.$('#footer-nav').hidden);
});

await check('Missing choices get a specific focus target; not-practiced is a valid answer',()=>{
  const a=app();a.click('[data-fb-continue]');assert.match(a.$('[data-fb-form-feedback]').textContent,/5 项/);assert.equal(a.document.activeElement.dataset.fbGoal,'life');assert(!a.storage.has(key));
  goals(a,Object.fromEntries(Data.GOALS.map(g=>[g.id,'not_practiced'])));a.click('[data-fb-continue]');assert.equal(a.$('[data-fb-step="2"]').hidden,false);
  a.$('[data-fb-form]').dispatch('submit');assert.match(a.$('[data-fb-form-feedback]').textContent,/学习感受/);assert(a.document.activeElement.hasAttribute('data-fb-feeling'));assert(!a.storage.has(key));
  a.click('[data-fb-feeling="difficult"]');a.$('[data-fb-form]').dispatch('submit');assert.equal(saved(a).length,1);assert.equal(Data.summarize(saved(a)).mastery.life.assessed,0);
});

await check('A valid response persists once, hands off without exposing its text, and resets the next student',()=>{
  const a=app();submit(a,{className:'三（2）班',studentCode:'07',note:'我想多练逆时针。',mastery:{rotation:'help'},practice:['rotation']});
  assert.equal(saved(a).length,1);assert.equal(saved(a)[0].note,'我想多练逆时针。');assert(!a.$('[data-fb-thanks]').hidden);assert(a.$('[data-fb-form]').hidden);
  assert(!a.$('[data-fb-thanks]').textContent.includes('我想多练逆时针'));a.$('[data-fb-form]').dispatch('submit');assert.equal(saved(a).length,1);
  a.click('[data-fb-next-student]');assert.equal(a.$('[data-fb-class]').value,'三（2）班');assert.equal(a.$('[data-fb-student-code]').value,'');assert.equal(a.$('[data-fb-note]').value,'');
  assert.equal(a.$('[data-fb-goal="rotation"][data-fb-value="help"]').getAttribute('aria-pressed'),'false');assert.equal(a.$('[data-fb-practice="rotation"]').getAttribute('aria-pressed'),'false');
  submit(a);assert.equal(saved(a).length,2);assert.notEqual(saved(a)[0].id,saved(a)[1].id);assert.equal(saved(a)[1].className,'三（2）班');
  const b=app({storage:[...a.storage]});b.click('[data-fb-view="teacher"]');assert.equal(b.$('[data-fb-total]').textContent,'2');
});

await check('Going back or switching modules preserves only the current draft and its choices',()=>{
  const a=app();goals(a,{overlap:'practice'});a.click('[data-fb-continue]');a.click('[data-fb-feeling="confident"]');a.input('[data-fb-note]','先保留我的想法');a.click('[data-fb-practice="overlap"]');
  a.click('[data-fb-back]');assert.equal(a.$('[data-fb-goal="overlap"][data-fb-value="practice"]').getAttribute('aria-pressed'),'true');a.click('[data-fb-continue]');
  const pane=a.$('#module-host').firstElementChild;a.select('rotation');a.select('feedback');assert(a.$('#module-host').firstElementChild===pane);assert.equal(a.$('[data-fb-note]').value,'先保留我的想法');
  assert.equal(a.$('[data-fb-feeling="confident"]').getAttribute('aria-pressed'),'true');assert(!a.storage.has(key));
});

await check('Teacher filtering, CSV/JSON export and escaped student text use the same selected responses',async()=>{
  const a=app();submit(a,{className:'A班',studentCode:'=1+1',note:'<img src=x onerror=alert(1)>',mastery:{clock:'help',life:'not_practiced'},practice:['clock']});
  a.click('[data-fb-next-student]');submit(a,{className:'B班',note:'还想练平移'});a.click('[data-fb-view="teacher"]');assert.equal(a.$('[data-fb-total]').textContent,'2');assert.equal(a.$('[data-fb-help-total]').textContent,'1');
  assert.equal(a.$('[data-fb-records]').querySelector('img'),null);assert(a.$('[data-fb-records]').textContent.includes('<img src=x onerror=alert(1)>'));
  const option=a.$('[data-fb-filter]').querySelectorAll('option').find(x=>x.textContent==='A班');a.$('[data-fb-filter]').value=option.getAttribute('value');a.$('[data-fb-filter]').dispatch('change');assert.equal(a.$('[data-fb-total]').textContent,'1');
  assert.match(a.$('[data-fb-mastery-summary]').textContent,/有效自评/);a.click('[data-fb-export-json]');const exported=Data.parseImport(await a.downloads.at(-1).blob.text());assert(exported.ok);assert.equal(exported.records.length,1);assert.equal(exported.records[0].className,'A班');
  a.click('[data-fb-export-csv]');const csv=await a.downloads.at(-1).blob.text();assert(csv.includes("\"'=1+1\""));assert(csv.includes('A班'));assert(!csv.includes('B班'));
});

await check('Import keeps identical answers under different IDs but deduplicates repeated IDs accurately',async()=>{
  const a=app();a.click('[data-fb-view="teacher"]');const record=makeRecord('import-one');const envelope=JSON.parse(Data.exportJson([record]));envelope.records.push(record);
  await importText(a,JSON.stringify(envelope));assert.equal(saved(a).length,1);assert.match(a.$('[data-fb-teacher-feedback]').textContent,/跳过 1 份/);
  await importText(a,JSON.stringify(envelope));assert.equal(saved(a).length,1);assert.match(a.$('[data-fb-teacher-feedback]').textContent,/跳过 2 份/);
  await importText(a,Data.exportJson([makeRecord('import-two')]));assert.equal(saved(a).length,2);assert.equal(a.$('[data-fb-total]').textContent,'2');
});

await check('A conflicting or malformed import changes neither stored nor visible responses',async()=>{
  const original=makeRecord('existing');const a=app({storage:[[key,Data.exportJson([original])]]});a.click('[data-fb-view="teacher"]');const before=a.storage.get(key);
  await importText(a,Data.exportJson([makeRecord('new-but-rejected'),{...original,note:'编号冲突'}]));assert.equal(a.storage.get(key),before);assert.equal(a.$('[data-fb-total]').textContent,'1');assert.match(a.$('[data-fb-teacher-feedback]').textContent,/没有导入/);
  await importText(a,'{not json}');assert.equal(a.storage.get(key),before);
  let read=false;const input=a.$('[data-fb-import]');input.files=[{size:Data.MAX_IMPORT_BYTES+1,async text(){read=true;return ''}}];input.dispatch('change');await settle();assert.equal(read,false);assert.equal(a.storage.get(key),before);assert.match(a.$('[data-fb-teacher-feedback]').textContent,/5 MiB/);
});

await check('Denied writes retain the response and retry the same record instead of claiming success',()=>{
  const a=app({storageWriteDenied:true});submit(a,{note:'需要再讲一讲'});assert(a.$('[data-fb-thanks]').hidden);assert(!a.$('[data-fb-pending]').hidden);assert.match(a.$('[data-fb-pending-message]').textContent,/尚未|暂存/);assert(!a.storage.has(key));
  a.$('[data-fb-form]').dispatch('submit');a.click('[data-fb-retry]');assert(!a.storage.has(key));a.storageOptions.storageWriteDenied=false;a.click('[data-fb-retry]');
  assert.equal(saved(a).length,1);assert.equal(saved(a)[0].note,'需要再讲一讲');assert(!a.$('[data-fb-thanks]').hidden);a.click('[data-fb-retry]');assert.equal(saved(a).length,1);
});

await check('A browser with no storage can download the pending record before handing off',async()=>{
  const a=app({storageDenied:true});submit(a,{className:'同一课堂',note:'这份要交给老师'});a.click('[data-fb-download-one]');const file=Data.parseImport(await a.downloads.at(-1).blob.text());assert(file.ok);assert.equal(file.records.length,1);assert.equal(file.records[0].note,'这份要交给老师');
  assert(!a.$('[data-fb-file-handoff]').hidden);a.click('[data-fb-handoff-file]');assert.equal(a.$('[data-fb-note]').value,'');assert.equal(a.$('[data-fb-class]').value,'同一课堂');
  a.click('[data-fb-view="teacher"]');assert.equal(a.$('[data-fb-total]').textContent,'1');assert(!a.$('[data-fb-storage]').hidden);assert.match(a.$('[data-fb-storage-text]').textContent,/当前页面|暂存/);
});

await check('Corrupt preexisting storage remains untouched and can be downloaded verbatim',async()=>{
  const raw='{"broken":';const a=app({storage:[[key,raw]]});submit(a,{note:'保留新反馈'});assert.equal(a.storage.get(key),raw);assert(!a.$('[data-fb-pending]').hidden);
  a.click('[data-fb-view="teacher"]');assert(!a.$('[data-fb-original]').hidden);a.click('[data-fb-original]');assert.equal(await a.downloads.at(-1).blob.text(),raw);
  await importText(a,Data.exportJson([makeRecord('another-device')]));assert.equal(a.storage.get(key),raw);assert.equal(a.$('[data-fb-total]').textContent,'2');assert.match(a.$('[data-fb-teacher-feedback]').textContent,/尚未保存/);
});

await check('Saving a pending student response through teacher import settles it exactly once',async()=>{
  const a=app({storageWriteDenied:true});submit(a,{note:'待保存的回答'});a.storageOptions.storageWriteDenied=false;a.click('[data-fb-view="teacher"]');await importText(a,Data.exportJson([makeRecord('teacher-import')]));
  assert.equal(saved(a).length,2);a.click('[data-fb-view="student"]');assert(!a.$('[data-fb-thanks]').hidden);assert(a.$('[data-fb-form]').hidden);
  a.click('[data-fb-edit]');a.$('[data-fb-form]').dispatch('submit');assert.equal(saved(a).length,2);
});

await check('An asynchronous import cannot refill records after an intervening clear',async()=>{
  const a=app({storage:[[key,Data.exportJson([makeRecord('before-import')])]]});a.click('[data-fb-view="teacher"]');a.click('[data-fb-clear-ask]');
  let resolve;const input=a.$('[data-fb-import]');input.files=[{size:500,text(){return new Promise(r=>resolve=r)}}];input.dispatch('change');assert(input.disabled);
  a.click('[data-fb-clear-confirm-button]');assert.equal(saved(a).length,1);resolve(Data.exportJson([makeRecord('after-import')]));await settle();assert.equal(saved(a).length,2);assert.equal(input.disabled,false);
});

await check('A destroyed feedback page ignores a late file read',async()=>{
  const a=app();a.click('[data-fb-view="teacher"]');let resolve;const input=a.$('[data-fb-import]');input.files=[{size:500,text(){return new Promise(r=>resolve=r)}}];input.dispatch('change');a.window.dispatch('pagehide',{persisted:false});
  resolve(Data.exportJson([makeRecord('too-late')]));await settle();assert(!a.storage.has(key));
});

await check('Clear requires explicit confirmation, cancel keeps data, and denied deletion does not lie',()=>{
  const a=app({storage:[[key,Data.exportJson([makeRecord('keep-me')])]]});a.click('[data-fb-view="teacher"]');a.click('[data-fb-clear-ask]');assert.equal(saved(a).length,1);a.click('[data-fb-clear-cancel]');assert.equal(saved(a).length,1);
  a.click('[data-fb-clear-ask]');a.storageOptions.storageWriteDenied=true;a.click('[data-fb-clear-confirm-button]');assert.equal(saved(a).length,1);assert.match(a.$('[data-fb-teacher-feedback]').textContent,/尚未删除|无法清空/);
  a.storageOptions.storageWriteDenied=false;a.click('[data-fb-clear-confirm-button]');assert.equal(saved(a).length,0);assert.equal(a.$('[data-fb-total]').textContent,'0');assert(a.$('[data-fb-export-json]').disabled);
});

await check('Download failures keep the pending response and do not unlock the handoff',()=>{
  const a=app({storageWriteDenied:true});submit(a);a.context.URL.createObjectURL=()=>{throw new Error('Blocked download')};a.click('[data-fb-download-one]');
  assert(a.$('[data-fb-file-handoff]').hidden);assert(!a.$('[data-fb-pending]').hidden);assert.match(a.$('[data-fb-form-feedback]').textContent,/不能下载/);assert.equal(a.downloads.length,0);
});

console.log('Passed '+checks+' feedback DOM/event collection checks. These simulations do not verify browser layout, real downloads or physical whiteboard input.');
