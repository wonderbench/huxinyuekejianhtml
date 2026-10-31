/* Shared lifecycle and accessible interface. All runnable HTML files embed this code. */
(function(){
  'use strict';
  const modules=[];
  let uid=0;
  function createKit(markDone){
    const cleanup=[];
    let disposed=false;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function onCleanup(fn){cleanup.push(fn);}
    function listen(el,type,fn,opts){if(!el)return;el.addEventListener(type,fn,opts);onCleanup(()=>el.removeEventListener(type,fn,opts));}
    function tween(from,to,duration,update,done){
      let frame=0,last=0,elapsed=0,running=true,cancelled=false,finished=false;
      const length=Math.max(1,duration);
      function tick(now){
        if(cancelled||disposed||!running)return;
        if(last)elapsed+=Math.min(now-last,80);
        last=now;
        const progress=Math.min(1,elapsed/length);
        update(from+(to-from)*progress,progress);
        if(progress<1)frame=requestAnimationFrame(tick);
        else{running=false;finished=true;if(done)done();}
      }
      const handle={pause(){if(!running)return;running=false;cancelAnimationFrame(frame);last=0;},resume(){if(cancelled||disposed||running||finished)return;running=true;last=0;frame=requestAnimationFrame(tick);},cancel(){cancelled=true;running=false;cancelAnimationFrame(frame);},get isRunning(){return running;}};
      onCleanup(handle.cancel);
      update(from,0);
      frame=requestAnimationFrame(tick);
      return handle;
    }
    function feedback(el,text,type='info'){
      if(!el)return;el.classList.remove('is-success','is-error');if(type!=='info')el.classList.add('is-'+type);el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.textContent=text;
    }
    function svgPoint(svg,event){const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):{x:0,y:0};}
    return {listen,onCleanup,tween,feedback,svgPoint,markDone,reducedMotion,uid(prefix='cw'){return prefix+'-'+(++uid);},announce(text){window.Courseware.announce(text);},dispose(){if(disposed)return;disposed=true;for(const fn of cleanup.reverse()){try{fn();}catch(e){console.error('Cleanup failed',e);}}}};
  }
  const tips={
    life:{steps:['先播放一个生活场景，请学生用手势表示运动。','让学生先选择“平移”或“旋转”，再打开观察线索。','追问：你观察的是哪一部分？它怎样运动？'],note:'扇叶、齿轮和指针有固定的转动中心；观察国旗时看沿旗杆升降的整体运动。'},
    translation:{steps:['先预测两扇自动门开、关时各自的平移方向。','按“左上角→右上角→右下角”的要求移动课本。','再比较先下后右、直接斜向移动等不同路线。'],note:'平移也可以沿斜方向进行。观察整个移动过程，课本的大小、形状和朝向保持不变。'},
    rotation:{steps:['固定正面视角，以钟面转动方向作参照。','比较从 A 到 C 的顺时针与逆时针两条路线。','请学生说出经过的位置，再尝试从 C 到 B 或 D。'],note:'到达同一个终点可以采用不同方向。不要只凭最后的位置判断刚才的转动过程。'},
    overlap:{steps:['先选择哪些图案能通过平移与目标重合。','开启验证，将透明副本移到目标上方。','对照耳朵、尾巴或叶柄的位置，说明判断理由。'],note:'检验中只移动位置，保持每个图案原有的大小与朝向。镜像、旋转后的图案不能自动调整姿态。'},
    clock:{steps:['请学生先说出分针走一大格经过几分钟。','从12出发，先预测第一次到达目标位置的用时。','逐格验证，再隐藏时间提示独立完成另一题。'],note:'这里显示分针示意图。按顺时针、一圈以内第一次到达来计算，不把最短路线当作走时方向。'}
  };
  window.Courseware={modules,register(module){if(modules.some(x=>x.id===module.id))throw new Error('Duplicate module '+module.id);modules.push(module);},announce(text){const el=document.getElementById('announcement');el.textContent=text;el.hidden=false;clearTimeout(this.noticeTimer);this.noticeTimer=setTimeout(()=>el.hidden=true,3500);},boot(){
    modules.sort((a,b)=>a.number-b.number);
    const root=document.getElementById('module-host');
    const nav=document.getElementById('module-nav');
    const teacher=document.getElementById('teacher-panel');
    const tipsButton=document.getElementById('tips-button');
    let active=null,kit=null,dispose=null,done=new Set();
    try{done=new Set(JSON.parse(localStorage.getItem('motion-lab-completed')||'[]'));}catch(e){/* Private/file mode may disable storage. */}
    function markDone(id){done.add(id);try{localStorage.setItem('motion-lab-completed',JSON.stringify([...done]));}catch(e){}renderNav();}
    function renderNav(){
      const focused=document.activeElement&&document.activeElement.closest?document.activeElement.closest('[data-module]'):null;
      const focusId=focused&&nav.contains(focused)?focused.dataset.module:null;
      if(modules.length===1){nav.className='single-label';nav.innerHTML='<span class="num">'+String(modules[0].number).padStart(2,'0')+'</span><span>'+modules[0].title+' · 独立活动</span>';return;}
      nav.className='module-nav';nav.innerHTML=modules.map(m=>'<button type="button" class="nav-card '+(active&&m.id===active.id?'active':'')+'" data-module="'+m.id+'" aria-current="'+(active&&m.id===active.id?'page':'false')+'"><span class="nav-number">'+String(m.number).padStart(2,'0')+'</span><span class="nav-copy"><span class="nav-title">'+m.title+'</span><span class="nav-subtitle">'+m.subtitle+'</span></span>'+(done.has(m.id)?'<span class="nav-done" aria-label="已完成">✓</span>':'')+'</button>').join('');
      nav.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>switchTo(b.dataset.module,true)));
      if(focusId){const replacement=nav.querySelector('[data-module="'+focusId+'"]');if(replacement)replacement.focus({preventScroll:true});}
    }
    function switchTo(id,focus=false){
      const module=modules.find(x=>x.id===id)||modules[0];if(active&&active.id===module.id)return;
      if(dispose){try{dispose();}catch(e){console.error(e);}}if(kit)kit.dispose();
      active=module;kit=createKit(()=>markDone(module.id));root.innerHTML='';root.dataset.module=module.id;
      dispose=module.mount(root,kit)||null;renderNav();
      const t=tips[module.id];teacher.innerHTML='<h2>教师提示 · '+module.title+'</h2><ol>'+t.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol><p>'+t.note+'</p>';
      document.getElementById('current-step').textContent='活动 '+module.number+' / 5';
      const index=modules.indexOf(module);document.getElementById('prev-module').disabled=index===0;document.getElementById('next-module').disabled=index===modules.length-1;
      document.title=module.title+' · 平移与旋转互动实验室';
      try{history.replaceState(null,'','#'+module.id);}catch(e){}
      if(focus){const btn=nav.querySelector('[data-module="'+module.id+'"]');if(btn)btn.focus({preventScroll:true});}
    }
    tipsButton.addEventListener('click',()=>{teacher.hidden=!teacher.hidden;tipsButton.setAttribute('aria-expanded',String(!teacher.hidden));});
    const full=document.getElementById('fullscreen-button');
    full.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else window.Courseware.announce('可使用浏览器菜单进入全屏演示。');}catch(e){window.Courseware.announce('当前窗口不支持全屏，可使用浏览器菜单进入全屏。');}});
    document.addEventListener('fullscreenchange',()=>{full.querySelector('span').textContent=document.fullscreenElement?'退出全屏':'全屏演示';});
    document.getElementById('prev-module').addEventListener('click',()=>{const i=modules.indexOf(active);if(i>0)switchTo(modules[i-1].id,true);});
    document.getElementById('next-module').addEventListener('click',()=>{const i=modules.indexOf(active);if(i<modules.length-1)switchTo(modules[i+1].id,true);});
    window.addEventListener('hashchange',()=>switchTo(location.hash.slice(1)));
    if(modules.length===1)document.getElementById('footer-nav').hidden=true;
    switchTo(location.hash.slice(1));
  }};
})();
