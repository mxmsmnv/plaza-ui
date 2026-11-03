/* One tooltip controller for the network and both property profiles. */

(()=>{'use strict';

 if(window.plazaTooltipsMounted)return;

 window.plazaTooltipsMounted=true;

 const headerSelector='.site-header[data-plaza-header="stable"] :is(a.brand,.pn-toggle,.pn-header-sun,.header-call,.pn-burger,.header-price)';

 const selector='a[title],button[title],[data-plaza-tooltip],'+headerSelector;

 const excluded='#wpadminbar,#wp-toolbar';

 const tip=document.createElement('div');

 tip.className='plaza-tooltip plaza-glass-surface';

 tip.id='plaza-shared-tooltip';tip.setAttribute('role','tooltip');

 let popover=typeof tip.showPopover==='function';

 if(popover)tip.setAttribute('popover','manual');

 tip.dataset.open='false';document.body.append(tip);

 let owner=null,showTimer=0,hideTimer=0,hovered=null,tipHovered=false,dismissed=null,touchInput=false;

 const ownedNames=new WeakMap();

 const eligible=el=>el instanceof Element&&el.matches(selector)&&!el.closest(excluded);

 const focused=()=>owner&&owner.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');

 function undescribe(el){

  const ids=(el.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==tip.id);

  if(ids.length)el.setAttribute('aria-describedby',ids.join(' '));else el.removeAttribute('aria-describedby');

 }

 function hide(dismiss=false){

  clearTimeout(showTimer);clearTimeout(hideTimer);showTimer=hideTimer=0;

  if(dismiss&&owner)dismissed=owner;

  if(owner)undescribe(owner);

  owner=null;tipHovered=false;tip.dataset.open='false';

  if(popover){try{if(tip.matches(':popover-open'))tip.hidePopover();}catch(_){}}

 }

 function laterHide(){

  clearTimeout(hideTimer);

  hideTimer=setTimeout(()=>{if(owner&&!focused()&&hovered!==owner&&!tipHovered)hide();},150);

 }

 function preserveName(el,text){

  const previous=ownedNames.get(el),current=el.getAttribute('aria-label');

  if(previous&&current!==previous){ownedNames.delete(el);return;}

  if(el.hasAttribute('aria-labelledby')||(current&&!previous))return;

  const clone=el.cloneNode(true);

  clone.querySelectorAll('svg,[aria-hidden="true"],script,style').forEach(node=>node.remove());

  if(!clone.textContent.trim()&&!clone.querySelector('img[alt]:not([alt=""])')){

   el.setAttribute('aria-label',text);ownedNames.set(el,text);

  }

 }

 function headerLabel(el){

  if(!el.matches(headerSelector))return null;

  const expanded=el.getAttribute('aria-expanded')==='true';

  if(el.matches('.pn-header-sun'))return el.getAttribute('aria-label');

  if(el.matches('.header-call'))return 'Поможем выбрать путёвку';

  if(el.matches('.pn-burger'))return expanded?'Закрыть меню':'Открыть меню';

  if(el.matches('.pn-toggle'))return expanded?'Закрыть выбор санатория':'Выбрать санаторий';

  if(el.matches('.header-price'))return 'Выбрать даты';

  if(el.matches('a.brand'))return 'Главная страница';

  return null;

 }

 function prepare(el){

  if(!eligible(el))return;

  const headerText=headerLabel(el);

  if(headerText&&el.dataset.plazaTooltip!==headerText)el.dataset.plazaTooltip=headerText;

  if(owner===el&&headerText&&tip.dataset.open==='true'&&tip.textContent!==headerText){tip.textContent=headerText;position(el);}

  const title=el.getAttribute('title');

  if(title!==null){

   const text=title.trim();

   if(text){preserveName(el,text);el.dataset.plazaTooltip=text;}

   else delete el.dataset.plazaTooltip;

   el.removeAttribute('title');

   if(owner===el){

    if(!text)hide();

    else if(tip.dataset.open==='true'){tip.textContent=text;position(el);}

   }

  }

 }

 function scan(root){

  if(root instanceof Element)prepare(root);

  root.querySelectorAll?.(selector).forEach(prepare);

 }

 function labelOf(el){return el.querySelector('.plaza-link-label,.pn-quick-label,span:not([aria-hidden="true"])')||el;}

 function textRect(el){

  const label=labelOf(el);

  const walker=document.createTreeWalker(label,NodeFilter.SHOW_TEXT),rects=[];

  let node;

  while((node=walker.nextNode())){

   if(!node.nodeValue.trim()||node.parentElement.closest('svg,[aria-hidden="true"],script,style'))continue;

   const range=document.createRange();range.selectNodeContents(node);

   for(const rect of range.getClientRects())if(rect.width>0&&rect.height>0)rects.push(rect);

  }

  if(!rects.length)return el.getBoundingClientRect();

  const left=Math.min(...rects.map(r=>r.left)),right=Math.max(...rects.map(r=>r.right));

  return{left,right,width:right-left,top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom))};

 }

 function position(el){

  const r=textRect(el),anchor=el.getBoundingClientRect();tip.style.left='0px';tip.style.top='0px';

  const w=tip.offsetWidth,h=tip.offsetHeight,below=anchor.bottom+8,viewportWidth=document.documentElement.clientWidth||innerWidth;

  tip.style.left=Math.max(12,Math.min(viewportWidth-w-12,r.left+r.width/2-w/2))+'px';

  tip.style.top=(below+h<=innerHeight-12?below:Math.max(12,anchor.top-h-8))+'px';

 }

 function show(el){

  prepare(el);

  if(dismissed===el||el.disabled||el.getAttribute('aria-disabled')==='true'||!el.dataset.plazaTooltip)return;

  if(owner===el){clearTimeout(hideTimer);return;}

  hide();owner=el;

  showTimer=setTimeout(()=>{

   if(owner!==el)return;

   if(!el.isConnected||el.disabled||el.getAttribute('aria-disabled')==='true'||(hovered!==el&&!focused())){hide();return;}

   const text=el.dataset.plazaTooltip;if(!text){hide();return;}

   tip.textContent=text;

   const source=getComputedStyle(labelOf(el));

   const size=Math.max(10,Math.min(12,(parseFloat(source.fontSize)||12)-1));

   const weight=Math.max(300,Math.min(400,(parseFloat(source.fontWeight)||400)-100));

   tip.style.setProperty('--plaza-tooltip-font-size',size+'px');

   tip.style.setProperty('--plaza-tooltip-weight',String(weight));

   (el.closest('dialog[open]')||document.body).append(tip);

   if(popover){try{tip.showPopover();}catch(_){tip.removeAttribute('popover');popover=false;}}

   position(el);

   const ids=new Set((el.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));

   ids.add(tip.id);el.setAttribute('aria-describedby',[...ids].join(' '));

   tip.dataset.open='true';

  },300);

 }

 const target=e=>{

  const el=e.target instanceof Element?e.target.closest(selector):null;

  return eligible(el)?el:null;

 };

 scan(document.body);

 new MutationObserver(records=>{

  for(const record of records){

   if(record.type==='attributes')prepare(record.target);

   else for(const node of record.addedNodes)if(node instanceof Element&&node!==tip)scan(node);

  }

  if(owner&&!owner.isConnected)hide();

 }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['title','aria-label','aria-expanded','href']});

 PlazaRuntime.on(document,'pointermove',e=>{

  if(e.pointerType==='touch')return;

  touchInput=false;

  const el=target(e);if(!el)return;

  hovered=el;show(el);

 });

 PlazaRuntime.on(document,'pointerout',e=>{

  if(e.pointerType==='touch')return;

  if(dismissed&&dismissed.contains(e.target)&&!dismissed.contains(e.relatedTarget))dismissed=null;

  if(hovered&&hovered.contains(e.target)&&!hovered.contains(e.relatedTarget)){hovered=null;laterHide();}

 });

 PlazaRuntime.on(tip,'pointerenter',e=>{if(e.pointerType==='touch')return;tipHovered=true;clearTimeout(hideTimer);});

 PlazaRuntime.on(tip,'pointerleave',e=>{if(e.pointerType==='touch')return;tipHovered=false;laterHide();});

 PlazaRuntime.on(document,'pointerdown',e=>{touchInput=e.pointerType==='touch';if(touchInput)hide(true);});

 PlazaRuntime.on(document,'focusin',e=>{if(touchInput)return;const el=target(e);if(el)show(el);});

 PlazaRuntime.on(document,'focusout',e=>{

  if(dismissed&&dismissed.contains(e.target)&&!dismissed.contains(e.relatedTarget))dismissed=null;

  if(owner&&owner.contains(e.target)&&!owner.contains(e.relatedTarget))laterHide();

 });

 PlazaRuntime.on(document,'keydown',e=>{touchInput=false;if(e.key==='Escape')hide(true);});

 PlazaRuntime.on(document,'click',()=>hide(true));

 function viewChanged(){

  const pending=owner&&focused()?owner:null;

  hide();if(pending)show(pending);

 }

 PlazaRuntime.on(document,'scroll',viewChanged,true);

 PlazaRuntime.on(document,'close',()=>hide(),true);

 PlazaRuntime.on(document,'cancel',()=>hide(),true);

 PlazaRuntime.on(window,'resize',viewChanged);

})();
