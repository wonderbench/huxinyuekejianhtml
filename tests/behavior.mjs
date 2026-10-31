import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApp} from './dom-fixture.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=createApp(repo);
const {$}=app;let checks=0;
function ok(label,test){test();checks++;console.log('PASS '+label);}
function eq(s,a,v){assert.equal($(s).getAttribute(a),v);}
ok('Initial scene mounts and can reject the wrong category',()=>{app.click('[data-answer="rotation"]');assert.match($('[data-feedback]').textContent,/再观察/);app.click('[data-answer="translation"]');assert.match($('[data-score]').textContent,/1 \/ 6/);});
ok('Animation pause preserves the current pose',()=>{app.click('[data-play]');app.advance(480);app.click('[data-play]');const t=$('[data-motion]').getAttribute('transform');app.advance(5000);eq('[data-motion]','transform',t);app.click('[data-play]');app.advance(12000);eq('[data-motion]','transform','translate(0 -145)');});
ok('All six real-life classifications have consistent feedback',()=>{for(let i=0;i<6;i++){app.click('[data-scene="'+i+'"]');app.click('[data-answer="'+([3,4].includes(i)?'rotation':'translation')+'"]');}assert.match($('[data-score]').textContent,/6 \/ 6/);});
ok('Module switching pauses the prior animation',()=>{app.click('[data-play]');assert(app.frames.size>0);app.select('translation');assert.equal(app.frames.size,0);});
ok('Opening and closing doors move in opposite directions',()=>{for(const [mode,left,right,end]of [['open',-1,1,100],['close',1,-1,0]]){app.click('[data-door-mode="'+mode+'"]');app.click('[data-predict-side="left"][data-predict-direction="'+left+'"]');app.click('[data-predict-side="right"][data-predict-direction="'+right+'"]');app.click('[data-door-check]');app.advance(8000);assert.match($('[data-door-feedback]').textContent,/预测正确/);assert.equal($('[data-door-range]').value,String(end));}});
ok('Three book routes require explicit verification and reach the same corner',()=>{app.click('[data-tr-tab="book"]');for(const route of ['right-down','down-right','diagonal']){app.click('[data-route="'+route+'"]');assert.equal(app.frames.size,0);app.click('[data-book-play]');app.advance(15000);eq('[data-book]','transform','translate(560 310)');}assert.match($('[data-book-ledger]').textContent,/3 \/ 3/);});
ok('Book keyboard control moves only its position',()=>{app.click('[data-book-reset]');$('[data-book]').dispatch('keydown',{key:'ArrowRight'});eq('[data-book]','transform','translate(180 130)');$('[data-book]').dispatch('keydown',{key:'Home'});eq('[data-book]','transform','translate(160 130)');});
app.select('rotation');
ok('Clockwise route A→C records B and fixed center',()=>{app.click('[data-predict="B"]');app.click('.rot-play');app.advance(6000);assert.equal($('.rot-route-cw').textContent,'A → B → C');eq('.rot-pointer','transform','rotate(180 340 220)');});
ok('Counterclockwise route A→C records D instead',()=>{app.click('[data-dir="-1"]');app.click('[data-predict="D"]');app.click('.rot-play');app.advance(6000);assert.equal($('.rot-route-ccw').textContent,'A → D → C');eq('.rot-pointer','transform','rotate(-180 340 220)');assert.match($('.rot-comparison').textContent,/两种方向/);});
ok('C→B clockwise takes three quarter-turns, not the shortest arc',()=>{app.click('[data-task="1"]');app.click('[data-dir="1"]');app.click('[data-predict="D"]');app.click('.rot-play');app.advance(6000);assert.equal($('.rot-route-cw').textContent,'C → D → A → B');eq('.rot-pointer','transform','rotate(450 340 220)');});
ok('Rotation stepping pauses at the next station and can resume',()=>{app.click('[data-task="0"]');app.click('[data-predict="B"]');app.click('.rot-step');app.advance(3000);eq('.rot-pointer','transform','rotate(90 340 220)');app.click('.rot-play');app.advance(3000);eq('.rot-pointer','transform','rotate(180 340 220)');});
app.select('overlap');
ok('Overlap starts with prediction before manipulation',()=>{assert.equal($('.ov-module').dataset.phase,'predict');assert.equal($('[data-compare]').hidden,true);app.click('[data-candidate="0"]');app.click('[data-candidate="4"]');app.click('[data-begin]');assert.equal($('.ov-module').dataset.phase,'verify');});
ok('Matching copy snaps by translation; mirror remains nonmatching',()=>{app.click('[data-candidate="0"]');app.click('[data-compare]');app.advance(2000);assert.match($('[data-feedback]').textContent,/可以重合/);eq('[data-movable]','transform','translate(190 187)');app.click('[data-candidate="1"]');app.click('[data-compare]');app.advance(2000);assert.match($('[data-feedback]').textContent,/不能只靠平移重合/);assert($('[data-movable]').innerHTML.includes('scale(-1 1)'));});
ok('Both sets verify all 12 patterns without rotating copies',()=>{for(const set of ['dog','leaf']){app.click('[data-set="'+set+'"]');if($('.ov-module').dataset.phase==='predict')app.click('[data-begin]');for(let i=0;i<6;i++){app.click('[data-candidate="'+i+'"]');app.click('[data-compare]');app.advance(1000);}}assert.match($('[data-total]').textContent,/12 \/ 12/);assert.match($('[data-summary]').textContent,/①、③、⑤/);});
app.select('clock');
ok('Clock requires a valid prediction before playback',()=>{assert.equal($('.ck-play').disabled,true);$('.ck-answer-row input').value='2.5';$('.ck-form').dispatch('submit');assert.match($('.ck-feedback').textContent,/整数/);assert.equal($('.ck-play').disabled,true);});
ok('Each large clock step means five minutes',()=>{app.input('.ck-answer-row input','15');$('.ck-form').dispatch('submit');app.change('.ck-show-minutes',true);for(const minutes of [5,10,15]){app.click('.ck-step');app.advance(4000);assert.equal($('.ck-time').textContent,minutes+' 分钟');eq('.ck-hand','transform','rotate('+(minutes*6)+' 330 225)');}assert.match($('.ck-feedback').textContent,/预测正确/);});
ok('Target 10 means 50 minutes clockwise, and wrong prediction receives correction',()=>{app.click('[data-target="10"]');app.input('.ck-answer-row input','10');$('.ck-form').dispatch('submit');app.click('.ck-play');app.advance(16000);assert.equal($('.ck-time').textContent,'50 分钟');assert.match($('.ck-feedback').textContent,/一共 50 分钟/);eq('.ck-hand','transform','rotate(300 330 225)');});
ok('Switching during a clock animation cancels pending frames',()=>{app.click('.ck-play');app.advance(64);assert(app.frames.size>0);app.select('life');assert.equal(app.frames.size,0);});
ok('Every standalone module mounts without other modules',()=>{for(const id of ['life','translation','rotation','overlap','clock']){const single=createApp(repo,[id]);assert.equal(single.$('#module-host').dataset.module,id);assert.equal(single.$('#footer-nav').hidden,true);}});
const allIds=['life','translation','rotation','overlap','clock'];
const fresh=(id,options={})=>createApp(repo,allIds,{hash:'#'+id,...options});
ok('Returning to a scene reuses its DOM, prediction, exact pose and paused state',()=>{
  const a=fresh('life');a.click('[data-answer="translation"]');a.click('[data-play]');a.advance(320);
  const pane=a.$('#module-host').firstElementChild,motion=a.$('[data-motion]'),pose=motion.getAttribute('transform');
  a.select('clock');assert.equal(a.frames.size,0);a.advance(1200);a.select('life');
  assert(a.$('#module-host').firstElementChild===pane);assert(a.$('[data-motion]')===motion);
  assert.equal(motion.getAttribute('transform'),pose);assert.match(a.$('[data-score]').textContent,/1 \/ 6/);assert.equal(a.frames.size,0);
  a.click('[data-play]');a.advance(10000);assert.equal(motion.getAttribute('transform'),'translate(0 -145)');
});
ok('Book route pauses across modules and resumes its original remaining segments',()=>{
  const a=fresh('translation');a.click('[data-tr-tab="book"]');a.click('[data-route="right-down"]');a.click('[data-book-play]');a.advance(480);
  const book=a.$('[data-book]'),pose=book.getAttribute('transform');
  a.select('life');assert.equal(a.frames.size,0);a.select('translation');assert.equal(book.getAttribute('transform'),pose);assert.equal(a.frames.size,0);
  a.click('[data-book-play]');a.advance(18000);assert.equal(book.getAttribute('transform'),'translate(560 310)');assert.match(a.$('[data-book-ledger]').textContent,/1 \/ 3/);
});
ok('A paused rotation step keeps its original next-station endpoint after a speed change',()=>{
  const a=fresh('rotation');a.click('[data-predict="B"]');a.click('.rot-step');a.advance(240);const pose=a.$('.rot-pointer').getAttribute('transform');
  a.select('life');a.select('rotation');assert.equal(a.$('.rot-pointer').getAttribute('transform'),pose);assert.equal(a.frames.size,0);
  a.change('.rot-slow',true);assert.equal(a.frames.size,0);a.click('.rot-play');a.advance(10000);
  assert.equal(a.$('.rot-pointer').getAttribute('transform'),'rotate(90 340 220)');assert.equal(a.frames.size,0);
});
ok('A paused clock step retains its five-minute endpoint, prediction and progress',()=>{
  const a=fresh('clock');a.click('[data-target="10"]');a.input('.ck-answer-row input','50');a.$('.ck-form').dispatch('submit');a.change('.ck-show-minutes',true);a.click('.ck-step');a.advance(240);
  const pose=a.$('.ck-hand').getAttribute('transform');a.select('life');a.select('clock');
  assert.equal(a.$('.ck-hand').getAttribute('transform'),pose);assert.equal(a.$('.ck-answer-row input').value,'50');assert.equal(a.frames.size,0);
  a.change('.ck-slow',true);assert.equal(a.frames.size,0);a.click('.ck-play');a.advance(10000);
  assert.equal(a.$('.ck-time').textContent,'5 分钟');assert.equal(a.$('.ck-hand').getAttribute('transform'),'rotate(30 330 225)');
});
ok('Reverse dragging cannot complete a clockwise task; a second touch cannot seize the pointer',()=>{
  const a=fresh('rotation');a.click('[data-predict="B"]');const svg=a.$('.rot-svg'),handle=a.$('[data-rot-handle]');
  const p=deg=>({clientX:340+116*Math.sin(deg*Math.PI/180),clientY:220-116*Math.cos(deg*Math.PI/180)});
  handle.dispatch('pointerdown',{pointerId:10,button:2,...p(0)});assert(!svg.hasPointerCapture(10));
  handle.dispatch('pointerdown',{pointerId:11,button:0,...p(0)});assert(svg.hasPointerCapture(11));
  handle.dispatch('pointerdown',{pointerId:12,button:0,...p(0)});assert(!svg.hasPointerCapture(12));assert(svg.hasPointerCapture(11));
  for(const deg of [-90,-170,-190,-270,-350])svg.dispatch('pointermove',{pointerId:11,...p(deg)});
  assert.equal(a.$('.rot-pointer').getAttribute('transform'),'rotate(0 340 220)');assert(!a.$('.rot-route-cw').textContent.includes('A → B → C'));
  svg.dispatch('pointerup',{pointerId:11});assert(!svg.hasPointerCapture(11));
  handle.dispatch('pointerdown',{pointerId:13,button:0,...p(0)});
  for(const deg of [45,20,45])svg.dispatch('pointermove',{pointerId:13,...p(deg)});
  const angle=Number(a.$('.rot-pointer').getAttribute('transform').match(/rotate\(([-.\d]+)/)[1]);assert(Math.abs(angle-45)<.0001);
  for(const deg of [90,135,180])svg.dispatch('pointermove',{pointerId:13,...p(deg)});
  assert.equal(a.$('.rot-pointer').getAttribute('transform'),'rotate(180 340 220)');assert.equal(a.$('.rot-route-cw').textContent,'A → B → C');
});
ok('Switching away releases a live drag without moving or snapping the object',()=>{
  const a=fresh('translation');a.click('[data-tr-tab="book"]');const book=a.$('[data-book]'),svg=book.closest('svg');
  book.dispatch('pointerdown',{pointerId:3,button:0,clientX:160,clientY:130});book.dispatch('pointerdown',{pointerId:4,button:0,clientX:160,clientY:130});assert(!svg.hasPointerCapture(4));svg.dispatch('pointermove',{pointerId:3,clientX:333,clientY:222});
  const pose=book.getAttribute('transform');assert(svg.hasPointerCapture(3));a.select('clock');assert(!svg.hasPointerCapture(3));
  a.select('translation');assert.equal(book.getAttribute('transform'),pose);assert.equal(a.frames.size,0);
});
ok('Whiteboard prediction buttons edit without submitting and pause a running clock',()=>{
  const a=fresh('clock');a.click('[data-prediction-step="-5"]');assert.equal(a.$('.ck-answer-row input').value,'0');
  for(let i=0;i<3;i++)a.click('[data-prediction-step="5"]');assert.equal(a.$('.ck-answer-row input').value,'15');assert(a.$('.ck-play').disabled);
  a.$('.ck-form').dispatch('submit');a.click('.ck-play');a.advance(240);const pose=a.$('.ck-hand').getAttribute('transform');
  a.click('[data-prediction-step="5"]');assert.equal(a.$('.ck-answer-row input').value,'20');assert.equal(a.frames.size,0);assert(a.$('.ck-play').disabled);
  assert.equal(a.$('.ck-hand').getAttribute('transform'),pose);
  for(let i=0;i<20;i++)a.click('[data-prediction-step="5"]');assert.equal(a.$('.ck-answer-row input').value,'60');
  for(let i=0;i<20;i++)a.click('[data-prediction-step="-5"]');assert.equal(a.$('.ck-answer-row input').value,'0');
});
ok('Overlap keeps prediction, differences and position when returning from another activity',()=>{
  const a=fresh('overlap');a.click('[data-candidate="0"]');a.$('[data-begin]').focus();a.click('[data-begin]');
  assert(a.document.activeElement===a.$('[data-compare]'),'Focus must move to the newly visible compare button');a.click('[data-compare]');a.advance(240);
  const copy=a.$('[data-movable]'),pose=copy.getAttribute('transform');a.select('clock');assert.equal(a.frames.size,0);a.select('overlap');
  assert(a.$('[data-movable]')===copy);assert.equal(copy.getAttribute('transform'),pose);assert.equal(a.frames.size,0);
  a.click('[data-compare]');a.advance(2000);assert.match(a.$('[data-feedback]').textContent,/可以重合/);assert.match(a.$('[data-total]').textContent,/1 \/ 12/);
  a.click('[data-next]');assert.equal(a.frames.size,0);assert.match(a.$('[data-total]').textContent,/1 \/ 12/);
});
ok('Overlap changes coordinates and masks together for a narrow display and restores the target',()=>{
  const a=fresh('overlap',{width:390});assert.equal(a.$('[data-board]').getAttribute('viewBox'),'0 0 320 508');
  assert.equal(a.$('[data-mask-target]').getAttribute('width'),'320');assert.equal(a.$('[data-mask-candidate]').getAttribute('height'),'508');
  a.click('[data-candidate="0"]');a.click('[data-begin]');a.click('[data-compare]');a.advance(2000);
  assert.equal(a.$('[data-movable]').getAttribute('transform'),'translate(160 142)');a.resize(1366);
  assert.equal(a.$('[data-board]').getAttribute('viewBox'),'0 0 720 350');assert.equal(a.$('[data-movable]').getAttribute('transform'),'translate(190 187)');
  assert.equal(a.$('[data-mask-target]').getAttribute('width'),'720');assert.equal(a.$('[data-mask-candidate]').getAttribute('height'),'350');
});
ok('Navigation retains button identity, supports keyboard focus and syncs the native selector',()=>{
  const a=fresh('life'),life=a.$('button[data-module="life"]'),rotation=a.$('button[data-module="rotation"]');
  life.focus();life.dispatch('keydown',{key:'End'});assert(a.document.activeElement===a.$('button[data-module="clock"]'));assert.equal(a.$('#module-host').dataset.module,'life');
  a.$('button[data-module="clock"]').dispatch('keydown',{key:'Home'});assert(a.document.activeElement===life);
  a.select('rotation');assert.equal(a.$('#module-select').value,'rotation');assert(a.$('button[data-module="rotation"]')===rotation);
  a.$('#module-select').value='overlap';a.$('#module-select').dispatch('change');assert.equal(a.$('#module-host').dataset.module,'overlap');
  a.context.location.hash='#module-host';a.window.dispatch('hashchange');assert.equal(a.$('#module-host').dataset.module,'overlap');
});
ok('Whiteboard mode defaults on, changes without remounting and persists its preference',()=>{
  const a=fresh('life');assert.equal(a.document.documentElement.getAttribute('data-board-mode'),'whiteboard');const pane=a.$('#module-host').firstElementChild;
  a.click('#board-mode-button');assert.equal(a.document.documentElement.getAttribute('data-board-mode'),'desk');assert(a.$('#module-host').firstElementChild===pane);
  const b=fresh('clock',{storage:[...a.storage]});assert.equal(b.document.documentElement.getAttribute('data-board-mode'),'desk');assert.equal(b.$('#board-mode-button').getAttribute('aria-pressed'),'false');
});
ok('Completion markers persist; unavailable or malformed storage does not block teaching',()=>{
  const a=fresh('life',{storageDenied:true});for(let i=0;i<6;i++){a.click('[data-scene="'+i+'"]');a.click('[data-answer="'+([3,4].includes(i)?'rotation':'translation')+'"]');}
  assert.match(a.$('#lesson-progress').textContent,/1 \/ 5/);a.click('#board-mode-button');a.select('rotation');
  for(const saved of ['not-json','{"invalid":true}']){const b=fresh('clock',{storage:[['motion-lab-completed',saved]]});assert.equal(b.$('#module-host').dataset.module,'clock');}
  const c=fresh('rotation',{storage:[['motion-lab-completed','["life","clock"]']]});assert.match(c.$('#lesson-progress').textContent,/2 \/ 5/);assert.match(c.$('button[data-module="life"]').getAttribute('aria-label'),/已完成/);
});
ok('Backgrounding pauses playback; BFCache returns paused; final page exit clears every animation',()=>{
  const a=fresh('life');a.click('[data-play]');a.advance(240);const pose=a.$('[data-motion]').getAttribute('transform');
  a.document.hidden=true;a.document.dispatch('visibilitychange');assert.equal(a.frames.size,0);assert.equal(a.$('[data-motion]').getAttribute('transform'),pose);
  a.document.hidden=false;a.document.dispatch('visibilitychange');assert.equal(a.frames.size,0);
  a.click('[data-play]');a.window.dispatch('pagehide',{persisted:true});assert.equal(a.frames.size,0);
  a.click('[data-play]');assert(a.frames.size>0);a.window.dispatch('pagehide',{persisted:false});assert.equal(a.frames.size,0);
});
ok('Whiteboard rearranges overlap controls without recreating them or losing a result',()=>{
  const a=fresh('overlap');const gallery=a.$('[data-gallery-zone]'),nudge=a.$('[data-nudge]');
  assert(gallery.parentElement.classList.contains('ov-sidebar'));assert(nudge.parentElement.hasAttribute('data-actions-band'));
  a.click('[data-candidate="0"]');a.click('[data-begin]');a.click('[data-compare]');a.advance(2000);
  const pose=a.$('[data-movable]').getAttribute('transform'),result=a.$('[data-feedback]').textContent;
  a.click('#board-mode-button');assert(gallery.parentElement.hasAttribute('data-gallery-home'));assert(nudge.parentElement.hasAttribute('data-nudge-home'));
  a.click('#board-mode-button');assert(gallery.parentElement.classList.contains('ov-sidebar'));assert(a.$('[data-gallery-zone]')===gallery);
  assert.equal(a.$('[data-movable]').getAttribute('transform'),pose);assert.equal(a.$('[data-feedback]').textContent,result);assert.equal(a.frames.size,0);
  a.resize(950);assert(gallery.parentElement.hasAttribute('data-gallery-home'));a.resize(1366);assert(gallery.parentElement.classList.contains('ov-sidebar'));
});
console.log('Passed '+checks+' deterministic DOM/event behavior checks. Browser layout and real touch input remain unverified.');
