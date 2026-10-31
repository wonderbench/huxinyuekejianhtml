import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputs=['index.html','feedback.html',...(await readdir(path.join(root,'modules'))).filter(x=>x.endsWith('.html')).map(x=>'modules/'+x)];
assert.equal(outputs.length,7,'Provide a combined page, feedback page and five independent activities.');
const expectedIds=['life','translation','rotation','overlap','clock','feedback'];
for(const file of outputs){
  const html=await readFile(path.join(root,file),'utf8');
  assert.match(html,/<!doctype html>/i);
  assert.match(html,/<html lang="zh-CN">/);
  assert.match(html,/name="viewport"/);
  assert(!/\b(?:src|href)\s*=\s*["'](?:https?:|\/\/|\.\.?\/)/i.test(html),file+' loads an external resource.');
  assert(!/<(?:script|link)\b[^>]*(?:src|href)\s*=/i.test(html),file+' must inline JavaScript and CSS.');
  assert(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(html),file+' should not need a network connection.');
  assert(!html.includes('/*__STYLES__*/')&&!html.includes('/*__SCRIPTS__*/'));
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length,1,'One inline script is expected in '+file);
  new vm.Script(scripts[0][1],{filename:file});
  const registrations=[];
  const sandbox={Courseware:{register(module){registrations.push(module);}}};
  for(const id of expectedIds){
    const code=await readFile(path.join(root,'src/modules',id+'.js'),'utf8');
    new vm.Script(code,{filename:id+'.js'}).runInNewContext(sandbox);
  }
  assert.deepEqual(registrations.map(m=>m.id),expectedIds);
  for(const m of registrations){assert.equal(typeof m.mount,'function');assert(m.title&&m.subtitle);}
  const count=(scripts[0][1].match(/Courseware\.register\(/g)||[]).length;
  assert.equal(count,file==='index.html'?6:1,file+' contains the wrong number of modules.');
  if(file==='index.html'||file==='feedback.html')assert(html.includes('CoursewareFeedbackData'),file+' must embed the feedback data model.');
  console.log('PASS '+file+' — syntax, module registration, embedded assets, offline independence');
}
const core=await readFile(path.join(root,'src/core.js'),'utf8');
new vm.Script(core,{filename:'core.js'});
console.log('PASS shared lifecycle syntax');
console.log('Static checks passed. These checks do not replace real-browser visual/touch QA.');
