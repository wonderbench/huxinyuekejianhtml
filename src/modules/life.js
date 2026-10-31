/* Module 01 · life observations. All artwork is original inline SVG. */
Courseware.register({
  id: 'life', number: 1, title: '生活观察', subtitle: '发现身边的运动', icon: '◎',
  mount(root, kit) {
    const arrowId = kit.uid('lf-arrow');
    const scenes = [
      { name: '升旗', object: '旗面整体', type: 'translation', instruction: '观察旗面整体沿旗杆上升的过程。', reason: '旗面整体向上移动，运动过程中没有转动，可以看作平移。', cue: '盯住旗角的标记点：它沿竖直方向向上移动。' },
      { name: '自动门', object: '左右门扇', type: 'translation', instruction: '观察两扇门打开时各自怎样运动。', reason: '开门时，左门向左、右门向右移动，两扇门的运动都可以看作平移。', cue: '分别看左右两扇门：它们向相反方向移动，门扇没有转动。' },
      { name: '电梯', object: '电梯轿厢', type: 'translation', instruction: '观察电梯轿厢上升的过程。', reason: '轿厢整体沿竖直方向上升，运动过程中保持原来的朝向，可以看作平移。', cue: '盯住轿厢上的红点：它和轿厢一起沿竖直方向上升。' },
      { name: '电风扇', object: '扇叶', type: 'rotation', instruction: '观察彩色扇叶，风扇底座保持不动。', reason: '扇叶绕着固定的中心轴转动，可以看作旋转。这里观察的是扇叶。', cue: '盯住红色扇叶上的点：它绕固定的中心转动。' },
      { name: '齿轮', object: '两个齿轮', type: 'rotation', instruction: '观察两个齿轮中心与齿上的标记点。', reason: '两个齿轮分别绕自己的固定中心转动，都可以看作旋转；相邻齿轮的转向相反。', cue: '中心的位置没有变，齿上的标记点围着各自的中心转动。' },
      { name: '抽屉', object: '抽屉整体', type: 'translation', instruction: '从侧面观察抽屉沿滑轨拉出的过程。', reason: '抽屉沿滑轨向外移动，运动过程中没有转动，可以看作平移。', cue: '观察抽屉边缘：它向右移动，各条边仍保持原来的朝向。' }
    ];
    const done = new Set();
    let current = 0, phase = 0, running = false, slow = false, clues = false, frame = 0, last = 0, destroyed = false;
    root.innerHTML = `<style>
      .lf-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:18px}.lf-tab{min-height:62px;border:1px solid #dde8e3;background:#fff;border-radius:14px;color:#405c55;font:inherit;font-weight:700;cursor:pointer;position:relative;padding:9px 5px}.lf-tab.active{background:#e5f2ec;border-color:#147d77;color:#0b635e;box-shadow:inset 0 0 0 1px #147d77}.lf-tab small{display:block;font-size:11px;color:#81958e;letter-spacing:1px;margin-bottom:3px}.lf-tab.lf-done:after{content:'✓';position:absolute;right:6px;top:3px;color:#147d77;font-size:13px}.lf-main{min-width:0}.lf-stage{position:relative;border:1px solid #dfe9e1;border-radius:20px;overflow:hidden;background:#f1f6ed}.lf-stage svg{display:block;width:100%;height:auto;max-height:440px}.lf-scene-caption{padding:14px 20px 0;font-size:13px;color:#5c776a;display:flex;justify-content:space-between;gap:12px}.lf-scene-caption strong{color:#254b3f;font-size:14px}.lf-bottom{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:16px}.lf-progress-track{height:5px;background:#dce7dd;border-radius:4px;overflow:hidden;margin-top:16px}.lf-progress-fill{height:100%;width:0;background:#147d77;border-radius:4px}.lf-question{font-size:24px;line-height:1.45;color:#203d3a;margin:12px 0 8px}.lf-choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0 16px}.lf-choice{min-height:88px;border-radius:16px;border:1px solid #d6e3dd;background:#fff;text-align:left;padding:15px;font:inherit;font-weight:700;color:#254b43;cursor:pointer}.lf-choice span{font-size:25px;display:block;margin-bottom:5px}.lf-choice.selected{border-color:#147d77;background:#e4f1e9;box-shadow:inset 0 0 0 1px #147d77}.lf-choice.incorrect{border-color:#e4a18c;background:#fff3ec}.lf-notes{padding:16px 0;border-top:1px solid #e2e9e3;margin-top:22px}.lf-notes p{font-size:14px;line-height:1.8;color:#65776e;margin:8px 0 0}.lf-score{font-size:12px;font-weight:700;color:#147d77;letter-spacing:.5px}.lf-clue-line{stroke:#ed805d;stroke-width:3;stroke-dasharray:7 6;fill:none}.lf-svg-text{font-family:inherit;fill:#547462;font-size:16px}.lf-stage [data-clue]{display:none}.lf-stage.has-clues [data-clue]{display:block}.lf-tab:focus-visible,.lf-choice:focus-visible{outline:3px solid #ed805d;outline-offset:3px}.lf-status{font-size:12px;color:#6b8175;margin-left:auto}.lf-dots{display:flex;gap:6px;margin-top:12px}.lf-dot{width:20px;height:5px;border-radius:3px;background:#dfe8e2}.lf-dot.done{background:#147d77}
      @media(max-width:760px){.lf-tabs{grid-template-columns:repeat(3,1fr)}.lf-scene-caption{padding:12px 12px 0;font-size:11px}.lf-scene-caption strong{font-size:12px}.lf-stage svg{min-height:230px}.lf-question{font-size:22px}.lf-choice-grid{margin-top:14px}.lf-tab{min-height:55px}}
    </style>
    <div class="lf-tabs" role="group" aria-label="生活场景">${scenes.map((s,i)=>`<button type="button" class="lf-tab${i===0?' active':''}" data-scene="${i}" aria-pressed="${i===0}"><small>0${i+1}</small>${s.name}</button>`).join('')}</div>
    <div class="module-layout">
      <section class="panel lf-main" aria-label="运动观察区">
        <div class="lf-stage"><div class="lf-scene-caption"><strong data-object></strong><span>先观察 · 再判断</span></div><div data-picture></div></div>
        <div class="lf-progress-track" aria-hidden="true"><div class="lf-progress-fill"></div></div>
        <div class="lf-bottom"><button type="button" class="btn primary" data-play>▶ 播放运动</button><button type="button" class="btn secondary" data-reset>↺ 重来</button><label class="toggle"><input type="checkbox" data-slow>慢速</label><span class="lf-status" data-state>准备好了</span></div>
        <div class="controls" style="margin-top:14px"><button type="button" class="btn ghost" data-clues aria-pressed="false">显示观察线索</button></div>
      </section>
      <aside class="panel" aria-label="判断与思考">
        <div class="eyebrow">观察任务 <span class="lf-score" data-score>0 / 6 已发现</span></div>
        <h2 class="lf-question" data-question>它的运动可以<br>看作哪一种？</h2><p class="hint" data-instruction></p>
        <div class="lf-choice-grid" role="group" aria-label="选择运动方式"><button type="button" class="lf-choice" data-answer="translation"><span aria-hidden="true">↗</span>平移</button><button type="button" class="lf-choice" data-answer="rotation"><span aria-hidden="true">↻</span>旋转</button></div>
        <div class="feedback" data-feedback role="status" aria-live="polite">先做一个手势，表示你看到的运动，再选一选。</div>
        <div class="lf-notes"><div class="eyebrow">说一说</div><p data-sentence></p><div class="lf-dots" aria-hidden="true">${scenes.map((_,i)=>`<span class="lf-dot" data-dot="${i}"></span>`).join('')}</div></div>
        <button type="button" class="btn secondary" style="width:100%;margin-top:16px" data-next>观察下一个 →</button>
      </aside>
    </div>`;
    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];
    const feedback = $('[data-feedback]');
    const common = `<defs><marker id="${arrowId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#ed805d" stroke-width="1.8"/></marker></defs><ellipse cx="360" cy="359" rx="208" ry="15" fill="#e2eadf"/>`;
    const arrow = (d) => `<path class="lf-clue-line" d="${d}" marker-end="url(#${arrowId})"/>`;
    function gearPath(teeth,radius) {
      const points=[];
      for(let i=0;i<teeth*4;i++) { const a=i*Math.PI*2/(teeth*4), r=(i%4===1||i%4===2)?radius:radius-13; points.push(`${i?'L':'M'}${(r*Math.cos(a)).toFixed(2)},${(r*Math.sin(a)).toFixed(2)}`); }
      return points.join(' ')+'Z';
    }
    function artwork(i) {
      if(i===0) return `<path d="M305 346V62" stroke="#87a393" stroke-width="8" stroke-linecap="round"/><circle cx="305" cy="59" r="8" fill="#edb960"/><rect x="271" y="343" width="69" height="11" rx="5" fill="#5c8271"/><rect x="305" y="212" width="125" height="77" rx="3" fill="none" stroke="#b9cbbb" stroke-dasharray="6 5" data-clue/><g data-motion><rect x="310" y="212" width="125" height="77" rx="3" fill="#df574d"/><path d="m334 224 3 9 10 .2-8 6 3 10-8-6-8 6 3-10-8-6 10-.2Z" fill="#ffdf78"/><g fill="#ffdf78" font-size="13"><text x="352" y="224">★</text><text x="363" y="237">★</text><text x="363" y="252">★</text><text x="352" y="266">★</text></g><circle cx="435" cy="289" r="6" fill="#f8b962" stroke="#fff" stroke-width="3"/></g><g data-clue>${arrow('M480 285V126')}<text x="494" y="210" class="lf-svg-text">向上</text></g>`;
      if(i===1) return `<rect x="112" y="88" width="496" height="257" rx="12" fill="#d5e6db"/><path d="M112 121H608" stroke="#a4bdaa" stroke-width="5"/><rect x="223" y="135" width="274" height="204" fill="#7fa393"/><rect x="128" y="138" width="84" height="185" rx="3" fill="#edf6ee"/><rect x="508" y="138" width="84" height="185" rx="3" fill="#edf6ee"/><g data-motion="left"><rect x="228" y="138" width="132" height="198" rx="3" fill="#b7dbcf" stroke="#fff" stroke-width="5"/><path d="M244 155H336L244 244Z" fill="#d7eee2"/><path d="M348 217V254" stroke="#458977" stroke-width="5" stroke-linecap="round"/><rect x="246" y="245" width="95" height="14" rx="4" fill="#6b9f90" opacity=".55"/></g><g data-motion="right"><rect x="360" y="138" width="132" height="198" rx="3" fill="#b7dbcf" stroke="#fff" stroke-width="5"/><path d="M380 155H474L380 244Z" fill="#d7eee2"/><path d="M372 217V254" stroke="#458977" stroke-width="5" stroke-linecap="round"/><rect x="381" y="245" width="95" height="14" rx="4" fill="#6b9f90" opacity=".55"/></g><g data-clue>${arrow('M308 370H214')}${arrow('M412 370H506')}</g>`;
      if(i===2) return `<rect x="258" y="58" width="204" height="292" rx="14" fill="#d8e3d5"/><rect x="276" y="72" width="168" height="260" rx="7" fill="#bbcebd"/><path d="M289 72V332M431 72V332" stroke="#7fa18d" stroke-width="4"/><path d="M470 96H496M470 160H496M470 225H496M470 290H496" stroke="#a6bca8" stroke-width="3"/><g data-motion><path d="M290 207H430V308H290Z" fill="#fff8e5" stroke="#497d69" stroke-width="5"/><path d="M302 221H418V290H302Z" fill="#c6e3d4"/><path d="M360 222V291" stroke="#fff8e5" stroke-width="4"/><rect x="315" y="299" width="90" height="6" rx="3" fill="#81ad96"/><circle cx="418" cy="223" r="7" fill="#ed805d" stroke="#fff" stroke-width="3"/></g><g data-clue>${arrow('M514 296V126')}<text x="529" y="213" class="lf-svg-text">向上</text></g>`;
      if(i===3) return `<path d="M349 286H371L381 341H339Z" fill="#81b8a3"/><path d="M298 346Q360 323 422 346V355H298Z" fill="#5a9b84"/><circle cx="360" cy="194" r="124" fill="#fbfcf4" stroke="#abcab5" stroke-width="7"/><g data-motion>${[0,120,240].map((a,j)=>`<g transform="rotate(${a})"><path d="M0 0C-20-22-42-78-11-100C20-124 62-81 39-40C24-13 11-3 0 0Z" fill="${j===0?'#ed805d':'#86b9a1'}" stroke="#f8faf1" stroke-width="3"/>${j===0?'<circle cx="13" cy="-84" r="7" fill="#fff4d8"/>':''}</g>`).join('')}</g><circle cx="360" cy="194" r="19" fill="#568d76" stroke="#eff5e9" stroke-width="5"/><g data-clue><circle cx="360" cy="194" r="88" class="lf-clue-line"/><circle cx="360" cy="194" r="5" fill="#f9cd73"/><path d="M380 194H487" stroke="#8ba997" stroke-dasharray="4 4"/><text x="492" y="200" class="lf-svg-text">中心不动</text></g>`;
      if(i===4) return `<g data-motion="left"><path d="${gearPath(12,90)}" fill="#8bb6a2" stroke="#4f8975" stroke-width="4"/><circle r="47" fill="#e6efe0" stroke="#4f8975" stroke-width="4"/><circle cx="0" cy="-68" r="8" fill="#f5b467" stroke="#fff" stroke-width="3"/></g><g data-motion="right"><path d="${gearPath(10,75)}" fill="#edb878" stroke="#b88a56" stroke-width="4"/><circle r="36" fill="#f7ecd6" stroke="#b88a56" stroke-width="4"/><circle cx="0" cy="-56" r="7" fill="#df765b" stroke="#fff" stroke-width="3"/></g><circle cx="286" cy="211" r="13" fill="#568a77"/><circle cx="451" cy="211" r="12" fill="#b88750"/><g data-clue><circle cx="286" cy="211" r="68" class="lf-clue-line"/><circle cx="451" cy="211" r="56" class="lf-clue-line"/><text x="224" y="340" class="lf-svg-text">各自绕固定的中心转动</text></g>`;
      return `<rect x="165" y="105" width="267" height="234" rx="9" fill="#c2ad8e"/><path d="M165 134H432M183 322H416" stroke="#9f896d" stroke-width="5"/><rect x="186" y="158" width="229" height="120" rx="3" fill="#726a58"/><path d="M169 339V357M424 339V357" stroke="#a18b6d" stroke-width="10" stroke-linecap="round"/><g data-motion><path d="M194 167H418V264H194Z" fill="#d7c69c" stroke="#ad936c" stroke-width="3"/><path d="M196 171H417V196H196Z" fill="#eee2bf"/><rect x="410" y="157" width="26" height="118" rx="4" fill="#cfa875" stroke="#a6845d" stroke-width="3"/><path d="M439 199H450V235H439" fill="none" stroke="#715f49" stroke-width="5" stroke-linejoin="round"/><circle cx="423" cy="171" r="6" fill="#ed805d" stroke="#fff" stroke-width="2"/></g><g data-clue>${arrow('M449 304H568')}<text x="449" y="337" class="lf-svg-text">沿滑轨拉出</text></g>`;
    }
    function draw() {
      $('[data-picture]').innerHTML = `<svg viewBox="0 0 720 405" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${scenes[current].name}运动示意图">${common}${artwork(current)}</svg>`;
      $('[data-object]').textContent = `观察对象：${scenes[current].object}`;
      $('[data-instruction]').textContent = scenes[current].instruction;
      $('[data-sentence]').textContent = `“我观察的是${scenes[current].object}，它在……”`;
      update();
    }
    function update() {
      const motion = $('[data-motion]'), left=$('[data-motion="left"]'),right=$('[data-motion="right"]');
      if(current===0) motion.setAttribute('transform',`translate(0 ${-145*phase})`);
      if(current===1) {left.setAttribute('transform',`translate(${-100*phase} 0)`);right.setAttribute('transform',`translate(${100*phase} 0)`);}
      if(current===2) motion.setAttribute('transform',`translate(0 ${-130*phase})`);
      if(current===3) motion.setAttribute('transform',`translate(360 194) rotate(${360*phase})`);
      if(current===4) {left.setAttribute('transform',`translate(286 211) rotate(${180*phase})`);right.setAttribute('transform',`translate(451 211) rotate(${-216*phase})`);}
      if(current===5) motion.setAttribute('transform',`translate(${110*phase} 0)`);
      $('.lf-progress-fill').style.width=`${phase*100}%`;
    }
    function syncButtons() { $('[data-play]').textContent = running?'Ⅱ 暂停运动':phase>=1?'↻ 再看一次':'▶ 播放运动'; $('[data-state]').textContent=running?'正在观察':phase>=1?'播放完成':phase>0?'已暂停':'准备好了'; }
    function tick(now) {
      if(!running||destroyed)return;
      if(!last)last=now;
      phase=Math.min(1,phase+Math.min(60,now-last)/(4500/(slow?.35:1)));last=now;update();
      if(phase>=1){running=false;syncButtons();return;}
      frame=requestAnimationFrame(tick);
    }
    function stop(){running=false;cancelAnimationFrame(frame);last=0;syncButtons();}
    function play(){if(running){stop();return;} if(phase>=1)phase=0;running=true;last=0;syncButtons();frame=requestAnimationFrame(tick);}
    function select(i){ stop();current=i;phase=0;$$('[data-scene]').forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i));});$$('[data-answer]').forEach(b=>{b.classList.remove('selected','incorrect');b.setAttribute('aria-pressed','false');});kit.feedback(feedback,'先做一个手势，表示你看到的运动，再选一选。');draw();syncButtons(); }
    kit.listen($('[data-play]'),'click',play);
    kit.listen($('[data-reset]'),'click',()=>{stop();phase=0;update();syncButtons();});
    kit.listen($('[data-slow]'),'change',e=>{slow=e.target.checked;});
    kit.listen($('[data-clues]'),'click',()=>{clues=!clues;$('.lf-stage').classList.toggle('has-clues',clues);$('[data-clues]').textContent=clues?'隐藏观察线索':'显示观察线索';$('[data-clues]').setAttribute('aria-pressed',String(clues));if(clues)kit.feedback(feedback,scenes[current].cue);});
    $$('[data-scene]').forEach(b=>kit.listen(b,'click',()=>select(Number(b.dataset.scene))));
    $$('[data-answer]').forEach(b=>kit.listen(b,'click',()=>{
      const correct=b.dataset.answer===scenes[current].type;
      $$('[data-answer]').forEach(x=>{x.classList.toggle('selected',x===b&&correct);x.classList.toggle('incorrect',x===b&&!correct);x.setAttribute('aria-pressed',String(x===b));});
      kit.feedback(feedback,correct?`观察得很仔细！${scenes[current].reason}`:`再观察一次。${scenes[current].cue}`,correct?'success':'error');
      if(correct){done.add(current);$(`[data-scene="${current}"]`).classList.add('lf-done');$(`[data-dot="${current}"]`).classList.add('done');$('[data-score]').textContent=`${done.size} / 6 已发现`;if(done.size===scenes.length)kit.markDone();}
    }));
    kit.listen($('[data-next]'),'click',()=>select((current+1)%scenes.length));
    draw();
    return ()=>{destroyed=true;running=false;cancelAnimationFrame(frame);};
  }
});
