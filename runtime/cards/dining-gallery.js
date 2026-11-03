/* This page returns to the photograph last viewed in the shared gallery. */
PlazaRuntime.on(document,'DOMContentLoaded',() => {
  const host = document.querySelector('.plaza-dining-gallery[data-room-gallery]');
  const dialog = host?.querySelector('dialog');
  const rail = dialog?.querySelector('.wellness-photo-track');
  if (!host || !dialog || !rail) return;

  let currentIndex = 0;
  const rememberPhoto = () => {
    if (!dialog.open || !rail.clientWidth) return;
    const index = Math.round(rail.scrollLeft / rail.clientWidth);
    if (index >= 0 && index < rail.children.length) currentIndex = index;
  };

  PlazaRuntime.on(host,'click',(event) => {
    const photo = event.target.closest('[data-photo-index]');
    if (photo && !dialog.open) currentIndex = Number(photo.dataset.photoIndex);
  },true);
  PlazaRuntime.on(rail,'scroll',rememberPhoto,{passive: true});
  PlazaRuntime.on(dialog,'cancel',rememberPhoto);
  PlazaRuntime.on(dialog,'click',(event) => {
    if (event.target === dialog || event.target.closest('[data-photo-close]')) rememberPhoto();
  },true);
  PlazaRuntime.on(dialog,'close',() => {
    const photo = host.querySelector(`[data-photo-index="${currentIndex}"]`);
    if (!photo) return;
    photo.scrollIntoView({behavior: 'instant', block: 'center'});
    photo.focus({preventScroll: true});
  });
});
