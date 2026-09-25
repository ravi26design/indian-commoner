/* Indian Commoner — shared site behaviour (nav, search, language) */
document.addEventListener('DOMContentLoaded', function () {
  if (window.lucide) lucide.createIcons();

  // Deterministic per-author avatar colour, purely decorative — computed once
  // from the author name so the same person always gets the same colour
  // wherever their avatar appears across the site.
  var AVATAR_TINTS = [
    'linear-gradient(135deg,#0d9488,#14b8a6)',
    'linear-gradient(135deg,#2563eb,#3b82f6)',
    'linear-gradient(135deg,#7c3aed,#a78bfa)',
    'linear-gradient(135deg,#d97706,#f59e0b)',
    'linear-gradient(135deg,#be185d,#ec4899)',
    'linear-gradient(135deg,#059669,#10b981)'
  ];
  function avatarTint(name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_TINTS[hash % AVATAR_TINTS.length];
  }
  function tintAvatar(av, name) {
    if (!av || !name) return;
    av.style.background = avatarTint(name);
    av.style.color = '#fff';
  }

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

  // Topic page: tint the post author, reply authors, and "Voices in this
  // thread" avatars the same deterministic way as the forum list (moderator
  // shield avatars and the "+N more" chip are left as-is — they're not tied
  // to a real name). Names seen on the post/replies are remembered by their
  // initial so the "Voices" avatar stack — which only shows an initial —
  // still picks up the same colour as that person's full-name avatar above.
  var namesByInitial = {};
  document.querySelectorAll('.post-head .pw-av').forEach(function (av) {
    var nameEl = av.parentElement && av.parentElement.querySelector('b');
    if (!nameEl) return;
    var name = nameEl.textContent;
    namesByInitial[name.charAt(0).toUpperCase()] = name;
    tintAvatar(av, name);
  });
  document.querySelectorAll('.cm-item:not(.hidden-reply) .pw-av').forEach(function (av) {
    var nameEl = av.parentElement && av.parentElement.querySelector('.cm-h b');
    if (!nameEl) return;
    var name = nameEl.textContent;
    namesByInitial[name.charAt(0).toUpperCase()] = name;
    tintAvatar(av, name);
  });
  document.querySelectorAll('.avstack .pw-av').forEach(function (av) {
    var text = av.textContent.trim();
    if (!text || text.indexOf('+') === 0) return;
    tintAvatar(av, namesByInitial[text.toUpperCase()] || text);
  });

  // Forum Members directory: same deterministic per-name colour as everywhere else.
  document.querySelectorAll('.membercard .pw-av').forEach(function (av) {
    var nameEl = av.parentElement && av.parentElement.querySelector('b');
    if (!nameEl) return;
    tintAvatar(av, nameEl.textContent);
  });

  // "Start a Conversation": straight to the composer if already signed in,
  // otherwise to login — landing back on the composer once signed in.
  document.querySelectorAll('#start-convo-link, #forum-new-discussion').forEach(function (startConvo) {
    if (isLoggedIn()) {
      startConvo.href = 'start-conversation.html';
    } else {
      startConvo.href = 'login.html?return=' + encodeURIComponent(new URL('start-conversation.html', location.href).href);
    }
  });

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

  document.querySelectorAll('[data-levelgroup]').forEach(function (group) {
    group.querySelectorAll('.seg-tab').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.seg-tab').forEach(function (o) { o.classList.remove('on'); });
        opt.classList.add('on');

        // Beginner/Intermediate/Advanced sort: cards tagged with the chosen
        // real difficulty level move to the front of the grid (in their
        // original relative order); everything else follows after, still
        // visible — cards with no known real level are never hidden, since
        // we don't want to guess a level for them.
        var level = opt.getAttribute('data-level');
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

  // Discussion forum: Theme/Language pill groups + State/Activity dropdowns +
  // free-text search narrow the thread list; the Recent/Most replies/
  // Unanswered segment re-sorts it. Rows carry their real reply count in
  // data-replies (unset -> 0, i.e. no replies yet) rather than a count
  // invented for rows with no source data. The "Content in thread" checkboxes
  // and Activity dropdown mirror the reference design but aren't backed by
  // any real per-thread data on this prototype, so they don't narrow results
  // — only Theme, Language, State and the search box do.
  var forumList = document.getElementById('forum-list');
  if (forumList) {
    var forumRows = Array.from(forumList.querySelectorAll('.topicrow'));

    forumRows.forEach(function (row) {
      var nameEl = row.querySelector('.tr-meta b');
      var av = row.querySelector('.pw-av');
      if (!nameEl || !av) return;
      tintAvatar(av, nameEl.textContent);
    });
    var forumSearch = document.getElementById('forum-q');
    var forumCount = document.getElementById('forum-count');
    var forumSortSeg = document.querySelector('.seg-tabs[data-fseg]');
    var themeGroup = document.querySelector('.seg-tabs[data-pillgroup="theme"]');
    var langGroup = document.querySelector('.seg-tabs[data-pillgroup="lang"]');
    var stateGroup = document.querySelector('.seg-tabs[data-pillgroup="state"]');
    var activitySel = document.getElementById('fx-activity');
    var otherFilterInputs = document.querySelectorAll('.filterpanel input[type="checkbox"], .filterpanel #fx-activity');
    var forumReset = document.getElementById('forum-reset');
    var forumEmpty = document.getElementById('forum-empty');
    var forumSort = 'recent';

    function pillValue(group) {
      if (!group) return 'all';
      var on = group.querySelector('.seg-tab.on');
      return on ? on.getAttribute('data-v') : 'all';
    }

    function setPill(group, value) {
      if (!group) return;
      group.querySelectorAll('.seg-tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === value); });
    }

    function hasActiveFilters() {
      if (pillValue(themeGroup) !== 'all') return true;
      if (pillValue(langGroup) !== 'all') return true;
      if (pillValue(stateGroup) !== 'all') return true;
      if (activitySel && activitySel.value !== 'any') return true;
      if (forumSearch && forumSearch.value.trim()) return true;
      var translated = document.getElementById('fx-translated');
      if (translated && !translated.checked) return true;
      var boxChecked = Array.from(document.querySelectorAll('.filterpanel input[type="checkbox"]')).some(function (c) {
        return c.id !== 'fx-translated' && c.checked;
      });
      if (boxChecked) return true;
      return false;
    }

    function applyForumFilters() {
      var theme = pillValue(themeGroup);
      var lang = pillValue(langGroup);
      var state = pillValue(stateGroup);
      var q = (forumSearch && forumSearch.value ? forumSearch.value : '').trim().toLowerCase();
      var includeTranslated = document.getElementById('fx-translated');
      // Every real thread here only has an English original. With "include
      // translated threads" on (the default), a language pill still matches
      // everything — the platform serves a translation of each thread in any
      // language. Turning that off narrows strictly to real-language
      // originals, which is honestly just the English ones.
      var langMatchesAll = lang === 'all' || (includeTranslated && includeTranslated.checked);

      var visible = forumRows.filter(function (row) {
        if (theme !== 'all' && row.getAttribute('data-theme') !== theme) return false;
        if (!langMatchesAll && row.getAttribute('data-lang') !== lang) return false;
        if (state !== 'all' && row.getAttribute('data-state') !== state) return false;
        if (q && row.querySelector('h3').textContent.toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      forumRows.forEach(function (row) { row.style.display = 'none'; });

      var sorted = visible.slice();
      if (forumSort === 'replies') {
        sorted.sort(function (a, b) { return (+b.getAttribute('data-replies') || 0) - (+a.getAttribute('data-replies') || 0); });
      } else if (forumSort === 'unanswered') {
        sorted = sorted.filter(function (row) { return (+row.getAttribute('data-replies') || 0) === 0; });
      }
      sorted.forEach(function (row) {
        row.style.display = '';
        forumList.appendChild(row);
      });

      if (forumCount) forumCount.textContent = sorted.length + (sorted.length === 1 ? ' discussion' : ' discussions');
      if (forumReset) forumReset.hidden = !hasActiveFilters();
      if (forumEmpty) forumEmpty.hidden = sorted.length !== 0;
    }

    [themeGroup, langGroup, stateGroup].forEach(function (group) {
      if (!group) return;
      group.querySelectorAll('.seg-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setPill(group, btn.getAttribute('data-v'));
          applyForumFilters();
        });
      });
    });
    otherFilterInputs.forEach(function (el) { el.addEventListener('change', applyForumFilters); });
    if (forumSearch) forumSearch.addEventListener('input', applyForumFilters);

    if (forumSortSeg) {
      forumSortSeg.querySelectorAll('.seg-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          forumSortSeg.querySelectorAll('.seg-tab').forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          forumSort = btn.getAttribute('data-sort');
          applyForumFilters();
        });
      });
    }

    if (forumReset) {
      forumReset.addEventListener('click', function () {
        setPill(themeGroup, 'all');
        setPill(langGroup, 'all');
        setPill(stateGroup, 'all');
        if (activitySel) activitySel.value = 'any';
        document.querySelectorAll('.filterpanel input[type="checkbox"]').forEach(function (c) {
          c.checked = c.id === 'fx-translated';
        });
        if (forumSearch) forumSearch.value = '';
        if (forumSortSeg) {
          forumSortSeg.querySelectorAll('.seg-tab').forEach(function (b) { b.classList.remove('on'); });
          var recentTab = forumSortSeg.querySelector('.seg-tab[data-sort="recent"]');
          if (recentTab) recentTab.classList.add('on');
        }
        forumSort = 'recent';
        applyForumFilters();
      });
    }

    // A pin on the Map Exploration page links here as forum.html?state=<name>,
    // so the matching State pill is pre-selected on arrival.
    var urlState = new URLSearchParams(location.search).get('state');
    if (urlState && stateGroup) {
      var stateMatch = Array.from(stateGroup.querySelectorAll('.seg-tab')).some(function (b) {
        return b.getAttribute('data-v') === urlState;
      });
      if (stateMatch) setPill(stateGroup, urlState);
    }

    // A card on the Themes & sub-themes page links here as
    // forum.html?theme=<name>, so the matching Theme pill is pre-selected.
    var urlTheme = new URLSearchParams(location.search).get('theme');
    if (urlTheme && themeGroup) {
      var themeMatch = Array.from(themeGroup.querySelectorAll('.seg-tab')).some(function (b) {
        return b.getAttribute('data-v') === urlTheme;
      });
      if (themeMatch) setPill(themeGroup, urlTheme);
    }

    applyForumFilters();
  }
});
