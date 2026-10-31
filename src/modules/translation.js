/* Module 02 · translation, with doors and a tabletop route laboratory. */
Courseware.register({
  id: 'translation', number: 2, title: '平移实验', subtitle: '试试不同的路线', icon: '↗',
  mount(root, kit) {
    const aid=kit.uid('tr-arrow');
    const doorDone=new Set(),routesDone=new Set();
    let destroyed=false, view='doors';
    root.innerHTML=`<style>
      .tr-tabs{display:flex;gap:10px;margin-bottom:18px}.tr-tabs button{flex:1;max-width:250px}.tr-view[hidden]{display:none}.tr-canvas{background:#f1f6ed;border:1px solid #dfe9e1;border-radius:20px;overflow:hidden}.tr-canvas svg{width:100%;height:auto;display:block;max-height:440px}.tr-canvas-head{padding:15px 18px 0;display:flex;justify-content:space-between;gap:10px;color:#557566;font-size:13px}.tr-canvas-head strong{color:#254b3f}.tr-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px}.tr-range{display:grid;grid-template-columns:auto 1fr 42px;gap:12px;align-items:center;font-size:13px;margin-top:20px;color:#5b7467}.tr-range input{width:100%;accent-color:#147d77;min-height:34px}.tr-state{color:#6b8175;font-size:12px}.tr-question{font-size:24px;line-height:1.45;margin:12px 0 10px;color:#203d3a}.tr-mode{display:flex;gap:6px;background:#edf3ed;padding:5px;border-radius:12px;margin:18px 0}.tr-mode button{flex:1;min-height:40px;border:0;background:transparent;color:#718478;font:inherit;font-size:14px;font-weight:700;border-radius:8px;cursor:pointer}.tr-mode button.active{background:#fff;color:#147d77;box-shadow:0 2px 8px #284b3210}.tr-predict{border:0;padding:0;margin:14px 0 18px;display:grid;grid-template-columns:70px 1fr 1fr;gap:8px;align-items:center}.tr-predict legend{float:left;width:70px;font-size:14px;color:#405e4f;font-weight:700}.tr-arrow-choice{min-height:46px;border-radius:11px;border:1px solid #d6e3d8;background:#fff;color:#4c705b;font:inherit;font-weight:700;cursor:pointer}.tr-arrow-choice.active{background:#e2f0e6;border-color:#147d77;color:#126a5d;box-shadow:inset 0 0 0 1px #147d77}.tr-complete{display:flex;gap:7px;flex-wrap:wrap;margin-top:18px}.tr-badge{font-size:11px;background:#eff3ec;color:#819483;padding:5px 9px;border-radius:20px}.tr-badge.done{background:#e0f0e5;color:#147d77}.tr-rule{border-top:1px solid #e3eae1;margin-top:20px;padding-top:15px;line-height:1.8;color:#647969;font-size:13px}.tr-route-list{display:grid;gap:9px;margin:18px 0}.tr-route{background:#fff;border:1px solid #d7e4d9;border-radius:13px;padding:12px 14px;min-height:60px;font:inherit;color:#355c4b;cursor:pointer;display:flex;align-items:center;justify-content:space-between;text-align:left;gap:8px}.tr-route strong{display:block;font-size:14px}.tr-route small{display:block;font-size:11px;color:#7f9586;margin-top:4px}.tr-route.active{background:#e6f2e8;border-color:#147d77}.tr-route.done .tr-route-symbol{color:#147d77}.tr-route-symbol{font-size:23px;color:#a6b5a3}.tr-corners{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.tr-corners .btn{font-size:13px;min-height:42px}.tr-path-readout{font-size:12px;color:#547261;background:#eff5eb;border-radius:10px;padding:10px 12px;margin-top:14px;min-height:38px;line-height:1.6}.tr-book{cursor:grab;touch-action:none}.tr-book:active{cursor:grabbing}.tr-book:focus-visible{outline:none}.tr-book:focus-visible rect.tr-book-cover{stroke:#ed805d;stroke-width:5}.tr-target-label{font-size:14px;font-family:inherit;fill:#79907b;font-weight:600}.tr-route-ghost{opacity:.4}.tr-view button:focus-visible{outline:3px solid #ed805d;outline-offset:3px}.tr-toggle-row{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px}.tr-ledger{font-size:12px;color:#527263;margin-top:12px;line-height:1.8;max-height:78px;overflow:auto}.tr-short-hint{font-size:12px;color:#78917c;line-height:1.65;margin:12px 0 0}
      @media(max-width:760px){.tr-question{font-size:22px}.tr-canvas-head{font-size:11px;padding:12px 12px 0}.tr-canvas svg{min-height:230px}.tr-tabs{gap:7px}.tr-tabs button{font-size:13px}.tr-range{grid-template-columns:auto 1fr 38px;gap:7px;font-size:11px}.tr-predict{grid-template-columns:64px 1fr 1fr}.tr-canvas-head span{font-size:10px}}
    </style>
    <div class="tr-tabs" role="group" aria-label="平移实验选择"><button type="button" class="btn primary" data-tr-tab="doors" aria-pressed="true">01 自动门方向</button><button type="button" class="btn secondary" data-tr-tab="book" aria-pressed="false">02 课本搬家</button></div>
    <div class="tr-view" data-tr-view="doors"><div class="module-layout">
      <section class="panel"><div class="tr-canvas"><div class="tr-canvas-head"><strong>两扇门，各往哪边走？</strong><span>观察左门与右门</span></div>
      <svg viewBox="0 0 720 405" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="自动门开关的平移示意图" data-door-svg>
      <defs><marker id="${aid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#e47e5f" stroke-width="1.8"/></marker></defs>
      <ellipse cx="360" cy="361" rx="247" ry="15" fill="#e0eadf"/><rect x="102" y="77" width="516" height="275" rx="12" fill="#d1e5d6"/><path d="M102 115H618" stroke="#a5c4ad" stroke-width="5"/><rect x="230" y="131" width="260" height="213" fill="#6b9482"/><rect x="118" y="132" width="100" height="200" rx="4" fill="#eaf3e7"/><rect x="502" y="132" width="100" height="200" rx="4" fill="#eaf3e7"/>
      <g data-door-ghost><rect x="231" y="131" width="129" height="212" fill="none" stroke="#8da993" stroke-dasharray="7 6" stroke-width="2"/><rect x="360" y="131" width="129" height="212" fill="none" stroke="#8da993" stroke-dasharray="7 6" stroke-width="2"/></g>
      <g data-door-left><rect x="231" y="131" width="129" height="212" rx="3" fill="#98cbb7" stroke="#fff" stroke-width="5"/><path d="M246 148H342L246 238Z" fill="#cce7d7"/><path d="M346 216V257" stroke="#347966" stroke-width="5" stroke-linecap="round"/><rect x="248" y="268" width="94" height="28" rx="8" fill="#eaf6e8"/><text x="295" y="287" text-anchor="middle" font-size="14" font-weight="700" fill="#3a7a62">左门</text></g>
      <g data-door-right><rect x="360" y="131" width="129" height="212" rx="3" fill="#edbe8a" stroke="#fff" stroke-width="5"/><path d="M378 148H473L378 238Z" fill="#f8dfba"/><path d="M374 216V257" stroke="#af8651" stroke-width="5" stroke-linecap="round"/><rect x="378" y="268" width="94" height="28" rx="8" fill="#fff0d8"/><text x="425" y="287" text-anchor="middle" font-size="14" font-weight="700" fill="#987144">右门</text></g>
      <g data-door-arrows style="display:none"><path data-left-arrow d="M310 374H208" stroke="#e47e5f" stroke-width="3" fill="none" marker-end="url(#${aid})"/><path data-right-arrow d="M410 374H512" stroke="#e47e5f" stroke-width="3" fill="none" marker-end="url(#${aid})"/></g></svg></div>
      <label class="tr-range">门的打开程度<input type="range" min="0" max="100" value="0" step="1" data-door-range aria-label="门的打开程度"><output data-door-percent>0%</output></label>
      <div class="tr-controls"><button type="button" class="btn primary" data-door-play>▶ 播放开门</button><button type="button" class="btn secondary" data-door-reset>↺ 重来</button><label class="toggle"><input type="checkbox" data-door-slow>慢速</label><span class="tr-state" data-door-state>门已关好</span></div>
      <div class="tr-toggle-row"><label class="toggle"><input type="checkbox" data-door-outline checked>起点虚影</label><label class="toggle"><input type="checkbox" data-door-clues>方向箭头</label></div>
      </section>
      <aside class="panel"><div class="eyebrow">先预测，再验证</div><h2 class="tr-question">开门和关门，<br>方向一样吗？</h2><p class="hint">选一个动作，再分别给两扇门选择方向。</p>
      <div class="tr-mode" role="group" aria-label="选择开门或关门"><button type="button" class="active" data-door-mode="open" aria-pressed="true">开门时</button><button type="button" data-door-mode="close" aria-pressed="false">关门时</button></div>
      <fieldset class="tr-predict"><legend>左门</legend><button type="button" class="tr-arrow-choice" data-predict-side="left" data-predict-direction="-1" aria-pressed="false">← 向左</button><button type="button" class="tr-arrow-choice" data-predict-side="left" data-predict-direction="1" aria-pressed="false">向右 →</button></fieldset>
      <fieldset class="tr-predict"><legend>右门</legend><button type="button" class="tr-arrow-choice" data-predict-side="right" data-predict-direction="-1" aria-pressed="false">← 向左</button><button type="button" class="tr-arrow-choice" data-predict-side="right" data-predict-direction="1" aria-pressed="false">向右 →</button></fieldset>
      <button type="button" class="btn primary" style="width:100%" data-door-check>验证我的预测</button><div class="feedback" role="status" aria-live="polite" data-door-feedback style="margin-top:16px">先想一想，再用手势表示两扇门的运动方向。</div>
      <div class="tr-complete"><span class="tr-badge" data-door-badge="open">○ 开门方向</span><span class="tr-badge" data-door-badge="close">○ 关门方向</span></div><div class="tr-rule">两扇门都可以看作平移。描述运动时，要说清楚观察的是哪一扇门。</div>
      </aside></div></div>
    <div class="tr-view" data-tr-view="book" hidden><div class="module-layout">
      <section class="panel"><div class="tr-canvas"><div class="tr-canvas-head"><strong>把数学课本送到右下角</strong><span>拖动 · 点击四角 · 方向键</span></div>
      <svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="课本在桌面上平移，起点左上角，目标右下角" data-book-svg>
      <rect x="57" y="38" width="606" height="372" rx="26" fill="#d9dfc4"/><rect x="67" y="38" width="586" height="354" rx="22" fill="#e7e9d1" stroke="#c4d2b5" stroke-width="3"/><path d="M89 211H631M360 60V371" stroke="#ced8bb" stroke-dasharray="4 8"/>
      <g fill="none" stroke="#becdad" stroke-width="2" stroke-dasharray="5 6"><rect x="112" y="69" width="96" height="122" rx="9"/><rect x="512" y="69" width="96" height="122" rx="9"/><rect x="112" y="249" width="96" height="122" rx="9"/><rect x="512" y="249" width="96" height="122" rx="9"/></g>
      <g class="tr-target-label" text-anchor="middle"><text x="160" y="59">左上角 · 起点</text><text x="560" y="59">右上角</text><text x="160" y="389">左下角</text><text x="560" y="389" fill="#ba7752">右下角 · 目标</text></g>
      <polyline data-book-trace points="160,130" fill="none" stroke="#e48b62" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round" stroke-linejoin="round"/>
      <g data-book-ghost transform="translate(160 130)" class="tr-route-ghost"><rect x="-44" y="-57" width="88" height="114" rx="7" fill="#c8d9c0" stroke="#548b75" stroke-width="2" stroke-dasharray="5 4"/><circle cx="-30" cy="-43" r="4" fill="#d07859"/></g>
      <g data-book transform="translate(160 130)" class="tr-book" tabindex="0" role="button" aria-label="数学课本。可以拖动，也可用方向键移动，按 Home 返回起点。"><rect x="-40" y="-52" width="88" height="114" rx="7" fill="#597f6123"/><rect x="-44" y="-57" width="88" height="114" rx="7" fill="#fbf8e8" stroke="#97b39a" stroke-width="2"/><rect class="tr-book-cover" x="-44" y="-61" width="88" height="111" rx="7" fill="#287f73"/><path d="M-34-58V47" stroke="#78ac91" stroke-width="2"/><circle cx="-28" cy="-44" r="5" fill="#f3a06e" stroke="#ffe6c9" stroke-width="1.5"/><text x="4" y="-7" text-anchor="middle" fill="#fff9df" font-size="23" font-weight="700">数学</text><path d="M-16 12H25M-16 19H15" stroke="#97c5a4" stroke-width="3" stroke-linecap="round"/><circle cx="21" cy="34" r="6" fill="#d8dd94"/></g>
      </svg></div><div class="tr-path-readout" data-book-route role="status">起点：左上角。选一条路线，或自己移动课本。</div>
      <div class="tr-controls"><button type="button" class="btn primary" data-book-play>▶ 回放路线</button><button type="button" class="btn secondary" data-book-reset>↺ 回到起点</button><label class="toggle"><input type="checkbox" data-book-slow>慢速</label></div>
      <div class="tr-toggle-row"><label class="toggle"><input type="checkbox" data-book-show-trace checked>运动轨迹</label><label class="toggle"><input type="checkbox" data-book-show-ghost checked>起点虚影</label></div>
      <p class="tr-short-hint">看封面和红色书角：移动过程中，课本的大小、形状和朝向保持不变。</p>
      </section>
      <aside class="panel"><div class="eyebrow">同一起点，不同路线</div><h2 class="tr-question">怎样把课本<br>移到右下角？</h2><p class="hint">先预测路线，再点击观察。斜向移动时也保持课本的朝向。</p>
      <div class="tr-route-list"><button type="button" class="tr-route" data-route="right-down"><span><strong>先向右，再向下</strong><small>左上 → 右上 → 右下</small></span><span class="tr-route-symbol">↳</span></button><button type="button" class="tr-route" data-route="down-right"><span><strong>先向下，再向右</strong><small>左上 → 左下 → 右下</small></span><span class="tr-route-symbol">↱</span></button><button type="button" class="tr-route" data-route="diagonal"><span><strong>沿斜方向直接移动</strong><small>左上 → 右下</small></span><span class="tr-route-symbol">↘</span></button></div>
      <div class="feedback" data-book-feedback role="status" aria-live="polite">试着比较：路线变了，课本最后到的位置变了吗？</div>
      <div class="eyebrow" style="margin-top:20px">自己选择下一站</div><div class="tr-corners"><button type="button" class="btn secondary" data-corner="tl">↖ 左上角</button><button type="button" class="btn secondary" data-corner="tr">右上角 ↗</button><button type="button" class="btn secondary" data-corner="bl">↙ 左下角</button><button type="button" class="btn secondary" data-corner="br">右下角 ↘</button></div>
      <div class="tr-ledger" data-book-ledger>已发现 0 / 3 条示范路线。</div><div class="tr-rule">先向右、再向下，是两次平移；沿斜方向直接移动，也可以是平移。</div>
      </aside></div></div>`;
    const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
    const mark=()=>{if(doorDone.size===2&&routesDone.size===3)kit.markDone();};
    let doorMode='open',door=0,doorRun=false,doorFrame=0,doorLast=0,doorSlow=false,doorStart=0,doorGoal=1,doorTime=0,doorPaused=false;
    const prediction={left:null,right:null};
    function doorDraw(){
      $('[data-door-left]').setAttribute('transform',`translate(${-108*door} 0)`);$('[data-door-right]').setAttribute('transform',`translate(${108*door} 0)`);
      $('[data-door-range]').value=String(Math.round(door*100));$('[data-door-percent]').textContent=`${Math.round(door*100)}%`;
      const ghosts=$('[data-door-ghost]').children;ghosts[0].setAttribute('transform',`translate(${doorMode==='close'?-108:0} 0)`);ghosts[1].setAttribute('transform',`translate(${doorMode==='close'?108:0} 0)`);
      $('[data-left-arrow]').setAttribute('d',doorMode==='open'?'M310 374H208':'M208 374H310');$('[data-right-arrow]').setAttribute('d',doorMode==='open'?'M410 374H512':'M512 374H410');
    }
    function doorButtons(){
      $('[data-door-play]').textContent=doorRun?'Ⅱ 暂停':doorPaused?'▶ 继续':`▶ 播放${doorMode==='open'?'开门':'关门'}`;
      $('[data-door-state]').textContent=doorRun?(doorMode==='open'?'正在打开':'正在关闭'):doorPaused?'已暂停':door===0?'门已关好':door===1?'门已打开':'可拖动滑块观察';
    }
    function stopDoor(pause=false){doorRun=false;doorPaused=pause;cancelAnimationFrame(doorFrame);doorLast=0;doorButtons();}
    function doorTick(now){if(!doorRun||destroyed)return;if(!doorLast)doorLast=now;doorTime+=Math.min(60,now-doorLast)*(doorSlow?.35:1);doorLast=now;const p=Math.min(1,doorTime/2400);door=doorStart+(doorGoal-doorStart)*p;doorDraw();if(p>=1){door=doorGoal;stopDoor();doorDraw();return;}doorFrame=requestAnimationFrame(doorTick);}
    function startDoor(force=false){
      if(doorRun&&!force){stopDoor(true);return;}
      if(force)stopDoor();
      if(!doorPaused||force){doorGoal=doorMode==='open'?1:0;if(Math.abs(door-doorGoal)<.001||force){door=doorMode==='open'?0:1;doorDraw();}doorStart=door;doorTime=0;}
      doorRun=true;doorPaused=false;doorLast=0;doorButtons();doorFrame=requestAnimationFrame(doorTick);
    }
    function setDoorMode(mode){stopDoor();doorMode=mode;door=mode==='open'?0:1;prediction.left=null;prediction.right=null;$$('[data-door-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.doorMode===mode);b.setAttribute('aria-pressed',String(b.dataset.doorMode===mode));});$$('[data-predict-side]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});kit.feedback($('[data-door-feedback]'),`请预测${mode==='open'?'开门':'关门'}时，左右两扇门各向哪里平移。`);doorDraw();doorButtons();}
    $$('[data-door-mode]').forEach(b=>kit.listen(b,'click',()=>setDoorMode(b.dataset.doorMode)));
    $$('[data-predict-side]').forEach(b=>kit.listen(b,'click',()=>{prediction[b.dataset.predictSide]=Number(b.dataset.predictDirection);$$(`[data-predict-side="${b.dataset.predictSide}"]`).forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});}));
    kit.listen($('[data-door-check]'),'click',()=>{
      if(prediction.left===null||prediction.right===null){kit.feedback($('[data-door-feedback]'),'请先为左门和右门各选一个方向。');return;}
      const correct=doorMode==='open'?prediction.left===-1&&prediction.right===1:prediction.left===1&&prediction.right===-1;
      const text=doorMode==='open'?'左门向左平移，右门向右平移。':'左门向右平移，右门向左平移。';
      kit.feedback($('[data-door-feedback]'),correct?`预测正确！${text}`:`跟着动画再看一遍：${text}`,correct?'success':'error');
      if(correct){doorDone.add(doorMode);const badge=$(`[data-door-badge="${doorMode}"]`);badge.classList.add('done');badge.textContent=`✓ ${doorMode==='open'?'开门':'关门'}方向`;mark();}startDoor(true);
    });
    kit.listen($('[data-door-play]'),'click',()=>startDoor());
    kit.listen($('[data-door-reset]'),'click',()=>{stopDoor();door=doorMode==='open'?0:1;doorDraw();doorButtons();});
    kit.listen($('[data-door-slow]'),'change',e=>doorSlow=e.target.checked);
    kit.listen($('[data-door-range]'),'input',e=>{stopDoor();door=Number(e.target.value)/100;doorDraw();doorButtons();});
    kit.listen($('[data-door-outline]'),'change',e=>$('[data-door-ghost]').style.display=e.target.checked?'':'none');
    kit.listen($('[data-door-clues]'),'change',e=>$('[data-door-arrows]').style.display=e.target.checked?'':'none');
    const corners={tl:{x:160,y:130,name:'左上角'},tr:{x:560,y:130,name:'右上角'},bl:{x:160,y:310,name:'左下角'},br:{x:560,y:310,name:'右下角'}};
    const routes={'right-down':['tl','tr','br'],'down-right':['tl','bl','br'],'diagonal':['tl','br']};
    const labels={'right-down':'先向右，再向下','down-right':'先向下，再向右','diagonal':'沿斜方向直接移动'};
    let pos={x:160,y:130},trace=[{x:160,y:130}],lastPath=[{x:160,y:130},{x:560,y:130},{x:560,y:310}],lastRoute='right-down',bookRun=false,bookPaused=false,bookFrame=0,bookLast=0,bookSlow=false,queue=[],segment=0,segmentTime=0,drag=null,pointerMoved=false;
    const svg=$('[data-book-svg]'),book=$('[data-book]');
    function bookDraw(){book.setAttribute('transform',`translate(${pos.x} ${pos.y})`);$('[data-book-trace]').setAttribute('points',trace.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));}
    function bookButtons(){$('[data-book-play]').textContent=bookRun?'Ⅱ 暂停移动':bookPaused?'▶ 继续移动':'▶ 回放路线';}
    function stopBook(pause=false){bookRun=false;bookPaused=pause;bookLast=0;cancelAnimationFrame(bookFrame);bookButtons();}
    function point(p){return{x:p.x,y:p.y};}
    function atGoal(){return Math.hypot(pos.x-560,pos.y-310)<2;}
    function routeFinished(){
      stopBook();
      if(!lastRoute&&trace.length>1)lastPath=trace.map(point);
      if(lastRoute&&routes[lastRoute]&&atGoal()){routesDone.add(lastRoute);const b=$(`[data-route="${lastRoute}"]`);b.classList.add('done');b.querySelector('.tr-route-symbol').textContent='✓';$('[data-book-ledger]').textContent=`已发现 ${routesDone.size} / 3 条示范路线。${routesDone.size===3?'三条路线都到达了右下角！':''}`;mark();}
      if(atGoal())kit.feedback($('[data-book-feedback]'),lastRoute==='diagonal'?'到了！斜向移动时，课本没有转动，也可以看作平移。':'到了右下角！观察封面和红色书角：移动过程中朝向保持不变。','success');
    }
    function bookTick(now){
      if(!bookRun||destroyed)return;if(!bookLast)bookLast=now;
      const a=queue[segment],b=queue[segment+1],dist=Math.hypot(b.x-a.x,b.y-a.y),duration=Math.max(35,dist*4.5);
      segmentTime+=Math.min(60,now-bookLast)*(bookSlow?.4:1);bookLast=now;const p=Math.min(1,segmentTime/duration);pos={x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p};
      const prior=trace[trace.length-1];if(Math.hypot(pos.x-prior.x,pos.y-prior.y)>3||p===1)trace.push(point(pos));bookDraw();
      if(p>=1){segment++;segmentTime=0;if(segment>=queue.length-1){routeFinished();return;}}
      bookFrame=requestAnimationFrame(bookTick);
    }
    function startPath(points,id,label,resetTrace=true){
      stopBook();drag=null;queue=points.map(point);if(queue.length<2)return;lastPath=queue.map(point);lastRoute=id;segment=0;segmentTime=0;pos=point(queue[0]);if(resetTrace)trace=[point(pos)];bookDraw();
      $$('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===id));$('[data-book-route]').textContent=label;
      bookRun=true;bookPaused=false;bookButtons();bookFrame=requestAnimationFrame(bookTick);
    }
    function cornerName(p){const key=Object.keys(corners).find(k=>Math.hypot(corners[k].x-p.x,corners[k].y-p.y)<4);return key?corners[key].name:'桌面上的位置';}
    $$('[data-route]').forEach(b=>kit.listen(b,'click',()=>{const id=b.dataset.route;kit.feedback($('[data-book-feedback]'),`正在验证：${labels[id]}。请留意每一段移动的方向。`);startPath(routes[id].map(k=>corners[k]),id,`${labels[id]}：${routes[id].map(k=>corners[k].name).join(' → ')}`);}));
    $$('[data-corner]').forEach(b=>kit.listen(b,'click',()=>{const end=corners[b.dataset.corner];if(Math.hypot(pos.x-end.x,pos.y-end.y)<1){kit.feedback($('[data-book-feedback]'),`课本已经在${end.name}了，试试另一个位置。`);return;}startPath([point(pos),point(end)],null,`自己选择：${cornerName(pos)} → ${end.name}`,false);}));
    kit.listen($('[data-book-play]'),'click',()=>{if(bookRun){stopBook(true);return;}if(bookPaused){bookPaused=false;bookRun=true;bookLast=0;bookButtons();bookFrame=requestAnimationFrame(bookTick);return;}startPath(lastPath,lastRoute,lastRoute?`${labels[lastRoute]}：再次观察移动过程。`:'回放你刚才的移动轨迹。');});
    function bookReset(){stopBook();drag=null;pos=point(corners.tl);trace=[point(pos)];$$('[data-route]').forEach(b=>b.classList.remove('active'));bookDraw();$('[data-book-route]').textContent='已回到左上角。试试另一条路线。';kit.feedback($('[data-book-feedback]'),'课本回到起点了。你还能找到不同的移动方法吗？');}
    kit.listen($('[data-book-reset]'),'click',bookReset);
    kit.listen($('[data-book-slow]'),'change',e=>bookSlow=e.target.checked);
    kit.listen($('[data-book-show-trace]'),'change',e=>$('[data-book-trace]').style.display=e.target.checked?'':'none');
    kit.listen($('[data-book-show-ghost]'),'change',e=>$('[data-book-ghost]').style.display=e.target.checked?'':'none');
    kit.listen(book,'pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;e.preventDefault();stopBook();const p=kit.svgPoint(svg,e);drag={pointerId:e.pointerId,dx:p.x-pos.x,dy:p.y-pos.y,path:[point(pos)]};pointerMoved=false;svg.setPointerCapture(e.pointerId);book.focus({preventScroll:true});$$('[data-route]').forEach(b=>b.classList.remove('active'));
    });
    kit.listen(svg,'pointermove',e=>{
      if(!drag||drag.pointerId!==e.pointerId)return;e.preventDefault();const p=kit.svgPoint(svg,e);pos={x:Math.max(124,Math.min(596,p.x-drag.dx)),y:Math.max(105,Math.min(330,p.y-drag.dy))};
      const prev=trace[trace.length-1];if(Math.hypot(pos.x-prev.x,pos.y-prev.y)>3){trace.push(point(pos));drag.path.push(point(pos));pointerMoved=true;}bookDraw();$('[data-book-route]').textContent='自由拖动：只改变位置，课本始终保持原来的朝向。';
    });
    function release(e){
      if(!drag||drag.pointerId!==e.pointerId)return;
      const path=drag.path.map(point);drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
      if(!pointerMoved)return;lastRoute=null;lastPath=path.length>1?path:[point(pos),point(pos)];
      const nearest=Object.values(corners).sort((a,b)=>Math.hypot(pos.x-a.x,pos.y-a.y)-Math.hypot(pos.x-b.x,pos.y-b.y))[0];
      if(Math.hypot(pos.x-nearest.x,pos.y-nearest.y)<50){pos=point(nearest);trace.push(point(pos));bookDraw();}
      lastPath=trace.map(point);
      $('[data-book-route]').textContent=`你把课本移动到了${cornerName(pos)}。可点击“回放路线”再次观察。`;
      kit.feedback($('[data-book-feedback]'),atGoal()?'你把课本送到了右下角！再用三条示范路线比较，看看路径有什么不同。':'课本只改变了位置。继续把它移到右下角吧。',atGoal()?'success':'info');
    }
    kit.listen(svg,'pointerup',release);kit.listen(svg,'pointercancel',release);
    kit.listen(book,'keydown',e=>{
      if(e.key==='Home'){e.preventDefault();bookReset();return;}const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];if(!delta)return;e.preventDefault();stopBook();pos={x:Math.max(124,Math.min(596,pos.x+delta[0])),y:Math.max(105,Math.min(330,pos.y+delta[1]))};trace.push(point(pos));lastPath=trace.map(point);lastRoute=null;bookDraw();$('[data-book-route]').textContent='方向键移动：课本保持原来的大小、形状和朝向。';if(atGoal())kit.feedback($('[data-book-feedback]'),'到了右下角！你还可以试试不同的路线。','success');
    });
    $$('[data-tr-tab]').forEach(b=>kit.listen(b,'click',()=>{view=b.dataset.trTab;stopDoor();stopBook();$$('[data-tr-view]').forEach(x=>x.hidden=x.dataset.trView!==view);$$('[data-tr-tab]').forEach(x=>{const active=x===b;x.classList.toggle('primary',active);x.classList.toggle('secondary',!active);x.setAttribute('aria-pressed',String(active));});}));
    doorDraw();doorButtons();bookDraw();bookButtons();
    return ()=>{destroyed=true;doorRun=false;bookRun=false;cancelAnimationFrame(doorFrame);cancelAnimationFrame(bookFrame);};
  }
});
