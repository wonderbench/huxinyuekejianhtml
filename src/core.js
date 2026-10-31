/* Shared lifecycle and accessible interface. All runnable HTML files embed this code. */
(function(){
  'use strict';
  const modules=[];
  let uid=0;
  function createKit(markDone){
    const cleanup=new Set();
    let disposed=false;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function onCleanup(fn){cleanup.add(fn);return()=>cleanup.delete(fn);}
    function listen(el,type,fn,opts){if(!el)return;el.addEventListener(type,fn,opts);onCleanup(()=>el.removeEventListener(type,fn,opts));}
    function tween(from,to,duration,update,done){
      let frame=0,last=0,elapsed=0,running=true,cancelled=false,finished=false,removeCleanup=()=>{};
      const length=Math.max(1,duration);
      function tick(now){
        if(cancelled||disposed||!running)return;
        if(last)elapsed+=Math.min(now-last,80);
        last=now;
        const progress=Math.min(1,elapsed/length);
        update(from+(to-from)*progress,progress);
        if(progress<1)frame=requestAnimationFrame(tick);
        else{running=false;finished=true;removeCleanup();if(done)done();}
      }
      const handle={pause(){if(!running)return;running=false;cancelAnimationFrame(frame);last=0;},resume(){if(cancelled||disposed||running||finished)return;running=true;last=0;frame=requestAnimationFrame(tick);},cancel(){cancelled=true;running=false;cancelAnimationFrame(frame);removeCleanup();},get isRunning(){return running;}};
      removeCleanup=onCleanup(handle.cancel);
      update(from,0);
      frame=requestAnimationFrame(tick);
      return handle;
    }
    function feedback(el,text,type='info'){
      if(!el)return;
      el.classList.remove('is-success','is-error');
      if(type!=='info')el.classList.add('is-'+type);
      el.setAttribute('role',type==='error'?'alert':'status');
      el.setAttribute('aria-live',type==='error'?'assertive':'polite');
      el.textContent=text;
    }
    function svgPoint(svg,event){const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):{x:0,y:0};}
    return {listen,onCleanup,tween,feedback,svgPoint,markDone,reducedMotion,uid(prefix='cw'){return prefix+'-'+(++uid);},announce(text){window.Courseware.announce(text);},dispose(){if(disposed)return;disposed=true;for(const fn of [...cleanup].reverse()){try{fn();}catch(e){console.error('Cleanup failed',e);}}cleanup.clear();}};
  }
  const lessons={
    life:{heading:'发现生活中的运动',description:'观察运动的部分，再判断它是平移还是旋转。',steps:['播放一个生活场景，请学生用手势表示运动。','选择“平移”或“旋转”，再打开观察线索。','追问：你观察的是哪一部分？它怎样运动？'],note:'观察扇叶、齿轮和指针时关注转动中心；观察国旗时看沿旗杆升降的整体运动。'},
    translation:{heading:'让物体平移起来',description:'改变移动方向，观察物体的形状、大小和朝向。',steps:['先预测两扇自动门开、关时各自的平移方向。','按“左上角→右上角→右下角”移动课本。','比较先下后右、直接斜向移动等不同路线。'],note:'平移也可以沿斜方向进行。整个过程中，物体的形状、大小和朝向保持不变。'},
    rotation:{heading:'同一个终点，两种转法',description:'固定中心，选择方向，看看指针经过哪些位置。',steps:['固定正面视角，以钟面转动方向作参照。','比较从 A 到 C 的顺时针与逆时针两条路线。','说出经过的位置，再尝试从 C 到 B 或 D。'],note:'到达同一个终点可以采用不同方向。判断时要看刚才的转动过程。'},
    overlap:{heading:'哪些图案能平移重合？',description:'先留下你的预测，再把透明副本移到目标上。',steps:['选择哪些图案能通过平移与目标重合。','开启验证，将透明副本移到目标上方。','对照耳朵、尾巴或叶柄的位置，说出判断理由。'],note:'检验时只移动位置，保持每个图案原有的大小与朝向。镜像、旋转后的图案不会自动调整姿态。'},
    clock:{heading:'分针走了几分钟？',description:'从 12 出发，观察顺时针第一次到达目标的过程。',steps:['先说出分针走一大格经过几分钟。','从 12 出发，预测第一次到达目标的用时。','逐格验证，再隐藏时间提示独立完成另一题。'],note:'这里只观察分针。按顺时针、一圈以内第一次到达来计算；一大格对应 5 分钟。'},
    feedback:{heading:'这节课，我学得怎么样？',description:'选一选自己的收获，把还想练习的地方告诉老师。',steps:['请一位同学独立填写一份反馈，也可以匿名。','没有练过的内容选“今天没练过”，不必猜测。','切到教师汇总，查看大家想再练什么，并导出反馈。'],note:'这是学习自评，不计分。统计单位是反馈份数。反馈保存在当前页面的浏览器中，其他设备的反馈可通过JSON文件合并，不会自动联网同步。'}
  };
  window.Courseware={
    modules,
    register(module){if(modules.some(x=>x.id===module.id))throw new Error('Duplicate module '+module.id);modules.push(module);},
    announce(text){const el=document.getElementById('announcement');el.textContent=text;el.hidden=false;clearTimeout(this.noticeTimer);this.noticeTimer=setTimeout(()=>el.hidden=true,3500);},
    boot(){
      if(this.started)return;
      this.started=true;
      modules.sort((a,b)=>a.number-b.number);
      const root=document.getElementById('module-host');
      const nav=document.getElementById('module-nav');
      const picker=document.getElementById('module-select');
      const teacher=document.getElementById('teacher-panel');
      const tipsButton=document.getElementById('tips-button');
      const boardButton=document.getElementById('board-mode-button');
      let boardMode=true;
      try{boardMode=localStorage.getItem('motion-lab-display')!=='desk';}catch(e){}
      function renderDisplayMode(){document.documentElement.setAttribute('data-board-mode',boardMode?'whiteboard':'desk');boardButton.setAttribute('aria-pressed',String(boardMode));}
      renderDisplayMode();
      boardButton.addEventListener('click',()=>{boardMode=!boardMode;renderDisplayMode();document.dispatchEvent(new CustomEvent('courseware:displaychange',{detail:{whiteboard:boardMode}}));try{localStorage.setItem('motion-lab-display',boardMode?'whiteboard':'desk');}catch(e){}window.Courseware.announce(boardMode?'已开启白板大字模式。':'已切换为普通字号。');});
      const instances=new Map();
      const learningModules=modules.filter(module=>module.id!=='feedback');
      const moduleLabel=module=>module.id==='feedback'?'课后':String(module.number).padStart(2,'0');
      nav.dataset.count=String(modules.length);
      document.getElementById('lesson-progress').hidden=learningModules.length===0;
      let active=null,done=new Set();
      try{const saved=JSON.parse(localStorage.getItem('motion-lab-completed')||'[]');if(Array.isArray(saved))done=new Set(saved.filter(id=>typeof id==='string'));}catch(e){/* Offline/private windows can deny storage. */}
      picker.innerHTML=modules.map(m=>'<option value="'+m.id+'">'+moduleLabel(m)+' · '+m.title+'</option>').join('');
      if(modules.length===1){
        nav.className='single-label';
        nav.innerHTML='<span class="num">'+moduleLabel(modules[0])+'</span><span>'+modules[0].title+(modules[0].id==='feedback'?' · 独立页面':' · 独立活动')+'</span>';
        document.getElementById('module-picker').hidden=true;
        document.getElementById('footer-nav').hidden=true;
        document.getElementById('footer-state-note').hidden=true;
      }else{
        nav.style.gridTemplateColumns='repeat('+modules.length+',minmax(0,1fr))';
        nav.innerHTML='<span class="nav-indicator" aria-hidden="true"></span>'+modules.map(m=>'<button type="button" class="nav-card" data-module="'+m.id+'" aria-current="false"><span class="nav-number">'+moduleLabel(m)+'</span><span class="nav-title">'+m.title+'</span><span class="nav-done" aria-hidden="true"></span></button>').join('');
        nav.querySelector('.nav-indicator').style.width='calc((100% - 8px) / '+modules.length+')';
        nav.querySelectorAll('[data-module]').forEach((button,index)=>{
          button.addEventListener('click',()=>switchTo(button.dataset.module));
          button.addEventListener('keydown',event=>{
            const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
            if(!delta&&event.key!=='Home'&&event.key!=='End')return;
            event.preventDefault();
            const next=event.key==='Home'?0:event.key==='End'?modules.length-1:(index+delta+modules.length)%modules.length;
            nav.querySelector('[data-module="'+modules[next].id+'"]').focus();
          });
        });
      }
      function markDone(id){done.add(id);try{localStorage.setItem('motion-lab-completed',JSON.stringify([...done]));}catch(e){}renderNav();}
      function renderNav(){
        nav.querySelectorAll('[data-module]').forEach(button=>{
          const selected=button.dataset.module===active.id;
          const completed=button.dataset.module!=='feedback'&&done.has(button.dataset.module);
          button.classList.toggle('active',selected);
          button.setAttribute('aria-current',selected?'page':'false');
          const module=modules.find(m=>m.id===button.dataset.module);
          button.setAttribute('aria-label',module.title+(completed?'，已完成':''));
          button.querySelector('.nav-done').textContent=completed?'✓':'';
        });
        const indicator=nav.querySelector('.nav-indicator');
        if(indicator)indicator.style.transform='translateX('+(modules.indexOf(active)*100)+'%)';
        picker.value=active.id;
        document.getElementById('lesson-progress').textContent=learningModules.filter(m=>done.has(m.id)).length+' / '+learningModules.length+' 已完成';
      }
      function pauseCurrent(){if(!active)return;const instance=instances.get(active.id);if(instance&&instance.controller.pause)instance.controller.pause();}
      function switchTo(id,focus=false){
        const module=modules.find(x=>x.id===id)||modules[0];
        if(active&&active.id===module.id)return;
        pauseCurrent();
        active=module;
        root.dataset.module=module.id;
        let instance=instances.get(module.id);
        if(!instance){
          const pane=document.createElement('section');
          pane.className='module-pane';
          pane.setAttribute('aria-labelledby','lesson-title');
          const kit=createKit(()=>markDone(module.id));
          root.replaceChildren(pane);
          const mounted=module.mount(pane,kit)||{};
          const controller=typeof mounted==='function'?{destroy:mounted}:mounted;
          instance={pane,kit,controller};
          instances.set(module.id,instance);
          if(!kit.reducedMotion&&typeof pane.animate==='function')pane.animate([{opacity:.6,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'ease-out'});
        }else root.replaceChildren(instance.pane);
        renderNav();
        const lesson=lessons[module.id];
        document.getElementById('lesson-title').textContent=lesson.heading;
        document.getElementById('lesson-description').textContent=lesson.description;
        document.getElementById('lesson-number').textContent=module.id==='feedback'?'课后小调查':'活动 '+String(module.number).padStart(2,'0');
        teacher.innerHTML='<h2>教学提示 · '+module.title+'</h2><ol>'+lesson.steps.map(s=>'<li>'+s+'</li>').join('')+'</ol><p>'+lesson.note+'</p>';
        document.getElementById('current-step').textContent=module.id==='feedback'?'课后反馈':module.number+' / 5';
        const index=modules.indexOf(module);
        document.getElementById('prev-module').disabled=index===0;
        document.getElementById('next-module').disabled=index===modules.length-1;
        document.getElementById('next-module').textContent=module.id==='feedback'?'课程结束':modules[index+1]&&modules[index+1].id==='feedback'?'填写课后反馈 →':'下一活动 →';
        document.getElementById('next-module').classList.toggle('closing-action',!!(modules[index+1]&&modules[index+1].id==='feedback'));
        document.title=module.title+' · 平移与旋转互动实验室';
        try{history.replaceState(null,'','#'+module.id);}catch(e){}
        if(focus){
          if(module.id==='feedback'){root.focus({preventScroll:true});const heading=document.getElementById('lesson-title');if(heading.scrollIntoView)heading.scrollIntoView({block:'start'});}
          else{const button=nav.querySelector('[data-module="'+module.id+'"]');if(button)button.focus({preventScroll:true});else picker.focus({preventScroll:true});}
        }
      }
      picker.addEventListener('change',()=>switchTo(picker.value));
      tipsButton.addEventListener('click',()=>{teacher.hidden=!teacher.hidden;tipsButton.setAttribute('aria-expanded',String(!teacher.hidden));});
      teacher.addEventListener('keydown',event=>{if(event.key==='Escape'){teacher.hidden=true;tipsButton.setAttribute('aria-expanded','false');tipsButton.focus();}});
      const full=document.getElementById('fullscreen-button');
      full.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else window.Courseware.announce('可使用浏览器菜单进入全屏演示。');}catch(e){window.Courseware.announce('当前窗口不支持全屏，可使用浏览器菜单进入全屏。');}});
      document.addEventListener('fullscreenchange',()=>{full.querySelector('span').textContent=document.fullscreenElement?'退出全屏':'全屏演示';});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseCurrent();});
      document.getElementById('prev-module').addEventListener('click',()=>{const index=modules.indexOf(active);if(index>0)switchTo(modules[index-1].id,true);});
      document.getElementById('next-module').addEventListener('click',()=>{const index=modules.indexOf(active);if(index<modules.length-1)switchTo(modules[index+1].id,true);});
      window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(modules.some(m=>m.id===id))switchTo(id);});
      window.addEventListener('pagehide',event=>{
        if(event.persisted){pauseCurrent();return;}
        for(const instance of instances.values()){if(instance.controller.destroy)instance.controller.destroy();instance.kit.dispose();}
        clearTimeout(window.Courseware.noticeTimer);
      });
      switchTo(location.hash.slice(1));
    }
  };
})();
