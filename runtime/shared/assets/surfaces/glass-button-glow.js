/* One border trace for glass actions. Never intercept clicks or change gallery state. */
(() => {
  'use strict';
  if (window.PlazaGlassGlow) return;
  const selector = '.plaza-glass-button, .wellness-photo-gallery .wellness-photo-all';
  const mounted = new WeakSet(), items = new WeakMap();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
    for (const entry of entries) size(entry.target);
  }) : null;
  function size(button) {
    const item = items.get(button); if (!item) return;
    const style = getComputedStyle(button), offset = parseFloat(style.getPropertyValue('--plaza-glow-offset')) || 100;
    const width = parseFloat(style.width), height = parseFloat(style.height);
    const borderBox = style.boxSizing === 'border-box';
    const w = borderBox ? width : button.offsetWidth, h = borderBox ? height : button.offsetHeight;
    const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, w / 2, h / 2);
    for (const rect of item.rects) {
      rect.setAttribute('x', offset / 2); rect.setAttribute('y', offset / 2);
      rect.setAttribute('width', w); rect.setAttribute('height', h); rect.setAttribute('rx', radius);
    }
  }
  function mount(root = document) {
    const buttons = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) buttons.unshift(root);
    for (const button of buttons) {
      if (mounted.has(button)) continue;
      mounted.add(button);
      const label = document.createElement('span'); label.className = 'plaza-glow-label';
      while (button.firstChild) label.append(button.firstChild);
      button.append(label);
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'plaza-glow-container');svg.setAttribute('aria-hidden', 'true');svg.setAttribute('focusable', 'false');
      const rects = ['plaza-glow-blur', 'plaza-glow-line'].map(name => {
        const rect = document.createElementNS(ns, 'rect');rect.setAttribute('class', name);rect.setAttribute('pathLength', '100');svg.append(rect);return rect;
      });
      button.append(svg);items.set(button, {svg,rects});size(button);resize?.observe(button);
      function run() {
        if (reduced.matches || button.disabled || svg.classList.contains('plaza-glow-running')) return;
        size(button);svg.classList.add('plaza-glow-running');
      }
      PlazaRuntime.on(button,'pointerenter',event => {if (event.pointerType === 'mouse') run();});
      PlazaRuntime.on(button,'pointerdown',event => {if (event.pointerType !== 'mouse') run();});
      PlazaRuntime.on(button,'focus',() => {if (button.matches(':focus-visible')) run();});
      PlazaRuntime.on(svg,'animationend',event => {if (event.target === svg) svg.classList.remove('plaza-glow-running');});
      PlazaRuntime.on(reduced,'change',() => {if (reduced.matches) svg.classList.remove('plaza-glow-running');});
    }
  }
  window.PlazaGlassGlow = {mount};
  if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',() => mount(),{once:true});else mount();
})();
