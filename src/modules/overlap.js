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

  const LAYOUTS = {
    wide: {
      name: 'side-by-side', width: 720, height: 350,
      target: { x: 190, y: 187 }, start: { x: 520, y: 187 },
      targetPlate: { x: 58, y: 84, width: 264, height: 218 },
      copyPlate: { x: 388, y: 84, width: 264, height: 218 },
      targetLabel: { x: 190, y: 48 }, copyLabel: { x: 520, y: 48 },
      bounds: { minX: 80, maxX: 640, minY: 88, maxY: 270 }
    },
    narrow: {
      name: 'stacked', width: 320, height: 508,
      target: { x: 160, y: 142 }, start: { x: 160, y: 376 },
      targetPlate: { x: 34, y: 57, width: 252, height: 183 },
      copyPlate: { x: 34, y: 291, width: 252, height: 183 },
      targetLabel: { x: 160, y: 32 }, copyLabel: { x: 160, y: 266 },
      bounds: { minX: 82, maxX: 238, minY: 84, maxY: 428 }
    }
  };
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

  function freshState(layout) {
    return {
      phase: 'predict', predictions: new Set(), selected: 0, verified: new Map(),
      x: layout.start.x, y: layout.start.y, differences: false, resultShown: false,
      message: '先选出你的预测，再用平移验证。', messageType: 'info'
    };
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
      const narrowQuery = window.matchMedia('(max-width: 560px)');
      const boardQuery = window.matchMedia('(min-width: 1000px)');
      let layout = narrowQuery.matches ? LAYOUTS.narrow : LAYOUTS.wide;
      const states = { dog: freshState(layout), leaf: freshState(layout) };
      let current = 'dog';
      let drag = null;
      let animation = null;
      let disposed = false;
      let completionReported = false;
      let controlsOnBoard = false;
      const state = () => states[current];

      root.innerHTML = `
        <style>
          .ov-module{--ov-teal:#147D77;--ov-coral:#F17B59;--ov-ink:#203D3A;color:var(--ov-ink);font-size:16px}
          .ov-module button,.ov-module input{font:inherit}
          .ov-module button:focus-visible,.ov-module input:focus-visible,.ov-module svg:focus-visible,.ov-module summary:focus-visible{outline:3px solid #C96B3B;outline-offset:4px}
          .ov-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px}
          .ov-tabs{display:flex;gap:8px;flex-wrap:wrap}
          .ov-tabs .chip{min-height:44px;padding:9px 17px;cursor:pointer;border:1px solid #CCDBD2;background:#fff;border-radius:10px;color:var(--ov-ink);font-size:16px}
          .ov-tabs .chip.active{background:#E5F2ED;border-color:#8CB4A6;color:#0C5F5A}
          .ov-total{font-size:14px;font-weight:650;color:#4D6B60;display:flex;align-items:center;gap:10px}
          .ov-total i{display:block;width:56px;height:6px;border-radius:20px;background:#DFE7DF;overflow:hidden}
          .ov-total i span{display:block;height:100%;width:0;background:var(--ov-teal);border-radius:20px;transition:width 150ms}
          .ov-module .module-layout{align-items:start;gap:28px}
          .ov-module .ov-workbench,.ov-module .ov-sidebar{padding:0;border:0;box-shadow:none;background:transparent;min-width:0}
          .ov-board-head{display:flex;justify-content:space-between;gap:14px;align-items:baseline;margin-bottom:14px}
          .ov-board-head h3{font-size:20px;margin:0;line-height:1.5}
          .ov-step-pill{color:#5C7466;font-size:14px;white-space:nowrap}
          .ov-stage{position:relative;border:1px solid #DCE5D9;border-radius:14px;background:#F4F7F2;overflow:hidden}
          .ov-stage svg{width:100%;height:auto;display:block;max-height:none;touch-action:none;user-select:none}
          .ov-stage[data-layout="stacked"] svg{max-width:360px;margin:0 auto}
          .ov-svg-label{font-family:inherit;fill:#365E50;font-size:22px;font-weight:700}
          .ov-movable{cursor:grab;touch-action:none}
          .ov-movable.is-dragging{cursor:grabbing}
          .ov-module[data-phase="predict"] .ov-movable{cursor:default}
          .ov-diff-legend{padding:12px 16px;background:#FFF0E9;color:#863E28;font-size:14px;line-height:1.65;display:flex;gap:9px;align-items:flex-start}
          .ov-diff-legend:before{content:'';width:10px;height:10px;flex:none;margin-top:7px;background:#E6653F;border-radius:2px}
          .ov-primary-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
          .ov-gallery-home:empty,.ov-nudge-home:empty{display:none}
          .ov-primary-actions .btn{flex:1 1 210px;min-height:46px;padding:11px 14px;font-size:16px;line-height:1.5}
          .ov-module .btn{min-height:44px;cursor:pointer}
          .ov-module .btn:disabled{opacity:.42;cursor:not-allowed}
          .ov-secondary-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
          .ov-secondary-actions .btn{font-size:14px;padding:9px 12px;border-color:transparent;background:transparent;color:#416B5D}
          .ov-module .ov-feedback{margin-top:14px;min-height:0;border:0;border-left:3px solid #C9DCCC;border-radius:0;padding:10px 14px;background:#F3F7F1;font-size:16px;line-height:1.8;color:#365C4E}
          .ov-module .ov-feedback.is-success{border-left-color:#6A9C65;background:#EFF7E9;color:#365D2D}
          .ov-module .ov-feedback.is-error{border-left-color:#DB8D69;background:#FFF1E9;color:#8D442C}
          .ov-gallery-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:23px 0 12px}
          .ov-gallery-head h4{margin:0;font-size:16px}
          .ov-gallery-head span{color:#5E766A;font-size:14px}
          .ov-gallery{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
          .ov-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-width:0;min-height:160px;padding:12px 5px 10px;border:2px solid transparent;border-radius:12px;background:#F1F5EF;color:var(--ov-ink);cursor:pointer;transition:border-color 140ms,background 140ms,transform 140ms}
          .ov-card:hover{background:#EAF2E8}
          .ov-card:active{transform:translateY(1px)}
          .ov-card.is-selected{border-color:var(--ov-teal);background:#E8F3EC}
          .ov-card.is-predicted:before{content:'✓';position:absolute;right:6px;top:6px;display:grid;place-items:center;width:22px;height:22px;color:#0C5F5A;background:#CDE4D8;border-radius:50%;font-size:14px;font-weight:800}
          .ov-card svg{display:block;width:100%;max-width:94px;height:88px;overflow:visible;pointer-events:none}
          .ov-card-num{font-size:19px;font-weight:750;line-height:1.2}
          .ov-card-status{min-height:21px;font-size:14px;line-height:1.5;margin-top:5px;text-align:center;color:#5F7669}
          .ov-card-status.is-yes{color:#106F64;font-weight:700}
          .ov-card-status.is-no{color:#96472D;font-weight:700}
          .ov-rule{margin:0 0 12px;color:#526E60;font-size:14px;line-height:1.75}
          .ov-sidebar{display:flex;flex-direction:column;gap:20px}
          .ov-sidebar .prompt{margin:0;font-size:16px;line-height:1.85;font-weight:500}
          .ov-prediction{font-size:16px;line-height:1.8;padding:0 0 17px;border-bottom:1px solid #E1E8DF;color:#416657}
          .ov-nudge-head{font-size:14px;color:#506D5F;margin-bottom:10px}
          .ov-arrows{display:grid;grid-template-columns:repeat(3,46px);grid-template-rows:46px 46px;justify-content:start;gap:7px}
          .ov-arrow{min-width:46px;min-height:46px;border:1px solid #CCDBCF;border-radius:10px;background:white;color:#325E52;cursor:pointer;font-size:22px;font-weight:700}
          .ov-arrow[data-dy="-1"]{grid-column:2}
          .ov-arrow[data-dx="-1"]{grid-column:1;grid-row:2}
          .ov-arrow[data-dy="1"]{grid-column:2;grid-row:2}
          .ov-arrow[data-dx="1"]{grid-column:3;grid-row:2}
          .ov-settings{border-top:1px solid #E1E8DF;border-bottom:1px solid #E1E8DF;padding:4px 0}
          .ov-settings summary{min-height:44px;padding:10px 0;font-size:14px;color:#416657;cursor:pointer;font-weight:650}
          .ov-check{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;font-size:14px;color:#416657}
          .ov-check input{width:18px;height:18px;accent-color:var(--ov-teal)}
          .ov-hint{margin:8px 0 12px;padding-left:12px;border-left:3px solid #D4BD7A;font-size:14px;line-height:1.85;color:#705F35}
          .ov-key-hint{font-size:14px;color:#5F7669;margin:12px 0;line-height:1.8}
          .ov-summary{padding:16px;background:#EFF6EA;border-radius:10px;font-size:16px;line-height:1.85}
          .ov-summary strong{display:block;margin-bottom:7px;color:#2F5E40}
          .ov-summary p{margin:0}
          .ov-reset{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
          .ov-reset span{font-size:14px;color:#597163}
          .ov-reset .btn{font-size:14px;padding:9px 11px}
          .ov-module [hidden]{display:none!important}
          @media(max-width:1100px){.ov-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}.ov-module .module-layout{gap:22px}}
          @media(max-width:820px){.ov-module .module-layout{grid-template-columns:1fr}.ov-sidebar{gap:17px;padding-top:4px!important}.ov-gallery{grid-template-columns:repeat(6,minmax(0,1fr))}.ov-board-head h3{font-size:20px}}
          @media(max-width:650px){.ov-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
          @media(max-width:560px){.ov-top{margin-bottom:17px}.ov-total i{width:40px}.ov-board-head{align-items:flex-start}.ov-board-head h3{font-size:18px}.ov-step-pill{padding-top:3px}.ov-gallery-head{flex-direction:column;gap:4px;margin-top:20px}.ov-card{min-height:158px;padding-left:4px;padding-right:4px}.ov-primary-actions{gap:8px}.ov-secondary-actions{gap:3px}.ov-rule{margin-top:12px}}
          @media(min-width:1000px){
            :root[data-board-mode="whiteboard"] .ov-module{font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-module .module-layout{grid-template-columns:minmax(0,1fr) 400px;gap:28px}
            :root[data-board-mode="whiteboard"] .ov-top{margin-bottom:16px}
            :root[data-board-mode="whiteboard"] .ov-tabs .chip{min-height:56px;padding:12px 22px;font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-total{font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-board-head{margin-bottom:8px}
            :root[data-board-mode="whiteboard"] .ov-board-head h3{font-size:26px;line-height:1.4}
            :root[data-board-mode="whiteboard"] .ov-step-pill{font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-rule{font-size:20px;line-height:1.6;margin-bottom:14px;color:#365F4C}
            :root[data-board-mode="whiteboard"] .ov-stage>svg{max-width:800px;margin:0 auto;height:auto;max-height:none}
            :root[data-board-mode="whiteboard"] .ov-svg-label{font-size:30px}
            :root[data-board-mode="whiteboard"] .ov-diff-legend{font-size:20px;line-height:1.6;padding:12px 18px}
            :root[data-board-mode="whiteboard"] .ov-diff-legend:before{width:13px;height:13px;margin-top:9px}
            :root[data-board-mode="whiteboard"] .ov-actions-band{display:flex;flex-wrap:wrap;align-items:flex-end;gap:18px;margin-top:16px}
            :root[data-board-mode="whiteboard"] .ov-primary-actions{flex:1 1 280px;gap:12px;margin-top:0}
            :root[data-board-mode="whiteboard"] .ov-primary-actions .btn{min-height:56px;font-size:22px;padding:12px 18px;flex-basis:240px}
            :root[data-board-mode="whiteboard"] .ov-secondary-actions{gap:12px;margin-top:10px}
            :root[data-board-mode="whiteboard"] .ov-secondary-actions .btn{min-height:56px;font-size:20px;padding:12px 16px}
            :root[data-board-mode="whiteboard"] .ov-module .ov-feedback{font-size:22px;line-height:1.7;padding:14px 18px;margin-top:12px}
            :root[data-board-mode="whiteboard"] .ov-sidebar{gap:18px}
            :root[data-board-mode="whiteboard"] .ov-sidebar .prompt,:root[data-board-mode="whiteboard"] .ov-prediction{font-size:20px;line-height:1.7}
            :root[data-board-mode="whiteboard"] .ov-prediction{padding-bottom:14px}
            :root[data-board-mode="whiteboard"] .ov-gallery-head{display:block;margin:0 0 12px}
            :root[data-board-mode="whiteboard"] .ov-gallery-head h4{font-size:22px;margin-bottom:5px}
            :root[data-board-mode="whiteboard"] .ov-gallery-head span{font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-gallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
            :root[data-board-mode="whiteboard"] .ov-card{min-height:192px;padding:12px 4px 10px;border-width:3px}
            :root[data-board-mode="whiteboard"] .ov-card svg{max-width:132px;height:112px}
            :root[data-board-mode="whiteboard"] .ov-card-num{font-size:28px;font-weight:800}
            :root[data-board-mode="whiteboard"] .ov-card-status{font-size:20px;line-height:1.4;min-height:28px}
            :root[data-board-mode="whiteboard"] .ov-card.is-predicted:before{width:28px;height:28px;right:5px;top:5px;font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-nudge{flex:0 0 auto}
            :root[data-board-mode="whiteboard"] .ov-nudge-head{font-size:20px;line-height:1.5;margin-bottom:8px}
            :root[data-board-mode="whiteboard"] .ov-arrows{grid-template-columns:repeat(4,64px);grid-template-rows:64px;gap:10px}
            :root[data-board-mode="whiteboard"] .ov-arrow{min-width:64px;min-height:64px;font-size:30px;border-width:2px}
            :root[data-board-mode="whiteboard"] .ov-arrow[data-dx="-1"]{grid-column:1;grid-row:1}
            :root[data-board-mode="whiteboard"] .ov-arrow[data-dy="-1"]{grid-column:2;grid-row:1}
            :root[data-board-mode="whiteboard"] .ov-arrow[data-dy="1"]{grid-column:3;grid-row:1}
            :root[data-board-mode="whiteboard"] .ov-arrow[data-dx="1"]{grid-column:4;grid-row:1}
            :root[data-board-mode="whiteboard"] .ov-settings summary{min-height:56px;font-size:20px;padding:12px 0}
            :root[data-board-mode="whiteboard"] .ov-check{min-height:56px;font-size:20px;gap:12px}
            :root[data-board-mode="whiteboard"] .ov-check input{width:26px;height:26px}
            :root[data-board-mode="whiteboard"] .ov-hint,:root[data-board-mode="whiteboard"] .ov-key-hint{font-size:20px;line-height:1.7}
            :root[data-board-mode="whiteboard"] .ov-summary{font-size:20px;line-height:1.7;padding:18px}
            :root[data-board-mode="whiteboard"] .ov-reset span,:root[data-board-mode="whiteboard"] .ov-reset .btn{font-size:20px}
            :root[data-board-mode="whiteboard"] .ov-reset .btn{min-height:56px;padding:12px 14px}
          }
          @media(min-width:1600px){:root[data-board-mode="whiteboard"] .ov-module .module-layout{grid-template-columns:minmax(0,1fr) 440px;gap:32px}}
          @media(prefers-reduced-motion:reduce){.ov-card,.ov-total i span{transition:none}.ov-card:active{transform:none}}
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
              <div class="ov-board-head"><h3 data-board-title>哪些小狗能与目标重合？</h3><span class="ov-step-pill" data-phase-label>先预测</span></div>
              <p class="ov-rule">只能平移：形状、大小和朝向保持不变。</p>
              <div class="stage ov-stage" data-layout="side-by-side">
                <svg data-board viewBox="0 0 720 350" tabindex="0" role="group" aria-label="图案比对操作区。开始验证后可拖动透明副本，或使用方向键移动，按回车检查。">
                  <defs>
                    <mask id="${maskTarget}" data-mask-target maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="350"><g data-mask-target-white></g><g data-mask-candidate-black></g></mask>
                    <mask id="${maskCandidate}" data-mask-candidate maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="350"><g data-mask-candidate-white></g><g data-mask-target-black></g></mask>
                  </defs>
                  <rect data-target-plate x="58" y="84" width="264" height="218" rx="18" fill="#E5EEE3"/>
                  <rect data-copy-plate x="388" y="84" width="264" height="218" rx="18" fill="#FFFFFF" fill-opacity=".8"/>
                  <text data-target-label x="190" y="48" text-anchor="middle" class="ov-svg-label">目标图案</text>
                  <text data-moving-label x="520" y="48" text-anchor="middle" class="ov-svg-label">副本 ①</text>
                  <g data-target transform="translate(190 187)"></g>
                  <g data-target-outline transform="translate(190 187)" pointer-events="none" opacity=".7"></g>
                  <g data-movable class="ov-movable" transform="translate(520 187)" opacity=".72"></g>
                  <g data-differences pointer-events="none" style="display:none">
                    <rect data-target-diff-rect width="720" height="350" fill="#E6653F" fill-opacity=".7" mask="url(#${maskTarget})"/>
                    <rect data-copy-diff-rect width="720" height="350" fill="#E6653F" fill-opacity=".7" mask="url(#${maskCandidate})"/>
                  </g>
                </svg>
                <div class="ov-diff-legend" data-diff-legend hidden>橙红色标出了没有重合的部分。</div>
              </div>
              <div class="ov-actions-band" data-actions-band><div class="ov-primary-actions">
                <button type="button" class="btn primary" data-begin>开始验证</button>
                <button type="button" class="btn primary" data-next hidden>验证下一图案</button>
                <button type="button" class="btn primary" data-next-set hidden>继续验证另一组</button>
                <button type="button" class="btn primary" data-compare hidden>移到目标（只平移）</button>
              </div></div>
              <div class="ov-secondary-actions" data-verify-actions hidden><button type="button" class="btn ghost" data-check>检查当前位置</button><button type="button" class="btn ghost" data-return>副本归位</button></div>
              <div class="feedback ov-feedback" data-feedback role="status" aria-live="polite">先选出你的预测，再用平移验证。</div>
              <div class="ov-gallery-home" data-gallery-home><div class="ov-gallery-zone" data-gallery-zone>
                <div class="ov-gallery-head"><h4 data-gallery-title>选出可以重合的图案</h4><span data-gallery-subtitle>可以多选</span></div>
                <div class="ov-gallery" data-gallery role="group" aria-label="六个候选图案"></div>
              </div></div>
            </div>
            <aside class="panel ov-sidebar" aria-label="预测与操作帮助">
              <p class="prompt" data-instruction>先比较朝向与轮廓。每个选项的原图都会保留，移动的是透明副本。</p>
              <div class="ov-prediction" data-prediction-note>我的预测：还未选择。</div>
              <div class="ov-summary" data-summary hidden></div>
              <div class="ov-nudge-home" data-nudge-home hidden><div class="ov-nudge" data-nudge hidden>
                <div class="ov-nudge-head">用按钮移动副本</div>
                <div class="ov-arrows" role="group" aria-label="平移方向">
                  <button type="button" class="ov-arrow" data-dy="-1" aria-label="向上平移">↑</button>
                  <button type="button" class="ov-arrow" data-dx="-1" aria-label="向左平移">←</button>
                  <button type="button" class="ov-arrow" data-dy="1" aria-label="向下平移">↓</button>
                  <button type="button" class="ov-arrow" data-dx="1" aria-label="向右平移">→</button>
                </div>
              </div></div>
              <details class="ov-settings"><summary>显示与键盘操作</summary>
                <label class="ov-check"><input type="checkbox" data-outline checked>显示目标的比对轮廓</label>
                <label class="ov-check"><input type="checkbox" data-show-hint>显示观察提示</label>
                <div class="ov-hint" data-hint hidden>看看脸、尾巴或叶柄的朝向，再比较轮廓。移动位置不会让图案转向，也不会把它翻面。</div>
                <p class="ov-key-hint">聚焦操作区后：方向键移动，回车检查，Home 归位。Shift + 方向键可微调。</p>
              </details>
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
      const galleryZone = q('[data-gallery-zone]');
      const galleryHome = q('[data-gallery-home]');
      const nudgePanel = q('[data-nudge]');
      const nudgeHome = q('[data-nudge-home]');

      function say(message, type) {
        state().message = message;
        state().messageType = type || 'info';
        kit.feedback(feedback, message, state().messageType);
      }

      function stopAnimation() {
        if (animation) {
          animation.cancel();
          animation = null;
        }
      }

      function stopDrag() {
        if (drag) {
          const pointerId = drag.id;
          drag = null;
          try { if (movable.hasPointerCapture(pointerId)) movable.releasePointerCapture(pointerId); } catch (_) { /* The pointer or its mounted surface may already have ended. */ }
        }
        movable.classList.remove('is-dragging');
      }

      function pause() {
        stopAnimation();
        stopDrag();
      }

      function syncBoardMode() {
        if (disposed) return;
        const active = boardQuery.matches && document.documentElement.getAttribute('data-board-mode') === 'whiteboard';
        if (active === controlsOnBoard) return;
        pause();
        const focused = document.activeElement;
        const restoreFocus = focused && (galleryZone.contains(focused) || nudgePanel.contains(focused));
        if (active) {
          const sidebar = q('.ov-sidebar');
          sidebar.insertBefore(galleryZone, sidebar.firstChild);
          q('[data-actions-band]').appendChild(nudgePanel);
        } else {
          galleryHome.appendChild(galleryZone);
          nudgeHome.appendChild(nudgePanel);
        }
        controlsOnBoard = active;
        if (restoreFocus && focused.focus) focused.focus({ preventScroll: true });
      }

      function setDifferenceVisibility(show) {
        state().differences = show;
        q('[data-differences]').style.display = show ? '' : 'none';
        q('[data-diff-legend]').hidden = !show;
      }

      function clampPoint(point, geometry) {
        const b = geometry.bounds;
        return { x: Math.max(b.minX, Math.min(b.maxX, point.x)), y: Math.max(b.minY, Math.min(b.maxY, point.y)) };
      }

      function position(x, y) {
        const s = state();
        const p = clampPoint({ x, y }, layout);
        s.x = p.x;
        s.y = p.y;
        const value = 'translate(' + s.x + ' ' + s.y + ')';
        movable.setAttribute('transform', value);
        q('[data-mask-candidate-black]').setAttribute('transform', value);
        q('[data-mask-candidate-white]').setAttribute('transform', value);
      }

      function attributes(element, values) {
        Object.keys(values).forEach(key => element.setAttribute(key, values[key]));
      }

      function renderGeometry() {
        svg.setAttribute('viewBox', '0 0 ' + layout.width + ' ' + layout.height);
        q('.ov-stage').dataset.layout = layout.name;
        attributes(q('[data-target-plate]'), layout.targetPlate);
        attributes(q('[data-copy-plate]'), layout.copyPlate);
        attributes(q('[data-target-label]'), layout.targetLabel);
        attributes(q('[data-moving-label]'), layout.copyLabel);
        const dimensions = { width: layout.width, height: layout.height };
        ['[data-mask-target]', '[data-mask-candidate]', '[data-target-diff-rect]', '[data-copy-diff-rect]'].forEach(selector => attributes(q(selector), dimensions));
        const targetTransform = 'translate(' + layout.target.x + ' ' + layout.target.y + ')';
        ['[data-target]', '[data-target-outline]', '[data-mask-target-white]', '[data-mask-target-black]'].forEach(selector => q(selector).setAttribute('transform', targetTransform));
        position(state().x, state().y);
      }

      function remapPoint(point, from, to) {
        // Preserve progress from target to start and the perpendicular offset.
        // This repositions the figures when the layout changes; their poses never rotate.
        const dx = from.start.x - from.target.x;
        const dy = from.start.y - from.target.y;
        const length = Math.hypot(dx, dy);
        const px = point.x - from.target.x;
        const py = point.y - from.target.y;
        const along = (px * dx + py * dy) / (length * length);
        const across = (-px * dy + py * dx) / length;
        const nextDx = to.start.x - to.target.x;
        const nextDy = to.start.y - to.target.y;
        const nextLength = Math.hypot(nextDx, nextDy);
        return clampPoint({
          x: to.target.x + along * nextDx - across * nextDy / nextLength,
          y: to.target.y + along * nextDy + across * nextDx / nextLength
        }, to);
      }

      function syncLayout() {
        if (disposed) return;
        const next = narrowQuery.matches ? LAYOUTS.narrow : LAYOUTS.wide;
        if (next === layout) return;
        pause();
        Object.keys(states).forEach(key => {
          const mapped = remapPoint(states[key], layout, next);
          states[key].x = mapped.x;
          states[key].y = mapped.y;
        });
        layout = next;
        renderGeometry();
        setDifferenceVisibility(state().differences);
      }

      function animateTo(x, y, done) {
        pause();
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

      function nextUnverified() {
        const s = state();
        for (let offset = 1; offset <= 6; offset++) {
          const index = (s.selected + offset) % 6;
          if (!s.verified.has(index)) return index;
        }
        return -1;
      }

      function refreshActions() {
        const s = state();
        const predicting = s.phase === 'predict';
        const next = nextUnverified();
        const other = current === 'dog' ? 'leaf' : 'dog';
        const showNext = !predicting && s.resultShown && next !== -1;
        const showOther = !predicting && s.resultShown && next === -1 && states[other].verified.size < 6;
        q('[data-begin]').hidden = !predicting;
        q('[data-compare]').hidden = predicting;
        q('[data-next]').hidden = !showNext;
        q('[data-next]').textContent = next === -1 ? '验证下一图案' : '验证下一图案 ' + NUMBERS[next];
        q('[data-next-set]').hidden = !showOther;
        q('[data-next-set]').textContent = '继续观察' + SETS[other].name;
        q('[data-compare]').classList.toggle('primary', !predicting && !s.resultShown);
        q('[data-compare]').classList.toggle('secondary', !predicting && s.resultShown);
        q('[data-verify-actions]').hidden = predicting;
        q('[data-nudge]').hidden = predicting;
        q('[data-nudge-home]').hidden = predicting;
        q('[data-phase-label]').textContent = predicting ? '先预测' : s.verified.size === 6 ? '本组完成' : s.resultShown ? '已验证 ' + NUMBERS[s.selected] : '正在验证 ' + NUMBERS[s.selected];
      }

      function renderPrediction() {
        const s = state();
        const selected = Array.from(s.predictions).sort((a, b) => a - b).map(i => NUMBERS[i]).join('、');
        q('[data-prediction-note]').textContent = '我的预测：' + (selected ? selected + ' 可以重合。' : s.phase === 'predict' ? '还未选择（可以多选）。' : '都不能重合。');
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
          return '<button type="button" class="ov-card' + (active ? ' is-selected' : '') + (predicted ? ' is-predicted' : '') + '" data-candidate="' + index + '" aria-pressed="' + active + '" aria-label="' + label + '"><svg viewBox="-88 -88 176 176" aria-hidden="true">' + drawing(current, variant, { fill: '#E0E9DB', stroke: '#3F6659', width: 2.8 }) + '</svg><span class="ov-card-num">' + NUMBERS[index] + '</span><span class="ov-card-status' + (checked ? correct ? ' is-yes' : ' is-no' : '') + '">' + status + '</span></button>';
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
        q('[data-mask-candidate-black]').innerHTML = silhouette(current, variant, 'black');
        q('[data-mask-candidate-white]').innerHTML = silhouette(current, variant, 'white');
        q('[data-moving-label]').textContent = '副本 ' + NUMBERS[s.selected];
        renderGeometry();
        setDifferenceVisibility(s.differences);
      }

      function renderProgress() {
        const s = state();
        const total = states.dog.verified.size + states.leaf.verified.size;
        q('[data-total]').textContent = '已验证 ' + total + ' / 12';
        q('[data-progress]').style.width = (total / 12 * 100) + '%';
        q('[data-group-progress]').textContent = '本组 ' + s.verified.size + ' / 6';
        const summary = q('[data-summary]');
        summary.hidden = s.verified.size !== 6;
        if (s.verified.size === 6) {
          const variants = SETS[current].variants;
          const matches = variants.map((v, i) => v === 'same' ? NUMBERS[i] : '').filter(Boolean).join('、');
          const accurate = variants.reduce((count, v, i) => count + (s.predictions.has(i) === (v === 'same') ? 1 : 0), 0);
          summary.innerHTML = '<strong>本组验证完成</strong><p>' + matches + ' 可以只靠平移重合。</p><p>6 个图案中，你的预测有 ' + accurate + ' 个与验证一致。</p>' + (total === 12 ? '<p>两组都完成了！说一说：平移时，什么保持不变？</p>' : '');
        }
        refreshActions();
        if (total === 12 && !completionReported) {
          completionReported = true;
          kit.markDone();
        }
      }

      function renderPhase() {
        const s = state();
        const predicting = s.phase === 'predict';
        module.dataset.phase = s.phase;
        q('[data-board-title]').textContent = '哪些' + SETS[current].noun + '能与目标重合？';
        q('[data-instruction]').textContent = predicting ? '先比较朝向与轮廓。每个选项的原图都会保留，移动的是透明副本。' : '把透明副本移到目标上，比较轮廓。你可以拖动，也可以使用按钮。';
        q('[data-gallery-title]').textContent = predicting ? '选出可以重合的图案' : '选择要验证的图案';
        q('[data-gallery-subtitle]').textContent = predicting ? '可以多选' : '圆形小勾保留原预测';
        qa('[data-set]').forEach(button => {
          const selected = button.dataset.set === current;
          button.classList.toggle('active', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        renderPrediction();
        renderGallery();
        renderFigures();
        renderProgress();
        kit.feedback(feedback, s.message, s.messageType);
      }

      function notePrediction(s, index, canOverlap) {
        const guessedYes = s.predictions.has(index);
        return guessedYes === canOverlap ? '与你的预测一致。' : guessedYes ? '你原先选了它，现在可以修正这个判断。' : '你原先没有选它，现在发现它也可以。';
      }

      function resultMessage(canOverlap) {
        const s = state();
        const index = s.selected;
        return canOverlap
          ? NUMBERS[index] + ' 可以重合！形状、大小和朝向相同，只改变位置就能完全盖住目标。' + notePrediction(s, index, true)
          : NUMBERS[index] + ' 不能只靠平移重合。' + SETS[current].reasons[SETS[current].variants[index]] + notePrediction(s, index, false);
      }

      function recordResult(canOverlap) {
        const s = state();
        s.verified.set(s.selected, canOverlap);
        s.resultShown = true;
        setDifferenceVisibility(!canOverlap);
        say(resultMessage(canOverlap), canOverlap ? 'success' : 'error');
        renderGallery();
        renderProgress();
      }

      function checkPosition(exactPlacement) {
        if (state().phase !== 'verify') return;
        stopAnimation();
        const s = state();
        const distance = Math.hypot(s.x - layout.target.x, s.y - layout.target.y);
        if (distance > 25) {
          setDifferenceVisibility(false);
          const placementNote = '先移到目标附近，再比较轮廓。也可以使用“移到目标”按钮。';
          say(s.resultShown ? resultMessage(s.verified.get(s.selected)) + ' ' + placementNote : placementNote, s.resultShown && !s.verified.get(s.selected) ? 'error' : 'info');
          return;
        }
        const canOverlap = SETS[current].variants[s.selected] === 'same';
        if (canOverlap && !exactPlacement && distance > .1) {
          animateTo(layout.target.x, layout.target.y, () => recordResult(true));
        } else {
          recordResult(canOverlap);
        }
      }

      function selectCandidate(index) {
        pause();
        const s = state();
        s.selected = index;
        s.x = layout.start.x;
        s.y = layout.start.y;
        s.resultShown = false;
        setDifferenceVisibility(false);
        if (s.phase === 'predict') {
          if (s.predictions.has(index)) s.predictions.delete(index);
          else s.predictions.add(index);
          const selected = Array.from(s.predictions).sort((a, b) => a - b).map(i => NUMBERS[i]).join('、');
          say(selected ? '已选 ' + selected + '。选好后，开始验证。' : '当前未选图案。可以继续选择，也可以验证“都不能重合”的预测。');
        } else {
          say('验证 ' + NUMBERS[index] + '：你原先认为它' + (s.predictions.has(index) ? '可以' : '不能') + '重合。移到目标上，看看预测是否成立。');
        }
        renderPrediction();
        renderGallery();
        renderFigures();
        refreshActions();
      }

      function switchSet(nextSet) {
        if (nextSet === current) return;
        pause();
        current = nextSet;
        renderPhase();
      }

      function nudge(dx, dy, fine) {
        if (state().phase !== 'verify') return;
        pause();
        setDifferenceVisibility(false);
        const step = fine ? 2 : 12;
        position(state().x + dx * step, state().y + dy * step);
      }

      kit.listen(q('[data-gallery]'), 'click', event => {
        const button = event.target.closest('button[data-candidate]');
        if (button) selectCandidate(Number(button.dataset.candidate));
      });
      qa('[data-set]').forEach(button => kit.listen(button, 'click', () => switchSet(button.dataset.set)));
      kit.listen(q('[data-begin]'), 'click', () => {
        state().phase = 'verify';
        state().resultShown = false;
        setDifferenceVisibility(false);
        say('预测已保留。先把副本 ' + NUMBERS[state().selected] + ' 移到目标上。');
        renderPhase();
        q('[data-compare]').focus({ preventScroll: true });
      });
      kit.listen(q('[data-compare]'), 'click', () => {
        if (state().phase !== 'verify') return;
        animateTo(layout.target.x, layout.target.y, () => checkPosition(true));
      });
      kit.listen(q('[data-next]'), 'click', () => {
        if (state().phase !== 'verify' || !state().resultShown) return;
        const next = nextUnverified();
        if (next === -1) return;
        selectCandidate(next);
        q('[data-compare]').focus({ preventScroll: true });
      });
      kit.listen(q('[data-next-set]'), 'click', () => {
        switchSet(current === 'dog' ? 'leaf' : 'dog');
        q(state().phase === 'predict' ? '[data-begin]' : '[data-compare]').focus({ preventScroll: true });
      });
      kit.listen(q('[data-check]'), 'click', () => checkPosition(false));
      kit.listen(q('[data-return]'), 'click', () => {
        animateTo(layout.start.x, layout.start.y);
        if (!state().resultShown) say('副本已归位。可以再次移动，或选择另一个图案。');
      });
      qa('.ov-arrow').forEach(button => kit.listen(button, 'click', () => nudge(Number(button.dataset.dx || 0), Number(button.dataset.dy || 0), false)));
      kit.listen(q('[data-outline]'), 'change', event => { targetOutline.style.display = event.target.checked ? '' : 'none'; });
      kit.listen(q('[data-show-hint]'), 'change', event => { q('[data-hint]').hidden = !event.target.checked; });
      kit.listen(q('[data-reset]'), 'click', () => {
        pause();
        states[current] = freshState(layout);
        renderPhase();
      });

      kit.listen(movable, 'pointerdown', event => {
        if (state().phase !== 'verify' || (event.pointerType === 'mouse' && event.button !== 0)) return;
        if (drag && drag.id !== event.pointerId) return;
        event.preventDefault();
        pause();
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
          animateTo(layout.start.x, layout.start.y);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          pause();
        }
      });
      kit.listen(window, 'resize', syncLayout);
      kit.listen(window, 'resize', syncBoardMode);
      kit.listen(document, 'courseware:displaychange', syncBoardMode);
      if (narrowQuery.addEventListener) kit.listen(narrowQuery, 'change', syncLayout);
      else if (narrowQuery.addListener) {
        narrowQuery.addListener(syncLayout);
        kit.onCleanup(() => narrowQuery.removeListener(syncLayout));
      }
      if (boardQuery.addEventListener) kit.listen(boardQuery, 'change', syncBoardMode);
      else if (boardQuery.addListener) {
        boardQuery.addListener(syncBoardMode);
        kit.onCleanup(() => boardQuery.removeListener(syncBoardMode));
      }

      renderPhase();
      syncBoardMode();
      const destroy = () => {
        if (disposed) return;
        pause();
        disposed = true;
      };
      kit.onCleanup(destroy);
      return { pause, destroy };
    }
  });
})();
