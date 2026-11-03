/* Prebuilt square WebP previews; fetched once, only when the cinema viewer needs one. */
let plazaGalleryPreviewCatalog;
const plazaLoadGalleryPreviews=()=>plazaGalleryPreviewCatalog ||= fetch(window.PlazaSpecimenContext?.galleryIndexURL || 'https://plaza.spa/wp-content/uploads/plaza-gallery-previews-v1/index.json?v=20261020-touch').then(response=>response.ok?response.json():{}).catch(()=>({}));
/* Room photo viewer. Scrolling, dragging and arrows belong to shared PlazaUI. */
PlazaRuntime.on(document,'DOMContentLoaded',()=>{
 const PLAZA_PHOTO_FIT = 'contain'; // Shared viewer default for all sites: contain preserves the full frame; cover restores filling.
 document.querySelectorAll('[data-room-gallery]').forEach(host=>{
  const dialog=host.querySelector('dialog'),rail=dialog.querySelector('.wellness-photo-track'),slides=[...rail.children],close=dialog.querySelector('[data-photo-close]'),all=host.querySelector('[data-all-photos]'),more=host.querySelector('[data-more-photos]'),counter=dialog.querySelector('[data-photo-counter]');let opener=null,mounted=false,previousOverflow='';
  if(!dialog.dataset.photoFit)dialog.dataset.photoFit=PLAZA_PHOTO_FIT;
  const touch=matchMedia('(max-width:1050px), (hover:none), (pointer:coarse)').matches||navigator.maxTouchPoints>0;dialog.classList.toggle('plaza-gallery-touch',touch);rail.tabIndex=-1;rail.setAttribute('autofocus','');close.removeAttribute('autofocus');
  const touchUI=touch?plazaTouchPhotoUI(dialog,rail,counter):null;
  const cinema=!touch&&document.body.classList.contains('plaza-room-cinema') && new URLSearchParams(location.search).get('gallery')!=='classic' ? plazaRoomCinema(dialog,rail,slides,counter) : null;
  const update=()=>{const index=Math.max(0,Math.min(slides.length-1,Math.round(rail.scrollLeft/rail.clientWidth)));counter.textContent=(index+1)+' / '+slides.length;if(dialog.open)cinema?.render(index);};
  const open=(index,button)=>{opener=button;previousOverflow=document.documentElement.style.overflow;dialog.showModal();document.documentElement.style.overflow='hidden';if(!mounted&&!touch){PlazaUI.mountSwipeRail(rail,slides,{label:host.dataset.galleryLabel||'Фотографии номера',previous:'Предыдущая фотография',next:'Следующая фотография'});mounted=true;}rail.scrollTo({left:index*rail.clientWidth,behavior:'instant'});cinema?.render(index,true);update();rail.focus({preventScroll:true});if(touch)touchUI.wake();};
  host.querySelectorAll('[data-photo-index]').forEach(button=>PlazaRuntime.on(button,'click',()=>open(Number(button.dataset.photoIndex),button)));
  PlazaRuntime.on(all,'click',()=>{const expanded=all.getAttribute('aria-expanded')!=='true';all.setAttribute('aria-expanded',String(expanded));const label=all.querySelector('.plaza-glow-label')||all;label.textContent=expanded?'Свернуть фотографии':all.dataset.closedLabel;more.hidden=!expanded;});
  PlazaRuntime.on(close,'click',()=>dialog.close());PlazaRuntime.on(dialog,'click',e=>{if(e.target===dialog)dialog.close();});
  PlazaRuntime.on(dialog,'close',()=>{cinema?.clear();touchUI?.clear();document.documentElement.style.overflow=previousOverflow;opener?.focus({preventScroll:true});});
  PlazaRuntime.on(dialog,'keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)&&e.target!==rail){e.preventDefault();if(touch){const i=Math.round(rail.scrollLeft/rail.clientWidth),next=(i+(e.key==='ArrowRight'?1:-1)+slides.length)%slides.length;rail.scrollTo({left:next*rail.clientWidth,behavior:'smooth'});}else dialog.querySelector(e.key==='ArrowRight'?'.rail-next':'.rail-prev')?.click();}});
  PlazaRuntime.on(rail,'scroll',update,{passive:true});new ResizeObserver(()=>{if(dialog.open){cinema?.resize();update();}}).observe(rail);
 });
 document.querySelectorAll('[data-room-media]').forEach(plazaMountRoomMedia);
});

/* Opt-in embedded room views share this owner; photo navigation remains above. */
function plazaMountRoomMedia(host) {
 if (host.dataset.roomMediaMounted) return;
 const dialog = host.querySelector('.plaza-room-media-dialog');
 const player = dialog?.querySelector('.plaza-room-media-player');
 const title = dialog?.querySelector('#plaza-room-media-title');
 const close = dialog?.querySelector('[data-room-media-close]');
 if (!player || !title || !close || typeof dialog.showModal !== 'function') return;
 host.dataset.roomMediaMounted = 'true';
 player.tabIndex = -1;
 player.setAttribute('autofocus', '');
 close.removeAttribute('autofocus');
 const status = document.createElement('p');
 status.className = 'plaza-room-media-status';
 status.setAttribute('role', 'status');
 status.setAttribute('aria-live', 'polite');
 status.setAttribute('aria-atomic', 'true');
 status.hidden = true;
 player.before(status);
 let opener = null, frame = null, generation = 0, loadNotice = 0;
 let scrollState = null, scrollController = null, stoppedByMedia = false;
 const setStatus = message => {status.textContent = message; status.hidden = !message;};
 const restoreScroll = () => {
  if (scrollState) {
   for (const item of scrollState) {
    item.element.style.removeProperty('overflow');
    for (const property of item.properties) {
     if (property.value) item.element.style.setProperty(property.name, property.value, property.priority);
    }
   }
  }
  if (stoppedByMedia && typeof scrollController?.start === 'function') scrollController.start();
  scrollState = scrollController = null;
  stoppedByMedia = false;
 };
 const lockScroll = () => {
  scrollState = [document.documentElement, document.body].map(element => ({
   element, properties: ['overflow', 'overflow-x', 'overflow-y'].map(name => ({
    name, value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name)
   }))
  }));
  scrollController = window.lenis || window.plazaLenis || null;
  if (scrollController && !scrollController.isStopped && typeof scrollController.stop === 'function') {
   scrollController.stop(); stoppedByMedia = true;
  }
  scrollState.forEach(({element}) => element.style.setProperty('overflow', 'hidden'));
 };
 const clearFrame = () => {
  generation++;
  clearTimeout(loadNotice); loadNotice = 0;
  player.replaceChildren(); frame = null;
  player.removeAttribute('aria-busy');
  setStatus('');
 };
 host.querySelectorAll('[data-room-media-open]').forEach(link => {
  PlazaRuntime.on(link,'click',event => {
   if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
   let url;
   try {url = new URL(link.href, location.href);} catch {return;}
   if (url.protocol !== 'https:' || url.origin !== location.origin || url.username || url.password) return;
   if (dialog.open) {event.preventDefault(); return;}
   title.textContent = link.dataset.mediaTitle || link.textContent.trim();
   try {dialog.showModal();} catch {return;}
   event.preventDefault();
   opener = link;
   lockScroll(); clearFrame();
   const ticket = generation;
   setStatus('Загружаем просмотр…');
   player.setAttribute('aria-busy', 'true');
   frame = document.createElement('iframe');
   const requestedFrame = frame;
   frame.title = title.textContent;
   frame.allow = 'fullscreen';
   frame.allowFullscreen = true;
   frame.referrerPolicy = 'strict-origin-when-cross-origin';
   frame.loading = 'eager';
   const current = () => generation === ticket && dialog.open && frame === requestedFrame;
   PlazaRuntime.on(frame,'load',() => {
    if (!current()) return;
    clearTimeout(loadNotice); loadNotice = 0;
    player.setAttribute('aria-busy', 'false');
    setStatus('');
   },{once: true});
   PlazaRuntime.on(frame,'error',() => {
    if (!current()) return;
    clearTimeout(loadNotice); loadNotice = 0;
    player.setAttribute('aria-busy', 'false');
    setStatus('Не удалось загрузить просмотр. Закройте окно и попробуйте ещё раз.');
   },{once: true});
   loadNotice = setTimeout(() => {
    loadNotice = 0;
    if (current()) setStatus('Просмотр загружается дольше обычного. Пожалуйста, подождите.');
   }, 15000);
   frame.src = url.href;
   player.replaceChildren(frame);
   player.focus({preventScroll: true});
  });
 });
 PlazaRuntime.on(close,'click',() => dialog.close());
 PlazaRuntime.on(dialog,'click',event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
 });
 PlazaRuntime.on(dialog,'close',() => {
  clearFrame(); restoreScroll();
  if (opener?.isConnected) opener.focus({preventScroll: true});
  opener = null;
 });
 // Escape and arrows inside the frame belong to the original 3D/tour controls.
 PlazaRuntime.on(window,'pagehide',() => {if (dialog.open) dialog.close(); else clearFrame();});
}

/* Optional renderer for the shared room gallery. Navigation stays in PlazaUI. */
function plazaRoomCinema(dialog, rail, slides, counter) {
 const fitContain = dialog.dataset.photoFit === 'contain';
 const reduced = matchMedia('(prefers-reduced-motion:reduce)');
 const fine = matchMedia('(hover:hover) and (pointer:fine)');
 let cursorIdleTimer = 0;
 const stage = document.createElement('div');
 stage.className = 'plaza-cinema-stage';
 stage.setAttribute('aria-hidden', 'true');
 const cursor = document.createElement('span');
 cursor.className = 'plaza-cinema-cursor';
 cursor.setAttribute('aria-hidden', 'true');
 cursor.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>';
 let preview = document.createElement('img');
 preview.className = 'plaza-cinema-preview'; preview.alt = ''; preview.decoding = 'async';
 preview.draggable = false; preview.sizes = '100px'; cursor.prepend(preview);
 let previewSlide = null;
 const updateCursorPreview = async index => {
  const backwards = cursor.dataset.direction === 'previous';
  const target = (index + (backwards ? -1 : 1) + slides.length) % slides.length;
  const source = slides[target].querySelector('img');
  if (!source || source === previewSlide) return;
  previewSlide = source;
  const original = source.getAttribute('src') || source.dataset.storySrc || '';
  if (!original) return;
  const catalog = await plazaLoadGalleryPreviews();
  if (previewSlide !== source) return;
  const thumbnail = catalog[new URL(original,location.href).pathname];
  const srcset = thumbnail ? '' : source.getAttribute('srcset') || source.dataset.storySrcset || '';
  const nextPreview = document.createElement('img');
  nextPreview.className = 'plaza-cinema-preview'; nextPreview.alt = ''; nextPreview.decoding = 'async';
  nextPreview.draggable = false; nextPreview.sizes = '100px';
  if (srcset) nextPreview.srcset = srcset;
  nextPreview.src = thumbnail || original;
  try { await nextPreview.decode(); } catch { return; }
  if (previewSlide !== source || !dialog.open) return;
  const previousPreview = preview;
  previousPreview.after(nextPreview); preview = nextPreview;
  cursor.dataset.previewIndex = String(target);
  if (reduced.matches || !nextPreview.animate) previousPreview.remove();
  else PlazaMotion.animate(nextPreview,[{opacity:0},{opacity:1}],{duration:600,easing:'ease',fill:'both'}).finished.then(()=>previousPreview.remove()).catch(()=>previousPreview.remove());
 };

 const status = document.createElement('p');
 status.className = 'plaza-cinema-status'; status.setAttribute('role', 'status');
 dialog.append(stage, cursor, status);
 dialog.classList.add('plaza-gallery-cinema');
 counter.setAttribute('aria-atomic', 'true');
 let shown = -1, wanted = -1, generation = 0, layer = null, animations = [], down = null, railWidth = 0, nextDirection = 0;
 let clickTimer = 0, pendingClick = null, ownsFullscreen = false;
 const fullscreen = document.createElement('button');
 fullscreen.type = 'button';
 fullscreen.className = 'wellness-photo-counter plaza-cinema-fullscreen';
 counter.className = 'plaza-cinema-count';
 counter.id ||= 'plaza-cinema-count-' + document.querySelectorAll('.plaza-cinema-fullscreen').length;
 fullscreen.setAttribute('aria-describedby', counter.id);
 const fullscreenIcon = document.createElementNS('http://www.w3.org/2000/svg','svg');
 fullscreenIcon.setAttribute('viewBox','0 0 24 24');
 fullscreenIcon.setAttribute('aria-hidden','true');
 const fullscreenPath = document.createElementNS('http://www.w3.org/2000/svg','path');
 fullscreenIcon.append(fullscreenPath);
 counter.before(fullscreen); fullscreen.append(counter, fullscreenIcon);
 // Fullscreen must contain only the viewer. Fullscreening <html> can cover its modal dialog.
 // A <dialog> cannot itself request fullscreen, so keep its complete UI in one child surface.
 const viewport = document.createElement('div');
 viewport.className = 'plaza-cinema-viewport';
 viewport.append(...dialog.childNodes);
 dialog.append(viewport);
 const cancelClick = () => {clearTimeout(clickTimer); clickTimer = 0; pendingClick = null;};
 const syncFullscreen = () => {
  const active = document.fullscreenElement === viewport;
  fullscreen.setAttribute('aria-pressed', String(active));
  fullscreen.setAttribute('aria-label', active ? 'Выйти из полноэкранного режима' : 'На весь экран');
  fullscreenPath.setAttribute('d', active ? 'M3 8h5V3m8 0v5h5M3 16h5v5m8 0v-5h5' : 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5');
  ownsFullscreen = active;
 };
 const toggleFullscreen = async () => {
  cancelClick();
  try {
   if (document.fullscreenElement === viewport) await document.exitFullscreen();
   else if (viewport.requestFullscreen) {
    await viewport.requestFullscreen();
    // The user may close the dialog while the browser is granting fullscreen.
    if (!dialog.open && document.fullscreenElement === viewport) await document.exitFullscreen();
   } else throw new Error('Fullscreen unavailable');
   status.textContent = ''; syncFullscreen();
  } catch {status.textContent = 'Полноэкранный режим недоступен в этом браузере.';}
 };
 PlazaRuntime.on(fullscreen,'click',e => {e.stopPropagation(); toggleFullscreen();});
 PlazaRuntime.on(document,'fullscreenchange',syncFullscreen);
 PlazaRuntime.on(dialog,'cancel',e => {
  if (document.fullscreenElement === viewport) {e.preventDefault(); toggleFullscreen();}
 });
 syncFullscreen();
 let controlsIdleTimer = 0;
 const clearControlsIdle = () => {clearTimeout(controlsIdleTimer); controlsIdleTimer = 0; dialog.classList.remove('is-controls-idle');};
 const wakeControls = () => {
  clearControlsIdle();
  if (!dialog.open) return;
  controlsIdleTimer = setTimeout(() => {
   controlsIdleTimer = 0;
   const controls = [dialog.querySelector('[data-photo-close]'), fullscreen];
   if (controls.some(control => control.matches(':hover,:focus-visible'))) return;
   dialog.classList.add('is-controls-idle');
  }, 2000);
 };
 PlazaRuntime.on(dialog,'pointermove',event=>{if(event.pointerType==='mouse')wakeControls();},{passive:true});
 PlazaRuntime.on(dialog,'keydown',wakeControls);
 PlazaRuntime.on(dialog,'focusin',wakeControls);
 const stop = () => { animations.forEach(a => a.cancel()); animations = []; };
 const clear = () => {
  clearControlsIdle();
  cancelClick();
  if (ownsFullscreen && document.fullscreenElement === viewport) document.exitFullscreen().catch(() => {});
  clearTimeout(cursorIdleTimer); cursorIdleTimer = 0;
  generation++; stop(); stage.replaceChildren(); layer = null; shown = wanted = -1;
  cursor.classList.remove('is-visible'); rail.classList.remove('plaza-cinema-native-cursor'); status.textContent = ''; down = null;
 };
 const render = async (index, instant = false) => {
  if (instant) wakeControls();
  if (index === wanted && !instant) return;
  wanted = index; railWidth = rail.clientWidth; const ticket = ++generation; const requestedDirection = nextDirection; nextDirection = 0;
  const source = slides[index].querySelector('img');
  const image = source.cloneNode(false);
  image.loading = 'eager'; image.decoding = 'async'; image.alt = '';
  image.sizes = '100vw'; image.removeAttribute('id');
  status.textContent = '';
  try { await image.decode(); }
  catch { if (ticket === generation) { status.textContent = 'Фотография не загрузилась. Выберите другой кадр.'; wanted = -1; } return; }
  if (ticket !== generation || !dialog.open) return;
  stop();
  if (layer) { layer.getAnimations().forEach(a => a.cancel()); layer.style.clipPath = 'inset(0)'; }
  [...stage.children].forEach(child => { if (child !== layer) child.remove(); });
  const next = document.createElement('div'); next.className = 'plaza-cinema-layer';
  next.append(image); stage.append(next);
  const previous = layer, direction = requestedDirection || (index >= shown ? 1 : -1);
  layer = next; shown = index;
  dialog.dataset.cinemaIndex = String(index);
  updateCursorPreview(index);
  if (!previous || instant || reduced.matches) { previous?.remove(); return; }
  const timing = { duration: 880, easing: 'cubic-bezier(.76,0,.24,1)' };
  const reveal = PlazaMotion.animate(next,[
   {clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'},
   {clipPath:'inset(0 0 0 0)'}
  ],timing);
  const settle = fitContain ? null : PlazaMotion.animate(image,[
   {transform:`translateX(${direction * 5}%) scale(1.13)`}, {transform:'translateX(0) scale(1)'}
  ],{...timing, duration:1100, easing:'cubic-bezier(.22,.61,.36,1)'});
  const depart = PlazaMotion.animate(previous,[{transform:'translateX(0)'},{transform:`translateX(${-direction * 4}%)`}],timing);
  animations = [reveal, settle, depart].filter(Boolean);
  reveal.finished.then(() => previous.remove()).catch(() => {});
 };
 const step = direction => {
  cancelClick();
  const index=Math.round(rail.scrollLeft/rail.clientWidth);
  if ((direction<0 && index===0) || (direction>0 && index===slides.length-1)) {
   nextDirection=direction;
   rail.scrollTo({left:(direction<0?slides.length-1:0)*rail.clientWidth,behavior:'instant'});
  } else dialog.querySelector(direction>0?'.rail-next':'.rail-prev')?.click();
 };
 PlazaRuntime.on(dialog,'keydown',e => {
  if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
  e.preventDefault();e.stopImmediatePropagation();step(e.key==='ArrowRight'?1:-1);
 },true);
 PlazaRuntime.on(rail,'pointerdown',e => { down = {x:e.clientX,y:e.clientY,index:Math.round(rail.scrollLeft/rail.clientWidth)}; });
 PlazaRuntime.on(rail,'pointerup',e => {
  if (!down) return;
  const dx=e.clientX-down.x,dy=e.clientY-down.y;
  if (Math.abs(dx)<50 || Math.abs(dx)<Math.abs(dy)*1.3) return;
  const boundary=(dx>0 && down.index===0)||(dx<0 && down.index===slides.length-1);
  if (boundary) { down=null;step(dx>0?-1:1); }
 },true);
 PlazaRuntime.on(rail,'pointercancel',() => {down = null;cancelClick();});
 PlazaRuntime.on(rail,'click',e => {
  if (!down || Math.hypot(e.clientX-down.x,e.clientY-down.y)>8 || rail.dataset.plazaDragged) {down=null;return;}
  down=null;
  if (pendingClick && Math.hypot(e.clientX-pendingClick.x,e.clientY-pendingClick.y)<24) {
   toggleFullscreen(); return;
  }
  if (pendingClick) {const earlier=pendingClick.direction;cancelClick();step(earlier);}
  pendingClick={x:e.clientX,y:e.clientY,direction:e.clientX<dialog.getBoundingClientRect().width/2?-1:1};
  clickTimer=setTimeout(()=>{const direction=pendingClick?.direction;cancelClick();if(dialog.open&&direction)step(direction);},400);
 });
 PlazaRuntime.on(rail,'dblclick',e => e.preventDefault());
 const hideCursor = () => {clearTimeout(cursorIdleTimer); cursorIdleTimer = 0; cursor.classList.remove('is-visible');};
 PlazaRuntime.on(rail,'pointermove',e => {
  if (down && Math.hypot(e.clientX-down.x,e.clientY-down.y)>8) cancelClick();
  if (!fine.matches || e.pointerType !== 'mouse') return hideCursor();
  const closeBox=dialog.querySelector('[data-photo-close]').getBoundingClientRect();
  const nearClose=e.clientX>=closeBox.left-88 && e.clientY<=closeBox.bottom+88;
  const fullscreenBox=fullscreen.getBoundingClientRect();
  const nearFullscreen=e.clientX>=fullscreenBox.left-88 && e.clientY>=fullscreenBox.top-88;
  rail.classList.toggle('plaza-cinema-native-cursor',nearClose||nearFullscreen);
  if (nearClose||nearFullscreen) return hideCursor();
  const backwards=e.clientX < dialog.getBoundingClientRect().width/2;
  const index=Math.round(rail.scrollLeft / rail.clientWidth);
  const edge=backwards ? index===0 : index===slides.length-1;
  cursor.dataset.direction=backwards?'previous':'next';
  updateCursorPreview(index);
  cursor.style.left=Math.max(12,Math.min(innerWidth-cursor.offsetWidth-12,e.clientX+20))+'px';
  cursor.style.top=Math.max(12,Math.min(innerHeight-cursor.offsetHeight-12,e.clientY+20))+'px';
  cursor.classList.add('is-visible');
  clearTimeout(cursorIdleTimer);
  cursorIdleTimer = setTimeout(() => {cursorIdleTimer = 0; cursor.classList.remove('is-visible');}, 2000);
 });
 PlazaRuntime.on(rail,'pointerleave',hideCursor);
 PlazaRuntime.on(dialog,'keydown',hideCursor);

 PlazaRuntime.on(reduced,'change',() => { stop(); if(shown>=0) render(shown,true); });
 const resize = () => { if (rail.clientWidth !== railWidth && wanted >= 0) { railWidth = rail.clientWidth; rail.scrollTo({left:wanted * railWidth,behavior:'instant'}); } };
 return { render, clear, resize };
}






/* Native touch gallery: one tap reveals controls; double tap zooms within the window. */
function plazaTouchPhotoUI(dialog,rail,counter){
 const close=dialog.querySelector('[data-photo-close]');let idle=0,tapTimer=0,lastTap=null,down=null,scale=1,panX=0,panY=0,pinch=null;
 const image=()=>rail.children[Math.round(rail.scrollLeft/Math.max(1,rail.clientWidth))]?.querySelector('img');
 const apply=()=>{const img=image();if(img)img.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;rail.style.touchAction=scale>1?'none':'pan-x';};
 const resetZoom=()=>{rail.querySelectorAll('img').forEach(img=>{img.style.transform='';img.style.transformOrigin='';});scale=1;panX=panY=0;rail.style.touchAction='pan-x';};
 const wake=()=>{clearTimeout(idle);dialog.classList.remove('is-controls-idle');close.inert=false;idle=setTimeout(()=>{if(!dialog.open||close.matches(':focus-visible'))return;dialog.classList.add('is-controls-idle');close.inert=true;},2000);};
 const doubleTap=()=>{scale=scale>1?1:2.5;panX=panY=0;apply();wake();};
 PlazaRuntime.on(rail,'touchstart',event=>{wake();const a=event.touches[0];if(event.touches.length===2){const b=event.touches[1];pinch={distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),scale};down=null;event.preventDefault();}else down={x:a.clientX,y:a.clientY,time:performance.now(),panX,panY,moved:false};},{passive:false});
 PlazaRuntime.on(rail,'touchmove',event=>{if(event.touches.length===2&&pinch){const [a,b]=event.touches;scale=Math.max(1,Math.min(5,pinch.scale*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/Math.max(1,pinch.distance)));apply();event.preventDefault();return;}if(!down)return;const a=event.touches[0],dx=a.clientX-down.x,dy=a.clientY-down.y;if(Math.hypot(dx,dy)>10)down.moved=true;if(scale>1){panX=Math.max(-innerWidth*(scale-1)/2,Math.min(innerWidth*(scale-1)/2,down.panX+dx));panY=Math.max(-innerHeight*(scale-1)/2,Math.min(innerHeight*(scale-1)/2,down.panY+dy));apply();event.preventDefault();}},{passive:false});
 PlazaRuntime.on(rail,'touchend',event=>{if(event.touches.length)return;pinch=null;if(down&&!down.moved&&performance.now()-down.time<400){const a=event.changedTouches[0],now=performance.now();if(lastTap&&now-lastTap.time<320&&Math.hypot(a.clientX-lastTap.x,a.clientY-lastTap.y)<32){clearTimeout(tapTimer);lastTap=null;doubleTap();}else{lastTap={time:now,x:a.clientX,y:a.clientY};tapTimer=setTimeout(()=>{lastTap=null;wake();},330);}}down=null;wake();},{passive:true});
 PlazaRuntime.on(rail,'touchcancel',()=>{down=pinch=null;wake();},{passive:true});
 let lastIndex=-1;PlazaRuntime.on(rail,'scroll',()=>{const index=Math.round(rail.scrollLeft/Math.max(1,rail.clientWidth));if(index!==lastIndex){lastIndex=index;resetZoom();}wake();},{passive:true});
 PlazaRuntime.on(dialog,'keydown',wake);PlazaRuntime.on(dialog,'focusin',wake);
 const clear=()=>{clearTimeout(idle);clearTimeout(tapTimer);lastTap=down=pinch=null;resetZoom();dialog.classList.remove('is-controls-idle');close.inert=false;};
 return {wake,clear};
}
