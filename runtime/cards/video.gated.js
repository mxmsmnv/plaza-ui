/* Preview activation gate around the unchanged production video engine. */
(()=>{'use strict';const roots=[...document.querySelectorAll('.plaza-hero-video')];if(!roots.length)return;roots.forEach(root=>{root.querySelectorAll('.plaza-video-seek').forEach(seek=>seek.remove());root.classList.remove('started','controls-fading','poster-returning');root.closest('.hero-visual')?.classList.remove('video-active');const video=root.querySelector('video');if(video?.getAttribute('src')?.startsWith('blob:'))video.removeAttribute('src')});let started=false;
function startOriginalVideo(){
(function(){document.querySelectorAll('.plaza-hero-video').forEach(root=>{
const video=root.querySelector('video'),toggle=root.querySelector('.plaza-video-toggle'),sound=root.querySelector('.plaza-video-sound'),full=root.querySelector('.plaza-video-fullscreen'),status=root.querySelector('.plaza-video-status'),progress=root.querySelector('.plaza-video-progress'),circle=progress.querySelector('circle');let intent=false,request=0,timer,captionReturnTimer,captionDepartTimer;const visual=root.closest('.hero-visual'),caption=visual?.querySelector('.hero-glass');function measureCaption(){if(caption){visual.style.setProperty('--video-caption-height',caption.getBoundingClientRect().height+'px');visual.style.setProperty('--video-frame-height',root.getBoundingClientRect().height+'px');}}measureCaption();if(caption){const captionObserver=new ResizeObserver(measureCaption);captionObserver.observe(caption);captionObserver.observe(root);}
const narrow=()=>matchMedia(root.dataset.mobileMedia||'(max-width:767px)').matches;const source=()=>narrow()?root.dataset.mobile:root.dataset.desktop;
const seek=document.createElement('input');seek.type='range';seek.className='plaza-video-seek';seek.min='0';seek.max='1000';seek.step='1';seek.value='0';seek.disabled=true;seek.setAttribute('aria-label','Перемотка видео');root.append(seek);progress.setAttribute('aria-hidden','true');
PlazaRuntime.on(seek,'input',()=>{if(Number.isFinite(video.duration)&&video.duration>0){video.currentTime=Number(seek.value)/1000*video.duration;update();}});
video.muted=!narrow();video.preload='none';let userActivated=false;
// Fully download after page images, without user interaction; never autoplay.
const loadRing=root.querySelector('.plaza-video-load-progress'),loadCircle=loadRing.querySelector('circle');
let readySource='',requestedSource='',loadController,loadGeneration=0,imagesReady=false,failed=false,pendingPlay=false;
const cached=new Map();
// A network-page retry must create a fresh native media request, not reuse a failed Blob/cache entry.
const networkRecovery=document.body.classList.contains('plaza-network');
let revealTimer,hideTimer;function restoreCornerControls(){clearTimeout(hideTimer);root.classList.remove('controls-fading');[toggle,sound,full].forEach(b=>{b.inert=b.disabled;});}function scheduleCornerHide(){clearTimeout(hideTimer);if(video.paused||video.ended)return;if(document.activeElement===seek){restoreCornerControls();return;}root.classList.add('controls-fading');[toggle,sound,full].forEach(b=>b.inert=true);}
function revealPointerControls(event){if(event && event.pointerType!=='mouse')return;if(video.paused||video.ended)return;restoreCornerControls();hideTimer=setTimeout(()=>{if(!root.querySelector('.plaza-video-controls').contains(document.activeElement)&&document.activeElement!==seek)scheduleCornerHide();},2000);}PlazaRuntime.on(root,'pointermove',revealPointerControls);PlazaRuntime.on(root,'pointerleave',event=>{if(event.pointerType==='mouse'&&!video.paused&&!video.ended&&!root.querySelector('.plaza-video-controls').contains(document.activeElement)&&document.activeElement!==seek)scheduleCornerHide();});PlazaRuntime.on(root,'focusin',event=>{if((event.target.closest('.plaza-video-controls')||event.target===seek)&&!video.paused&&!video.ended)restoreCornerControls();});PlazaRuntime.on(root,'focusout',()=>{if(!video.paused&&!video.ended)hideTimer=setTimeout(()=>{if(!root.querySelector('.plaza-video-controls').contains(document.activeElement)&&document.activeElement!==seek)scheduleCornerHide();},2000);});
function hideExtraControls(){restoreCornerControls();clearTimeout(revealTimer);root.dataset.controlsStage='loading';[sound,full].forEach(button=>{button.disabled=true;button.inert=true;button.setAttribute('aria-hidden','true');});}
function revealExtraControls(id){clearTimeout(revealTimer);const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;revealTimer=setTimeout(()=>{if(id!==loadGeneration||readySource!==source())return;root.dataset.controlsStage='sound';sound.disabled=false;sound.inert=root.classList.contains('controls-fading');sound.removeAttribute('aria-hidden');revealTimer=setTimeout(()=>{if(id!==loadGeneration||readySource!==source())return;root.dataset.controlsStage='complete';full.disabled=false;full.inert=root.classList.contains('controls-fading');full.removeAttribute('aria-hidden');},reduced?0:600);},reduced?0:180);}
hideExtraControls();
video.loop=false;toggle.disabled=false;toggle.setAttribute('aria-disabled','true');root.dataset.playReady='false';
function percent(n){root.removeAttribute('data-load-indeterminate');const p=Math.max(0,Math.min(100,n));root.dataset.preloadPercent=String(Math.round(p));loadCircle.setAttribute('stroke-dashoffset',String(100-p));loadRing.setAttribute('aria-valuenow',String(Math.round(p)));status.textContent='';}
async function preloadVideo(position=0,resume=false,forceFresh=false){
 if(!imagesReady||(narrow()&&!userActivated))return;const url=source(),id=++loadGeneration,fresh=networkRecovery&&forceFresh;let mediaURL=url;if(fresh){request++;intent=false;video.pause();const old=cached.get(url);if(old)URL.revokeObjectURL(old);cached.delete(url);video.removeAttribute('src');video.load();const retry=new URL(url,location.href);retry.searchParams.set('plaza_video_retry',Date.now()+'-'+id);mediaURL=retry.href;root.dataset.recoveryMode='network-stream';root.dataset.retrySource=mediaURL;}requestedSource=url;root.dataset.loadAttempt=String(id);loadController?.abort();loadController=new AbortController();readySource='';failed=false;hideExtraControls();toggle.disabled=false;toggle.setAttribute('aria-disabled','true');root.dataset.playReady='false';seek.disabled=true;root.dataset.preloadPhase='loading';percent(0);const activeController=loadController;let watchdog,timedOut=false;const armWatchdog=()=>{clearTimeout(watchdog);watchdog=setTimeout(()=>{timedOut=true;activeController.abort();},45000)};armWatchdog();
 try{
  if(!fresh&&!cached.has(url)){
   const response=await fetch(url,{signal:loadController.signal,cache:'force-cache'});if(!response.ok)throw Error('HTTP '+response.status);
   const total=response.headers.get('Content-Encoding')?0:Number(response.headers.get('Content-Length'));if(!total)root.dataset.loadIndeterminate='true';const reader=response.body?.getReader();let loaded=0;const parts=[];
   if(reader){while(true){const chunk=await reader.read();if(chunk.done)break;parts.push(chunk.value);loaded+=chunk.value.byteLength;armWatchdog();if(total)percent(loaded/total*100);}if(total&&loaded!==total)throw Error('Incomplete video');}
   else{const bytes=await response.arrayBuffer();parts.push(bytes);loaded=bytes.byteLength;}
   if(id!==loadGeneration)return;cached.set(url,URL.createObjectURL(new Blob(parts,{type:'video/mp4'})));root.dataset.warmBytes=String(loaded);
  }
  if(id!==loadGeneration)return;
  video.src=fresh?mediaURL:cached.get(url);video.preload='auto';if(position>0)PlazaRuntime.on(video,'loadedmetadata',()=>{if(id===loadGeneration&&Number.isFinite(video.duration))video.currentTime=Math.min(position,Math.max(0,video.duration-.1));},{once:true});video.load();await new Promise((resolve,reject)=>{let mediaTimer;const clean=()=>{clearTimeout(mediaTimer);PlazaRuntime.off(video,'canplay',good);PlazaRuntime.off(video,'error',bad)};const good=()=>{clean();resolve()};const bad=()=>{clean();reject(Error('Video decode failed'))};PlazaRuntime.on(video,'canplay',good,{once:true});PlazaRuntime.on(video,'error',bad,{once:true});mediaTimer=setTimeout(()=>{clean();reject(Error('Video readiness timeout'))},15000);if(video.readyState>=3)good();});if(id!==loadGeneration)return;
  readySource=url;percent(100);root.dataset.playReady='true';seek.disabled=false;root.dataset.preloadPhase='ready';revealExtraControls(id);toggle.disabled=false;toggle.removeAttribute('aria-disabled');status.textContent='';if(resume||pendingPlay){pendingPlay=false;play();}
 }catch(e){if((e.name==='AbortError'&&!timedOut)||id!==loadGeneration)return;const badURL=cached.get(url);if(badURL){URL.revokeObjectURL(badURL);cached.delete(url)}readySource='';failed=true;pendingPlay=false;root.removeAttribute('data-load-indeterminate');root.dataset.preloadPhase='error';toggle.disabled=false;toggle.removeAttribute('aria-disabled');status.textContent='Загрузка прервана. Нажмите Play для повтора.';}finally{clearTimeout(watchdog)}
}
async function afterImages(){if(userActivated||root.dataset.preloadPhase==='loading'||readySource)return;if(narrow()){imagesReady=true;root.dataset.imagesReady='true';root.dataset.preloadPhase='idle';loadCircle.setAttribute('stroke-dashoffset','0');toggle.removeAttribute('aria-disabled');return}const images=[...document.images];images.forEach(img=>{if(img.loading==='lazy')img.loading='eager';});await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{PlazaRuntime.on(img,'load',resolve,{once:true});PlazaRuntime.on(img,'error',resolve,{once:true});})));imagesReady=true;root.dataset.imagesReady='true';preloadVideo();}
if(document.readyState==='complete')queueMicrotask(afterImages);else PlazaRuntime.on(window,'load',afterImages,{once:true});
PlazaRuntime.on(window,'pagehide',()=>{clearTimeout(hideTimer);clearTimeout(revealTimer);loadController?.abort();cached.forEach(url=>URL.revokeObjectURL(url));if(networkRecovery){cached.clear();readySource='';requestedSource='';failed=true;pendingPlay=false;intent=false;request++;root.dataset.preloadPhase='idle';root.dataset.playReady='false';toggle.disabled=false;toggle.inert=false;toggle.removeAttribute('aria-disabled');}});

function sync(){if(video.paused||video.ended)restoreCornerControls();toggle.inert=root.classList.contains('controls-fading');root.classList.toggle('is-playing',!video.paused&&!video.ended);toggle.setAttribute('aria-label',video.paused?'Смотреть видео':'Приостановить видео');toggle.title=toggle.getAttribute('aria-label');root.querySelector('.plaza-play-icon').toggleAttribute('hidden',!video.paused);root.querySelector('.plaza-pause-icon').toggleAttribute('hidden',video.paused);sound.setAttribute('aria-label',video.muted?'Включить звук':'Выключить звук');sound.title=sound.getAttribute('aria-label');sound.setAttribute('aria-pressed',String(!video.muted));root.querySelector('.plaza-muted-icon').toggleAttribute('hidden',!video.muted);root.querySelector('.plaza-volume-icon').toggleAttribute('hidden',video.muted);}
function loading(on){root.setAttribute('aria-busy',String(on));status.textContent='';}
function fail(){if(networkRecovery){intent=false;request++;toggle.disabled=false;toggle.inert=false;toggle.removeAttribute('aria-disabled');}video.pause();restoreCornerControls();const badURL=cached.get(source());if(badURL){URL.revokeObjectURL(badURL);cached.delete(source())}failed=true;readySource='';pendingPlay=false;root.dataset.preloadPhase='error';root.dataset.playReady='false';seek.disabled=true;clearTimeout(captionDepartTimer);clearTimeout(captionReturnTimer);intent=false;root.classList.remove('started');visual?.classList.remove('video-active');loading(false);status.textContent='Не удалось воспроизвести видео. Нажмите Play ещё раз.';sync();}
function play(){root.classList.remove('poster-returning');clearTimeout(captionReturnTimer);intent=true;loading(true);const id=++request;video.play().catch(e=>{if(id!==request||!intent)return;if(e.name==='NotAllowedError'&&!video.muted){video.muted=true;sync();video.play().catch(()=>{if(id===request&&intent)fail()});}else fail();});}
function togglePlayback(){userActivated=true;imagesReady=true;if(failed&&root.dataset.preloadPhase==='loading')return;if(readySource!==source()){pendingPlay=true;if(failed||root.dataset.preloadPhase!=='loading')preloadVideo(0,false,failed);return;}if(intent){intent=false;request++;video.pause();loading(false);sync();return;}if(!video.getAttribute('src')||video.error){video.src=source();video.load();}if(video.ended)video.currentTime=0;play();}

// Короткий клик — пауза; удержание мыши от 250 мс — скорость ×3.
let holdX=0,holdY=0,holdTimer,holdPointer=null,boosted=false,normalRate=1,suppressClickUntil=0;
function endHold(){clearTimeout(holdTimer);if(boosted){video.playbackRate=normalRate;root.classList.remove('speeding');suppressClickUntil=Date.now()+600;}boosted=false;holdPointer=null;}
PlazaRuntime.on(root,'pointerdown',e=>{if(!['mouse','touch','pen'].includes(e.pointerType)||e.button!==0||e.target.closest('button,a,input')||video.paused)return;holdX=e.clientX;holdY=e.clientY;holdPointer=e.pointerId;normalRate=video.playbackRate;root.setPointerCapture(e.pointerId);holdTimer=setTimeout(()=>{if(holdPointer===null||video.paused)return;boosted=true;video.playbackRate=3;root.classList.add('speeding');},250);});
PlazaRuntime.on(root,'pointermove',e=>{if(holdPointer!==null&&Math.hypot(e.clientX-holdX,e.clientY-holdY)>12)endHold();});PlazaRuntime.on(root,'contextmenu',e=>{if(holdPointer!==null||boosted)e.preventDefault();});PlazaRuntime.on(root,'pointerup',endHold);PlazaRuntime.on(root,'pointercancel',endHold);PlazaRuntime.on(root,'lostpointercapture',endHold);PlazaRuntime.on(video,'ended',endHold);PlazaRuntime.on(video,'pause',endHold);PlazaRuntime.on(window,'blur',endHold);PlazaRuntime.on(document,'visibilitychange',()=>{if(document.hidden)endHold();});
PlazaRuntime.on(root,'dragstart',e=>e.preventDefault());
PlazaRuntime.on(toggle,'click',togglePlayback);let singleClickTimer=0;
function cancelSingleClick(){clearTimeout(singleClickTimer);singleClickTimer=0;}
// Touch double tap uses pointerup directly, retaining browser user activation.
let touchTap=null,lastTouchTap=null,touchClickUntil=0;
PlazaRuntime.on(root,'pointerdown',e=>{
 if(!['touch','pen'].includes(e.pointerType))return;
 touchClickUntil=Date.now()+800;
 if(!e.isPrimary||e.button!==0||e.target.closest('button,a,input')){touchTap=null;lastTouchTap=null;cancelSingleClick();return;}
 touchTap={id:e.pointerId,x:e.clientX,y:e.clientY,time:Date.now()};
});
PlazaRuntime.on(root,'pointermove',e=>{
 if(touchTap&&e.pointerId===touchTap.id&&Math.hypot(e.clientX-touchTap.x,e.clientY-touchTap.y)>12){touchTap=null;lastTouchTap=null;cancelSingleClick();}
});
PlazaRuntime.on(root,'pointercancel',()=>{touchTap=null;lastTouchTap=null;touchClickUntil=Date.now()+800;cancelSingleClick();});
PlazaRuntime.on(root,'pointerup',e=>{
 if(!['touch','pen'].includes(e.pointerType))return;
 touchClickUntil=Date.now()+800;
 const tap=touchTap;touchTap=null;
 if(!tap||tap.id!==e.pointerId||Date.now()-tap.time>=250||Date.now()<suppressClickUntil||e.target.closest('button,a,input')){lastTouchTap=null;return;}
 const now=Date.now();
 if(lastTouchTap&&now-lastTouchTap.time<=400&&Math.hypot(e.clientX-lastTouchTap.x,e.clientY-lastTouchTap.y)<=24){
  lastTouchTap=null;cancelSingleClick();toggleFullscreen();return;
 }
 lastTouchTap={time:now,x:e.clientX,y:e.clientY};cancelSingleClick();
 singleClickTimer=setTimeout(()=>{singleClickTimer=0;lastTouchTap=null;togglePlayback();},400);
});

PlazaRuntime.on(root,'click',e=>{if(Date.now()<touchClickUntil)return;if(e.target.closest('button,a,input'))return;e.preventDefault();cancelSingleClick();if(Date.now()<suppressClickUntil||e.detail>1)return;singleClickTimer=setTimeout(()=>{singleClickTimer=0;togglePlayback();},400);});
PlazaRuntime.on(root,'dblclick',e=>{if(Date.now()<touchClickUntil)return;if(e.target.closest('button,a,input'))return;e.preventDefault();cancelSingleClick();if(Date.now()<suppressClickUntil)return;toggleFullscreen();});
PlazaRuntime.on(window,'pagehide',cancelSingleClick);PlazaRuntime.on(window,'blur',cancelSingleClick);PlazaRuntime.on(root,'keydown',e=>{if(e.target===root&&(e.key===' '||e.key==='Enter')){e.preventDefault();togglePlayback();}});
PlazaRuntime.on(sound,'click',()=>{video.muted=!video.muted;sync();});
function toggleFullscreen(){
 cancelSingleClick();
 if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});}
 else if(video.webkitEnterFullscreen && (!document.fullscreenEnabled||!root.requestFullscreen)){video.webkitEnterFullscreen();}
 else if(root.requestFullscreen){root.requestFullscreen().catch(()=>{if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();else status.textContent='Полноэкранный режим недоступен в этом браузере.';});}
}
PlazaRuntime.on(full,'click',toggleFullscreen);
PlazaRuntime.on(document,'fullscreenchange',()=>{full.setAttribute('aria-label',document.fullscreenElement===root?'Выйти из полноэкранного режима':'Развернуть на весь экран');});

// Controls stay visible during playback, including fullscreen.
root.classList.remove('controls-idle');

// На паузе карточка возвращается, если курсор покинул видео.
let pointerInside=root.matches(':hover');
function pausedCaptionReturn(){if(!video.paused||video.ended||(!narrow()&&pointerInside)||!root.classList.contains('started'))return;clearTimeout(captionReturnTimer);captionReturnTimer=setTimeout(()=>{if(video.paused&&!video.ended&&(narrow()||!pointerInside))visual?.classList.remove('video-active');},3000);}
PlazaRuntime.on(root,'pointerenter',e=>{if(e.pointerType!=='mouse')return;pointerInside=true;if(video.paused&&!video.ended)clearTimeout(captionReturnTimer);});
PlazaRuntime.on(root,'pointerleave',e=>{if(e.pointerType!=='mouse')return;pointerInside=false;pausedCaptionReturn();});
PlazaRuntime.on(video,'pause',()=>{clearTimeout(captionDepartTimer);if(narrow()&&root.classList.contains('started'))visual?.classList.add('video-active');pausedCaptionReturn();});
PlazaRuntime.on(video,'playing',()=>{scheduleCornerHide();clearTimeout(captionReturnTimer);clearTimeout(captionDepartTimer);visual?.style.setProperty('--video-caption-depart-delay','0s');root.classList.add('started');captionDepartTimer=setTimeout(()=>{if(!video.paused&&!video.ended)visual?.classList.add('video-active');},1000);loading(false);sync();});['pause','play','volumechange'].forEach(name=>PlazaRuntime.on(video,name,sync));PlazaRuntime.on(video,'waiting',()=>{if(intent)loading(true);});PlazaRuntime.on(video,'error',()=>{if(intent||root.classList.contains('started'))fail();});PlazaRuntime.on(video,'ended',()=>{clearTimeout(captionDepartTimer);intent=false;request++;loading(false);root.classList.remove('started');root.classList.add('poster-returning');clearTimeout(captionReturnTimer);captionReturnTimer=setTimeout(()=>{if(!intent)visual?.classList.remove('video-active');},2000);update();sync();});
function update(){const ratio=video.ended?0:Number.isFinite(video.duration)&&video.duration>0?video.currentTime/video.duration:0;seek.value=String(Math.round(ratio*1000));seek.style.setProperty('--video-progress',ratio*100+'%');seek.setAttribute('aria-valuetext',Math.floor(video.currentTime)+' секунд из '+Math.floor(video.duration||0));circle.setAttribute('stroke-dashoffset',String(100-Math.min(1,ratio)*100));progress.setAttribute('aria-valuenow',String(Math.round(ratio*100)));}['timeupdate','durationchange'].forEach(name=>PlazaRuntime.on(video,name,update));
function resize(){clearTimeout(timer);timer=setTimeout(()=>{if(!imagesReady||requestedSource===source())return;const position=video.currentTime,resume=intent;request++;video.pause();preloadVideo(position,resume);},200);}PlazaRuntime.on(window,'resize',resize);sync();
});})();
}
const activate=event=>{const root=event.target.closest('.plaza-hero-video');if(!root||started||!event.target.closest('.plaza-video-toggle'))return;event.preventDefault();event.stopImmediatePropagation();started=true;PlazaRuntime.off(document,'click',activate,true);parent.postMessage({plazaPreview:true,heavyRuntimeRequest:'hero-video'},'*');startOriginalVideo();root.querySelector('.plaza-video-toggle')?.click()};
roots.forEach(root=>{const toggle=root.querySelector('.plaza-video-toggle');if(toggle){toggle.disabled=false;toggle.removeAttribute('aria-disabled')}});PlazaRuntime.on(document,'click',activate,true);
})();
