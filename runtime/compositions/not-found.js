/* Mouse, keyboard and touch share the same caption state. */
(()=>{'use strict';document.querySelectorAll('[data-plaza404-scene]').forEach(button=>{
 const caption=button.querySelector('.plaza404-caption'),original=caption.textContent,alternate='Пусть ошибка страницы не помешает вашей поездке.',fine=matchMedia('(hover:hover) and (pointer:fine)');let pressed=false,hovered=false,focused=false;
 const update=()=>{const active=pressed||hovered||focused;button.classList.toggle('is-alternate',active);button.setAttribute('aria-pressed',String(pressed));caption.textContent=active?alternate:original};
 PlazaRuntime.on(button,'click',()=>{pressed=!pressed;update()});
 PlazaRuntime.on(button,'pointerenter',()=>{hovered=fine.matches;update()});PlazaRuntime.on(button,'pointerleave',()=>{hovered=false;update()});
 PlazaRuntime.on(button,'focus',()=>{focused=button.matches(':focus-visible');update()});PlazaRuntime.on(button,'blur',()=>{focused=false;update()});
});})();
