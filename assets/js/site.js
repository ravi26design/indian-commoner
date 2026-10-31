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
    var ILL = ["<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><g transform=\"translate(30 30) scale(1)\" fill=\"#fff\" opacity=\".9\"><circle cx=\"0\" cy=\"0\" r=\"9\"/><circle cx=\"12\" cy=\"-4\" r=\"11\"/><circle cx=\"25\" cy=\"0\" r=\"9\"/><rect x=\"-9\" y=\"0\" width=\"43\" height=\"9\" rx=\"4\"/></g><circle cx=\"166\" cy=\"34\" r=\"14\" fill=\"#f3d27a\"/><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#cfe6e1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#b6d9d1\"/><g transform=\"translate(34 120) scale(0.9)\"><rect x=\"-22\" y=\"0\" width=\"44\" height=\"30\" fill=\"#f1e3c8\"/><path d=\"M-28 2L0 -26 28 2z\" fill=\"#8a6a3b\"/><path d=\"M-18 -2L-4 -16M-8 0L6 -14M4 0L16 -10\" stroke=\"#6f532c\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"-6\" y=\"10\" width=\"12\" height=\"20\" rx=\"2\" fill=\"#6b4a2b\"/></g><g transform=\"translate(174 106) scale(0.9)\"><rect x=\"-3\" y=\"0\" width=\"6\" height=\"30\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"-8\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"8\" fill=\"#5fae83\"/></g><path d=\"M0 168Q50 160 100 168 T200 166V200H0z\" fill=\"#d8c79a\"/><rect x=\"40\" y=\"150\" width=\"120\" height=\"14\" rx=\"3\" fill=\"#b98e5a\"/><path d=\"M52 150v14M76 150v14M100 150v14M124 150v14M148 150v14\" stroke=\"#9c7442\" stroke-width=\"2\"/><path d=\"M29.5 152L35.5 126.5Q58 117.5 80.5 126.5L86.5 152z\" fill=\"#01796f\"/><path d=\"M37.8 128L84 124\" stroke=\"#01796f\" stroke-width=\"12\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"84\" cy=\"124\" r=\"5.7\" fill=\"#cf9468\"/><path d=\"M78.2 128L84 124\" stroke=\"#01796f\" stroke-width=\"12\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"84\" cy=\"124\" r=\"5.7\" fill=\"#cf9468\"/><circle cx=\"58\" cy=\"101.8\" r=\"19.5\" fill=\"#01796f\"/><circle cx=\"58\" cy=\"104\" r=\"15\" fill=\"#cf9468\"/><circle cx=\"52.3\" cy=\"105.8\" r=\"2\" fill=\"#3b2b24\"/><circle cx=\"63.7\" cy=\"105.8\" r=\"2\" fill=\"#3b2b24\"/><circle cx=\"58\" cy=\"97.7\" r=\"1.9\" fill=\"#c0392b\"/><path d=\"M53.8 111.5q4.2 3.6 8.4 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M113.5 152L119.5 126.5Q142 117.5 164.5 126.5L170.5 152z\" fill=\"#a89c50\"/><path d=\"M121.8 128L116 124\" stroke=\"#a89c50\" stroke-width=\"12\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"116\" cy=\"124\" r=\"5.7\" fill=\"#cf9468\"/><path d=\"M162.2 128L116 124\" stroke=\"#a89c50\" stroke-width=\"12\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"116\" cy=\"124\" r=\"5.7\" fill=\"#cf9468\"/><circle cx=\"142\" cy=\"101.8\" r=\"19.5\" fill=\"#a89c50\"/><circle cx=\"142\" cy=\"104\" r=\"15\" fill=\"#cf9468\"/><circle cx=\"136.3\" cy=\"105.8\" r=\"2\" fill=\"#3b2b24\"/><circle cx=\"147.7\" cy=\"105.8\" r=\"2\" fill=\"#3b2b24\"/><circle cx=\"142\" cy=\"97.7\" r=\"1.9\" fill=\"#c0392b\"/><path d=\"M137.8 111.5q4.2 3.6 8.4 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(100 126) scale(1.05)\"><path d=\"M-12 -4Q-14 14 0 16Q14 14 12 -4z\" fill=\"#8a4b2d\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"12\" ry=\"4.5\" fill=\"#6b3a22\"/><ellipse cx=\"0\" cy=\"-4.5\" rx=\"9.5\" ry=\"3.2\" fill=\"#f7f3e3\"/><path d=\"M-9 6Q0 9 9 6\" stroke=\"#c9895a\" stroke-width=\"1.5\" fill=\"none\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><circle cx=\"30\" cy=\"34\" r=\"13\" fill=\"#f3d27a\"/><g transform=\"translate(120 30) scale(0.9)\" fill=\"#fff\" opacity=\".9\"><circle cx=\"0\" cy=\"0\" r=\"9\"/><circle cx=\"12\" cy=\"-4\" r=\"11\"/><circle cx=\"25\" cy=\"0\" r=\"9\"/><rect x=\"-9\" y=\"0\" width=\"43\" height=\"9\" rx=\"4\"/></g><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#cfe6e1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#b6d9d1\"/><g><rect x=\"118\" y=\"86\" width=\"64\" height=\"46\" fill=\"#f6e7c6\"/><path d=\"M112 88L150 62 188 88z\" fill=\"#b5533c\"/><rect x=\"143\" y=\"104\" width=\"14\" height=\"28\" rx=\"2\" fill=\"#6b4a2b\"/><rect x=\"124\" y=\"98\" width=\"12\" height=\"12\" fill=\"#bfe0da\"/><rect x=\"164\" y=\"98\" width=\"12\" height=\"12\" fill=\"#bfe0da\"/><path d=\"M150 62V42\" stroke=\"#6b4a2b\" stroke-width=\"2.5\"/><path d=\"M150 42l16 5-16 5z\" fill=\"#e67e22\"/></g><path d=\"M0 168Q50 160 100 168 T200 166V200H0z\" fill=\"#d4c493\"/><rect x=\"0\" y=\"170\" width=\"200\" height=\"30\" fill=\"#c8b684\"/><path d=\"M0 184H200\" stroke=\"#fff\" stroke-opacity=\".5\" stroke-width=\"2\" stroke-dasharray=\"10 8\"/><path d=\"M37.5 170L43.5 122.5Q66 113.5 88.5 122.5L94.5 170z\" fill=\"#01796f\"/><path d=\"M45.8 124L98 138\" stroke=\"#01796f\" stroke-width=\"12\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"98\" cy=\"138\" r=\"5.7\" fill=\"#cf9468\"/><path d=\"M86.2 124L40 134\" stroke=\"#01796f\" stroke-width=\"12\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"40\" cy=\"134\" r=\"5.7\" fill=\"#cf9468\"/><circle cx=\"66\" cy=\"97.8\" r=\"19.5\" fill=\"#01796f\"/><circle cx=\"66\" cy=\"100\" r=\"15\" fill=\"#cf9468\"/><circle cx=\"60.3\" cy=\"101.8\" r=\"2\" fill=\"#3b2b24\"/><circle cx=\"71.7\" cy=\"101.8\" r=\"2\" fill=\"#3b2b24\"/><circle cx=\"66\" cy=\"93.7\" r=\"1.9\" fill=\"#c0392b\"/><path d=\"M61.8 107.5q4.2 3.6 8.4 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M86.9 170L90.5 139.5Q104 134.1 117.5 139.5L121.1 170z\" fill=\"#c0392b\"/><path d=\"M91.8 140.4L88 140\" stroke=\"#c0392b\" stroke-width=\"7.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"88\" cy=\"140\" r=\"3.4\" fill=\"#cf9468\"/><path d=\"M116.2 140.4L116 150\" stroke=\"#c0392b\" stroke-width=\"7.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"116\" cy=\"150\" r=\"3.4\" fill=\"#cf9468\"/><circle cx=\"104\" cy=\"126\" r=\"9\" fill=\"#cf9468\"/><path d=\"M95 125.1a9 9.7 0 0 1 18 0q-9 -5.9 -18 0z\" fill=\"#3b2b24\"/><circle cx=\"100.6\" cy=\"127.1\" r=\"1.4\" fill=\"#3b2b24\"/><circle cx=\"107.4\" cy=\"127.1\" r=\"1.4\" fill=\"#3b2b24\"/><path d=\"M101.5 130.5q2.5 2.2 5 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><rect x=\"112\" y=\"136\" width=\"13\" height=\"16\" rx=\"3\" fill=\"#e67e22\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><circle cx=\"166\" cy=\"32\" r=\"13\" fill=\"#f3d27a\"/><g transform=\"translate(40 34) scale(1)\" fill=\"#fff\" opacity=\".9\"><circle cx=\"0\" cy=\"0\" r=\"9\"/><circle cx=\"12\" cy=\"-4\" r=\"11\"/><circle cx=\"25\" cy=\"0\" r=\"9\"/><rect x=\"-9\" y=\"0\" width=\"43\" height=\"9\" rx=\"4\"/></g><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#cfe6e1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#b6d9d1\"/><path d=\"M0 150Q50 128 112 142Q150 150 150 172Q100 192 0 184z\" fill=\"#7fc4c8\"/><path d=\"M14 156q10-5 20 0M60 150q12-5 24 0M40 172q10-5 22 0M92 164q10-5 20 0\" stroke=\"#fff\" stroke-opacity=\".7\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M22 150v-22M30 150v-28M38 150v-20\" stroke=\"#3f8f6a\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M0 176Q50 168 100 176 T200 174V200H0z\" fill=\"#d8c79a\"/><path d=\"M19.3 166L24.5 123.5Q44 115.7 63.5 123.5L68.7 166z\" fill=\"#a89c50\"/><path d=\"M26.4 124.8L62 134\" stroke=\"#a89c50\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"62\" cy=\"134\" r=\"4.9\" fill=\"#cf9468\"/><path d=\"M61.5 124.8L70 150\" stroke=\"#a89c50\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"70\" cy=\"150\" r=\"4.9\" fill=\"#cf9468\"/><circle cx=\"44\" cy=\"104\" r=\"13\" fill=\"#cf9468\"/><path d=\"M28.7 102.7a15.3 16.9 0 0 1 30.7 0q-15.3 -7.8 -30.7 0z\" fill=\"#a89c50\"/><path d=\"M33 94.2q11 -9.1 22.1 -1.9\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.2\" fill=\"none\"/><circle cx=\"39.1\" cy=\"105.6\" r=\"1.8\" fill=\"#3b2b24\"/><circle cx=\"48.9\" cy=\"105.6\" r=\"1.8\" fill=\"#3b2b24\"/><path d=\"M37.5 110.5q6.5 3.9 13 0\" stroke=\"#3b2b24\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M70 150l16-30\" stroke=\"#7a5a3c\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M64 152l14 6\" stroke=\"#7a5a3c\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M125.3 180L130.5 125.5Q150 117.7 169.5 125.5L174.7 180z\" fill=\"#01796f\"/><path d=\"M132.4 126.8L130 146\" stroke=\"#01796f\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"130\" cy=\"146\" r=\"4.9\" fill=\"#cf9468\"/><path d=\"M167.6 126.8L136 156\" stroke=\"#01796f\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"136\" cy=\"156\" r=\"4.9\" fill=\"#cf9468\"/><circle cx=\"150\" cy=\"104\" r=\"16.9\" fill=\"#01796f\"/><circle cx=\"150\" cy=\"106\" r=\"13\" fill=\"#cf9468\"/><circle cx=\"145.1\" cy=\"107.6\" r=\"1.8\" fill=\"#3b2b24\"/><circle cx=\"154.9\" cy=\"107.6\" r=\"1.8\" fill=\"#3b2b24\"/><circle cx=\"150\" cy=\"100.5\" r=\"1.7\" fill=\"#c0392b\"/><path d=\"M146.4 112.5q3.6 3.1 7.3 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M120 178V152\" stroke=\"#5a3b22\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M120 160c0-8 6-12 14-12 0 8-6 12-14 12z\" fill=\"#5fae83\"/><path d=\"M120 156c0-7-5-10-12-10 0 7 5 10 12 10z\" fill=\"#3f8f6a\"/><ellipse cx=\"120\" cy=\"180\" rx=\"14\" ry=\"4\" fill=\"#8a6a3b\"/><path d=\"M176 168h12l-3 12h-6z\" fill=\"#7a5a3c\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><circle cx=\"32\" cy=\"34\" r=\"14\" fill=\"#f3d27a\"/><g transform=\"translate(120 30) scale(0.9)\" fill=\"#fff\" opacity=\".9\"><circle cx=\"0\" cy=\"0\" r=\"9\"/><circle cx=\"12\" cy=\"-4\" r=\"11\"/><circle cx=\"25\" cy=\"0\" r=\"9\"/><rect x=\"-9\" y=\"0\" width=\"43\" height=\"9\" rx=\"4\"/></g><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#cfe6e1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#b6d9d1\"/><g transform=\"translate(150 116) scale(1)\"><rect x=\"-22\" y=\"0\" width=\"44\" height=\"30\" fill=\"#f1e3c8\"/><path d=\"M-28 2L0 -26 28 2z\" fill=\"#8a6a3b\"/><path d=\"M-18 -2L-4 -16M-8 0L6 -14M4 0L16 -10\" stroke=\"#6f532c\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"-6\" y=\"10\" width=\"12\" height=\"20\" rx=\"2\" fill=\"#6b4a2b\"/></g><g transform=\"translate(24 108) scale(0.8)\"><rect x=\"-3\" y=\"0\" width=\"6\" height=\"30\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"-8\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"8\" fill=\"#5fae83\"/></g><path d=\"M0 170Q50 162 100 170 T200 168V200H0z\" fill=\"#d8c79a\"/><path d=\"M20 190h160\" stroke=\"#c4b077\" stroke-width=\"2\" stroke-dasharray=\"3 6\"/><path d=\"M27.3 172L32.5 131.5Q52 123.7 71.5 131.5L76.7 172z\" fill=\"#01796f\"/><path d=\"M34.5 132.8L72 138\" stroke=\"#01796f\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"72\" cy=\"138\" r=\"4.9\" fill=\"#cf9468\"/><path d=\"M69.5 132.8L36 138\" stroke=\"#01796f\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"36\" cy=\"138\" r=\"4.9\" fill=\"#cf9468\"/><circle cx=\"52\" cy=\"110\" r=\"16.9\" fill=\"#01796f\"/><circle cx=\"52\" cy=\"112\" r=\"13\" fill=\"#cf9468\"/><circle cx=\"47.1\" cy=\"113.6\" r=\"1.8\" fill=\"#3b2b24\"/><circle cx=\"56.9\" cy=\"113.6\" r=\"1.8\" fill=\"#3b2b24\"/><circle cx=\"52\" cy=\"106.5\" r=\"1.7\" fill=\"#c0392b\"/><path d=\"M48.4 118.5q3.6 3.1 7.3 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><g fill=\"#e7c36a\"><circle cx=\"80\" cy=\"146\" r=\"2\"/><circle cx=\"88\" cy=\"150\" r=\"2\"/><circle cx=\"76\" cy=\"154\" r=\"2\"/><circle cx=\"92\" cy=\"144\" r=\"2\"/><circle cx=\"84\" cy=\"158\" r=\"2\"/></g><g transform=\"translate(112 166) scale(0.95 0.95)\"><ellipse cx=\"0\" cy=\"0\" rx=\"22\" ry=\"16\" fill=\"#b5651d\"/><path d=\"M-20 -4Q-34 -18 -26 -30Q-14 -22 -16 -6z\" fill=\"#8f4a12\"/><circle cx=\"16\" cy=\"-14\" r=\"10\" fill=\"#b5651d\"/><path d=\"M12 -26q4-8 8 0q3-6 6 2z\" fill=\"#c0392b\"/><path d=\"M25 -13l10 3-10 3z\" fill=\"#f3d27a\"/><circle cx=\"19\" cy=\"-16\" r=\"1.8\" fill=\"#222\"/><path d=\"M12 -4q3 6 0 10\" stroke=\"#c0392b\" stroke-width=\"3\" fill=\"none\"/><path d=\"M-4 -2Q6 8 -10 10Q-18 2 -4 -2z\" fill=\"#8f4a12\"/><path d=\"M-4 16v14M6 16v14M-8 30h8M2 30h8\" stroke=\"#d8a31a\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></g><g transform=\"translate(86 184)\"><circle cx=\"0\" cy=\"0\" r=\"7\" fill=\"#f3d27a\"/><circle cx=\"6\" cy=\"-5\" r=\"4.5\" fill=\"#f3d27a\"/><path d=\"M10 -5l5 1.5-5 1.5z\" fill=\"#e67e22\"/><circle cx=\"7\" cy=\"-6\" r=\"1\" fill=\"#222\"/><path d=\"M-1 7v5M3 7v5\" stroke=\"#e67e22\" stroke-width=\"1.5\"/></g><g transform=\"translate(142 184)\"><circle cx=\"0\" cy=\"0\" r=\"7\" fill=\"#f3d27a\"/><circle cx=\"6\" cy=\"-5\" r=\"4.5\" fill=\"#f3d27a\"/><path d=\"M10 -5l5 1.5-5 1.5z\" fill=\"#e67e22\"/><circle cx=\"7\" cy=\"-6\" r=\"1\" fill=\"#222\"/><path d=\"M-1 7v5M3 7v5\" stroke=\"#e67e22\" stroke-width=\"1.5\"/></g><g transform=\"translate(158 176)\"><circle cx=\"0\" cy=\"0\" r=\"7\" fill=\"#f3d27a\"/><circle cx=\"6\" cy=\"-5\" r=\"4.5\" fill=\"#f3d27a\"/><path d=\"M10 -5l5 1.5-5 1.5z\" fill=\"#e67e22\"/><circle cx=\"7\" cy=\"-6\" r=\"1\" fill=\"#222\"/><path d=\"M-1 7v5M3 7v5\" stroke=\"#e67e22\" stroke-width=\"1.5\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><circle cx=\"166\" cy=\"32\" r=\"14\" fill=\"#f3d27a\"/><g transform=\"translate(34 30) scale(1)\" fill=\"#fff\" opacity=\".9\"><circle cx=\"0\" cy=\"0\" r=\"9\"/><circle cx=\"12\" cy=\"-4\" r=\"11\"/><circle cx=\"25\" cy=\"0\" r=\"9\"/><rect x=\"-9\" y=\"0\" width=\"43\" height=\"9\" rx=\"4\"/></g><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#cfe6e1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#b6d9d1\"/><path d=\"M0 172Q50 164 100 172 T200 170V200H0z\" fill=\"#d8c79a\"/><g transform=\"translate(34 116)\"><circle cx=\"0\" cy=\"0\" r=\"24\" fill=\"#3f8f6a\"/><circle cx=\"-20\" cy=\"10\" r=\"16\" fill=\"#3f8f6a\"/><circle cx=\"20\" cy=\"10\" r=\"16\" fill=\"#3f8f6a\"/><circle cx=\"-6\" cy=\"-12\" r=\"10\" fill=\"#5fae83\"/><g fill=\"#7b2d8e\"><circle cx=\"-10\" cy=\"4\" r=\"4\"/><circle cx=\"6\" cy=\"-2\" r=\"4\"/><circle cx=\"14\" cy=\"10\" r=\"4\"/><circle cx=\"-18\" cy=\"16\" r=\"4\"/><circle cx=\"2\" cy=\"14\" r=\"4\"/></g><g fill=\"#c0392b\"><circle cx=\"-2\" cy=\"-8\" r=\"3.5\"/><circle cx=\"18\" cy=\"2\" r=\"3.5\"/><circle cx=\"-14\" cy=\"-2\" r=\"3.5\"/></g><rect x=\"-3\" y=\"22\" width=\"6\" height=\"40\" fill=\"#7a5a3c\"/></g><path d=\"M81.4 172L87 121Q108 112.6 129 121L134.6 172z\" fill=\"#a89c50\"/><path d=\"M89.1 122.4L86 138\" stroke=\"#a89c50\" stroke-width=\"11.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"86\" cy=\"138\" r=\"5.3\" fill=\"#cf9468\"/><path d=\"M126.9 122.4L130 140\" stroke=\"#a89c50\" stroke-width=\"11.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"130\" cy=\"140\" r=\"5.3\" fill=\"#cf9468\"/><circle cx=\"108\" cy=\"97.9\" r=\"18.2\" fill=\"#a89c50\"/><circle cx=\"108\" cy=\"100\" r=\"14\" fill=\"#cf9468\"/><circle cx=\"102.7\" cy=\"101.7\" r=\"1.9\" fill=\"#3b2b24\"/><circle cx=\"113.3\" cy=\"101.7\" r=\"1.9\" fill=\"#3b2b24\"/><circle cx=\"108\" cy=\"94.1\" r=\"1.8\" fill=\"#c0392b\"/><path d=\"M104.1 107q3.9 3.4 7.8 0\" stroke=\"#3b2b24\" stroke-width=\"1.1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M78 134h28l-4 18H82z\" fill=\"#b98e5a\"/><path d=\"M78 134q14-12 28 0\" stroke=\"#9c7442\" stroke-width=\"3\" fill=\"none\"/><g fill=\"#7b2d8e\"><circle cx=\"86\" cy=\"132\" r=\"3.5\"/><circle cx=\"94\" cy=\"129\" r=\"3.5\"/><circle cx=\"101\" cy=\"132\" r=\"3.5\"/></g><g fill=\"#c0392b\"><circle cx=\"90\" cy=\"134\" r=\"3\"/><circle cx=\"98\" cy=\"134\" r=\"3\"/></g><g transform=\"translate(166 150) scale(1.15)\"><path d=\"M-12 -4Q-14 14 0 16Q14 14 12 -4z\" fill=\"#8a4b2d\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"12\" ry=\"4.5\" fill=\"#6b3a22\"/><ellipse cx=\"0\" cy=\"-4.5\" rx=\"9.5\" ry=\"3.2\" fill=\"#f7f3e3\"/><path d=\"M-9 6Q0 9 9 6\" stroke=\"#c9895a\" stroke-width=\"1.5\" fill=\"none\"/></g><path d=\"M160 118q-6-8 0-14t0-14M170 118q-6-8 0-14t0-14\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\" opacity=\".9\"/><path d=\"M150 170q16 6 32 0\" stroke=\"#c4b077\" stroke-width=\"3\" stroke-linecap=\"round\" fill=\"none\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><circle cx=\"166\" cy=\"30\" r=\"12\" fill=\"#f3d27a\"/><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#b6d9d1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#8fc4b0\"/><g transform=\"translate(24 100) scale(1)\"><rect x=\"-3\" y=\"0\" width=\"6\" height=\"30\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"-8\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"8\" fill=\"#5fae83\"/></g><g transform=\"translate(168 98) scale(1.1)\"><rect x=\"-3\" y=\"0\" width=\"6\" height=\"30\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"-8\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"8\" fill=\"#5fae83\"/></g><g transform=\"translate(110 92) scale(0.7)\"><rect x=\"-3\" y=\"0\" width=\"6\" height=\"30\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"-8\" r=\"19\" fill=\"#3f8f6a\"/><circle cx=\"-12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"12\" cy=\"2\" r=\"12\" fill=\"#3f8f6a\"/><circle cx=\"-4\" cy=\"-14\" r=\"8\" fill=\"#5fae83\"/></g><path d=\"M0 170Q50 162 100 170 T200 168V200H0z\" fill=\"#d8c79a\"/><path d=\"M70 170Q96 150 128 170\" fill=\"none\"/><rect x=\"20\" y=\"170\" width=\"160\" height=\"30\" fill=\"#cdb97c\"/><g transform=\"translate(138 150)\"><rect x=\"-26\" y=\"-14\" width=\"52\" height=\"22\" rx=\"4\" fill=\"#2f6f4f\"/><rect x=\"-16\" y=\"-24\" width=\"30\" height=\"12\" rx=\"3\" fill=\"#2f6f4f\"/><rect x=\"-12\" y=\"-22\" width=\"10\" height=\"8\" fill=\"#bfe0da\"/><rect x=\"2\" y=\"-22\" width=\"10\" height=\"8\" fill=\"#bfe0da\"/><circle cx=\"-16\" cy=\"10\" r=\"8\" fill=\"#222\"/><circle cx=\"16\" cy=\"10\" r=\"8\" fill=\"#222\"/><circle cx=\"-16\" cy=\"10\" r=\"3\" fill=\"#999\"/><circle cx=\"16\" cy=\"10\" r=\"3\" fill=\"#999\"/><circle cx=\"-6\" cy=\"-30\" r=\"5\" fill=\"#cf9468\"/><circle cx=\"6\" cy=\"-30\" r=\"5\" fill=\"#cf9468\"/></g><g transform=\"translate(66 160) scale(-0.95 0.95)\"><ellipse cx=\"0\" cy=\"0\" rx=\"30\" ry=\"15\" fill=\"#e67e22\"/><circle cx=\"30\" cy=\"-6\" r=\"12\" fill=\"#e67e22\"/><path d=\"M24 -16l-3-9 8 5zM36 -16l3-9-8 5z\" fill=\"#e67e22\"/><circle cx=\"35\" cy=\"-8\" r=\"1.8\" fill=\"#222\"/><path d=\"M38 -2q3 4 8 2\" stroke=\"#222\" stroke-width=\"1.6\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"36\" cy=\"-1\" rx=\"5.5\" ry=\"3.8\" fill=\"#fbe3c4\"/><path d=\"M-30 -4Q-48 -10 -46 -24\" stroke=\"#e67e22\" stroke-width=\"7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M-12 -14v16M-2 -15v18M8 -14v16M-22 -10v12\" stroke=\"#2b1a10\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M26 -16q-2 4 0 8M33 -17q-2 4 0 9\" stroke=\"#2b1a10\" stroke-width=\"2.5\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M-18 12v18M-6 14v16M12 14v16M22 12v18\" stroke=\"#e67e22\" stroke-width=\"7\" stroke-linecap=\"round\"/><path d=\"M-18 30h4M-6 30h4M12 30h4M22 30h4\" stroke=\"#fbe3c4\" stroke-width=\"5\" stroke-linecap=\"round\"/></g><g transform=\"translate(30 132) scale(0.55)\"><rect x=\"-22\" y=\"0\" width=\"44\" height=\"30\" fill=\"#f1e3c8\"/><path d=\"M-28 2L0 -26 28 2z\" fill=\"#8a6a3b\"/><path d=\"M-18 -2L-4 -16M-8 0L6 -14M4 0L16 -10\" stroke=\"#6f532c\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"-6\" y=\"10\" width=\"12\" height=\"20\" rx=\"2\" fill=\"#6b4a2b\"/></g></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><rect width=\"200\" height=\"200\" fill=\"#e6f3f1\"/><circle cx=\"34\" cy=\"34\" r=\"13\" fill=\"#f3d27a\"/><g transform=\"translate(120 28) scale(0.9)\" fill=\"#fff\" opacity=\".9\"><circle cx=\"0\" cy=\"0\" r=\"9\"/><circle cx=\"12\" cy=\"-4\" r=\"11\"/><circle cx=\"25\" cy=\"0\" r=\"9\"/><rect x=\"-9\" y=\"0\" width=\"43\" height=\"9\" rx=\"4\"/></g><path d=\"M0 138Q40 106 84 128T200 118V200H0z\" fill=\"#cfe6e1\"/><path d=\"M0 154Q50 128 100 148T200 140V200H0z\" fill=\"#b6d9d1\"/><path d=\"M0 172Q50 164 100 172 T200 170V200H0z\" fill=\"#d8c79a\"/><clipPath id=\"wl\"><rect x=\"100\" y=\"118\" width=\"70\" height=\"52\"/></clipPath><g clip-path=\"url(#wl)\"><rect x=\"93\" y=\"118\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"107\" y=\"118\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"121\" y=\"118\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"135\" y=\"118\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"149\" y=\"118\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"163\" y=\"118\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"100\" y=\"125\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"114\" y=\"125\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"128\" y=\"125\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"142\" y=\"125\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"156\" y=\"125\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"170\" y=\"125\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"93\" y=\"132\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"107\" y=\"132\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"121\" y=\"132\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"135\" y=\"132\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"149\" y=\"132\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"163\" y=\"132\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"100\" y=\"139\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"114\" y=\"139\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"128\" y=\"139\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"142\" y=\"139\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"156\" y=\"139\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"170\" y=\"139\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"93\" y=\"146\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"107\" y=\"146\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"121\" y=\"146\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"135\" y=\"146\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"149\" y=\"146\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"163\" y=\"146\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"100\" y=\"153\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"114\" y=\"153\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"128\" y=\"153\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"142\" y=\"153\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"156\" y=\"153\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"170\" y=\"153\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"93\" y=\"160\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"107\" y=\"160\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"121\" y=\"160\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"135\" y=\"160\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"149\" y=\"160\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"163\" y=\"160\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"100\" y=\"167\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"114\" y=\"167\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"128\" y=\"167\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"142\" y=\"167\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"156\" y=\"167\" width=\"14\" height=\"7\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"170\" y=\"167\" width=\"14\" height=\"7\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/></g><path d=\"M94 118L136 84 178 118\" stroke=\"#7a5a3c\" stroke-width=\"5\" fill=\"none\" stroke-linejoin=\"round\"/><path d=\"M104 118V100M136 84V118M168 118V100\" stroke=\"#7a5a3c\" stroke-width=\"3.5\"/><rect x=\"124\" y=\"140\" width=\"24\" height=\"30\" rx=\"2\" fill=\"#6b4a2b\"/><path d=\"M12 172l22-30 22 30z\" fill=\"#e3c27a\"/><path d=\"M26 172l8-12 10 12z\" fill=\"#d1ae61\"/><g transform=\"translate(60 160)\"><rect x=\"0\" y=\"0\" width=\"22\" height=\"9\" fill=\"#c2603a\" stroke=\"#8f3f22\" stroke-width=\".6\"/><rect x=\"2\" y=\"-9\" width=\"22\" height=\"9\" fill=\"#b4532f\" stroke=\"#8f3f22\" stroke-width=\".6\"/></g><g><ellipse cx=\"14\" cy=\"182\" rx=\"12\" ry=\"6\" fill=\"#8e8e86\"/><ellipse cx=\"34\" cy=\"186\" rx=\"10\" ry=\"5\" fill=\"#a3a39a\"/><ellipse cx=\"48\" cy=\"180\" rx=\"8\" ry=\"4.5\" fill=\"#76766e\"/></g><g><rect x=\"70\" y=\"176\" width=\"40\" height=\"7\" rx=\"3.5\" fill=\"#9c7442\"/><rect x=\"74\" y=\"168\" width=\"40\" height=\"7\" rx=\"3.5\" fill=\"#b98e5a\"/><circle cx=\"72\" cy=\"179.5\" r=\"2.5\" fill=\"#d8b27c\"/></g><path d=\"M55.3 170L60.5 119.5Q80 111.7 99.5 119.5L104.7 170z\" fill=\"#01796f\"/><path d=\"M62.5 120.8L100 126\" stroke=\"#01796f\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"100\" cy=\"126\" r=\"4.9\" fill=\"#cf9468\"/><path d=\"M97.5 120.8L100 126\" stroke=\"#01796f\" stroke-width=\"10.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"100\" cy=\"126\" r=\"4.9\" fill=\"#cf9468\"/><circle cx=\"80\" cy=\"100\" r=\"13\" fill=\"#cf9468\"/><path d=\"M64.7 98.7a15.3 16.9 0 0 1 30.7 0q-15.3 -7.8 -30.7 0z\" fill=\"#01796f\"/><path d=\"M69 90.2q11 -9.1 22.1 -1.9\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.2\" fill=\"none\"/><circle cx=\"75.1\" cy=\"101.6\" r=\"1.8\" fill=\"#3b2b24\"/><circle cx=\"84.9\" cy=\"101.6\" r=\"1.8\" fill=\"#3b2b24\"/><path d=\"M73.5 106.5q6.5 3.9 13 0\" stroke=\"#3b2b24\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/></svg>"];
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
