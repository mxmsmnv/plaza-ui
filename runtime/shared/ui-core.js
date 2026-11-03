/* PLAZA UI: one controls factory and one animation engine for all components. */
(()=>{'use strict';
 if(window.PlazaUI?.version==='20261017-shared-2')return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:700px)'),motions=new WeakMap();
 const sliderSettings={desktopWheel:false,wheelMedia:'(min-width:701px) and (hover:hover) and (pointer:fine)',wheelPause:700,edgeTolerance:4,centerOnWheel:false,centerTolerance:20,centerPause:550,controlsGap:8};
 const wheelDesktop=matchMedia(sliderSettings.wheelMedia);
 const duration=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--plaza-accordion-duration'))*1000||1000;
 const animate=(element,keyframes,finish)=>{
  const old=motions.get(element);if(old){old.onfinish=null;old.cancel();}
  if(reduced.matches){finish();return;}
  const animation=PlazaMotion.animate(element,keyframes,{duration:duration(),easing:getComputedStyle(document.documentElement).getPropertyValue('--plaza-accordion-easing').trim()||'cubic-bezier(.22,.61,.36,1)'});motions.set(element,animation);
  animation.onfinish=()=>{motions.delete(element);finish();};
 };
 const height=(element,open)=>{
  const start=element.getBoundingClientRect().height;const old=motions.get(element);if(old){old.onfinish=null;old.cancel();}
  element.hidden=false;element.style.height='auto';const full=element.scrollHeight;element.style.height=start+'px';element.style.overflow='hidden';
  element.inert=!open;animate(element,{height:[start+'px',(open?full:0)+'px']},()=>{element.style.height='';element.style.overflow='';element.hidden=!open;});
 };
 const controls=(labels,select,step,options={})=>{
  const element=document.createElement('div');element.className='rail-controls plaza-slider-controls';
  const dots=document.createElement('div');dots.className='rail-dots';dots.setAttribute('aria-label','Выбор карточки');
  const arrows=document.createElement('div');arrows.className='rail-arrows';
  const button=(direction,label)=>{const b=document.createElement('button');b.type='button';b.className='icon-button rail-'+direction;b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(direction==='prev'?'m15 18-6-6 6-6':'m9 18 6-6-6-6')+'"/></svg>';b.setAttribute('aria-label',label);PlazaRuntime.on(b,'click',()=>step(direction==='prev'?-1:1));return b;};
  const prev=button('prev',options.previous||'Предыдущая карточка'),next=button('next',options.next||'Следующая карточка');
  labels.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Показать: '+label);PlazaRuntime.on(b,'click',()=>select(i));dots.append(b);});
  arrows.append(prev,next);element.append(dots,arrows);
  return {element,update(index,atStart,atEnd,visible=true){element.hidden=!visible;[...dots.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));prev.disabled=atStart;next.disabled=atEnd;}};
 };
 const dragRails=new WeakSet();
 const swipeDrag=(rail,onStart=()=>{})=>{
  if(!rail||dragRails.has(rail))return;dragRails.add(rail);
  let drag=null;
  PlazaRuntime.on(rail,'pointerdown',e=>{onStart();if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,input,textarea,select,summary'))return;drag={id:e.pointerId,x:e.clientX,left:rail.scrollLeft,moved:false};});
  PlazaRuntime.on(rail,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)<6)return;if(!drag.moved){drag.moved=true;rail.setPointerCapture(e.pointerId);rail.classList.add('plaza-rail-dragging')}e.preventDefault();rail.scrollLeft=drag.left-dx;});
  const endDrag=()=>{if(!drag)return;const moved=drag.moved;drag=null;rail.classList.remove('plaza-rail-dragging');if(moved){rail.dataset.plazaDragged='true';setTimeout(()=>delete rail.dataset.plazaDragged,0)}};
  PlazaRuntime.on(rail,'pointerup',endDrag);PlazaRuntime.on(rail,'pointercancel',endDrag);PlazaRuntime.on(rail,'pointerleave',()=>{if(drag&&!drag.moved)drag=null});
  PlazaRuntime.on(rail,'click',e=>{if(rail.dataset.plazaDragged){e.preventDefault();e.stopPropagation()}},true);
  PlazaRuntime.on(rail,'dragstart',e=>e.preventDefault());
 };
 const swipe=(rail,cards,options={})=>{
  if(!rail||!cards.length||rail.dataset.plazaSliderReady)return;rail.dataset.plazaSliderReady='true';rail.tabIndex=0;
  rail.setAttribute('aria-label',options.label||'Карточки раздела');let current=0,requested=null;
  const points=()=>cards.map(c=>Math.min(c.offsetLeft-cards[0].offsetLeft,Math.max(0,rail.scrollWidth-rail.clientWidth)));
  const update=()=>{const ps=points();current=requested!==null&&Math.abs(ps[requested]-rail.scrollLeft)<2?requested:ps.reduce((best,p,i)=>Math.abs(p-rail.scrollLeft)<Math.abs(ps[best]-rail.scrollLeft)?i:best,0);ui.update(current,rail.scrollLeft<4,rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-4,rail.scrollWidth>rail.clientWidth+2&&(!options.mobileOnly||mobile.matches));};
  const move=index=>{const ps=points();requested=Math.max(0,Math.min(cards.length-1,index));rail.scrollTo({left:ps[requested],behavior:reduced.matches?'instant':'smooth'});update();};
  const step=direction=>{const ps=points(),left=rail.scrollLeft;let target=direction>0?ps.findIndex(p=>p>left+4):ps.findLastIndex(p=>p<left-4);if(target<0)target=direction>0?ps.length-1:0;move(target);};
  const ui=controls(cards.map(c=>c.querySelector('h3')?.textContent||c.querySelector('img')?.alt||'Карточка'),move,step,options);
  if(options.host)options.host.querySelectorAll('.rail-controls').forEach(e=>e.remove());rail.after(ui.element);
  PlazaRuntime.on(rail,'scroll',update,{passive:true});PlazaRuntime.on(rail,'keydown',e=>{if(e.target===rail&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(current+(e.key==='ArrowRight'?1:-1));}});
  /* Mouse wheel keeps native page scrolling; no carousel centering or wheel handler. */
  swipeDrag(rail,()=>{requested=null;});
  new ResizeObserver(update).observe(rail);PlazaRuntime.on(mobile,'change',update);update();return ui;
 };
 const detailsStates=new WeakMap(),mountedDetails=new WeakSet();let answerId=0;
 const detailParts=details=>Array.from(details.children).filter(e=>e.tagName!=='SUMMARY');
 const inertDetails=(details,inert)=>detailParts(details).forEach(e=>e.inert=inert);
 const changeDetails=(details,open)=>{
  const summary=details.querySelector(':scope>summary');if(!summary)return;
  if(!open&&detailParts(details).some(e=>e.contains(document.activeElement)))summary.focus({preventScroll:true});
  inertDetails(details,!open);
  const start=details.getBoundingClientRect().height,old=motions.get(details);if(old){old.onfinish=null;old.cancel();}
  detailsStates.set(details,open);summary.setAttribute('aria-expanded',String(open));details.style.height='';details.style.overflow='';details.open=true;
  const full=details.getBoundingClientRect().height,style=getComputedStyle(details);
  const collapsed=summary.getBoundingClientRect().height+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
  details.style.height=start+'px';details.style.overflow='hidden';
  animate(details,{height:[start+'px',(open?full:collapsed)+'px']},()=>{details.open=open;details.style.height='';details.style.overflow='';detailsStates.delete(details);});
 };
 const mountDetails=()=>document.querySelectorAll('details').forEach(d=>{if(d.hasAttribute('data-plaza-mobile-disclosure')||d.classList.contains('room-details')||mountedDetails.has(d))return;const s=d.querySelector(':scope>summary');if(!s)return;mountedDetails.add(d);s.setAttribute('aria-expanded',String(d.open));
  const ids=detailParts(d).map(e=>{if(!e.id){do{e.id='plaza-accordion-answer-'+(++answerId)}while(document.getElementById(e.id)!==e)}return e.id});if(ids.length)s.setAttribute('aria-controls',ids.join(' '));inertDetails(d,!d.open);
  PlazaRuntime.on(d,'keydown',e=>{if(e.key==='Escape'&&(detailsStates.has(d)?detailsStates.get(d):d.open)){e.preventDefault();e.stopPropagation();changeDetails(d,false);s.focus({preventScroll:true})}});
  PlazaRuntime.on(d,'toggle',()=>{if(!detailsStates.has(d)){s.setAttribute('aria-expanded',String(d.open));inertDetails(d,!d.open)}});
  PlazaRuntime.on(s,'click',e=>{if(d.classList.contains('room-details'))return;if(e.target.closest('a,button,input'))return;e.preventDefault();
   const open=!(detailsStates.has(d)?detailsStates.get(d):d.open),group=d.closest('.faq-list,.footer-nav,[data-accordion-group]');
   if(open&&group)group.querySelectorAll('details').forEach(other=>{if(other!==d&&other.closest('.faq-list,.footer-nav,[data-accordion-group]')===group&&(other.open||detailsStates.get(other)))changeDetails(other,false);});changeDetails(d,open);
  });
 });

 const normalizeText=(value,collapseWhitespace=false)=>{let text=String(value).toLocaleLowerCase('ru').replaceAll('ё','е');return (collapseWhitespace?text.replace(/\s+/g,' '):text).trim();};
 const createDataTable=(records,options)=>{
  const size=Math.max(1,Math.floor(options.pageSize||25));let page=0;
  const render=()=>{
   const matched=records.filter(options.match);page=Math.max(0,Math.min(page,Math.ceil(matched.length/size)-1));
   records.forEach(record=>{record.row.hidden=true;});const from=page*size,to=Math.min(from+size,matched.length);
   matched.slice(from,to).forEach(record=>{record.row.hidden=false;});
   options.previous.disabled=page===0;options.next.disabled=to>=matched.length;
   const state={page,from:matched.length?from+1:0,to,total:matched.length,pageSize:size};
   options.status.textContent=options.format(state);return state;
  };
  return {render,reset(){page=0;return render();},step(delta){page+=delta;return render();}};
 };

 const captionHosts=new WeakSet();
 const mountTableCaptions=()=>document.querySelectorAll('.comparison-scroll').forEach(host=>{
  if(captionHosts.has(host)||!host.querySelector('table caption'))return;captionHosts.add(host);
  const measure=()=>host.style.setProperty('--plaza-table-viewport-width',host.clientWidth+'px');
  new ResizeObserver(measure).observe(host);measure();
 });
 window.PlazaUI={version:'20261017-shared-2',sliderSettings,mountTableCaptions,createDataTable,normalizeText,createSliderControls:controls,mountSwipeRail:swipe,mountSwipeDrag:swipeDrag,animateHeight:height,animate,changeDetails,mountDetails};
})();
