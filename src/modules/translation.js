/* Module 02 · translation, with doors and a tabletop route laboratory. */
Courseware.register({
  id: 'translation', number: 2, title: '平移实验', subtitle: '试试不同的路线', icon: '↗',
  mount(root, kit) {
    const aid=kit.uid('tr-arrow');
    const doorDone=new Set(),routesDone=new Set();
    let destroyed=false, view='doors';
    root.innerHTML=`<style>
      .tr-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.tr-subtab{min-height:44px;border:1px solid #cddbd3;border-radius:8px;background:#fff;color:#405c55;padding:9px 18px;font:inherit;font-size:16px;font-weight:600;cursor:pointer;transition:background 140ms,border-color 140ms,transform 140ms}.tr-subtab.active{background:#e5f2ec;border-color:#147d77;color:#0b635e}.tr-view[hidden]{display:none}.tr-canvas{background:#f1f5ef;border:0;border-radius:12px;overflow:hidden}.tr-canvas svg{width:100%;height:auto;display:block;max-height:420px}.tr-canvas-head{padding:16px 18px 0;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#4b6c59;font-size:16px}.tr-canvas-head strong{color:#254b3f;font-weight:650}.tr-canvas-head span{font-size:14px}.tr-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px}.tr-range{display:grid;grid-template-columns:auto minmax(0,1fr) 46px;gap:12px;align-items:center;font-size:14px;margin:10px 0;color:#4a6757}.tr-range input{width:100%;min-width:0;accent-color:#147d77;min-height:44px}.tr-state{color:#526d5d;font-size:14px}.tr-question{font-size:24px;line-height:1.45;margin:0 0 12px;color:#203d3a}.tr-mode{display:flex;gap:8px;margin:18px 0}.tr-mode button{flex:1;min-height:44px;border:1px solid #cddbd3;background:#fff;color:#4b6959;font:inherit;font-size:16px;font-weight:600;border-radius:8px;cursor:pointer;transition:background 140ms,border-color 140ms,transform 140ms}.tr-mode button.active{background:#e5f2ec;border-color:#147d77;color:#0b635e}.tr-predict{border:0;padding:0;margin:16px 0;display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center}.tr-predict legend{font-size:16px;color:#345744;font-weight:650;margin-bottom:8px}.tr-arrow-choice{min-height:48px;border-radius:8px;border:1px solid #c8d8ce;background:#fff;color:#355c47;font:inherit;font-size:16px;font-weight:600;cursor:pointer;transition:background 140ms,border-color 140ms,transform 140ms}.tr-arrow-choice.active{background:#e5f2ec;border-color:#147d77;color:#0b635e}.tr-complete{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.tr-badge{font-size:14px;color:#637b69}.tr-badge.done{color:#147d77;font-weight:650}.tr-rule{border-top:1px solid #e0e8df;margin-top:20px;padding-top:16px;line-height:1.75;color:#45614f;font-size:16px}.tr-route-list{display:grid;gap:9px;margin:18px 0}.tr-route{background:#fff;border:1px solid #cddbd3;border-radius:10px;padding:12px 14px;min-height:70px;font:inherit;color:#355c4b;cursor:pointer;display:flex;align-items:center;justify-content:space-between;text-align:left;gap:10px;transition:background 140ms,border-color 140ms,transform 140ms}.tr-route strong{display:block;font-size:16px;line-height:1.5}.tr-route small{display:block;font-size:14px;color:#526f5d;margin-top:4px;line-height:1.5}.tr-route.active{background:#e5f2ec;border-color:#147d77}.tr-route.done .tr-route-symbol{color:#147d77}.tr-route-symbol{font-size:25px;color:#567662;flex:none}.tr-corners{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.tr-corners .btn{font-size:16px;min-height:44px}.tr-path-readout{font-size:16px;color:#3c604a;padding:0;margin-top:14px;min-height:28px;line-height:1.65}.tr-book{cursor:grab;touch-action:none}.tr-book:active{cursor:grabbing}.tr-book:focus-visible{outline:none}.tr-book:focus-visible rect.tr-book-cover{stroke:#df6945;stroke-width:5}.tr-target-label{font-size:22px;font-family:inherit;fill:#4c7256;font-weight:600}.tr-route-ghost{opacity:.4}.tr-view button:focus-visible,.tr-subtab:focus-visible{outline:3px solid #df6945;outline-offset:4px}.tr-subtab:active,.tr-mode button:active,.tr-arrow-choice:active,.tr-route:active{transform:translateY(1px)}.tr-toggle-row{display:flex;gap:12px 20px;flex-wrap:wrap;margin-top:8px}.tr-ledger{font-size:14px;color:#526f5d;margin-top:16px;line-height:1.75}.tr-short-hint{font-size:16px;color:#4b6956;line-height:1.7;margin:14px 0 0}.tr-view .hint,.tr-view .feedback{font-size:16px}.tr-options{margin-top:14px}.tr-options summary{cursor:pointer;min-height:44px;display:list-item;align-content:center;color:#456354;font-size:14px;font-weight:650}.tr-options .toggle{font-size:14px;min-height:44px}.tr-manual-title{font-size:16px;font-weight:650;color:#345744;margin:22px 0 0}.tr-next{width:100%;margin-top:16px}
      @media(max-width:760px){.tr-question{font-size:22px}.tr-canvas-head{padding:14px 14px 0;font-size:16px}.tr-tabs{gap:7px}.tr-subtab{font-size:16px;padding:9px 14px}.tr-range{gap:8px}.tr-canvas-head span{font-size:14px}.tr-controls .tr-state{flex-basis:100%}.tr-corners .btn{padding:10px 7px}}@media(prefers-reduced-motion:reduce){.tr-subtab,.tr-mode button,.tr-arrow-choice,.tr-route{transition:none;transform:none}}
      @media(min-width:1000px){
        :root[data-board-mode="whiteboard"] .tr-tabs{gap:10px;margin-bottom:22px}
        :root[data-board-mode="whiteboard"] .tr-subtab{min-height:52px;padding:12px 22px;font-size:20px}
        :root[data-board-mode="whiteboard"] .tr-canvas svg{max-height:none}
        :root[data-board-mode="whiteboard"] .tr-canvas-head{padding:20px 24px 0;font-size:22px}
        :root[data-board-mode="whiteboard"] .tr-canvas-head span{font-size:18px}
        :root[data-board-mode="whiteboard"] .tr-question{font-size:30px;margin-bottom:16px}
        :root[data-board-mode="whiteboard"] .tr-view .hint,
        :root[data-board-mode="whiteboard"] .tr-view .feedback,
        :root[data-board-mode="whiteboard"] .tr-rule,
        :root[data-board-mode="whiteboard"] .tr-short-hint,
        :root[data-board-mode="whiteboard"] .tr-path-readout{font-size:20px;line-height:1.7}
        :root[data-board-mode="whiteboard"] .tr-predict{gap:12px;margin:20px 0}
        :root[data-board-mode="whiteboard"] .tr-predict legend{font-size:20px;margin-bottom:10px}
        :root[data-board-mode="whiteboard"] .tr-mode button{min-height:56px;font-size:20px}
        :root[data-board-mode="whiteboard"] .tr-arrow-choice{min-height:60px;padding:14px;font-size:22px}
        :root[data-board-mode="whiteboard"] .tr-route-list{gap:12px;margin:22px 0}
        :root[data-board-mode="whiteboard"] .tr-route{min-height:96px;padding:14px 18px}
        :root[data-board-mode="whiteboard"] .tr-route strong{font-size:22px}
        :root[data-board-mode="whiteboard"] .tr-route small{font-size:20px}
        :root[data-board-mode="whiteboard"] .tr-route-symbol{font-size:30px}
        :root[data-board-mode="whiteboard"] .tr-controls{gap:12px;margin-top:20px}
        :root[data-board-mode="whiteboard"] .tr-controls .btn,
        :root[data-board-mode="whiteboard"] .tr-corners .btn,
        :root[data-board-mode="whiteboard"] .tr-next,
        :root[data-board-mode="whiteboard"] [data-door-check]{min-height:56px;padding:14px 20px;font-size:20px}
        :root[data-board-mode="whiteboard"] .tr-corners{gap:12px}
        :root[data-board-mode="whiteboard"] .tr-manual-title{font-size:20px}
        :root[data-board-mode="whiteboard"] .tr-state,
        :root[data-board-mode="whiteboard"] .tr-badge,
        :root[data-board-mode="whiteboard"] .tr-ledger{font-size:18px}
        :root[data-board-mode="whiteboard"] .tr-options summary,
        :root[data-board-mode="whiteboard"] .tr-options .toggle{min-height:52px;font-size:18px}
        :root[data-board-mode="whiteboard"] .tr-options input[type="checkbox"]{width:22px;height:22px}
        :root[data-board-mode="whiteboard"] .tr-range{font-size:18px;grid-template-columns:auto minmax(0,1fr) 58px}
        :root[data-board-mode="whiteboard"] .tr-range input{min-height:52px}
        :root[data-board-mode="whiteboard"] .tr-target-label,
        :root[data-board-mode="whiteboard"] [data-book] text{font-size:28px}
        :root[data-board-mode="whiteboard"] [data-door-svg] text{font-size:24px}
      }
    </style>
    <div class="tr-tabs" role="group" aria-label="平移实验选择"><button type="button" class="tr-subtab active" data-tr-tab="doors" aria-pressed="true">自动门方向</button><button type="button" class="tr-subtab" data-tr-tab="book" aria-pressed="false">课本搬家</button></div>
    <div class="tr-view" data-tr-view="doors"><div class="module-layout">
      <section class="panel"><div class="tr-canvas"><div class="tr-canvas-head"><strong>观察左门与右门的移动</strong></div>
      <svg viewBox="86 65 548 326" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="自动门开关的平移示意图" data-door-svg>
      <defs><marker id="${aid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#e47e5f" stroke-width="1.8"/></marker></defs>
      <ellipse cx="360" cy="361" rx="247" ry="15" fill="#e0eadf"/><rect x="102" y="77" width="516" height="275" rx="12" fill="#d1e5d6"/><path d="M102 115H618" stroke="#a5c4ad" stroke-width="5"/><rect x="230" y="131" width="260" height="213" fill="#6b9482"/><rect x="118" y="132" width="100" height="200" rx="4" fill="#eaf3e7"/><rect x="502" y="132" width="100" height="200" rx="4" fill="#eaf3e7"/>
      <g data-door-ghost><rect x="231" y="131" width="129" height="212" fill="none" stroke="#8da993" stroke-dasharray="7 6" stroke-width="2"/><rect x="360" y="131" width="129" height="212" fill="none" stroke="#8da993" stroke-dasharray="7 6" stroke-width="2"/></g>
      <g data-door-left><rect x="231" y="131" width="129" height="212" rx="3" fill="#98cbb7" stroke="#fff" stroke-width="5"/><path d="M246 148H342L246 238Z" fill="#cce7d7"/><path d="M346 216V257" stroke="#347966" stroke-width="5" stroke-linecap="round"/><rect x="248" y="268" width="94" height="28" rx="8" fill="#eaf6e8"/><text x="295" y="287" text-anchor="middle" font-size="14" font-weight="700" fill="#3a7a62">左门</text></g>
      <g data-door-right><rect x="360" y="131" width="129" height="212" rx="3" fill="#edbe8a" stroke="#fff" stroke-width="5"/><path d="M378 148H473L378 238Z" fill="#f8dfba"/><path d="M374 216V257" stroke="#af8651" stroke-width="5" stroke-linecap="round"/><rect x="378" y="268" width="94" height="28" rx="8" fill="#fff0d8"/><text x="425" y="287" text-anchor="middle" font-size="14" font-weight="700" fill="#987144">右门</text></g>
      <g data-door-arrows style="display:none"><path data-left-arrow d="M310 374H208" stroke="#e47e5f" stroke-width="3" fill="none" marker-end="url(#${aid})"/><path data-right-arrow d="M410 374H512" stroke="#e47e5f" stroke-width="3" fill="none" marker-end="url(#${aid})"/></g></svg></div>
      
      <div class="tr-controls"><button type="button" class="btn secondary" data-door-play>直接播放开门</button><button type="button" class="btn ghost" data-door-reset>从头观察</button><span class="tr-state" data-door-state>门已关好</span></div>
      <details class="tr-options"><summary>显示与速度</summary><div class="tr-toggle-row"><label class="toggle"><input type="checkbox" data-door-slow>慢速播放</label><label class="toggle"><input type="checkbox" data-door-outline checked>起点虚影</label><label class="toggle"><input type="checkbox" data-door-clues>方向箭头</label></div><label class="tr-range">打开程度<input type="range" min="0" max="100" value="0" step="1" data-door-range aria-label="门的打开程度"><output data-door-percent>0%</output></label></details>
      </section>
      <aside class="panel"><h2 class="tr-question">预测两扇门的方向</h2><p class="hint">选择开门或关门，再给每扇门选方向。</p>
      <div class="tr-mode" role="group" aria-label="选择开门或关门"><button type="button" class="active" data-door-mode="open" aria-pressed="true">开门时</button><button type="button" data-door-mode="close" aria-pressed="false">关门时</button></div>
      <fieldset class="tr-predict"><legend>左门</legend><button type="button" class="tr-arrow-choice" data-predict-side="left" data-predict-direction="-1" aria-pressed="false">← 向左</button><button type="button" class="tr-arrow-choice" data-predict-side="left" data-predict-direction="1" aria-pressed="false">向右 →</button></fieldset>
      <fieldset class="tr-predict"><legend>右门</legend><button type="button" class="tr-arrow-choice" data-predict-side="right" data-predict-direction="-1" aria-pressed="false">← 向左</button><button type="button" class="tr-arrow-choice" data-predict-side="right" data-predict-direction="1" aria-pressed="false">向右 →</button></fieldset>
      <button type="button" class="btn primary" style="width:100%" data-door-check>验证我的预测</button><div class="feedback" role="status" aria-live="polite" data-door-feedback style="margin-top:16px">先想一想，再用手势表示两扇门的运动方向。</div>
      <button type="button" class="btn primary tr-next" data-door-next hidden>预测关门方向</button><div class="tr-complete"><span class="tr-badge" data-door-badge="open">○ 开门方向</span><span class="tr-badge" data-door-badge="close">○ 关门方向</span></div><div class="tr-rule">两扇门都可以看作平移。描述运动时，要说清楚观察的是哪一扇门。</div>
      </aside></div></div>
    <div class="tr-view" data-tr-view="book" hidden><div class="module-layout">
      <section class="panel"><div class="tr-canvas"><div class="tr-canvas-head"><strong>起点在左上，目标在右下</strong></div>
      <svg viewBox="48 30 624 388" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="课本在桌面上平移，起点左上角，目标右下角" data-book-svg>
      <rect x="57" y="38" width="606" height="372" rx="26" fill="#d9dfc4"/><rect x="67" y="38" width="586" height="354" rx="22" fill="#e7e9d1" stroke="#c4d2b5" stroke-width="3"/><path d="M89 211H631M360 60V371" stroke="#ced8bb" stroke-dasharray="4 8"/>
      <g fill="none" stroke="#becdad" stroke-width="2" stroke-dasharray="5 6"><rect x="112" y="69" width="96" height="122" rx="9"/><rect x="512" y="69" width="96" height="122" rx="9"/><rect x="112" y="249" width="96" height="122" rx="9"/><rect x="512" y="249" width="96" height="122" rx="9"/></g>
      <g class="tr-target-label" text-anchor="middle"><text x="160" y="59">左上角 · 起点</text><text x="560" y="59">右上角</text><text x="160" y="389">左下角</text><text x="560" y="389" fill="#ba7752">右下角 · 目标</text></g>
      <polyline data-book-trace points="160,130" fill="none" stroke="#e48b62" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round" stroke-linejoin="round"/>
      <g data-book-ghost transform="translate(160 130)" class="tr-route-ghost"><rect x="-44" y="-57" width="88" height="114" rx="7" fill="#c8d9c0" stroke="#548b75" stroke-width="2" stroke-dasharray="5 4"/><circle cx="-30" cy="-43" r="4" fill="#d07859"/></g>
      <g data-book transform="translate(160 130)" class="tr-book" tabindex="0" role="button" aria-label="数学课本。可以拖动，也可用方向键移动，按 Home 返回起点。"><rect x="-40" y="-52" width="88" height="114" rx="7" fill="#597f6123"/><rect x="-44" y="-57" width="88" height="114" rx="7" fill="#fbf8e8" stroke="#97b39a" stroke-width="2"/><rect class="tr-book-cover" x="-44" y="-61" width="88" height="111" rx="7" fill="#287f73"/><path d="M-34-58V47" stroke="#78ac91" stroke-width="2"/><circle cx="-28" cy="-44" r="5" fill="#f3a06e" stroke="#ffe6c9" stroke-width="1.5"/><text x="4" y="-7" text-anchor="middle" fill="#fff9df" font-size="23" font-weight="700">数学</text><path d="M-16 12H25M-16 19H15" stroke="#97c5a4" stroke-width="3" stroke-linecap="round"/><circle cx="21" cy="34" r="6" fill="#d8dd94"/></g>
      </svg></div><div class="tr-path-readout" data-book-route role="status">起点：左上角。选一条路线，或自己移动课本。</div>
      <div class="tr-controls"><button type="button" class="btn secondary" data-book-play disabled>先选择路线</button><button type="button" class="btn ghost" data-book-reset>回到起点</button></div>
      <details class="tr-options"><summary>显示与速度</summary><div class="tr-toggle-row"><label class="toggle"><input type="checkbox" data-book-slow>慢速播放</label><label class="toggle"><input type="checkbox" data-book-show-trace checked>运动轨迹</label><label class="toggle"><input type="checkbox" data-book-show-ghost checked>起点虚影</label></div></details>
      <p class="tr-short-hint">可拖动课本，也可用四角按钮或方向键。看红色书角：课本移动时朝向不变。</p>
      </section>
      <aside class="panel"><h2 class="tr-question">选择一条路线</h2><p class="hint">先选路线，再点击“验证所选路线”。</p>
      <div class="tr-route-list"><button type="button" class="tr-route" data-route="right-down"><span><strong>先向右，再向下</strong><small>左上 → 右上 → 右下</small></span><span class="tr-route-symbol">↳</span></button><button type="button" class="tr-route" data-route="down-right"><span><strong>先向下，再向右</strong><small>左上 → 左下 → 右下</small></span><span class="tr-route-symbol">↱</span></button><button type="button" class="tr-route" data-route="diagonal"><span><strong>沿斜方向直接移动</strong><small>左上 → 右下</small></span><span class="tr-route-symbol">↘</span></button></div>
      <div class="feedback" data-book-feedback role="status" aria-live="polite">试着比较：路线变了，课本最后到的位置变了吗？</div>
      <h3 class="tr-manual-title">自己选择下一站</h3><div class="tr-corners"><button type="button" class="btn secondary" data-corner="tl">↖ 左上角</button><button type="button" class="btn secondary" data-corner="tr">右上角 ↗</button><button type="button" class="btn secondary" data-corner="bl">↙ 左下角</button><button type="button" class="btn secondary" data-corner="br">右下角 ↘</button></div>
      <div class="tr-ledger" data-book-ledger>已发现 0 / 3 条示范路线。</div><div class="tr-rule">先向右、再向下，是两次平移；沿斜方向直接移动，也可以是平移。</div>
      </aside></div></div>`;
    const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
    const mark=()=>{if(doorDone.size===2&&routesDone.size===3)kit.markDone();};
    let doorMode='open',door=0,doorRun=false,doorFrame=0,doorLast=0,doorSlow=false,doorStart=0,doorGoal=1,doorTime=0,doorPaused=false;
    let doorChecked=false,doorCorrect=false,doorObservationComplete=false;
    const prediction={left:null,right:null};
    function doorDraw(){
      $('[data-door-left]').setAttribute('transform',`translate(${-108*door} 0)`);$('[data-door-right]').setAttribute('transform',`translate(${108*door} 0)`);
      $('[data-door-range]').value=String(Math.round(door*100));$('[data-door-percent]').textContent=`${Math.round(door*100)}%`;
      const ghosts=$('[data-door-ghost]').children;ghosts[0].setAttribute('transform',`translate(${doorMode==='close'?-108:0} 0)`);ghosts[1].setAttribute('transform',`translate(${doorMode==='close'?108:0} 0)`);
      $('[data-left-arrow]').setAttribute('d',doorMode==='open'?'M310 374H208':'M208 374H310');$('[data-right-arrow]').setAttribute('d',doorMode==='open'?'M410 374H512':'M512 374H410');
    }
    function doorButtons(){
      const playingOrPaused=doorRun||doorPaused,readyNext=doorChecked&&doorCorrect&&doorObservationComplete&&!playingOrPaused;
      const playButton=$('[data-door-play]'),checkButton=$('[data-door-check]'),nextButton=$('[data-door-next]');
      playButton.textContent=doorRun?'暂停运动':doorPaused?'继续观察':doorObservationComplete?'再看一次':`直接播放${doorMode==='open'?'开门':'关门'}`;
      playButton.classList.toggle('primary',playingOrPaused);playButton.classList.toggle('secondary',!playingOrPaused);
      checkButton.classList.toggle('primary',!playingOrPaused&&!readyNext);checkButton.classList.toggle('secondary',playingOrPaused||readyNext);checkButton.disabled=doorRun;
      checkButton.textContent=doorChecked?'再次验证预测':'验证我的预测';
      nextButton.hidden=!readyNext;nextButton.textContent=doorDone.size===2?'开始课本搬家':`预测${doorMode==='open'?'关门':'开门'}方向`;
      $('[data-door-state]').textContent=doorRun?(doorMode==='open'?'正在打开':'正在关闭'):doorPaused?'已暂停，位置已保留':door===0?'门已关好':door===1?'门已打开':'可拖动滑块观察';
    }
    function stopDoor(pause=false){doorRun=false;doorPaused=pause;cancelAnimationFrame(doorFrame);doorFrame=0;doorLast=0;doorButtons();}
    function pauseDoor(){if(doorRun)stopDoor(true);}
    function finishDoor(){
      doorObservationComplete=true;
      if(doorChecked&&doorCorrect){doorDone.add(doorMode);const badge=$(`[data-door-badge="${doorMode}"]`);badge.classList.add('done');badge.textContent=`✓ ${doorMode==='open'?'开门':'关门'}方向`;mark();}
      stopDoor();doorDraw();
    }
    function doorTick(now){
      if(!doorRun||destroyed)return;if(!doorLast)doorLast=now;
      doorTime+=Math.min(60,now-doorLast)*(doorSlow?0.35:1);doorLast=now;const p=Math.min(1,doorTime/2400);door=doorStart+(doorGoal-doorStart)*p;doorDraw();
      if(p>=1){door=doorGoal;finishDoor();return;}doorFrame=requestAnimationFrame(doorTick);
    }
    function startDoor(force=false){
      if(doorRun&&!force){stopDoor(true);return;}
      if(force)stopDoor();
      if(!doorPaused||force){doorGoal=doorMode==='open'?1:0;if(Math.abs(door-doorGoal)<.001||force){door=doorMode==='open'?0:1;doorDraw();}doorStart=door;doorTime=0;}
      doorObservationComplete=false;doorRun=true;doorPaused=false;doorLast=0;doorButtons();doorFrame=requestAnimationFrame(doorTick);
    }
    function setDoorMode(mode){
      stopDoor();doorMode=mode;door=mode==='open'?0:1;doorChecked=false;doorCorrect=false;doorObservationComplete=false;prediction.left=null;prediction.right=null;
      $$('[data-door-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.doorMode===mode);b.setAttribute('aria-pressed',String(b.dataset.doorMode===mode));});
      $$('[data-predict-side]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
      kit.feedback($('[data-door-feedback]'),`请预测${mode==='open'?'开门':'关门'}时，左右两扇门各向哪里平移。`);doorDraw();doorButtons();
    }
    $$('[data-door-mode]').forEach(b=>kit.listen(b,'click',()=>setDoorMode(b.dataset.doorMode)));
    $$('[data-predict-side]').forEach(b=>kit.listen(b,'click',()=>{
      stopDoor();doorChecked=false;doorCorrect=false;doorObservationComplete=false;prediction[b.dataset.predictSide]=Number(b.dataset.predictDirection);
      $$(`[data-predict-side="${b.dataset.predictSide}"]`).forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});doorButtons();
    }));
    kit.listen($('[data-door-check]'),'click',()=>{
      if(prediction.left===null||prediction.right===null){kit.feedback($('[data-door-feedback]'),'请先为左门和右门各选一个方向。');return;}
      doorChecked=true;doorCorrect=doorMode==='open'?prediction.left===-1&&prediction.right===1:prediction.left===1&&prediction.right===-1;
      const text=doorMode==='open'?'左门向左平移，右门向右平移。':'左门向右平移，右门向左平移。';
      kit.feedback($('[data-door-feedback]'),doorCorrect?`预测正确。${text}请看动画验证。`:`你的选择已保留。跟着动画再看一遍：${text}`,doorCorrect?'success':'error');startDoor(true);
    });
    kit.listen($('[data-door-play]'),'click',()=>startDoor());
    kit.listen($('[data-door-next]'),'click',()=>{if(doorDone.size===2)showView('book');else setDoorMode(doorMode==='open'?'close':'open');});
    kit.listen($('[data-door-reset]'),'click',()=>{stopDoor();door=doorMode==='open'?0:1;doorObservationComplete=false;doorDraw();doorButtons();});
    kit.listen($('[data-door-slow]'),'change',e=>doorSlow=e.target.checked);
    kit.listen($('[data-door-range]'),'input',e=>{stopDoor();doorObservationComplete=false;door=Number(e.target.value)/100;doorDraw();doorButtons();});
    kit.listen($('[data-door-outline]'),'change',e=>$('[data-door-ghost]').style.display=e.target.checked?'':'none');
    kit.listen($('[data-door-clues]'),'change',e=>$('[data-door-arrows]').style.display=e.target.checked?'':'none');
    const corners={tl:{x:160,y:130,name:'左上角'},tr:{x:560,y:130,name:'右上角'},bl:{x:160,y:310,name:'左下角'},br:{x:560,y:310,name:'右下角'}};
    const routes={'right-down':['tl','tr','br'],'down-right':['tl','bl','br'],'diagonal':['tl','br']};
    const labels={'right-down':'先向右，再向下','down-right':'先向下，再向右','diagonal':'沿斜方向直接移动'};
    let pos={x:160,y:130},trace=[{x:160,y:130}],lastPath=[],lastRoute=null,bookRun=false,bookPaused=false,bookPrepared=false,bookFrame=0,bookLast=0,bookSlow=false,queue=[],segment=0,segmentTime=0,drag=null,pointerMoved=false;
    const svg=$('[data-book-svg]'),book=$('[data-book]');
    function bookDraw(){book.setAttribute('transform',`translate(${pos.x} ${pos.y})`);$('[data-book-trace]').setAttribute('points',trace.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));}
    function bookButtons(){
      const b=$('[data-book-play]');b.disabled=lastPath.length<2&&!bookRun&&!bookPaused;
      b.textContent=bookRun?'暂停移动':bookPaused?'继续移动':bookPrepared?'验证所选路线':lastPath.length>1?'回放路线':'先选择路线';
      b.classList.toggle('primary',bookRun||bookPaused||bookPrepared);b.classList.toggle('secondary',!bookRun&&!bookPaused&&!bookPrepared);
    }
    function stopBook(pause=false){bookRun=false;bookPaused=pause;bookLast=0;cancelAnimationFrame(bookFrame);bookFrame=0;bookButtons();}
    function pauseBook(){if(bookRun)stopBook(true);stopDragging(false);}
    function point(p){return{x:p.x,y:p.y};}
    function atGoal(){return Math.hypot(pos.x-560,pos.y-310)<2;}
    function routeSelection(id){$$('[data-route]').forEach(b=>{const active=b.dataset.route===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
    function routeFinished(){
      bookPrepared=false;stopBook();if(!lastRoute&&trace.length>1)lastPath=trace.map(point);
      if(lastRoute&&routes[lastRoute]&&atGoal()){routesDone.add(lastRoute);const b=$(`[data-route="${lastRoute}"]`);b.classList.add('done');b.querySelector('.tr-route-symbol').textContent='✓';$('[data-book-ledger]').textContent=`已发现 ${routesDone.size} / 3 条示范路线。${routesDone.size===3?'三条路线都到达了右下角。':''}`;mark();}
      if(atGoal())kit.feedback($('[data-book-feedback]'),lastRoute==='diagonal'?'到了右下角。斜向移动时，课本没有转动，也可以看作平移。':'到了右下角。课本的朝向没有变。再选另一条路线，比较经过的位置。','success');bookButtons();
    }
    function bookTick(now){
      if(!bookRun||destroyed)return;if(!bookLast)bookLast=now;
      const a=queue[segment],b=queue[segment+1],dist=Math.hypot(b.x-a.x,b.y-a.y),duration=Math.max(35,dist*4.5);
      segmentTime+=Math.min(60,now-bookLast)*(bookSlow?0.4:1);bookLast=now;const p=Math.min(1,segmentTime/duration);pos={x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p};
      const prior=trace[trace.length-1];if(Math.hypot(pos.x-prior.x,pos.y-prior.y)>3||p===1)trace.push(point(pos));bookDraw();
      if(p>=1){segment++;segmentTime=0;if(segment>=queue.length-1){routeFinished();return;}}
      bookFrame=requestAnimationFrame(bookTick);
    }
    function startPath(points,id,label,resetTrace=true){
      stopBook();stopDragging(false);queue=points.map(point);if(queue.length<2)return;
      lastPath=queue.map(point);lastRoute=id;bookPrepared=false;segment=0;segmentTime=0;pos=point(queue[0]);if(resetTrace)trace=[point(pos)];bookDraw();routeSelection(id);$('[data-book-route]').textContent=label;
      bookRun=true;bookPaused=false;bookButtons();bookFrame=requestAnimationFrame(bookTick);
    }
    function prepareRoute(id){
      stopBook();stopDragging(false);lastRoute=id;lastPath=routes[id].map(k=>point(corners[k]));bookPrepared=true;pos=point(corners.tl);trace=[point(pos)];queue=[];segment=0;segmentTime=0;
      routeSelection(id);bookDraw();bookButtons();$('[data-book-route]').textContent=`已选：${routes[id].map(k=>corners[k].name).join(' → ')}`;
      kit.feedback($('[data-book-feedback]'),`已选“${labels[id]}”。点击“验证所选路线”，观察每一段移动。`);
    }
    function cornerName(p){const key=Object.keys(corners).find(k=>Math.hypot(corners[k].x-p.x,corners[k].y-p.y)<4);return key?corners[key].name:'桌面上的位置';}
    $$('[data-route]').forEach(b=>kit.listen(b,'click',()=>prepareRoute(b.dataset.route)));
    $$('[data-corner]').forEach(b=>kit.listen(b,'click',()=>{const end=corners[b.dataset.corner];if(Math.hypot(pos.x-end.x,pos.y-end.y)<1){kit.feedback($('[data-book-feedback]'),`课本已经在${end.name}了，试试另一个位置。`);return;}startPath([point(pos),point(end)],null,`自己选择：${cornerName(pos)} → ${end.name}`,false);}));
    kit.listen($('[data-book-play]'),'click',()=>{
      if(bookRun){stopBook(true);return;}
      if(bookPaused){bookPaused=false;bookRun=true;bookLast=0;bookButtons();bookFrame=requestAnimationFrame(bookTick);return;}
      if(lastPath.length<2)return;
      if(bookPrepared)kit.feedback($('[data-book-feedback]'),`正在验证“${labels[lastRoute]}”。看封面和红色书角的朝向。`);
      startPath(lastPath,lastRoute,lastRoute?`${labels[lastRoute]}：${routes[lastRoute].map(k=>corners[k].name).join(' → ')}`:'回放你刚才的移动轨迹。');
    });
    function bookReset(){
      stopBook();stopDragging(false);bookPrepared=false;lastRoute=null;lastPath=[];queue=[];pos=point(corners.tl);trace=[point(pos)];routeSelection(null);bookDraw();bookButtons();
      $('[data-book-route]').textContent='已回到左上角。选择一条路线，或自己移动课本。';kit.feedback($('[data-book-feedback]'),'课本回到起点了。你还能找到不同的移动方法吗？');
    }
    kit.listen($('[data-book-reset]'),'click',bookReset);
    kit.listen($('[data-book-slow]'),'change',e=>bookSlow=e.target.checked);
    kit.listen($('[data-book-show-trace]'),'change',e=>$('[data-book-trace]').style.display=e.target.checked?'':'none');
    kit.listen($('[data-book-show-ghost]'),'change',e=>$('[data-book-ghost]').style.display=e.target.checked?'':'none');
    kit.listen(book,'pointerdown',e=>{
      if(drag)return;
      if(e.button!==undefined&&e.button!==0)return;e.preventDefault();stopBook();stopDragging(false);bookPrepared=false;lastRoute=null;lastPath=trace.length>1?trace.map(point):[];
      const p=kit.svgPoint(svg,e);drag={pointerId:e.pointerId,dx:p.x-pos.x,dy:p.y-pos.y};pointerMoved=false;
      if(svg.setPointerCapture)svg.setPointerCapture(e.pointerId);book.focus({preventScroll:true});routeSelection(null);bookButtons();
    });
    kit.listen(svg,'pointermove',e=>{
      if(!drag||drag.pointerId!==e.pointerId)return;e.preventDefault();const p=kit.svgPoint(svg,e);pos={x:Math.max(124,Math.min(596,p.x-drag.dx)),y:Math.max(105,Math.min(330,p.y-drag.dy))};
      const prev=trace[trace.length-1];if(Math.hypot(pos.x-prev.x,pos.y-prev.y)>3){trace.push(point(pos));pointerMoved=true;}bookDraw();$('[data-book-route]').textContent='自由拖动：只改变位置，课本始终保持原来的朝向。';
    });
    function stopDragging(snap){
      if(!drag)return;const id=drag.pointerId;drag=null;
      if(svg.hasPointerCapture&&svg.hasPointerCapture(id))svg.releasePointerCapture(id);
      if(!pointerMoved){bookButtons();return;}
      if(snap){const nearest=Object.values(corners).sort((a,b)=>Math.hypot(pos.x-a.x,pos.y-a.y)-Math.hypot(pos.x-b.x,pos.y-b.y))[0];if(Math.hypot(pos.x-nearest.x,pos.y-nearest.y)<50)pos=point(nearest);}
      const tail=trace[trace.length-1];if(Math.hypot(pos.x-tail.x,pos.y-tail.y)>.1)trace.push(point(pos));lastRoute=null;lastPath=trace.map(point);bookPrepared=false;bookDraw();bookButtons();
      $('[data-book-route]').textContent=`课本在${cornerName(pos)}。位置已保留，可回放刚才的移动。`;
      if(snap)kit.feedback($('[data-book-feedback]'),atGoal()?'你把课本送到了右下角。再选择示范路线，比较经过的位置。':'课本只改变了位置。继续把它移到右下角吧。',atGoal()?'success':'info');
    }
    kit.listen(svg,'pointerup',e=>{if(drag&&drag.pointerId===e.pointerId)stopDragging(true);});
    kit.listen(svg,'pointercancel',e=>{if(drag&&drag.pointerId===e.pointerId)stopDragging(false);});
    kit.listen(svg,'lostpointercapture',e=>{if(drag&&drag.pointerId===e.pointerId)stopDragging(false);});
    kit.listen(book,'keydown',e=>{
      if(e.key==='Home'){e.preventDefault();bookReset();return;}
      const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];if(!delta)return;
      e.preventDefault();stopBook();stopDragging(false);bookPrepared=false;pos={x:Math.max(124,Math.min(596,pos.x+delta[0])),y:Math.max(105,Math.min(330,pos.y+delta[1]))};
      trace.push(point(pos));lastPath=trace.map(point);lastRoute=null;routeSelection(null);bookDraw();bookButtons();$('[data-book-route]').textContent='方向键移动：课本保持原来的大小、形状和朝向。';
      if(atGoal())kit.feedback($('[data-book-feedback]'),'到了右下角。你还可以试试不同的路线。','success');
    });
    function showView(next){
      pauseDoor();pauseBook();view=next;$$('[data-tr-view]').forEach(x=>x.hidden=x.dataset.trView!==view);
      $$('[data-tr-tab]').forEach(x=>{const active=x.dataset.trTab===view;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});
    }
    $$('[data-tr-tab]').forEach(b=>kit.listen(b,'click',()=>showView(b.dataset.trTab)));
    doorDraw();doorButtons();bookDraw();bookButtons();routeSelection(null);
    return {pause(){pauseDoor();pauseBook();},destroy(){destroyed=true;stopDragging(false);stopDoor();stopBook();}};
  }
});
