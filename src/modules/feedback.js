/* Closing activity · student self-reflection and browser-local teacher collection. */
Courseware.register({
  id:'feedback',number:6,title:'课后反馈',subtitle:'告诉老师你的收获',icon:'feedback',
  mount(root,kit){
    'use strict';
    const Data=window.CoursewareFeedbackData;
    if(!Data)throw new Error('CoursewareFeedbackData is required.');
    const key='motion-lab-feedback-v1',prefix=kit.uid('fb');
    const goals=Data.GOALS;
    const goalSentences={life:'我能判断生活中的平移和旋转',translation:'我能说出物体平移的方向',rotation:'我能分清顺时针和逆时针',overlap:'我能用平移判断图案能否重合',clock:'我能根据分针说出经过几分钟'};
    const levels=['confident','practice','help','not_practiced'];
    const feelings=['confident','okay','difficult'];
    const labels=Data.MASTERY_LABELS,feelingLabels=Data.EXPERIENCE_LABELS;
    const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const emptyDraft=className=>({mastery:{},experience:'',practice:[],className:className||'',studentCode:'',note:''});
    let draft=emptyDraft(''),records=[],step=1,view='student',filterClass=null,page=0,disposed=false,importing=false;
    let pendingRecord=null,submitted=false,downloadedPending=false,storageKind='persistent',storageProblem='',blockedRaw=null;
    const urls=new Set(),pageSize=12;

    root.innerHTML=`<style>
      .fb-module{font-size:16px;max-width:1280px;margin:0 auto;color:var(--ink,#203d3a)}
      .fb-viewbar{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:20px}
      .fb-viewtabs{display:flex;gap:8px;flex-wrap:wrap}.fb-tab{min-height:46px;padding:10px 20px;border:1px solid #c7d8cc;border-radius:9px;background:#fff;color:#365d50;font:inherit;font-weight:650;cursor:pointer}.fb-tab[aria-pressed=true]{background:#e5f2ed;border-color:#147d77;color:#0c5f5a}
      .fb-count,.fb-secondary{font-size:14px;color:#526b62}.fb-note{margin:0 0 18px;line-height:1.7;color:#46675a;font-size:16px}.fb-intro{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.fb-intro h2{font-size:22px;margin:0 0 7px}.fb-intro p{margin:0;font-size:16px;color:#526b62}.fb-steps{display:flex;gap:7px;align-items:center;white-space:nowrap;color:#526b62;font-size:14px;padding-top:4px}.fb-steps strong{color:#0c5f5a}.fb-steps b{font-weight:400;color:#8ca397}
      .fb-sheet{background:#fff;border:1px solid #d7e2db;border-radius:16px;padding:24px;min-width:0}.fb-fields{border:0;margin:0;padding:0;min-width:0}.fb-goal-list{display:grid;gap:0}.fb-goal-row{display:grid;grid-template-columns:minmax(200px,1.2fr) minmax(0,2fr);gap:24px;align-items:center;padding:17px 0;border-top:1px solid #e1e9e2}.fb-goal-row:first-child{border-top:0;padding-top:4px}.fb-goal-title{font-size:17px;font-weight:650;line-height:1.6;margin:0}.fb-choices{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.fb-choice{min-height:50px;padding:10px 8px;border:1.5px solid #c7d8cc;border-radius:9px;background:#fff;color:#365e50;font:inherit;font-size:16px;font-weight:600;line-height:1.4;cursor:pointer;transition:background 140ms,border-color 140ms,transform 120ms}.fb-choice[aria-pressed=true]{background:#e5f2ed;border-color:#147d77;color:#0c5f5a;box-shadow:inset 0 0 0 1px #147d77}.fb-choice::before{content:'✓ ';font-weight:800;visibility:hidden}.fb-choice[aria-pressed=true]::before{visibility:visible}.fb-choice:active:not(:disabled),.fb-tab:active{transform:translateY(1px)}.fb-choice:disabled{cursor:default;opacity:.7}.fb-choice.fb-unpracticed{font-size:14px;font-weight:500}.fb-goal-row.fb-missing{border-radius:8px;background:#fff6ef;outline:2px solid #d58e6d;outline-offset:5px}
      .fb-footer{border-top:1px solid #d7e2db;margin-top:18px;padding-top:18px;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}.fb-footer p{margin:0;color:#526b62;font-size:14px}.fb-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.fb-feedback:empty{display:none}.fb-feedback{margin-top:16px;font-size:16px}.fb-form-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px}.fb-question{border:0;padding:0;margin:0 0 24px;min-width:0}.fb-question legend,.fb-label{display:block;font-size:18px;font-weight:650;color:#284f43;margin-bottom:12px;line-height:1.5}.fb-question legend small,.fb-label small{font-size:14px;font-weight:400;color:#526b62}.fb-feelings{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.fb-practice{display:flex;gap:8px;flex-wrap:wrap}.fb-practice .fb-choice{padding:10px 14px}.fb-inputs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}.fb-inputs .fb-label{font-size:16px;margin-bottom:8px}.fb-module input[type=text],.fb-module textarea,.fb-module select{width:100%;min-width:0;min-height:46px;border:1px solid #b9cec1;border-radius:9px;padding:11px 12px;background:#fff;color:#203d3a;font:inherit;font-size:16px;line-height:1.5}.fb-module textarea{min-height:142px;resize:vertical}.fb-input-help{font-size:14px;color:#526b62;margin:7px 0 0}.fb-note-count{text-align:right;font-size:14px;color:#526b62;margin-top:4px}.fb-pending{padding:18px;border-left:4px solid #ce8665;background:#fff1e9;border-radius:0 10px 10px 0;margin-top:20px}.fb-pending h3{font-size:20px;margin:0 0 8px}.fb-pending p{margin-bottom:14px;line-height:1.7}.fb-pending .fb-actions{margin-top:12px}.fb-pending-next{margin-top:14px}
      .fb-thanks{max-width:760px;margin:12px auto 0;text-align:center;padding:40px 28px;background:#eef6ea;border-radius:16px}.fb-thanks-mark{width:60px;height:60px;border-radius:50%;background:#147d77;color:#fff;display:grid;place-items:center;font-size:32px;font-weight:700;margin:0 auto 18px}.fb-thanks h2{font-size:28px;margin:0 0 12px}.fb-thanks p{font-size:18px;line-height:1.75;margin:0 0 24px;color:#395e4d}.fb-thanks .btn{min-width:220px}
      .fb-teacher-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:22px}.fb-teacher-head h2{font-size:24px;margin:0 0 8px}.fb-teacher-head p{max-width:760px;margin:0;font-size:16px;color:#526b62;line-height:1.75}.fb-filter{min-width:210px;max-width:320px;flex:1}.fb-filter label{display:block;font-size:14px;color:#526b62;margin-bottom:6px}.fb-storage{padding:14px 18px;border-left:3px solid #ce8665;background:#fff1e9;color:#82442c;margin-bottom:20px;line-height:1.7;font-size:16px}.fb-storage .btn{margin-top:10px}.fb-summary{display:flex;flex-wrap:wrap;gap:32px;margin:0 0 22px}.fb-stat{padding-right:32px;border-right:1px solid #d7e2db}.fb-stat:last-child{padding-right:0;border:0}.fb-stat span{display:block;font-size:14px;color:#526b62}.fb-stat strong{font-size:30px;line-height:1.6;color:#245e51}.fb-stat strong small{font-size:16px;font-weight:500;margin-left:5px}.fb-section{margin-top:26px}.fb-section h3{font-size:20px;margin:0 0 10px}.fb-section>p{font-size:14px;color:#526b62;margin:0 0 14px}.fb-table-wrap{overflow-x:auto}.fb-table{width:100%;border-collapse:collapse;font-size:16px;line-height:1.6}.fb-table th,.fb-table td{padding:13px 12px;border-bottom:1px solid #e0e8df;text-align:center;font-variant-numeric:tabular-nums}.fb-table th{font-size:14px;font-weight:600;color:#526b62}.fb-table th:first-child,.fb-table td:first-child{text-align:left;padding-left:0;width:35%;min-width:150px}.fb-table th:last-child,.fb-table td:last-child{padding-right:0}.fb-table td:first-child{font-weight:600}.fb-table td:nth-child(4){color:#9b5130}.fb-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}.fb-tallies{display:grid;gap:10px;margin:0;padding:0;list-style:none}.fb-tallies li{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #e4ebe3;padding:8px 0;font-size:16px}.fb-tallies strong{font-size:18px;color:#245e51;white-space:nowrap}.fb-empty{padding:24px 0;color:#526b62;line-height:1.8}.fb-record-list{display:grid;gap:12px}.fb-record{padding:14px 0;border-bottom:1px solid #d7e2db}.fb-record-head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.fb-record-head strong{font-size:17px}.fb-record-head span{font-size:14px;color:#526b62}.fb-record-note{white-space:pre-wrap;overflow-wrap:anywhere;font-size:16px;line-height:1.8;margin:8px 0;color:#385f50}.fb-record summary{min-height:44px;align-content:center;font-size:14px;color:#526b62;cursor:pointer}.fb-record dl{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 20px;font-size:14px;margin:8px 0}.fb-record dt,.fb-record dd{margin:0}.fb-record dd{font-weight:650;color:#345b4a}.fb-pagination{display:flex;justify-content:center;align-items:center;gap:16px;margin-top:18px;font-size:14px;color:#526b62}.fb-tools{margin-top:26px;padding-top:22px;border-top:1px solid #d7e2db}.fb-tools h3{font-size:18px;margin:0 0 12px}.fb-tools p{font-size:14px;color:#526b62;line-height:1.7;margin-top:10px}.fb-tools input[type=file]{max-width:100%;font-size:16px;min-height:44px;padding:9px 0}.fb-import{margin-top:18px}.fb-import label{display:block;font-size:16px;font-weight:650;margin-bottom:4px}.fb-clear-area{margin-top:24px}.fb-danger{color:#934d32!important;border-color:#d9b7a5!important}.fb-clear-confirm{border-left:3px solid #ce8665;background:#fff1e9;padding:16px 18px;margin-top:12px;border-radius:0 8px 8px 0}.fb-clear-confirm p{margin:0 0 12px;color:#82442c;font-size:16px}.fb-module [hidden]{display:none!important}.fb-module button:focus-visible,.fb-module input:focus-visible,.fb-module textarea:focus-visible,.fb-module select:focus-visible,.fb-module summary:focus-visible{outline:3px solid #c55d36;outline-offset:4px}
      @media(max-width:820px){.fb-form-grid{grid-template-columns:1fr;gap:4px}.fb-goal-row{grid-template-columns:1fr;gap:10px}.fb-mini-grid{grid-template-columns:1fr;gap:0}.fb-intro{flex-direction:column;gap:10px}.fb-sheet{padding:20px}.fb-teacher-head{gap:16px}.fb-filter{max-width:none}.fb-table th,.fb-table td{padding:12px 8px}.fb-table{min-width:550px}.fb-stat{padding-right:22px}.fb-summary{gap:22px}}
      @media(max-width:480px){.fb-sheet{padding:16px}.fb-viewtabs{flex:1}.fb-tab{flex:1;padding:10px 12px}.fb-viewbar{gap:10px}.fb-choices{grid-template-columns:repeat(2,minmax(0,1fr))}.fb-choice.fb-unpracticed{font-size:16px}.fb-inputs{grid-template-columns:1fr}.fb-inputs .fb-label{font-size:16px}.fb-feelings{gap:6px}.fb-feelings .fb-choice{padding:10px 5px}.fb-intro h2{font-size:21px}.fb-footer{align-items:flex-start}.fb-footer>.fb-actions{width:100%;justify-content:space-between}.fb-thanks{padding:30px 20px}.fb-thanks h2{font-size:24px}.fb-stat strong{font-size:27px}.fb-count{flex-basis:100%}}
      @media(min-width:1000px){:root[data-board-mode="whiteboard"] .fb-module{font-size:20px;max-width:1500px}:root[data-board-mode="whiteboard"] .fb-tab{min-height:56px;font-size:20px;padding:12px 24px}:root[data-board-mode="whiteboard"] .fb-count,:root[data-board-mode="whiteboard"] .fb-secondary{font-size:18px}:root[data-board-mode="whiteboard"] .fb-sheet{padding:28px 32px}:root[data-board-mode="whiteboard"] .fb-intro h2{font-size:28px}:root[data-board-mode="whiteboard"] .fb-intro p,:root[data-board-mode="whiteboard"] .fb-note{font-size:20px}:root[data-board-mode="whiteboard"] .fb-steps{font-size:18px}:root[data-board-mode="whiteboard"] .fb-goal-row{grid-template-columns:minmax(240px,1.25fr) minmax(0,2fr);gap:28px;padding:18px 0}:root[data-board-mode="whiteboard"] .fb-goal-title{font-size:21px}:root[data-board-mode="whiteboard"] .fb-choice{min-height:56px;font-size:20px;padding:12px 8px}:root[data-board-mode="whiteboard"] .fb-choice.fb-unpracticed{font-size:20px}:root[data-board-mode="whiteboard"] .fb-question legend,:root[data-board-mode="whiteboard"] .fb-label{font-size:22px}:root[data-board-mode="whiteboard"] .fb-inputs .fb-label{font-size:20px}:root[data-board-mode="whiteboard"] .fb-question legend small,:root[data-board-mode="whiteboard"] .fb-label small{font-size:18px}:root[data-board-mode="whiteboard"] .fb-module input[type=text],:root[data-board-mode="whiteboard"] .fb-module textarea,:root[data-board-mode="whiteboard"] .fb-module select{min-height:56px;font-size:20px;padding:12px 14px}:root[data-board-mode="whiteboard"] .fb-module textarea{min-height:166px}:root[data-board-mode="whiteboard"] .fb-input-help,:root[data-board-mode="whiteboard"] .fb-note-count,:root[data-board-mode="whiteboard"] .fb-footer p{font-size:18px}:root[data-board-mode="whiteboard"] .fb-feedback,:root[data-board-mode="whiteboard"] .fb-storage,:root[data-board-mode="whiteboard"] .fb-pending p{font-size:20px}:root[data-board-mode="whiteboard"] .fb-thanks h2{font-size:34px}:root[data-board-mode="whiteboard"] .fb-thanks p{font-size:22px}:root[data-board-mode="whiteboard"] .fb-teacher-head h2{font-size:28px}:root[data-board-mode="whiteboard"] .fb-teacher-head p,:root[data-board-mode="whiteboard"] .fb-table,:root[data-board-mode="whiteboard"] .fb-tallies li,:root[data-board-mode="whiteboard"] .fb-record-note{font-size:20px}:root[data-board-mode="whiteboard"] .fb-table th,:root[data-board-mode="whiteboard"] .fb-filter label,:root[data-board-mode="whiteboard"] .fb-stat span,:root[data-board-mode="whiteboard"] .fb-section>p,:root[data-board-mode="whiteboard"] .fb-record-head span,:root[data-board-mode="whiteboard"] .fb-record dl,:root[data-board-mode="whiteboard"] .fb-tools p{font-size:18px}:root[data-board-mode="whiteboard"] .fb-stat strong{font-size:38px}:root[data-board-mode="whiteboard"] .fb-stat strong small{font-size:20px}:root[data-board-mode="whiteboard"] .fb-section h3,:root[data-board-mode="whiteboard"] .fb-tools h3{font-size:24px}:root[data-board-mode="whiteboard"] .fb-tallies strong,:root[data-board-mode="whiteboard"] .fb-record-head strong,:root[data-board-mode="whiteboard"] .fb-import label{font-size:22px}:root[data-board-mode="whiteboard"] .fb-record summary{font-size:20px;min-height:56px}:root[data-board-mode="whiteboard"] .fb-tools input[type=file]{min-height:56px;font-size:20px}:root[data-board-mode="whiteboard"] .fb-clear-confirm p{font-size:20px}}
      @media(prefers-reduced-motion:reduce){.fb-choice,.fb-tab{transition:none}.fb-choice:active,.fb-tab:active{transform:none}}
      @media print{.fb-viewbar,.fb-tools,.fb-filter,.fb-pagination{display:none!important}.fb-sheet{border:0;padding:0}.fb-record{break-inside:avoid}.fb-table-wrap{overflow:visible}}
    </style>
    <section class="fb-module" aria-label="课后学习反馈">
      <div class="fb-viewbar"><div class="fb-viewtabs" role="group" aria-label="选择反馈页面"><button type="button" class="fb-tab" data-fb-view="student" aria-pressed="true">学生填写</button><button type="button" class="fb-tab" data-fb-view="teacher" aria-pressed="false">教师汇总</button></div><span class="fb-count" data-fb-count></span></div>
      <div data-fb-student>
        <form class="fb-sheet" data-fb-form novalidate>
          <fieldset class="fb-fields" data-fb-fields>
            <section data-fb-step="1"><div class="fb-intro"><div><h2>先选一选自己的情况</h2><p>每一项选一个最像你的情况。今天没做的活动，可以选“今天没练过”。</p></div><div class="fb-steps" aria-label="第1步，共2步"><strong>1 掌握情况</strong><b>→</b><span>2 想说的话</span></div></div>
              <p class="fb-note">一位同学填写一份。可以匿名，自评不打分。</p>
              <div class="fb-goal-list">${goals.map((goal,index)=>`<div class="fb-goal-row" data-fb-row="${goal.id}"><h3 class="fb-goal-title" id="${prefix}-${goal.id}">${index+1}. ${goalSentences[goal.id]}</h3><div class="fb-choices" role="group" aria-labelledby="${prefix}-${goal.id}">${levels.map(value=>`<button type="button" class="fb-choice${value==='not_practiced'?' fb-unpracticed':''}" data-fb-goal="${goal.id}" data-fb-value="${value}" aria-pressed="false">${escape(labels[value])}</button>`).join('')}</div></div>`).join('')}</div>
            </section>
            <section data-fb-step="2" hidden><div class="fb-intro"><div><h2>还有什么想告诉老师？</h2><p>你的感受能帮助老师安排下一次练习。</p></div><div class="fb-steps" aria-label="第2步，共2步"><span>1 掌握情况</span><b>→</b><strong>2 想说的话</strong></div></div>
              <div class="fb-form-grid"><div><fieldset class="fb-question"><legend>现在，我对这节课 <small>必选一项</small></legend><div class="fb-feelings" role="group" aria-label="选择学习感受">${feelings.map(value=>`<button type="button" class="fb-choice" data-fb-feeling="${value}" aria-pressed="false">${escape(feelingLabels[value])}</button>`).join('')}</div></fieldset>
              <fieldset class="fb-question"><legend>我最想再练什么？ <small>可多选，也可不选</small></legend><div class="fb-practice" role="group" aria-label="想再练习的内容">${goals.map(goal=>`<button type="button" class="fb-choice" data-fb-practice="${goal.id}" aria-pressed="false">${escape(goal.label)}</button>`).join('')}</div></fieldset></div>
              <div><label class="fb-label" for="${prefix}-note">想对老师说 <small>选填</small></label><textarea id="${prefix}-note" data-fb-note maxlength="300" rows="4" placeholder="例如：我还想再试一试逆时针转动。"></textarea><div class="fb-note-count" data-fb-note-count>0 / 300 字</div>
                <div class="fb-inputs"><div><label class="fb-label" for="${prefix}-class">课堂 / 班级 <small>选填</small></label><input id="${prefix}-class" data-fb-class type="text" maxlength="40" autocomplete="off" placeholder="如：三（2）班"><p class="fb-input-help">下一位同学会沿用这一项。</p></div><div><label class="fb-label" for="${prefix}-student">学生代号 <small>选填</small></label><input id="${prefix}-student" data-fb-student-code type="text" maxlength="30" autocomplete="off" placeholder="留空就是匿名"><p class="fb-input-help">不需要填写真实姓名。</p></div></div>
              </div></div>
            </section>
          </fieldset>
          <div class="feedback fb-feedback" data-fb-form-feedback role="status" aria-live="polite"></div>
          <div class="fb-footer" data-fb-form-footer><p data-fb-step-status aria-live="polite">已选择 0 / 5 项</p><div class="fb-actions"><button type="button" class="btn ghost" data-fb-back hidden>← 上一步</button><button type="button" class="btn primary" data-fb-continue>下一步：想说的话 →</button><button type="submit" class="btn primary" data-fb-submit hidden>交给老师</button></div></div>
          <section class="fb-pending" data-fb-pending hidden aria-label="反馈尚未保存"><h3>这份反馈尚未保存</h3><p data-fb-pending-message></p><div class="fb-actions"><button type="button" class="btn primary" data-fb-retry>重试保存</button><button type="button" class="btn secondary" data-fb-download-one>下载本份反馈</button><button type="button" class="btn ghost" data-fb-edit>返回修改</button></div><div class="fb-pending-next" data-fb-file-handoff hidden><p>请先确认下载的文件已经保存，再交给下一位同学。</p><button type="button" class="btn secondary" data-fb-handoff-file>文件已保存，下一位</button></div></section>
        </form>
        <section class="fb-thanks" data-fb-thanks hidden aria-label="反馈交接"><div class="fb-thanks-mark" aria-hidden="true">✓</div><h2>反馈收到了，谢谢你！</h2><p data-fb-thanks-message>这份反馈已保存在当前页面的浏览器中。请把白板交给下一位同学。</p><button type="button" class="btn primary" data-fb-next-student>下一位同学填写</button></section>
      </div>
      <section class="fb-sheet" data-fb-teacher hidden aria-label="教师反馈汇总">
        <div class="fb-teacher-head"><div><h2>看看大家需要什么帮助</h2><p>反馈保存在当前页面的浏览器中，可导出。其他设备导出的 JSON 可导入汇总，不会自动联网同步。</p></div><div class="fb-filter"><label for="${prefix}-filter">查看课堂 / 班级</label><select id="${prefix}-filter" data-fb-filter aria-label="筛选课堂或班级"><option value="all">全部反馈</option></select></div></div>
        <div class="fb-storage" data-fb-storage hidden><div data-fb-storage-text></div><button type="button" class="btn secondary" data-fb-original hidden>下载原始存储备份</button></div>
        <div class="fb-summary"><div class="fb-stat"><span>当前筛选反馈</span><strong><span data-fb-total style="display:inline;font:inherit;color:inherit">0</span><small>份</small></strong></div><div class="fb-stat"><span>其中含“请帮我”</span><strong><span data-fb-help-total style="display:inline;font:inherit;color:inherit">0</span><small>份</small></strong></div></div>
        <div data-fb-empty class="fb-empty">还没有反馈。切回“学生填写”，让同学完成调查；也可以导入其他设备的反馈文件。</div>
        <div data-fb-results hidden><section class="fb-section"><h3>各项学习情况</h3><p>单位：份反馈。“今天没练过”单独列出，不纳入已练习的自评。反馈份数不等于去重学生人数。</p><div class="fb-table-wrap"><table class="fb-table"><thead><tr><th scope="col">学习目标</th>${levels.map(value=>`<th scope="col">${escape(labels[value])}</th>`).join('')}</tr></thead><tbody data-fb-mastery-summary></tbody></table></div></section>
          <div class="fb-mini-grid"><section class="fb-section"><h3>最想再练的内容</h3><p>这一题可多选，合计可能超过反馈份数。</p><ul class="fb-tallies" data-fb-practice-summary></ul></section><section class="fb-section"><h3>学习感受</h3><p>按同学自己选择的感受汇总。</p><ul class="fb-tallies" data-fb-feeling-summary></ul></section></div>
          <section class="fb-section"><h3>同学的反馈与留言</h3><p>未填写学生代号的反馈显示为“匿名同学”。</p><div class="fb-record-list" data-fb-records></div><div class="fb-pagination"><button type="button" class="btn ghost small" data-fb-page-prev>上一页</button><span data-fb-page-label>第 1 页</span><button type="button" class="btn ghost small" data-fb-page-next>下一页</button></div></section>
        </div>
        <section class="fb-tools"><h3>带走或合并反馈</h3><div class="fb-actions"><button type="button" class="btn primary" data-fb-export-csv>导出当前反馈 CSV</button><button type="button" class="btn secondary" data-fb-export-json>备份当前反馈 JSON</button></div><p>CSV 适合用表格软件查看；JSON 可以在此页导入合并。导出范围与上方班级筛选一致。</p><div class="fb-import"><label for="${prefix}-import">导入反馈 JSON</label><input id="${prefix}-import" data-fb-import type="file" accept=".json,application/json"><p>选择由本课件导出的 JSON 文件，最多 5 MiB。同一份反馈重复导入不会重复计数。</p></div><div class="feedback fb-feedback" data-fb-teacher-feedback role="status" aria-live="polite"></div>
          <details class="fb-clear-area"><summary>管理本机记录</summary><button type="button" class="btn ghost fb-danger" data-fb-clear-ask>清空本机全部反馈</button><div class="fb-clear-confirm" data-fb-clear-confirm hidden><p>将清空本页保存和暂存的全部反馈，不限于当前筛选。请先导出需要保留的记录。</p><div class="fb-actions"><button type="button" class="btn fb-danger" data-fb-clear-confirm-button>确认清空全部反馈</button><button type="button" class="btn secondary" data-fb-clear-cancel>取消，保留反馈</button></div></div></details>
        </section>
      </section>
    </section>`;

    const $=selector=>root.querySelector(selector),$$=selector=>[...root.querySelectorAll(selector)];
    const form=$('[data-fb-form]'),formFeedback=$('[data-fb-form-feedback]'),teacherFeedback=$('[data-fb-teacher-feedback]');
    const focus=element=>{if(element){element.focus({preventScroll:true});if(element.scrollIntoView)element.scrollIntoView({block:'nearest'});}};
    const errorsText=result=>(result.errors||['数据不符合要求。']).join(' ');
    function setStorageProblem(kind,message,raw=null){storageKind=kind;storageProblem=message;if(raw!==null)blockedRaw=raw;updateStorageNotice();}
    function updateStorageNotice(){
      if(disposed)return;
      $('[data-fb-storage]').hidden=storageKind==='persistent';
      $('[data-fb-storage-text]').textContent=storageProblem;
      $('[data-fb-original]').hidden=blockedRaw===null;
      $('[data-fb-count]').textContent=records.length+' 份反馈'+(storageKind==='persistent'?' · 本机保存':' · 含当前页面暂存');
    }
    function readStored(){
      try{
        const raw=localStorage.getItem(key);
        if(raw===null||raw==='')return{ok:true,records:[]};
        const parsed=Data.parseImport(raw);
        if(!parsed.ok){setStorageProblem('blocked','本机原有数据无法读取，已保留原始内容。新反馈只能暂存；请先下载原始备份及当前反馈。',raw);return{ok:false};}
        return {...parsed,raw};
      }catch(error){setStorageProblem('memory','当前浏览器不能保存反馈。记录仅暂存在当前页面，关闭或刷新前请导出。');return{ok:false};}
    }
    function mergeLatest(){
      const latest=readStored();
      if(!latest.ok)return false;
      const merged=Data.mergeRecords(records,latest.records);
      if(!merged.ok){setStorageProblem('blocked','本机记录与当前暂存记录存在冲突，尚未覆盖任何内容。请分别导出后核对。',latest.raw||null);return false;}
      records=merged.records;return true;
    }
    function saveAll(){
      if(!mergeLatest())return false;
      try{localStorage.setItem(key,Data.exportJson(records));storageKind='persistent';storageProblem='';blockedRaw=null;updateStorageNotice();if(pendingRecord&&records.some(record=>record.id===pendingRecord.id))showThanks(view==='student');return true;}
      catch(error){setStorageProblem('memory','反馈尚未写入本机存储，已暂存在当前页面。请重试保存，或在关闭、刷新前导出。');return false;}
    }
    const initial=readStored();if(initial.ok)records=initial.records;

    function updateDraftButtons(){
      $$('[data-fb-goal]').forEach(button=>button.setAttribute('aria-pressed',String(draft.mastery[button.dataset.fbGoal]===button.dataset.fbValue)));
      $$('[data-fb-feeling]').forEach(button=>button.setAttribute('aria-pressed',String(draft.experience===button.dataset.fbFeeling)));
      $$('[data-fb-practice]').forEach(button=>button.setAttribute('aria-pressed',String(draft.practice.includes(button.dataset.fbPractice))));
      $('[data-fb-step-status]').textContent=step===1?'已选择 '+Object.keys(draft.mastery).length+' / 5 项':'选好学习感受，就可以交给老师。留言和代号都可留空。';
    }
    function showStep(number){
      step=number;
      $$('[data-fb-step]').forEach(section=>section.hidden=Number(section.dataset.fbStep)!==number);
      $('[data-fb-back]').hidden=number===1;
      $('[data-fb-continue]').hidden=number!==1;
      $('[data-fb-submit]').hidden=number!==2;
      formFeedback.textContent='';updateDraftButtons();
    }
    function validateGoals(){
      const missing=goals.filter(goal=>!levels.includes(draft.mastery[goal.id]));
      $$('[data-fb-row]').forEach(row=>row.classList.toggle('fb-missing',missing.some(goal=>goal.id===row.dataset.fbRow)));
      if(!missing.length)return true;
      showStep(1);kit.feedback(formFeedback,'还有 '+missing.length+' 项没有选择。请从“'+goalSentences[missing[0].id]+'”开始补充；没练过可以如实选择。','error');
      focus($('[data-fb-goal="'+missing[0].id+'"]'));return false;
    }
    function createId(){const source=typeof crypto!=='undefined'?crypto:window.crypto;return source&&typeof source.randomUUID==='function'?source.randomUUID():'fb-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);}
    function captureText(){draft.className=$('[data-fb-class]').value;draft.studentCode=$('[data-fb-student-code]').value;draft.note=$('[data-fb-note]').value;}
    function showPending(){
      $('[data-fb-pending]').hidden=false;$('[data-fb-fields]').disabled=true;$('[data-fb-form-footer]').hidden=true;
      $('[data-fb-pending-message]').textContent=storageProblem+' 本次答案仍保留，可重试保存，或下载本份反馈交给老师。';
      $('[data-fb-file-handoff]').hidden=!downloadedPending;formFeedback.textContent='';updateStorageNotice();
    }
    function showThanks(moveFocus=true){
      submitted=true;pendingRecord=null;form.hidden=true;$('[data-fb-thanks]').hidden=false;
      $('[data-fb-thanks-message]').textContent='这份反馈已保存在当前页面的浏览器中。请把白板交给下一位同学。';
      updateStorageNotice();if(moveFocus)focus($('[data-fb-next-student]'));
    }
    function resetStudent(){
      captureText();draft=emptyDraft(draft.className);pendingRecord=null;submitted=false;downloadedPending=false;
      $('[data-fb-student-code]').value='';$('[data-fb-note]').value='';$('[data-fb-note-count]').textContent='0 / 300 字';
      $('[data-fb-class]').value=draft.className;$('[data-fb-fields]').disabled=false;$('[data-fb-pending]').hidden=true;$('[data-fb-file-handoff]').hidden=true;$('[data-fb-form-footer]').hidden=false;
      $('[data-fb-thanks]').hidden=true;form.hidden=false;$$('[data-fb-row]').forEach(row=>row.classList.remove('fb-missing'));showStep(1);focus($('[data-fb-goal]'));
    }
    function submitSurvey(event){
      event.preventDefault();if(disposed||submitted||pendingRecord)return;
      if(!validateGoals())return;
      if(!feelings.includes(draft.experience)){showStep(2);kit.feedback(formFeedback,'请先选择现在的学习感受：有信心、还在练，或有点难。','error');focus($('[data-fb-feeling]'));return;}
      captureText();const candidate={id:createId(),createdAt:new Date().toISOString(),...draft,mastery:{...draft.mastery},practice:[...draft.practice]};
      const validated=Data.validateRecord(candidate);
      if(!validated.ok){kit.feedback(formFeedback,errorsText(validated),'error');return;}
      const merged=Data.mergeRecords(records,[validated.record]);
      if(!merged.ok){kit.feedback(formFeedback,errorsText(merged),'error');return;}
      records=merged.records;pendingRecord=validated.record;downloadedPending=false;
      if(!saveAll()){showPending();focus($('[data-fb-retry]'));}
    }
    function download(content,name,type){
      try{
        if(typeof Blob==='undefined'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function')throw new Error('Download unavailable');
        const url=URL.createObjectURL(new Blob([content],{type}));urls.add(url);
        const link=document.createElement('a');link.setAttribute('href',url);link.setAttribute('download',name);link.hidden=true;root.appendChild(link);link.click();
        if(link.remove)link.remove();else if(link.parentNode)link.parentNode.removeChild(link);
        setTimeout(()=>{URL.revokeObjectURL(url);urls.delete(url);},30000);return true;
      }catch(error){const target=view==='teacher'?teacherFeedback:formFeedback;kit.feedback(target,'当前窗口不能下载文件。请在浏览器中单独打开这份 HTML，再导出反馈。','error');return false;}
    }
    function filename(suffix){return '平移与旋转-学习反馈-'+new Date(Date.now()+8*60*60*1000).toISOString().slice(0,10)+suffix;}
    function exportRecords(selected,kind,suffix){
      try{return download(kind==='csv'?Data.csv(selected):Data.exportJson(selected),filename(suffix),kind==='csv'?'text/csv;charset=utf-8':'application/json;charset=utf-8');}
      catch(error){kit.feedback(view==='teacher'?teacherFeedback:formFeedback,'未生成文件。'+(error&&error.message?error.message:'请按班级筛选后重试。'),'error');return false;}
    }
    function selectedRecords(){return records.filter(record=>filterClass===null||record.className===filterClass);}
    function classes(){return [...new Set(records.map(record=>record.className))].sort((a,b)=>a.localeCompare(b,'zh-CN'));}
    function dateLabel(value){return new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
    function syncBusy(){
      $('[data-fb-import]').disabled=importing;
      $('[data-fb-clear-ask]').disabled=importing||(records.length===0&&blockedRaw===null);
      $('[data-fb-clear-confirm-button]').disabled=importing;
    }
    function renderTeacher(){
      const names=classes();if(filterClass!==null&&!names.includes(filterClass))filterClass=null;
      $('[data-fb-filter]').innerHTML='<option value="all">全部反馈</option>'+names.map((name,index)=>'<option value="'+index+'">'+escape(name||'未填写班级')+'</option>').join('');
      $('[data-fb-filter]').value=filterClass===null?'all':String(names.indexOf(filterClass));
      const visible=selectedRecords(),summary=Data.summarize(visible);
      $('[data-fb-total]').textContent=summary.total;$('[data-fb-help-total]').textContent=summary.needsHelp;
      $('[data-fb-empty]').hidden=visible.length>0;$('[data-fb-results]').hidden=visible.length===0;
      $('[data-fb-export-csv]').disabled=visible.length===0;$('[data-fb-export-json]').disabled=visible.length===0;
      $('[data-fb-mastery-summary]').innerHTML=goals.map(goal=>'<tr><td>'+escape(goal.label)+'<span class="fb-secondary" style="display:block;font-weight:400">有效自评 '+summary.mastery[goal.id].assessed+' 份</span></td>'+levels.map(level=>'<td>'+summary.mastery[goal.id][level]+'</td>').join('')+'</tr>').join('');
      $('[data-fb-practice-summary]').innerHTML=goals.map(goal=>'<li><span>'+escape(goal.label)+'</span><strong>'+summary.practice[goal.id]+' 份</strong></li>').join('');
      $('[data-fb-feeling-summary]').innerHTML=feelings.map(feeling=>'<li><span>'+escape(feelingLabels[feeling])+'</span><strong>'+summary.experience[feeling]+' 份</strong></li>').join('');
      const totalPages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.max(0,Math.min(totalPages-1,page));
      const list=[...visible].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(page*pageSize,(page+1)*pageSize);
      $('[data-fb-records]').innerHTML=list.map(record=>'<article class="fb-record"><div class="fb-record-head"><strong>'+escape(record.studentCode||'匿名同学')+'</strong><span>'+escape((record.className||'未填写班级')+' · '+dateLabel(record.createdAt))+'</span></div><p class="fb-record-note">'+escape(record.note||'没有留下文字，已完成选项反馈。')+'</p><details><summary>查看这份反馈的选择</summary><dl>'+goals.map(goal=>'<dt>'+escape(goal.label)+'</dt><dd>'+escape(labels[record.mastery[goal.id]])+'</dd>').join('')+'<dt>学习感受</dt><dd>'+escape(feelingLabels[record.experience])+'</dd></dl><p class="fb-secondary">想再练：'+escape(record.practice.length?record.practice.map(id=>goals.find(goal=>goal.id===id).label).join('、'):'未选择')+'</p></details></article>').join('');
      $('[data-fb-page-label]').textContent='第 '+(page+1)+' / '+totalPages+' 页';$('[data-fb-page-prev]').disabled=page===0;$('[data-fb-page-next]').disabled=page>=totalPages-1;
      syncBusy();updateStorageNotice();
    }
    function switchView(next){
      if(next===view)return;view=next;
      $$('[data-fb-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.fbView===view)));
      $('[data-fb-student]').hidden=view!=='student';$('[data-fb-teacher]').hidden=view!=='teacher';
      if(view==='teacher'){mergeLatest();renderTeacher();}
    }
    async function importFile(event){
      const input=event.target,file=input.files&&input.files[0];if(!file||importing)return;
      if(file.size>Data.MAX_IMPORT_BYTES){kit.feedback(teacherFeedback,'文件超过 5 MiB，请按班级分批导出后再导入。','error');input.value='';return;}
      importing=true;syncBusy();kit.feedback(teacherFeedback,'正在读取反馈文件……');
      try{
        const content=await file.text();if(disposed)return;
        const parsed=Data.parseImport(content);if(!parsed.ok){kit.feedback(teacherFeedback,'没有导入，已有反馈保持不变。'+errorsText(parsed),'error');return;}
        const merged=Data.mergeRecords(records,parsed.records);if(!merged.ok){kit.feedback(teacherFeedback,'没有导入，已有反馈保持不变。'+errorsText(merged),'error');return;}
        records=merged.records;const saved=saveAll();page=0;renderTeacher();
        kit.feedback(teacherFeedback,(saved?'已导入并保存':'已合并到当前页面，尚未保存')+' '+merged.added+' 份反馈；跳过 '+(merged.duplicates+(parsed.duplicates||0))+' 份重复记录。'+(saved?'':'请导出备份后再关闭页面。'),saved?'success':'error');
      }catch(error){if(!disposed)kit.feedback(teacherFeedback,'没有导入，无法读取这个文件。请使用本课件导出的 JSON 文件重试。','error');}
      finally{importing=false;if(!disposed){syncBusy();input.value='';}}
    }
    function clearRecords(){
      if(importing){kit.feedback(teacherFeedback,'反馈文件正在导入，请完成后再清空记录。');return;}
      try{localStorage.setItem(key,Data.exportJson([]));}
      catch(error){kit.feedback(teacherFeedback,'无法清空本机存储，记录尚未删除。请先导出备份，再在浏览器中处理存储权限。','error');return;}
      records=[];pendingRecord=null;blockedRaw=null;storageKind='persistent';storageProblem='';filterClass=null;page=0;
      $('[data-fb-clear-confirm]').hidden=true;resetStudent();renderTeacher();kit.feedback(teacherFeedback,'本机全部反馈已清空。','success');focus($('[data-fb-view="student"]'));
    }
    kit.listen(root,'click',event=>{
      const button=event.target.closest('button');if(!button||!root.contains(button)||button.disabled)return;
      if(button.hasAttribute('data-fb-view')){switchView(button.dataset.fbView);return;}
      if(button.hasAttribute('data-fb-goal')&&!pendingRecord&&!submitted){draft.mastery[button.dataset.fbGoal]=button.dataset.fbValue;$('[data-fb-row="'+button.dataset.fbGoal+'"]').classList.remove('fb-missing');updateDraftButtons();formFeedback.textContent='';return;}
      if(button.hasAttribute('data-fb-feeling')&&!pendingRecord&&!submitted){draft.experience=button.dataset.fbFeeling;updateDraftButtons();formFeedback.textContent='';return;}
      if(button.hasAttribute('data-fb-practice')&&!pendingRecord&&!submitted){const id=button.dataset.fbPractice;draft.practice=draft.practice.includes(id)?draft.practice.filter(value=>value!==id):[...draft.practice,id];updateDraftButtons();return;}
      if(button.hasAttribute('data-fb-continue')){if(validateGoals()){showStep(2);focus($('[data-fb-feeling]'));}return;}
      if(button.hasAttribute('data-fb-back')){captureText();showStep(1);focus($('[data-fb-goal]'));return;}
      if(button.hasAttribute('data-fb-next-student')){resetStudent();return;}
      if(button.hasAttribute('data-fb-retry')){if(pendingRecord&&!saveAll())showPending();return;}
      if(button.hasAttribute('data-fb-download-one')){if(pendingRecord&&exportRecords([pendingRecord],'json','-本份.json')){downloadedPending=true;$('[data-fb-file-handoff]').hidden=false;}return;}
      if(button.hasAttribute('data-fb-handoff-file')){if(pendingRecord&&downloadedPending)resetStudent();return;}
      if(button.hasAttribute('data-fb-edit')){if(pendingRecord){records=records.filter(record=>record.id!==pendingRecord.id);pendingRecord=null;downloadedPending=false;$('[data-fb-fields]').disabled=false;$('[data-fb-pending]').hidden=true;$('[data-fb-form-footer]').hidden=false;updateStorageNotice();focus($('[data-fb-feeling]'));}return;}
      if(button.hasAttribute('data-fb-export-csv')){const selected=selectedRecords();if(selected.length&&exportRecords(selected,'csv','.csv'))kit.feedback(teacherFeedback,'已生成当前筛选的 '+selected.length+' 份反馈 CSV。请确认文件已下载。','success');return;}
      if(button.hasAttribute('data-fb-export-json')){const selected=selectedRecords();if(selected.length&&exportRecords(selected,'json','.json'))kit.feedback(teacherFeedback,'已生成当前筛选的 '+selected.length+' 份反馈 JSON。请确认文件已下载。','success');return;}
      if(button.hasAttribute('data-fb-original')){if(blockedRaw!==null)download(blockedRaw,filename('-原始存储.txt'),'text/plain;charset=utf-8');return;}
      if(button.hasAttribute('data-fb-page-prev')){page--;renderTeacher();focus($('[data-fb-page-prev]'));return;}
      if(button.hasAttribute('data-fb-page-next')){page++;renderTeacher();focus($('[data-fb-page-next]'));return;}
      if(button.hasAttribute('data-fb-clear-ask')){$('[data-fb-clear-confirm]').hidden=false;focus($('[data-fb-clear-cancel]'));return;}
      if(button.hasAttribute('data-fb-clear-cancel')){$('[data-fb-clear-confirm]').hidden=true;focus($('[data-fb-clear-ask]'));return;}
      if(button.hasAttribute('data-fb-clear-confirm-button'))clearRecords();
    });
    kit.listen(form,'submit',submitSurvey);
    kit.listen($('[data-fb-note]'),'input',()=>{draft.note=$('[data-fb-note]').value;$('[data-fb-note-count]').textContent=draft.note.length+' / 300 字';});
    kit.listen($('[data-fb-class]'),'input',()=>draft.className=$('[data-fb-class]').value);
    kit.listen($('[data-fb-student-code]'),'input',()=>draft.studentCode=$('[data-fb-student-code]').value);
    kit.listen($('[data-fb-filter]'),'change',event=>{filterClass=event.target.value==='all'?null:classes()[Number(event.target.value)];page=0;renderTeacher();});
    kit.listen($('[data-fb-import]'),'change',importFile);
    showStep(1);updateStorageNotice();renderTeacher();
    return{pause(){},destroy(){disposed=true;for(const url of urls){try{URL.revokeObjectURL(url);}catch(error){}}urls.clear();}};
  }
});
