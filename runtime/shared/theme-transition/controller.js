/* PLAZA: one theme state, persistence and transition controller. */
(()=>{'use strict';
 if(window.PlazaThemeTransition)return;
 const root=document.documentElement,system=matchMedia('(prefers-color-scheme:dark)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const toggleSelector='.footer-theme-toggle,.pn-theme:not(.pn-theme-system),.theme-toggle';
 const autoSelector='.theme-auto,.pn-theme-system';
 let config={};try{config=JSON.parse(document.getElementById('plaza-theme-transition-config').textContent)}catch{}
 const duration=Math.max(1,Number(config.durationMs)||2000),effect=config.effect==='stars'?'stars':'circle';
 let mode=['light','dark'].includes(root.dataset.colorMode)?root.dataset.colorMode:'auto',pending=false,transition=null,sequence=0;
 const storageKey=config.storageKey||'plaza-color-mode';
 const paint=()=>{
  const theme=mode==='auto'?(system.matches?'dark':'light'):mode;
  root.dataset.theme=theme;root.dataset.colorMode=mode;
  document.querySelectorAll(toggleSelector).forEach(button=>{const label=theme==='dark'?'Включить светлую тему':'Включить тёмную тему';button.setAttribute('aria-label',label);button.title=label;if(button.hasAttribute('data-plaza-daylight-toggle'))button.setAttribute('aria-pressed',String(theme==='light'))});
  document.dispatchEvent(new CustomEvent('plaza:themechange',{detail:{theme:theme,mode:mode}}));
 };
 const remember=()=>{try{if(mode==='auto')localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,mode)}catch{}};
 const commitMode=next=>{mode=next;remember();paint()};
 const point=(angle,r)=>[100+Math.cos(angle)*r,100+Math.sin(angle)*r];
 const starImage=()=>{
  const star=config.stars||{},points=[];for(let i=0;i<10;i++)points.push(point(-Math.PI/2+i*Math.PI/5,96*(i%2?(Number(star.innerRatio)||.44):1)).join(','));
  const blur=Math.max(0,Math.min(4,Number(star.blurSvgUnits)||1.2));
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="'+blur+'"/></filter></defs><polygon fill="white" filter="url(#soft)" points="'+points.join(' ')+'"/></svg>';
  return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 };
 const prepare=(button)=>{
  const box=button.getBoundingClientRect(),x=box.left+box.width/2,y=box.top+box.height/2;
  root.style.setProperty('--plaza-theme-duration',duration+'ms');
  root.style.setProperty('--plaza-theme-easing',effect==='stars'?(config.stars?.easing||config.easing):config.easing||'cubic-bezier(.2,.55,.35,1)');
  root.style.setProperty('--plaza-theme-x',x+'px');root.style.setProperty('--plaza-theme-y',y+'px');
  root.style.setProperty('--plaza-theme-feather',(Number(config.featherPx)||90)+'px');
  root.style.setProperty('--plaza-theme-radius',(Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+(Number(config.overscanPx)||100))+'px');
  if(effect==='stars'){
   const image=starImage(),centres=[];for(let row=0;row<3;row++)for(let col=0;col<3;col++)centres.push({x:(col+.5)*innerWidth/3,y:(row+.5)*innerHeight/3});
   const distances=centres.map(p=>Math.hypot(p.x-x,p.y-y)),near=Math.min(...distances),far=Math.max(1,...distances.map(d=>d-near)),star=config.stars||{};
   root.style.setProperty('--plaza-theme-star-images',centres.map(()=>image).join(','));
   root.style.setProperty('--plaza-theme-star-base',(Math.hypot(innerWidth/6,innerHeight/6)/.19*(Number(star.coverageOverscan)||1.08))+'px');
   centres.forEach((p,i)=>{const delay=Math.min(duration*.25,Number(star.staggerMs)||180)*(distances[i]-near)/far;root.style.setProperty('--plaza-theme-star-x-'+i,p.x+'px');root.style.setProperty('--plaza-theme-star-y-'+i,p.y+'px');root.style.setProperty('--plaza-theme-star-delay-ms-'+i,delay+'ms');root.style.setProperty('--plaza-theme-star-duration-'+i,(duration-delay)+'ms')});
  }
 };
 const request=(next,button)=>{
  if(pending)return;
  root.dataset.plazaThemeSequence=String(++sequence);root.dataset.plazaThemeFrom=root.dataset.theme;root.dataset.plazaThemeTarget=next;
  if(!document.startViewTransition||reduced.matches||document.hidden){commitMode(next);root.dataset.plazaThemeState='idle';return}
  pending=true;let committed=false;
  const commit=()=>{if(committed)return;committed=true;commitMode(next)};
  const cleanup=()=>{if(!committed)commit();pending=false;transition=null;root.classList.remove('plaza-theme-reveal');root.dataset.plazaThemeState='idle'};
  try{prepare(button);root.dataset.plazaThemeState='running';root.classList.add('plaza-theme-reveal');transition=document.startViewTransition(commit);transition.finished.catch(()=>{}).finally(cleanup)}catch{commit();cleanup()}
 };
 PlazaRuntime.on(document,'click',event=>{
  const target=event.target instanceof Element?event.target:null,toggle=target?.closest(toggleSelector),automatic=target?.closest(autoSelector);
  if(!toggle&&!automatic)return;event.preventDefault();event.stopImmediatePropagation();
  if(automatic){if(!pending)commitMode('auto');return}
  request(root.dataset.theme==='dark'?'light':'dark',toggle);
 },true);
 PlazaRuntime.on(system,'change',()=>{if(mode==='auto')paint()});
 const skip=()=>{if(transition&&typeof transition.skipTransition==='function')transition.skipTransition()};
 PlazaRuntime.on(reduced,'change',()=>{if(reduced.matches)skip()});PlazaRuntime.on(document,'visibilitychange',()=>{if(document.hidden)skip()});
 root.dataset.plazaThemeEffect=effect;root.dataset.plazaThemeDuration=String(duration);root.dataset.plazaThemeState='idle';
 window.PlazaThemeTransition=Object.freeze({version:'20261017-theme-1'});paint();
})();
