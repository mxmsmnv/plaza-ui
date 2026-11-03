/* Property candidate adapter; values and animation logic belong to reveal.js. */
window.PlazaRevealEngine.mount({bodySelector:'body.plaza-scroll-motion',footerTriggerSelector:'',collect:function({select,addGroup,singleton,contentChildren,collectBooking}){
var facts = document.querySelector('main .facts');
    addGroup(facts, contentChildren(facts), 'soft', 100);

    singleton('#programs .section-heading, #rooms .section-heading, #experience .section-heading, #first-visit .section-heading', 'heading');
    select('#programs .swipe-rail, #experience .swipe-rail').forEach(function (rail) {
      addGroup(rail, select('article.card', rail), 'card', 100);
    });
    singleton('#programs .section-note', 'soft');
    singleton('#medicine .feature-photo', 'photo');
    singleton('#medicine .feature-copy', 'pairedCopy');
    var rooms = document.querySelector('#rooms .room-groups');
    addGroup(rooms, select('#rooms .room-group-card'), 'card', 120);

    select('main .included-grid').forEach(function (grid) {
      var children = contentChildren(grid);
      var introduction = children.find(function (child) { return !child.classList.contains('inclusions'); });
      addGroup(introduction, introduction ? [introduction] : [], 'copy', 0);
      var inclusions = grid.querySelector('.inclusions');
      // The check-mark scroll effect owns these rows; keep their text visible.
      addGroup(inclusions, contentChildren(inclusions).filter(function(row){return !row.querySelector('.check');}), 'row', 95);
    });

    var visits = document.querySelector('#first-visit .visit-grid');
    addGroup(visits, select('#first-visit .visit-grid article'), 'soft', 110);
    select('main .trust-panel').forEach(function (panel) {
      addGroup(panel, contentChildren(panel), 'copy', 120);
    });

    var faq = document.querySelector('#faq');
    contentChildren(faq).forEach(function (child) {
      if (!child.classList.contains('faq-list')) addGroup(child, [child], 'opacity', 0);
    });
    var faqList = document.querySelector('#faq .faq-list');
    addGroup(faqList, select('#faq .faq-list details'), 'row', 60);

    if(typeof collectBooking==='function')collectBooking();

    var footerTop = document.querySelector('#contacts .footer-top');
    var footerColumns = contentChildren(footerTop);
    footerColumns.forEach(function (column) {
      if (column.classList.contains('footer-contact')) {
        addGroup(column, contentChildren(column).filter(function (child) {
          return !child.classList.contains('social-links');
        }), 'soft', 80);
      } else addGroup(column, [column], 'copy', 0);
    });
    select('#contacts .social-links').forEach(function (socials) {
      addGroup(socials, Array.from(socials.children).filter(function (child) { return child.tagName === 'A'; }), 'social', 65);
    });
    var footerNav = document.querySelector('#contacts .footer-nav');
    addGroup(footerNav, select('#contacts .footer-nav-group'), 'soft', 85);
    singleton('[data-plaza-footer-meta=stable]', 'opacity');
}});
