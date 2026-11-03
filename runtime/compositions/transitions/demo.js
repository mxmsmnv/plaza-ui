/* Controlled local navigation/status only; no replacement transition animation. */
(() => {
  'use strict';
  const pair = new Set(['one.html', 'two.html']);
  const directory = new URL('.', location.href);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const status = document.querySelector('.transition-demo-status');
  const notify = () => {
    const supported = Boolean(window.PlazaPageTransition);
    const state = document.documentElement.dataset.plazaDocumentLastState || 'idle';
    if (reduced.matches) status.textContent = 'Движение отключено вашей настройкой уменьшения анимации. Переход остаётся обычным.';
    else if (!supported) status.textContent = 'Этот браузер не поддерживает нужный View Transitions API. Страницы откроются без анимации.';
    else if (state === 'finished') status.textContent = 'Исходный переход PLAZA завершён: 1500 мс, Card stack.';
    else if (state === 'running') status.textContent = 'Выполняется исходный переход PLAZA…';
    else status.textContent = 'Нажмите кнопку для перехода. Поддержка API есть; выполнение анимации зависит от браузера и режима iframe.';
    parent.postMessage({plazaPreview: true, component_id: 'page-transition', ready: true,
      height: 850, supported, state, effect: window.PlazaPageTransition?.effect || null}, '*');
  };
  const updateTheme = theme => {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    document.querySelectorAll('[data-demo-navigation],[data-demo-top]').forEach(a => {
      const url = new URL(a.getAttribute('href'), location.href);
      url.searchParams.set('theme', document.documentElement.dataset.theme); a.href = url.href;
    });
  };
  updateTheme(document.documentElement.dataset.theme);
  PlazaRuntime.on(document,'submit',event => event.preventDefault(),true);
  PlazaRuntime.on(document,'click',event => {
    const link = event.target.closest('a[href]'); if (!link) return;
    const url = new URL(link.href, location.href);
    const filename = url.pathname.slice(directory.pathname.length);
    if (link.hasAttribute('data-demo-top') && url.origin === location.origin && pair.has(filename)) return;
    if (link.hasAttribute('data-demo-navigation') && url.origin === location.origin && pair.has(filename)) return;
    event.preventDefault();
    status.textContent = 'Ссылка показана как часть настоящей карточки; внешний сайт из примера не открывается.';
  },true);
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {attributes:true,attributeFilter:['data-plaza-document-last-state']});
  PlazaRuntime.on(window,'pagereveal',() => PlazaMotion.frame(notify));
  PlazaRuntime.on(reduced,'change',notify);
  PlazaRuntime.on(window,'message',event => {
    if (event.source !== parent) return;
    const data = event.data || {};
    if (data.plazaPreviewCommand === 'theme' || data.plazaPreviewCommand === 'set-theme') {
      updateTheme(data.theme); notify();
    }
  });
  notify();
})();
