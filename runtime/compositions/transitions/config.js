/* Preview routing/config only. Production transition controller unchanged. */
(() => {
  'use strict';
  const directory = new URL('.', location.href).pathname;
  const theme = new URL(location.href).searchParams.get('theme');
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  const config = {
    profile: 'kislovodsk', basePath: directory, effect: 'stack',
    durationMs: 1500, easing: 'cubic-bezier(.42,0,.18,1)',
    routes: [{basePath: directory, enabled: true}]
  };
  const node = document.createElement('script');
  node.type = 'application/json'; node.id = 'plaza-page-transition-config';
  node.textContent = JSON.stringify(config); document.head.append(node);
})();
