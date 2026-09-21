/* Indian Commoner — shared site behaviour (nav, search, language) */
document.addEventListener('DOMContentLoaded', function () {
  if (window.lucide) lucide.createIcons();

  var navToggle = document.querySelector('.navtoggle');
  var mobnav = document.getElementById('mobnav');
  if (navToggle && mobnav) {
    navToggle.addEventListener('click', function () {
      mobnav.classList.toggle('open');
    });
  }

  var langBtn = document.querySelector('.langbtn');
  var langw = document.getElementById('langw');
  if (langBtn && langw) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      langw.classList.toggle('open');
    });
    document.addEventListener('click', function () { langw.classList.remove('open'); });
  }

  document.querySelectorAll('.dd').forEach(function (dd) {
    var ddBtn = dd.querySelector('.dd-btn');
    var ddLabel = dd.querySelector('.dd-btn .lf');
    if (!ddBtn) return;
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !dd.classList.contains('open');
      document.querySelectorAll('.dd.open').forEach(function (o) { o.classList.remove('open'); });
      dd.classList.toggle('open', willOpen);
    });
    dd.querySelectorAll('.dd-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        dd.querySelectorAll('.dd-opt').forEach(function (o) { o.classList.remove('on'); });
        opt.classList.add('on');
        if (ddLabel) ddLabel.innerHTML = opt.innerHTML;
        dd.classList.remove('open');
      });
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.dd.open').forEach(function (dd) { dd.classList.remove('open'); });
  });

  var searchIcon = document.querySelector('.nav-ic[data-search]');
  var navsearch = document.getElementById('navsearch');
  var searchClose = document.querySelector('.ns-x');
  if (searchIcon && navsearch) {
    searchIcon.addEventListener('click', function () {
      navsearch.classList.add('open');
      var input = document.getElementById('ns-input');
      if (input) input.focus();
    });
  }
  if (searchClose && navsearch) {
    searchClose.addEventListener('click', function () { navsearch.classList.remove('open'); });
  }

  // Preference toggles (Preferences panel, etc.)
  document.querySelectorAll('.switch').forEach(function (sw) {
    sw.addEventListener('click', function () { sw.classList.toggle('on'); });
  });

  // Generic modal open/close: [data-open-modal="id"] shows #id, [data-close-modal] hides its .modal-back
  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = document.getElementById(btn.getAttribute('data-open-modal'));
      if (modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('.modal-back').forEach(function (back) {
    back.addEventListener('click', function (e) {
      if (e.target === back || e.target.closest('[data-close-modal]')) back.classList.remove('open');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-back.open').forEach(function (back) { back.classList.remove('open'); });
    }
  });

  // Tab pills with a switchable panel target, e.g. Users / Roles
  document.querySelectorAll('[data-tab-group]').forEach(function (group) {
    var btns = group.querySelectorAll('[data-tab]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var targetId = group.getAttribute('data-tab-group');
        document.querySelectorAll('[data-tab-panel="' + targetId + '"]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel-for') !== btn.getAttribute('data-tab');
        });
      });
    });
  });
});
