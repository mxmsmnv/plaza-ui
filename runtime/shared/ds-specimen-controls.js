/* Scoped original PLAZA design-system controls. No live-page fetch, iframe catalogue boot or TravelLine loader.
   Original value formatting, replay, icon filtering/jumps, table/card geometry are retained.
   Null guards and clipboard transport are standalone-document integration, not replacement effects. */
(()=>{'use strict';
 if(window.PlazaDsSpecimenControls)return;window.PlazaDsSpecimenControls={version:1};
 const boot=()=>{
 const page=document.querySelector('.ds-page')||document.getElementById('example-stage')||document.body;
 if(!page||!page.querySelector('[data-token],[data-ds-css],[data-ds-action-token],[data-type-sample],[data-ds-glass-shift],[data-ds-repeat-heading],[data-ds-icon-search],[data-ds-measure],[data-ds-room-split],[data-ds-reduced],[data-ds-action],[data-ds-parallax-measure],[data-ds-flare-type]'))return;
 let status=page.querySelector('.ds-live-status');if(!status){status=document.createElement('p');status.className='ds-live-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');page.append(status)}let statusTimer;
 const announce=text=>{clearTimeout(statusTimer);status.textContent=text;statusTimer=setTimeout(()=>{status.textContent='';},3200);};
 const formatColor=value=>{
  const m=value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return m?'#'+m.slice(1).map(n=>Number(n).toString(16).padStart(2,'0')).join('').toUpperCase():value;
 };

 const refresh=()=>{
  const actionSource=document.querySelector('.site-header:not(.ds-header-phone-sample) .header-price')||page.querySelector('.header-price');
  page.querySelectorAll('[data-ds-action-token]').forEach(el=>{el.textContent=actionSource?getComputedStyle(actionSource).getPropertyValue(el.dataset.dsActionToken).trim():'Нет компонента для измерения';});
  const css=getComputedStyle(document.body),rail=page.querySelector('.ds-rail');
  page.querySelectorAll('[data-ds-carousel-gap]').forEach(el=>{el.textContent=rail?getComputedStyle(rail).columnGap:'Нет ряда для измерения';});
  page.querySelectorAll('[data-token]').forEach(button=>{const paint=button.querySelector('.ds-paint'),valueNode=button.querySelector('[data-value]');if(!paint||!valueNode)return;const value=formatColor(getComputedStyle(paint).backgroundColor);button.dataset.copyValue=value;valueNode.textContent=value;button.title=button.dataset.token+' · скопировать '+value;});
  page.querySelectorAll('[data-ds-css]').forEach(el=>{el.textContent=css.getPropertyValue(el.dataset.dsCss).trim()||'Наследуется';});
  page.querySelectorAll('[data-type-sample]').forEach(el=>{const measure=el.closest('.ds-type-row')?.querySelector('[data-measure]');if(!measure)return;const s=getComputedStyle(el);measure.textContent=`${parseFloat(s.fontSize).toFixed(1).replace('.0','')} px · ${s.fontWeight}\nстрока ${parseFloat(s.lineHeight).toFixed(1).replace('.0','')} px\n${s.fontFamily.split(',')[0]}`;});
  const theme=page.querySelector('[data-ds-theme]');if(theme)theme.textContent=document.documentElement.dataset.theme==='dark'?'Ночная палитра':'Дневная палитра';
  const themeControl=page.querySelector('[data-ds-theme-toggle]');if(themeControl){const dark=document.documentElement.dataset.theme==='dark';themeControl.textContent=dark?'Дневная тема':'Ночная тема';themeControl.setAttribute('aria-label',dark?'Показать дневные эффекты':'Показать ночные эффекты');}
 };
 const clipboardBridge=text=>new Promise((resolve,reject)=>{
  const id='plaza-swatch-'+Date.now()+'-'+Math.random().toString(36).slice(2);let timer;
  const result=event=>{if(event.source!==parent||event.data?.copyResult?.id!==id)return;clearTimeout(timer);PlazaRuntime.off(window,'message',result);event.data.copyResult.ok?resolve():reject(new Error('Clipboard unavailable'));};
  PlazaRuntime.on(window,'message',result);timer=setTimeout(()=>{PlazaRuntime.off(window,'message',result);reject(new Error('Clipboard reply timeout'));},3500);
  parent.postMessage({plazaPreview:true,copyRequest:{id,text:String(text).slice(0,4096)}},'*');
 });
 const copy=async(text,message)=>{try{try{await navigator.clipboard.writeText(text)}catch{await clipboardBridge(text)}announce(message);}catch{announce('Копирование недоступно. Значение можно выделить на странице.');}};
 page.querySelectorAll('[data-token]').forEach(button=>PlazaRuntime.on(button,'click',()=>{refresh();copy(button.dataset.copyValue,`Скопировано: ${button.dataset.copyValue}`)}));
 page.querySelectorAll('[data-ds-action]').forEach(button=>PlazaRuntime.on(button,'click',()=>announce('Действие работает. Это демонстрация — заявка не отправляется.')));
 PlazaRuntime.on(page.querySelector('[data-ds-glass-shift]'),'input',event=>{const underlay=page.querySelector('.ds-glass-underlay');if(underlay)underlay.style.setProperty('--ds-underlay-shift',event.currentTarget.value+'%')});
 // Keep the DS button's source classes: adding .theme-toggle would change its geometry.
 const themeControl=page.querySelector('[data-ds-theme-toggle]');
 if(themeControl)PlazaRuntime.on(themeControl,'click',()=>{
  const original=document.querySelector('.site-header:not(.ds-header-phone-sample) .plaza-sun-toggle');
  if(original){original.click();return;}
  if(!window.PlazaThemeTransition)return;
  let proxy=document.querySelector('[data-ds-theme-proxy]');
  if(!proxy){proxy=document.createElement('button');proxy.type='button';proxy.className='theme-toggle';proxy.dataset.dsThemeProxy='';proxy.setAttribute('aria-hidden','true');proxy.tabIndex=-1;document.body.append(proxy);}
  const r=themeControl.getBoundingClientRect();
  proxy.style.cssText='position:fixed!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;margin:0!important;padding:0!important;transform:none!important;left:'+r.left+'px!important;top:'+r.top+'px!important;width:'+r.width+'px!important;height:'+r.height+'px!important;';
  proxy.click();
 });
 PlazaRuntime.on(page.querySelector('[data-ds-repeat-heading]'),'click',()=>{
  const heading=page.querySelector('#ds-large-motion-sample'),motion=window.PlazaHeadingMotion;
  if(!motion||!heading)return;
  const lastDelay=Math.max(0,...[...heading.querySelectorAll('.plaza-motion-letter')].map(e=>parseFloat(e.style.getPropertyValue('--plaza-heading-delay'))||0));
  motion.replay(heading,motion.large.duration+lastDelay);
 });

 const viewports=[...page.querySelectorAll('.ds-table-wrap')];
 const tableGeometry=()=>{
  for(const rail of viewports){
   const table=rail.querySelector('table');if(!table)continue;
   rail.dataset.dsOverflow=String(rail.scrollWidth>rail.clientWidth+1);
   if(rail.dataset.dsOverflow==='true'){rail.tabIndex=0;rail.setAttribute('role','region');rail.setAttribute('aria-label','Таблица с горизонтальной прокруткой и закреплённым первым столбцом');}
   else{rail.removeAttribute('tabindex');rail.removeAttribute('role');rail.removeAttribute('aria-label');}
   if(table.classList.contains('ds-long-table'))document.body.style.setProperty('--ds-table-scroll-x',rail.scrollLeft+'px');
  }
 };
 viewports.forEach(rail=>{PlazaRuntime.on(rail,'scroll',tableGeometry,{passive:true});new ResizeObserver(tableGeometry).observe(rail);});

 const labels=()=>{
  tableGeometry();const section=page.querySelector('.ds-section'),wrap=page.querySelector('.ds-layout'),sidebar=page.querySelector('.ds-sidebar'),footer=document.querySelector('footer#contacts');
  const live=page.querySelector('[data-ds-live-grid]');
  if(live&&wrap&&sidebar){const r=wrap.getBoundingClientRect();live.textContent=`Сейчас в вашем окне: ${innerWidth} px; контейнер ${r.width.toFixed(0)} px; поля ${r.left.toFixed(0)} px; ${getComputedStyle(wrap).display==='grid'?`меню ${sidebar.getBoundingClientRect().width.toFixed(0)} px + промежуток ${getComputedStyle(wrap).columnGap}`:'одна колонка'}.`;}
  const values={'section-before':section?getComputedStyle(section).paddingTop:'Нет секции для измерения','section-after':section?getComputedStyle(section).paddingBottom:'Нет секции для измерения','footer-before':footer?`${getComputedStyle(footer).marginTop} снаружи · ${getComputedStyle(footer).paddingTop} внутри`:'Наследуется от футера'};
  page.querySelectorAll('[data-ds-measure]').forEach(el=>el.textContent=values[el.dataset.dsMeasure]||'');
 };
 const room=page.querySelector('#ds-card-row .plaza-room-card');
 const roomGeometry=()=>{if(!room)return;const figure=room.querySelector('figure'),cardBody=room.querySelector('.card-body'),price=room.querySelector('.catalog-price');if(!figure||!cardBody)return;const photo=figure.getBoundingClientRect(),body=cardBody.getBoundingClientRect(),total=photo.height+body.height,split=page.querySelector('[data-ds-room-split]'),width=page.querySelector('[data-ds-price-width]');if(split&&total>0)split.textContent=`${photo.height.toFixed(1)} / ${body.height.toFixed(1)} px · ${(photo.height/total*100).toFixed(1)} / ${(body.height/total*100).toFixed(1)}%`;if(width&&price)width.textContent=`${getComputedStyle(price).getPropertyValue('--plaza-room-price-width').trim()} · ${price.getBoundingClientRect().width.toFixed(0)} px`;};
 if(room)new ResizeObserver(roomGeometry).observe(room);
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),motionStatus=()=>{const node=page.querySelector('[data-ds-reduced]');if(node)node.textContent=reduced.matches?'В этой системе включено уменьшение движения. Образцы используют щадящий режим.':'Уменьшение движения сейчас выключено. Образцы учитывают эту настройку системы автоматически.';};PlazaRuntime.on(reduced,'change',motionStatus);motionStatus();
 const parallax=()=>{const frame=page.querySelector('.ds-parallax-stage .pg-frame'),root=page.querySelector('.ds-parallax-stage');if(frame&&root){let settings;try{settings=JSON.parse(root.querySelector('[data-pg-settings]').textContent)}catch{return}const mobile=matchMedia('(max-width:1050px), (hover:none), (pointer:coarse)'),h=frame.getBoundingClientRect().height,a=mobile.matches?settings.mobileImageIntensity:settings.imageIntensity,target=page.querySelector('[data-ds-parallax-measure]');if(target&&Number.isFinite(a))target.textContent=`Высота рамки ${h.toFixed(1)} px · предел ±${(h*a/2).toFixed(1)} px · полный ход ${(h*a).toFixed(1)} px`;}
 const flare=page.querySelector('.ds-flare-specimen p.ny-eyebrow'),type=page.querySelector('[data-ds-flare-type]');if(flare&&type){const s=getComputedStyle(flare);type.textContent=`${s.fontFamily.split(',')[0]} ${s.fontWeight} · ${s.fontSize} / ${s.lineHeight} · трекинг ${s.letterSpacing}`;}};
 const frame=page.querySelector('.ds-parallax-stage .pg-frame');if(frame)new ResizeObserver(parallax).observe(frame);
 const update=()=>{refresh();labels();roomGeometry();parallax()};
 new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});let resizeFrame;PlazaRuntime.on(window,'resize',()=>{PlazaMotion.cancelFrame(resizeFrame);resizeFrame=PlazaMotion.frame(update);},{passive:true});document.fonts?.ready.then(update);update();
 };
 const initCatalogue=()=>{
  const input=document.querySelector('[data-ds-icon-search]');if(!input)return;
  const section=input.closest('#icons'),count=document.querySelector('[data-ds-icon-count]');if(!section||!count)return;
  const filter=doc=>{
   const rows=[...doc.querySelectorAll('.ds-icon-row')],q=input.value.toLocaleLowerCase('ru').trim();let shown=0;
   for(const row of rows){row.hidden=!row.dataset.search.includes(q);if(!row.hidden)shown++;}
   doc.querySelectorAll('.ds-icon-jump').forEach(link=>{const row=doc.getElementById('icon-'+link.dataset.iconKey);link.hidden=!!row?.hidden;});
   doc.querySelectorAll('.ds-icon-group-title').forEach(heading=>{let row=heading.nextElementSibling,visible=false;while(row&&!row.matches('.ds-icon-group-title')){if(row.matches('.ds-icon-row')&&!row.hidden)visible=true;row=row.nextElementSibling;}heading.hidden=!visible;});
   return [shown,rows.length];
  };
  const apply=()=>{const [shown,total]=filter(document);count.textContent=shown+' из '+total;section.querySelectorAll('iframe.ds-v2-theme-frame').forEach(frame=>{if(frame.contentDocument?.querySelector('.ds-icon-row'))filter(frame.contentDocument);});};
  apply();PlazaRuntime.on(input,'input',apply);
  PlazaRuntime.on(section,'click',event=>{
   const link=event.target.closest('.ds-icon-jump');if(!link)return;
   event.preventDefault();event.stopPropagation();input.value='';apply();
   const frame=section.querySelector('iframe.ds-v2-theme-frame:not(.is-loading)');
   const doc=frame?.contentDocument||document,target=doc.getElementById('icon-'+link.dataset.iconKey);if(!target)return;
   const details=target.querySelector('details');if(details&&!details.open)details.querySelector('summary')?.click();
   PlazaMotion.frame(()=>PlazaMotion.frame(()=>{
    target.tabIndex=-1;target.focus({preventScroll:true});
    const behavior=matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth';
    if(frame){
     // A full-height theme frame must not keep an internal fragment scroll.
     frame.contentWindow.scrollTo({top:0,left:0,behavior:'instant'});
     const offset=Math.max(96,parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--plaza-page-anchor-offset'))||0);
     const top=scrollY+frame.getBoundingClientRect().top+target.getBoundingClientRect().top-offset;
     window.scrollTo({top,behavior});
    }else target.scrollIntoView({block:'start',behavior});
    history.pushState(null,'',link.hash);
   }));
  });

  // The v2 local-theme preview is the same catalogue in an isolated document.
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLIFrameElement&&node.matches('.ds-v2-theme-frame'))PlazaRuntime.on(node,'load',apply,{once:true});}).observe(section,{childList:true,subtree:true});
 };

 const start=()=>{boot();initCatalogue()};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',start,{once:true});else start();
})();
// Live measurements of the real specimens; source components own the effects.
PlazaRuntime.on(document,'DOMContentLoaded',()=>{
 const rail=document.querySelector('#ds-card-row'),host=document.querySelector('#ds-card-specs');
 if(!rail||!host)return;
 const entries=[...rail.querySelectorAll(':scope > article')];
 const provenance=card=>{
  if(card.matches('.plaza-room-card,.comparison-card'))return ['theme/inc/migration-components/component-13.php','shared/assets/foundations/components.css; shared/psk-approved-system.css; shared/card-motion.js'];
  if(card.matches('.pg-med-feature'))return ['plaza-psk-guide/feature-card.php','plaza-psk-guide/guide.css; shared/psk-approved-system.css'];
  if(card.matches('.svc-card'))return ['plaza-psk-guide/service-card.php; services-content.json','plaza-psk-guide/guide.css; plaza-psk-guide/services.css; shared/psk-approved-system.css; shared/assets/cards/card-spotlight.css'];
  if(card.matches('.plaza-program-card'))return ['plaza-psk-guide/program-card.php; program-card-data.json; главная ID2333','shared/assets/foundations/components.css; shared/psk-approved-system.css; plaza-psk-approved-system.php'];
  if(card.matches('.wp-block-group'))return ['Главная Кисловодска: содержимое страницы (ID 2333)','shared/assets/foundations/components.css; shared/psk-approved-system.css'];
  return ['plaza-psk-guide/content.json: медицина (ID 2615)','plaza-psk-guide/medical.css; shared/psk-approved-system.css'];
 };
 entries.forEach((card,i)=>{
  const details=document.createElement('details'),summary=document.createElement('summary'),dl=document.createElement('dl');
  const title=card.querySelector('h2,h3,h4')?.textContent.trim()||`Образец ${i+1}`;
  summary.textContent=`${i+1}. ${title}`;dl.className='ds-facts';
  const rows={};
  const row=(name,value)=>{const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;div.append(dt,dd);dl.append(div);return dd;};
  const [source,styles]=provenance(card);row('Источник',source);row('Стили и движение','shared/psk-cards.css → '+styles);row('Наследование',`Общие токены Кисловодска → shared/psk-cards.css → .plaza-card → ${card.className.split(' ').filter(x=>x!=='card').join(' ')} → перечисленные стили. Размеры ниже вычислены в текущем контейнере.`);
  rows.size=row('Размер карточки','');rows.photo=row('Размер фотографии','');rows.transition=row('Переход карточки','');rows.radius=row('Скругление и рамка','');rows.photoMotion=row('Переход фотографии','');rows.actionMotion=row('Переход действия','');rows.padding=row('Внутренние поля','');rows.shadow=row('Тень','');
  const measure=()=>{const r=card.getBoundingClientRect(),s=getComputedStyle(card),img=card.querySelector('figure,.photo-frame,.svc-card-photo');
   rows.size.textContent=`${r.width.toFixed(1)} × ${r.height.toFixed(1)} px`;
   if(img){const q=img.getBoundingClientRect();rows.photo.textContent=`${q.width.toFixed(1)} × ${q.height.toFixed(1)} px`;}else rows.photo.textContent='Нет фотографии';
   rows.transition.textContent=`${s.transitionProperty} · ${s.transitionDuration} · ${s.transitionTimingFunction} · задержка ${s.transitionDelay}`;
   rows.radius.textContent=`${s.borderRadius} · ${s.borderWidth}`;
   const motion=node=>{if(!node)return 'Нет отдельного элемента';const c=getComputedStyle(node);return `${c.transitionProperty} · ${c.transitionDuration} · ${c.transitionTimingFunction} · задержка ${c.transitionDelay}`;};rows.photoMotion.textContent=motion(card.querySelector('img'));rows.actionMotion.textContent=motion(card.querySelector('.plaza-card-more,.text-link,a.button'));rows.padding.textContent=getComputedStyle(card.querySelector('.card-body')||card).padding;rows.shadow.textContent=s.boxShadow;
  };
  details.append(summary,dl);host.append(details);measure();new ResizeObserver(measure).observe(card);
 });
});


