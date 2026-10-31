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
        .rot-main{min-width:0}.rot-taskbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.rot-taskbar .chip{min-width:100px;min-height:44px;font-size:16px}
        .rot-stage{overflow:hidden;background:#F5F8F3;border-radius:12px}.rot-svg{display:block;width:100%;height:auto;max-width:430px;margin:0 auto;touch-action:none;user-select:none}.rot-svg text{font-family:inherit}
        .rot-grip{cursor:grab}.rot-grip:active{cursor:grabbing}.rot-current{text-align:center;margin:0;padding:0 12px 14px;color:#496960;font-size:16px;line-height:1.5}
        .rot-controls{margin-top:16px}.rot-play-help{margin:10px 0 0;color:#526D63;font-size:14px;line-height:1.6}.rot-display{margin-top:14px;border-top:1px solid #E1E8E0}.rot-display summary{display:flex;align-items:center;min-height:44px;cursor:pointer;color:#526D63;font-size:14px;font-weight:600;list-style:none}.rot-display summary::-webkit-details-marker{display:none}.rot-display summary::before{content:'＋';margin-right:8px}.rot-display[open] summary::before{content:'−'}
        .rot-options{display:flex;flex-wrap:wrap;gap:0 20px;font-size:14px;color:#4C6D66}.rot-options label{display:flex;min-height:44px;gap:9px;align-items:center;cursor:pointer}.rot-options input{accent-color:#147D77;width:18px;height:18px}
        .rot-direction{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 22px}.rot-direction button{min-height:56px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:16px;border:2px solid #DCE5DF;border-radius:10px;background:#fff;color:#3B5B54;cursor:pointer}.rot-direction button span{font-size:26px;line-height:1}.rot-direction button.active[data-dir="1"]{background:#E5F2ED;border-color:#147D77;color:#147D77}.rot-direction button.active[data-dir="-1"]{background:#FFF0E7;border-color:#D96C47;color:#A74F32}
        .rot-choices{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 18px}.rot-choices .btn{padding:10px;min-width:0;min-height:48px;font-size:20px}.rot-choices .btn.active{background:#E5F2ED;color:#0C5F5A;border-color:#147D77}
        .rot-card-heading{margin:0 0 8px;font-size:16px;line-height:1.5;color:#24463E}.rot-rule{border-top:1px solid #E1E8E0;margin-top:24px;padding-top:18px}.rot-routes{display:grid;gap:16px;margin-top:16px}.rot-route{padding-left:12px;border-left:3px solid #87B7A6}.rot-route:nth-child(2){border-color:#DF9C7D}.rot-route-label{display:block;font-size:14px;font-weight:600;color:#526D63;margin-bottom:5px}.rot-route strong{font-size:18px;letter-spacing:.025em;color:#245E51}.rot-route:nth-child(2) strong{color:#A45F3E}.rot-route em{font-size:14px;font-style:normal;font-weight:400;color:#60756B;letter-spacing:0}.rot-comparison{font-size:16px;line-height:1.65;color:#526D63;margin:18px 0 0}.rot-reference{font-size:14px;margin:8px 0 0;color:#526D63}.rot-reference[hidden]{display:none}.rot-note{margin:10px 0 14px;font-size:14px;line-height:1.65;color:#526D63}.rot-feedback{font-size:16px;min-height:0}.rot-next{width:100%;margin-top:14px;min-height:48px}
        .rot-rule summary{display:flex;align-items:center;min-height:44px;cursor:pointer;list-style:none;margin:0}.rot-rule summary::-webkit-details-marker{display:none}.rot-rule summary::before{content:'＋';margin-right:8px}.rot-rule[open] summary::before{content:'−'}
        @media(max-width:640px){.rot-taskbar{gap:7px}.rot-taskbar .chip{min-width:0;flex:1;padding-left:9px;padding-right:9px}.rot-direction button{min-height:56px}.rot-routes{gap:14px}}
        @media(min-width:1000px){
          :root[data-board-mode="whiteboard"] .rot-module .btn,:root[data-board-mode="whiteboard"] .rot-taskbar .chip{min-height:56px;font-size:20px;padding:14px 20px}
          :root[data-board-mode="whiteboard"] .rot-taskbar{gap:12px;margin-bottom:16px}
          :root[data-board-mode="whiteboard"] .rot-taskbar .chip{min-width:120px;font-size:22px}
          :root[data-board-mode="whiteboard"] .rot-svg{max-width:520px}
          :root[data-board-mode="whiteboard"] .rot-svg text{font-size:36px}
          :root[data-board-mode="whiteboard"] .rot-current{font-size:22px;padding-bottom:16px}
          :root[data-board-mode="whiteboard"] .rot-question{font-size:26px}
          :root[data-board-mode="whiteboard"] .rot-direction{gap:12px;margin-bottom:20px}
          :root[data-board-mode="whiteboard"] .rot-direction button{min-height:64px;font-size:22px}
          :root[data-board-mode="whiteboard"] .rot-direction button span{font-size:32px}
          :root[data-board-mode="whiteboard"] .rot-choices .btn{min-height:60px;font-size:28px}
          :root[data-board-mode="whiteboard"] .rot-card-heading,:root[data-board-mode="whiteboard"] .rot-play-help,:root[data-board-mode="whiteboard"] .rot-options,:root[data-board-mode="whiteboard"] .rot-reference,:root[data-board-mode="whiteboard"] .rot-note,:root[data-board-mode="whiteboard"] .rot-feedback,:root[data-board-mode="whiteboard"] .rot-route-label,:root[data-board-mode="whiteboard"] .rot-route em,:root[data-board-mode="whiteboard"] .rot-comparison{font-size:20px;line-height:1.55}
          :root[data-board-mode="whiteboard"] .rot-route strong{font-size:24px}
          :root[data-board-mode="whiteboard"] .rot-display summary,:root[data-board-mode="whiteboard"] .rot-rule summary{min-height:56px;font-size:20px}
          :root[data-board-mode="whiteboard"] .rot-options label{min-height:56px;gap:12px}
          :root[data-board-mode="whiteboard"] .rot-options input{width:24px;height:24px}
          :root[data-board-mode="whiteboard"] .rot-controls{gap:12px;margin-top:16px}
        }
      </style>
      <div class="module-layout rot-module">
        <div class="panel rot-main">
          <div class="rot-taskbar" role="group" aria-label="旋转任务">
            ${tasks.map((t, i) => `<button class="chip${i === 0 ? ' active' : ''}" data-task="${i}" aria-pressed="${i === 0}">${letters[t.start]} → ${letters[t.target]}</button>`).join('')}
          </div>
          <div class="rot-stage">
            <svg class="rot-svg" viewBox="125 0 430 445" role="img" aria-label="指针绕固定中心旋转的转盘，A在上、B在右、C在下、D在左">
              <defs><marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker><filter id="${prefix}-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#245E51" flood-opacity=".09"/></filter></defs>
              <circle cx="340" cy="220" r="146" fill="#fff" stroke="#DDE8E0" stroke-width="2" filter="url(#${prefix}-shadow)"/>
              ${tickMarks}
              <circle class="rot-target" cx="340" cy="390" r="25" fill="#FCE9CA"/>
              ${letters.map((letter, i) => { const p = point(i * 90, 180); return `<text x="${p.x}" y="${p.y + 10}" fill="#234B43" text-anchor="middle" font-size="30" font-weight="800">${letter}</text>`; }).join('')}
              <path class="rot-record-cw" fill="none" stroke="#99C8B2" stroke-width="5" stroke-linecap="round" opacity=".5"/>
              <path class="rot-record-ccw" fill="none" stroke="#E9B698" stroke-width="5" stroke-linecap="round" opacity=".5"/>
              <path class="rot-trace" fill="none" stroke="#147D77" stroke-width="8" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
              <g class="rot-pointer">
                <path d="M 333 235 L 331 115 Q 331 105 340 90 Q 349 105 349 115 L 347 235 Z" fill="#EE805C"/>
                <circle class="rot-grip" data-rot-handle="true" cx="340" cy="104" r="20" fill="#fff" fill-opacity=".02" stroke="transparent" stroke-width="10"/>
                <circle cx="340" cy="110" r="5" fill="#FFF0DF" pointer-events="none"/>
              </g>
              <circle cx="340" cy="220" r="14" fill="#244E44"/><circle cx="340" cy="220" r="5" fill="#E5EEE3"/>
            </svg>
            <div class="rot-current">现在指向 <strong>A</strong></div>
          </div>
          <div class="controls rot-controls">
            <button class="btn primary rot-predict-jump">先做预测</button>
            <button class="btn secondary rot-play" disabled aria-describedby="${prefix}-play-help">开始验证</button>
            <button class="btn secondary rot-step" disabled>转到下一站</button>
            <button class="btn ghost rot-reset">从起点重来</button>
          </div>
          <p id="${prefix}-play-help" class="rot-play-help">选好旋转方向，再预测下一站，即可开始验证。</p>
          <details class="rot-display"><summary>显示与速度</summary>
            <div class="rot-options">
              <label><input type="checkbox" class="rot-slow">慢速播放</label>
              <label><input type="checkbox" class="rot-show-trace" checked>显示轨迹</label>
              <label><input type="checkbox" class="rot-show-reference">钟面参照</label>
            </div>
            <div class="rot-reference" hidden>钟表的顺时针方向：12 → 3 → 6 → 9 → 12。</div>
            <p class="rot-note">中心保持固定。可拖动指针末端，也可点“转到下一站”。</p>
          </details>
        </div>
        <aside class="panel">
          <h3 class="panel-title rot-question">让指针从 A 转到 C</h3>
          <div class="rot-direction" role="group" aria-label="旋转方向">
            <button data-dir="1" class="active" aria-pressed="true"><span aria-hidden="true">↻</span>顺时针</button>
            <button data-dir="-1" aria-pressed="false"><span aria-hidden="true">↺</span>逆时针</button>
          </div>
          <h4 class="rot-card-heading rot-prediction-label" tabindex="-1">离开 A 后，先到哪一站？</h4>
          <div class="rot-choices" role="group" aria-label="预测先到的位置"></div>
          <div class="feedback rot-feedback" role="status" aria-live="polite">选一选，再让指针动起来。</div>
          <button class="btn primary rot-next" hidden>再试另一方向</button>
          <details class="rot-rule">
            <summary class="rot-card-heading">路线对照</summary>
            <div class="rot-routes">
              <div class="rot-route"><span class="rot-route-label">↻ 顺时针</span><strong class="rot-route-cw"><em>尚未验证</em></strong></div>
              <div class="rot-route"><span class="rot-route-label">↺ 逆时针</span><strong class="rot-route-ccw"><em>尚未验证</em></strong></div>
            </div>
            <p class="rot-comparison">终点相同，转动的方向和经过的位置也相同吗？</p>
          </details>
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
    function pauseActivity() { releaseDrag(); if (animation) animation.pause(); playing = false; draw(); }
    function focusPrediction() {
      const heading = $('.rot-prediction-label'); heading.focus({ preventScroll: true });
      if (heading.scrollIntoView) heading.scrollIntoView({ block: 'nearest' });
    }
    function updateButtons() {
      const ready = prediction !== null;
      $('.rot-play').disabled = prediction === null;
      $('.rot-step').disabled = prediction === null || playing || completed;
      $('.rot-play').textContent = playing ? '暂停转动' : completed ? '重播这条路线' : animation || progress > 0 ? '继续验证' : '开始验证';
      $('.rot-play').classList.toggle('primary', ready && !completed);
      $('.rot-play').classList.toggle('secondary', !ready || completed);
      $('.rot-predict-jump').hidden = ready;
      $('.rot-next').hidden = !completed;
      const nextTask = tasks[(taskIndex + 1) % tasks.length];
      $('.rot-next').textContent = records.has(key(-direction)) ? `${taskIndex === tasks.length - 1 ? '再练' : '下一组'}：${letters[nextTask.start]} → ${letters[nextTask.target]}` : '再试另一方向';
      $('.rot-play-help').textContent = !ready ? '先选择旋转方向，并预测下一站，才能开始验证。'
        : completed ? '已到达终点。可以比较另一方向，也可以重播这条路线。'
        : playing ? '指针正在绕固定中心转动，随时可以暂停。'
        : progress > 0 ? '进度已保留。继续验证或点“转到下一站”。'
        : '预测已记录。点“开始验证”，也可以逐站观察或拖动指针。';
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
      $('.rot-current').innerHTML = near ? `现在指向 <strong>${letters[position]}</strong> · 中心固定` : `${playing || drag ? dirName() + '转动中' : '已暂停'} · 中心固定`;
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
        el.innerHTML = records.has(key(dir)) ? records.get(key(dir)).join(' → ') : '<em>尚未验证</em>';
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
      kit.feedback(feedback, `${prediction === correct ? '预测正确！' : `你预测 ${prediction}，实际先到 ${correct}。`} ${dirName()}路线：${route().join(' → ')}。`, prediction === correct ? 'success' : 'info');
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
      root.querySelectorAll('[data-task]').forEach(el => { const active = Number(el.dataset.task) === taskIndex; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
      root.querySelectorAll('[data-dir]').forEach(el => { const active = Number(el.dataset.dir) === direction; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
      kit.feedback(feedback, clearPrediction ? '选择下一站，记录你的预测。' : '预测已经保留。再转一次，仔细观察。');
      updateRoutes(); draw();
    }
    kit.listen(root, 'click', event => {
      const button = event.target.closest('button'); if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-task')) {
        if (taskIndex === Number(button.dataset.task)) return;
        taskIndex = Number(button.dataset.task); reset();
      } else if (button.hasAttribute('data-dir')) {
        if (direction === Number(button.dataset.dir)) return;
        direction = Number(button.dataset.dir); reset();
      } else if (button.hasAttribute('data-predict')) {
        if (playing || progress > 0) reset(false);
        prediction = button.dataset.predict;
        root.querySelectorAll('[data-predict]').forEach(el => { const active = el.dataset.predict === prediction; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
        const chosen = root.querySelector('[data-predict="' + prediction + '"]');
        if (chosen && chosen !== button) chosen.focus({ preventScroll: true });
        kit.feedback(feedback, `你预测先到 ${prediction}。点“开始验证”来观察。`); updateButtons();
      }
    });
    kit.listen($('.rot-play'), 'click', () => {
      if (playing) { pauseActivity(); return; }
      if (animation) { animation.resume(); playing = true; draw(); return; }
      if (completed) reset(false);
      moveTo(totalSteps());
    });
    kit.listen($('.rot-step'), 'click', () => moveTo(Math.min(totalSteps(), Math.floor(progress + .01) + 1)));
    kit.listen($('.rot-predict-jump'), 'click', focusPrediction);
    kit.listen($('.rot-next'), 'click', () => {
      if (!completed) return;
      if (!records.has(key(-direction))) direction *= -1;
      else { taskIndex = (taskIndex + 1) % tasks.length; direction = 1; }
      reset(); focusPrediction();
    });
    kit.listen($('.rot-reset'), 'click', () => reset());
    kit.listen($('.rot-slow'), 'change', event => {
      slow = event.target.checked;
      if (animation) { const wasPlaying = playing; moveTo(tweenDestination); if (!wasPlaying) pauseActivity(); }
    });
    kit.listen($('.rot-show-trace'), 'change', event => { traceVisible = event.target.checked; draw(); });
    kit.listen($('.rot-show-reference'), 'change', event => { $('.rot-reference').hidden = !event.target.checked; });
    const pointerAngle = event => { const p = kit.svgPoint(svg, event); return Math.atan2(p.x - 340, 220 - p.y) * 180 / Math.PI; };
    kit.listen(svg, 'pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      if (drag) return;
      if (!event.target.closest('[data-rot-handle]')) return;
      if (prediction === null) { kit.feedback(feedback, '先选择你预测会先到的位置，再拖动指针。'); return; }
      if (completed) reset(false);
      stopAnimation();
      drag = { id: event.pointerId, lastAngle: pointerAngle(event), signedDegrees: 0, startProgress: progress, warned: false };
      svg.setPointerCapture(event.pointerId); event.preventDefault(); updateButtons();
    });
    kit.listen(svg, 'pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      // Unwrap successive samples before applying the selected direction. Always
      // update the sample, even for a rejected reverse motion: -170 degrees must
      // never be reinterpreted as +190 degrees after crossing the half-circle.
      // Keeping signed displacement also prevents back-and-forth motion from
      // accumulating extra progress while the pointer is held at its furthest point.
      const angle = pointerAngle(event);
      const delta = ((angle - drag.lastAngle + 540) % 360) - 180;
      drag.lastAngle = angle;
      if (Math.abs(delta) >= 179.9) {
        kit.feedback(feedback, '这一步跨得太远，方向不清楚。请松手，再沿圆周慢慢拖动指针。');
        releaseDrag(); draw(); return;
      }
      const directedDelta = delta * direction;
      drag.signedDegrees += directedDelta;
      const candidate = drag.startProgress + drag.signedDegrees / 90;
      if (directedDelta < -.01 || candidate < progress - .025) {
        if (!drag.warned) { kit.feedback(feedback, `当前选择${dirName()}，请沿这个方向拖动；也可以切换方向后重试。`); drag.warned = true; }
        return;
      }
      progress = Math.min(totalSteps(), Math.max(progress, candidate));
      draw(); if (progress >= totalSteps() - .025) { progress = totalSteps(); finish(); }
    });
    const endDrag = event => { if (drag && event.pointerId === drag.id) { releaseDrag(); draw(); } };
    kit.listen(svg, 'pointerup', endDrag); kit.listen(svg, 'pointercancel', endDrag); kit.listen(svg, 'lostpointercapture', endDrag);
    reset();
    return { pause: pauseActivity, destroy() { releaseDrag(); stopAnimation(); } };
  }
});
