/* Indian Commoner — shared site behaviour (nav, search, language) */
document.addEventListener('DOMContentLoaded', function () {
  if (window.lucide) lucide.createIcons();

  // Signed-in state persists across pages/reloads until the user explicitly
  // signs out — a plain localStorage flag, since this prototype has no real backend.
  var LOGIN_KEY = 'ic-logged-in';
  function isLoggedIn() {
    try { return localStorage.getItem(LOGIN_KEY) === '1'; } catch (e) { return false; }
  }
  function setLoggedIn(v) {
    try { if (v) localStorage.setItem(LOGIN_KEY, '1'); else localStorage.removeItem(LOGIN_KEY); } catch (e) {}
  }

  if (isLoggedIn()) {
    document.querySelectorAll('a.signin-btn:not(.acctav)').forEach(function (a) {
      a.href = 'member-profile.html';
      a.title = 'My Profile';
      a.classList.add('acctav');
      a.style.cssText += 'width:2.5rem;height:2.5rem;border-radius:50%;padding:0;display:grid;place-items:center;font-weight:800';
      a.textContent = 'PS';

      var group = document.createElement('div');
      group.className = 'navgroup acctgroup';
      a.parentNode.insertBefore(group, a);
      group.appendChild(a);
      var drop = document.createElement('div');
      drop.className = 'navdrop dd-right';
      drop.innerHTML = '<div class="navdrop-in">' +
        '<a href="member-profile.html"><span class="nd-ic"><i data-lucide="user"></i></span><span class="nd-tx"><b>My Profile</b><small>Your account details and preferences</small></span></a>' +
        '<a href="#"><span class="nd-ic"><i data-lucide="file-text"></i></span><span class="nd-tx"><b>My Contributions</b><small>Content you\'ve added to the forum</small></span></a>' +
        '<a href="#"><span class="nd-ic"><i data-lucide="check-circle"></i></span><span class="nd-tx"><b>Approvals</b><small>Items waiting on your review</small></span></a>' +
        '<a href="users-roles.html"><span class="nd-ic"><i data-lucide="users-round"></i></span><span class="nd-tx"><b>Users &amp; Roles</b><small>Manage member permissions</small></span></a>' +
        '<a href="change-password.html"><span class="nd-ic"><i data-lucide="key-round"></i></span><span class="nd-tx"><b>Change Password</b><small>Update your login credentials</small></span></a>' +
        '<a id="signout-link-nav" href="index.html"><span class="nd-ic"><i data-lucide="log-out"></i></span><span class="nd-tx"><b>Sign out</b></span></a>' +
        '</div>';
      group.appendChild(drop);
    });
    document.querySelectorAll('#mobnav a[href="login.html"]').forEach(function (a) {
      a.href = 'member-profile.html';
      a.innerHTML = '<i data-lucide="user"></i> My Profile';
    });
    if (window.lucide) lucide.createIcons();
  }

  // Every remaining link to login.html carries the current page as a return-to
  // param, so signing in lands the user back where they started (more reliable
  // than document.referrer, which browsers can drop or which changes across hops).
  if (!/\/(login|register)\.html$/.test(location.pathname)) {
    var returnUrl = location.href;
    document.querySelectorAll('a[href="login.html"]').forEach(function (a) {
      a.href = 'login.html?return=' + encodeURIComponent(returnUrl);
    });
  }

  var signinBtn = document.getElementById('lg-signin');
  if (signinBtn) {
    var ret = new URLSearchParams(location.search).get('return');
    if (ret && ret.indexOf(location.origin) === 0 && !/\/(login|register)\.html([?#].*)?$/.test(ret)) {
      signinBtn.href = ret;
    } else {
      var ref = document.referrer;
      if (ref && ref.indexOf(location.origin) === 0 && !/\/(login|register)\.html([?#].*)?$/.test(ref)) {
        signinBtn.href = ref;
      }
    }
    signinBtn.addEventListener('click', function () { setLoggedIn(true); });
  }

  var signupBtn = document.getElementById('rg-signup');
  if (signupBtn) signupBtn.addEventListener('click', function () { setLoggedIn(true); });

  document.querySelectorAll('#signout-link, #signout-link-nav').forEach(function (link) {
    link.addEventListener('click', function () { setLoggedIn(false); });
  });

  document.querySelectorAll('.fp-more').forEach(function (btn) {
    var group = btn.previousElementSibling;
    if (!group || !group.classList.contains('fp-more-group')) return;
    btn.addEventListener('click', function () {
      var open = group.hidden;
      group.hidden = !open;
      btn.textContent = open ? 'Show less' : btn.dataset.label;
    });
    btn.dataset.label = btn.textContent;
  });

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

        // Beginner/Intermediate/Advanced sort: cards tagged with the chosen
        // real difficulty level move to the front of the grid (in their
        // original relative order); everything else follows after, still
        // visible — cards with no known real level are never hidden, since
        // we don't want to guess a level for them.
        var level = opt.textContent.trim().toLowerCase();
        if (['beginner', 'intermediate', 'advanced'].indexOf(level) === -1) return;
        document.querySelectorAll('.grid').forEach(function (grid) {
          var cards = Array.from(grid.querySelectorAll(':scope > a, :scope > article'));
          if (!cards.some(function (c) { return c.hasAttribute('data-level'); })) return;
          cards
            .slice()
            .sort(function (a, b) {
              var aMatch = a.getAttribute('data-level') === level ? 0 : 1;
              var bMatch = b.getAttribute('data-level') === level ? 0 : 1;
              return aMatch - bMatch;
            })
            .forEach(function (card) { grid.appendChild(card); });
        });
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

  // YouTube video cards: play inline on click instead of leaving the site
  document.querySelectorAll('a.v-frame').forEach(function (frame) {
    var href = frame.getAttribute('href') || '';
    var m = href.match(/[?&]v=([\w-]+)/);
    if (!m) return;
    var videoId = m[1];
    frame.addEventListener('click', function (e) {
      e.preventDefault();
      if (frame.querySelector('iframe')) return;
      var title = frame.querySelector('img') ? frame.querySelector('img').alt : 'YouTube video player';
      frame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" ' +
        'title="' + title.replace(/"/g, '&quot;') + '" frameborder="0" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'allowfullscreen></iframe>';
    });
  });

  // Laws & Regulations sidebar: Region/Subject/Type checkboxes filter the
  // card grid. Checked boxes within a category are OR'd together; the
  // categories themselves are AND'd (a card must match at least one checked
  // box in every category that has any box checked).
  var lawGrid = document.querySelector('.lawgrid');
  if (lawGrid) {
    var lawCards = Array.from(lawGrid.querySelectorAll('.lawcard'));
    var filterCats = Array.from(document.querySelectorAll('.fp-cat[data-cat]'));

    function applyLawFilters() {
      var active = filterCats.map(function (cat) {
        var checked = Array.from(cat.querySelectorAll('input[type="checkbox"]:checked')).map(function (c) { return c.value; });
        return { key: cat.getAttribute('data-cat'), values: checked };
      }).filter(function (c) { return c.values.length; });

      lawCards.forEach(function (card) {
        var visible = active.every(function (c) {
          var cardValue = card.getAttribute('data-' + c.key);
          return cardValue && c.values.indexOf(cardValue) !== -1;
        });
        card.style.display = visible ? '' : 'none';
      });
    }

    document.querySelectorAll('.fp-cat input[type="checkbox"]').forEach(function (box) {
      box.addEventListener('change', applyLawFilters);
    });
  }
});
