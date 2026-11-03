/* Original New Year rails and food photo switching, without page canvas/audio. */
(()=>{'use strict';const root=document.querySelector('.psk-ny');if(!root)return;const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const touchMedia=window.matchMedia('(any-pointer: coarse)');
  const touchDevice=()=>navigator.maxTouchPoints>0||touchMedia.matches||root.classList.contains('ny-touch');
  const syncTouch=()=>root.classList.toggle('ny-touch',touchDevice());
  syncTouch();PlazaRuntime.on(touchMedia,'change',syncTouch);
  PlazaRuntime.on(root,'pointerdown',event=>{if(event.pointerType==='touch')root.classList.add('ny-touch');},{passive:true});

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
    const rail=food.querySelector('.ny-food-rail');if(!rail)return;const slides=Array.from(rail.children);
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

})();
