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
        .ck-main{min-width:0}.ck-presets{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:18px}.ck-presets-label{font-size:13px;color:#71887D;margin-right:2px}.ck-presets .chip{min-width:52px}.ck-random{margin-left:auto}
        .ck-stage{position:relative;overflow:hidden;border:1px solid #DFE9E3;background:radial-gradient(circle at 50% 45%,#fff 0,#F6F8F0 75%);border-radius:22px}.ck-svg{display:block;width:100%;max-height:480px}.ck-svg text{font-family:inherit}.ck-stage-label{position:absolute;top:17px;left:18px;font-size:12px;color:#6C8376;font-weight:600}.ck-stage-label i{display:inline-block;width:7px;height:7px;background:#147D77;border-radius:50%;margin-right:7px}.ck-direction-label{text-align:center;color:#6F8779;font-size:13px;padding:0 16px 16px;line-height:1.6}
        .ck-target-number{font-weight:800}.ck-metrics{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0}.ck-metric{background:#F3F6EF;border:1px solid #E7ECE1;border-radius:13px;padding:13px 10px;text-align:center}.ck-metric span{display:block;font-size:11px;color:#7A8D7E;margin-bottom:5px}.ck-metric strong{display:block;font-size:21px;font-weight:750;color:#285546}.ck-metric strong.ck-muted{font-size:14px;line-height:25px;color:#93A095;font-weight:500}.ck-metric:last-child{background:#FFF4E7;border-color:#F4E5D1}.ck-metric:last-child strong{color:#B66C36}
        .ck-options{display:flex;gap:14px 20px;flex-wrap:wrap;margin-top:18px;color:#567264;font-size:13px}.ck-options label{display:flex;align-items:center;gap:8px;cursor:pointer}.ck-options input{width:16px;height:16px;accent-color:#147D77}.ck-rule-box{border-radius:14px;background:#F2F6EE;padding:15px 16px;margin:18px 0;display:flex;gap:12px;align-items:center;color:#4C6D5E}.ck-rule-icon{display:grid;place-items:center;flex:0 0 43px;height:43px;border-radius:50%;background:#E0ECD8;font-size:23px;color:#588346}.ck-rule-box strong{display:block;font-size:14px;margin-bottom:3px}.ck-rule-box small{font-size:12px;line-height:1.6}.ck-answer-label{display:block;font-weight:700;font-size:14px;color:#355B4A;margin:20px 0 10px}.ck-answer-row{display:flex;gap:10px;align-items:center;margin-bottom:12px}.ck-answer-row input{box-sizing:border-box;width:100%;min-width:0;border:1.5px solid #CDDCCF;border-radius:12px;font-family:inherit;font-size:23px;font-weight:600;line-height:1.4;padding:12px 13px;color:#244D3D;background:#fff;min-height:52px}.ck-answer-row input:focus{outline:3px solid #DFEEDB;border-color:#147D77}.ck-answer-row span{font-size:14px;white-space:nowrap;color:#6A8070}.ck-submit{width:100%}.ck-feedback{margin-top:16px;min-height:86px}.ck-question{line-height:1.6}.ck-question strong{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;background:#F7E1B6;color:#9C631F;border-radius:9px;padding:0 5px}.ck-note{font-size:12px;color:#788A7C;line-height:1.7;margin:16px 0 0}.ck-record{border-top:1px solid #E7EDE3;margin-top:24px;padding-top:19px}.ck-record h4{font-size:14px;margin:0 0 11px;color:#3B5F4E}.ck-record-items{display:flex;flex-wrap:wrap;gap:6px}.ck-record-items span{background:#E9F2E3;color:#527447;padding:5px 8px;border-radius:7px;font-size:11px}.ck-record-empty{color:#91A08F;font-size:12px}.ck-large-step{font-size:11px;fill:#95A78F}
        @media(max-width:640px){.ck-presets{gap:7px}.ck-presets .chip{min-width:42px;padding-left:9px;padding-right:9px}.ck-random{margin-left:0}.ck-metrics{gap:7px}.ck-metric{padding:11px 5px}.ck-metric strong{font-size:18px}.ck-stage-label{font-size:10px;top:12px}.ck-direction-label{font-size:11px;bottom:9px}.ck-options{font-size:12px}.ck-svg{min-height:290px}}
      </style>
      <div class="module-layout">
        <div class="panel ck-main">
          <div class="ck-presets" role="group" aria-label="选择分针目标位置">
            <span class="ck-presets-label">转到</span>
            ${[1, 3, 4, 10].map(n => `<button class="chip${n === 3 ? ' active' : ''}" data-target="${n}" aria-pressed="${n === 3}">${n}</button>`).join('')}
            <button class="btn ghost ck-random">换一题</button>
          </div>
          <div class="ck-stage">
            <div class="ck-stage-label"><i></i>分针示意图 · 只观察分针</div>
            <svg class="ck-svg" viewBox="0 0 660 450" role="img" aria-label="分针从12顺时针旋转到指定数字的示意钟面">
              <defs><filter id="${prefix}-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#325E43" flood-opacity=".1"/></filter><marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#94B58A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
              <circle cx="330" cy="225" r="165" fill="#FFF" stroke="#D9E5D7" stroke-width="2" filter="url(#${prefix}-shadow)"/>
              <path class="ck-sector" fill="#EDF5E4" opacity=".9"/>
              <circle cx="330" cy="225" r="157" fill="none" stroke="#F0F4EA" stroke-width="9"/>
              <path class="ck-trace" fill="none" stroke="#7BA96A" stroke-width="9" stroke-linecap="round"/>
              ${ticks}
              <circle class="ck-target" cx="446" cy="225" r="22" fill="#F8E3B8"/>
              ${Array.from({ length: 12 }, (_, i) => { const p = point(i * 30, 116); return `<text data-number="${i || 12}" x="${p.x}" y="${p.y + 8}" text-anchor="middle" fill="#46624A" font-size="24" font-weight="650">${i || 12}</text>`; }).join('')}
              <g class="ck-five-labels">${Array.from({ length: 11 }, (_, i) => { const n = i + 1, p = point(n * 30, 188); return `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" class="ck-large-step">${n * 5}分</text>`; }).join('')}</g>
              <path d="M 380 33 A 199 199 0 0 1 436 59" fill="none" stroke="#94B58A" stroke-width="2" stroke-linecap="round" marker-end="url(#${prefix}-arrow)"/>
              <g class="ck-hand"><path d="M 324 242 L 325 122 Q 325 113 330 102 Q 335 113 335 122 L 336 242 Z" fill="#ED815B"/><circle cx="330" cy="119" r="4" fill="#FFEADB"/></g>
              <circle cx="330" cy="225" r="12" fill="#365E45"/><circle cx="330" cy="225" r="4" fill="#DFEBCF"/>
            </svg>
            <div class="ck-direction-label">从 12 出发，顺时针走，在一圈以内第一次到达目标</div>
          </div>
          <div class="ck-metrics">
            <div class="ck-metric"><span>起点</span><strong>12</strong></div>
            <div class="ck-metric"><span>已走大格</span><strong class="ck-count ck-muted">暂时隐藏</strong></div>
            <div class="ck-metric"><span>经过时间</span><strong class="ck-time ck-muted">暂时隐藏</strong></div>
          </div>
          <div class="controls">
            <button class="btn primary ck-play" disabled>开始转动</button>
            <button class="btn secondary ck-step" disabled>走一大格</button>
            <button class="btn ghost ck-reset">从 12 重来</button>
          </div>
          <div class="ck-options">
            <label><input type="checkbox" class="ck-slow">慢速播放</label>
            <label><input type="checkbox" class="ck-show-minutes">显示计时提示</label>
            <label><input type="checkbox" class="ck-show-trace" checked>显示轨迹</label>
          </div>
        </div>
        <aside class="panel">
          <div class="eyebrow">先估一估 · 再走一走</div>
          <h3 class="panel-title">分针走了多久？</h3>
          <p class="prompt ck-question">从 12 顺时针转到 <strong class="ck-target-label">3</strong>，经过多少分钟？</p>
          <div class="ck-rule-box"><span class="ck-rule-icon" aria-hidden="true">↻</span><div><strong>每走一大格，经过 5 分钟</strong><small>这一题只走不到一圈，第一次到达就停下。</small></div></div>
          <form class="ck-form">
            <label class="ck-answer-label" for="${prefix}-answer">我的预测</label>
            <div class="ck-answer-row"><input id="${prefix}-answer" type="number" inputmode="numeric" min="0" max="60" step="1" placeholder="填一个数" required aria-describedby="${prefix}-answer-hint"><span>分钟</span></div>
            <span class="sr-only" id="${prefix}-answer-hint">请输入0到60之间的整数分钟。</span>
            <button type="submit" class="btn primary ck-submit">提交预测</button>
          </form>
          <div class="feedback ck-feedback" role="status" aria-live="polite">先填入你的预测，再让分针走一走。</div>
          <p class="ck-note">可以连续播放，也可以每次走一大格。隐藏计时提示时，试着自己数一数。</p>
          <div class="ck-record"><h4>我的观察记录</h4><div class="ck-record-items"><em class="ck-record-empty">完成后，记录会出现在这里。</em></div></div>
        </aside>
      </div>`;
    const $ = selector => root.querySelector(selector);
    const input = $('.ck-answer-row input'), feedback = $('.ck-feedback');
    const targetMinutes = () => target * 5;
    function stopAnimation() { if (animation) animation.cancel(); animation = null; playing = false; }
    function updateButtons() {
      $('.ck-play').disabled = prediction === null;
      $('.ck-step').disabled = prediction === null || playing || completed;
      $('.ck-play').textContent = playing ? '暂停转动' : completed ? '再看一次' : animation ? '继续转动' : '开始转动';
      $('.ck-submit').textContent = completed ? '检查答案' : prediction === null ? '提交预测' : '更新预测';
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
      kit.feedback(feedback, `${correct ? '预测正确！' : `你的预测是 ${prediction} 分钟。`} 分针走了 ${target} 个大格，每格 5 分钟，一共 ${targetMinutes()} 分钟。`, correct ? 'success' : 'info');
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
      if (clearPrediction) { prediction = null; input.value = ''; }
      kit.feedback(feedback, prediction === null ? '先填入你的预测，再让分针走一走。' : `已保留你的预测：${prediction} 分钟。分针回到 12，可以再观察一次。`);
      draw();
    }
    function selectTarget(value) { target = value; reset(true); }
    kit.listen($('.ck-form'), 'submit', event => {
      event.preventDefault();
      const raw = input.value.trim(), value = Number(raw);
      if (!raw || !Number.isInteger(value) || value < 0 || value > 60) { kit.feedback(feedback, '请输入 0 到 60 之间的整数分钟，再开始验证。', 'error'); input.focus(); return; }
      prediction = value;
      if (completed) showResult();
      else kit.feedback(feedback, `预测已记录：${prediction} 分钟。让分针走一走，看看是否正确。`);
      updateButtons();
    });
    kit.listen(root, 'click', event => {
      const button = event.target.closest('[data-target]'); if (button && root.contains(button)) selectTarget(Number(button.dataset.target));
    });
    kit.listen($('.ck-random'), 'click', () => {
      const options = Array.from({ length: 11 }, (_, i) => i + 1).filter(n => n !== target);
      selectTarget(options[Math.floor(Math.random() * options.length)]);
    });
    kit.listen($('.ck-play'), 'click', () => {
      if (playing) { animation.pause(); playing = false; updateButtons(); return; }
      if (animation) { animation.resume(); playing = true; updateButtons(); return; }
      if (completed) reset(false);
      moveTo(targetMinutes());
    });
    kit.listen($('.ck-step'), 'click', () => moveTo(Math.min(targetMinutes(), (Math.floor(minutes / 5 + .001) + 1) * 5)));
    kit.listen($('.ck-reset'), 'click', () => reset(false));
    kit.listen($('.ck-slow'), 'change', event => { slow = event.target.checked; if (playing) moveTo(tweenDestination); else if (animation) { animation.cancel(); animation = null; updateButtons(); } });
    kit.listen($('.ck-show-minutes'), 'change', event => { showMinutes = event.target.checked; draw(); });
    kit.listen($('.ck-show-trace'), 'change', event => { showTrace = event.target.checked; draw(); });
    reset(true);
    return () => stopAnimation();
  }
});
