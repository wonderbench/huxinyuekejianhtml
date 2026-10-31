(function () {
  'use strict';

  const DOG = 'M-49 65L-50 37C-66 29-68 11-60-3C-58-8-52-7-51-1C-53 12-43 17-36 17L-32-5C-41-13-44-24-42-37C-38-55-25-65-8-65C5-66 17-59 23-49L42-44C52-43 57-35 54-27C52-19 42-15 26-15L22 12C27 22 31 35 30 51L42 53C49 54 50 65 43 68L14 68C7 68 4 62 4 54L-3 35L-8 55C-1 55 3 60 1 66C0 71-9 72-18 71L-42 71C-49 71-53 68-49 65Z';
  const DOG_OTHER = 'M-49 65L-50 37C-66 29-68 11-60-3C-58-8-52-7-51-1C-53 12-43 17-36 17L-32-5C-41-13-44-24-42-37C-38-50-30-52-27-53L-26-67L-11-60C1-64 15-57 23-49L42-44C52-43 57-35 54-27C52-19 42-15 26-15L22 12C27 22 31 35 30 51L42 53C49 54 50 65 43 68L14 68C7 68 4 62 4 54L-3 35L-8 55C-1 55 3 60 1 66C0 71-9 72-18 71L-42 71C-49 71-53 68-49 65Z';
  const LEAF = 'M7 19C-8 8-23 6-39 8C-47 8-56 3-58-5C-64-6-65-15-61-21C-66-28-62-35-56-37C-58-44-51-51-45-50C-43-58-33-62-28-57C-23-65-13-66-7-60C-1-66 7-63 11-57C19-62 28-58 29-51C38-54 44-49 43-42C52-42 56-34 52-28C59-22 56-15 49-12C34-7 21 2 13 18L34 70Q34 74 30 75Q27 76 25 71L7 25Z';

  const SETS = {
    dog: {
      name: '小狗', noun: '小狗',
      variants: ['same', 'mirror', 'turn90', 'other', 'same', 'turn180'],
      reasons: {
        mirror: '小狗的脸和尾巴朝着相反的方向。只移动位置，不能把它翻过来。',
        turn90: '这只小狗转了方向。只平移，不能把它转正。',
        other: '仔细看耳朵：它的形状不同。移动位置，不能改变耳朵的轮廓。',
        turn180: '这只小狗上下倒转了。只移动位置，它的朝向不会改变。'
      }
    },
    leaf: {
      name: '银杏叶', noun: '树叶',
      variants: ['same', 'turn180', 'same', 'turn90', 'same', 'mirror'],
      reasons: {
        turn180: '叶柄朝向与目标不同。只移动位置，叶柄的朝向不会改变。',
        turn90: '这片树叶转了方向。只平移，不能把它转回目标的朝向。',
        mirror: '叶片与叶柄左右翻转了。只移动位置，不能把图案翻过来。'
      }
    }
  };

  const TARGET = { x: 190, y: 187 };
  const START = { x: 520, y: 187 };
  const NUMBERS = ['①', '②', '③', '④', '⑤', '⑥'];

  function pose(variant) {
    return variant === 'mirror' ? 'scale(-1 1)' : variant === 'turn90' ? 'rotate(90)' : variant === 'turn180' ? 'rotate(180)' : '';
  }

  function pathFor(kind, variant) {
    return kind === 'leaf' ? LEAF : variant === 'other' ? DOG_OTHER : DOG;
  }

  function silhouette(kind, variant, fill) {
    return '<g transform="' + pose(variant) + '"><path d="' + pathFor(kind, variant) + '" fill="' + fill + '"/></g>';
  }

  function drawing(kind, variant, options) {
    const o = Object.assign({ fill: '#DCEBE6', stroke: '#147D77', width: 2.8, details: true }, options || {});
    let details = '';
    if (o.details) {
      if (kind === 'leaf') {
        details = '<path d="M10 20L-49-27M10 20L-31-44M10 20L-9-50M10 20L15-45M10 20L40-27" fill="none" stroke="' + o.stroke + '" stroke-width="1.7" opacity=".65"/>';
      } else {
        const ear = variant === 'other' ? 'M-25-53L-24-59L-15-55' : 'M-19-58C-35-51-35-30-21-25C-8-21-8-44-6-53';
        details = '<path d="' + ear + 'M21-13Q2-1-29-7M-3 35L-2 16M15 58L15 67M25 58L25 67M-26 60L-26 69M-17 61L-17 70" fill="none" stroke="' + o.stroke + '" stroke-width="2.2"/><circle cx="19" cy="-39" r="3.3" fill="' + o.stroke + '"/><ellipse cx="49" cy="-33" rx="4.8" ry="4.2" fill="' + o.stroke + '"/>';
      }
    }
    return '<g transform="' + pose(variant) + '" stroke-linecap="round" stroke-linejoin="round"><path d="' + pathFor(kind, variant) + '" fill="' + o.fill + '" stroke="' + o.stroke + '" stroke-width="' + o.width + '"/>' + details + '</g>';
  }

  function freshState() {
    return { phase: 'predict', predictions: new Set(), selected: 0, verified: new Map(), x: START.x, y: START.y };
  }

  Courseware.register({
    id: 'overlap',
    number: 4,
    title: '重合侦探',
    subtitle: '移动图案，验证重合',
    icon: '◈',
    mount(root, kit) {
      const id = kit.uid('overlap');
      const maskTarget = id + '-target-diff';
      const maskCandidate = id + '-candidate-diff';
      const states = { dog: freshState(), leaf: freshState() };
      let current = 'dog';
      let drag = null;
      let animation = null;
      let disposed = false;
      let completionReported = false;
      const state = () => states[current];

      root.innerHTML = `
        <style>
          .ov-module{--ov-teal:#147D77;--ov-coral:#F17B59;--ov-ink:#203D3A;color:var(--ov-ink)}
          .ov-module button,.ov-module input{font:inherit}
          .ov-module button:focus-visible,.ov-module input:focus-visible,.ov-module svg:focus-visible{outline:3px solid #CE7341;outline-offset:4px}
          .ov-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
          .ov-tabs{display:flex;gap:8px;flex-wrap:wrap}
          .ov-tabs .chip{min-height:44px;padding:10px 21px;cursor:pointer;border:1px solid #B9CEC5;background:#fff;border-radius:999px;color:var(--ov-ink)}
          .ov-tabs .chip.active{background:var(--ov-teal);border-color:var(--ov-teal);color:white}
          .ov-total{font-size:14px;font-weight:650;color:#496C65;display:flex;align-items:center;gap:9px}
          .ov-total i{display:block;width:68px;height:6px;border-radius:20px;background:#DCE7DF;overflow:hidden}
          .ov-total i span{display:block;height:100%;width:0;background:var(--ov-teal);border-radius:20px;transition:width .2s}
          .ov-module .module-layout{align-items:start}
          .ov-workbench{padding:22px;overflow:hidden}
          .ov-board-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}
          .ov-board-head h3{font-size:20px;margin:3px 0 0;line-height:1.4}
          .ov-step-pill{background:#F1F4EC;color:#4F6D59;border-radius:12px;padding:8px 11px;white-space:nowrap;font-size:12px;font-weight:700}
          .ov-stage{position:relative;border:1px solid #DCE5D9;border-radius:20px;background:#FBFCF7;overflow:hidden}
          .ov-stage svg{width:100%;height:auto;display:block;max-height:405px;touch-action:none;user-select:none}
          .ov-svg-label{font-family:inherit;fill:#456B63;font-size:17px;font-weight:700}
          .ov-svg-caption{font-family:inherit;fill:#648178;font-size:13px}
          .ov-movable{cursor:grab;touch-action:none}
          .ov-movable.is-dragging{cursor:grabbing}
          .ov-module[data-phase="predict"] .ov-movable{cursor:default}
          .ov-diff-legend{padding:9px 15px;background:#FFF0E9;color:#8B432C;font-size:13px;line-height:1.6;display:flex;gap:9px;align-items:center}
          .ov-diff-legend[hidden]{display:none}
          .ov-diff-legend:before{content:'';width:10px;height:10px;flex:none;background:#E6653F;border-radius:3px}
          .ov-gallery-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:21px 0 11px}
          .ov-gallery-head h4{margin:0;font-size:15px}
          .ov-gallery-head span{color:#638077;font-size:12px}
          .ov-gallery{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}
          .ov-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-width:0;min-height:142px;padding:10px 4px 8px;border:1.5px solid #DDE5DB;border-radius:15px;background:#fff;color:var(--ov-ink);cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}
          .ov-card:hover{border-color:#79A79B;background:#F8FBF5}
          .ov-card.is-selected{border-color:var(--ov-teal);box-shadow:0 0 0 2px #147D7714;background:#F2F8F2}
          .ov-card.is-predicted:before{content:'✓';position:absolute;right:6px;top:6px;display:grid;place-items:center;width:20px;height:20px;color:white;background:var(--ov-teal);border-radius:50%;font-size:12px;font-weight:800}
          .ov-card svg{display:block;width:100%;max-width:88px;height:87px;overflow:visible;pointer-events:none}
          .ov-card-num{font-size:17px;font-weight:750;line-height:1}
          .ov-card-status{min-height:16px;font-size:10px;line-height:1.4;margin-top:5px;white-space:nowrap;color:#778C83}
          .ov-card-status.is-yes{color:#147D77;font-weight:700}
          .ov-card-status.is-no{color:#A34B2D;font-weight:700}
          .ov-rule{display:flex;gap:10px;margin:15px 0 0;color:#658074;font-size:13px;line-height:1.65}
          .ov-rule strong{color:#3B6659;flex:none}
          .ov-sidebar{padding:24px;display:flex;flex-direction:column;gap:19px}
          .ov-sidebar h3{margin:4px 0 8px;font-size:21px;line-height:1.4}
          .ov-sidebar .prompt{margin:0;font-size:15px;line-height:1.85}
          .ov-sidebar .eyebrow{font-size:11px;letter-spacing:.08em;color:#618478;font-weight:750}
          .ov-primary-actions{display:grid;gap:9px}
          .ov-module .btn{min-height:44px;cursor:pointer}
          .ov-module .btn:disabled{opacity:.42;cursor:not-allowed}
          .ov-primary-actions .btn{width:100%;padding:11px 12px;line-height:1.5}
          .ov-secondary-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
          .ov-secondary-actions .btn{font-size:13px;padding:9px 7px}
          .ov-nudge{padding:14px;border:1px solid #DFE7DC;border-radius:16px;background:#FAFBF6}
          .ov-nudge-head{font-size:12px;color:#5B776D;text-align:center;margin-bottom:8px}
          .ov-arrows{display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:44px 44px;justify-content:center;gap:5px}
          .ov-arrow{min-width:44px;min-height:44px;border:1px solid #CCDBCF;border-radius:11px;background:white;color:#325E52;cursor:pointer;font-size:21px;font-weight:700}
          .ov-arrow[data-dy="-1"]{grid-column:2}
          .ov-arrow[data-dx="-1"]{grid-column:1;grid-row:2}
          .ov-arrow[data-dy="1"]{grid-column:2;grid-row:2}
          .ov-arrow[data-dx="1"]{grid-column:3;grid-row:2}
          .ov-arrow:disabled{opacity:.4;cursor:not-allowed}
          .ov-key-hint{font-size:11px;color:#789087;margin:10px 0 0;text-align:center;line-height:1.7}
          .ov-options{display:grid;gap:3px}
          .ov-check{display:flex;align-items:center;gap:9px;min-height:44px;cursor:pointer;font-size:13px;color:#486C5E}
          .ov-check input{width:18px;height:18px;accent-color:var(--ov-teal)}
          .ov-hint{border-left:3px solid #DFC889;background:#FCF6E6;padding:11px 13px;border-radius:0 10px 10px 0;font-size:13px;line-height:1.8;color:#76633C}
          .ov-hint[hidden]{display:none}
          .ov-feedback{min-height:68px;font-size:14px;line-height:1.8}
          .ov-summary{padding:15px;border-radius:15px;background:#E9F3E9;border:1px solid #C9DFC7;line-height:1.75;font-size:13px}
          .ov-summary[hidden]{display:none}
          .ov-summary strong{display:block;font-size:15px;margin-bottom:5px;color:#245B47}
          .ov-summary p{margin:0}
          .ov-reset{border-top:1px solid #E4E9DF;padding-top:13px;display:flex;justify-content:space-between;align-items:center;gap:8px}
          .ov-reset span{font-size:12px;color:#6D8479}
          .ov-reset .btn{padding:8px 10px;font-size:13px}
          .ov-module [hidden]{display:none!important}
          @media(max-width:1100px){.ov-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}.ov-card{min-height:124px}.ov-card svg{height:73px}.ov-workbench{padding:16px}}
          @media(max-width:820px){.ov-module .module-layout{grid-template-columns:1fr}.ov-gallery{grid-template-columns:repeat(6,minmax(0,1fr))}.ov-sidebar{gap:16px}.ov-nudge{max-width:300px;width:100%;justify-self:center;box-sizing:border-box}.ov-sidebar h3{font-size:20px}}
          @media(max-width:580px){.ov-top{gap:12px}.ov-tabs .chip{padding:9px 16px}.ov-workbench{padding:13px}.ov-board-head h3{font-size:17px}.ov-step-pill{font-size:10px;padding:7px}.ov-gallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.ov-card{min-height:123px}.ov-card svg{height:73px}.ov-gallery-head{align-items:flex-start}.ov-gallery-head span{max-width:130px;text-align:right;line-height:1.5}.ov-sidebar{padding:20px}.ov-rule{display:block}.ov-rule strong{margin-right:6px}.ov-total{font-size:12px}}
          @media(prefers-reduced-motion:reduce){.ov-card,.ov-total i span{transition:none}}
        </style>
        <section class="ov-module" data-phase="predict" aria-label="重合侦探互动实验">
          <div class="ov-top">
            <div class="ov-tabs" role="group" aria-label="选择图案组">
              <button type="button" class="chip active" data-set="dog" aria-pressed="true">小狗图案</button>
              <button type="button" class="chip" data-set="leaf" aria-pressed="false">银杏叶图案</button>
            </div>
            <div class="ov-total"><span data-total>已验证 0 / 12</span><i aria-hidden="true"><span data-progress></span></i></div>
          </div>
          <div class="module-layout">
            <div class="panel ov-workbench">
              <div class="ov-board-head">
                <div><div class="eyebrow">只移动位置 · 不转动 · 不翻面</div><h3 data-board-title>哪些小狗能和目标完全重合？</h3></div>
                <div class="ov-step-pill" data-phase-label>第 1 步 · 先预测</div>
              </div>
              <div class="stage ov-stage">
                <svg data-board viewBox="0 0 720 350" tabindex="0" role="group" aria-label="图案比对操作区。开始验证后，可拖动右侧副本，或使用方向键移动，按回车检查。">
                  <defs>
                    <pattern id="${id}-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#E0E8DC"/></pattern>
                    <mask id="${maskTarget}" maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="350"><g data-mask-target-white></g><g data-mask-candidate-black></g></mask>
                    <mask id="${maskCandidate}" maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="350"><g data-mask-candidate-white></g><g data-mask-target-black></g></mask>
                  </defs>
                  <rect width="720" height="350" fill="url(#${id}-dots)"/>
                  <rect x="58" y="84" width="264" height="218" rx="24" fill="#E8F1E6" fill-opacity=".85" stroke="#CCDCC8" stroke-dasharray="5 6"/>
                  <rect x="388" y="84" width="264" height="218" rx="24" fill="#FFFFFF" fill-opacity=".6" stroke="#E4E9E0"/>
                  <text x="190" y="48" text-anchor="middle" class="ov-svg-label">目标图案</text>
                  <text x="520" y="48" text-anchor="middle" class="ov-svg-label" data-moving-label>观察副本 ①</text>
                  <text x="190" y="70" text-anchor="middle" class="ov-svg-caption">它的位置保持不变</text>
                  <text x="520" y="70" text-anchor="middle" class="ov-svg-caption" data-moving-caption>先在下面选出你的预测</text>
                  <g data-target transform="translate(190 187)"></g>
                  <g data-target-outline transform="translate(190 187)" pointer-events="none" opacity=".7"></g>
                  <g data-movable class="ov-movable" transform="translate(520 187)" opacity=".72"></g>
                  <g data-differences pointer-events="none" style="display:none">
                    <rect width="720" height="350" fill="#E6653F" fill-opacity=".7" mask="url(#${maskTarget})"/>
                    <rect width="720" height="350" fill="#E6653F" fill-opacity=".7" mask="url(#${maskCandidate})"/>
                  </g>
                  <text x="360" y="330" text-anchor="middle" class="ov-svg-caption" data-stage-note>形状、大小、朝向都要仔细观察</text>
                </svg>
                <div class="ov-diff-legend" data-diff-legend hidden>橙红色是没有盖住的部分。再看看：形状或朝向有什么不同？</div>
              </div>
              <div class="ov-gallery-head"><h4 data-gallery-title>点选你认为可以重合的图案</h4><span data-gallery-subtitle>可以多选，稍后用平移验证</span></div>
              <div class="ov-gallery" data-gallery role="group" aria-label="六个候选图案"></div>
              <p class="ov-rule"><strong>侦探规则</strong><span>只能平移。每个选项的原图一直保留，拖动的是它的透明副本。</span></p>
            </div>
            <aside class="panel ov-sidebar" aria-label="操作与观察">
              <div><div class="eyebrow" data-instruction-step>STEP 01 / 先猜一猜</div><h3 data-instruction-title>谁是目标的“同伴”？</h3><p class="prompt" data-instruction>看清目标图案，在下方选出你认为只靠平移就能与它完全重合的图案。</p></div>
              <div class="ov-primary-actions">
                <button type="button" class="btn primary" data-begin>完成预测，开始验证</button>
                <button type="button" class="btn primary" data-compare hidden>移到目标（只平移）</button>
                <div class="ov-secondary-actions" data-verify-actions hidden><button type="button" class="btn secondary" data-check>检查是否重合</button><button type="button" class="btn secondary" data-return>副本归位</button></div>
              </div>
              <div class="ov-nudge" data-nudge hidden>
                <div class="ov-nudge-head">也可以点箭头移动副本</div>
                <div class="ov-arrows" role="group" aria-label="平移方向">
                  <button type="button" class="ov-arrow" data-dy="-1" aria-label="向上平移">↑</button>
                  <button type="button" class="ov-arrow" data-dx="-1" aria-label="向左平移">←</button>
                  <button type="button" class="ov-arrow" data-dy="1" aria-label="向下平移">↓</button>
                  <button type="button" class="ov-arrow" data-dx="1" aria-label="向右平移">→</button>
                </div>
                <p class="ov-key-hint">点选操作区后：方向键移动，回车检查。<br>按住 Shift + 方向键可微调。</p>
              </div>
              <div class="feedback ov-feedback" data-feedback role="status" aria-live="polite">先留下自己的预测。即使猜错，验证也能帮我们发现原因。</div>
              <div class="ov-summary" data-summary hidden></div>
              <div class="ov-options">
                <label class="ov-check"><input type="checkbox" data-outline checked>显示目标的比对轮廓</label>
                <label class="ov-check"><input type="checkbox" data-show-hint>显示观察提示</label>
                <div class="ov-hint" data-hint hidden>先比较脸、尾巴或叶柄的朝向，再看轮廓。移动位置不会让图案转向，也不会把它翻面。</div>
              </div>
              <div class="ov-reset"><span data-group-progress>本组已验证 0 / 6</span><button type="button" class="btn ghost" data-reset>本组重来</button></div>
            </aside>
          </div>
        </section>`;

      const q = selector => root.querySelector(selector);
      const qa = selector => Array.from(root.querySelectorAll(selector));
      const module = q('.ov-module');
      const svg = q('[data-board]');
      const movable = q('[data-movable]');
      const feedback = q('[data-feedback]');
      const targetOutline = q('[data-target-outline]');

      function say(message, type) {
        kit.feedback(feedback, message, type || 'info');
      }

      function stopAnimation() {
        if (animation) {
          animation.cancel();
          animation = null;
        }
      }

      function stopDrag() {
        if (drag) {
          try { if (movable.hasPointerCapture(drag.id)) movable.releasePointerCapture(drag.id); } catch (_) { /* The pointer may already have ended. */ }
          drag = null;
        }
        movable.classList.remove('is-dragging');
      }

      function setDifferenceVisibility(show) {
        q('[data-differences]').style.display = show ? '' : 'none';
        q('[data-diff-legend]').hidden = !show;
      }

      function position(x, y) {
        const s = state();
        s.x = Math.max(75, Math.min(645, x));
        s.y = Math.max(89, Math.min(264, y));
        const value = 'translate(' + s.x + ' ' + s.y + ')';
        movable.setAttribute('transform', value);
        q('[data-mask-candidate-black]').setAttribute('transform', value);
        q('[data-mask-candidate-white]').setAttribute('transform', value);
      }

      function animateTo(x, y, done) {
        stopAnimation();
        stopDrag();
        setDifferenceVisibility(false);
        const s = state();
        const fromX = s.x;
        const fromY = s.y;
        const activeSet = current;
        const selected = s.selected;
        if (kit.reducedMotion || (Math.abs(x - fromX) < .1 && Math.abs(y - fromY) < .1)) {
          position(x, y);
          if (done) done();
          return;
        }
        animation = kit.tween(0, 1, 430, t => {
          if (!disposed && current === activeSet && state().selected === selected) position(fromX + (x - fromX) * t, fromY + (y - fromY) * t);
        }, () => {
          animation = null;
          if (disposed || current !== activeSet || state().selected !== selected) return;
          position(x, y);
          if (done) done();
        });
      }

      function renderGallery() {
        const s = state();
        const focusedCard = document.activeElement && document.activeElement.closest ? document.activeElement.closest('[data-candidate]') : null;
        const restoreIndex = focusedCard && q('[data-gallery]').contains(focusedCard) ? focusedCard.dataset.candidate : null;
        q('[data-gallery]').innerHTML = SETS[current].variants.map((variant, index) => {
          const predicted = s.predictions.has(index);
          const checked = s.verified.has(index);
          const correct = checked && s.verified.get(index);
          const active = s.phase === 'predict' ? predicted : s.selected === index;
          const status = checked ? correct ? '✓ 可重合' : '× 不能重合' : s.phase === 'predict' ? predicted ? '已选预测' : '点选预测' : '待验证';
          const label = '图案' + NUMBERS[index] + '，' + (checked ? correct ? '已验证，可以通过平移重合' : '已验证，不能只靠平移重合' : s.phase === 'predict' ? predicted ? '已选择预测，点击取消' : '未选择预测，点击选择' : '点击选择副本进行验证');
          return '<button type="button" class="ov-card' + (active ? ' is-selected' : '') + (predicted ? ' is-predicted' : '') + '" data-candidate="' + index + '" aria-pressed="' + active + '" aria-label="' + label + '"><svg viewBox="-88 -88 176 176" aria-hidden="true">' + drawing(current, variant, { fill: '#E5ECE1', stroke: '#3F6659', width: 2.8 }) + '</svg><span class="ov-card-num">' + NUMBERS[index] + '</span><span class="ov-card-status' + (checked ? correct ? ' is-yes' : ' is-no' : '') + '">' + status + '</span></button>';
        }).join('');
        if (restoreIndex !== null) q('[data-gallery]').querySelector('[data-candidate="' + restoreIndex + '"]').focus({ preventScroll: true });
      }

      function renderFigures() {
        const s = state();
        const variant = SETS[current].variants[s.selected];
        q('[data-target]').innerHTML = drawing(current, 'same', { fill: '#C9DED2', stroke: '#729B88', width: 1.5 });
        targetOutline.innerHTML = drawing(current, 'same', { fill: 'none', stroke: '#147D77', width: 3.5, details: false });
        targetOutline.style.display = q('[data-outline]').checked ? '' : 'none';
        movable.innerHTML = drawing(current, variant, { fill: '#F8C4AD', stroke: '#B45636', width: 2.8 });
        q('[data-mask-target-white]').innerHTML = silhouette(current, 'same', 'white');
        q('[data-mask-target-black]').innerHTML = silhouette(current, 'same', 'black');
        q('[data-mask-target-white]').setAttribute('transform', 'translate(' + TARGET.x + ' ' + TARGET.y + ')');
        q('[data-mask-target-black]').setAttribute('transform', 'translate(' + TARGET.x + ' ' + TARGET.y + ')');
        q('[data-mask-candidate-black]').innerHTML = silhouette(current, variant, 'black');
        q('[data-mask-candidate-white]').innerHTML = silhouette(current, variant, 'white');
        position(s.x, s.y);
        q('[data-moving-label]').textContent = (s.phase === 'predict' ? '观察副本 ' : '操作副本 ') + NUMBERS[s.selected];
      }

      function renderProgress() {
        const s = state();
        const total = states.dog.verified.size + states.leaf.verified.size;
        q('[data-total]').textContent = '已验证 ' + total + ' / 12';
        q('[data-progress]').style.width = (total / 12 * 100) + '%';
        q('[data-group-progress]').textContent = '本组已验证 ' + s.verified.size + ' / 6';
        const summary = q('[data-summary]');
        summary.hidden = s.verified.size !== 6;
        if (s.verified.size === 6) {
          const variants = SETS[current].variants;
          const matches = variants.map((v, i) => v === 'same' ? NUMBERS[i] : '').filter(Boolean).join('、');
          const accurate = variants.reduce((count, v, i) => count + (s.predictions.has(i) === (v === 'same') ? 1 : 0), 0);
          summary.innerHTML = '<strong>本组验证完成！</strong><p>' + matches + ' 可以只靠平移与目标重合。</p><p>你对 6 个图案的预测中，有 ' + accurate + ' 个与验证结果一致。</p><p>' + (total === 12 ? '两组都完成了！请说一说：平移时，图案的哪些特点保持不变？' : '再切换另一组，把新发现用起来。') + '</p>';
        }
        if (total === 12 && !completionReported) {
          completionReported = true;
          kit.markDone();
        }
      }

      function renderPhase() {
        const s = state();
        const predicting = s.phase === 'predict';
        module.dataset.phase = s.phase;
        q('[data-board-title]').textContent = '哪些' + SETS[current].noun + '能和目标完全重合？';
        q('[data-phase-label]').textContent = predicting ? '第 1 步 · 先预测' : '第 2 步 · 再验证';
        q('[data-instruction-step]').textContent = predicting ? 'STEP 01 / 先猜一猜' : 'STEP 02 / 只用平移';
        q('[data-instruction-title]').textContent = predicting ? '谁是目标的“同伴”？' : '移动它，看看能否盖住';
        q('[data-instruction]').textContent = predicting ? '看清目标图案，在下方选出你认为只靠平移就能与它完全重合的图案。' : '点选一个图案，把右侧透明副本拖到左侧目标上。也可以点击“移到目标”，观察轮廓能否完全重合。';
        q('[data-gallery-title]').textContent = predicting ? '点选你认为可以重合的图案' : '点选图案，逐一验证你的预测';
        q('[data-gallery-subtitle]').textContent = predicting ? '可以多选，稍后用平移验证' : '绿色小勾保留你的原先预测';
        q('[data-moving-caption]').textContent = predicting ? '先在下面选出你的预测' : '拖动它，或使用右侧按钮';
        q('[data-stage-note]').textContent = predicting ? '形状、大小、朝向都要仔细观察' : '位置可以改变，形状、大小和朝向保持不变';
        q('[data-begin]').hidden = !predicting;
        q('[data-compare]').hidden = predicting;
        q('[data-verify-actions]').hidden = predicting;
        q('[data-nudge]').hidden = predicting;
        qa('[data-set]').forEach(button => {
          const selected = button.dataset.set === current;
          button.classList.toggle('active', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        renderGallery();
        renderFigures();
        renderProgress();
      }

      function notePrediction(s, index, canOverlap) {
        const guessedYes = s.predictions.has(index);
        return guessedYes === canOverlap ? '你的这次预测与验证结果一致。' : guessedYes ? '你原先选了它，验证帮助我们修正了预测。' : '你原先没有选它，现在发现它也可以。';
      }

      function recordResult(canOverlap) {
        const s = state();
        const index = s.selected;
        s.verified.set(index, canOverlap);
        setDifferenceVisibility(!canOverlap);
        if (canOverlap) {
          say(NUMBERS[index] + ' 可以重合！它的形状、大小和朝向与目标相同，只改变位置就能盖住目标。' + notePrediction(s, index, true), 'success');
        } else {
          const reason = SETS[current].reasons[SETS[current].variants[index]];
          say(NUMBERS[index] + ' 不能只靠平移重合。' + reason + notePrediction(s, index, false), 'info');
        }
        renderGallery();
        renderProgress();
      }

      function checkPosition(exactPlacement) {
        if (state().phase !== 'verify') return;
        stopAnimation();
        const s = state();
        const distance = Math.hypot(s.x - TARGET.x, s.y - TARGET.y);
        if (distance > 25) {
          setDifferenceVisibility(false);
          say('还没有移到目标附近。继续移到目标所在的位置，或点击“移到目标（只平移）”，再比较轮廓。');
          return;
        }
        const canOverlap = SETS[current].variants[s.selected] === 'same';
        if (canOverlap && !exactPlacement && distance > .1) {
          animateTo(TARGET.x, TARGET.y, () => recordResult(true));
        } else {
          recordResult(canOverlap);
        }
      }

      function selectCandidate(index) {
        stopAnimation();
        stopDrag();
        setDifferenceVisibility(false);
        const s = state();
        s.selected = index;
        s.x = START.x;
        s.y = START.y;
        if (s.phase === 'predict') {
          if (s.predictions.has(index)) s.predictions.delete(index);
          else s.predictions.add(index);
          const selected = Array.from(s.predictions).sort().map(i => NUMBERS[i]).join('、');
          say(selected ? '你的预测：' + selected + ' 可以重合。想好后，开始用平移验证。' : '目前没有选中图案。可以继续观察，也可以带着“都不能重合”的预测开始验证。');
        } else {
          say('现在验证 ' + NUMBERS[index] + '。先看看它的朝向，再把透明副本移到目标上。');
        }
        renderGallery();
        renderFigures();
      }

      function nudge(dx, dy, fine) {
        if (state().phase !== 'verify') return;
        stopAnimation();
        stopDrag();
        setDifferenceVisibility(false);
        const step = fine ? 2 : 12;
        position(state().x + dx * step, state().y + dy * step);
      }

      kit.listen(q('[data-gallery]'), 'click', event => {
        const button = event.target.closest('button[data-candidate]');
        if (button) selectCandidate(Number(button.dataset.candidate));
      });

      qa('[data-set]').forEach(button => kit.listen(button, 'click', () => {
        if (current === button.dataset.set) return;
        stopAnimation();
        stopDrag();
        current = button.dataset.set;
        state().x = START.x;
        state().y = START.y;
        setDifferenceVisibility(false);
        renderPhase();
        say(state().phase === 'predict' ? '换一组图案，再用同样的方法观察：哪些只靠平移就能重合？' : '已保留这组的预测与验证记录。选择图案，继续验证。');
      }));

      kit.listen(q('[data-begin]'), 'click', () => {
        state().phase = 'verify';
        setDifferenceVisibility(false);
        renderPhase();
        say('预测已保留。选择一个图案，把它平移到目标上；观察时只移动位置，不转动，也不翻面。');
      });

      kit.listen(q('[data-compare]'), 'click', () => {
        if (state().phase !== 'verify') return;
        animateTo(TARGET.x, TARGET.y, () => checkPosition(true));
      });
      kit.listen(q('[data-check]'), 'click', () => checkPosition(false));
      kit.listen(q('[data-return]'), 'click', () => {
        animateTo(START.x, START.y);
        say('副本回到右侧了。你可以再次移动，或选择另一个图案。');
      });
      qa('.ov-arrow').forEach(button => kit.listen(button, 'click', () => nudge(Number(button.dataset.dx || 0), Number(button.dataset.dy || 0), false)));
      kit.listen(q('[data-outline]'), 'change', event => { targetOutline.style.display = event.target.checked ? '' : 'none'; });
      kit.listen(q('[data-show-hint]'), 'change', event => { q('[data-hint]').hidden = !event.target.checked; });
      kit.listen(q('[data-reset]'), 'click', () => {
        stopAnimation();
        stopDrag();
        states[current] = freshState();
        setDifferenceVisibility(false);
        renderPhase();
        say('本组已重新开始。再仔细观察，先留下你的预测。');
      });

      kit.listen(movable, 'pointerdown', event => {
        if (state().phase !== 'verify' || (event.pointerType === 'mouse' && event.button !== 0)) return;
        if (drag && drag.id !== event.pointerId) return;
        event.preventDefault();
        stopAnimation();
        stopDrag();
        setDifferenceVisibility(false);
        const p = kit.svgPoint(svg, event);
        drag = { id: event.pointerId, dx: p.x - state().x, dy: p.y - state().y };
        movable.classList.add('is-dragging');
        try { movable.setPointerCapture(event.pointerId); } catch (_) { /* Window pointerup still ends the interaction. */ }
        svg.focus({ preventScroll: true });
      });
      kit.listen(window, 'pointermove', event => {
        if (!drag || drag.id !== event.pointerId) return;
        event.preventDefault();
        const p = kit.svgPoint(svg, event);
        position(p.x - drag.dx, p.y - drag.dy);
      }, { passive: false });
      kit.listen(window, 'pointerup', event => {
        if (!drag || drag.id !== event.pointerId) return;
        stopDrag();
        checkPosition(false);
      });
      kit.listen(window, 'pointercancel', event => {
        if (drag && drag.id === event.pointerId) stopDrag();
      });
      kit.listen(svg, 'keydown', event => {
        if (state().phase !== 'verify') return;
        const directions = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        if (directions[event.key]) {
          event.preventDefault();
          nudge(directions[event.key][0], directions[event.key][1], event.shiftKey);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          checkPosition(false);
        } else if (event.key === 'Home') {
          event.preventDefault();
          animateTo(START.x, START.y);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          stopDrag();
          stopAnimation();
        }
      });

      renderPhase();
      const cleanup = () => {
        if (disposed) return;
        disposed = true;
        stopAnimation();
        stopDrag();
      };
      kit.onCleanup(cleanup);
      return cleanup;
    }
  });
})();
