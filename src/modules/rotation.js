Courseware.register({
  id: 'rotation',
  number: 3,
  title: '旋转转盘',
  subtitle: '探索两种转动方向',
  icon: 'rotate',
  mount(root, kit) {
    const prefix = kit.uid('rot');
    const letters = ['A', 'B', 'C', 'D'];
    const tasks = [{ start: 0, target: 2 }, { start: 2, target: 1 }, { start: 2, target: 3 }];
    const records = new Map();
    let taskIndex = 0, direction = 1, progress = 0, prediction = null;
    let animation = null, playing = false, slow = false, traceVisible = true, tweenDestination = 0;
    let drag = null, completed = false;
    const point = (angle, radius = 150) => ({ x: 340 + Math.sin(angle * Math.PI / 180) * radius, y: 220 - Math.cos(angle * Math.PI / 180) * radius });
    const arc = (start, delta, radius = 150) => {
      if (Math.abs(delta) < 0.05) return '';
      const a = point(start, radius), b = point(start + delta, radius);
      return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${Math.abs(delta) > 180 ? 1 : 0} ${delta > 0 ? 1 : 0} ${b.x} ${b.y}`;
    };
    const tickMarks = Array.from({ length: 48 }, (_, i) => {
      const a = point(i * 7.5, i % 12 === 0 ? 129 : 134), b = point(i * 7.5, 140);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${i % 12 === 0 ? '#7EA5A0' : '#D6E4E0'}" stroke-width="${i % 12 === 0 ? 3 : 2}"/>`;
    }).join('');
    root.innerHTML = `
      <style>
        .rot-main{min-width:0}.rot-taskbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}.rot-taskbar .chip{min-width:104px}
        .rot-stage{position:relative;overflow:hidden;border:1px solid #DFE9E3;background:radial-gradient(circle at 50% 45%,#fff 0,#F5F9F4 70%);border-radius:22px}
        .rot-svg{display:block;width:100%;max-height:480px;touch-action:none;user-select:none}.rot-svg text{font-family:inherit}
        .rot-grip{cursor:grab}.rot-grip:active{cursor:grabbing}.rot-corner{position:absolute;top:16px;left:18px;display:flex;align-items:center;gap:7px;font-size:12px;color:#607A74;font-weight:700;letter-spacing:.05em}
        .rot-corner i{display:block;width:7px;height:7px;background:#147D77;border-radius:50%}.rot-current{text-align:center;margin:0 12px 16px;color:#496960;font-size:14px}
        .rot-controls{margin-top:18px}.rot-options{display:flex;flex-wrap:wrap;gap:12px 20px;margin-top:18px;font-size:13px;color:#4C6D66}.rot-options label{display:flex;gap:8px;align-items:center;cursor:pointer}.rot-options input{accent-color:#147D77;width:16px;height:16px}
        .rot-direction{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 20px}.rot-direction button{min-height:66px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:15px;border:1px solid #DCE5DF;border-radius:15px;background:#fff;color:#3B5B54;cursor:pointer}.rot-direction button span{font-size:27px;line-height:1}.rot-direction button.active[data-dir="1"]{background:#E5F2ED;border:2px solid #147D77;color:#147D77}.rot-direction button.active[data-dir="-1"]{background:#FFF0E7;border:2px solid #D96C47;color:#B95B3E}
        .rot-choices{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 18px}.rot-choices .btn{padding:10px;min-width:0;font-size:19px}.rot-choices .btn.active{background:#203D3A;color:white;border-color:#203D3A}
        .rot-card-heading{margin:0 0 8px;font-size:16px;line-height:1.5;color:#24463E}.rot-rule{border-top:1px solid #E7EDE7;margin-top:22px;padding-top:19px}.rot-routes{display:grid;gap:10px;margin-top:12px}.rot-route{border:1px solid #DCE9E2;border-radius:14px;padding:13px 14px;background:#F5FAF6}.rot-route:nth-child(2){border-color:#F0DFD3;background:#FFF8F2}.rot-route-label{display:block;font-size:12px;font-weight:700;color:#698278;margin-bottom:7px}.rot-route strong{font-size:17px;letter-spacing:.04em;color:#245E51}.rot-route:nth-child(2) strong{color:#A45F3E}.rot-route em{font-size:13px;font-style:normal;color:#82918B;letter-spacing:0}.rot-comparison{font-size:13px;line-height:1.7;color:#5C756C;margin:12px 0 0}.rot-reference{font-size:13px;margin:14px 0 0;padding:10px 13px;background:#F1F5EF;border-radius:10px;color:#526D63}.rot-reference[hidden]{display:none}.rot-note{margin-top:14px;font-size:12px;line-height:1.7;color:#74887F}.rot-feedback{min-height:66px}
        @media(max-width:640px){.rot-svg{min-height:280px}.rot-taskbar{gap:7px}.rot-taskbar .chip{min-width:0;flex:1;padding-left:9px;padding-right:9px}.rot-corner{top:12px;font-size:10px}.rot-current{font-size:12px;bottom:9px}.rot-options{font-size:12px}.rot-direction button{min-height:58px}}
      </style>
      <div class="module-layout">
        <div class="panel rot-main">
          <div class="rot-taskbar" role="group" aria-label="旋转任务">
            ${tasks.map((t, i) => `<button class="chip${i === 0 ? ' active' : ''}" data-task="${i}" aria-pressed="${i === 0}">${letters[t.start]} → ${letters[t.target]}</button>`).join('')}
          </div>
          <div class="rot-stage">
            <div class="rot-corner"><i></i>固定中心 · 观察转动</div>
            <svg class="rot-svg" viewBox="0 0 680 440" role="img" aria-label="指针绕固定中心旋转的转盘，A在上、B在右、C在下、D在左">
              <defs><marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker><filter id="${prefix}-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#245E51" flood-opacity=".09"/></filter></defs>
              <circle cx="340" cy="220" r="146" fill="#fff" stroke="#DDE8E0" stroke-width="2" filter="url(#${prefix}-shadow)"/>
              ${tickMarks}
              <circle class="rot-target" cx="340" cy="390" r="25" fill="#FCE9CA"/>
              ${letters.map((letter, i) => { const p = point(i * 90, 180); return `<text x="${p.x}" y="${p.y + 8}" fill="#234B43" text-anchor="middle" font-size="26" font-weight="800">${letter}</text>`; }).join('')}
              <path class="rot-record-cw" fill="none" stroke="#99C8B2" stroke-width="5" stroke-linecap="round" opacity=".5"/>
              <path class="rot-record-ccw" fill="none" stroke="#E9B698" stroke-width="5" stroke-linecap="round" opacity=".5"/>
              <path class="rot-trace" fill="none" stroke="#147D77" stroke-width="8" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
              <g class="rot-pointer">
                <path d="M 333 235 L 331 115 Q 331 105 340 90 Q 349 105 349 115 L 347 235 Z" fill="#EE805C"/>
                <circle class="rot-grip" data-rot-handle="true" cx="340" cy="104" r="20" fill="#fff" fill-opacity=".02" stroke="transparent" stroke-width="10"/>
                <circle cx="340" cy="110" r="5" fill="#FFF0DF" pointer-events="none"/>
              </g>
              <circle cx="340" cy="220" r="14" fill="#244E44"/><circle cx="340" cy="220" r="5" fill="#E5EEE3"/>
              <path d="M 356 231 L 391 259 L 441 259" fill="none" stroke="#98ADA1" stroke-width="1.5"/>
              <text x="445" y="264" fill="#698176" font-size="13">中心不动</text>
            </svg>
            <div class="rot-current">现在指向 <strong>A</strong></div>
          </div>
          <div class="controls rot-controls">
            <button class="btn primary rot-play" disabled>开始转动</button>
            <button class="btn secondary rot-step" disabled>转到下一站</button>
            <button class="btn ghost rot-reset">从起点重来</button>
          </div>
          <div class="rot-options">
            <label><input type="checkbox" class="rot-slow">慢速播放</label>
            <label><input type="checkbox" class="rot-show-trace" checked>显示轨迹</label>
            <label><input type="checkbox" class="rot-show-reference">钟面参照</label>
          </div>
          <div class="rot-reference" hidden>钟表的顺时针方向：12 → 3 → 6 → 9 → 12。</div>
          <p class="rot-note">先选择方向并预测，再播放或沿所选方向拖动指针末端。也可以用“转到下一站”逐步观察。</p>
        </div>
        <aside class="panel">
          <div class="eyebrow">先预测 · 再验证</div>
          <h3 class="panel-title rot-question">让指针从 A 转到 C</h3>
          <p class="hint">请选择一种旋转方向。</p>
          <div class="rot-direction" role="group" aria-label="旋转方向">
            <button data-dir="1" class="active" aria-pressed="true"><span aria-hidden="true">↻</span>顺时针</button>
            <button data-dir="-1" aria-pressed="false"><span aria-hidden="true">↺</span>逆时针</button>
          </div>
          <h4 class="rot-card-heading rot-prediction-label">离开 A 后，先到哪一站？</h4>
          <div class="rot-choices" role="group" aria-label="预测先到的位置"></div>
          <div class="feedback rot-feedback" role="status" aria-live="polite">选一选，再让指针动起来。</div>
          <div class="rot-rule">
            <h4 class="rot-card-heading">留下两条路线</h4>
            <div class="rot-routes">
              <div class="rot-route"><span class="rot-route-label">↻ 顺时针</span><strong class="rot-route-cw"><em>完成一次转动后记录</em></strong></div>
              <div class="rot-route"><span class="rot-route-label">↺ 逆时针</span><strong class="rot-route-ccw"><em>换个方向，再试一次</em></strong></div>
            </div>
            <p class="rot-comparison">终点相同，转动的方向和经过的位置也相同吗？</p>
          </div>
        </aside>
      </div>`;
    const $ = selector => root.querySelector(selector);
    const svg = $('.rot-svg'), feedback = $('.rot-feedback');
    const currentTask = () => tasks[taskIndex];
    const totalSteps = () => ((currentTask().target - currentTask().start) * direction + 4) % 4;
    const route = (dir = direction) => {
      const { start, target } = currentTask();
      const count = ((target - start) * dir + 4) % 4;
      return Array.from({ length: count + 1 }, (_, i) => letters[(start + dir * i + 8) % 4]);
    };
    const key = dir => `${taskIndex}:${dir}`;
    const dirName = () => direction === 1 ? '顺时针' : '逆时针';
    function stopAnimation() { if (animation) animation.cancel(); animation = null; playing = false; }
    function releaseDrag() { if (!drag) return; const id = drag.id; drag = null; if (svg.hasPointerCapture(id)) svg.releasePointerCapture(id); }
    function updateButtons() {
      $('.rot-play').disabled = prediction === null;
      $('.rot-step').disabled = prediction === null || playing || completed;
      $('.rot-play').textContent = playing ? '暂停转动' : completed ? '再转一次' : animation ? '继续转动' : '开始转动';
    }
    function draw() {
      const { start, target } = currentTask();
      const angle = start * 90 + direction * progress * 90;
      $('.rot-pointer').setAttribute('transform', `rotate(${angle} 340 220)`);
      $('.rot-trace').setAttribute('d', traceVisible ? arc(start * 90, direction * progress * 90, 151) : '');
      $('.rot-trace').setAttribute('stroke', direction === 1 ? '#147D77' : '#DC7754');
      const targetPoint = point(target * 90, 180);
      $('.rot-target').setAttribute('cx', targetPoint.x); $('.rot-target').setAttribute('cy', targetPoint.y);
      const near = Math.abs(progress - Math.round(progress)) < .025;
      const position = (start + direction * Math.round(progress) + 12) % 4;
      $('.rot-current').innerHTML = near ? `现在指向 <strong>${letters[position]}</strong>` : `${dirName()}转动中 · 中心保持不动`;
      for (const dir of [1, -1]) {
        const selector = dir === 1 ? '.rot-record-cw' : '.rot-record-ccw';
        const steps = ((target - start) * dir + 4) % 4;
        $(selector).setAttribute('d', traceVisible && records.has(key(dir)) ? arc(start * 90, dir * steps * 90, dir === 1 ? 159 : 165) : '');
      }
      updateButtons();
    }
    function updateRoutes() {
      for (const dir of [1, -1]) {
        const el = $(dir === 1 ? '.rot-route-cw' : '.rot-route-ccw');
        el.innerHTML = records.has(key(dir)) ? records.get(key(dir)).join(' → ') : '<em>完成一次转动后记录</em>';
      }
      $('.rot-comparison').textContent = records.has(key(1)) && records.has(key(-1))
        ? '两种方向都能到达同一个终点，但经过的位置和转动方向不同。'
        : '终点相同，转动的方向和经过的位置也相同吗？';
    }
    function finish() {
      if (completed) return;
      releaseDrag();
      completed = true; playing = false; animation = null;
      progress = totalSteps(); records.set(key(direction), route());
      const correct = letters[(currentTask().start + direction + 4) % 4];
      kit.feedback(feedback, `${prediction === correct ? '预测正确！' : `先到的是 ${correct}。`} ${dirName()}路线：${route().join(' → ')}。换个方向，看看有什么不同。`, prediction === correct ? 'success' : 'info');
      updateRoutes(); draw();
      if (records.has('0:1') && records.has('0:-1')) kit.markDone();
    }
    function moveTo(destination) {
      if (prediction === null) return;
      releaseDrag(); stopAnimation(); playing = true; tweenDestination = destination;
      const duration = (destination - progress) * (kit.reducedMotion ? 160 : slow ? 1600 : 850);
      animation = kit.tween(progress, destination, Math.max(80, duration), value => { progress = value; draw(); }, () => {
        animation = null; playing = false; progress = destination;
        if (progress >= totalSteps() - .001) finish();
        else { draw(); const at = letters[(currentTask().start + direction * Math.round(progress) + 12) % 4]; kit.feedback(feedback, `现在到达 ${at}。继续转，看看怎样到达终点。`); }
      });
      updateButtons();
    }
    function reset(clearPrediction = true) {
      releaseDrag(); stopAnimation(); progress = 0; completed = false;
      if (clearPrediction) prediction = null;
      $('.rot-question').textContent = `让指针从 ${letters[currentTask().start]} 转到 ${letters[currentTask().target]}`;
      $('.rot-prediction-label').textContent = `离开 ${letters[currentTask().start]} 后，先到哪一站？`;
      $('.rot-choices').innerHTML = letters.filter((_, index) => index !== currentTask().start).map(letter => `<button class="btn secondary${prediction === letter ? ' active' : ''}" data-predict="${letter}" aria-pressed="${prediction === letter}">${letter}</button>`).join('');
      kit.feedback(feedback, clearPrediction ? '选一选，再让指针动起来。' : '预测已经保留。再转一次，仔细观察。');
      updateRoutes(); draw();
    }
    kit.listen(root, 'click', event => {
      const button = event.target.closest('button'); if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-task')) {
        taskIndex = Number(button.dataset.task); reset();
        root.querySelectorAll('[data-task]').forEach(el => { const active = Number(el.dataset.task) === taskIndex; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
      } else if (button.hasAttribute('data-dir')) {
        direction = Number(button.dataset.dir); reset();
        root.querySelectorAll('[data-dir]').forEach(el => { const active = Number(el.dataset.dir) === direction; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
      } else if (button.hasAttribute('data-predict')) {
        if (playing || progress > 0) reset(false);
        prediction = button.dataset.predict;
        root.querySelectorAll('[data-predict]').forEach(el => { const active = el.dataset.predict === prediction; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
        const chosen = root.querySelector('[data-predict="' + prediction + '"]');
        if (chosen && chosen !== button) chosen.focus({ preventScroll: true });
        kit.feedback(feedback, `你预测先到 ${prediction}。开始转动来验证吧。`); updateButtons();
      }
    });
    kit.listen($('.rot-play'), 'click', () => {
      if (playing) { animation.pause(); playing = false; updateButtons(); return; }
      if (animation) { animation.resume(); playing = true; updateButtons(); return; }
      if (completed) reset(false);
      moveTo(totalSteps());
    });
    kit.listen($('.rot-step'), 'click', () => moveTo(Math.min(totalSteps(), Math.floor(progress + .01) + 1)));
    kit.listen($('.rot-reset'), 'click', () => reset());
    kit.listen($('.rot-slow'), 'change', event => { slow = event.target.checked; if (playing) moveTo(tweenDestination); else if (animation) { animation.cancel(); animation = null; updateButtons(); } });
    kit.listen($('.rot-show-trace'), 'change', event => { traceVisible = event.target.checked; draw(); });
    kit.listen($('.rot-show-reference'), 'change', event => { $('.rot-reference').hidden = !event.target.checked; });
    const pointerAngle = event => { const p = kit.svgPoint(svg, event); return Math.atan2(p.x - 340, 220 - p.y) * 180 / Math.PI; };
    kit.listen(svg, 'pointerdown', event => {
      if (!event.target.closest('[data-rot-handle]')) return;
      if (prediction === null) { kit.feedback(feedback, '先选择你预测会先到的位置，再拖动指针。'); return; }
      if (completed) reset(false);
      stopAnimation();
      drag = { id: event.pointerId, angleOffset: pointerAngle(event) - (currentTask().start * 90 + direction * progress * 90), warned: false };
      svg.setPointerCapture(event.pointerId); event.preventDefault(); updateButtons();
    });
    kit.listen(svg, 'pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      // Project the pointer onto the chosen directed arc. Rejected backward motions
      // cannot accumulate progress, and the hand stays at the actual pointer angle.
      const angle = pointerAngle(event) - drag.angleOffset;
      const candidate = (((angle - currentTask().start * 90) * direction % 360) + 360) % 360 / 90;
      if (candidate < progress - .025 || candidate > totalSteps() + .15) {
        if (!drag.warned) { kit.feedback(feedback, `当前选择${dirName()}，请沿这个方向拖动；也可以切换方向后重试。`); drag.warned = true; }
        return;
      }
      progress = Math.min(totalSteps(), Math.max(progress, candidate));
      draw(); if (progress >= totalSteps() - .025) { progress = totalSteps(); finish(); }
    });
    const endDrag = event => { if (drag && event.pointerId === drag.id) releaseDrag(); };
    kit.listen(svg, 'pointerup', endDrag); kit.listen(svg, 'pointercancel', endDrag); kit.listen(svg, 'lostpointercapture', endDrag);
    reset();
    return () => { releaseDrag(); stopAnimation(); };
  }
});
