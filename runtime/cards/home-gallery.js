/* Thin adapters only: navigation and the viewer remain in the shared PlazaUI. */
PlazaRuntime.on(document,'DOMContentLoaded',() => {
 const host = document.querySelector('[data-home-gallery]');
 if (!host) return;
 const mosaic = host.querySelector('[data-home-gallery-rail]');
 const photos = [...mosaic.children];
 PlazaUI.mountSwipeRail(mosaic, photos, {mobileOnly:true, label:'Фотографии санатория'});
 const dialog = host.querySelector('dialog');
 const track = dialog.querySelector('.wellness-photo-track');
 const images = [...track.querySelectorAll('img')];
 const load = index => {
  const image = images[(index + images.length) % images.length];
  if (image.hasAttribute('src')) return;
  if (!dialog.classList.contains('plaza-gallery-touch') && image.dataset.homePhotoSrcset) image.srcset = image.dataset.homePhotoSrcset;
  image.src = image.dataset.homePhotoSrc;
 };
 const loadAround = index => {load(index); load(index + 1); load(index - 1);};
 /* Capture precedes the existing viewer's button listener and cinema renderer. */
 PlazaRuntime.on(host,'click',event => {
  const button = event.target.closest('[data-photo-index]');
  if (!button) return;
  if (mosaic.dataset.plazaDragged) {event.preventDefault(); event.stopImmediatePropagation(); return;}
  loadAround(Number(button.dataset.photoIndex));
 },true);
 PlazaRuntime.on(track,'scroll',() => {
  if (dialog.open) loadAround(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
 },{passive:true, capture:true});
});
