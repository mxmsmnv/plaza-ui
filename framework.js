/* PLAZA UI: Alpine event ownership and GSAP motion. Original source remains in the private archive. */
(()=>{'use strict';
 const {Alpine,gsap,CustomEase}=window;
 if(!Alpine||!gsap||!CustomEase)throw Error('PLAZA requires the local Alpine and GSAP bundles');
 gsap.registerPlugin(CustomEase);gsap.ticker.fps(60);
 const bindings=new WeakMap(),stats={alpineBindings:0,platformBindings:0,gsapAnimations:0,gsapFrames:0,cssKeyframes:0};
 let started=false;
 const capture=options=>typeof options==='boolean'?options:!!options?.capture;
 const off=(target,type,listener,options)=>{const records=bindings.get(target),key=type+':'+capture(options),entry=records?.get(key)?.get(listener);if(entry){entry();records.get(key).delete(listener)}};
 const on=(target,type,listener,options)=>{
  if(!target||!listener||options?.signal?.aborted)return;
  const key=type+':'+capture(options);let records=bindings.get(target);if(!records){records=new Map();bindings.set(target,records)}if(!records.has(key))records.set(key,new Map());if(records.get(key).has(listener))return;
  const call=event=>{if(options?.once)off(target,type,listener,options);return typeof listener==='function'?listener.call(target,event):listener.handleEvent(event)};
  let cleanup;
  // Lifecycle, MediaQueryList and cross-realm platform targets are not UI directives.
  const platform=!(target instanceof Element||target===window||target===document)||['DOMContentLoaded','load','beforeunload','pagehide','pageshow','error','message'].includes(type);
  if(platform){target.addEventListener(type,call,options);cleanup=()=>target.removeEventListener(type,call,options);stats.platformBindings++}
  else{const host=target instanceof Element?target:document.body,suffix=target===window?'.window':target===document?'.document':'',modifiers=(capture(options)?'.capture':'')+(options?.passive?'.passive':'');cleanup=Alpine.bind(host,{['x-on:'+type+suffix+modifiers]:call});stats.alpineBindings++}
  records.get(key).set(listener,cleanup);
  if(options?.signal)options.signal.addEventListener('abort',()=>off(target,type,listener,options),{once:true});
 };
 // GSAP may tick synchronously when waking; frame callbacks must run after subscription returns.
 const queues=new Map();let frameId=0,ticking=false,subscribing=false;
 const drain=()=>{if(subscribing)return;if(viewportPaused){gsap.ticker.sleep();return}const batch=[...queues];queues.clear();const now=performance.now();for(const [,callback]of batch){stats.gsapFrames++;try{callback(now)}catch(error){setTimeout(()=>{throw error})}}if(!queues.size){ticking=false;gsap.ticker.remove(drain)}};
 const frame=callback=>{const id=++frameId;queues.set(id,callback);if(!ticking){ticking=true;subscribing=true;try{gsap.ticker.add(drain)}finally{subscribing=false}}return id};
 const cancelFrame=id=>queues.delete(id);
 const easing=value=>{if(typeof value==='function')return value;const text=(value||'linear').trim(),curves={ease:'.25,.1,.25,1','ease-in':'.42,0,1,1','ease-out':'0,0,.58,1','ease-in-out':'.42,0,.58,1'};const curve=curves[text]||text.match(/^cubic-bezier\(([^)]+)\)$/)?.[1];if(curve)return CustomEase.create('',curve);const steps=text.match(/^steps\((\d+)(?:,\s*(start|end|jump-start|jump-end))?\)$/);if(steps){const n=+steps[1],start=/start/.test(steps[2]||'');return p=>Math.min(1,(Math.floor(p*n)+(start?1:0))/n)}return text==='linear'?'none':text};
 function animate(target,input,settings={}){
  stats.gsapAnimations++;const opts=typeof settings==='number'?{duration:settings}:settings,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let frames=Array.isArray(input)?input.map(x=>({...x})):[];
  if(!frames.length){const props=Object.keys(input||{}),length=Math.max(2,...props.map(p=>Array.isArray(input[p])?input[p].length:1));frames=Array.from({length},(_,i)=>Object.fromEntries(props.map(p=>[p,Array.isArray(input[p])?input[p][Math.min(i,input[p].length-1)]:input[p]])))}
  const rotations=!opts.pseudoElement&&frames.length>1&&frames.every(f=>/^rotate(?:X|Y|Z)?\([-+\d.]+(?:deg|rad|turn)?\)$/.test(f.transform||''))&&new Set(frames.map(f=>f.transform.split('(')[0])).size===1;
  const clean=record=>{const values=Object.fromEntries(Object.entries(record).filter(([key,value])=>!['offset','computedOffset','easing','composite'].includes(key)&&value!==undefined));if(rotations&&typeof values.transform==='string'){const match=values.transform.match(/^rotate(X|Y|Z)?\(([-+\d.]+)(deg|rad|turn)?\)$/),angle=Number(match[2])*(match[3]==='rad'?180/Math.PI:match[3]==='turn'?360:1);delete values.transform;values[match[1]==='X'?'rotationX':match[1]==='Y'?'rotationY':'rotation']=angle}return values};
  const properties=[...new Set(frames.flatMap(f=>Object.keys(clean(f))))],computed=getComputedStyle(target,opts.pseudoElement||null),initial=Object.fromEntries(properties.map(k=>[k,/^rotation/.test(k)?gsap.getProperty(target,k):computed[k]||computed.getPropertyValue(k)]));
  if(frames.length===1)frames.unshift(initial);if(frames[0].offset>0)frames.unshift({...initial,offset:0});if(frames.at(-1).offset<1)frames.push({...initial,offset:1});
  frames[0].offset??=0;frames.at(-1).offset??=1;let last=0;for(let i=1;i<frames.length;i++)if(frames[i].offset!=null){const gap=i-last;for(let j=1;j<gap;j++)frames[last+j].offset=frames[last].offset+(frames[i].offset-frames[last].offset)*j/gap;last=i}
  const duration=Math.max(.001,(reduced?Math.min(Number(opts.duration)||0,1):Number(opts.duration)||0)/1000),delay=Math.max(0,(Number(opts.delay)||0)/1000),iterations=reduced?0:opts.iterations===Infinity?-1:Math.max(0,(opts.iterations??1)-1),reverse=String(opts.direction).startsWith('reverse')||opts.direction==='alternate-reverse',yoyo=String(opts.direction).startsWith('alternate'),fill=opts.fill||'none';
  let pseudoRule=null,pseudoProxy=null,lifetime=null;const originalTarget=target;if(opts.pseudoElement){if(opts.pseudoElement.startsWith('::view-transition-'))lifetime=Element.prototype.animate.call(target,{'--plaza-transition-lifetime':['0','1']},{duration:Math.max(1,Number(opts.duration)||1),delay:Number(opts.delay)||0,pseudoElement:opts.pseudoElement});const token='pm-'+(++frameId),style=document.createElement('style');target.setAttribute('data-plaza-pseudo-'+token,'');document.head.append(style);style.sheet.insertRule('[data-plaza-pseudo-'+token+']'+opts.pseudoElement+'{}',0);pseudoRule={style,token,declaration:style.sheet.cssRules[0].style};pseudoProxy={...initial};target=pseudoProxy}
  const paintPseudo=()=>{if(pseudoRule)for(const key of properties)pseudoRule.declaration.setProperty(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),String(pseudoProxy[key]))};
  const release=()=>{lifetime?.cancel();context?.revert();if(pseudoRule){pseudoRule.style.remove();originalTarget.removeAttribute('data-plaza-pseudo-'+pseudoRule.token)}};
  let timeline,driver,context,resolveFinished,rejectFinished,playState='running',settled=false;
  const finished=new Promise((resolve,reject)=>{resolveFinished=resolve;rejectFinished=reject});finished.catch(()=>{});
  const events=new EventTarget(),playhead={progress:reverse?1:0},api={finished,onfinish:null,oncancel:null,cancel,finish,play:()=>{playState='running';driver.play()},pause:()=>{playState='paused';driver.pause()},reverse:()=>driver.reverse(),updatePlaybackRate:rate=>driver.timeScale(rate),addEventListener:(...args)=>events.addEventListener(...args),removeEventListener:(...args)=>events.removeEventListener(...args),effect:{getKeyframes:()=>frames,getTiming:()=>opts,getComputedTiming:()=>({duration:duration*1000,progress:driver.progress()})}};
  Object.defineProperties(api,{playState:{get:()=>playState},currentTime:{get:()=>driver.totalTime()*1000,set:ms=>driver.totalTime(ms/1000)},playbackRate:{get:()=>driver.timeScale(),set:value=>driver.timeScale(value)}});
  const notify=kind=>{events.dispatchEvent(new Event(kind));api['on'+kind]?.call(api,new Event(kind))};
  function finish(){if(settled)return;driver?.progress(1);complete()}
  function complete(){if(settled)return;settled=true;playState='finished';lifetime?.cancel();if(!['forwards','both'].includes(fill))release();resolveFinished(api);notify('finish')}
  function cancel(){driver?.kill();timeline?.kill();release();playState='idle';if(!settled){settled=true;rejectFinished(new DOMException('Animation cancelled','AbortError'))}notify('cancel')}
  context=gsap.context(()=>{timeline=gsap.timeline({paused:true});timeline.set(target,{...initial,...clean(frames[0])},0);for(let i=1;i<frames.length;i++){const previous=frames[i-1],current=frames[i];timeline.to(target,{...clean(current),duration:(current.offset-previous.offset)*duration,ease:easing(previous.easing||'linear')},previous.offset*duration)}timeline.progress(reverse?1:0)});
  driver=gsap.to(playhead,{progress:reverse?0:1,duration,delay,repeat:iterations,yoyo,ease:easing(opts.easing),onUpdate:()=>{timeline.progress(playhead.progress);paintPseudo()},onComplete:complete});
  if(Number(opts.delay)<0)driver.time(Math.min(duration,-Number(opts.delay)/1000));return api;
 }
 const nativeAnimations=new WeakSet(),cssRuns=new Set();let cssScan=false;
 function migrateCSSKeyframes(){
  cssScan=false;
  for(const run of [...cssRuns]){const style=getComputedStyle(run.target,run.pseudo||null),names=style.animationName.split(',').map(n=>n.trim());if(!run.target.isConnected||!names.includes(run.name)||style.display==='none'){run.api.cancel();cssRuns.delete(run)}}
  for(const native of document.getAnimations()){
   if(native.constructor.name!=='CSSAnimation'||nativeAnimations.has(native))continue;
   nativeAnimations.add(native);const effect=native.effect,target=effect?.target;if(!(target instanceof Element))continue;
   const timing=effect.getTiming(),keyframes=effect.getKeyframes(),pseudo=effect.pseudoElement||'',name=native.animationName,time=native.currentTime||0,paused=native.playState==='paused';
   native.cancel();const api=animate(target,keyframes,{...timing,pseudoElement:pseudo}),run={target,pseudo,name,api};cssRuns.add(run);stats.cssKeyframes++;
   if(time>0)api.currentTime=Math.max(0,time-(Number(timing.delay)||0));if(paused)api.pause();
   api.finished.then(()=>{if(!['forwards','both'].includes(timing.fill))cssRuns.delete(run);target.dispatchEvent(new AnimationEvent('animationend',{animationName:name,pseudoElement:pseudo,bubbles:true}))}).catch(()=>{});
  }
 }
 const scheduleCSS=()=>{if(!cssScan){cssScan=true;frame(migrateCSSKeyframes)}};
 function startCSSMotion(){document.addEventListener('animationstart',scheduleCSS,true);new MutationObserver(scheduleCSS).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden','open'],childList:true});window.addEventListener('load',scheduleCSS,{once:true});scheduleCSS()}
 let entrance;
 function enter(nodes){entrance?.revert();const targets=[...nodes];if(!targets.length||matchMedia('(prefers-reduced-motion:reduce)').matches)return;entrance=gsap.context(()=>gsap.from(targets,{autoAlpha:0,y:10,duration:.24,stagger:.025,ease:'power2.out',clearProps:'opacity,visibility,transform'}))}
 // Preserve enough document height to avoid bottom-of-page scroll clamping.
 function readingRoom(top){const missing=Math.ceil(top+innerHeight-document.documentElement.scrollHeight),main=document.querySelector('#components');if(main&&missing>0)main.style.minHeight=(main.offsetHeight+missing)+'px'}
 // Anchor the content being read, including gaps before nested state headings.
 function keepPosition(update){
  if(scrollY<=0){update();return}
  let anchor=readingAnchor?.isConnected?readingAnchor:null;
  if(!anchor){
   const offset=innerWidth<=700?(document.querySelector('.mobile-header')?.getBoundingClientRect().height||0)+24:24;
   const catalog=document.querySelector('#catalog'),box=catalog?.getBoundingClientRect(),x=box?box.left+Math.min(box.width,innerWidth-box.left)/2:innerWidth/2;
   const region=document.elementFromPoint(x,offset)?.closest('.specimen,.section-heading,.default-state-title,.specimen-caption,.source-details,.state-section-nav');
   anchor=region?.closest('.state-example,.component-section');
   if(!anchor){const blocks=[...document.querySelectorAll('#catalog .component-section,#catalog .state-example')];anchor=blocks.filter(n=>{const r=n.getBoundingClientRect();return r.top>=offset&&r.top<innerHeight}).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]||blocks.find(n=>{const r=n.getBoundingClientRect();return r.top<=offset&&r.bottom>offset})}
  }
  const before=anchor?.getBoundingClientRect().top;update();
  if(anchor?.isConnected&&Number.isFinite(before)){const delta=anchor.getBoundingClientRect().top-before;if(Math.abs(delta)>.5){readingRoom(scrollY+delta);window.scrollBy({top:delta,behavior:'instant'})}}
 }

 let scrollMotion,readingAnchor,releaseAnchor;
 function stopScroll(){scrollMotion?.kill();scrollMotion=null;readingAnchor=null;releaseAnchor?.();releaseAnchor=null}
 function scrollToNode(target){
  const root=document.scrollingElement,offset=innerWidth<=700?document.querySelector('.mobile-header')?.getBoundingClientRect().height||0:0;
  stopScroll();readingAnchor=target;const events=['wheel','touchstart','pointerdown','keydown'];
  releaseAnchor=()=>{for(const type of events)window.removeEventListener(type,stopScroll)};
  for(const type of events)window.addEventListener(type,stopScroll,{passive:true,once:true});
  const destination=()=>Math.max(0,target.getBoundingClientRect().top+root.scrollTop-offset-24);readingRoom(destination());
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){window.scrollTo({top:destination(),behavior:'instant'});return}
  const start=root.scrollTop,progress={value:0};scrollMotion=gsap.to(progress,{value:1,duration:.4,ease:'power2.out',onUpdate:()=>{root.scrollTop=start+(destination()-start)*progress.value},onComplete:()=>{scrollMotion=null}})
 }

 function start(){if(started)return;started=true;Alpine.data('plazaExample',()=>({active:true}));if(!document.body.hasAttribute('x-data'))document.body.setAttribute('x-data','plazaExample');Alpine.start();startCSSMotion();document.documentElement.dataset.uiEngine='alpine';document.documentElement.dataset.motionEngine='gsap'}
 let viewportPaused=false;window.addEventListener('message',event=>{if(event.source!==parent||event.data?.plazaPreview!==true||typeof event.data.viewportVisible!=='boolean')return;viewportPaused=!event.data.viewportVisible;if(viewportPaused){gsap.globalTimeline.pause();gsap.ticker.sleep();document.querySelectorAll('video').forEach(video=>video.pause())}else{gsap.globalTimeline.resume();gsap.ticker.wake()}});
 window.PlazaRuntime={on,off,start,state:(data)=>Alpine.reactive(data),stats};window.PlazaMotion={frame,cancelFrame,animate,enter,scrollToNode,stopScroll,keepPosition,easing};
})();
