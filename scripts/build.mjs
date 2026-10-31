import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=[['life','01-life.html'],['translation','02-translation.html'],['rotation','03-rotation.html'],['overlap','04-overlap.html'],['clock','05-clock.html']];
const [shell,styles,core,feedbackData,feedbackPage,...modules]=await Promise.all([readFile(path.join(root,'src/shell.html'),'utf8'),readFile(path.join(root,'src/styles.css'),'utf8'),readFile(path.join(root,'src/core.js'),'utf8'),readFile(path.join(root,'src/feedback-data.js'),'utf8'),readFile(path.join(root,'src/modules/feedback.js'),'utf8'),...files.map(([name])=>readFile(path.join(root,'src/modules',name+'.js'),'utf8'))]);
function html(scripts){return shell.replace('/*__STYLES__*/',()=>styles).replace('/*__SCRIPTS__*/',()=>[core,...scripts,'Courseware.boot();'].join('\n').replace(/<\/script/gi,'<\\/script'));}
await mkdir(path.join(root,'modules'),{recursive:true});
await writeFile(path.join(root,'index.html'),html([feedbackData,...modules,feedbackPage]));
await writeFile(path.join(root,'feedback.html'),html([feedbackData,feedbackPage]).replace('<title>平移与旋转 · 互动实验室</title>','<title>课后学习反馈 · 平移与旋转</title>'));
for(let i=0;i<files.length;i++)await writeFile(path.join(root,'modules',files[i][1]),html([modules[i]]));
console.log('Built index.html, feedback.html and 5 self-contained module files.');
