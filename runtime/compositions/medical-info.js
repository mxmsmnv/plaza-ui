/* One text-only medical dialog; data and prices come from the medicine catalogue. */
(() => {
 'use strict';
 const boot = () => {
  const sheet=document.getElementById('med-sheet');
  const page=document.querySelector('.psk-medical')||document.querySelector('#medicine');
  if(!sheet||!page||sheet.dataset.medInfoReady)return;
  sheet.dataset.medInfoReady='true';sheet.tabIndex=-1;
  let opener,previousOverflow,frameMotion;
  const motion=()=>frameMotion||(frameMotion=window.PlazaPolicyFrame.bind(sheet));
  const open=button=>{
   const content=document.getElementById('med-info-'+button.dataset.medInfo);
   if(!content)return;
   opener=button;
   const body=sheet.querySelector('#med-sheet-body');
   body.replaceChildren(content.content.cloneNode(true));body.querySelector('h2').id='med-sheet-title';
   previousOverflow=document.body.style.overflow;
   motion().open();sheet.scrollTop=0;document.body.style.overflow='hidden';sheet.focus({preventScroll:true});
  };
  PlazaRuntime.on(page,'click',event=>{
   if(event.defaultPrevented)return;
   const button=event.target.closest('[data-med-info]')||event.target.closest('[data-med-goal]')?.querySelector('[data-med-info]');
   if(!button||!document.getElementById('med-info-'+button.dataset.medInfo))return;
   event.preventDefault();open(button);
  });
  PlazaRuntime.on(sheet.querySelector('[data-med-close]'),'click',()=>motion().close());
  PlazaRuntime.on(sheet,'click',event=>{
   if(event.target!==sheet)return;
   const r=sheet.getBoundingClientRect();
   if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)motion().close();
  });
  PlazaRuntime.on(sheet,'close',()=>{document.body.style.overflow=previousOverflow||'';opener?.focus({preventScroll:true});});
  const fromHash=()=>{
   if(!location.hash.startsWith('#med-info-'))return;
   const key=location.hash.slice('#med-info-'.length);
   const button=Array.from(document.querySelectorAll('[data-med-info]')).find(button=>button.dataset.medInfo===key);
   if(!button)return;
   const panel=button.closest('[role="tabpanel"]');
   if(panel?.hidden)Array.from(document.querySelectorAll('[role="tab"]')).find(tab=>tab.getAttribute('aria-controls')===panel.id)?.click();
   open(button);
  };
  PlazaRuntime.on(window,'hashchange',fromHash);fromHash();
 };
 if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot);else boot();
})();
