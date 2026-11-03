/* Print the current gallery treatment; the site theme and stored preference stay untouched. */
(() => {
    'use strict';
    const booklet = document.getElementById('plaza-psk-gallery-print');
    if (!booklet) return;
    const preview = document.body.classList.contains('plaza-gallery-print-preview');
    const story = document.querySelector('[data-pg-story]');
    const status = booklet.querySelector('[data-pg-print-status]');
    const groups = new Map(Array.from(booklet.querySelectorAll('[data-pg-print-pages]'), group => [group.dataset.pgPrintPages, group]));
    const promises = new Map();
    const ready = new Map();
    let printing = false;
    const normalize = mode => mode === 'watercolor' ? 'watercolor' : 'photo';

    function currentEdition() {
        if (preview) return normalize(booklet.dataset.pgPrintEdition);
        const paint = window.PlazaGalleryPaint;
        if (paint && typeof paint.getEdition === 'function') return normalize(paint.getEdition());
        return normalize(story?.dataset.pgEdition || (document.body.classList.contains('plaza-gallery-watercolor') ? 'watercolor' : 'photo'));
    }

    function select(mode) {
        mode = normalize(mode);
        booklet.dataset.pgPrintEdition = mode;
        booklet.dataset.pgPrintReady = ready.get(mode) === true ? 'true' : 'false';
        groups.forEach((group, key) => group.setAttribute('aria-hidden', String(key !== mode)));
        return mode;
    }

    function load(mode) {
        mode = normalize(mode);
        if (promises.has(mode)) return promises.get(mode);
        const images = Array.from(groups.get(mode)?.querySelectorAll('.pg-print-page img') || []);
        const promise = Promise.all(images.map(image => new Promise(resolve => {
            const finish = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
            const source = image.dataset.pgPrintSrc;
            if (!source && image.complete) finish();
            else {
                PlazaRuntime.on(image,'load',finish,{once:true});
                PlazaRuntime.on(image,'error',finish,{once:true});
                if (source) {
                    image.src = source;
                    delete image.dataset.pgPrintSrc;
                    if (image.complete) finish();
                }
            }
        }))).then(results => {
            const complete = results.length === 12 && results.every(Boolean);
            ready.set(mode, complete);
            if (booklet.dataset.pgPrintEdition === mode) {
                booklet.dataset.pgPrintReady = String(complete);
                if (status) status.textContent = complete
                    ? '12 страниц A4 · дневная версия. Печать — Ctrl+P или команда браузера. Колонтитулы браузера лучше отключить.'
                    : 'Не удалось загрузить все страницы буклета. Обновите страницу перед печатью.';
            }
            return complete;
        });
        promises.set(mode, promise);
        return promise;
    }

    async function printCurrent() {
        if (printing) return;
        printing = true;
        try {
            let mode;
            do {
                mode = select(currentEdition());
                if (!await load(mode)) {
                    window.alert('Не удалось загрузить все страницы буклета. Обновите галерею и повторите печать.');
                    return;
                }
            } while (mode !== currentEdition());
            select(mode);
            window.print();
        } finally {
            printing = false;
        }
    }

    // The gallery controller awaits this before committing a new treatment.
    // Inactive booklet URLs stay in inert data attributes without media requests.
    window.PlazaGalleryPrint = Object.freeze({prepareEdition: mode => (preview || printing) ? load(mode) : Promise.resolve(true)});
    const initial = select(currentEdition());
    if (preview) load(initial);
    PlazaRuntime.on(document,'pg:editionchange',event => {
        const mode = select(event.detail?.edition || currentEdition());
        if (preview || printing) load(mode);
    });
    PlazaRuntime.on(window,'beforeprint',() => {
        const mode = select(currentEdition());
        load(mode);
    });
    PlazaRuntime.on(document,'keydown',event => {
        if ((event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === 'p' && !event.altKey) {
            event.preventDefault();
            printCurrent();
        }
    });
})();
