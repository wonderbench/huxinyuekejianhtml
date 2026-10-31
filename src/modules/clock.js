Courseware.register({
  id: 'clock',
  number: 5,
  title: '分针计时',
  subtitle: '数一数经过的时间',
  icon: 'clock',
  mount(root, kit) {
    const prefix = kit.uid('ck');
    let target = 3, minutes = 0, prediction = null, animation = null, playing = false;
    let slow = false, showMinutes = false, showTrace = true, completed = false, tweenDestination = 0;
    const seen = new Set();
    const center = { x: 330, y: 225 };
    const point = (angle, radius) => ({ x: center.x + Math.sin(angle * Math.PI / 180) * radius, y: center.y - Math.cos(angle * Math.PI / 180) * radius });
    const arc = (angle, radius) => {
      if (angle < .02) return '';
      const a = point(0, radius), b = point(angle, radius);
      return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
    };
    const ticks = Array.from({ length: 60 }, (_, index) => {
      const a = point(index * 6, index % 5 === 0 ? 136 : 144), b = point(index * 6, 151);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${index % 5 === 0 ? '#6B9588' : '#D8E4DB'}" stroke-width="${index % 5 === 0 ? 3 : 1.5}" stroke-linecap="round"/>`;
    }).join('');
    root.innerHTML = `
      <style>
        .ck-main{min-width:0}.ck-presets{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.ck-presets-label{font-size:14px;color:#526D63;margin-right:2px}.ck-presets .chip{min-width:48px;min-height:44px;font-size:16px}.ck-random{margin-left:auto;font-size:14px;min-height:44px}
        .ck-stage{overflow:hidden;background:#F5F8F3;border-radius:12px}.ck-svg{display:block;width:100%;height:auto;max-width:444px;margin:0 auto}.ck-svg text{font-family:inherit}.ck-direction-label{text-align:center;color:#526D63;font-size:14px;padding:0 16px 14px;line-height:1.6}
        .ck-metrics{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0 0;padding:14px 0;border-top:1px solid #E1E8E0}.ck-metric span{display:block;font-size:14px;color:#526D63;margin-bottom:4px}.ck-metric strong{display:block;font-size:22px;font-weight:750;color:#285546}.ck-metric strong.ck-muted{font-size:16px;line-height:33px;color:#60756B;font-weight:400}.ck-metric:last-child strong:not(.ck-muted){color:#A7602E}
        .ck-play-help{margin:10px 0 0;color:#526D63;font-size:14px;line-height:1.6}.ck-display{border-top:1px solid #E1E8E0}.ck-display summary{display:flex;align-items:center;min-height:44px;cursor:pointer;color:#526D63;font-size:14px;font-weight:600;list-style:none}.ck-display summary::-webkit-details-marker{display:none}.ck-display summary::before{content:'＋';margin-right:8px}.ck-display[open] summary::before{content:'−'}.ck-options{display:flex;gap:0 20px;flex-wrap:wrap;color:#526D63;font-size:14px}.ck-options label{display:flex;align-items:center;min-height:44px;gap:9px;cursor:pointer}.ck-options input{width:18px;height:18px;accent-color:#147D77}
        .ck-rule{margin:14px 0 20px;color:#526D63;font-size:16px;line-height:1.6}.ck-answer-label{display:block;font-weight:700;font-size:16px;color:#355B4A;margin:20px 0 10px}.ck-answer-row{display:flex;gap:10px;align-items:center;margin-bottom:12px}.ck-answer-row input{box-sizing:border-box;width:100%;min-width:0;border:1.5px solid #A8BFB0;border-radius:10px;font-family:inherit;font-size:24px;font-weight:600;line-height:1.4;padding:12px 13px;color:#244D3D;background:#fff;min-height:52px}.ck-answer-row input:focus{outline:3px solid #DFEEDB;border-color:#147D77}.ck-answer-row span{font-size:16px;white-space:nowrap;color:#526D63}.ck-submit,.ck-next{width:100%;min-height:48px}.ck-feedback{margin-top:18px;min-height:0;font-size:16px}.ck-next{margin-top:14px}.ck-question{line-height:1.65}.ck-question strong{color:#9C631F}.ck-note{font-size:14px;color:#526D63;line-height:1.65;margin:8px 0 14px}.ck-record{border-top:1px solid #E1E8E0;margin-top:24px;padding-top:18px}.ck-record h4{font-size:16px;margin:0 0 12px;color:#3B5F4E}.ck-record-items{display:flex;flex-direction:column;gap:8px}.ck-record-items span{color:#526D63;font-size:14px}.ck-record-empty{color:#60756B;font-size:14px;font-style:normal}.ck-large-step{font-size:24px;fill:#607C56}
        .ck-record summary{display:flex;align-items:center;min-height:44px;cursor:pointer;list-style:none;font-size:16px;font-weight:600;color:#3B5F4E}.ck-record summary::-webkit-details-marker{display:none}.ck-record summary::before{content:'＋';margin-right:8px}.ck-record[open] summary::before{content:'−'}.ck-record[open] .ck-record-items{margin-top:12px}
        .ck-predict-steps{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 12px}.ck-predict-steps .btn{min-height:56px;font-size:16px}
        @media(max-width:640px){.ck-presets{gap:7px}.ck-presets .chip{min-width:44px;padding-left:9px;padding-right:9px}.ck-random{margin-left:0}.ck-metrics{gap:12px}.ck-direction-label{padding-left:12px;padding-right:12px}}
        @media(min-width:1000px){
          :root[data-board-mode="whiteboard"] .ck-module .btn,:root[data-board-mode="whiteboard"] .ck-presets .chip{min-height:56px;font-size:20px;padding:14px 20px}
          :root[data-board-mode="whiteboard"] .ck-presets{gap:12px;margin-bottom:16px}
          :root[data-board-mode="whiteboard"] .ck-presets .chip{min-width:60px;font-size:24px}
          :root[data-board-mode="whiteboard"] .ck-svg{max-width:520px}
          :root[data-board-mode="whiteboard"] .ck-svg [data-number]{font-size:36px}
          :root[data-board-mode="whiteboard"] .ck-module .panel-title{font-size:26px}
          :root[data-board-mode="whiteboard"] .ck-question{font-size:24px;line-height:1.55}
          :root[data-board-mode="whiteboard"] .ck-presets-label,:root[data-board-mode="whiteboard"] .ck-direction-label,:root[data-board-mode="whiteboard"] .ck-rule,:root[data-board-mode="whiteboard"] .ck-answer-label,:root[data-board-mode="whiteboard"] .ck-answer-row span,:root[data-board-mode="whiteboard"] .ck-feedback,:root[data-board-mode="whiteboard"] .ck-play-help,:root[data-board-mode="whiteboard"] .ck-options,:root[data-board-mode="whiteboard"] .ck-note,:root[data-board-mode="whiteboard"] .ck-record-items span,:root[data-board-mode="whiteboard"] .ck-record-empty{font-size:20px;line-height:1.55}
          :root[data-board-mode="whiteboard"] .ck-answer-row input{min-height:64px;font-size:32px}
          :root[data-board-mode="whiteboard"] .ck-metric span{font-size:20px}
          :root[data-board-mode="whiteboard"] .ck-metric strong{font-size:30px}
          :root[data-board-mode="whiteboard"] .ck-metric strong.ck-muted{font-size:20px;line-height:45px}
          :root[data-board-mode="whiteboard"] .ck-display summary,:root[data-board-mode="whiteboard"] .ck-record summary{min-height:56px;font-size:20px}
          :root[data-board-mode="whiteboard"] .ck-options label{min-height:56px;gap:12px}
          :root[data-board-mode="whiteboard"] .ck-options input{width:24px;height:24px}
          :root[data-board-mode="whiteboard"] .ck-module .controls{gap:12px;margin-top:16px}
        }
      </style>
      <div class="module-layout ck-module">
        <div class="panel ck-main">
          <div class="ck-presets" role="group" aria-label="选择分针目标位置">
            <span class="ck-presets-label">转到</span>
            ${[1, 3, 4, 10].map(n => `<button class="chip${n === 3 ? ' active' : ''}" data-target="${n}" aria-pressed="${n === 3}">${n}</button>`).join('')}
            <button class="btn ghost ck-random">随机题</button>
          </div>
          <div class="ck-stage">
            <svg class="ck-svg" viewBox="108 0 444 455" role="img" aria-label="只显示分针的示意钟面，分针从12顺时针旋转到指定数字">
              <defs><filter id="${prefix}-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#325E43" flood-opacity=".1"/></filter><marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#94B58A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
              <circle cx="330" cy="225" r="165" fill="#FFF" stroke="#D9E5D7" stroke-width="2" filter="url(#${prefix}-shadow)"/>
              <path class="ck-sector" fill="#EDF5E4" opacity=".9"/>
              <circle cx="330" cy="225" r="157" fill="none" stroke="#F0F4EA" stroke-width="9"/>
              <path class="ck-trace" fill="none" stroke="#7BA96A" stroke-width="9" stroke-linecap="round"/>
              ${ticks}
              <circle class="ck-target" cx="446" cy="225" r="22" fill="#F8E3B8"/>
              ${Array.from({ length: 12 }, (_, i) => { const p = point(i * 30, 116); return `<text data-number="${i || 12}" x="${p.x}" y="${p.y + 10}" text-anchor="middle" fill="#46624A" font-size="30" font-weight="650">${i || 12}</text>`; }).join('')}
              <g class="ck-five-labels">${Array.from({ length: 11 }, (_, i) => { const n = i + 1, p = point(n * 30, 188); return `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" class="ck-large-step">${n * 5}分</text>`; }).join('')}</g>
              <path d="M 380 33 A 199 199 0 0 1 436 59" fill="none" stroke="#94B58A" stroke-width="2" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
              <g class="ck-hand"><path d="M 324 242 L 325 122 Q 325 113 330 102 Q 335 113 335 122 L 336 242 Z" fill="#ED815B"/><circle cx="330" cy="119" r="4" fill="#FFEADB"/></g>
              <circle cx="330" cy="225" r="12" fill="#365E45"/><circle cx="330" cy="225" r="4" fill="#DFEBCF"/>
            </svg>
            <div class="ck-direction-label">分针示意图 · 从12顺时针出发<br>一圈以内，第一次到达目标就停下</div>
          </div>
          <div class="controls">
            <button class="btn secondary ck-play" disabled aria-describedby="${prefix}-play-help">开始验证</button>
            <button class="btn secondary ck-step" disabled>走一大格</button>
            <button class="btn ghost ck-reset">从 12 重来</button>
          </div>
          <p id="${prefix}-play-help" class="ck-play-help">先填写并提交预测，才能开始验证。</p>
          <div class="ck-metrics">
            <div class="ck-metric"><span>已走大格</span><strong class="ck-count ck-muted">暂时隐藏</strong></div>
            <div class="ck-metric"><span>经过时间</span><strong class="ck-time ck-muted">暂时隐藏</strong></div>
          </div>
          <details class="ck-display"><summary>显示与速度</summary>
            <div class="ck-options">
              <label><input type="checkbox" class="ck-slow">慢速播放</label>
              <label><input type="checkbox" class="ck-show-minutes">显示计时提示</label>
              <label><input type="checkbox" class="ck-show-trace" checked>显示轨迹</label>
            </div>
            <p class="ck-note">隐藏计时提示时，自己数一数分针走了几个大格。</p>
          </details>
        </div>
        <aside class="panel">
          <h3 class="panel-title">分针走了多久？</h3>
          <p class="prompt ck-question">从 12 顺时针转到 <strong class="ck-target-label">3</strong>，经过多少分钟？</p>
          <p class="ck-rule">每走一大格，经过 <strong>5 分钟</strong>。</p>
          <form class="ck-form" novalidate>
            <label class="ck-answer-label" for="${prefix}-answer">我的预测</label>
            <div class="ck-answer-row"><input id="${prefix}-answer" type="number" inputmode="numeric" min="0" max="60" step="1" placeholder="填一个数" required aria-describedby="${prefix}-answer-hint"><span>分钟</span></div>
            <div class="ck-predict-steps" role="group" aria-label="调整预测分钟数，不自动提交">
              <button type="button" class="btn secondary" data-prediction-step="-5" aria-label="预测减少5分钟，最少0分钟">−5 分钟</button>
              <button type="button" class="btn secondary" data-prediction-step="5" aria-label="预测增加5分钟，最多60分钟">+5 分钟</button>
            </div>
            <span class="sr-only" id="${prefix}-answer-hint">请输入0到60之间的整数分钟。</span>
            <button type="submit" class="btn primary ck-submit">提交预测</button>
          </form>
          <div class="feedback ck-feedback" role="status" aria-live="polite">先填入你的预测，再让分针走一走。</div>
          <button class="btn primary ck-next" hidden>下一题</button>
          <details class="ck-record"><summary>观察记录</summary><div class="ck-record-items"><em class="ck-record-empty">完成后，记录会出现在这里。</em></div></details>
        </aside>
      </div>`;
    const $ = selector => root.querySelector(selector);
    const input = $('.ck-answer-row input'), feedback = $('.ck-feedback');
    const targetMinutes = () => target * 5;
    const predictionChanged = () => prediction !== null && (input.value.trim() === '' || Number(input.value) !== prediction);
    const ready = () => prediction !== null && !predictionChanged();
    function stopAnimation() { if (animation) animation.cancel(); animation = null; playing = false; }
    function pauseActivity() { if (animation) animation.pause(); playing = false; draw(); }
    function focusControl(el) { el.focus({ preventScroll: true }); if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }
    function updateButtons() {
      const canVerify = ready(), needsSubmission = !canVerify;
      $('.ck-play').disabled = !canVerify;
      $('.ck-step').disabled = !canVerify || playing || completed;
      $('.ck-play').textContent = playing ? '暂停转动' : completed ? '重看数格过程' : animation || minutes > 0 ? '继续验证' : '开始验证';
      $('.ck-play').classList.toggle('primary', canVerify && !completed);
      $('.ck-play').classList.toggle('secondary', !canVerify || completed);
      $('.ck-submit').classList.toggle('primary', needsSubmission);
      $('.ck-submit').classList.toggle('secondary', !needsSubmission);
      $('.ck-submit').disabled = !needsSubmission;
      $('.ck-submit').textContent = prediction === null ? '提交预测' : predictionChanged() ? completed ? '检查修改后的答案' : '更新预测' : completed ? '答案已核对' : '预测已提交';
      $('.ck-next').hidden = !completed;
      $('.ck-next').classList.toggle('primary', canVerify);
      $('.ck-next').classList.toggle('secondary', !canVerify);
      $('.ck-play-help').textContent = prediction === null ? '先填写并提交预测，才能开始验证。'
        : predictionChanged() ? '预测有修改，请重新提交后继续验证。'
        : completed ? '已到达目标。可以选下一题，也可以重看数格过程。'
        : playing ? '分针正在顺时针转动，随时可以暂停。'
        : minutes > 0 ? '进度已保留。继续验证或点“走一大格”。'
        : '预测已记录。点“开始验证”，也可以每次走一大格。';
    }
    function draw() {
      const angle = minutes * 6;
      $('.ck-hand').setAttribute('transform', `rotate(${angle} 330 225)`);
      $('.ck-trace').setAttribute('d', showTrace ? arc(angle, 157) : '');
      const end = point(angle, 132);
      $('.ck-sector').setAttribute('d', showTrace && angle > .01 ? `M 330 225 L 330 93 A 132 132 0 ${angle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z` : '');
      const p = point(target * 30, 116); $('.ck-target').setAttribute('cx', p.x); $('.ck-target').setAttribute('cy', p.y);
      $('.ck-five-labels').setAttribute('visibility', showMinutes ? 'visible' : 'hidden');
      const reveal = showMinutes || completed;
      $('.ck-count').classList.toggle('ck-muted', !reveal); $('.ck-time').classList.toggle('ck-muted', !reveal);
      $('.ck-count').textContent = reveal ? `${Math.floor((minutes + .001) / 5)} 格` : '暂时隐藏';
      $('.ck-time').textContent = reveal ? `${Math.floor(minutes + .001)} 分钟` : '暂时隐藏';
      $('.ck-target-label').textContent = target;
      root.querySelectorAll('[data-number]').forEach(el => { const active = Number(el.dataset.number) === target; el.setAttribute('fill', active ? '#9E6524' : '#46624A'); el.setAttribute('font-weight', active ? '800' : '650'); });
      root.querySelectorAll('[data-target]').forEach(el => { const active = Number(el.dataset.target) === target; el.classList.toggle('active', active); el.setAttribute('aria-pressed', String(active)); });
      updateButtons();
    }
    function showResult() {
      const correct = prediction === targetMinutes();
      kit.feedback(feedback, `${correct ? '预测正确！' : `你预测 ${prediction} 分钟。`} 分针走了 ${target} 个大格，每格 5 分钟，一共 ${targetMinutes()} 分钟。${correct ? '' : '可以修改答案后再检查，或重播数格过程。'}`, correct ? 'success' : 'info');
      if (correct) kit.markDone();
    }
    function finish() {
      completed = true; minutes = targetMinutes(); animation = null; playing = false; seen.add(target);
      $('.ck-record-items').innerHTML = [...seen].sort((a, b) => a - b).map(n => `<span>12 → ${n}：${n * 5} 分钟</span>`).join('');
      showResult(); draw();
    }
    function moveTo(destination) {
      if (prediction === null) return;
      stopAnimation(); playing = true; tweenDestination = destination;
      const duration = (destination - minutes) / 5 * (kit.reducedMotion ? 160 : slow ? 1300 : 700);
      animation = kit.tween(minutes, destination, Math.max(80, duration), value => { minutes = value; draw(); }, () => {
        animation = null; playing = false; minutes = destination;
        if (minutes >= targetMinutes() - .001) finish();
        else { draw(); kit.feedback(feedback, showMinutes ? `现在走了 ${Math.round(minutes / 5)} 个大格，经过 ${Math.round(minutes)} 分钟。继续观察。` : '分针又走完一大格。记住走了几格，继续观察。'); }
      });
      updateButtons();
    }
    function reset(clearPrediction = false) {
      stopAnimation(); minutes = 0; completed = false;
      if (clearPrediction) { prediction = null; input.value = ''; input.setAttribute('aria-invalid', 'false'); }
      kit.feedback(feedback, prediction === null ? '填入预计分钟数，再提交预测。' : `已保留你的预测：${prediction} 分钟。分针回到 12，可以再观察一次。`);
      draw();
    }
    function selectTarget(value) { if (target === value) return; target = value; reset(true); }
    function nextQuestion() {
      const options = Array.from({ length: 11 }, (_, i) => i + 1).filter(n => n !== target);
      selectTarget(options[Math.floor(Math.random() * options.length)]); focusControl(input);
    }
    kit.listen($('.ck-form'), 'submit', event => {
      event.preventDefault();
      const raw = input.value.trim(), value = Number(raw);
      if (!raw || !Number.isInteger(value) || value < 0 || value > 60) { pauseActivity(); input.setAttribute('aria-invalid', 'true'); kit.feedback(feedback, '请填 0 到 60 之间的整数分钟，例如 15，再提交。', 'error'); input.focus(); return; }
      prediction = value;
      input.setAttribute('aria-invalid', 'false');
      if (completed) showResult();
      else kit.feedback(feedback, `预测已记录：${prediction} 分钟。点“${minutes > 0 ? '继续验证' : '开始验证'}”来观察。`);
      updateButtons();
      if (!completed) focusControl($('.ck-play'));
    });
    function onPredictionInput() {
      if (playing) pauseActivity();
      input.setAttribute('aria-invalid', 'false');
      if (predictionChanged()) kit.feedback(feedback, '预测有修改，重新提交后可继续验证。');
      updateButtons();
    }
    kit.listen(input, 'input', onPredictionInput);
    root.querySelectorAll('[data-prediction-step]').forEach(button => {
      kit.listen(button, 'click', () => {
        const value = Number(input.value), base = Number.isFinite(value) ? Math.round(value) : 0;
        const next = Math.max(0, Math.min(60, base + Number(button.dataset.predictionStep)));
        input.value = String(next); onPredictionInput();
        kit.feedback(feedback, `当前预测：${next} 分钟。${prediction === null ? '提交预测后再验证。' : predictionChanged() ? '重新提交后可继续验证。' : '与已提交预测相同，可以继续验证。'}`);
      });
    });
    kit.listen(root, 'click', event => {
      const button = event.target.closest('[data-target]'); if (button && root.contains(button)) selectTarget(Number(button.dataset.target));
    });
    kit.listen($('.ck-random'), 'click', nextQuestion);
    kit.listen($('.ck-next'), 'click', nextQuestion);
    kit.listen($('.ck-play'), 'click', () => {
      if (!ready()) return;
      if (playing) { pauseActivity(); return; }
      if (animation) { animation.resume(); playing = true; updateButtons(); return; }
      if (completed) reset(false);
      moveTo(targetMinutes());
    });
    kit.listen($('.ck-step'), 'click', () => { if (ready() && !playing && !completed) moveTo(Math.min(targetMinutes(), (Math.floor(minutes / 5 + .001) + 1) * 5)); });
    kit.listen($('.ck-reset'), 'click', () => reset(false));
    kit.listen($('.ck-slow'), 'change', event => {
      slow = event.target.checked;
      if (animation) { const wasPlaying = playing; moveTo(tweenDestination); if (!wasPlaying) pauseActivity(); }
    });
    kit.listen($('.ck-show-minutes'), 'change', event => { showMinutes = event.target.checked; draw(); });
    kit.listen($('.ck-show-trace'), 'change', event => { showTrace = event.target.checked; draw(); });
    reset(true);
    return { pause: pauseActivity, destroy: stopAnimation };
  }
});
