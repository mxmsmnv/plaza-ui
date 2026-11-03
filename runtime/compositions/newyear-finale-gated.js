/* Activation wrapper only; original finale runs after an explicit preview action. */
(()=>{'use strict';let activated=false;const activate=()=>{if(activated)return;activated=true;
 const finale=document.querySelector('.psk-ny .ny-finale');if(finale)delete finale.dataset.nyCelebration;
/* PSK finale v16. Grand Fireworks 1.10.0 MIT; Lucide 0.468.0 ISC. */
(() => {
  'use strict';
  if(new URLSearchParams(location.search).get('print-preview')==='1')return;
  const root=document.querySelector('.psk-ny'), finale=root&&root.querySelector('.ny-finale');
  if(!finale||finale.dataset.nyCelebration==='ready')return;
  finale.dataset.nyCelebration='ready';
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
  const dark=()=>document.documentElement.dataset.theme==='dark';
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),between=(a,b)=>a+Math.random()*(b-a);
  const panForX=x=>clamp(x/Math.max(1,innerWidth)*2-1,-1,1);
  const weakDevice=()=>innerWidth<=700||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory&&navigator.deviceMemory<=4)||!!(navigator.connection&&navigator.connection.saveData);
  let visible=false,printing=false,raf=0,pointerX=0,pointerY=0;
  let engine=null,loading=null,muted=false,launchId=0;
  let audio=null,audioIdleTimer=0,meterTimers=[];
  const recipes=new Map();
  const stars=document.createElement('div');stars.className='ny-finale__stars';stars.setAttribute('aria-hidden','true');
  [[8,12,2.1],[17,24,1.4],[23,8,1.5],[33,19,1.2],[42,10,1.7],[49,27,1.2],[58,7,1.4],[65,20,1.8],[72,11,1.3],[79,28,1.6],[87,9,2],[94,22,1.4],[12,32,1.2],[29,31,1.5],[38,6,1.1],[55,34,1.4],[68,33,1.1],[82,17,1.1],[91,34,1.6],[96,5,1.1]].forEach(([x,y,size],i)=>{
    const star=document.createElement('i');star.style.cssText=`left:${x}%;top:${y}%;--ny-star-size:${size}px;--ny-star-duration:${3.4+(i%6)*.58}s;--ny-star-delay:${-i*.69}s`;stars.append(star);
  });const starFrame=document.createElement('div');starFrame.className='ny-finale__star-frame';starFrame.setAttribute('aria-hidden','true');starFrame.append(stars);finale.append(starFrame);
  // Sibling of the page, never inside the photograph's clipping container.
  const stage=document.createElement('div');stage.className='ny-fireworks-portal';stage.dataset.active='false';stage.setAttribute('aria-hidden','true');document.body.append(stage);
  const canAnimate=()=>!printing&&visible&&!motion.matches&&!document.hidden,canCelebrate=()=>canAnimate()&&dark();
  function updateParallax(){
    raf=0;if(!canAnimate())return;const r=finale.getBoundingClientRect(),travel=clamp((innerHeight/2-r.top-r.height/2)/(innerHeight+r.height),-.5,.5);
    finale.style.setProperty('--ny-finale-pointer-x',pointerX.toFixed(4));finale.style.setProperty('--ny-finale-pointer-y',pointerY.toFixed(4));finale.style.setProperty('--ny-finale-travel',travel.toFixed(4));
    finale.style.setProperty('--ny-finale-stars-x',`${(pointerX*-7).toFixed(2)}px`);finale.style.setProperty('--ny-finale-stars-y',`${(travel*12-pointerY*3).toFixed(2)}px`);
  }
  function queueParallax(){if(!raf&&canAnimate())raf=PlazaMotion.frame(updateParallax);}
  function resetParallax(){if(raf)PlazaMotion.cancelFrame(raf);raf=0;for(const k of ['pointer-x','pointer-y','travel'])finale.style.setProperty('--ny-finale-'+k,'0');for(const k of ['stars-x','stars-y'])finale.style.setProperty('--ny-finale-'+k,'0px');}
  function loadLibrary(){
    if(window.GrandFireworks)return Promise.resolve(window.GrandFireworks);if(loading)return loading;
    loading=new Promise((resolve,reject)=>{
      if(!finale.dataset.nyFireworksSrc)return reject(new Error('Missing local fireworks asset'));
      const url=new URL(finale.dataset.nyFireworksSrc,document.baseURI);const trustedOrigin=window.PlazaSpecimenContext?.runtimeAssetOrigin||location.origin;if(url.origin!==trustedOrigin)return reject(new Error('Fireworks asset must match explicit runtime origin'));
      const script=document.createElement('script');script.src=url.href;script.async=true;
      script.onload=()=>window.GrandFireworks?resolve(window.GrandFireworks):reject(new Error('Fireworks engine unavailable'));script.onerror=()=>reject(new Error('Fireworks engine unavailable'));document.head.append(script);
    });loading.catch(()=>{});return loading;
  }
  const shells=[{type:'grand_peony',baseCount:170,minLife:.8,maxLife:1.04},{type:'diamond_ring',baseCount:125,minLife:.8,maxLife:1.02},{type:'golden_brocade',baseCount:310,minLife:.56,maxLife:.77},{type:'weeping_willow',baseCount:260,minLife:.7,maxLife:.95},{type:'imperial_chrysanthemum',baseCount:220,minLife:.75,maxLife:1.02}];
  const colors=['#ff4b9b','#ff434c','#4d9fff','#4de4ff','#c694ff','#ffcf61'];
  function makeRecipe(){
    const weak=weakDevice(),shell=shells[Math.floor(Math.random()*shells.length)],index=Math.floor(Math.random()*colors.length),palette=[colors[index]];
    if(Math.random()<.15)palette.push(colors[(index+1+Math.floor(Math.random()*5))%colors.length]);
    const count=Math.round(between(weak?65:95,weak?110:175));
    return{type:shell.type,colors:palette,count,density:count/shell.baseCount,radius:Math.min(innerWidth*.28,innerHeight*.22,190)*between(.85,1.16),duration:Math.round(between(650,910)),reachTime:Math.round(between(500,790)),lifeScale:between(shell.minLife,shell.maxLife),gravityScale:between(.58,1.12),pointScale:between(weak?.53:.60,weak?.65:.75),bloom:1,trailFade:between(.08,.13)};
  }
  function createEngine(Constructor){
    if(engine||!canCelebrate())return engine;
    if(Constructor.VERSION!=='1.10.0'||typeof Constructor.prototype._explode!=='function')throw new Error('Unsupported fireworks hook contract');
    const weak=weakDevice();engine=new Constructor({
      container:stage,mode:'fullscreen',placement:'overlay',clip:false,zIndex:1,autoStart:false,baseStyle:'medium',background:false,renderer:{preferred:'webgl2',fallback:'canvas2d'},transition:{fadeIn:0,fadeOut:180,clearOnHide:true},
      // The outer finale observer owns offscreen cleanup. Upstream root IO would
      // pause its display:none idle root and drop the next manual launch.
      performance:{preset:'low',fps:weak?30:45,dprCap:weak?1:1.4,adaptive:true,pauseWhenHidden:true,pauseWhenOffscreen:false,respectReducedMotion:true,particleScale:weak?.6:.68,secondary:1},
      show:{openingSalvo:0,maxRockets:weak?2:3,maxParticles:weak?600:1100,closeShellChance:0,grandFinaleShellChance:0},
      visuals:{trails:true,trailFade:.10,bloom:1,rocketExhaust:true,explosionFlashes:true,flashColor:'#fff1d2',flashScale:.5,flashAlpha:.42,flashLife:100,flashBangChance:0,secondaryCrackle:false,groupedSalvos:false,shimmerChance:.025,starChance:.01},
      // Own viewport-panned adapter owns whistle+boom: no duplicate upstream audio.
      sound:{enabled:false,volume:0,ambience:0},finale:{enabled:false},
    });
    const fx=engine,originalExplode=fx._explode;fx._nyOriginalExplode=originalExplode;
    fx._explode=function(rocket,now){
      const recipe=rocket&&recipes.get(rocket._nyLaunchId);if(!recipe)return originalExplode.call(this,rocket,now);
      const previous=this.options.performance.particleScale;this.options.performance.particleScale=this.rendererType==='canvas2d'?Math.min(.4,recipe.pointScale):recipe.pointScale;
      let result;try{result=originalExplode.call(this,rocket,now);}finally{this.options.performance.particleScale=previous;}
      recipes.delete(rocket._nyLaunchId);
      if(engine===fx&&canCelebrate()){
        const flash=document.createElement('i');flash.className='ny-firework-flash';flash.style.left=rocket.x+'px';flash.style.top=rocket.y+'px';stage.append(flash);PlazaRuntime.on(flash,'animationend',()=>flash.remove(),{once:true});setTimeout(()=>flash.remove(),300);
        finale.dataset.nyFireworkBurstAt=performance.now().toFixed(2);finale.dataset.nyFireworkPan=panForX(rocket.x).toFixed(4);if(!muted)playBoom(rocket.x,recipe);
      }
      return result;
    };
    finale.dataset.nyFireworksRenderer=fx.rendererType;PlazaRuntime.on(fx,'rendererchange',()=>{if(engine===fx)finale.dataset.nyFireworksRenderer=fx.rendererType;});PlazaRuntime.on(fx,'stop',suspendAudioIfIdle);return fx;
  }
  function clearMeters(){meterTimers.forEach(clearTimeout);meterTimers=[];}
  function suspendAudioIfIdle(){if(audio&&!audio.voices.size&&audio.context.state==='running')audio.context.suspend().catch(()=>{});}
  function getAudio(){
    if(muted||!canCelebrate())return null;
    if(!audio){
      const Context=window.AudioContext||window.webkitAudioContext;if(!Context){finale.dataset.nyAudioState='unavailable';return null;}
      try{
        const context=new Context(),master=context.createGain(),compressor=context.createDynamicsCompressor();master.gain.value=.60;
        compressor.threshold.value=-19;compressor.knee.value=16;compressor.ratio.value=6;compressor.attack.value=.003;compressor.release.value=.18;master.connect(compressor);compressor.connect(context.destination);
        const split=context.createChannelSplitter(2),left=context.createAnalyser(),right=context.createAnalyser();left.fftSize=right.fftSize=256;compressor.connect(split);split.connect(left,0,0);split.connect(right,1,0);
        const noise=context.createBuffer(1,Math.ceil(context.sampleRate*1.6),context.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
        audio={context,master,compressor,split,left,right,noise,voices:new Set(),samplesL:new Float32Array(256),samplesR:new Float32Array(256),bytes:new Uint8Array(256)};
        context.onstatechange=()=>{if(audio&&audio.context===context)finale.dataset.nyAudioState=context.state;};
      }catch(_){finale.dataset.nyAudioState='unavailable';return null;}
    }
    const current=audio;warmSamples(current);if(current.context.state==='suspended')current.context.resume().then(()=>{if(audio===current)finale.dataset.nyAudioState=current.context.state;}).catch(()=>{});
    finale.dataset.nyAudioState=current.context.state;clearTimeout(audioIdleTimer);audioIdleTimer=setTimeout(suspendAudioIfIdle,1200);return current;
  }
  function spatialBus(current,x,targetX,duration){
    const c=current.context,bus=c.createGain();bus.channelCount=1;bus.channelCountMode='explicit';const pan=panForX(x),endPan=panForX(targetX===undefined?x:targetX);
    if(c.createStereoPanner){const panner=c.createStereoPanner();panner.pan.setValueAtTime(pan,c.currentTime);if(duration)panner.pan.linearRampToValueAtTime(endPan,c.currentTime+duration);bus.connect(panner);panner.connect(current.master);}
    else{const l=c.createGain(),r=c.createGain(),merge=c.createChannelMerger(2);l.gain.setValueAtTime(Math.cos((pan+1)*Math.PI/4),c.currentTime);r.gain.setValueAtTime(Math.sin((pan+1)*Math.PI/4),c.currentTime);if(duration){l.gain.linearRampToValueAtTime(Math.cos((endPan+1)*Math.PI/4),c.currentTime+duration);r.gain.linearRampToValueAtTime(Math.sin((endPan+1)*Math.PI/4),c.currentTime+duration);}bus.connect(l);bus.connect(r);l.connect(merge,0,0);r.connect(merge,0,1);merge.connect(current.master);}
    return bus;
  }
  function trackSource(current,source,at,duration){
    const limit=weakDevice()?8:12;while(current.voices.size>=limit){const oldest=current.voices.values().next().value;current.voices.delete(oldest);try{oldest.stop();}catch(_){}}
    current.voices.add(source);source.onended=()=>{current.voices.delete(source);source.disconnect();if(engine&&['idle','stopped'].includes(engine.getStats().state))suspendAudioIfIdle();};source.start(at);source.stop(at+duration);
  }
  function sampleChannel(analyser,target,current){
    if(analyser.getFloatTimeDomainData)analyser.getFloatTimeDomainData(target);else{analyser.getByteTimeDomainData(current.bytes);for(let i=0;i<target.length;i++)target[i]=(current.bytes[i]-128)/128;}
    let sum=0,peak=0;for(const value of target){sum+=value*value;peak=Math.max(peak,Math.abs(value));}return{rms:Math.sqrt(sum/target.length),peak};
  }
  function measureBoom(current){
    clearMeters();finale.dataset.nyAudioPeak='0';finale.dataset.nyAudioLeftRms='0';finale.dataset.nyAudioRightRms='0';
    for(const delay of [35,110,240,480])meterTimers.push(setTimeout(()=>{
      if(audio!==current||muted)return;const l=sampleChannel(current.left,current.samplesL,current),r=sampleChannel(current.right,current.samplesR,current);
      finale.dataset.nyAudioPeak=Math.max(Number(finale.dataset.nyAudioPeak)||0,l.peak,r.peak).toFixed(5);finale.dataset.nyAudioLeftRms=Math.max(Number(finale.dataset.nyAudioLeftRms)||0,l.rms).toFixed(5);finale.dataset.nyAudioRightRms=Math.max(Number(finale.dataset.nyAudioRightRms)||0,r.rms).toFixed(5);finale.dataset.nyAudioState=current.context.state;
    },delay));
  }
  // User-supplied explosion excerpts. Fetch once near the visible night finale;
  // decode only after a user gesture creates the AudioContext. No launch sound.
  const sampleNames=['burst-1.mp3','burst-2.mp3','burst-3.mp3','burst-4.mp3'];
  let sampleFetch=null,sampleDecode=null,sampleBuffers=[],lastSample=-1;
  function prefetchSamples(){
    if(!sampleFetch)sampleFetch=Promise.all(sampleNames.map(async name=>{
      try{const response=await fetch((window.PlazaSpecimenContext?.fireworkAudioBase||'https://plaza.spa/wp-content/uploads/psk-art-plaza-2027-20261023/v18/')+name,{credentials:'omit'});if(!response.ok)return null;return{name,bytes:await response.arrayBuffer()};}catch(_){return null;}
    }));
    return sampleFetch;
  }
  function warmSamples(current){
    if(sampleBuffers.length||sampleDecode)return;
    sampleDecode=prefetchSamples().then(items=>Promise.all(items.filter(Boolean).map(async item=>{
      try{return{name:item.name,buffer:await current.context.decodeAudioData(item.bytes.slice(0))};}catch(_){return null;}
    }))).then(items=>{sampleBuffers=items.filter(Boolean);finale.dataset.nyAudioSamples=String(sampleBuffers.length);}).catch(()=>{}).finally(()=>{sampleDecode=null;});
  }
  function playBoom(x){
    const current=getAudio();if(!current)return;
    if(!sampleBuffers.length){finale.dataset.nyAudioSample='procedural-fallback';playSyntheticBoom(x);return;}
    const count=sampleBuffers.length;
    const index=lastSample<0?Math.floor(Math.random()*count):count>1?(lastSample+1+Math.floor(Math.random()*(count-1)))%count:0;
    lastSample=index;const chosen=sampleBuffers[index],c=current.context,at=c.currentTime,source=c.createBufferSource(),gain=c.createGain();
    source.buffer=chosen.buffer;source.playbackRate.value=between(.96,1.04);gain.gain.value=between(.88,1);
    source.connect(gain);gain.connect(spatialBus(current,x));trackSource(current,source,at,chosen.buffer.duration/source.playbackRate.value+.025);
    finale.dataset.nyAudioSample=chosen.name;finale.dataset.nyFireworkBoomAt=performance.now().toFixed(2);finale.dataset.nyAudioPan=panForX(x).toFixed(4);measureBoom(current);
  }
  function playSyntheticBoom(x){
    const current=getAudio();if(!current)return;const c=current.context,at=c.currentTime,bus=spatialBus(current,x),noise=c.createBufferSource(),filter=c.createBiquadFilter(),envelope=c.createGain();
    noise.buffer=current.noise;filter.type='lowpass';filter.Q.value=.7;filter.frequency.setValueAtTime(between(420,560),at);filter.frequency.exponentialRampToValueAtTime(45,at+.9);
    envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(.39,at+.008);envelope.gain.exponentialRampToValueAtTime(.0001,at+1.05);noise.connect(filter);filter.connect(envelope);envelope.connect(bus);trackSource(current,noise,at,1.12);
    const tone=c.createOscillator(),body=c.createGain();tone.type='sine';tone.frequency.setValueAtTime(95,at);tone.frequency.exponentialRampToValueAtTime(40,at+.42);body.gain.setValueAtTime(.0001,at);body.gain.exponentialRampToValueAtTime(.12,at+.006);body.gain.exponentialRampToValueAtTime(.0001,at+.58);tone.connect(body);body.connect(bus);trackSource(current,tone,at,.62);
    finale.dataset.nyFireworkBoomAt=performance.now().toFixed(2);finale.dataset.nyAudioPan=panForX(x).toFixed(4);measureBoom(current);
  }
  function closeAudio(){
    clearMeters();clearTimeout(audioIdleTimer);audioIdleTimer=0;if(!audio)return;const current=audio;audio=null;
    current.voices.forEach(source=>{try{source.stop();}catch(_){}source.disconnect();});current.voices.clear();if(current.context.state!=='closed')current.context.close().catch(()=>{});finale.dataset.nyAudioState='idle';
  }
  function stopCelebration(){
    closeAudio();recipes.clear();if(engine){const fx=engine;engine=null;const gl=fx.rendererType==='webgl2'&&fx.renderer&&fx.renderer.gl;if(fx._nyOriginalExplode)fx._explode=fx._nyOriginalExplode;fx.destroy();if(gl){const release=gl.getExtension('WEBGL_lose_context');if(release)release.loseContext();}}
    stage.dataset.active='false';
  }
  let hoverTimer=0,hoverInside=false,hoverX=0,hoverY=0;
  function clearHoverTimer(){clearTimeout(hoverTimer);hoverTimer=0;}
  function scheduleHover(delay){
    if(hoverTimer||!hoverInside||!canCelebrate())return;
    hoverTimer=setTimeout(()=>{hoverTimer=0;if(!hoverInside||!canCelebrate())return;launchFirework(hoverX,hoverY);scheduleHover(5000);},delay);
  }
  let touchTimer=0;
  function scheduleTouch(delay){
    if(touchTimer||!coarse.matches||!canCelebrate())return;
    touchTimer=setTimeout(()=>{touchTimer=0;if(!coarse.matches||!canCelebrate())return;const r=finale.getBoundingClientRect(),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);launchFirework(r.left+r.width/2,top+(bottom-top)*.45);scheduleTouch(5000);},delay);
  }
  function syncActivity(){
    finale.dataset.nyLandscapeActive=String(canAnimate());
    const active=canCelebrate();finale.dataset.nyFxActive=String(active);stage.dataset.active=String(active);if(!active){clearHoverTimer();clearTimeout(touchTimer);touchTimer=0;stopCelebration();}else{scheduleHover(1000);scheduleTouch(1000);}if(canAnimate())queueParallax();else resetParallax();if(active)prefetchSamples();if(active)loadLibrary().then(Constructor=>{if(canCelebrate())createEngine(Constructor);}).catch(()=>{});
  }
  function interactiveTarget(target){return target instanceof Element&&!!target.closest('a,button,input,select,textarea,summary,[role="button"],[contenteditable="true"]');}
  PlazaRuntime.on(finale,'pointerdown',event=>{if(canCelebrate()&&!interactiveTarget(event.target)&&event.button===0&&!muted)getAudio();},{passive:true});
  async function launchFirework(clickX,clickY){
    if(!canCelebrate())return;const weak=weakDevice();
    try{
      const Constructor=await loadLibrary();if(!canCelebrate())return;stage.dataset.active='true';const fx=createEngine(Constructor);if(!fx||fx.getStats().rockets>=(weak?2:3))return;
      const recipe=makeRecipe(),rect=finale.getBoundingClientRect(),originY=clamp(rect.bottom+22,140,innerHeight+24),targetX=clamp(clickX,12,innerWidth-12),targetY=clamp(clickY-between(35,85),28,Math.max(40,originY-90)),fromX=clamp(targetX+between(-55,55),12,innerWidth-12),id=++launchId;
      recipes.set(id,recipe);fx.setOptions({visuals:{trailFade:recipe.trailFade}});fx.launchTo({...recipe,x:fromX,y:originY,targetX,targetY,sound:false});
      const rocket=fx.rockets[fx.rockets.length-1];if(!rocket||!rocket.hostLaunched){recipes.delete(id);return;}rocket._nyLaunchId=id;
      finale.dataset.nyFireworkType=recipe.type;finale.dataset.nyFireworkColor=recipe.colors.join(',');finale.dataset.nyFireworkParams=JSON.stringify({count:recipe.count,radius:+recipe.radius.toFixed(1),duration:recipe.duration,reachTime:recipe.reachTime,gravity:+recipe.gravityScale.toFixed(3),pointScale:+recipe.pointScale.toFixed(3),life:+recipe.lifeScale.toFixed(3)});

    }catch(_){finale.dataset.nyFireworksUnavailable='true';}
  }
  PlazaRuntime.on(finale,'click',event=>{if(interactiveTarget(event.target)||event.button!==0||event.detail===0)return;launchFirework(event.clientX,event.clientY);});
  PlazaRuntime.on(finale,'pointerenter',event=>{if(event.pointerType!=='mouse')return;hoverInside=true;hoverX=event.clientX;hoverY=event.clientY;scheduleHover(1000);},{passive:true});
  PlazaRuntime.on(finale,'pointermove',event=>{if(event.pointerType==='mouse'){hoverX=event.clientX;hoverY=event.clientY;}if(coarse.matches||event.pointerType==='touch'||!canAnimate())return;const r=finale.getBoundingClientRect();pointerX=clamp((event.clientX-r.left)/r.width*2-1,-1,1);pointerY=clamp((event.clientY-r.top)/r.height*2-1,-1,1);queueParallax();},{passive:true});
  PlazaRuntime.on(finale,'pointerleave',()=>{hoverInside=false;clearHoverTimer();pointerX=pointerY=0;queueParallax();},{passive:true});
  PlazaRuntime.on(window,'scroll',queueParallax,{passive:true});PlazaRuntime.on(window,'resize',queueParallax,{passive:true});PlazaRuntime.on(document,'visibilitychange',syncActivity);
  if(motion.addEventListener)PlazaRuntime.on(motion,'change',syncActivity);else motion.addListener(syncActivity);
  new MutationObserver(syncActivity).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);syncActivity();},{threshold:.01}).observe(finale);else{visible=true;syncActivity();}
  PlazaRuntime.on(window,'pagehide',()=>{stopCelebration();if(raf)PlazaMotion.cancelFrame(raf);raf=0;finale.dataset.nyFxActive='false';});PlazaRuntime.on(window,'pageshow',syncActivity);
  PlazaRuntime.on(window,'beforeprint',()=>{printing=true;syncActivity();});PlazaRuntime.on(window,'afterprint',()=>{printing=false;syncActivity();});
})();

};PlazaRuntime.on(document,'plaza:activate-finale',activate,{once:true});
 PlazaRuntime.on(document,'click',e=>{if(e.target.closest('[data-preview-activate-finale]'))activate()});
 PlazaRuntime.on(window,'message',e=>{if(e.source===parent&&e.data?.plazaPreviewCommand==='activate-finale')activate()});
})();
