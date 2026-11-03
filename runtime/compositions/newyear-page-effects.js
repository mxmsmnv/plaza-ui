/* PSK · Арт Плаза 2027. Page effects only; shared PlazaUI owns components. */
(() => {
  'use strict';
  if(new URLSearchParams(location.search).get('print-preview')==='1') document.documentElement.classList.add('np-preview');
  const root = document.querySelector('.psk-ny');
  if (!root || root.dataset.nyReady) return;
  // Isolated source card specimens do not own the full hero/seating page unit.
  if (!root.querySelector('.ny-hero')) return;
  root.dataset.nyReady = '1';
  // The booklet is a direct print root, outside all screen-page wrappers.
  const printBook=document.querySelector('.np-book');if(printBook)document.body.append(printBook);

  // Kislovodsk midnight, independent of the visitor's time zone.
  const countdown = root.querySelector('[data-ny-countdown]');
  if (countdown) {
    const deadline = Date.parse('2027-01-01T00:00:00+03:00');
    const fields = ['days', 'hours', 'minutes', 'seconds'].map(name => countdown.querySelector(`[data-ny-time="${name}"]`));
    let countdownTick;
    const updateCountdown = () => {
      window.clearTimeout(countdownTick);
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        countdown.hidden = true;
        PlazaRuntime.off(document,'visibilitychange',updateCountdown);
        PlazaRuntime.off(window,'pageshow',updateCountdown);
        return;
      }
      const seconds = Math.ceil(remaining / 1000);
      const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
      fields.forEach((field, index) => { field.textContent = String(values[index]).padStart(2, '0'); });
      countdown.hidden = false;
      countdownTick = window.setTimeout(updateCountdown, Math.min(1000, remaining));
    };
    PlazaRuntime.on(document,'visibilitychange',updateCountdown);
    PlazaRuntime.on(window,'pageshow',updateCountdown);
    updateCountdown();
  }



  // One muted inline playback after the whole page has loaded; gestures retry
  // only when the browser declined autoplay. The final frame stays on screen.
  const heroVideo=root.querySelector('[data-ny-video]');
  if(heroVideo){
    const gestures=['pointermove','pointerdown','touchstart','scroll','keydown'];
    let pageLoaded=document.readyState==='complete',started=false,attempting=false;
    const startVideo=()=>{
      if(!pageLoaded||started||attempting)return;
      heroVideo.muted=true;heroVideo.loop=false;attempting=true;
      heroVideo.play().then(()=>{
        started=true;attempting=false;
        gestures.forEach(type=>PlazaRuntime.off(window,type,startVideo));
      }).catch(()=>{attempting=false;});
    };
    gestures.forEach(type=>PlazaRuntime.on(window,type,startVideo,{passive:true}));
    if(pageLoaded)startVideo();
    else PlazaRuntime.on(window,'load',()=>{pageLoaded=true;startVideo();},{once:true});
  }

  // Only a collector: the common PLAZA module owns reveal timing and observers.
  if (window.PlazaRevealEngine) window.PlazaRevealEngine.mount({
    bodySelector: 'body.page-id-2582',
    collect({ select, addGroup }) {
      select('.psk-ny [data-ny-reveal]').forEach(element => {
        const kind = element.matches('.ny-section-heading') ? 'heading'
          : element.matches('.ny-artist,.ny-host,.ny-venue') ? 'card' : 'copy';
        addGroup(element, [element], kind, 0);
      });
    }
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const touchMedia=window.matchMedia('(any-pointer: coarse)');
  const touchDevice=()=>navigator.maxTouchPoints>0||touchMedia.matches||root.classList.contains('ny-touch');
  const syncTouch=()=>root.classList.toggle('ny-touch',touchDevice());
  syncTouch();PlazaRuntime.on(touchMedia,'change',syncTouch);
  PlazaRuntime.on(root,'pointerdown',event=>{if(event.pointerType==='touch')root.classList.add('ny-touch');},{passive:true});
  const hero = root.querySelector('.ny-hero');
  const heroHeading = root.querySelector('.ny-hero__heading');
  // Keep the accepted per-letter flare consistent on the eyebrow and year.
  root.querySelectorAll('p.ny-eyebrow>.ny-kicker__text,.ny-hero__heading>h1>span').forEach(festiveTitle=>{
    const text=festiveTitle.textContent;festiveTitle.setAttribute('aria-label',text);
    if(festiveTitle.parentElement.matches('h1'))festiveTitle.classList.add('ny-festive-year');
    let letterIndex=0;
    const fragments=text.split(/(\s+)/u).filter(Boolean).map(part=>{
      if(/^\s+$/u.test(part)){letterIndex+=Array.from(part).length;return document.createTextNode(' ');}
      const word=document.createElement('span');word.className='ny-festive-word';
      word.append(...Array.from(part,letter=>{const span=document.createElement('span');span.className='ny-festive-letter';span.setAttribute('aria-hidden','true');span.textContent=letter;span.style.setProperty('--ny-letter-index',letterIndex++);return span;}));
      return word;
    });
    festiveTitle.replaceChildren(...fragments);
  });
  // Generated content keeps this atomic year out of the shared heading TreeWalker.
  // There are no text nodes, gradient masks or nested animated glyph wrappers here.
  const finaleYear=root.querySelector('.ny-finale__year[data-ny-year]');
  if(finaleYear){
    const digits=Array.from(finaleYear.dataset.nyYear||'');
    finaleYear.replaceChildren(...digits.map((digit,index)=>{
      const span=document.createElement('span');span.className='ny-finale__digit';
      span.setAttribute('aria-hidden','true');span.dataset.nyDigit=digit;
      span.style.setProperty('--ny-letter-index',index);return span;
    }));
    finaleYear.classList.add('ny-year-ready');
  }
  const scenePointer={x:0,y:0};
  // Front-loaded response makes depth visible near the centre; endpoints stay bounded.
  const pointerAxis=value=>Math.sin(Math.max(-1,Math.min(1,value))*Math.PI*.5);

  const headliner = root.querySelector('.ny-headliner');
  const stage = root.querySelector('.ny-headliner__background');
  const headlineCopy = root.querySelector('.ny-headliner__content');
  const finale = root.querySelector('.ny-finale');
  let finaleVisible = false;
  let heroVisible = false;
  let headlinerVisible = false;
  let effectsFrame = 0;

  // No extra carousel controls or swipe implementation: use the existing shared rail.
  if (window.PlazaUI && typeof window.PlazaUI.mountSwipeRail === 'function') {
    [
      ['.ny-artists__rail', '.ny-artists', 'Музыканты новогоднего вечера', 'Предыдущий музыкальный коллектив', 'Следующий музыкальный коллектив'],
      ['.ny-hosts__rail', '.ny-hosts', 'Ведущие новогоднего вечера', 'Предыдущий ведущий', 'Следующий ведущий']
    ].forEach(([selector, host, label, previous, next]) => {
      const rail = root.querySelector(selector);
      if (!rail) return;
      window.PlazaUI.mountSwipeRail(rail, Array.from(rail.children), {
        host: root.querySelector(host), mobileOnly: true, label, previous, next
      });
    });
  }

  const food=root.querySelector('[data-ny-food]');
  if(food&&window.PlazaUI){
    const rail=food.querySelector('.ny-food-rail'),slides=Array.from(rail.children);
    let selected=0,requested=0,pointerTimer=0,gesture=null,clearPrevious=0,lastFoodChange=-1000,foodPointer='';
    const fader=document.createElement('div');fader.className='ny-food-fader';fader.setAttribute('aria-hidden','true');
    const frames=slides.map((slide,index)=>{const frame=slide.cloneNode(true);frame.className='ny-food-fadeframe';frame.classList.toggle('is-current',index===0);fader.append(frame);return frame;});
    food.prepend(fader);food.classList.add('ny-food-crossfade');
    const desktopInk=()=>innerWidth>700&&(foodPointer==='mouse'||(foodPointer!=='touch'&&fine.matches&&!touchDevice()));
    const syncFoodMode=()=>food.classList.toggle('ny-food-ink-mode',desktopInk());
    syncFoodMode();PlazaRuntime.on(fine,'change',syncFoodMode);PlazaRuntime.on(touchMedia,'change',syncFoodMode);PlazaRuntime.on(window,'resize',syncFoodMode,{passive:true});
    PlazaRuntime.on(food,'pointerdown',event=>{foodPointer=event.pointerType;syncFoodMode();},{passive:true,capture:true});
    // Shared PLAZA controls, with a page-specific circular dissolve presentation.
    // No smooth scrolling or debounce is interposed between a swipe and its dish.
    const present=index=>{
      index=(index+slides.length)%slides.length;if(index===selected)return;
      const previous=selected,ink=desktopInk();selected=requested=index;lastFoodChange=performance.now();
      syncFoodMode();clearTimeout(clearPrevious);food.classList.toggle('has-transitioned',ink);
      frames.forEach((frame,i)=>{frame.classList.toggle('is-previous',ink&&i===previous);frame.classList.toggle('is-current',i===index);});
      if(ink)clearPrevious=setTimeout(()=>frames.forEach(frame=>frame.classList.remove('is-previous')),520);
      slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(i!==index)));
      rail.scrollTo({left:index*rail.clientWidth,behavior:'instant'});
      ui.update(index,false,false,true);food.dataset.nyFoodIndex=String(index);
    };
    const ui=window.PlazaUI.createSliderControls(slides.map(slide=>slide.querySelector('strong')?.textContent||'Блюдо'),present,direction=>present(selected+direction),{previous:'Предыдущее блюдо',next:'Следующее блюдо'});
    rail.after(ui.element);ui.update(0,false,false,true);food.dataset.nyFoodIndex='0';
    rail.setAttribute('aria-label','Блюда новогоднего банкета');slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(i!==0)));
    PlazaRuntime.on(rail,'keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();present(selected+(event.key==='ArrowRight'?1:-1));}});
    PlazaRuntime.on(rail,'pointerdown',event=>{clearTimeout(pointerTimer);requested=selected;if(event.button!==0)return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY};if(event.pointerType==='touch')rail.setPointerCapture(event.pointerId);},{passive:true});
    PlazaRuntime.on(rail,'pointerup',event=>{if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;gesture=null;if(Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy)*1.2)present(selected+(dx<0?1:-1));},{passive:true});
    PlazaRuntime.on(rail,'pointercancel',()=>{gesture=null;},{passive:true});
    PlazaRuntime.on(rail,'pointermove',event=>{
      if(gesture||event.pointerType==='touch'||event.buttons||(!fine.matches&&event.pointerType!=='mouse'))return;
      if(event.pointerType==='mouse'){foodPointer='mouse';syncFoodMode();}
      const box=rail.getBoundingClientRect(),index=Math.max(0,Math.min(slides.length-1,Math.floor((event.clientX-box.left)/box.width*slides.length)));
      if(index===requested)return;requested=index;clearTimeout(pointerTimer);
      if(index!==selected)pointerTimer=setTimeout(()=>present(index),desktopInk()?Math.max(100,500-(performance.now()-lastFoodChange)):70);
    },{passive:true});
    PlazaRuntime.on(rail,'pointerleave',()=>{clearTimeout(pointerTimer);requested=selected;});
    PlazaRuntime.on(rail,'dragstart',event=>event.preventDefault());
    new IntersectionObserver((entries,observer)=>{if(entries.some(entry=>entry.isIntersecting)){food.querySelectorAll('img').forEach(img=>img.loading='eager');observer.disconnect();}},{rootMargin:'400px'}).observe(food);
    new ResizeObserver(()=>{const photo=rail.querySelector('.ny-food-picture');if(photo)food.style.setProperty('--ny-food-photo-height',photo.getBoundingClientRect().height+'px');rail.scrollTo({left:selected*rail.clientWidth,behavior:'instant'});}).observe(rail);
  }

  // Compact phone timetables keep one semantic time range; print is separate.
  root.querySelectorAll('.ny-timeline time').forEach(time=>{
    const range=time.textContent.trim().match(/^(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})$/);
    if(!range)return;
    time.classList.add('ny-time-range');time.setAttribute('aria-label',`с ${range[1]} до ${range[2]}`);
    time.replaceChildren(...[range[1],'–',range[2]].map((value,index)=>{
      const span=document.createElement('span');span.className=index===1?'ny-time-range__dash':'ny-time-range__value';span.textContent=value;span.setAttribute('aria-hidden','true');return span;
    }));
  });

  // The shared room viewer owns showModal, gestures, zoom, focus and closing.
  // Keep native modified-link behavior and the SVG fallback when it is unavailable.
  /* The seating document is a single technical drawing, never a photo carousel. */
  const planDialog = root.querySelector('.ny-seating-viewer');
  const planCanvas = planDialog.querySelector('.ny-seating-canvas');
  const planImage = planCanvas.querySelector('img');
  let planScale=1, planX=0, planY=0, planOpener=null;
  const planPointers=new Map();
  let planGesture=null;
  const paintPlan=()=>{
    planImage.style.transform=`translate(${planX}px,${planY}px) scale(${planScale})`;
    planDialog.querySelector('[data-plan-scale]').textContent=Math.round(planScale*100)+'%';
  };
  const zoomPlan=next=>{planScale=Math.max(1,Math.min(6,next));if(planScale===1)planX=planY=0;paintPlan();};
  root.querySelectorAll('a[data-ny-plan]').forEach(link=>{
    PlazaRuntime.on(link,'click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();planOpener=link;
      const venue=link.dataset.nyPlan==='panorama'?'Ресторан «Панорама»':'Лобби-бар';
      planDialog.querySelector('#ny-plan-title').textContent=venue+' · рассадка';
      planImage.src=link.href;planImage.alt='Схема рассадки: '+venue;
      planScale=1;planX=planY=0;paintPlan();planDialog.showModal();
      planDialog.querySelector('#ny-plan-title').focus({preventScroll:true});
    });
  });
  PlazaRuntime.on(planDialog.querySelector('[data-plan-close]'),'click',()=>planDialog.close());
  PlazaRuntime.on(planDialog,'close',()=>{planPointers.clear();planGesture=null;planOpener?.focus({preventScroll:true});});
  planDialog.querySelectorAll('[data-plan-zoom]').forEach(button=>PlazaRuntime.on(button,'click',()=>zoomPlan(button.dataset.planZoom==='reset'?1:planScale*(button.dataset.planZoom==='in'?1.35:1/1.35))));
  const gestureStart=()=>{
    const points=[...planPointers.values()];
    planGesture=points.length===2?{distance:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),scale:planScale}:points.length===1?{x:points[0].x,y:points[0].y,panX:planX,panY:planY}:null;
  };
  PlazaRuntime.on(planCanvas,'pointerdown',event=>{planCanvas.setPointerCapture(event.pointerId);planPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});gestureStart();});
  PlazaRuntime.on(planCanvas,'pointermove',event=>{
    if(!planPointers.has(event.pointerId))return;
    planPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const p=[...planPointers.values()];
    if(p.length===2&&planGesture?.distance){zoomPlan(planGesture.scale*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/Math.max(1,planGesture.distance));}
    else if(p.length===1&&planGesture&&planScale>1){const bounds=planCanvas.getBoundingClientRect();planX=Math.max(-bounds.width*(planScale-1)/2,Math.min(bounds.width*(planScale-1)/2,planGesture.panX+p[0].x-planGesture.x));planY=Math.max(-bounds.height*(planScale-1)/2,Math.min(bounds.height*(planScale-1)/2,planGesture.panY+p[0].y-planGesture.y));paintPlan();}
  });
  ['pointerup','pointercancel'].forEach(type=>PlazaRuntime.on(planCanvas,type,event=>{planPointers.delete(event.pointerId);gestureStart();}));
  PlazaRuntime.on(planCanvas,'dblclick',()=>zoomPlan(planScale>1?1:2));
  PlazaRuntime.on(planCanvas,'keydown',event=>{if(['+','=','-','0'].includes(event.key)){event.preventDefault();zoomPlan(event.key==='0'?1:planScale*(event.key==='-'?1/1.35:1.35));}});
  // These two compositions own only their artwork parallax; shared UI owns reveal.
  if ('IntersectionObserver' in window) {
    const artworkObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === headliner) headlinerVisible = entry.isIntersecting;
        if (entry.target === finale) finaleVisible = entry.isIntersecting;
      });
      if (headliner) headliner.classList.toggle('is-in-view', headlinerVisible && !document.hidden && !reduce.matches);
      scheduleEffects();
    }, { rootMargin: '60px 0px' });
    if (hero) artworkObserver.observe(hero);
    if (headliner) artworkObserver.observe(headliner);
    if (finale) artworkObserver.observe(finale);
  } else {
    heroVisible = !!hero;
    headlinerVisible = !!headliner;
    finaleVisible = !!finale;
    scheduleEffects();
  }

  function scrollProgress(rect) {
    const viewportHalf = window.innerHeight * .5;
    const progress = (viewportHalf - rect.top - rect.height * .5) / Math.max(1, viewportHalf + rect.height * .5);
    return Math.max(-1, Math.min(1, progress));
  }
  function updateEffects() {
    effectsFrame = 0;
    if (reduce.matches || document.hidden) return;
    const mobile = window.innerWidth <= 700;
    if(mobile||!fine.matches)scenePointer.x=scenePointer.y=0;
    if (hero && heroHeading && heroVisible) {
      const rect=hero.getBoundingClientRect();
      // Only the text and countdown move; the opening photograph stays fixed.
      // Anchor motion to this section; the header or other content may change height.
      const travel=Math.max(0,Math.min(rect.height,-rect.top));
      const strength=(touchDevice()||window.innerWidth<=1100)?2:1;
      root.style.setProperty('--ny-hero-eyebrow-y',(-travel*.06*strength).toFixed(2)+'px');
      root.style.setProperty('--ny-hero-title-y',(-travel*.08*strength).toFixed(2)+'px');
      root.style.setProperty('--ny-countdown-y',(-travel*.10*strength).toFixed(2)+'px');
    }
    // Same centre-out inset and cubic easing as the photo journal entrance.
    // Reuse this page's existing scroll frame, no second motion loop.
    if(finale&&finaleVisible){
      const rect=finale.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(window.innerHeight-rect.top)/Math.max(1,rect.height)));
      const eased=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;
      root.style.setProperty('--ny-finale-inset',(100*(1-eased)).toFixed(3)+'%');
    }
    if (headliner && headlinerVisible) {
      const progress = scrollProgress(headliner.getBoundingClientRect());
      const touchLayout=touchDevice()||window.innerWidth<=1100;
      root.style.setProperty('--ny-touch-portrait-y',(progress*(touchLayout?-60:0)).toFixed(2)+'px');
      if (stage) root.style.setProperty('--ny-stage-y', (progress * (touchLayout ? 70 : 36)).toFixed(2) + 'px');
      if (headlineCopy) root.style.setProperty('--ny-copy-y', (progress * (mobile ? -26 : -88)).toFixed(2) + 'px');
      root.style.setProperty('--ny-name-y',(progress*(mobile?-32:-112)).toFixed(2)+'px');
      root.style.setProperty('--ny-schedule-y',(progress*(mobile?-20:-76)).toFixed(2)+'px');
      root.style.setProperty('--ny-bokeh-near-y',(progress*(mobile?8:22)).toFixed(2)+'px');
      root.style.setProperty('--ny-bokeh-far-y',(progress*(mobile?12:32)).toFixed(2)+'px');
      root.style.setProperty('--ny-light-sparks-y',(progress*(mobile?10:28)).toFixed(2)+'px');
      root.style.setProperty('--ny-pointer-x',scenePointer.x.toFixed(3));
      root.style.setProperty('--ny-pointer-y',scenePointer.y.toFixed(3));
    }
  }
  function scheduleEffects() {
    if (!effectsFrame && !reduce.matches && !document.hidden && (heroVisible || headlinerVisible || finaleVisible)) effectsFrame = PlazaMotion.frame(updateEffects);
  }

  if(headliner){
    PlazaRuntime.on(headliner,'pointermove',event=>{
      if(reduce.matches||!fine.matches||window.innerWidth<=700||event.pointerType==='touch'||event.buttons)return;
      const rect=headliner.getBoundingClientRect();
      scenePointer.x=pointerAxis((event.clientX-rect.left)/rect.width*2-1);
      scenePointer.y=pointerAxis((event.clientY-rect.top)/rect.height*2-1);
      scheduleEffects();
    },{passive:true});
    PlazaRuntime.on(headliner,'pointerleave',()=>{scenePointer.x=scenePointer.y=0;scheduleEffects();},{passive:true});
  }
  PlazaRuntime.on(window,'scroll',scheduleEffects,{ passive: true });
  PlazaRuntime.on(window,'resize',scheduleEffects,{ passive: true });

  // Gold cursor traces and click sparks, inspired by the old holiday page.
  // One viewport-sized canvas stays clipped inside this page, with no idle loop.
  const canvas = root.querySelector('.ny-festive-canvas');
  const context = canvas && canvas.getContext('2d', { alpha: true });
  const sparks = [];
  let sparkFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let canvasOffset = 0;
  let lastTrace = 0;
  let lastTick = 0;
  let dpr = 1;

  function sparksAllowed() { return !!context && fine.matches && !reduce.matches && !document.hidden; }
  function clearSparks() {
    if (sparkFrame) PlazaMotion.cancelFrame(sparkFrame);
    sparkFrame = 0;
    sparks.length = 0;
    if (context) context.clearRect(0, 0, canvasWidth, canvasHeight);
  }
  function placeCanvas() {
    if (!context) return;
    const rect = root.getBoundingClientRect();
    canvasOffset = Math.max(0, Math.min(-rect.top, root.offsetHeight - canvasHeight));
    canvas.style.transform = 'translate3d(0,' + canvasOffset.toFixed(0) + 'px,0)';
  }
  function sizeCanvas() {
    if (!context) return;
    if (!sparksAllowed()) {
      clearSparks();
      canvas.width = canvas.height = 0;
      canvasWidth = canvasHeight = 0;
      canvas.style.display = 'none';
      return;
    }
    const rect = root.getBoundingClientRect();
    canvasWidth = Math.round(rect.width);
    canvasHeight = Math.min(window.innerHeight, root.offsetHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.display = sparksAllowed() ? 'block' : 'none';
    placeCanvas();
  }
  function addSparks(event, burst) {
    if (!sparksAllowed()) return;
    const now = performance.now();
    if (!burst && now - lastTrace < 18) return;
    lastTrace = now;
    placeCanvas();
    const rect = canvas.getBoundingClientRect();
    const count = burst ? 10 : 3;
    for (let i = 0; i < count; i++) {
      // Exact trail parameters from legacy page 34948, #plaza-gold-sparks.
      const life = 450 + Math.random() * 450;
      sparks.push({ x: event.clientX - rect.left + (Math.random()-.5)*8,
        y: event.clientY - rect.top + (Math.random()-.5)*8,
        vx: (Math.random()-.5)*65, vy: 10+Math.random()*45,
        life, age: 0, size: 1.5+Math.random()*2.6,
        spin: (Math.random()-.5)*3, color: ['#b88b32','#d4af37','#ead59b'][i%3] });
    }
    if (sparks.length > 120) sparks.splice(0, sparks.length - 120);
    if (!sparkFrame) { lastTick = now; sparkFrame = PlazaMotion.frame(drawSparks); }
  }
  function drawSparks(now) {
    sparkFrame = 0;
    if (!sparksAllowed()) { clearSparks(); return; }
    const delta = Math.min(now - lastTick, 40);
    lastTick = now;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      spark.age += delta;
      if (spark.age >= spark.life) { sparks.splice(i, 1); continue; }
      spark.x += spark.vx * delta / 1000;
      spark.y += spark.vy * delta / 1000;
      spark.vy += 42 * delta / 1000;
      const alpha = Math.max(0,1-spark.age/spark.life);
      context.save();
      context.translate(spark.x,spark.y);
      context.rotate(spark.spin*(1-alpha));
      context.globalAlpha=alpha;context.fillStyle=spark.color;
      context.shadowColor='#d4af37';context.shadowBlur=5;
      const r=spark.size;
      context.beginPath();context.moveTo(0,-r);
      context.lineTo(r*.28,-r*.28);context.lineTo(r,0);context.lineTo(r*.28,r*.28);
      context.lineTo(0,r);context.lineTo(-r*.28,r*.28);context.lineTo(-r,0);
      context.lineTo(-r*.28,-r*.28);context.closePath();context.fill();
      context.restore();
    }
    if (sparks.length) sparkFrame = PlazaMotion.frame(drawSparks);
  }
  if (context) {
    PlazaRuntime.on(root,'pointermove',event => addSparks(event, false),{ passive: true });
    PlazaRuntime.on(root,'pointerdown',event => { if (event.button === 0) addSparks(event, true); },{ passive: true });
    PlazaRuntime.on(root,'pointerleave',clearSparks,{ passive: true });
    PlazaRuntime.on(window,'resize',sizeCanvas,{ passive: true });
    PlazaRuntime.on(window,'scroll',() => { clearSparks(); placeCanvas(); },{ passive: true });
    sizeCanvas();
  }
  function motionChanged() {
    clearSparks();
    sizeCanvas();
    if (effectsFrame && (document.hidden || reduce.matches)) {
      PlazaMotion.cancelFrame(effectsFrame);
      effectsFrame = 0;
    }
    if (reduce.matches||!fine.matches||window.innerWidth<=700) {
      scenePointer.x=scenePointer.y=0;
      ['--ny-pointer-x','--ny-pointer-y'].forEach(property=>root.style.setProperty(property,'0'));
    }
    if (reduce.matches) {
      ['--ny-hero-eyebrow-y','--ny-hero-title-y','--ny-countdown-y','--ny-stage-y','--ny-copy-y','--ny-name-y','--ny-schedule-y','--ny-bokeh-near-y','--ny-bokeh-far-y','--ny-light-sparks-y'].forEach(property => root.style.setProperty(property, '0px'));
    }
    if (headliner) headliner.classList.toggle('is-in-view', headlinerVisible && !document.hidden && !reduce.matches);
    scheduleEffects();
  }
  PlazaRuntime.on(document,'visibilitychange',motionChanged);
  PlazaRuntime.on(window,'blur',clearSparks);
  if (reduce.addEventListener) PlazaRuntime.on(reduce,'change',motionChanged);
  if (fine.addEventListener) PlazaRuntime.on(fine,'change',motionChanged);

  PlazaRuntime.on(window,'beforeprint',clearSparks);
  PlazaRuntime.on(window,'afterprint',motionChanged);
})();

/* PSK New Year — persistent soft brushes for the family picture and aligned venue pairs. */
(() => {
  'use strict';

  function start() {
    const hosts = document.querySelectorAll('.psk-ny .ny-family__photo, .psk-ny .ny-venue__magic');
    if (!hosts.length || !window.matchMedia) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const instances = [];
    const targets = new WeakMap();
    const allowed = () => finePointer.matches && !reducedMotion.matches && !navigator.maxTouchPoints && !matchMedia('(any-pointer: coarse)').matches && !document.querySelector('.psk-ny.ny-touch');
    const sizeObserver = window.ResizeObserver ? new ResizeObserver(entries => {
      entries.forEach(entry => targets.get(entry.target)?.refresh());
    }) : null;

    hosts.forEach(picture => {
      const venue = picture.classList.contains('ny-venue__magic');
      const image = venue ? picture.querySelector('.ny-venue__magic-day img') : picture.querySelector('img');
      const original = venue ? picture.querySelector('.ny-venue__magic-night img') : image;
      if (!image || !original || picture.querySelector('.ny-paint-canvas')) return;

      const canvas = document.createElement('canvas');
      const mask = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const maskContext = mask.getContext('2d');
      if (!context || !maskContext) return;

      canvas.className = 'ny-paint-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      picture.appendChild(canvas);

      let width = 0;
      let height = 0;
      let dpr = 1;
      let active = false;
      let previous = null;
      let frame = 0;
      let pending = [];

      function stopFrame() {
        if (frame) PlazaMotion.cancelFrame(frame);
        frame = 0;
        pending = [];
        previous = null;
      }

      function offset(value, available) {
        if (value === 'left' || value === 'top') return 0;
        if (value === 'right' || value === 'bottom') return available;
        if (value === 'center') return available * .5;
        if (value && value.endsWith('%')) return available * parseFloat(value) / 100;
        return value && Number.isFinite(parseFloat(value)) ? parseFloat(value) : available * .5;
      }

      function render() {
        if (!active || !original.complete || !original.naturalWidth || !width || !height) return;
        try {
          const style = getComputedStyle(image);
          const sourceWidth = original.naturalWidth;
          const sourceHeight = original.naturalHeight;
          let drawWidth = width;
          let drawHeight = height;
          if (style.objectFit !== 'fill') {
            let scale = style.objectFit === 'contain' || style.objectFit === 'scale-down'
              ? Math.min(width / sourceWidth, height / sourceHeight)
              : Math.max(width / sourceWidth, height / sourceHeight);
            if (style.objectFit === 'none') scale = 1;
            if (style.objectFit === 'scale-down') scale = Math.min(1, scale);
            drawWidth = sourceWidth * scale;
            drawHeight = sourceHeight * scale;
          }
          const position = style.objectPosition.trim().split(/\s+/);
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          context.globalCompositeOperation = 'source-over';
          context.clearRect(0, 0, width, height);
          // The untouched source stays in the DOM; only its visual mask changes.
          context.drawImage(original, offset(position[0], width - drawWidth), offset(position[1], height - drawHeight), drawWidth, drawHeight);
          context.globalCompositeOperation = 'destination-in';
          context.drawImage(mask, 0, 0, width, height);
          context.globalCompositeOperation = 'source-over';
        } catch (_) {
          // An unavailable image/context falls back to the original full-colour photograph.
          active = false;
          picture.classList.remove('ny-paint-ready');
          stopFrame();
        }
      }

      function resize() {
        // A hidden lazy alternative may otherwise stay unloaded. Start it when the base has loaded.
        if (venue && allowed() && image.complete && image.naturalWidth && !original.naturalWidth) original.loading = 'eager';
        if (!allowed() || !image.complete || !image.naturalWidth || !original.complete || !original.naturalWidth) {
          active = false;
          picture.classList.remove('ny-paint-ready');
          stopFrame();
          return;
        }
        const rect = image.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
        const nextWidth = rect.width;
        const nextHeight = rect.height;
        const pixelsWidth = Math.max(1, Math.round(nextWidth * nextDpr));
        const pixelsHeight = Math.max(1, Math.round(nextHeight * nextDpr));
        if (canvas.width !== pixelsWidth || canvas.height !== pixelsHeight || dpr !== nextDpr) {
          // Preserve the painted area at the same relative coordinates through a responsive resize.
          const snapshot = document.createElement('canvas');
          snapshot.width = mask.width;
          snapshot.height = mask.height;
          const snapshotContext = snapshot.getContext('2d');
          if (snapshotContext && mask.width && mask.height) snapshotContext.drawImage(mask, 0, 0);
          canvas.width = mask.width = pixelsWidth;
          canvas.height = mask.height = pixelsHeight;
          if (snapshotContext && snapshot.width && snapshot.height) {
            maskContext.drawImage(snapshot, 0, 0, pixelsWidth, pixelsHeight);
          }
          snapshot.width = snapshot.height = 0;
          previous = null;
        }
        width = nextWidth;
        height = nextHeight;
        dpr = nextDpr;
        maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        active = true;
        render();
        if (active) picture.classList.add('ny-paint-ready');
      }

      function reset() {
        stopFrame();
        maskContext.setTransform(1, 0, 0, 1, 0, 0);
        maskContext.clearRect(0, 0, mask.width, mask.height);
        maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        resize();
      }

      function dab(x, y, radius) {
        const gradient = maskContext.createRadialGradient(x, y, radius * .55, x, y, radius);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        maskContext.fillStyle = gradient;
        maskContext.beginPath();
        maskContext.arc(x, y, radius, 0, Math.PI * 2);
        maskContext.fill();
      }

      function flush() {
        frame = 0;
        if (!active) return;
        const points = pending;
        pending = [];
        const radius = Math.max(35, Math.min(75, width * .075));
        points.forEach(point => {
          const from = previous || point;
          const count = Math.max(1, Math.ceil(Math.hypot(point.x - from.x, point.y - from.y) / (radius * .25)));
          for (let index = 1; index <= count; index += 1) {
            const progress = index / count;
            dab(from.x + (point.x - from.x) * progress, from.y + (point.y - from.y) * progress, radius);
          }
          previous = point;
        });
        render();
      }

      function move(event) {
        if (!active || !allowed() || event.pointerType !== 'mouse') return;
        const rect = image.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
          previous = null;
          return;
        }
        pending.push({ x, y });
        if (pending.length > 32) pending.splice(0, pending.length - 32);
        if (!frame) frame = PlazaMotion.frame(flush);
      }

      function leave() {
        if (frame) {
          PlazaMotion.cancelFrame(frame);
          frame = 0;
          flush();
        }
        previous = null;
      }

      function unavailable() {
        active = false;
        picture.classList.remove('ny-paint-ready');
        stopFrame();
      }

      const images = [...new Set([image, original])];
      images.forEach(source => {
        PlazaRuntime.on(source,'load',resize);
        PlazaRuntime.on(source,'error',unavailable);
      });
      PlazaRuntime.on(picture,'pointerenter',move,{ passive: true });
      PlazaRuntime.on(picture,'pointermove',move,{ passive: true });
      PlazaRuntime.on(picture,'pointerleave',leave,{ passive: true });
      PlazaRuntime.on(picture,'pointercancel',leave,{ passive: true });
      const instance = {
        refresh: resize,
        reset,
        destroy() {
          stopFrame();
          if (sizeObserver) sizeObserver.unobserve(image);
          images.forEach(source => {
            PlazaRuntime.off(source,'load',resize);
            PlazaRuntime.off(source,'error',unavailable);
          });
          PlazaRuntime.off(picture,'pointerenter',move);
          PlazaRuntime.off(picture,'pointermove',move);
          PlazaRuntime.off(picture,'pointerleave',leave);
          PlazaRuntime.off(picture,'pointercancel',leave);
          picture.classList.remove('ny-paint-ready');
          canvas.remove();
          canvas.width = canvas.height = mask.width = mask.height = 0;
        }
      };
      instances.push(instance);
      targets.set(image, instance);
      if (sizeObserver) sizeObserver.observe(image);
      resize();
    });

    if (!instances.length) {
      if (sizeObserver) sizeObserver.disconnect();
      return;
    }
    const refresh = () => instances.forEach(instance => instance.refresh());
    const watch = (query, callback, remove = false) => {
      if (query.addEventListener) query[remove ? 'removeEventListener' : 'addEventListener']('change', callback);
      else query[remove ? 'removeListener' : 'addListener'](callback);
    };
    watch(finePointer, refresh);
    watch(reducedMotion, refresh);
    PlazaRuntime.on(window,'resize',refresh,{ passive: true });

    let theme = document.documentElement.getAttribute('data-theme');
    const themeObserver = window.MutationObserver ? new MutationObserver(() => {
      const next = document.documentElement.getAttribute('data-theme');
      if (next === theme) return;
      theme = next;
      // A new theme is a new painting surface, including the girl's 60% base.
      instances.forEach(instance => instance.reset());
    }) : null;
    if (themeObserver) themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function dispose(event) {
      if (event.persisted) return;
      watch(finePointer, refresh, true);
      watch(reducedMotion, refresh, true);
      PlazaRuntime.off(window,'resize',refresh);
      PlazaRuntime.off(window,'pagehide',dispose);
      if (themeObserver) themeObserver.disconnect();
      instances.forEach(instance => instance.destroy());
      if (sizeObserver) sizeObserver.disconnect();
    }
    PlazaRuntime.on(window,'pagehide',dispose);
  }

  if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',start,{ once: true });
  else start();
})();

