(()=>{'use strict'; const host=document.querySelector('.plaza-room-comparison');if(!host)return;
const rail=host.querySelector('.comparison-scroll'),table=rail.querySelector('table'),head=table.tHead;
let schedule=()=>{};
if(!document.body.classList.contains('plaza-object-kislovodsk')){
const floating=document.createElement('div');floating.className='comparison-sticky-head';floating.hidden=true;floating.setAttribute('aria-hidden','true');floating.inert=true;
const clone=document.createElement('table');clone.className='comparison-table';clone.append(head.cloneNode(true));floating.append(clone);document.body.append(floating);
// A decorative sticky copy must still allow the places note to show its native hover title.
if(clone.querySelector(".comparison-places-note")){floating.inert=false;clone.querySelectorAll(".comparison-places-note abbr").forEach(note=>note.removeAttribute("tabindex"));}
let raf=0;function update(){raf=0;const r=rail.getBoundingClientRect(),t=table.getBoundingClientRect(),h=head.getBoundingClientRect();
const header=document.querySelector('.site-header')?.getBoundingClientRect(),admin=document.querySelector('#wpadminbar')?.getBoundingClientRect();
const top=Math.max(0,header&&header.bottom>0?header.bottom:0,admin&&admin.bottom>0?admin.bottom:0);
floating.hidden=!(h.top<top&&t.bottom>top&&r.right>0&&r.left<innerWidth);if(floating.hidden)return;
const left=Math.max(0,r.left),right=Math.min(innerWidth,r.right);floating.style.left=left+'px';floating.style.top=Math.min(top,t.bottom-h.height)+'px';floating.style.width=(right-left)+'px';floating.style.height=h.height+'px';
clone.style.width=t.width+'px';clone.style.transform='translateX('+(t.left-left)+'px)';
Array.from(head.rows[0].cells).forEach((cell,i)=>{clone.tHead.rows[0].cells[i].style.width=cell.getBoundingClientRect().width+'px'; if(i===0)clone.tHead.rows[0].cells[i].style.transform=innerWidth<=700?'translateX('+rail.scrollLeft+'px)':'';});}
schedule=()=>{if(!raf)raf=PlazaMotion.frame(update)};
PlazaRuntime.on(window,'scroll',schedule,{passive:true});PlazaRuntime.on(window,'resize',schedule,{passive:true});PlazaRuntime.on(rail,'scroll',schedule,{passive:true});new ResizeObserver(schedule).observe(table);document.fonts?.ready.then(schedule);schedule();
}
// Kislovodsk: mouse hover previews remain usable in a narrow browser panel.
const previewQuery=document.body.classList.contains('plaza-object-kislovodsk')?'(hover:hover) and (pointer:fine)':'(min-width:1024px) and (hover:hover) and (pointer:fine)';
const allowed=matchMedia(previewQuery);
// Approved shared room preview for both property catalogues.
const flipMode=['plaza-object-zheleznovodsk','plaza-object-kislovodsk'].some(name=>document.body.classList.contains(name));
const portraitMode=document.body.classList.contains('plaza-object-kislovodsk')&&!!host.querySelector('template[data-preview-plan]');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const preview=document.createElement('div');preview.className=portraitMode?'comparison-room-preview':'comparison-preview';preview.setAttribute('role','region');preview.setAttribute('aria-label','Превью номера');if(flipMode){preview.dataset.previewEffect=portraitMode?'portrait':'flip';preview.tabIndex=0;}document.body.append(preview);
let timer=0,dwellTimer=0,fadeUntil=0,anchor=null,flipped=false;
function setFlipped(value){
 if(!flipMode)return;flipped=value;preview.toggleAttribute('data-flipped',value);
 const front=preview.querySelector('.comparison-flip-front'),back=preview.querySelector('.comparison-flip-back');
 if(!front||!back)return;
 const transfer=value&&front.contains(document.activeElement);
 back.inert=!value;back.setAttribute('aria-hidden',String(!value));
 if(transfer)back.querySelector('a')?.focus({preventScroll:true});
 front.inert=value;front.setAttribute('aria-hidden',String(value));
}
function closePreview(){clearTimeout(timer);timer=0;if(portraitMode&&preview.hasAttribute('data-open'))fadeUntil=performance.now()+500;if(!portraitMode)setFlipped(false);preview.removeAttribute('data-open');preview.inert=true;anchor=null;}
function hide(){clearTimeout(dwellTimer);closePreview();}
function later(){
 if(portraitMode){closePreview();return;}
 clearTimeout(timer);
 if(flipMode&&flipped){setFlipped(false);const duration=parseFloat(getComputedStyle(preview).getPropertyValue('--comparison-flip-duration'))||650;timer=setTimeout(hide,reduced.matches?0:duration);}
 else timer=setTimeout(hide,160);
}
function buildPortrait(template,sourceLink){
 const card=preview.querySelector('.plaza-room-card'),photo=card?.querySelector('.photo-frame'),body=card?.querySelector('.card-body');
 if(!photo||!body)return;
 const heading=body.querySelector('h3'),specs=body.querySelector('.room-catalog-specs'),description=body.querySelector('p:not(.text-link)'),detail=body.querySelector('.text-link a');
 const price=sourceLink.closest('tr')?.querySelector('.comparison-book')||photo.querySelector('.catalog-price');
 const cells=sourceLink.closest('tr')?.cells,places=(cells?.[3]?.textContent||'').match(/\d+/g)||[],bath=(cells?.[5]?.textContent||'').trim().replace(/Ванная/g,'Ванна').replace(/\s+и\s+/g,' + ');
 const capacity=places.length>1?places[0]+' основных + '+places[1]+(Number(places[1])===1?' дополнительное место':' дополнительных места'):(cells?.[3]?.textContent||'').trim();
 const inner=document.createElement('div');inner.className='room-preview-inner';
 const face=side=>{const el=document.createElement('article');el.className='comparison-flip-face comparison-flip-'+side+' room-preview-face';return el;};
 const front=face('front'),back=face('back'),frontImage=document.createElement('figure'),planImage=document.createElement('figure');
 frontImage.className='room-preview-image room-preview-photo';planImage.className='room-preview-image room-preview-plan';
 photo.querySelectorAll('img').forEach(image=>{const img=image.cloneNode(true);img.loading='eager';img.decoding='async';img.sizes='384px';frontImage.append(img);});
 const plan=document.createElement('img');const planBase='/wp-content/uploads/plaza-room-preview-overhead-20261031/'+sourceLink.dataset.roomPreview+'-day';plan.src=planBase+'-384.webp';plan.srcset=planBase+'-384.webp 384w, '+planBase+'-768.webp 768w';plan.sizes='384px';plan.width=768;plan.height=432;plan.alt='3D план номера «'+heading.textContent.trim()+'»';plan.loading='eager';plan.decoding='async';plan.className='room-preview-plan-day';const night=plan.cloneNode(true);night.className='room-preview-plan-night';const nightBase='/wp-content/uploads/plaza-room-preview-overhead-20261031/'+sourceLink.dataset.roomPreview+'-night';night.src=nightBase+'-384.webp';night.srcset=nightBase+'-384.webp 384w, '+nightBase+'-768.webp 768w';planImage.append(plan,night);
 const content=(official=false)=>{const el=document.createElement('div');el.className='room-preview-copy';const title=heading.cloneNode(true);title.className='room-preview-title';const facts=document.createElement('div');facts.className='room-preview-specs';const mainFacts=specs.cloneNode(true);mainFacts.className='room-preview-spec-row';const bathFact=document.createElement('span');bathFact.textContent=bath;mainFacts.append(bathFact);facts.append(mainFacts);const text=document.createElement('p');text.className='room-preview-description';text.textContent=official?description.textContent:template.dataset.previewAudience;el.append(title);if(official){const capacityLine=document.createElement('p');capacityLine.className='room-preview-capacity';capacityLine.textContent=capacity;el.append(capacityLine);}else el.append(facts);el.append(text);return el;};
 const frontCopy=content(),backCopy=content(true),actions=document.createElement('div');actions.className='room-preview-actions';
 for(const item of [{href:price.href,text:'Цена '+price.textContent.trim(),label:'Стоимость и бронирование: '+heading.textContent.trim()},{href:detail.href,text:'Подробнее о номере',type:'button-type-2 plaza-outline',label:'Подробнее о номере: '+heading.textContent.trim()}]){
  const wrap=document.createElement('div');wrap.className='wp-block-button plaza-button '+(item.type||'button-type-1');const a=document.createElement('a');a.className='wp-block-button__link wp-element-button';a.href=item.href;a.textContent=item.text;a.setAttribute('aria-label',item.label);wrap.append(a);actions.append(wrap);
 }
 backCopy.append(actions);front.append(frontImage,frontCopy);back.append(planImage,backCopy);inner.append(front,back);preview.replaceChildren(inner);setFlipped(false);
}

function buildFlip(){
 const card=preview.querySelector('.plaza-room-card'),photo=card?.querySelector('.photo-frame'),body=card?.querySelector('.card-body'),details=body?.querySelector('.text-link a'),price=photo?.querySelector('.catalog-price');
 if(!photo||!body||!details||!price)return;
 const wrapper=document.createElement('div');wrapper.className='comparison-flip-card';
 const inner=document.createElement('div');inner.className='comparison-flip-inner';
 photo.classList.add('comparison-flip-face','comparison-flip-front');body.classList.add('comparison-flip-face','comparison-flip-back');
 const action=photo.querySelector('.catalog-price-button'),link=action.querySelector('a'),heading=body.querySelector('h3');
 action.classList.add('comparison-flip-details');link.textContent='Цена '+price.textContent.trim();link.classList.add('comparison-flip-price-link');
 if(heading){const titleLink=document.createElement('a');titleLink.href=details.href;titleLink.className='plaza-underline';const label=document.createElement('span');label.className='plaza-link-label';label.textContent=heading.textContent;titleLink.append(label);const arrow=document.querySelector('.pn-city .pn-external-arrow')?.cloneNode(true);if(arrow)titleLink.append(arrow);heading.replaceChildren(titleLink);}
 const specs=body.querySelector('.room-catalog-specs'),description=body.querySelector('p:not(.text-link)');
 body.className='comparison-flip-face comparison-flip-back';
 if(heading)heading.className='comparison-flip-title';
 if(description)description.className='comparison-flip-description';
 body.replaceChildren(...[heading,specs,description,action].filter(Boolean));
 photo.querySelector('.room-photo-link')?.setAttribute('tabindex','-1');photo.querySelectorAll('img').forEach(img=>{img.loading='eager';img.sizes='320px';});
 inner.append(photo,body);wrapper.append(inner);preview.replaceChildren(wrapper);setFlipped(false);
}
function show(link){
 if(!allowed.matches)return;clearTimeout(timer);timer=0;
 if(anchor===link&&preview.hasAttribute('data-open'))return;
 const template=host.querySelector('#comparison-preview-'+link.dataset.roomPreview);if(!template)return;
 flipped=false;preview.removeAttribute('data-flipped');preview.replaceChildren(template.content.cloneNode(true));if(flipMode){if(portraitMode)buildPortrait(template,link);else buildFlip();}preview.inert=false;preview.setAttribute('data-open','');anchor=link;
 if(flipMode&&!portraitMode){const back=preview.querySelector('.comparison-flip-back');if(back){for(let step=0;step<=6;step++){back.style.setProperty('--comparison-copy-scale',String(1-step*.025));if(back.scrollHeight<=back.clientHeight+1)break;}}}

 const a=link.getBoundingClientRect(),header=document.querySelector('.site-header')?.getBoundingClientRect(),minY=Math.max(16,(header?.bottom||0)+12,(header?.height||0)+12);if(portraitMode)preview.style.setProperty('--room-preview-available-height',Math.max(0,innerHeight-minY-16)+'px');const p=preview.getBoundingClientRect(),w=preview.offsetWidth,gap=18;let x=a.right+gap;if(x+w>innerWidth-16)x=Math.max(16,a.left-w-gap);const y=Math.max(minY,Math.min(a.top-40,innerHeight-p.height-16));preview.style.left=x+'px';preview.style.top=y+'px';
}
host.querySelectorAll('.comparison-room-name').forEach(a=>{PlazaRuntime.on(a,'pointerenter',e=>{if(!portraitMode&&e.pointerType!=='touch')show(a)});PlazaRuntime.on(a,'pointerleave',()=>{if(!portraitMode)later();});PlazaRuntime.on(a,'focus',()=>setTimeout(()=>{if(document.activeElement===a)show(a)},120));PlazaRuntime.on(a,'blur',event=>{if(portraitMode&&(preview.contains(event.relatedTarget)||preview.matches(':hover')))return;later();})});
if(portraitMode)host.querySelectorAll('tbody tr').forEach(row=>{
 const link=row.querySelector('.comparison-room-name');if(!link)return;
 PlazaRuntime.on(row,'pointerenter',event=>{
  if(event.pointerType==='touch'||!allowed.matches)return;
  clearTimeout(dwellTimer);
  if(anchor===link&&preview.hasAttribute('data-open')){clearTimeout(timer);timer=0;setFlipped(false);return;}
  dwellTimer=setTimeout(()=>{
   if(!row.matches(':hover'))return;
   if(anchor&&anchor!==link)closePreview();
   const remaining=Math.max(0,fadeUntil-performance.now());
   if(remaining)dwellTimer=setTimeout(()=>{if(row.matches(':hover'))show(link);},remaining);
   else show(link);
  },1000);
 });
 PlazaRuntime.on(row,'pointerleave',event=>{clearTimeout(dwellTimer);if(preview.contains(event.relatedTarget))return;later();});
});
if(portraitMode)host.querySelectorAll('.comparison-room-name').forEach(link=>PlazaRuntime.on(link,'keydown',event=>{if(event.key!=='ArrowRight')return;event.preventDefault();show(link);setFlipped(true);preview.querySelector('.comparison-flip-back .room-preview-actions a')?.focus({preventScroll:true});}));
PlazaRuntime.on(preview,'pointerenter',()=>{clearTimeout(timer);timer=0;clearTimeout(dwellTimer);setFlipped(true);});PlazaRuntime.on(preview,'pointerleave',event=>{if(portraitMode){const row=event.relatedTarget?.closest?.('tr');if(row&&host.contains(row)){if(anchor?.closest('tr')===row)setFlipped(false);else closePreview();return;}}later();});
PlazaRuntime.on(preview,'focusin',()=>{clearTimeout(timer);timer=0;setFlipped(true);});PlazaRuntime.on(preview,'focusout',e=>{if(!preview.contains(e.relatedTarget))later();});
PlazaRuntime.on(document,'keydown',e=>{if(e.key==='Escape')hide()});PlazaRuntime.on(window,'scroll',()=>{hide();const active=document.activeElement;if(active?.matches('.comparison-room-name'))timer=setTimeout(()=>show(active),160)},{passive:true});PlazaRuntime.on(window,'resize',hide,{passive:true});PlazaRuntime.on(allowed,'change',hide);host.querySelectorAll('[data-room-filter]').forEach(b=>PlazaRuntime.on(b,'click',()=>{hide();schedule()}));
})();
