/* Original seating-plan pan/zoom/keyboard handlers only. */
(()=>{'use strict';const root=document.querySelector('.psk-ny');if(!root)return;
  const planDialog = root.querySelector('.ny-seating-viewer');
  if(!planDialog)return;
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

})();
