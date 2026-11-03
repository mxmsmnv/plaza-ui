
(function(){
'use strict';
var selector='.button:not(.button-outline), .wp-block-button.plaza-button:not(.plaza-outline) .wp-block-button__link, .wp-block-button.button-type-1 .wp-block-button__link';
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function decorate(button){
 if(button.querySelector('.plaza-button-sparks'))return;
 var field=document.createElement('span');field.className='plaza-button-sparks';field.setAttribute('aria-hidden','true');
 var xs=[8,18,30,44,57,70,84,94,24,76];
 var sizes=[.9,4,1.2,.8,3,1.2,3.5,2.2,.7,1.1];
 for(var i=0;i<10;i++){
  var spark=document.createElement('span');
  spark.className='plaza-button-spark'+(i===1||i===4?' star4':i===6?' star5':'');
  spark.style.cssText='--x:'+xs[i]+'%;--y:'+(58+(i*7)%30)+'%;--size:'+sizes[i]+'px;--rise:'+(22+(i*5)%20)+'px;--drift:'+(i%2?10+i:-9-i)+'px;--duration:'+(1.45+(i%4)*.22)+'s;--delay:'+(-i*.193)+'s;';
  field.appendChild(spark);
 }
 button.appendChild(field);
}
function buttonAt(event){return event.target instanceof Element?event.target.closest(selector):null;}
document.querySelectorAll(selector).forEach(decorate);
PlazaRuntime.on(document,'pointerover',function(event){var button=buttonAt(event);if(button)decorate(button);},{passive:true});
PlazaRuntime.on(document,'pointermove',function(event){
 if(event.pointerType==='touch'||reduced.matches)return;
 var button=buttonAt(event);if(!button)return;
 var rect=button.getBoundingClientRect();
 var x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
 var y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
 button.style.setProperty('--plaza-glow-x',(25+x*50).toFixed(2)+'%');
 button.style.setProperty('--spark-dx',((x-.5)*18).toFixed(1)+'px');
 button.style.setProperty('--spark-dy',((y-.5)*10).toFixed(1)+'px');
},{passive:true});
PlazaRuntime.on(document,'pointerout',function(event){
 var button=buttonAt(event);if(!button||button.contains(event.relatedTarget))return;
 button.style.setProperty('--plaza-glow-x','50%');
 button.style.removeProperty('--spark-dx');button.style.removeProperty('--spark-dy');
},{passive:true});
})();

(function(){'use strict';var selector='.button.button-outline, .wp-block-button.plaza-outline .wp-block-button__link, .wp-block-button.button-type-2 .wp-block-button__link';var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');function decorate(b){if(b.querySelector('.plaza-secondary-sparks'))return;var f=document.createElement('span');f.className='plaza-secondary-sparks';f.setAttribute('aria-hidden','true');for(var i=0;i<14;i++){var star=i%4===1;var p=document.createElement('span');p.className='plaza-secondary-spark'+(star?' star':'');p.style.cssText='--x:'+(5+(i*29)%91)+'%;--y:'+(14+(i*17)%73)+'%;--size:'+(star?(i%2?4.5:3.3):(i%3?1.2:2.2))+'px;--travel:'+(i%2?14:-16)+'px;--escape:'+(i%2?-26:23)+'px;--dur:'+(1.8+(i%4)*.25)+'s;--delay:'+(-i*.19)+'s;';f.appendChild(p)}b.appendChild(f)}function at(e){return e.target instanceof Element?e.target.closest(selector):null}document.querySelectorAll(selector).forEach(decorate);PlazaRuntime.on(document,'pointerover',function(e){var b=at(e);if(b)decorate(b)},{passive:true});PlazaRuntime.on(document,'pointermove',function(e){if(e.pointerType==='touch'||reduced.matches)return;var b=at(e);if(!b)return;var r=b.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));b.style.setProperty('--plaza-gradient-slide',((x-.5)*r.width*.6).toFixed(2)+'px');b.style.setProperty('--secondary-dx',((x-.5)*9)+'px');b.style.setProperty('--secondary-dy',((y-.5)*7)+'px')},{passive:true});PlazaRuntime.on(document,'pointerout',function(e){var b=at(e);if(!b||b.contains(e.relatedTarget))return;b.style.setProperty('--plaza-gradient-slide','0px');b.style.removeProperty('--secondary-dx');b.style.removeProperty('--secondary-dy')},{passive:true});})();
