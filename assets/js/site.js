/* Indian Commoner — shared site behaviour (nav, search, language) */
document.addEventListener('DOMContentLoaded', function () {
  if (window.lucide) lucide.createIcons();

  // Deterministic per-author avatar colour, purely decorative — computed once
  // from the author name so the same person always gets the same colour
  // wherever their avatar appears across the site.
  var AVATAR_TINTS = [
    'linear-gradient(135deg,#01796f,#2a9d8f)',
    'linear-gradient(135deg,#8f8440,#a89c50)',
    'linear-gradient(135deg,#015c54,#1f8b80)',
    'linear-gradient(135deg,#6f6620,#8f8440)',
    'linear-gradient(135deg,#4f8570,#6ba58f)',
    'linear-gradient(135deg,#7d6f4a,#a08d6b)'
  ];
  function avatarTint(name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_TINTS[hash % AVATAR_TINTS.length];
  }
  window.icAvatarTint = avatarTint;

  // Exact post date and time for every thread that has one (data-ts), e.g. "30 Oct 2026, 10:42 PM".
  document.querySelectorAll('.topicrow[data-ts]').forEach(function (row) {
    var spans = row.querySelectorAll('.tr-meta > span');
    var last = spans[spans.length - 1];
    if (!last || last.classList.contains('tr-loc') || last.classList.contains('tag')) return;
    last.title = last.textContent.trim();          // the old "2 weeks ago" stays as a tooltip
    last.classList.add('tr-when');
    last.innerHTML = '<i data-lucide="clock" style="width:.75rem;height:.75rem;vertical-align:-1px"></i> ' + window.icDateTime(row.getAttribute('data-ts'));
  });
  if (window.lucide) lucide.createIcons();

  // Thread lists: the poster's name sits right beside their avatar / profile photo (above the tags and title),
  // instead of a "by <name>" at the end of the row.
  document.querySelectorAll('.topicrow').forEach(function (row) {
    var tx = row.querySelector('.tr-tx'), meta = row.querySelector('.tr-meta');
    var nameEl = meta && meta.querySelector('b');
    if (!tx || !nameEl || row.querySelector('.tr-who')) return;
    var who = document.createElement('div');
    who.className = 'tr-who';
    who.innerHTML = '<b></b>';
    var full = nameEl.textContent.trim();
    who.setAttribute('data-name', full);                // keeps the avatar colour tied to the real name
    // Username style: "Priya Sharma" -> "@priya_sharma" ("Anonymous" stays as it is).
    var handle = full.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    who.firstChild.textContent = (full === 'Anonymous' || !handle) ? full : '@' + handle;
    who.title = full;
    tx.insertBefore(who, tx.firstChild);
    var byEl = nameEl.parentNode;                       // <span>by <b>Name</b></span>
    var sep = byEl.nextElementSibling;                  // the "·" that followed it
    if (sep && sep.textContent.trim() === '·') sep.remove();
    byEl.remove();
  });
  function tintAvatar(av, name) {
    if (!av || !name) return;
    av.style.background = avatarTint(name);
    av.style.color = '#fff';
  }

  // No member has a real uploaded cover photo in this prototype, so each
  // Members Directory card and profile cover gets one of 15 banner
  // illustrations. The pick is derived from the member's name — it looks
  // random across the list, but a member's card and their own profile page
  // always show the same banner (and it doesn't change on every reload).
  var BANNER_COUNT = 15;
  function bannerFor(name, small) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 37 + name.charCodeAt(i)) >>> 0;
    var n = (hash % BANNER_COUNT) + 1;
    // Directory cards are small, so they use a lighter copy; profile covers use the full-size one.
    return 'assets/img/banners/' + (small ? 'card/' : '') + 'banner-' + (n < 10 ? '0' : '') + n + '.jpg';
  }
  window.icBannerFor = bannerFor;
  document.querySelectorAll('.mc-cover, .mp-cover').forEach(function (cover) {
    // My Profile lets its owner pick their own cover (#mp-edit-cover); don't overwrite a saved choice.
    if (document.getElementById('mp-edit-cover') && cover.classList.contains('mp-cover') && localStorage.getItem('ic_cover')) return;
    var card = cover.closest('.membercard');
    var nameEl = card ? card.querySelector('.mc-name') : document.getElementById('mp-name');
    var name = nameEl ? nameEl.textContent.trim() : '';
    if (!name) return;
    cover.style.backgroundImage = 'url(' + bannerFor(name, cover.classList.contains('mc-cover')) + ')';
  });

  // No member has a real uploaded profile photo in this prototype, so the
  // Members Directory grid and profile page fall back to a name-based
  // placeholder avatar — first initial on the same deterministic colour
  // used for every other avatar on the site — instead of a generic icon.
  // A plain data-avatar-name attribute (used by the demo "Friends" list on
  // the profile page) overrides the membercard/#mp-name lookup, since those
  // avatars aren't tied to either.
  document.querySelectorAll('.mc-avatar, .mp-avatar, [data-avatar-name]').forEach(function (av) {
    var card = av.closest('.membercard');
    var name = av.hasAttribute('data-avatar-name')
      ? av.getAttribute('data-avatar-name')
      : (card ? (card.querySelector('.mc-name') || {}).textContent : (document.getElementById('mp-name') || {}).textContent);
    name = (name || '').trim();
    if (!name) return;
    av.textContent = name.charAt(0).toUpperCase();
    tintAvatar(av, name);
    // A member's photo (the signed-in member's own upload, or one mapped by name) replaces the initial.
    if (window.icApplyMemberPhoto && (av.classList.contains('mc-avatar') || (av.classList.contains('mp-avatar') && av.id !== 'mp-initial'))) window.icApplyMemberPhoto(av, name);
  });
  // The member's own profile avatar shows their uploaded photo when they have one.
  var ownAv = document.getElementById('mp-initial');
  if (ownAv && window.icPhoto && window.icPhoto()) window.icFillAvatar(ownAv, 'You');

  // Signed-in state persists across pages/reloads until the user explicitly
  // signs out — a plain localStorage flag, since this prototype has no real backend.
  var LOGIN_KEY = 'ic-logged-in';
  function isLoggedIn() {
    try { return localStorage.getItem(LOGIN_KEY) === '1'; } catch (e) { return false; }
  }
  function setLoggedIn(v) {
    try { if (v) localStorage.setItem(LOGIN_KEY, '1'); else localStorage.removeItem(LOGIN_KEY); } catch (e) {}
  }

  function currentRole() { try { return localStorage.getItem('ic-role') || ''; } catch (e) { return ''; } }
  // Moderators get a link to the resource moderation queue, with a count of what's waiting.
  // Switched off for now: the account-menu shortcut to the Moderation queue (page and queue still work).
  var SHOW_MOD_LINK = false;
  var modLink = '';
  if (SHOW_MOD_LINK && isLoggedIn() && currentRole() === 'Moderator') {
    var pending = 0;
    try { pending = JSON.parse(localStorage.getItem('ic_resource_submissions') || '[]').filter(function (i) { return i.status === 'pending'; }).length; } catch (e) {}
    modLink = '<a href="moderation.html"><span class="nd-ic"><i data-lucide="shield-check"></i></span><span class="nd-tx"><b>Moderation queue' +
      (pending ? ' <span class="mod-n">' + pending + '</span>' : '') + '</b><small>Review submitted resources</small></span></a>';
  }

  if (isLoggedIn()) {
    document.querySelectorAll('a.signin-btn:not(.acctav)').forEach(function (a) {
      a.href = 'member-profile.html';
      a.title = 'My Profile';
      a.classList.add('acctav');
      a.style.cssText += 'width:2.5rem;height:2.5rem;border-radius:50%;padding:0;display:grid;place-items:center;font-weight:800';
      if (window.icFillAvatar) window.icFillAvatar(a, 'You'); else a.textContent = 'PS';

      var group = document.createElement('div');
      group.className = 'navgroup acctgroup';
      a.parentNode.insertBefore(group, a);
      group.appendChild(a);
      var drop = document.createElement('div');
      drop.className = 'navdrop dd-right';
      drop.innerHTML = '<div class="navdrop-in">' +
        '<a href="member-profile.html"><span class="nd-ic"><i data-lucide="user"></i></span><span class="nd-tx"><b>My Profile</b><small>Your account details and preferences</small></span></a>' +
        modLink +
        '<a href="change-password.html"><span class="nd-ic"><i data-lucide="key-round"></i></span><span class="nd-tx"><b>Change Password</b><small>Update your login credentials</small></span></a>' +
        '<a id="signout-link-nav" href="index.html"><span class="nd-ic"><i data-lucide="log-out"></i></span><span class="nd-tx"><b>Sign out</b></span></a>' +
        '</div>';
      group.appendChild(drop);
    });
    document.querySelectorAll('#mobnav a[href="login.html"]').forEach(function (a) {
      a.href = 'member-profile.html';
      a.innerHTML = '<i data-lucide="user"></i> My Profile';
      if (modLink) a.insertAdjacentHTML('afterend', '<a href="moderation.html"><i data-lucide="shield-check"></i> Moderation queue</a>');
    });
    if (window.lucide) lucide.createIcons();
  }

  // My Profile: show the role the user signed in with.
  var roleChip = document.querySelector('#mp-name ~ .mp-status');
  if (roleChip && document.title.indexOf('My Profile') === 0) {
    try { var r = localStorage.getItem('ic-role'); if (r && isLoggedIn()) roleChip.textContent = r; } catch (e) {}
  }


  // ---- Forum Members: Add Friend -> "Request Sent" (click again to cancel) ----
  // Prototype-only state in localStorage: ic_friends (already friends) and
  // ic_friend_requests (requests this user has sent).
  (function () {
    var cards = document.querySelectorAll('.membercard');
    if (!cards.length) return;
    function read(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } }
    function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function paint(btn, name) {
      var friend = read('ic_friends').indexOf(name) !== -1, sent = read('ic_friend_requests').indexOf(name) !== -1;
      btn.classList.remove('btn-primary', 'btn-outline', 'sent');
      btn.disabled = false; btn.removeAttribute('title');
      if (friend) {
        btn.classList.add('btn-outline'); btn.innerHTML = '<i data-lucide="check"></i> Friends';
        btn.title = name + ' is already your friend'; btn.setAttribute('data-state', 'friend');
      } else if (sent) {
        btn.classList.add('sent'); btn.innerHTML = '<i data-lucide="check"></i> Request Sent';
        btn.title = 'Click to cancel your request'; btn.setAttribute('data-state', 'sent');
      } else {
        btn.classList.add('btn-primary'); btn.innerHTML = '<i data-lucide="user-plus"></i> Add Friend';
        btn.setAttribute('data-state', 'add');
      }
      btn.setAttribute('aria-pressed', sent ? 'true' : 'false');
      if (window.lucide) lucide.createIcons();
    }
    cards.forEach(function (card) {
      var btn = card.querySelector('.mc-actions .btn:first-child');
      var nameEl = card.querySelector('.mc-name');
      if (!btn || !nameEl) return;
      var name = nameEl.textContent.trim();
      paint(btn, name);
      btn.addEventListener('click', function () {
        if (!isLoggedIn()) { location.href = 'login.html?return=' + encodeURIComponent(location.href); return; }
        var state = btn.getAttribute('data-state');
        if (state === 'friend') return;
        var reqs = read('ic_friend_requests'), i = reqs.indexOf(name);
        if (state === 'sent') { if (i !== -1) reqs.splice(i, 1); }
        else if (i === -1) reqs.push(name);
        write('ic_friend_requests', reqs);
        paint(btn, name);
      });
    });
    // Coming back from a profile (back button) after sending or cancelling there.
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      cards.forEach(function (card) {
        var btn = card.querySelector('.mc-actions .btn:first-child'), n = card.querySelector('.mc-name');
        if (btn && n) paint(btn, n.textContent.trim());
      });
    });
  })();

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
    signinBtn.addEventListener('click', function () {
      setLoggedIn(true);
      // The role picked on the login form decides what the signed-in user can do
      // (e.g. "Resources" can upload on the Resources pages). Display-only: no real auth.
      var roleSel = document.getElementById('lg-role');
      try { localStorage.setItem('ic-role', roleSel ? roleSel.value : 'Registered User'); } catch (e) {}
      if (roleSel && roleSel.value === 'Moderator' && !new URLSearchParams(location.search).get('return')) signinBtn.href = 'moderation.html';
    });
  }

  var signupBtn = document.getElementById('rg-signup');
  if (signupBtn) signupBtn.addEventListener('click', function () {
    setLoggedIn(true);
    try { localStorage.setItem('ic-role', 'Registered User'); } catch (e) {}
  });

  document.querySelectorAll('#signout-link, #signout-link-nav').forEach(function (link) {
    link.addEventListener('click', function () {
      setLoggedIn(false);
      try { localStorage.removeItem('ic-role'); } catch (e) {}
    });
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

    // Language selection: mark the choice, update the button code, and
    // remember it across pages. (Content stays English for now — this wires
    // up the selector UI so the chosen language persists site-wide.)
    var LANG_CODES = { 'English': 'EN', 'हिन्दी': 'हि', 'ಕನ್ನಡ': 'ಕ', 'తెలుగు': 'తె' };
    var langOpts = langw.querySelectorAll('.lang-opt');
    function setLangLabel(code) {
      // Keep the chevron icon; only swap the leading text node.
      var node = langBtn.firstChild;
      if (node && node.nodeType === 3) { node.nodeValue = code + ' '; }
      else { langBtn.insertBefore(document.createTextNode(code + ' '), langBtn.firstChild); }
    }
    function applyLang(name) {
      langOpts.forEach(function (o) { o.classList.toggle('on', o.textContent.trim() === name); });
      setLangLabel(LANG_CODES[name] || 'EN');
      document.documentElement.setAttribute('lang', name === 'हिन्दी' ? 'hi' : name === 'ಕನ್ನಡ' ? 'kn' : name === 'తెలుగు' ? 'te' : 'en');
    }
    var savedLang;
    try { savedLang = localStorage.getItem('ic_lang'); } catch (e) {}
    if (savedLang && LANG_CODES[savedLang]) { applyLang(savedLang); }
    langOpts.forEach(function (o) {
      o.addEventListener('click', function (e) {
        e.stopPropagation();
        var name = o.textContent.trim();
        applyLang(name);
        try { localStorage.setItem('ic_lang', name); } catch (e2) {}
        langw.classList.remove('open');
      });
    });
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

  // ---- Search suggestions: as the member types, suggest matching pages, themes, states and discussions ----
  (function () {
    var input = document.getElementById('ns-input'), field = navsearch && navsearch.querySelector('.ns-field');
    if (!input || !field) return;
    var box = document.createElement('div'); box.className = 'ns-suggest'; box.setAttribute('role', 'listbox'); box.hidden = true;
    field.appendChild(box);
    input.setAttribute('autocomplete', 'off'); input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'false');

    var PAGES = [
      ['Home', 'index.html', 'home'], ['Discussion forum', 'forum.html', 'message-square'], ['Chat with us', 'start-conversation.html', 'sparkles'],
      ['Map exploration', 'map.html', 'map'], ['Members', 'members.html', 'users-round'], ['Podcasts', 'resources-podcasts.html', 'mic'],
      ['Webinars', 'resources-webinars.html', 'monitor-play'], ['Videos', 'resources-videos.html', 'clapperboard'], ['Newsfeed', 'resources-newsfeed.html', 'newspaper'],
      ['Laws and Regulations', 'resources-laws.html', 'scale'], ['Purpose of IC', 'purpose-of-the-indian-commoner.html', 'feather'], ['IC Team', 'team.html', 'badge-check'],
      ['What Are Commons', 'what-are-commons.html', 'sprout'], ['Who Is a Commoner', 'who-is-a-commoner.html', 'users'], ['Contact Us', 'contact-us.html', 'mail'],
      ['Terms of Use', 'terms-of-use.html', 'file-text'], ['Privacy Policy', 'privacy-policy.html', 'shield']
    ];
    var THEMES = ['Governing the Commons', 'Commons as Culture', 'Commons as Micro Habitats', 'Livelihoods, Subsistence & Valuation of Commons', 'Gender and Commons', 'Power and Commons', 'Conversion of Commons', 'Others'];
    var STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Chhattisgarh', 'Gujarat', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Meghalaya', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'];
    var threads = null, loading = false;
    function loadThreads(cb) {
      if (window.IC_THREADS) { threads = window.IC_THREADS; return cb && cb(); }
      if (loading) return;
      loading = true;
      var sc = document.createElement('script'); sc.src = 'assets/js/forum-threads.js';
      sc.onload = function () { threads = window.IC_THREADS || []; if (cb) cb(); };
      sc.onerror = function () { threads = []; };
      document.head.appendChild(sc);
    }
    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function norm(t) { return String(t).toLowerCase(); }
    function score(text, tokens) {
      var t = norm(text), sc = 0;
      for (var i = 0; i < tokens.length; i++) {
        var p = t.indexOf(tokens[i]); if (p === -1) return -1;
        sc += p === 0 ? 3 : (t.charAt(p - 1) === ' ' ? 2 : 1);
      }
      return sc;
    }
    function hl(text, tokens) {
      var out = esc(text);
      tokens.forEach(function (tok) {
        if (!tok) return;
        var re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        out = out.replace(/(<[^>]*>)|([^<]+)/g, function (m, tag, txt) { return tag ? tag : txt.replace(re, '<mark>$1</mark>'); });
      });
      return out;
    }
    var items = [], active = -1;
    function build(q) {
      var tokens = norm(q).trim().split(/\s+/).filter(Boolean);
      var groups = [];
      function pick(list, label, icon, max) {
        var r = list.map(function (x) { return { s: score(x.t, tokens), x: x }; }).filter(function (a) { return a.s >= 0; })
          .sort(function (a, b) { return b.s - a.s; }).slice(0, max).map(function (a) { return a.x; });
        if (r.length) groups.push({ label: label, icon: icon, items: r });
      }
      pick(PAGES.map(function (p) { return { t: p[0], h: p[1], i: p[2] }; }), 'Pages', 'file', 3);
      pick(THEMES.map(function (t) { return { t: t, h: 'forum.html?theme=' + encodeURIComponent(t), i: 'tag' }; }), 'Themes', 'tag', 3);
      pick(STATES.map(function (t) { return { t: t, h: 'forum.html?state=' + encodeURIComponent(t), i: 'map-pin' }; }), 'States', 'map-pin', 3);
      var th = (threads || []).map(function (t) { return { t: t.t, h: t.h, i: 'message-square', sub: t.s }; });
      try { JSON.parse(localStorage.getItem('ic_pending_threads') || '[]').forEach(function (t) { th.unshift({ t: t.title, h: 'thread.html?id=' + t.ts, i: 'message-square', sub: 'Your thread' }); }); } catch (e) {}
      pick(th, 'Discussions', 'message-square', 5);
      return { groups: groups, tokens: tokens };
    }
    function render() {
      var q = input.value;
      if (!q.trim()) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); items = []; return; }
      var res = build(q), html = '';
      items = [];
      res.groups.forEach(function (g) {
        html += '<div class="ns-grp">' + g.label + '</div>';
        g.items.forEach(function (it) {
          items.push(it.h);
          var chatSvg = (it.h === 'start-conversation.html' && document.querySelector('#start-convo-link .nd-svg')) ? document.querySelector('#start-convo-link .nd-svg').outerHTML.replace('class="nd-svg"', 'class="ns-svg"') : '';
          html += '<a class="ns-item" role="option" href="' + esc(it.h) + '" data-i="' + (items.length - 1) + '">' + (chatSvg || '<i data-lucide="' + it.i + '"></i>') + '<span class="ns-t">' + hl(it.t, res.tokens) + '</span>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</a>';
        });
      });
      var all = 'forum.html?q=' + encodeURIComponent(q.trim());
      items.push(all);
      html += '<a class="ns-item ns-all" role="option" href="' + esc(all) + '" data-i="' + (items.length - 1) + '"><i data-lucide="search"></i><span class="ns-t">Search discussions for “' + esc(q.trim()) + '”</span></a>';
      if (!res.groups.length) html = '<div class="ns-none">No direct matches for “' + esc(q.trim()) + '”</div>' + html;
      box.innerHTML = html; box.hidden = false; active = -1;
      input.setAttribute('aria-expanded', 'true');
      if (window.lucide) lucide.createIcons();
    }
    function setActive(n) {
      var els = box.querySelectorAll('.ns-item'); if (!els.length) return;
      active = (n + els.length) % els.length;
      els.forEach(function (e, i) { e.classList.toggle('on', i === active); });
      els[active].scrollIntoView({ block: 'nearest' });
    }
    input.addEventListener('focus', function () { loadThreads(render); });
    input.addEventListener('input', function () { loadThreads(render); render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (active >= 0 && items[active]) location.href = items[active];
        else if (input.value.trim()) location.href = 'forum.html?q=' + encodeURIComponent(input.value.trim());
      } else if (e.key === 'Escape') { box.hidden = true; }
    });
    var go = navsearch.querySelector('.ns-go');
    if (go) go.addEventListener('click', function () { if (input.value.trim()) location.href = 'forum.html?q=' + encodeURIComponent(input.value.trim()); });
    document.addEventListener('click', function (e) { if (!field.contains(e.target)) box.hidden = true; });
    if (searchClose) searchClose.addEventListener('click', function () { box.hidden = true; input.value = ''; });
  })();

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

  // Discussion forum: Theme/State pill groups + the Activity radio
  // group + free-text search narrow the thread list; the Recent/Most
  // replies/Unanswered segment re-sorts it. Rows carry their real reply
  // count in data-replies (unset -> 0, i.e. no replies yet) rather than a
  // count invented for rows with no source data. Activity filters on the
  // "x ago" time each row already displays (see rowAgeDays), so it narrows by
  // what the list shows rather than by any invented timestamp.
  var forumList = document.getElementById('forum-list');
  if (forumList) {
    var forumRows = Array.from(forumList.querySelectorAll('.topicrow'));

    forumRows.forEach(function (row) {
      var whoEl = row.querySelector('.tr-who');
      var nameEl = row.querySelector('.tr-who b, .tr-meta b');
      var av = row.querySelector('.pw-av');
      if (!nameEl || !av) return;
      var nm = whoEl && whoEl.getAttribute('data-name') || nameEl.textContent;
      tintAvatar(av, nm);
      if (window.icApplyMemberPhoto && nm !== 'Priya Sharma' && !av.querySelector('img')) window.icApplyMemberPhoto(av, nm);
    });
    var forumSearch = document.getElementById('forum-q');
    var forumCount = document.getElementById('forum-count');
    var forumSortSeg = document.querySelector('.seg-tabs[data-fseg]');
    var fPanelEl = document.querySelector('.filterpanel');
    var subCat = document.getElementById('fp-sub-cat'), subList = document.getElementById('fp-sub-list');
    // The real "Sub-thematic areas" listed on each theme's page (same list the Chat with us flow uses).
    var THEME_SUBS = {
      'Governing the Commons': ['Laws and Enactments', 'Policies', 'Tenure Arrangements', 'Institutional Arrangements'],
      'Commons as Culture': ['Traditional Constructions', 'Sacred Sites and Cultural Landscapes', 'Traditional Knowledge, Customs and Practices'],
      'Commons as Micro Habitats': ['Biodiversity', 'Invasive Species', 'Fire Ecology', 'Regulatory Functions', 'Restoration Ecology'],
      'Livelihoods, Subsistence & Valuation of Commons': ['Cash Income', 'Valuation of Commons', 'Reciprocity and Embodied Exchange', 'Security and Subsistence'],
      'Gender and Commons': ['Differential Access, Dependence and Impacts', 'Gender-Specific Knowledge Systems'],
      'Power and Commons': ['Differences Within Communities', 'Social Movements']
    };
    var activityRadios = document.querySelectorAll('.filterpanel input[name="fx-activity"]');
    var forumReset = document.getElementById('forum-reset');
    var forumEmpty = document.getElementById('forum-empty');
    var forumSort = 'recent';

    // Filters work like the Laws and Regulations page: checkbox lists (several choices in a group = "any of them",
    // different groups = "all of them"), each with a count.
    function sel(group) {
      return Array.prototype.map.call(document.querySelectorAll('.filterpanel input[data-fg="' + group + '"]:checked'), function (c) { return c.value; });
    }
    function activityValue() {
      var on = document.querySelector('.filterpanel input[name="fx-activity"]:checked');
      return on ? on.value : 'any';
    }
    function rowSubs(row) {
      return Array.prototype.map.call(row.querySelectorAll('.tr-tags .tag'), function (t) { return t.textContent.trim().toLowerCase(); });
    }

    // Counts next to each option, taken from the threads on the page.
    function countBy(fn) { var m = {}; forumRows.forEach(function (r) { var k = fn(r); if (k) m[k] = (m[k] || 0) + 1; }); return m; }
    var themeCounts = countBy(function (r) { return r.getAttribute('data-theme'); });
    var stateCounts = countBy(function (r) { return r.getAttribute('data-state'); });
    var THEME_LIST = [['Governing the Commons', 'Governing the Commons'], ['Commons as Culture', 'Commons as Culture'],
      ['Commons as Micro Habitats', 'Commons as Micro Habitats'], ['Livelihoods, Subsistence & Valuation of Commons', 'Livelihoods, Subsistence and Valuation of Commons'],
      ['Gender and Commons', 'Gender and Commons'], ['Power and Commons', 'Power and Commons'], ['Conversion of Commons', 'Conversion of Commons'], ['Others', 'Others']];

    // One option row: checkbox, name and count together (so a long name that wraps keeps its count right after it).
    function optionLabel(group, value, text, count, checked) {
      var l = document.createElement('label'); l.className = 'fp-check';
      var inp = document.createElement('input'); inp.type = 'checkbox'; inp.value = value; inp.setAttribute('data-fg', group); inp.checked = !!checked;
      var t = document.createElement('i'); t.className = 'fp-t'; t.appendChild(document.createTextNode(text + ' '));
      var n = document.createElement('span'); n.textContent = '(' + count + ')'; t.appendChild(n);
      l.appendChild(inp); l.appendChild(t);
      return l;
    }
    // Every section shows five options, the rest sit behind "+ N more" (as on the Laws page).
    function fillList(box, labels) {
      box.innerHTML = '';
      labels.slice(0, 5).forEach(function (l) { box.appendChild(l); });
      if (labels.length <= 5) return;
      var rest = labels.slice(5), more = document.createElement('div'); more.className = 'fp-more-group';
      rest.forEach(function (l) { more.appendChild(l); });
      var open = rest.some(function (l) { return l.querySelector('input').checked; });
      more.hidden = !open;
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'fp-more';
      btn.setAttribute('data-label', '+ ' + rest.length + ' more');
      btn.textContent = open ? 'Show less' : btn.getAttribute('data-label');
      btn.addEventListener('click', function () { var o = more.hidden; more.hidden = !o; btn.textContent = o ? 'Show less' : btn.getAttribute('data-label'); });
      box.appendChild(more); box.appendChild(btn);
    }
    var themeBox = document.getElementById('fp-theme-list');
    if (themeBox) fillList(themeBox, THEME_LIST.map(function (t) { return optionLabel('theme', t[0], t[1], themeCounts[t[0]] || 0); }));
    // States listed by number of threads.
    var stateBox = document.getElementById('fp-state-list');
    if (stateBox) {
      var names = Object.keys(stateCounts).sort(function (a, b) { return stateCounts[b] - stateCounts[a] || a.localeCompare(b); });
      fillList(stateBox, names.map(function (n) { return optionLabel('state', n, n, stateCounts[n]); }));
    }

    // Sub-theme section: only appears once a theme with sub-themes is ticked, and lists just those themes' sub-themes.
    function renderSubThemes() {
      if (!subCat || !subList) return;
      var keep = sel('sub');
      var subs = [];
      sel('theme').forEach(function (t) { (THEME_SUBS[t] || []).forEach(function (n) { if (subs.indexOf(n) === -1) subs.push(n); }); });
      subCat.hidden = !subs.length;
      if (!subs.length) { subList.innerHTML = ''; return; }
      fillList(subList, subs.map(function (n) {
        var cnt = forumRows.filter(function (r) { return rowSubs(r).indexOf(n.toLowerCase()) !== -1; }).length;
        return optionLabel('sub', n, n, cnt, keep.indexOf(n) !== -1);
      }));
    }

    // Age in days of a row, read from its displayed time label ("just now",
    // "5 min ago", "3 h ago", "4 days ago", "2 weeks ago", "1 month ago",
    // or a dated "5 Oct 2026"). null when the label can't be read.
    function rowAgeDays(row) {
      var tsAttr = +row.getAttribute('data-ts');
      if (tsAttr) return Math.max(0, (Date.now() - tsAttr) / 86400000);
      var spans = row.querySelectorAll('.tr-meta > span');
      var label = spans.length ? spans[spans.length - 1].textContent.trim().toLowerCase() : '';
      if (label === 'just now') return 0;
      var m = label.match(/^(\d+)\s*(min|minute|h|hour|day|week|month|year)s?\b/);
      if (m) {
        var n = +m[1];
        var perUnit = { min: 1 / 1440, minute: 1 / 1440, h: 1 / 24, hour: 1 / 24, day: 1, week: 7, month: 30, year: 365 }[m[2]];
        return n * perUnit;
      }
      var t = Date.parse(label);
      return isNaN(t) ? null : Math.max(0, (Date.now() - t) / 86400000);
    }
    var ACTIVITY_LIMIT_DAYS = { '1d': 1, '7d': 7, '30d': 30, '365d': 365 };

    function activeCount() {
      return sel('theme').length + sel('sub').length + sel('state').length + (activityValue() !== 'any' ? 1 : 0);
    }
    function hasActiveFilters() {
      return activeCount() > 0 || !!(forumSearch && forumSearch.value.trim());
    }

    function applyForumFilters() {
      var themes = sel('theme'), subs = sel('sub'), states = sel('state');
      var q = (forumSearch && forumSearch.value ? forumSearch.value : '').trim().toLowerCase();
      var activityLimit = ACTIVITY_LIMIT_DAYS[activityValue()];

      var visible = forumRows.filter(function (row) {
        if (themes.length && themes.indexOf(row.getAttribute('data-theme')) === -1) return false;
        if (subs.length) {
          var rs = rowSubs(row);
          if (!subs.some(function (x) { return rs.indexOf(x.toLowerCase()) !== -1; })) return false;
        }
        if (states.length && states.indexOf(row.getAttribute('data-state')) === -1) return false;
        if (q && row.querySelector('h3').textContent.toLowerCase().indexOf(q) === -1) return false;
        if (activityLimit) {
          var age = rowAgeDays(row);
          if (age === null || age > activityLimit || (activityLimit === 1 && age >= 1)) return false;
        }
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
      var fpCount = document.getElementById('fp-count');
      if (fpCount) { var nActive = activeCount(); fpCount.textContent = nActive || ''; fpCount.hidden = !nActive; }
      if (forumEmpty) forumEmpty.hidden = sorted.length !== 0;
    }

    if (fPanelEl) fPanelEl.addEventListener('change', function (e) {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-fg') === 'theme') renderSubThemes();
      applyForumFilters();
    });
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
        document.querySelectorAll('.filterpanel input[type="checkbox"]').forEach(function (c) { c.checked = false; });
        activityRadios.forEach(function (r) { r.checked = r.value === 'any'; });
        renderSubThemes();
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

    // A pin on the Map Exploration page links here as forum.html?state=<name>, and a card on the
    // Themes & sub-themes page as forum.html?theme=<name>: tick the matching option on arrival.
    var qs = new URLSearchParams(location.search);
    if (qs.get('q') && forumSearch) forumSearch.value = qs.get('q');
    [['state', qs.get('state')], ['theme', qs.get('theme')]].forEach(function (p) {
      if (!p[1]) return;
      document.querySelectorAll('.filterpanel input[data-fg="' + p[0] + '"]').forEach(function (c) { if (c.value === p[1]) c.checked = true; });
    });
    renderSubThemes();

    // Tablets and phones: the filter panel is a collapsible bar so threads are not pushed far down the page.
    var fPanel = document.querySelector('.filterpanel'), fHead = fPanel && fPanel.querySelector('.fp-head');
    if (fPanel && fHead) {
      var mq = window.matchMedia('(max-width:980px)');
      fHead.setAttribute('role', 'button'); fHead.setAttribute('tabindex', '0');
      var fCount = document.createElement('span');
      fCount.className = 'fp-badge'; fCount.id = 'fp-count'; fCount.hidden = true;
      fHead.insertBefore(fCount, fHead.querySelector('#forum-reset'));
      var chev = document.createElement('i'); chev.setAttribute('data-lucide', 'chevron-down'); chev.className = 'fp-chev';
      fHead.appendChild(chev);
      function fpSync() {
        if (mq.matches) { if (!fPanel.hasAttribute('data-fp-init')) { fPanel.setAttribute('data-fp-init', '1'); fPanel.classList.add('fp-collapsed'); } }
        else { fPanel.classList.remove('fp-collapsed'); fPanel.removeAttribute('data-fp-init'); }
        fHead.setAttribute('aria-expanded', fPanel.classList.contains('fp-collapsed') ? 'false' : 'true');
      }
      function fpToggle(e) {
        if (!mq.matches || (e.target.closest && e.target.closest('#forum-reset'))) return;
        fPanel.classList.toggle('fp-collapsed');
        fHead.setAttribute('aria-expanded', fPanel.classList.contains('fp-collapsed') ? 'false' : 'true');
      }
      fHead.addEventListener('click', fpToggle);
      fHead.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fpToggle(e); } });
      (mq.addEventListener ? mq.addEventListener('change', fpSync) : mq.addListener(fpSync));
      fpSync();
      if (window.lucide) lucide.createIcons();
      applyForumFilters();
    }

    applyForumFilters();
  }

  // ---- Share: every thread page gets a Share button that opens a sheet with the share targets and a copy-link field ----
  (function () {
    var foot = document.querySelector('.post-foot');
    if (!foot) return;
    var right = foot.querySelector('.row:last-child') || foot;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'clearbtn share-btn';
    btn.innerHTML = '<i data-lucide="share-2" style="width:.85rem;height:.85rem;vertical-align:-2px;margin-right:.25rem"></i>Share';
    right.insertBefore(btn, right.firstChild);

    var TARGETS = [
      ['WhatsApp', 'message-circle', '#25D366', function (u, t) { return 'https://wa.me/?text=' + encodeURIComponent(t + ' ' + u); }],
      ['Facebook', 'facebook', '#1877F2', function (u) { return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u); }],
      ['X', 'twitter', '#111111', function (u, t) { return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(t) + '&url=' + encodeURIComponent(u); }],
      ['LinkedIn', 'linkedin', '#0A66C2', function (u) { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(u); }],
      ['Telegram', 'send', '#229ED9', function (u, t) { return 'https://t.me/share/url?url=' + encodeURIComponent(u) + '&text=' + encodeURIComponent(t); }],
      ['Email', 'mail', '#6b6f68', function (u, t) { return 'mailto:?subject=' + encodeURIComponent(t) + '&body=' + encodeURIComponent(t + '\n' + u); }]
    ];
    var modal = document.createElement('div');
    modal.className = 'modal-back share-modal'; modal.id = 'shareModal';
    modal.innerHTML =
      '<div class="modal-card">' +
        '<button class="modal-x" data-close-share aria-label="Close"><i data-lucide="x"></i></button>' +
        '<h3>Share this discussion</h3>' +
        '<p class="share-title" id="share-title"></p>' +
        '<div class="share-grid" id="share-grid"></div>' +
        '<div class="share-copy"><input type="text" id="share-url" readonly aria-label="Link to this discussion">' +
        '<button type="button" class="btn btn-primary sm" id="share-copy"><i data-lucide="link"></i> Copy link</button></div>' +
        '<p class="share-note" id="share-note" aria-live="polite"></p>' +
      '</div>';
    document.body.appendChild(modal);
    var grid = modal.querySelector('#share-grid'), urlEl = modal.querySelector('#share-url'), note = modal.querySelector('#share-note');

    function current() { return { url: location.href, title: document.title.replace(/\s+[—-]\s+Indian Commoner$/, '') }; }
    function close() { modal.classList.remove('open'); }
    function open() {
      var c = current();
      modal.querySelector('#share-title').textContent = c.title;
      urlEl.value = c.url; note.textContent = '';
      grid.innerHTML = TARGETS.map(function (t) {
        return '<a class="share-t" href="' + t[3](c.url, c.title).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="share-ic" style="background:' + t[2] + '"><i data-lucide="' + t[1] + '"></i></span><span>' + t[0] + '</span></a>';
      }).join('');
      if (window.lucide) lucide.createIcons();
      modal.classList.add('open');
    }
    btn.addEventListener('click', open);
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close-share]')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    modal.querySelector('#share-copy').addEventListener('click', function () {
      function ok() { note.textContent = 'Link copied.'; }
      function fallback() { urlEl.select(); try { document.execCommand('copy'); ok(); } catch (e) { note.textContent = 'Press Ctrl/Cmd+C to copy the link.'; } }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(urlEl.value).then(ok, fallback); else fallback();
    });
    urlEl.addEventListener('focus', function () { urlEl.select(); });
    if (window.lucide) lucide.createIcons();
  })();

  // Friend cards on profile pages: Message is a prototype-only action, so acknowledge the click like the Members page does.
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#mp-friend-grid .mc-actions button');
    if (!b || b.disabled) return;
    b.innerHTML = '<i data-lucide="check"></i> Sent'; b.disabled = true;
    if (window.lucide) lucide.createIcons();
  });

  // ---- Notification bell (signed-in members): opens a right-hand drawer listing every notification ----
  (function () {
    var acct = document.querySelector('.acctgroup');
    if (!acct || !window.icNotifications) return;
    var grp = document.createElement('div');
    grp.className = 'navgroup notifgroup';
    grp.innerHTML = '<button type="button" class="nav-ic notif-btn" aria-label="Notifications" aria-haspopup="dialog" title="Notifications"><i data-lucide="bell"></i><span class="notif-n" hidden>0</span></button>';
    acct.parentNode.insertBefore(grp, acct);
    var btn = grp.querySelector('.notif-btn'), badge = grp.querySelector('.notif-n');

    var scrim = document.createElement('div'); scrim.className = 'notif-scrim';
    var drawer = document.createElement('aside'); drawer.className = 'notif-drawer'; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-label', 'Notifications'); drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML =
      '<div class="nd-head"><div><b>Notifications</b><span id="nd-sub"></span></div><button type="button" class="nd-x" aria-label="Close"><i data-lucide="x"></i></button></div>' +
      '<div class="nd-tabs"><button type="button" class="on" data-f="all">All <em id="nd-n-all">0</em></button><button type="button" data-f="unread">Unread <em id="nd-n-unread">0</em></button>' +
        '<button type="button" class="nd-readall" id="nd-readall">Mark all as read</button></div>' +
      '<div class="nd-list" id="nd-list"></div>' +
      '<div class="nd-foot"><a href="member-profile.html#subs"><i data-lucide="bell-ring"></i> Manage subscriptions</a></div>';
    document.body.appendChild(scrim); document.body.appendChild(drawer);
    var list = drawer.querySelector('#nd-list'), filter = 'all';

    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function ago(ts) {
      var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
      if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; if (m < 1440) return Math.floor(m / 60) + ' h ago';
      return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function paint() {
      var all = window.icNotifications(), unread = all.filter(function (n) { return !n.read; }), n = unread.length;
      badge.hidden = !n; badge.textContent = n > 9 ? '9+' : n;
      drawer.querySelector('#nd-n-all').textContent = all.length; drawer.querySelector('#nd-n-unread').textContent = n;
      drawer.querySelector('#nd-sub').textContent = n ? n + ' unread' : 'You are all caught up';
      drawer.querySelector('#nd-readall').disabled = !n;
      var shown = filter === 'unread' ? unread : all;
      list.innerHTML = shown.length ? shown.map(function (x) {
        return '<a class="notif-item' + (x.read ? '' : ' unread') + '" href="' + esc(x.href) + '" data-id="' + esc(x.id) + '">' +
          '<span class="notif-dot"></span><span class="notif-tx"><b>' + esc(x.title) + '</b>' +
          '<small>New discussion in ' + esc(x.theme) + (x.sample ? ' (sample)' : '') + ' · ' + ago(x.ts) + '</small></span></a>';
      }).join('') : '<p class="notif-empty">' + (all.length ? 'Nothing unread.' : 'No notifications yet. Subscribe to a theme and new discussions in it will show up here.') + '</p>';
      if (window.lucide) lucide.createIcons();
    }
    var lastFocus = null;
    function open() { lastFocus = document.activeElement; paint(); scrim.classList.add('open'); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('nd-lock'); drawer.querySelector('.nd-x').focus(); }
    function close() { scrim.classList.remove('open'); drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('nd-lock'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
    btn.addEventListener('click', function () { drawer.classList.contains('open') ? close() : open(); });
    scrim.addEventListener('click', close);
    drawer.querySelector('.nd-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });
    list.addEventListener('click', function (e) { var a = e.target.closest('.notif-item'); if (a) window.icMarkRead(a.getAttribute('data-id')); });
    drawer.querySelector('#nd-readall').addEventListener('click', function () { window.icMarkRead(); paint(); });
    drawer.querySelector('.nd-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-f]'); if (!b) return;
      drawer.querySelectorAll('.nd-tabs button[data-f]').forEach(function (x) { x.classList.toggle('on', x === b); });
      filter = b.getAttribute('data-f'); paint();
    });
    window.addEventListener('ic-notes', paint);
    window.addEventListener('storage', paint);
    paint();
  })();

  // ---- Commoner survey: opened by the "Take a test! Are you a commoner?" card; Skip or Submit continues to Who Is a Commoner ----
  (function () {
    var TARGET = 'who-is-a-commoner.html';
    // Village-style illustrations, one per question (inline SVG, drawn for this site).
    var ILL = ["<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"162\" cy=\"36\" r=\"33.800000000000004\" fill=\"url(#glow)\"/><circle cx=\"162\" cy=\"36\" r=\"13\" fill=\"#f8d252\"/><g transform=\"translate(32 34) scale(1)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><g transform=\"translate(110 26) scale(0.7)\" fill=\"#fff\" opacity=\"0.8\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M70 52q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M84 46q2.4000000000000004 -3.2 4.800000000000001 0q2.4000000000000004 -3.2 4.800000000000001 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><g transform=\"translate(28 126) scale(0.95)\"><ellipse cx=\"0\" cy=\"31\" rx=\"30\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><rect x=\"-22\" y=\"0\" width=\"44\" height=\"30\" fill=\"#f4e6c8\"/><rect x=\"-22\" y=\"0\" width=\"12\" height=\"30\" fill=\"#000\" opacity=\".06\"/><path d=\"M-30 3L0 -28 30 3z\" fill=\"#8a6a3b\"/><path d=\"M-30 3L0 -28 30 3z\" fill=\"#000\" opacity=\".08\" transform=\"translate(0 0)\"/><path d=\"M-22 0L-6 -17M-12 1L4 -16M-2 2L12 -13M8 2L19 -8M-26 3L-14 -9\" stroke=\"#6a4c2a\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"-6\" y=\"10\" width=\"12\" height=\"20\" rx=\"3\" fill=\"#6b4a2b\"/><circle cx=\"3\" cy=\"21\" r=\"1\" fill=\"#e6c78a\"/><rect x=\"10\" y=\"9\" width=\"8\" height=\"8\" rx=\"1\" fill=\"#9bd0c8\" stroke=\"#6b4a2b\" stroke-width=\"1.5\"/></g><g transform=\"translate(176 100) scale(0.95)\"><ellipse cx=\"0\" cy=\"32\" rx=\"18\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><path d=\"M-3 32L-4 8Q0 4 4 8L3 32z\" fill=\"#7a5a3c\"/><path d=\"M0 14l-8-8M0 18l8-8\" stroke=\"#6a4c33\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"0\" cy=\"-6\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-14\" cy=\"4\" r=\"13\" fill=\"#2f7556\"/><circle cx=\"14\" cy=\"4\" r=\"13\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#6cbf90\"/><circle cx=\"10\" cy=\"-4\" r=\"6\" fill=\"#6cbf90\" opacity=\".7\"/></g><path d=\"M0 170Q50 162 100 169 T200 167V200H0z\" fill=\"#d9c68e\"/><path d=\"M0 184Q60 178 120 184 T200 180V200H0z\" fill=\"#c9b57a\"/><rect x=\"36\" y=\"152\" width=\"128\" height=\"16\" rx=\"3\" fill=\"#b98e5a\"/><rect x=\"36\" y=\"152\" width=\"128\" height=\"4\" rx=\"2\" fill=\"#d4ab74\"/><path d=\"M60 156v12M90 156v12M120 156v12M148 156v12\" stroke=\"#9c7442\" stroke-width=\"2\"/><g transform=\"translate(20 172) scale(1.1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(176 174) scale(1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(168 172)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e0a526\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g><g transform=\"translate(26 176)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e86a5a\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g><ellipse cx=\"60\" cy=\"153\" rx=\"33.0\" ry=\"5.3\" fill=\"#000\" opacity=\".13\"/><path d=\"M30 153Q34.5 132 42 124.5Q60 114.8 78 124.5Q85.5 132 90 153z\" fill=\"#0b8a7e\"/><path d=\"M64.5 127.5Q84 133.5 90 153H70.5z\" fill=\"#000\" opacity=\".1\"/><path d=\"M30.8 145.5H89.2\" stroke=\"#f2c94c\" stroke-width=\"6.8\"/><path d=\"M42 124.5Q63 144 82.5 127.5\" stroke=\"#f2c94c\" stroke-width=\"4.5\" fill=\"none\" opacity=\".9\"/><ellipse cx=\"49.5\" cy=\"155.2\" rx=\"7.5\" ry=\"3.3\" fill=\"#6b4a2b\"/><ellipse cx=\"70.5\" cy=\"155.2\" rx=\"7.5\" ry=\"3.3\" fill=\"#6b4a2b\"/><path d=\"M40.5 126.8L86 124\" stroke=\"#0b8a7e\" stroke-width=\"12.8\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"86\" cy=\"124\" r=\"6\" fill=\"#d19a6e\"/><circle cx=\"84.5\" cy=\"124\" r=\"7.8\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.4\" opacity=\".0\"/><path d=\"M79.5 126.8L86 124\" stroke=\"#0b8a7e\" stroke-width=\"12.8\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"86\" cy=\"124\" r=\"6\" fill=\"#d19a6e\"/><circle cx=\"84.5\" cy=\"124\" r=\"7.8\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.4\" opacity=\".0\"/><rect x=\"55.2\" y=\"112.5\" width=\"9.6\" height=\"13.5\" fill=\"#b87d55\"/><path d=\"M39.8 120Q37.5 79.5 60 81Q82.5 79.5 80.2 120Q60 110.2 39.8 120z\" fill=\"#0b8a7e\"/><path d=\"M64.5 81Q82.5 81 80.2 120Q73.5 112.5 67.5 111z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"60\" cy=\"102\" rx=\"14.2\" ry=\"15.3\" fill=\"#d19a6e\"/><ellipse cx=\"67.5\" cy=\"104.2\" rx=\"6.3\" ry=\"12\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"45.8\" cy=\"103.5\" r=\"2.6\" fill=\"#b87d55\"/><circle cx=\"74.2\" cy=\"103.5\" r=\"2.6\" fill=\"#b87d55\"/><path d=\"M45.8 99Q48 86.2 60 86.2Q72 86.2 74.2 99Q64.5 91.5 45.8 99z\" fill=\"#2f221c\"/><circle cx=\"45\" cy=\"110.2\" r=\"2.6\" fill=\"#f2c94c\"/><circle cx=\"75\" cy=\"110.2\" r=\"2.6\" fill=\"#f2c94c\"/><ellipse cx=\"54.6\" cy=\"103.8\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><ellipse cx=\"65.4\" cy=\"103.8\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><path d=\"M52.2 99.9q2.4 -2.1 4.8 0M63 99.9q2.4 -2.1 4.8 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"51.3\" cy=\"108.3\" r=\"2.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"68.7\" cy=\"108.3\" r=\"2.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"60\" cy=\"96\" r=\"1.9\" fill=\"#c0392b\"/><path d=\"M55.5 110.2q4.5 3.9 9 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"140\" cy=\"153\" rx=\"33.0\" ry=\"5.3\" fill=\"#000\" opacity=\".13\"/><path d=\"M110 153Q114.5 132 122 124.5Q140 114.8 158 124.5Q165.5 132 170 153z\" fill=\"#a8402f\"/><path d=\"M144.5 127.5Q164 133.5 170 153H150.5z\" fill=\"#000\" opacity=\".1\"/><path d=\"M110.8 145.5H169.2\" stroke=\"#f2c94c\" stroke-width=\"6.8\"/><path d=\"M122 124.5Q143 144 162.5 127.5\" stroke=\"#f2c94c\" stroke-width=\"4.5\" fill=\"none\" opacity=\".9\"/><ellipse cx=\"129.5\" cy=\"155.2\" rx=\"7.5\" ry=\"3.3\" fill=\"#6b4a2b\"/><ellipse cx=\"150.5\" cy=\"155.2\" rx=\"7.5\" ry=\"3.3\" fill=\"#6b4a2b\"/><path d=\"M120.5 126.8L114 124\" stroke=\"#a8402f\" stroke-width=\"12.8\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"114\" cy=\"124\" r=\"6\" fill=\"#d19a6e\"/><circle cx=\"112.5\" cy=\"124\" r=\"7.8\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.4\" opacity=\".0\"/><path d=\"M159.5 126.8L114 124\" stroke=\"#a8402f\" stroke-width=\"12.8\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"114\" cy=\"124\" r=\"6\" fill=\"#d19a6e\"/><circle cx=\"112.5\" cy=\"124\" r=\"7.8\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.4\" opacity=\".0\"/><rect x=\"135.2\" y=\"112.5\" width=\"9.6\" height=\"13.5\" fill=\"#b87d55\"/><path d=\"M119.8 120Q117.5 79.5 140 81Q162.5 79.5 160.2 120Q140 110.2 119.8 120z\" fill=\"#a8402f\"/><path d=\"M144.5 81Q162.5 81 160.2 120Q153.5 112.5 147.5 111z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"140\" cy=\"102\" rx=\"14.2\" ry=\"15.3\" fill=\"#d19a6e\"/><ellipse cx=\"147.5\" cy=\"104.2\" rx=\"6.3\" ry=\"12\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"125.8\" cy=\"103.5\" r=\"2.6\" fill=\"#b87d55\"/><circle cx=\"154.2\" cy=\"103.5\" r=\"2.6\" fill=\"#b87d55\"/><path d=\"M125.8 99Q128 86.2 140 86.2Q152 86.2 154.2 99Q144.5 91.5 125.8 99z\" fill=\"#2f221c\"/><circle cx=\"125\" cy=\"110.2\" r=\"2.6\" fill=\"#f2c94c\"/><circle cx=\"155\" cy=\"110.2\" r=\"2.6\" fill=\"#f2c94c\"/><ellipse cx=\"134.6\" cy=\"103.8\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><ellipse cx=\"145.4\" cy=\"103.8\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><path d=\"M132.2 99.9q2.4 -2.1 4.8 0M143 99.9q2.4 -2.1 4.8 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"131.3\" cy=\"108.3\" r=\"2.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"148.7\" cy=\"108.3\" r=\"2.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"140\" cy=\"96\" r=\"1.9\" fill=\"#c0392b\"/><path d=\"M135.5 110.2q4.5 3.9 9 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(100 126) scale(1.1)\"><ellipse cx=\"0\" cy=\"17\" rx=\"12\" ry=\"2.6\" fill=\"#000\" opacity=\".12\"/><path d=\"M-12 -4Q-15 14 0 17Q15 14 12 -4z\" fill=\"#a0562f\"/><path d=\"M4 -3Q10 6 2 16Q14 12 12 -4z\" fill=\"#000\" opacity=\".12\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"12\" ry=\"4.5\" fill=\"#6b3a22\"/><ellipse cx=\"0\" cy=\"-4.5\" rx=\"9.6\" ry=\"3.2\" fill=\"#fbf7e8\"/><path d=\"M-6 -5q3 2 6 0\" stroke=\"#e9e1c4\" stroke-width=\"1\" fill=\"none\"/><path d=\"M-10 5Q0 8.5 10 5M-11 9Q0 12.5 11 9\" stroke=\"#d29265\" stroke-width=\"1.3\" fill=\"none\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"34\" cy=\"36\" r=\"31.200000000000003\" fill=\"url(#glow)\"/><circle cx=\"34\" cy=\"36\" r=\"12\" fill=\"#f8d252\"/><g transform=\"translate(110 30) scale(0.9)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M150 60q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><g><ellipse cx=\"150\" cy=\"134\" rx=\"42\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><rect x=\"116\" y=\"84\" width=\"68\" height=\"50\" fill=\"#f6e7c6\"/><rect x=\"116\" y=\"84\" width=\"20\" height=\"50\" fill=\"#000\" opacity=\".05\"/><path d=\"M110 86L150 58 190 86z\" fill=\"#b5533c\"/><path d=\"M118 85L150 62\" stroke=\"#8f3f22\" stroke-width=\"2\"/><rect x=\"143\" y=\"104\" width=\"14\" height=\"30\" rx=\"2\" fill=\"#6b4a2b\"/><rect x=\"123\" y=\"96\" width=\"13\" height=\"13\" rx=\"1\" fill=\"#bfe0da\" stroke=\"#8f6a3b\" stroke-width=\"2\"/><rect x=\"164\" y=\"96\" width=\"13\" height=\"13\" rx=\"1\" fill=\"#bfe0da\" stroke=\"#8f6a3b\" stroke-width=\"2\"/><path d=\"M150 58V36\" stroke=\"#6b4a2b\" stroke-width=\"2.5\"/><path d=\"M150 36l17 5-17 6z\" fill=\"#e67e22\"/></g><path d=\"M0 168Q50 160 100 167 T200 165V200H0z\" fill=\"#d4c493\"/><path d=\"M0 182Q60 176 120 182 T200 178V200H0z\" fill=\"#c8b684\"/><path d=\"M0 186H200\" stroke=\"#fff\" stroke-opacity=\".55\" stroke-width=\"2.5\" stroke-dasharray=\"12 9\"/><g transform=\"translate(16 176) scale(1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(182 178)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e86a5a\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g><ellipse cx=\"68\" cy=\"172\" rx=\"33.0\" ry=\"5.3\" fill=\"#000\" opacity=\".13\"/><path d=\"M38 172Q42.5 128 50 120.5Q68 110.8 86 120.5Q93.5 128 98 172z\" fill=\"#0b8a7e\"/><path d=\"M72.5 123.5Q92 129.5 98 172H78.5z\" fill=\"#000\" opacity=\".1\"/><path d=\"M38.8 164.5H97.2\" stroke=\"#f2c94c\" stroke-width=\"6.8\"/><path d=\"M50 120.5Q71 140 90.5 123.5\" stroke=\"#f2c94c\" stroke-width=\"4.5\" fill=\"none\" opacity=\".9\"/><ellipse cx=\"57.5\" cy=\"174.2\" rx=\"7.5\" ry=\"3.3\" fill=\"#6b4a2b\"/><ellipse cx=\"78.5\" cy=\"174.2\" rx=\"7.5\" ry=\"3.3\" fill=\"#6b4a2b\"/><path d=\"M48.5 122.8L100 138\" stroke=\"#0b8a7e\" stroke-width=\"12.8\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"100\" cy=\"138\" r=\"6\" fill=\"#d19a6e\"/><circle cx=\"98.5\" cy=\"138\" r=\"7.8\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.4\" opacity=\".0\"/><path d=\"M87.5 122.8L40 136\" stroke=\"#0b8a7e\" stroke-width=\"12.8\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"40\" cy=\"136\" r=\"6\" fill=\"#d19a6e\"/><circle cx=\"38.5\" cy=\"136\" r=\"7.8\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.4\" opacity=\".0\"/><rect x=\"63.2\" y=\"108.5\" width=\"9.6\" height=\"13.5\" fill=\"#b87d55\"/><path d=\"M47.8 116Q45.5 75.5 68 77Q90.5 75.5 88.2 116Q68 106.2 47.8 116z\" fill=\"#0b8a7e\"/><path d=\"M72.5 77Q90.5 77 88.2 116Q81.5 108.5 75.5 107z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"68\" cy=\"98\" rx=\"14.2\" ry=\"15.3\" fill=\"#d19a6e\"/><ellipse cx=\"75.5\" cy=\"100.2\" rx=\"6.3\" ry=\"12\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"53.8\" cy=\"99.5\" r=\"2.6\" fill=\"#b87d55\"/><circle cx=\"82.2\" cy=\"99.5\" r=\"2.6\" fill=\"#b87d55\"/><path d=\"M53.8 95Q56 82.2 68 82.2Q80 82.2 82.2 95Q72.5 87.5 53.8 95z\" fill=\"#2f221c\"/><circle cx=\"53\" cy=\"106.2\" r=\"2.6\" fill=\"#f2c94c\"/><circle cx=\"83\" cy=\"106.2\" r=\"2.6\" fill=\"#f2c94c\"/><ellipse cx=\"62.6\" cy=\"99.8\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><ellipse cx=\"73.4\" cy=\"99.8\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><path d=\"M60.2 95.9q2.4 -2.1 4.8 0M71 95.9q2.4 -2.1 4.8 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"59.3\" cy=\"104.3\" r=\"2.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"76.7\" cy=\"104.3\" r=\"2.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"68\" cy=\"92\" r=\"1.9\" fill=\"#c0392b\"/><path d=\"M63.5 106.2q4.5 3.9 9 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"106\" cy=\"172\" rx=\"20.900000000000002\" ry=\"3.3\" fill=\"#000\" opacity=\".13\"/><path d=\"M87 172Q89.8 143 94.6 138.2Q106 132.1 117.4 138.2Q122.2 143 125 172z\" fill=\"#d9534f\"/><path d=\"M108.8 140.2Q121.2 143.9 125 172H112.7z\" fill=\"#000\" opacity=\".1\"/><path d=\"M87.5 167.2H124.5\" stroke=\"#fff\" stroke-width=\"4.3\"/><ellipse cx=\"99.3\" cy=\"173.4\" rx=\"4.8\" ry=\"2.1\" fill=\"#6b4a2b\"/><ellipse cx=\"112.7\" cy=\"173.4\" rx=\"4.8\" ry=\"2.1\" fill=\"#6b4a2b\"/><path d=\"M93.7 139.7L88 140\" stroke=\"#d9534f\" stroke-width=\"8.1\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"88\" cy=\"140\" r=\"3.8\" fill=\"#d19a6e\"/><circle cx=\"87\" cy=\"140\" r=\"4.9\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"1.5\" opacity=\".0\"/><path d=\"M118.3 139.7L118 150\" stroke=\"#d9534f\" stroke-width=\"8.1\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"118\" cy=\"150\" r=\"3.8\" fill=\"#d19a6e\"/><circle cx=\"117\" cy=\"150\" r=\"4.9\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"1.5\" opacity=\".0\"/><rect x=\"103\" y=\"130.7\" width=\"6.1\" height=\"8.6\" fill=\"#b87d55\"/><ellipse cx=\"106\" cy=\"124\" rx=\"9\" ry=\"9.7\" fill=\"#d19a6e\"/><ellipse cx=\"110.8\" cy=\"125.4\" rx=\"4\" ry=\"7.6\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"97\" cy=\"125\" r=\"1.6\" fill=\"#b87d55\"/><circle cx=\"115\" cy=\"125\" r=\"1.6\" fill=\"#b87d55\"/><path d=\"M96.5 123.5a9.5 10.5 0 0 1 19 0q-9.5 -6.2 -19 0z\" fill=\"#2f221c\"/><ellipse cx=\"102.6\" cy=\"125.1\" rx=\"1.4\" ry=\"1.6\" fill=\"#2f221c\"/><ellipse cx=\"109.4\" cy=\"125.1\" rx=\"1.4\" ry=\"1.6\" fill=\"#2f221c\"/><path d=\"M101.1 122.7q1.5 -1.3 3 0M107.9 122.7q1.5 -1.3 3 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"100.5\" cy=\"128\" r=\"1.6\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"111.5\" cy=\"128\" r=\"1.6\" fill=\"#e07a5f\" opacity=\".35\"/><path d=\"M103.2 129.2q2.9 2.5 5.7 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><rect x=\"112\" y=\"134\" width=\"14\" height=\"17\" rx=\"3\" fill=\"#e67e22\"/><path d=\"M112 140h14\" stroke=\"#c9660f\" stroke-width=\"1.5\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"168\" cy=\"32\" r=\"31.200000000000003\" fill=\"url(#glow)\"/><circle cx=\"168\" cy=\"32\" r=\"12\" fill=\"#f8d252\"/><g transform=\"translate(36 36) scale(1)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M90 52q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><path d=\"M0 148Q52 124 116 140Q158 150 156 174Q104 196 0 188z\" fill=\"#76c0c6\"/><path d=\"M0 148Q52 124 116 140Q158 150 156 174\" fill=\"#fff\" opacity=\".18\"/><path d=\"M14 158q10-5 20 0M64 152q12-5 24 0M38 174q10-5 22 0M98 166q10-5 20 0\" stroke=\"#fff\" stroke-opacity=\".75\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M20 148v-24M28 148v-30M36 148v-22M44 150v-18\" stroke=\"#2f7556\" stroke-width=\"3\" stroke-linecap=\"round\"/><ellipse cx=\"22\" cy=\"118\" rx=\"3\" ry=\"6\" fill=\"#8a6a3b\"/><ellipse cx=\"36\" cy=\"124\" rx=\"3\" ry=\"6\" fill=\"#8a6a3b\"/><path d=\"M0 178Q50 170 100 177 T200 175V200H0z\" fill=\"#d9c68e\"/><path d=\"M0 192Q60 186 120 192 T200 188V200H0z\" fill=\"#c9b57a\"/><g fill=\"#9b9b92\"><ellipse cx=\"88\" cy=\"186\" rx=\"6\" ry=\"3\"/><ellipse cx=\"96\" cy=\"188\" rx=\"4\" ry=\"2.4\"/></g><ellipse cx=\"52\" cy=\"170\" rx=\"29.700000000000003\" ry=\"4.8\" fill=\"#000\" opacity=\".13\"/><path d=\"M25 170Q29.1 133 35.8 126.2Q52 117.5 68.2 126.2Q75 133 79 170z\" fill=\"#b4a655\"/><path d=\"M56 128.9Q73.6 134.3 79 170H61.5z\" fill=\"#000\" opacity=\".1\"/><path d=\"M25.7 163.2H78.3\" stroke=\"#fff\" stroke-width=\"6.1\"/><ellipse cx=\"42.5\" cy=\"172\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><ellipse cx=\"61.5\" cy=\"172\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><path d=\"M34.5 128.3L74 134\" stroke=\"#b4a655\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"74\" cy=\"134\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"72.7\" cy=\"134\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><path d=\"M69.5 128.3L80 148\" stroke=\"#b4a655\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"80\" cy=\"148\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"78.7\" cy=\"148\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><rect x=\"47.7\" y=\"115.5\" width=\"8.6\" height=\"12.2\" fill=\"#b87d55\"/><ellipse cx=\"52\" cy=\"106\" rx=\"12.8\" ry=\"13.8\" fill=\"#d19a6e\"/><ellipse cx=\"58.8\" cy=\"108\" rx=\"5.7\" ry=\"10.8\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"39.2\" cy=\"107.3\" r=\"2.3\" fill=\"#b87d55\"/><circle cx=\"64.8\" cy=\"107.3\" r=\"2.3\" fill=\"#b87d55\"/><path d=\"M36.5 105.3a15.5 17.6 0 0 1 31 0q-15.5 -8.1 -31 0z\" fill=\"#b4a655\"/><path d=\"M39.9 97.9q12.2 -10.8 24.3 -1.4M42.5 93.2q9.4 -6.8 20.2 -1.4\" stroke=\"#fff\" stroke-opacity=\".55\" stroke-width=\"1.3\" fill=\"none\"/><ellipse cx=\"47.1\" cy=\"107.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><ellipse cx=\"56.9\" cy=\"107.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><path d=\"M45 104.1q2.2 -1.9 4.3 0M54.7 104.1q2.2 -1.9 4.3 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"44.2\" cy=\"111.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"59.8\" cy=\"111.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><path d=\"M44.6 112.8q7.4 3.8 14.9 0\" stroke=\"#2f221c\" stroke-width=\"2.8\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M80 148l18-36\" stroke=\"#7a5a3c\" stroke-width=\"3.5\" stroke-linecap=\"round\"/><path d=\"M92 120l-12 4M96 114l-12 4\" stroke=\"#7a5a3c\" stroke-width=\"3\" stroke-linecap=\"round\"/><rect x=\"66\" y=\"150\" width=\"14\" height=\"10\" rx=\"2\" fill=\"#b98e5a\" transform=\"rotate(-8 73 155)\"/><path d=\"M68 152l-2-4M74 152l1-5M79 150l3-4\" stroke=\"#3f8f6a\" stroke-width=\"2\" stroke-linecap=\"round\"/><ellipse cx=\"152\" cy=\"184\" rx=\"29.700000000000003\" ry=\"4.8\" fill=\"#000\" opacity=\".13\"/><path d=\"M125 184Q129.1 135 135.8 128.2Q152 119.5 168.2 128.2Q174.9 135 179 184z\" fill=\"#0b8a7e\"/><path d=\"M156.1 130.9Q173.6 136.3 179 184H161.4z\" fill=\"#000\" opacity=\".1\"/><path d=\"M125.7 177.2H178.3\" stroke=\"#f2c94c\" stroke-width=\"6.1\"/><path d=\"M135.8 128.2Q154.7 145.8 172.2 130.9\" stroke=\"#f2c94c\" stroke-width=\"4\" fill=\"none\" opacity=\".9\"/><ellipse cx=\"142.6\" cy=\"186\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><ellipse cx=\"161.4\" cy=\"186\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><path d=\"M134.4 130.3L130 148\" stroke=\"#0b8a7e\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"130\" cy=\"148\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"128.7\" cy=\"148\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><path d=\"M169.6 130.3L134 160\" stroke=\"#0b8a7e\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"134\" cy=\"160\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"132.7\" cy=\"160\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><rect x=\"147.7\" y=\"117.5\" width=\"8.6\" height=\"12.2\" fill=\"#b87d55\"/><path d=\"M133.8 124.2Q131.8 87.8 152 89.1Q172.2 87.8 170.2 124.2Q152 115.4 133.8 124.2z\" fill=\"#0b8a7e\"/><path d=\"M156.1 89.1Q172.2 89.1 170.2 124.2Q164.2 117.5 158.8 116.1z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"152\" cy=\"108\" rx=\"12.8\" ry=\"13.8\" fill=\"#d19a6e\"/><ellipse cx=\"158.8\" cy=\"110\" rx=\"5.7\" ry=\"10.8\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"139.2\" cy=\"109.3\" r=\"2.3\" fill=\"#b87d55\"/><circle cx=\"164.8\" cy=\"109.3\" r=\"2.3\" fill=\"#b87d55\"/><path d=\"M139.2 105.3Q141.2 93.8 152 93.8Q162.8 93.8 164.8 105.3Q156.1 98.5 139.2 105.3z\" fill=\"#2f221c\"/><circle cx=\"138.5\" cy=\"115.4\" r=\"2.3\" fill=\"#f2c94c\"/><circle cx=\"165.5\" cy=\"115.4\" r=\"2.3\" fill=\"#f2c94c\"/><ellipse cx=\"147.1\" cy=\"109.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><ellipse cx=\"156.9\" cy=\"109.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><path d=\"M145 106.1q2.2 -1.9 4.3 0M154.7 106.1q2.2 -1.9 4.3 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"144.2\" cy=\"113.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"159.8\" cy=\"113.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"152\" cy=\"102.6\" r=\"1.7\" fill=\"#c0392b\"/><path d=\"M147.9 115.4q4 3.5 8.1 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M122 182V154\" stroke=\"#5a3b22\" stroke-width=\"3.2\" stroke-linecap=\"round\"/><path d=\"M122 164c0-9 7-13 15-13 0 9-6 13-15 13z\" fill=\"#6cbf90\"/><path d=\"M122 158c0-8-6-12-13-12 0 8 5 12 13 12z\" fill=\"#3f8f6a\"/><ellipse cx=\"122\" cy=\"184\" rx=\"15\" ry=\"4.5\" fill=\"#8a6a3b\"/><path d=\"M100 150v10\" stroke=\"#6b4a2b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><path d=\"M170 170h14l-3 14h-8z\" fill=\"#7a5a3c\"/><path d=\"M170 170h14\" stroke=\"#5a3b22\" stroke-width=\"2\"/><g transform=\"translate(108 186) scale(0.9)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(8 176)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e86a5a\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"34\" cy=\"34\" r=\"33.800000000000004\" fill=\"url(#glow)\"/><circle cx=\"34\" cy=\"34\" r=\"13\" fill=\"#f8d252\"/><g transform=\"translate(116 28) scale(0.9)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M78 50q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><g transform=\"translate(152 118) scale(1.05)\"><ellipse cx=\"0\" cy=\"31\" rx=\"30\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><rect x=\"-22\" y=\"0\" width=\"44\" height=\"30\" fill=\"#f4e6c8\"/><rect x=\"-22\" y=\"0\" width=\"12\" height=\"30\" fill=\"#000\" opacity=\".06\"/><path d=\"M-30 3L0 -28 30 3z\" fill=\"#8a6a3b\"/><path d=\"M-30 3L0 -28 30 3z\" fill=\"#000\" opacity=\".08\" transform=\"translate(0 0)\"/><path d=\"M-22 0L-6 -17M-12 1L4 -16M-2 2L12 -13M8 2L19 -8M-26 3L-14 -9\" stroke=\"#6a4c2a\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"-6\" y=\"10\" width=\"12\" height=\"20\" rx=\"3\" fill=\"#6b4a2b\"/><circle cx=\"3\" cy=\"21\" r=\"1\" fill=\"#e6c78a\"/><rect x=\"10\" y=\"9\" width=\"8\" height=\"8\" rx=\"1\" fill=\"#9bd0c8\" stroke=\"#6b4a2b\" stroke-width=\"1.5\"/></g><g transform=\"translate(22 100) scale(0.85)\"><ellipse cx=\"0\" cy=\"32\" rx=\"18\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><path d=\"M-3 32L-4 8Q0 4 4 8L3 32z\" fill=\"#7a5a3c\"/><path d=\"M0 14l-8-8M0 18l8-8\" stroke=\"#6a4c33\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"0\" cy=\"-6\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-14\" cy=\"4\" r=\"13\" fill=\"#2f7556\"/><circle cx=\"14\" cy=\"4\" r=\"13\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#6cbf90\"/><circle cx=\"10\" cy=\"-4\" r=\"6\" fill=\"#6cbf90\" opacity=\".7\"/></g><path d=\"M0 170Q50 162 100 169 T200 167V200H0z\" fill=\"#d9c68e\"/><path d=\"M0 184Q60 178 120 184 T200 180V200H0z\" fill=\"#c9b57a\"/><path d=\"M96 168h80M96 178h80\" stroke=\"#b89a5a\" stroke-width=\"2\" opacity=\".0\"/><path d=\"M118 150h66v3h-66zM120 138v30M140 138v30M160 138v30M180 138v30\" stroke=\"#a98456\" stroke-width=\"3\" opacity=\".0\"/><ellipse cx=\"52\" cy=\"172\" rx=\"29.700000000000003\" ry=\"4.8\" fill=\"#000\" opacity=\".13\"/><path d=\"M25 172Q29.1 139 35.8 132.2Q52 123.5 68.2 132.2Q75 139 79 172z\" fill=\"#a8402f\"/><path d=\"M56 134.9Q73.6 140.3 79 172H61.5z\" fill=\"#000\" opacity=\".1\"/><path d=\"M25.7 165.2H78.3\" stroke=\"#f2c94c\" stroke-width=\"6.1\"/><path d=\"M35.8 132.2Q54.7 149.8 72.2 134.9\" stroke=\"#f2c94c\" stroke-width=\"4\" fill=\"none\" opacity=\".9\"/><ellipse cx=\"42.5\" cy=\"174\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><ellipse cx=\"61.5\" cy=\"174\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><path d=\"M34.5 134.3L74 138\" stroke=\"#a8402f\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"74\" cy=\"138\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"72.7\" cy=\"138\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><path d=\"M69.5 134.3L36 138\" stroke=\"#a8402f\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"36\" cy=\"138\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"34.6\" cy=\"138\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><rect x=\"47.7\" y=\"121.5\" width=\"8.6\" height=\"12.2\" fill=\"#b87d55\"/><path d=\"M33.8 128.2Q31.8 91.8 52 93.1Q72.2 91.8 70.2 128.2Q52 119.4 33.8 128.2z\" fill=\"#a8402f\"/><path d=\"M56 93.1Q72.2 93.1 70.2 128.2Q64.2 121.5 58.8 120.1z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"52\" cy=\"112\" rx=\"12.8\" ry=\"13.8\" fill=\"#d19a6e\"/><ellipse cx=\"58.8\" cy=\"114\" rx=\"5.7\" ry=\"10.8\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"39.2\" cy=\"113.3\" r=\"2.3\" fill=\"#b87d55\"/><circle cx=\"64.8\" cy=\"113.3\" r=\"2.3\" fill=\"#b87d55\"/><path d=\"M39.2 109.3Q41.2 97.8 52 97.8Q62.8 97.8 64.8 109.3Q56 102.5 39.2 109.3z\" fill=\"#2f221c\"/><circle cx=\"38.5\" cy=\"119.4\" r=\"2.3\" fill=\"#f2c94c\"/><circle cx=\"65.5\" cy=\"119.4\" r=\"2.3\" fill=\"#f2c94c\"/><ellipse cx=\"47.1\" cy=\"113.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><ellipse cx=\"56.9\" cy=\"113.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><path d=\"M45 110.1q2.2 -1.9 4.3 0M54.7 110.1q2.2 -1.9 4.3 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"44.2\" cy=\"117.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"59.8\" cy=\"117.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"52\" cy=\"106.6\" r=\"1.7\" fill=\"#c0392b\"/><path d=\"M48 119.4q4 3.5 8.1 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><g fill=\"#e9c66c\"><circle cx=\"82\" cy=\"146\" r=\"2.2\"/><circle cx=\"90\" cy=\"150\" r=\"2.2\"/><circle cx=\"78\" cy=\"154\" r=\"2.2\"/><circle cx=\"96\" cy=\"144\" r=\"2.2\"/><circle cx=\"86\" cy=\"158\" r=\"2.2\"/><circle cx=\"100\" cy=\"152\" r=\"2.2\"/></g><g transform=\"translate(116 166) scale(0.95 0.95)\"><ellipse cx=\"0\" cy=\"30\" rx=\"26\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><path d=\"M-18 -4Q-34 -20 -24 -34Q-12 -26 -13 -8zM-20 0Q-40 -8 -34 -26Q-20 -22 -17 -4z\" fill=\"#8f4a12\"/><path d=\"M-22 -10Q-30 -20 -24 -30\" stroke=\"#c97a2a\" stroke-width=\"2\" fill=\"none\"/><ellipse cx=\"0\" cy=\"2\" rx=\"22\" ry=\"17\" fill=\"#c0701f\"/><path d=\"M-14 2q12 12 26 0\" stroke=\"#a85a14\" stroke-width=\"2\" fill=\"none\"/><path d=\"M-2 -6Q10 6 -10 12Q-16 0 -2 -6z\" fill=\"#9a5016\"/><path d=\"M-12 -6q6-3 10 0M-8 -1q6-3 10 0\" stroke=\"#e0a24a\" stroke-width=\"1.6\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"17\" cy=\"-15\" r=\"10.5\" fill=\"#c0701f\"/><path d=\"M11 -27q3-9 8-2q4-7 7 2q3-4 5 0\" fill=\"#c0392b\"/><path d=\"M26 -14l11 3-11 3z\" fill=\"#f2c94c\"/><circle cx=\"21\" cy=\"-17\" r=\"2\" fill=\"#222\"/><circle cx=\"21.6\" cy=\"-17.6\" r=\".7\" fill=\"#fff\"/><path d=\"M13 -5q3 9 -1 11\" stroke=\"#c0392b\" stroke-width=\"3.4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M-4 18v13M6 18v13\" stroke=\"#d8a31a\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M-9 31h9M1 31h9\" stroke=\"#d8a31a\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></g><g transform=\"translate(86 186) scale(1)\"><ellipse cx=\"2\" cy=\"12\" rx=\"9\" ry=\"2\" fill=\"#000\" opacity=\".1\"/><circle cx=\"0\" cy=\"0\" r=\"7.5\" fill=\"#f6d55c\"/><circle cx=\"7\" cy=\"-6\" r=\"5\" fill=\"#f6d55c\"/><path d=\"M11 -6l5 1.6-5 1.6z\" fill=\"#e67e22\"/><circle cx=\"8.2\" cy=\"-7\" r=\"1.1\" fill=\"#222\"/><path d=\"M-1 8v5M3 8v5\" stroke=\"#e67e22\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></g><g transform=\"translate(146 186) scale(0.95)\"><ellipse cx=\"2\" cy=\"12\" rx=\"9\" ry=\"2\" fill=\"#000\" opacity=\".1\"/><circle cx=\"0\" cy=\"0\" r=\"7.5\" fill=\"#f6d55c\"/><circle cx=\"7\" cy=\"-6\" r=\"5\" fill=\"#f6d55c\"/><path d=\"M11 -6l5 1.6-5 1.6z\" fill=\"#e67e22\"/><circle cx=\"8.2\" cy=\"-7\" r=\"1.1\" fill=\"#222\"/><path d=\"M-1 8v5M3 8v5\" stroke=\"#e67e22\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></g><g transform=\"translate(162 178) scale(0.85)\"><ellipse cx=\"2\" cy=\"12\" rx=\"9\" ry=\"2\" fill=\"#000\" opacity=\".1\"/><circle cx=\"0\" cy=\"0\" r=\"7.5\" fill=\"#f6d55c\"/><circle cx=\"7\" cy=\"-6\" r=\"5\" fill=\"#f6d55c\"/><path d=\"M11 -6l5 1.6-5 1.6z\" fill=\"#e67e22\"/><circle cx=\"8.2\" cy=\"-7\" r=\"1.1\" fill=\"#222\"/><path d=\"M-1 8v5M3 8v5\" stroke=\"#e67e22\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></g><g transform=\"translate(20 176) scale(1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(184 176)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e0a526\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g><g transform=\"translate(10 182)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e86a5a\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"166\" cy=\"32\" r=\"33.800000000000004\" fill=\"url(#glow)\"/><circle cx=\"166\" cy=\"32\" r=\"13\" fill=\"#f8d252\"/><g transform=\"translate(32 32) scale(1)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M100 46q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><path d=\"M0 172Q50 164 100 171 T200 169V200H0z\" fill=\"#d9c68e\"/><path d=\"M0 186Q60 180 120 186 T200 182V200H0z\" fill=\"#c9b57a\"/><g transform=\"translate(34 118)\"><ellipse cx=\"0\" cy=\"56\" rx=\"26\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><rect x=\"-3\" y=\"22\" width=\"6\" height=\"34\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"0\" r=\"25\" fill=\"#3f8f6a\"/><circle cx=\"-21\" cy=\"10\" r=\"16\" fill=\"#2f7556\"/><circle cx=\"21\" cy=\"10\" r=\"16\" fill=\"#3f8f6a\"/><circle cx=\"-6\" cy=\"-13\" r=\"10\" fill=\"#6cbf90\"/><g fill=\"#6a2c8a\"><circle cx=\"-10\" cy=\"4\" r=\"4.2\"/><circle cx=\"7\" cy=\"-3\" r=\"4.2\"/><circle cx=\"15\" cy=\"11\" r=\"4.2\"/><circle cx=\"-19\" cy=\"17\" r=\"4.2\"/><circle cx=\"2\" cy=\"14\" r=\"4.2\"/></g><g fill=\"#c0392b\"><circle cx=\"-2\" cy=\"-9\" r=\"3.6\"/><circle cx=\"19\" cy=\"2\" r=\"3.6\"/><circle cx=\"-14\" cy=\"-3\" r=\"3.6\"/></g><g fill=\"#fff\" opacity=\".55\"><circle cx=\"-11\" cy=\"3\" r=\"1\"/><circle cx=\"6\" cy=\"-4\" r=\"1\"/><circle cx=\"14\" cy=\"10\" r=\"1\"/></g></g><ellipse cx=\"112\" cy=\"172\" rx=\"31.900000000000002\" ry=\"5.1\" fill=\"#000\" opacity=\".13\"/><path d=\"M83 172Q87.3 129 94.6 121.8Q112 112.3 129.4 121.8Q136.7 129 141 172z\" fill=\"#b4a655\"/><path d=\"M116.3 124.7Q135.2 130.4 141 172H122.2z\" fill=\"#000\" opacity=\".1\"/><path d=\"M83.7 164.8H140.3\" stroke=\"#fff\" stroke-width=\"6.5\"/><path d=\"M94.6 121.8Q114.9 140.6 133.8 124.7\" stroke=\"#fff\" stroke-width=\"4.3\" fill=\"none\" opacity=\".9\"/><ellipse cx=\"101.8\" cy=\"174.2\" rx=\"7.2\" ry=\"3.2\" fill=\"#6b4a2b\"/><ellipse cx=\"122.2\" cy=\"174.2\" rx=\"7.2\" ry=\"3.2\" fill=\"#6b4a2b\"/><path d=\"M93.2 123.9L88 138\" stroke=\"#b4a655\" stroke-width=\"12.3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"88\" cy=\"138\" r=\"5.8\" fill=\"#d19a6e\"/><circle cx=\"86.5\" cy=\"138\" r=\"7.5\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.3\" opacity=\".0\"/><path d=\"M130.8 123.9L132 142\" stroke=\"#b4a655\" stroke-width=\"12.3\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"132\" cy=\"142\" r=\"5.8\" fill=\"#d19a6e\"/><circle cx=\"130.6\" cy=\"142\" r=\"7.5\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.3\" opacity=\".0\"/><rect x=\"107.4\" y=\"110.2\" width=\"9.3\" height=\"13.1\" fill=\"#b87d55\"/><path d=\"M92.4 117.4Q90.2 78.2 112 79.7Q133.8 78.2 131.6 117.4Q112 108 92.4 117.4z\" fill=\"#b4a655\"/><path d=\"M116.3 79.7Q133.8 79.7 131.6 117.4Q125 110.2 119.2 108.7z\" fill=\"#000\" opacity=\".1\"/><ellipse cx=\"112\" cy=\"100\" rx=\"13.8\" ry=\"14.8\" fill=\"#d19a6e\"/><ellipse cx=\"119.2\" cy=\"102.2\" rx=\"6.1\" ry=\"11.6\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"98.2\" cy=\"101.5\" r=\"2.5\" fill=\"#b87d55\"/><circle cx=\"125.8\" cy=\"101.5\" r=\"2.5\" fill=\"#b87d55\"/><path d=\"M98.2 97.1Q100.4 84.8 112 84.8Q123.6 84.8 125.8 97.1Q116.3 89.8 98.2 97.1z\" fill=\"#2f221c\"/><circle cx=\"97.5\" cy=\"108\" r=\"2.5\" fill=\"#f2c94c\"/><circle cx=\"126.5\" cy=\"108\" r=\"2.5\" fill=\"#f2c94c\"/><ellipse cx=\"106.8\" cy=\"101.7\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><ellipse cx=\"117.2\" cy=\"101.7\" rx=\"1.8\" ry=\"2.2\" fill=\"#2f221c\"/><path d=\"M104.5 98q2.3 -2 4.6 0M114.9 98q2.3 -2 4.6 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"103.6\" cy=\"106.1\" r=\"2.5\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"120.4\" cy=\"106.1\" r=\"2.5\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"112\" cy=\"94.2\" r=\"1.8\" fill=\"#c0392b\"/><path d=\"M107.7 108q4.3 3.8 8.7 0\" stroke=\"#7a3f2d\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M76 134h30l-4 19H80z\" fill=\"#b98e5a\"/><path d=\"M76 134h30\" stroke=\"#8f6a3b\" stroke-width=\"2\"/><path d=\"M78 134q13-14 26 0\" stroke=\"#8f6a3b\" stroke-width=\"3\" fill=\"none\"/><path d=\"M80 142l20 4M80 148l20 3\" stroke=\"#d4ab74\" stroke-width=\"1.2\" opacity=\".7\"/><g fill=\"#6a2c8a\"><circle cx=\"84\" cy=\"131\" r=\"3.8\"/><circle cx=\"92\" cy=\"128\" r=\"3.8\"/><circle cx=\"100\" cy=\"131\" r=\"3.8\"/></g><g fill=\"#c0392b\"><circle cx=\"88\" cy=\"133\" r=\"3.2\"/><circle cx=\"96\" cy=\"133\" r=\"3.2\"/></g><g transform=\"translate(168 152) scale(1.2)\"><ellipse cx=\"0\" cy=\"17\" rx=\"12\" ry=\"2.6\" fill=\"#000\" opacity=\".12\"/><path d=\"M-12 -4Q-15 14 0 17Q15 14 12 -4z\" fill=\"#a0562f\"/><path d=\"M4 -3Q10 6 2 16Q14 12 12 -4z\" fill=\"#000\" opacity=\".12\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"12\" ry=\"4.5\" fill=\"#6b3a22\"/><ellipse cx=\"0\" cy=\"-4.5\" rx=\"9.6\" ry=\"3.2\" fill=\"#fbf7e8\"/><path d=\"M-6 -5q3 2 6 0\" stroke=\"#e9e1c4\" stroke-width=\"1\" fill=\"none\"/><path d=\"M-10 5Q0 8.5 10 5M-11 9Q0 12.5 11 9\" stroke=\"#d29265\" stroke-width=\"1.3\" fill=\"none\"/></g><path d=\"M160 120q-7-9 0-15t0-15M171 120q-7-9 0-15t0-15\" stroke=\"#fff\" stroke-width=\"3.2\" stroke-linecap=\"round\" fill=\"none\" opacity=\".95\"/><path d=\"M152 172q16 7 34 0\" stroke=\"#bda46a\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/><g transform=\"translate(130 178) scale(1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(186 178)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e0a526\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g><g transform=\"translate(8 182)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e86a5a\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"168\" cy=\"30\" r=\"28.6\" fill=\"url(#glow)\"/><circle cx=\"168\" cy=\"30\" r=\"11\" fill=\"#f8d252\"/><g transform=\"translate(40 30) scale(0.8)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M110 40q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 118Q30 84 62 104T128 92T200 104V200H0z\" fill=\"#a9d4c0\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><g transform=\"translate(22 96) scale(1)\"><ellipse cx=\"0\" cy=\"32\" rx=\"18\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><path d=\"M-3 32L-4 8Q0 4 4 8L3 32z\" fill=\"#7a5a3c\"/><path d=\"M0 14l-8-8M0 18l8-8\" stroke=\"#6a4c33\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"0\" cy=\"-6\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-14\" cy=\"4\" r=\"13\" fill=\"#2f7556\"/><circle cx=\"14\" cy=\"4\" r=\"13\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#6cbf90\"/><circle cx=\"10\" cy=\"-4\" r=\"6\" fill=\"#6cbf90\" opacity=\".7\"/></g><g transform=\"translate(176 96) scale(1.1)\"><ellipse cx=\"0\" cy=\"32\" rx=\"18\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><path d=\"M-3 32L-4 8Q0 4 4 8L3 32z\" fill=\"#7a5a3c\"/><path d=\"M0 14l-8-8M0 18l8-8\" stroke=\"#6a4c33\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"0\" cy=\"-6\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-14\" cy=\"4\" r=\"13\" fill=\"#2f7556\"/><circle cx=\"14\" cy=\"4\" r=\"13\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#6cbf90\"/><circle cx=\"10\" cy=\"-4\" r=\"6\" fill=\"#6cbf90\" opacity=\".7\"/></g><g transform=\"translate(104 88) scale(0.72)\"><ellipse cx=\"0\" cy=\"32\" rx=\"18\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><path d=\"M-3 32L-4 8Q0 4 4 8L3 32z\" fill=\"#7a5a3c\"/><path d=\"M0 14l-8-8M0 18l8-8\" stroke=\"#6a4c33\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"0\" cy=\"-6\" r=\"19\" fill=\"#2f7556\"/><circle cx=\"-14\" cy=\"4\" r=\"13\" fill=\"#256046\"/><circle cx=\"14\" cy=\"4\" r=\"13\" fill=\"#2f7556\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#3f8f6a\"/><circle cx=\"10\" cy=\"-4\" r=\"6\" fill=\"#3f8f6a\" opacity=\".7\"/></g><g transform=\"translate(132 94) scale(0.6)\"><ellipse cx=\"0\" cy=\"32\" rx=\"18\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><path d=\"M-3 32L-4 8Q0 4 4 8L3 32z\" fill=\"#7a5a3c\"/><path d=\"M0 14l-8-8M0 18l8-8\" stroke=\"#6a4c33\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"0\" cy=\"-6\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-14\" cy=\"4\" r=\"13\" fill=\"#2f7556\"/><circle cx=\"14\" cy=\"4\" r=\"13\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#6cbf90\"/><circle cx=\"10\" cy=\"-4\" r=\"6\" fill=\"#6cbf90\" opacity=\".7\"/></g><path d=\"M0 172Q50 164 100 171 T200 169V200H0z\" fill=\"#d9c68e\"/><path d=\"M0 186Q60 180 120 186 T200 182V200H0z\" fill=\"#cdb97c\"/><path d=\"M20 178Q100 168 190 180\" stroke=\"#c4a965\" stroke-width=\"12\" opacity=\".0\"/><g transform=\"translate(146 154) scale(0.9)\"><ellipse cx=\"0\" cy=\"24\" rx=\"34\" ry=\"4\" fill=\"#000\" opacity=\".15\"/><rect x=\"-30\" y=\"-14\" width=\"60\" height=\"26\" rx=\"5\" fill=\"#3a7d58\"/><rect x=\"-30\" y=\"-14\" width=\"60\" height=\"9\" rx=\"4\" fill=\"#4d9a70\"/><path d=\"M-20 -14L-14 -30H16L24 -14z\" fill=\"#2f6a4a\"/><rect x=\"-11\" y=\"-28\" width=\"11\" height=\"12\" rx=\"1.5\" fill=\"#cfeae6\"/><rect x=\"3\" y=\"-28\" width=\"12\" height=\"12\" rx=\"1.5\" fill=\"#cfeae6\"/><path d=\"M-24 -30H20\" stroke=\"#26543c\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"-4\" cy=\"-33\" r=\"5.5\" fill=\"#d19a6e\"/><circle cx=\"9\" cy=\"-33\" r=\"5.5\" fill=\"#b87d55\"/><path d=\"M-9 -36q5-5 10 0\" fill=\"#2f221c\"/><path d=\"M4 -36q5-5 10 0\" fill=\"#2f221c\"/><circle cx=\"-18\" cy=\"14\" r=\"9\" fill=\"#2a2a28\"/><circle cx=\"18\" cy=\"14\" r=\"9\" fill=\"#2a2a28\"/><circle cx=\"-18\" cy=\"14\" r=\"3.6\" fill=\"#a9a9a2\"/><circle cx=\"18\" cy=\"14\" r=\"3.6\" fill=\"#a9a9a2\"/><rect x=\"24\" y=\"-6\" width=\"8\" height=\"6\" rx=\"2\" fill=\"#f2c94c\"/></g><g transform=\"translate(70 158) scale(-0.95 0.95)\"><ellipse cx=\"0\" cy=\"34\" rx=\"40\" ry=\"5\" fill=\"#000\" opacity=\".13\"/><path d=\"M-30 -4Q-52 -8 -48 -28\" stroke=\"#e67e22\" stroke-width=\"7.5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M-44 -22l2 4M-48 -14l3 3\" stroke=\"#2b1a10\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><ellipse cx=\"0\" cy=\"0\" rx=\"32\" ry=\"16\" fill=\"#e67e22\"/><path d=\"M-20 8Q0 18 24 8\" fill=\"#fbe3c4\"/><path d=\"M-14 -15v15M-5 -16v17M5 -15v16M15 -13v14M-24 -9v11\" stroke=\"#2b1a10\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M-20 12v20M-6 14v19M12 14v19M24 12v20\" stroke=\"#e67e22\" stroke-width=\"8\" stroke-linecap=\"round\"/><path d=\"M-22 32h7M-8 33h7M10 33h7M22 32h7\" stroke=\"#fbe3c4\" stroke-width=\"5\" stroke-linecap=\"round\"/><circle cx=\"32\" cy=\"-8\" r=\"13\" fill=\"#e67e22\"/><path d=\"M24 -19l-4-10 10 4zM38 -20l5-9 5 9z\" fill=\"#e67e22\"/><path d=\"M24 -19l-2-6 5 3z\" fill=\"#fbe3c4\"/><path d=\"M27 -18q-2 5 0 9M34 -19q-2 5 0 9M40 -15q-1 3 0 6\" stroke=\"#2b1a10\" stroke-width=\"2.2\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"38\" cy=\"-2\" rx=\"7\" ry=\"5\" fill=\"#fbe3c4\"/><circle cx=\"43\" cy=\"-3.5\" r=\"2\" fill=\"#2b1a10\"/><circle cx=\"35\" cy=\"-10\" r=\"2.4\" fill=\"#2b1a10\"/><circle cx=\"35.7\" cy=\"-10.8\" r=\".8\" fill=\"#fff\"/><path d=\"M38 0q3 4 7 1\" stroke=\"#2b1a10\" stroke-width=\"1.5\" fill=\"none\" stroke-linecap=\"round\"/></g><g transform=\"translate(34 128) scale(0.55)\"><ellipse cx=\"0\" cy=\"31\" rx=\"30\" ry=\"4\" fill=\"#000\" opacity=\".1\"/><rect x=\"-22\" y=\"0\" width=\"44\" height=\"30\" fill=\"#f4e6c8\"/><rect x=\"-22\" y=\"0\" width=\"12\" height=\"30\" fill=\"#000\" opacity=\".06\"/><path d=\"M-30 3L0 -28 30 3z\" fill=\"#8a6a3b\"/><path d=\"M-30 3L0 -28 30 3z\" fill=\"#000\" opacity=\".08\" transform=\"translate(0 0)\"/><path d=\"M-22 0L-6 -17M-12 1L4 -16M-2 2L12 -13M8 2L19 -8M-26 3L-14 -9\" stroke=\"#6a4c2a\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"-6\" y=\"10\" width=\"12\" height=\"20\" rx=\"3\" fill=\"#6b4a2b\"/><circle cx=\"3\" cy=\"21\" r=\"1\" fill=\"#e6c78a\"/><rect x=\"10\" y=\"9\" width=\"8\" height=\"8\" rx=\"1\" fill=\"#9bd0c8\" stroke=\"#6b4a2b\" stroke-width=\"1.5\"/></g><g transform=\"translate(10 178) scale(1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(100 184) scale(1.2)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(186 184)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e0a526\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#cfeae6\"/><stop offset=\".65\" stop-color=\"#f4f1dc\"/><stop offset=\"1\" stop-color=\"#f8e9bf\"/></linearGradient><radialGradient id=\"glow\"><stop offset=\"0\" stop-color=\"#fff3b0\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#fff3b0\" stop-opacity=\"0\"/></radialGradient></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><circle cx=\"34\" cy=\"34\" r=\"31.200000000000003\" fill=\"url(#glow)\"/><circle cx=\"34\" cy=\"34\" r=\"12\" fill=\"#f8d252\"/><g transform=\"translate(120 28) scale(0.9)\" fill=\"#fff\" opacity=\"0.95\"><circle cx=\"0\" cy=\"0\" r=\"8\"/><circle cx=\"11\" cy=\"-5\" r=\"10\"/><circle cx=\"24\" cy=\"-1\" r=\"8.5\"/><rect x=\"-8\" y=\"0\" width=\"41\" height=\"8\" rx=\"4\"/></g><path d=\"M80 44q3 -4 6 0q3 -4 6 0\" stroke=\"#4a5d57\" stroke-width=\"1.3\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 126Q34 96 78 116T152 108T200 112V200H0z\" fill=\"#bfe0d6\"/><path d=\"M0 140Q46 112 96 134T200 128V200H0z\" fill=\"#a5d3c3\"/><path d=\"M0 156Q54 134 104 150T200 144V200H0z\" fill=\"#8fc7b0\"/><path d=\"M0 172Q50 164 100 171 T200 169V200H0z\" fill=\"#d9c68e\"/><path d=\"M0 186Q60 180 120 186 T200 182V200H0z\" fill=\"#c9b57a\"/><clipPath id=\"wl\"><rect x=\"100\" y=\"114\" width=\"72\" height=\"56\"/></clipPath><g clip-path=\"url(#wl)\"><rect x=\"93\" y=\"114\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"107\" y=\"114\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"121\" y=\"114\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"135\" y=\"114\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"149\" y=\"114\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"163\" y=\"114\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"100\" y=\"121\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"114\" y=\"121\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"128\" y=\"121\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"142\" y=\"121\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"156\" y=\"121\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"170\" y=\"121\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"93\" y=\"128\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"107\" y=\"128\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"121\" y=\"128\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"135\" y=\"128\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"149\" y=\"128\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"163\" y=\"128\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"100\" y=\"135\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"114\" y=\"135\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"128\" y=\"135\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"142\" y=\"135\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"156\" y=\"135\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"170\" y=\"135\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"93\" y=\"142\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"107\" y=\"142\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"121\" y=\"142\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"135\" y=\"142\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"149\" y=\"142\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"163\" y=\"142\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"100\" y=\"149\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"114\" y=\"149\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"128\" y=\"149\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"142\" y=\"149\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"156\" y=\"149\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"170\" y=\"149\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"93\" y=\"156\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"107\" y=\"156\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"121\" y=\"156\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"135\" y=\"156\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"149\" y=\"156\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"163\" y=\"156\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"100\" y=\"163\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"114\" y=\"163\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"128\" y=\"163\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"142\" y=\"163\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"156\" y=\"163\" width=\"14\" height=\"7\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"170\" y=\"163\" width=\"14\" height=\"7\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"100\" y=\"114\" width=\"20\" height=\"56\" fill=\"#000\" opacity=\".08\"/></g><path d=\"M92 116L136 80 180 116\" stroke=\"#7a5a3c\" stroke-width=\"5.5\" fill=\"none\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M104 116V98M120 116V90M136 80V116M152 116V90M168 116V98\" stroke=\"#7a5a3c\" stroke-width=\"3.5\"/><rect x=\"124\" y=\"140\" width=\"24\" height=\"30\" rx=\"2\" fill=\"#6b4a2b\"/><rect x=\"152\" y=\"130\" width=\"14\" height=\"14\" rx=\"1\" fill=\"#bfe0da\" stroke=\"#7a5a3c\" stroke-width=\"2.5\"/><path d=\"M170 120l12 52M180 116l12 56\" stroke=\"#8f6a3b\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M173 132h8M176 146h8M179 160h8\" stroke=\"#8f6a3b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><path d=\"M8 174l24-32 24 32z\" fill=\"#e6c57e\"/><path d=\"M26 174l8-12 10 12z\" fill=\"#d1ae61\"/><path d=\"M8 174l24-32\" stroke=\"#f0d899\" stroke-width=\"2\"/><g transform=\"translate(58 162)\"><rect x=\"0\" y=\"0\" width=\"22\" height=\"9\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"3\" y=\"-9\" width=\"22\" height=\"9\" fill=\"#b9552f\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"0\" y=\"-18\" width=\"22\" height=\"9\" fill=\"#c9633a\" stroke=\"#8f3f22\" stroke-width=\".7\"/></g><g><ellipse cx=\"16\" cy=\"184\" rx=\"13\" ry=\"6.5\" fill=\"#8e8e86\"/><ellipse cx=\"38\" cy=\"188\" rx=\"11\" ry=\"5.5\" fill=\"#a9a9a0\"/><ellipse cx=\"54\" cy=\"183\" rx=\"8\" ry=\"4.5\" fill=\"#7b7b73\"/></g><g><rect x=\"74\" y=\"178\" width=\"42\" height=\"8\" rx=\"4\" fill=\"#9c7442\"/><rect x=\"78\" y=\"169\" width=\"42\" height=\"8\" rx=\"4\" fill=\"#b98e5a\"/><circle cx=\"76\" cy=\"182\" r=\"3\" fill=\"#d8b27c\"/><circle cx=\"80\" cy=\"173\" r=\"3\" fill=\"#d8b27c\"/></g><ellipse cx=\"78\" cy=\"170\" rx=\"29.700000000000003\" ry=\"4.8\" fill=\"#000\" opacity=\".13\"/><path d=\"M51 170Q55 125 61.8 118.2Q78 109.5 94.2 118.2Q101 125 105 170z\" fill=\"#0b8a7e\"/><path d=\"M82 121Q99.6 126.3 105 170H87.5z\" fill=\"#000\" opacity=\".1\"/><path d=\"M51.7 163.2H104.3\" stroke=\"#fff\" stroke-width=\"6.1\"/><ellipse cx=\"68.5\" cy=\"172\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><ellipse cx=\"87.5\" cy=\"172\" rx=\"6.8\" ry=\"3\" fill=\"#6b4a2b\"/><path d=\"M60.5 120.3L102 124\" stroke=\"#0b8a7e\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"102\" cy=\"124\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"100.7\" cy=\"124\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><path d=\"M95.5 120.3L100 132\" stroke=\"#0b8a7e\" stroke-width=\"11.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"100\" cy=\"132\" r=\"5.4\" fill=\"#d19a6e\"/><circle cx=\"98.7\" cy=\"132\" r=\"7\" fill=\"none\" stroke=\"#f2c94c\" stroke-width=\"2.2\" opacity=\".0\"/><rect x=\"73.7\" y=\"107.5\" width=\"8.6\" height=\"12.2\" fill=\"#b87d55\"/><ellipse cx=\"78\" cy=\"98\" rx=\"12.8\" ry=\"13.8\" fill=\"#d19a6e\"/><ellipse cx=\"84.8\" cy=\"100\" rx=\"5.7\" ry=\"10.8\" fill=\"#b87d55\" opacity=\".25\"/><circle cx=\"65.2\" cy=\"99.3\" r=\"2.3\" fill=\"#b87d55\"/><circle cx=\"90.8\" cy=\"99.3\" r=\"2.3\" fill=\"#b87d55\"/><path d=\"M62.5 97.3a15.5 17.6 0 0 1 31 0q-15.5 -8.1 -31 0z\" fill=\"#0b8a7e\"/><path d=\"M65.8 89.9q12.2 -10.8 24.3 -1.4M68.5 85.2q9.4 -6.8 20.2 -1.4\" stroke=\"#fff\" stroke-opacity=\".55\" stroke-width=\"1.3\" fill=\"none\"/><ellipse cx=\"73.1\" cy=\"99.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><ellipse cx=\"82.9\" cy=\"99.6\" rx=\"1.7\" ry=\"2.1\" fill=\"#2f221c\"/><path d=\"M71 96.1q2.2 -1.9 4.3 0M80.7 96.1q2.2 -1.9 4.3 0\" stroke=\"#2f221c\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"70.2\" cy=\"103.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><circle cx=\"85.8\" cy=\"103.7\" r=\"2.3\" fill=\"#e07a5f\" opacity=\".35\"/><path d=\"M70.6 104.8q7.4 3.8 14.9 0\" stroke=\"#2f221c\" stroke-width=\"2.8\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M96 134l10-12\" stroke=\"#7a5a3c\" stroke-width=\"3\" stroke-linecap=\"round\"/><rect x=\"100\" y=\"116\" width=\"14\" height=\"6\" rx=\"1\" fill=\"#c9c9c0\" transform=\"rotate(-25 107 119)\"/><g transform=\"translate(188 176) scale(1)\" stroke=\"#2f7556\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"><path d=\"M0 0q-2-7-5-9M0 0q0-9 0-12M0 0q2-7 5-9\"/></g><g transform=\"translate(8 176)\"><path d=\"M0 0v-8\" stroke=\"#2f7556\" stroke-width=\"1.5\"/><circle cx=\"0\" cy=\"-10\" r=\"3.2\" fill=\"#e86a5a\"/><circle cx=\"0\" cy=\"-10\" r=\"1.2\" fill=\"#fff\"/></g></svg>"];
    // [question, explanation, illustration].
    var QUESTIONS = [
      ['Have you ever borrowed curd from a neighbour to set your curd?', 'The bacteria of the curd is not owned by any individual, sharing is the norm that governs this common pool resource.', ILL[0]],
      ['Have you ever asked your neighbour to pick up your child from school when you weren’t able to?', 'The act of your neighbor picking up your child is based on practices of commoning. Such customs assume a shared and secured space for children that is guaranteed by the norms of a community.', ILL[1]],
      ['Have you participated in activities like lake cleaning, planting drives etc.?', 'With increasing concerns over environment, it is no longer sufficient to depend solely on governments or enterprise to address these questions. Thus it becomes important to have vigilant and involved communities for collective action towards strengthening conservation efforts.', ILL[2]],
      ['Do you like country chicken?', 'Commercial meat industries e.g. poultry is among the least nutritious sources of meat. Commercial poultry is also one of the most polluting forms of animal rearing. In contrast, country chickens are reared and managed around common pool resources.', ILL[3]],
      ['Have you ever had wild berries, kashayam (kadha)?', 'Home remedies like kashayams and kadhas are often passed on from one generation to the next, and represent commonly held knowledge of the communities. Similarly, things like wild berries and medicinal herbs are mostly found and procured from common spaces like pastures, forests, ponds.', ILL[4]],
      ['Have you been on a wildlife safari?', 'For most part, wildlife reserves have been carved out from community forests. The entire wildlife tourism industry owes a huge debt to the communities who have managed and protected these spaces.', ILL[5]],
      ['Do you live in a house built with sand, stones, bricks and wood?', 'All the materials that go into building a house are sourced from common spaces or from common spaces that have now been privatized.', ILL[6]]
    ];
    var N = QUESTIONS.length;
    var back = document.createElement('div');
    back.className = 'sv-back'; back.setAttribute('aria-hidden', 'true');
    back.innerHTML = '<div class="sv-card" role="dialog" aria-modal="true" aria-labelledby="sv-title">' +
      '<button type="button" class="sv-x" aria-label="Close survey"><i data-lucide="x"></i></button>' +
      '<div class="sv-body" id="sv-body"></div></div>';
    document.body.appendChild(back);
    var body = back.querySelector('#sv-body'), answers = [], prior = [], step = -1;   // -1 = intro

    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function go() { location.href = TARGET; }
    function save() { try { localStorage.setItem('ic_commoner_survey', JSON.stringify({ answers: answers, yes: answers.filter(function (a) { return a === 'yes'; }).length, at: Date.now() })); } catch (e) {} }
    var doneTimer = null;
    function render() {
      if (step >= N) {                                   // finished: a thank-you message, no navigation
        var yes = answers.filter(function (a) { return a === 'yes'; }).length;
        body.innerHTML = '<div class="sv-done"><span class="sv-done-ic"><i data-lucide="check"></i></span>' +
          '<h2 id="sv-title">Thank you!</h2><p class="sv-done-p">Your survey has been submitted.</p>' +
          '<p class="sv-done-score">You answered <b>Yes</b> to ' + yes + ' of ' + N + ' everyday ways of commoning.</p>' +
          '<button type="button" class="sv-btn" data-a="close">Close</button><p class="sv-done-note">This window closes by itself in a few seconds.</p></div>';
        if (window.lucide) lucide.createIcons();
        clearTimeout(doneTimer); doneTimer = setTimeout(close, 5000);
        return;
      }
      if (step < 0) {
        body.innerHTML =
          '<div class="sv-hero" style="background-image:url(assets/img/ic-panel-who.jpg)"><div class="sv-hero-in">' +
          '<img class="sv-camel" src="assets/img/ic-camel.png" alt="">' +
          '<h2 id="sv-title">Are you a Commoner?</h2></div></div>' +
          '<div class="sv-pad"><p class="sv-lead">Take this quiz to find out how much of a ‘commoner’ you are</p>' +
          '<p class="sv-sub">' + N + ' short questions about everyday life.</p>' +
          '<div class="sv-actions mid"><button type="button" class="sv-btn" data-a="start">Take Survey <i data-lucide="arrow-right"></i></button></div></div>';
      } else {
        var q = QUESTIONS[step], ans = answers[step], last = step === N - 1;
        body.innerHTML =
          '<div class="sv-top"><button type="button" class="sv-x2 sv-bk" data-a="prev" aria-label="Previous question" title="Previous question"><i data-lucide="arrow-left"></i></button><div class="sv-prog"><i style="width:' + Math.round(((step + (ans ? 1 : 0)) / N) * 100) + '%"></i></div>' +
          '<button type="button" class="sv-x2" data-a="close" aria-label="Close survey"><i data-lucide="x"></i></button></div>' +
          '<div class="sv-qwrap"><div class="sv-figure"><div class="sv-photo">' + q[2] + '</div></div>' +
          '<div class="sv-pad"><h2 class="sv-q" id="sv-title">' + esc(q[0]) + '</h2>' +
          (ans
            ? '<div class="sv-note"><span class="sv-ans ' + ans + '">You said ' + (ans === 'yes' ? 'Yes' : 'No') + '</span>' + esc(q[1]) + '</div>' +
              '<div class="sv-actions end"><button type="button" class="sv-btn" data-a="next">' + (last ? 'Submit' : 'Next') + ' <i data-lucide="' + (last ? 'check' : 'arrow-right') + '"></i></button></div>'
            : '<div class="sv-choices"><button type="button" class="sv-choice no' + (prior[step] === 'no' ? ' was' : '') + '" data-a="no"><i data-lucide="x"></i> No</button><button type="button" class="sv-choice yes' + (prior[step] === 'yes' ? ' was' : '') + '" data-a="yes"><i data-lucide="check"></i> Yes</button></div>') +
          '</div></div>';
      }
      if (window.lucide) lucide.createIcons();
      var f = body.querySelector('.sv-btn, .sv-choice'); if (f) f.focus();
    }
    function open() { clearTimeout(doneTimer); step = -1; answers = []; prior = []; render(); back.classList.add('open'); back.setAttribute('aria-hidden', 'false'); document.body.classList.add('nd-lock'); }
    function close() { clearTimeout(doneTimer); back.classList.remove('open'); back.setAttribute('aria-hidden', 'true'); document.body.classList.remove('nd-lock'); }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'close') return close();
      if (a === 'skip') return go();
      if (a === 'start') { step = 0; return render(); }
      if (a === 'yes' || a === 'no') { answers[step] = a; return render(); }
      if (a === 'prev') {                                   // from question 1 back to the intro
        step = Math.max(-1, step - 1);
        if (step >= 0 && answers[step]) { prior[step] = answers[step]; delete answers[step]; }   // re-answer; the earlier choice stays highlighted
        return render();
      }
      if (a === 'next') { if (step >= N - 1) { save(); step = N; return render(); } step++; return render(); }
    });
    back.querySelector('.sv-x').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', function (e) {
      if (!back.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && step >= 0 && step < N) { step--; if (step >= 0 && answers[step]) { prior[step] = answers[step]; delete answers[step]; } render(); }
    });
    // only the "Take a test! Are you a commoner?" card starts the survey; Who Is a Commoner links open the page directly
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0].replace(/^\.\//, '');
      if (href !== 'are-you-a-commoner.html') return;
      e.preventDefault(); open();
    });
  })();
});
