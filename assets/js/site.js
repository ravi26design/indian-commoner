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
    var ILL = ["<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(28 30) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(120 22) scale(0.8)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M150 46q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M164 40q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(24 128) scale(0.9)\"><path d=\"M-3 0Q1 -30 3 -58L7 -58Q7 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M2 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(5 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(176 126) scale(0.85)\"><path d=\"M-3 0Q-5 -30 -3 -58L1 -58Q1 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M-4 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(-1 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(100 100) scale(0.95)\"><ellipse cx=\"0\" cy=\"40\" rx=\"46\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><rect x=\"-36\" y=\"10\" width=\"72\" height=\"30\" fill=\"#dcd3bd\"/><rect x=\"-36\" y=\"10\" width=\"22\" height=\"30\" fill=\"#bdb298\" opacity=\".5\"/><path d=\"M-46 14L-26 -14H26L46 14z\" fill=\"#e8731f\"/><path d=\"M-40 -12h78\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-37 -4h72\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-34 4h66\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-31 12h60\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-46 14L-26 -14H-16L-30 14z\" fill=\"#c4570e\" opacity=\".35\"/><rect x=\"-8\" y=\"20\" width=\"16\" height=\"20\" rx=\"2\" fill=\"#6b4a2b\"/><rect x=\"14\" y=\"20\" width=\"14\" height=\"12\" rx=\"1\" fill=\"#8cc6df\" stroke=\"#7a5230\" stroke-width=\"2\"/><rect x=\"-30\" y=\"20\" width=\"12\" height=\"12\" rx=\"1\" fill=\"#8cc6df\" stroke=\"#7a5230\" stroke-width=\"2\"/></g><path d=\"M0 142Q50 137 100 141T200 139V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 164Q60 158 120 164T200 160V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 172h8M60 180h10M110 174h8M150 182h9M180 170h8M36 188h7\"/></g><path d=\"M14 172q-2-7-5-9M14 172q0-8 0-11M14 172q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M188 176q-2-7-5-9M188 176q0-8 0-11M188 176q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M100 190q-2-7-5-9M100 190q0-8 0-11M100 190q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"66\" cy=\"177\" rx=\"30\" ry=\"4\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"60\" cy=\"176\" rx=\"5\" ry=\"2\" fill=\"#8e4a24\"/><ellipse cx=\"74\" cy=\"176\" rx=\"5\" ry=\"2\" fill=\"#8e4a24\"/><path d=\"M51 130H81L90 173H42z\" fill=\"#6b3fa3\"/><path d=\"M68 130H81L90 173H74z\" fill=\"#000\" opacity=\".12\"/><path d=\"M42 166H90.5\" stroke=\"#ee8a1f\" stroke-width=\"5\"/><path d=\"M56 135q4 12 2 30M68 135q4 12 3 30\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M53 106L84 128\" stroke=\"#f2cf3a\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"84\" cy=\"128\" r=\"4\" fill=\"#b3683a\"/><path d=\"M79 106L84 128\" stroke=\"#f2cf3a\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"84\" cy=\"128\" r=\"4\" fill=\"#b3683a\"/><path d=\"M53 104Q66 99 79 104L80 128H52z\" fill=\"#f2cf3a\"/><path d=\"M54 103L80 134L80 152L54 114z\" fill=\"#6b3fa3\"/><path d=\"M54 103L80 134\" stroke=\"#ee8a1f\" stroke-width=\"3\"/><rect x=\"62.5\" y=\"97\" width=\"7\" height=\"8\" fill=\"#8e4a24\"/><ellipse cx=\"66\" cy=\"90\" rx=\"8.5\" ry=\"9.2\" fill=\"#b3683a\"/><ellipse cx=\"69.8\" cy=\"90.8\" rx=\"3.8\" ry=\"7.7\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M57.5 89.2a8.5 9.4 0 0 1 17 0q-8.5 -6.4 -17 0z\" fill=\"#2a1a12\"/><circle cx=\"57.9\" cy=\"89.2\" r=\"4.7\" fill=\"#2a1a12\"/><circle cx=\"63\" cy=\"90.4\" r=\"1.4\" fill=\"#2a1a12\"/><circle cx=\"69.4\" cy=\"90.4\" r=\"1.4\" fill=\"#2a1a12\"/><path d=\"M63.5 94.2q2.5 2.1 5.1 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"66.4\" cy=\"86.6\" r=\"1.2\" fill=\"#c93a2b\"/><ellipse cx=\"136\" cy=\"177\" rx=\"30\" ry=\"4\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"130\" cy=\"176\" rx=\"5\" ry=\"2\" fill=\"#8e4a24\"/><ellipse cx=\"144\" cy=\"176\" rx=\"5\" ry=\"2\" fill=\"#8e4a24\"/><path d=\"M121 130H151L160 173H112z\" fill=\"#2e9a55\"/><path d=\"M138 130H151L160 173H144z\" fill=\"#000\" opacity=\".12\"/><path d=\"M112 166H160.5\" stroke=\"#f2cf3a\" stroke-width=\"5\"/><path d=\"M126 135q4 12 2 30M138 135q4 12 3 30\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M123 106L112 128\" stroke=\"#d9487a\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"112\" cy=\"128\" r=\"4\" fill=\"#b3683a\"/><path d=\"M149 106L112 128\" stroke=\"#d9487a\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"112\" cy=\"128\" r=\"4\" fill=\"#b3683a\"/><path d=\"M123 104Q136 99 149 104L150 128H122z\" fill=\"#d9487a\"/><path d=\"M124 103L150 134L150 152L124 114z\" fill=\"#2e9a55\"/><path d=\"M124 103L150 134\" stroke=\"#f2cf3a\" stroke-width=\"3\"/><rect x=\"132.5\" y=\"97\" width=\"7\" height=\"8\" fill=\"#8e4a24\"/><ellipse cx=\"136\" cy=\"90\" rx=\"8.5\" ry=\"9.2\" fill=\"#b3683a\"/><ellipse cx=\"139.8\" cy=\"90.8\" rx=\"3.8\" ry=\"7.7\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M127.5 89.2a8.5 9.4 0 0 1 17 0q-8.5 -6.4 -17 0z\" fill=\"#2a1a12\"/><circle cx=\"127.9\" cy=\"89.2\" r=\"4.7\" fill=\"#2a1a12\"/><circle cx=\"133\" cy=\"90.4\" r=\"1.4\" fill=\"#2a1a12\"/><circle cx=\"139.4\" cy=\"90.4\" r=\"1.4\" fill=\"#2a1a12\"/><path d=\"M133.4 94.2q2.5 2.1 5.1 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"136.4\" cy=\"86.6\" r=\"1.2\" fill=\"#c93a2b\"/><g transform=\"translate(98 124) scale(1.1)\"><path d=\"M-10 -4Q-13 11 0 14Q13 11 10 -4z\" fill=\"#a0562f\"/><path d=\"M3 -3Q8 6 2 13Q12 10 10 -4z\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"10\" ry=\"3.6\" fill=\"#6b3a22\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"8.5\" ry=\"3\" fill=\"#fbf7e8\"/><path d=\"M-8 4Q0 7 8 4\" stroke=\"#d29265\" stroke-width=\"1.2\" fill=\"none\"/></g></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(24 28) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(124 34) scale(0.7)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M80 46q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M94 40q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(176 124) scale(0.9)\"><path d=\"M-3 0Q-5 -30 -3 -58L1 -58Q1 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M-4 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(-1 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(50 100) scale(0.85)\"><ellipse cx=\"0\" cy=\"40\" rx=\"46\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><rect x=\"-36\" y=\"10\" width=\"72\" height=\"30\" fill=\"#dcd3bd\"/><rect x=\"-36\" y=\"10\" width=\"22\" height=\"30\" fill=\"#bdb298\" opacity=\".5\"/><path d=\"M-46 14L-26 -14H26L46 14z\" fill=\"#e8731f\"/><path d=\"M-40 -12h78\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-37 -4h72\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-34 4h66\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-31 12h60\" stroke=\"#c4570e\" stroke-width=\"1.3\" opacity=\".8\"/><path d=\"M-46 14L-26 -14H-16L-30 14z\" fill=\"#c4570e\" opacity=\".35\"/><rect x=\"-8\" y=\"20\" width=\"16\" height=\"20\" rx=\"2\" fill=\"#6b4a2b\"/><rect x=\"14\" y=\"20\" width=\"14\" height=\"12\" rx=\"1\" fill=\"#8cc6df\" stroke=\"#7a5230\" stroke-width=\"2\"/><rect x=\"-30\" y=\"20\" width=\"12\" height=\"12\" rx=\"1\" fill=\"#8cc6df\" stroke=\"#7a5230\" stroke-width=\"2\"/></g><path d=\"M0 144Q50 139 100 143T200 141V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 166Q60 160 120 166T200 162V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 174h8M60 182h10M110 176h8M150 184h9M180 172h8M36 190h7\"/></g><path d=\"M20 70V40\" stroke=\"#6b4a2b\" stroke-width=\"2.2\"/><path d=\"M20 40l15 5-15 6z\" fill=\"#ee8a1f\"/><path d=\"M14 176q-2-7-5-9M14 176q0-8 0-11M14 176q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M190 178q-2-7-5-9M190 178q0-8 0-11M190 178q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"98\" cy=\"179\" rx=\"31.8\" ry=\"4.2\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"91.6\" cy=\"178\" rx=\"5.3\" ry=\"2.1\" fill=\"#8e4a24\"/><ellipse cx=\"106.5\" cy=\"178\" rx=\"5.3\" ry=\"2.1\" fill=\"#8e4a24\"/><path d=\"M82.1 129.2H113.9L123.4 174.8H72.6z\" fill=\"#3a68c9\"/><path d=\"M100.1 129.2H113.9L123.4 174.8H106.5z\" fill=\"#000\" opacity=\".12\"/><path d=\"M72.6 167.4H124\" stroke=\"#ee8a1f\" stroke-width=\"5.3\"/><path d=\"M87.4 134.5q4.2 12.7 2.1 31.8M100.1 134.5q4.2 12.7 3.2 31.8\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M84.2 103.8L126 134\" stroke=\"#f2cf3a\" stroke-width=\"6.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"126\" cy=\"134\" r=\"4.2\" fill=\"#b3683a\"/><path d=\"M111.8 103.8L78 124\" stroke=\"#f2cf3a\" stroke-width=\"6.4\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"78\" cy=\"124\" r=\"4.2\" fill=\"#b3683a\"/><path d=\"M84.2 101.7Q98 96.4 111.8 101.7L112.8 127.1H83.2z\" fill=\"#f2cf3a\"/><path d=\"M85.3 100.6L112.8 133.5L112.8 152.6L85.3 112.3z\" fill=\"#3a68c9\"/><path d=\"M85.3 100.6L112.8 133.5\" stroke=\"#ee8a1f\" stroke-width=\"3.2\"/><rect x=\"94.3\" y=\"94.3\" width=\"7.4\" height=\"8.5\" fill=\"#8e4a24\"/><ellipse cx=\"98\" cy=\"86.8\" rx=\"9\" ry=\"9.7\" fill=\"#b3683a\"/><ellipse cx=\"102.1\" cy=\"87.7\" rx=\"4.1\" ry=\"8.1\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M89 85.9a9 9.9 0 0 1 18 0q-9 -6.8 -18 0z\" fill=\"#2a1a12\"/><circle cx=\"89.4\" cy=\"85.9\" r=\"5\" fill=\"#2a1a12\"/><circle cx=\"94.8\" cy=\"87.3\" r=\"1.5\" fill=\"#2a1a12\"/><circle cx=\"101.6\" cy=\"87.3\" r=\"1.5\" fill=\"#2a1a12\"/><path d=\"M95.3 91.3q2.7 2.3 5.4 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"98.5\" cy=\"83.2\" r=\"1.3\" fill=\"#c93a2b\"/><ellipse cx=\"140\" cy=\"179\" rx=\"17.4\" ry=\"2.3\" fill=\"#000\" opacity=\".14\"/><path d=\"M136.5 158.3L135.9 178\" stroke=\"#b3683a\" stroke-width=\"4.6\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M143.5 158.3L144.1 178\" stroke=\"#b3683a\" stroke-width=\"4.6\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M132.5 156.5H147.5L148.7 169.9H131.3z\" fill=\"#2b3f8f\"/><path d=\"M131.9 142H148.1L148.7 158.3H131.3z\" fill=\"#c93a2b\"/><rect x=\"145.8\" y=\"142\" width=\"7\" height=\"11.6\" rx=\"1.7\" fill=\"#ee8a1f\"/><ellipse cx=\"140\" cy=\"131.6\" rx=\"5.8\" ry=\"6.3\" fill=\"#b3683a\"/><ellipse cx=\"142.6\" cy=\"132.2\" rx=\"2.6\" ry=\"5.2\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M134.2 131a5.8 6.4 0 0 1 11.6 0q-5.8 -4.4 -11.6 0z\" fill=\"#2a1a12\"/><circle cx=\"138\" cy=\"131.9\" r=\"1.1\" fill=\"#2a1a12\"/><circle cx=\"142.3\" cy=\"131.9\" r=\"1.1\" fill=\"#2a1a12\"/><path d=\"M138.3 134.5q1.7 1.5 3.5 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(30 30) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(124 24) scale(0.8)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M100 48q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M114 42q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(20 118) scale(0.85)\"><path d=\"M-3 0Q1 -30 3 -58L7 -58Q7 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M2 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(5 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(180 120) scale(0.8)\"><path d=\"M-3 0Q-5 -30 -3 -58L1 -58Q1 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M-4 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(-1 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><path d=\"M0 130Q52 112 112 126Q160 138 156 168Q100 194 0 184z\" fill=\"#5fb3c8\"/><path d=\"M0 130Q52 112 112 126\" fill=\"none\" stroke=\"#fff\" opacity=\".4\" stroke-width=\"3\"/><path d=\"M14 150q10-5 20 0M58 142q12-5 24 0M34 166q10-5 22 0M92 156q10-5 20 0\" stroke=\"#fff\" stroke-opacity=\".75\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M22 126v-22M30 128v-28M40 128v-18\" stroke=\"#226b2e\" stroke-width=\"3\" stroke-linecap=\"round\"/><ellipse cx=\"24\" cy=\"102\" rx=\"3\" ry=\"6\" fill=\"#8a5a2a\"/><path d=\"M0 150Q50 145 100 149T200 147V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 172Q60 166 120 172T200 168V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 180h8M60 188h10M110 182h8M150 190h9M180 178h8M36 196h7\"/></g><path d=\"M176 186q-2-7-5-9M176 186q0-8 0-11M176 186q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M120 194q-2-7-5-9M120 194q0-8 0-11M120 194q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"54\" cy=\"173\" rx=\"30.6\" ry=\"4.1\" fill=\"#000\" opacity=\".14\"/><path d=\"M46.9 125.1L45.8 172\" stroke=\"#b3683a\" stroke-width=\"7.6\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M61.1 125.1L63.2 172\" stroke=\"#b3683a\" stroke-width=\"7.6\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M38.7 123H69.3L71.3 157.7H36.7z\" fill=\"#3a68c9\"/><path d=\"M38.7 137.3H70.3M37.7 147.5H71.3\" stroke=\"#2a4fa0\" stroke-width=\"1\" opacity=\".6\"/><path d=\"M49.9 125.1v25.5M61.1 125.1v25.5\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".45\"/><ellipse cx=\"44.8\" cy=\"172.5\" rx=\"5.1\" ry=\"2\" fill=\"#8e4a24\"/><ellipse cx=\"64.2\" cy=\"172.5\" rx=\"5.1\" ry=\"2\" fill=\"#8e4a24\"/><path d=\"M39.7 100.6L84 136\" stroke=\"#b3683a\" stroke-width=\"6.6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"84\" cy=\"136\" r=\"4.6\" fill=\"#b3683a\"/><path d=\"M68.3 100.6L74 148\" stroke=\"#b3683a\" stroke-width=\"6.6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"74\" cy=\"148\" r=\"4.6\" fill=\"#b3683a\"/><path d=\"M39.7 98.6Q54 93.5 68.3 98.6L69.3 125.1H38.7z\" fill=\"#f7f4ea\"/><path d=\"M59.1 98.6L69.3 125.1H56z\" fill=\"#000\" opacity=\".1\"/><rect x=\"50.4\" y=\"91.4\" width=\"7.1\" height=\"8.2\" fill=\"#8e4a24\"/><ellipse cx=\"54\" cy=\"84.3\" rx=\"8.7\" ry=\"9.4\" fill=\"#b3683a\"/><ellipse cx=\"57.9\" cy=\"85.1\" rx=\"3.9\" ry=\"7.8\" fill=\"#8e4a24\" opacity=\".3\"/><circle cx=\"51\" cy=\"84.7\" r=\"1.4\" fill=\"#2a1a12\"/><circle cx=\"57.5\" cy=\"84.7\" r=\"1.4\" fill=\"#2a1a12\"/><path d=\"M51.4 88.6q2.6 2.2 5.2 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M37.5 79.5Q54 73.9 70.5 79.5Q54 83 37.5 79.5z\" fill=\"#e3b04a\"/><path d=\"M46.2 78.2Q54 66.1 61.8 78.2z\" fill=\"#efc96a\"/><path d=\"M41.9 79.5q12.1 2.6 24.3 0\" stroke=\"#b98419\" stroke-width=\"1.2\" fill=\"none\"/><path d=\"M84 140l20-34\" stroke=\"#7a5a3c\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><path d=\"M98 118l-14 4M102 112l-14 4\" stroke=\"#7a5a3c\" stroke-width=\"3\" stroke-linecap=\"round\"/><ellipse cx=\"152\" cy=\"185\" rx=\"29.4\" ry=\"3.9\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"146.1\" cy=\"184\" rx=\"4.9\" ry=\"2\" fill=\"#8e4a24\"/><ellipse cx=\"159.8\" cy=\"184\" rx=\"4.9\" ry=\"2\" fill=\"#8e4a24\"/><path d=\"M137.3 138.9H166.7L175.5 181.1H128.5z\" fill=\"#2e9a55\"/><path d=\"M154 138.9H166.7L175.5 181.1H159.8z\" fill=\"#000\" opacity=\".12\"/><path d=\"M128.5 174.2H176\" stroke=\"#ee8a1f\" stroke-width=\"4.9\"/><path d=\"M142.2 143.8q3.9 11.8 2 29.4M154 143.8q3.9 11.8 2.9 29.4\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M139.3 115.4L130 148\" stroke=\"#f2cf3a\" stroke-width=\"5.9\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"130\" cy=\"148\" r=\"3.9\" fill=\"#b3683a\"/><path d=\"M164.7 115.4L132 162\" stroke=\"#f2cf3a\" stroke-width=\"5.9\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"132\" cy=\"162\" r=\"3.9\" fill=\"#b3683a\"/><path d=\"M139.3 113.4Q152 108.5 164.7 113.4L165.7 137H138.3z\" fill=\"#f2cf3a\"/><path d=\"M140.2 112.5L165.7 142.8L165.7 160.5L140.2 123.2z\" fill=\"#2e9a55\"/><path d=\"M140.2 112.5L165.7 142.8\" stroke=\"#ee8a1f\" stroke-width=\"2.9\"/><rect x=\"148.6\" y=\"106.6\" width=\"6.9\" height=\"7.8\" fill=\"#8e4a24\"/><ellipse cx=\"152\" cy=\"99.7\" rx=\"8.3\" ry=\"9\" fill=\"#b3683a\"/><ellipse cx=\"155.7\" cy=\"100.6\" rx=\"3.7\" ry=\"7.5\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M143.7 98.9a8.3 9.2 0 0 1 16.7 0q-8.3 -6.2 -16.7 0z\" fill=\"#2a1a12\"/><circle cx=\"144.1\" cy=\"98.9\" r=\"4.6\" fill=\"#2a1a12\"/><circle cx=\"149.1\" cy=\"100.1\" r=\"1.4\" fill=\"#2a1a12\"/><circle cx=\"155.3\" cy=\"100.1\" r=\"1.4\" fill=\"#2a1a12\"/><path d=\"M149.5 103.9q2.5 2.1 5 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"152.4\" cy=\"96.4\" r=\"1.2\" fill=\"#c93a2b\"/><path d=\"M124 184V158\" stroke=\"#5a3b22\" stroke-width=\"3.4\" stroke-linecap=\"round\"/><path d=\"M124 168c0-9 7-13 15-13 0 9-6 13-15 13z\" fill=\"#62b94f\"/><path d=\"M124 162c0-8-6-12-13-12 0 8 5 12 13 12z\" fill=\"#2f8a3c\"/><ellipse cx=\"124\" cy=\"186\" rx=\"15\" ry=\"4.5\" fill=\"#7a4a1a\"/></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(30 28) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(128 22) scale(0.8)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M84 40q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M98 34q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M112 42q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(22 122) scale(0.9)\"><path d=\"M-3 0Q1 -30 3 -58L7 -58Q7 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M2 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(5 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(158 108) scale(1)\"><ellipse cx=\"0\" cy=\"34\" rx=\"34\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><rect x=\"-26\" y=\"2\" width=\"52\" height=\"30\" fill=\"#e2a92f\"/><path d=\"M-26 2v30\" stroke=\"#b98419\" stroke-width=\"3\"/><path d=\"M-24 8h48M-24 14h48M-24 20h48M-24 26h48\" stroke=\"#b98419\" stroke-width=\"1\" opacity=\".6\"/><path d=\"M-34 4Q-30 -22 0 -46Q30 -22 34 4Q0 12 -34 4z\" fill=\"#f3cc62\"/><path d=\"M0 -46Q12 -22 34 4Q18 8 0 8z\" fill=\"#e2a92f\" opacity=\".6\"/><path d=\"M0 -46L-22 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L-12 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L0 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L12 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L22 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L-30 2\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L30 2\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M-3 -46q3-8 6 0z\" fill=\"#b98419\"/><circle cx=\"0\" cy=\"-51\" r=\"3\" fill=\"#b98419\"/><rect x=\"-6\" y=\"14\" width=\"12\" height=\"18\" rx=\"2\" fill=\"#6b4a2b\"/></g><g transform=\"translate(120 100) scale(0.6)\"><ellipse cx=\"0\" cy=\"34\" rx=\"34\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><rect x=\"-26\" y=\"2\" width=\"52\" height=\"30\" fill=\"#e2a92f\"/><path d=\"M-26 2v30\" stroke=\"#b98419\" stroke-width=\"3\"/><path d=\"M-24 8h48M-24 14h48M-24 20h48M-24 26h48\" stroke=\"#b98419\" stroke-width=\"1\" opacity=\".6\"/><path d=\"M-34 4Q-30 -22 0 -46Q30 -22 34 4Q0 12 -34 4z\" fill=\"#f3cc62\"/><path d=\"M0 -46Q12 -22 34 4Q18 8 0 8z\" fill=\"#e2a92f\" opacity=\".6\"/><path d=\"M0 -46L-22 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L-12 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L0 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L12 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L22 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L-30 2\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L30 2\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M-3 -46q3-8 6 0z\" fill=\"#b98419\"/><circle cx=\"0\" cy=\"-51\" r=\"3\" fill=\"#b98419\"/><rect x=\"-6\" y=\"14\" width=\"12\" height=\"18\" rx=\"2\" fill=\"#6b4a2b\"/></g><path d=\"M0 144Q50 139 100 143T200 141V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 166Q60 160 120 166T200 162V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 174h8M60 182h10M110 176h8M150 184h9M180 172h8M36 190h7\"/></g><path d=\"M14 178q-2-7-5-9M14 178q0-8 0-11M14 178q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M190 184q-2-7-5-9M190 184q0-8 0-11M190 184q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"62\" cy=\"177\" rx=\"32.4\" ry=\"4.3\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"55.5\" cy=\"176\" rx=\"5.4\" ry=\"2.2\" fill=\"#8e4a24\"/><ellipse cx=\"70.6\" cy=\"176\" rx=\"5.4\" ry=\"2.2\" fill=\"#8e4a24\"/><path d=\"M45.8 126.3H78.2L87.9 172.8H36.1z\" fill=\"#ee8a1f\"/><path d=\"M64.2 126.3H78.2L87.9 172.8H70.6z\" fill=\"#000\" opacity=\".12\"/><path d=\"M36.1 165.2H88.5\" stroke=\"#6b3fa3\" stroke-width=\"5.4\"/><path d=\"M51.2 131.7q4.3 13 2.2 32.4M64.2 131.7q4.3 13 3.2 32.4\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M48 100.4L92 126\" stroke=\"#2e9a55\" stroke-width=\"6.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"92\" cy=\"126\" r=\"4.3\" fill=\"#b3683a\"/><path d=\"M76 100.4L88 136\" stroke=\"#2e9a55\" stroke-width=\"6.5\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"88\" cy=\"136\" r=\"4.3\" fill=\"#b3683a\"/><path d=\"M48 98.2Q62 92.8 76 98.2L77.1 124.2H46.9z\" fill=\"#2e9a55\"/><path d=\"M49 97.2L77.1 130.6L77.1 150.1L49 109z\" fill=\"#ee8a1f\"/><path d=\"M49 97.2L77.1 130.6\" stroke=\"#6b3fa3\" stroke-width=\"3.2\"/><rect x=\"58.2\" y=\"90.7\" width=\"7.6\" height=\"8.6\" fill=\"#8e4a24\"/><ellipse cx=\"62\" cy=\"83.1\" rx=\"9.2\" ry=\"9.9\" fill=\"#b3683a\"/><ellipse cx=\"66.1\" cy=\"84\" rx=\"4.1\" ry=\"8.3\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M52.8 82.2a9.2 10.1 0 0 1 18.4 0q-9.2 -6.9 -18.4 0z\" fill=\"#2a1a12\"/><circle cx=\"53.3\" cy=\"82.2\" r=\"5\" fill=\"#2a1a12\"/><circle cx=\"58.8\" cy=\"83.6\" r=\"1.5\" fill=\"#2a1a12\"/><circle cx=\"65.7\" cy=\"83.6\" r=\"1.5\" fill=\"#2a1a12\"/><path d=\"M59.2 87.7q2.8 2.3 5.5 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"62.5\" cy=\"79.4\" r=\"1.3\" fill=\"#c93a2b\"/><g fill=\"#e9c66c\"><circle cx=\"96\" cy=\"140\" r=\"1.8\"/><circle cx=\"104\" cy=\"146\" r=\"1.8\"/><circle cx=\"92\" cy=\"152\" r=\"1.8\"/><circle cx=\"110\" cy=\"140\" r=\"1.8\"/><circle cx=\"100\" cy=\"158\" r=\"1.8\"/><circle cx=\"114\" cy=\"152\" r=\"1.8\"/></g><g transform=\"translate(138 170) scale(1 1)\"><ellipse cx=\"0\" cy=\"16\" rx=\"17\" ry=\"3\" fill=\"#000\" opacity=\".15\"/><path d=\"M-12 -4Q-30 -22 -22 -34Q-14 -28 -8 -14zM-14 0Q-34 -8 -28 -24Q-18 -18 -12 -6z\" fill=\"#1f7a4a\"/><path d=\"M-14 -4Q-26 -14 -20 -30\" stroke=\"#c0392b\" stroke-width=\"3\" fill=\"none\"/><path d=\"M-16 0Q-30 -2 -26 -16\" stroke=\"#2a5fc9\" stroke-width=\"3\" fill=\"none\"/><ellipse cx=\"0\" cy=\"0\" rx=\"14\" ry=\"12\" fill=\"#a8421a\"/><path d=\"M-8 -2q8 9 18 0\" stroke=\"#7a2c0a\" stroke-width=\"1.5\" fill=\"none\"/><circle cx=\"11\" cy=\"-12\" r=\"6\" fill=\"#a8421a\"/><path d=\"M7 -18q2-7 5-1q2-6 5 1q2-3 3 1z\" fill=\"#c93a2b\"/><path d=\"M16 -12l7 2-7 2z\" fill=\"#f2cf3a\"/><circle cx=\"12.5\" cy=\"-13\" r=\"1.3\" fill=\"#222\"/><path d=\"M8 -6q1 6 -2 8\" stroke=\"#c93a2b\" stroke-width=\"2.4\" fill=\"none\"/><path d=\"M-2 12v8M5 12v8M-6 20h7M1 20h7\" stroke=\"#d8a31a\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></g><g transform=\"translate(104 176) scale(1 1)\"><ellipse cx=\"0\" cy=\"12\" rx=\"14\" ry=\"2.5\" fill=\"#000\" opacity=\".15\"/><path d=\"M-12 -2Q-24 -12 -18 -22Q-8 -16 -8 -4z\" fill=\"#8a4410\"/><ellipse cx=\"0\" cy=\"0\" rx=\"13\" ry=\"10\" fill=\"#b8651a\"/><path d=\"M-6 -2q8 8 16 0\" stroke=\"#8a4410\" stroke-width=\"1.4\" fill=\"none\"/><circle cx=\"10\" cy=\"-9\" r=\"5.5\" fill=\"#b8651a\"/><path d=\"M7 -15q2-5 4 0q2-4 4 1z\" fill=\"#c93a2b\"/><path d=\"M15 -9l6 2-6 2z\" fill=\"#f2cf3a\"/><circle cx=\"11.5\" cy=\"-10\" r=\"1.2\" fill=\"#222\"/><path d=\"M7 -4q1 5 -1 6\" stroke=\"#c93a2b\" stroke-width=\"2\" fill=\"none\"/><path d=\"M-2 10v6M4 10v6M-5 16h6M1 16h6\" stroke=\"#d8a31a\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></g><g transform=\"translate(120 188) scale(1)\"><ellipse cx=\"2\" cy=\"7\" rx=\"6\" ry=\"1.5\" fill=\"#000\" opacity=\".12\"/><circle cx=\"0\" cy=\"0\" r=\"5\" fill=\"#f2cf3a\"/><circle cx=\"5\" cy=\"-4\" r=\"3.4\" fill=\"#f2cf3a\"/><path d=\"M8 -4l3.5 1-3.5 1z\" fill=\"#ee8a1f\"/><circle cx=\"6\" cy=\"-5\" r=\".8\" fill=\"#222\"/><path d=\"M-1 5v3M2 5v3\" stroke=\"#ee8a1f\" stroke-width=\"1.2\" stroke-linecap=\"round\"/></g><g transform=\"translate(90 190) scale(0.9)\"><ellipse cx=\"2\" cy=\"7\" rx=\"6\" ry=\"1.5\" fill=\"#000\" opacity=\".12\"/><circle cx=\"0\" cy=\"0\" r=\"5\" fill=\"#f2cf3a\"/><circle cx=\"5\" cy=\"-4\" r=\"3.4\" fill=\"#f2cf3a\"/><path d=\"M8 -4l3.5 1-3.5 1z\" fill=\"#ee8a1f\"/><circle cx=\"6\" cy=\"-5\" r=\".8\" fill=\"#222\"/><path d=\"M-1 5v3M2 5v3\" stroke=\"#ee8a1f\" stroke-width=\"1.2\" stroke-linecap=\"round\"/></g><g transform=\"translate(160 190) scale(0.9)\"><ellipse cx=\"2\" cy=\"7\" rx=\"6\" ry=\"1.5\" fill=\"#000\" opacity=\".12\"/><circle cx=\"0\" cy=\"0\" r=\"5\" fill=\"#f2cf3a\"/><circle cx=\"5\" cy=\"-4\" r=\"3.4\" fill=\"#f2cf3a\"/><path d=\"M8 -4l3.5 1-3.5 1z\" fill=\"#ee8a1f\"/><circle cx=\"6\" cy=\"-5\" r=\".8\" fill=\"#222\"/><path d=\"M-1 5v3M2 5v3\" stroke=\"#ee8a1f\" stroke-width=\"1.2\" stroke-linecap=\"round\"/></g></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(26 30) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(122 26) scale(0.8)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M96 44q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M110 38q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(176 122) scale(0.9)\"><path d=\"M-3 0Q-5 -30 -3 -58L1 -58Q1 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M-4 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(-1 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(150 104) scale(0.8)\"><ellipse cx=\"0\" cy=\"34\" rx=\"34\" ry=\"4\" fill=\"#000\" opacity=\".12\"/><rect x=\"-26\" y=\"2\" width=\"52\" height=\"30\" fill=\"#e2a92f\"/><path d=\"M-26 2v30\" stroke=\"#b98419\" stroke-width=\"3\"/><path d=\"M-24 8h48M-24 14h48M-24 20h48M-24 26h48\" stroke=\"#b98419\" stroke-width=\"1\" opacity=\".6\"/><path d=\"M-34 4Q-30 -22 0 -46Q30 -22 34 4Q0 12 -34 4z\" fill=\"#f3cc62\"/><path d=\"M0 -46Q12 -22 34 4Q18 8 0 8z\" fill=\"#e2a92f\" opacity=\".6\"/><path d=\"M0 -46L-22 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L-12 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L0 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L12 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L22 0\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L-30 2\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M0 -46L30 2\" stroke=\"#b98419\" stroke-width=\"1.2\" opacity=\".75\"/><path d=\"M-3 -46q3-8 6 0z\" fill=\"#b98419\"/><circle cx=\"0\" cy=\"-51\" r=\"3\" fill=\"#b98419\"/><rect x=\"-6\" y=\"14\" width=\"12\" height=\"18\" rx=\"2\" fill=\"#6b4a2b\"/></g><path d=\"M0 144Q50 139 100 143T200 141V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 166Q60 160 120 166T200 162V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 174h8M60 182h10M110 176h8M150 184h9M180 172h8M36 190h7\"/></g><g transform=\"translate(36 118)\"><ellipse cx=\"0\" cy=\"56\" rx=\"26\" ry=\"4\" fill=\"#000\" opacity=\".14\"/><rect x=\"-3\" y=\"24\" width=\"6\" height=\"32\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"0\" r=\"25\" fill=\"#2f8a3c\"/><circle cx=\"-21\" cy=\"10\" r=\"16\" fill=\"#226b2e\"/><circle cx=\"21\" cy=\"10\" r=\"16\" fill=\"#2f8a3c\"/><circle cx=\"-6\" cy=\"-13\" r=\"10\" fill=\"#62b94f\"/><g fill=\"#6a2c8a\"><circle cx=\"-10\" cy=\"4\" r=\"4.2\"/><circle cx=\"7\" cy=\"-3\" r=\"4.2\"/><circle cx=\"15\" cy=\"11\" r=\"4.2\"/><circle cx=\"-19\" cy=\"17\" r=\"4.2\"/><circle cx=\"2\" cy=\"14\" r=\"4.2\"/></g><g fill=\"#c0392b\"><circle cx=\"-2\" cy=\"-9\" r=\"3.6\"/><circle cx=\"19\" cy=\"2\" r=\"3.6\"/><circle cx=\"-14\" cy=\"-3\" r=\"3.6\"/></g></g><path d=\"M14 184q-2-7-5-9M14 184q0-8 0-11M14 184q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M190 182q-2-7-5-9M190 182q0-8 0-11M190 182q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"98\" cy=\"179\" rx=\"31.2\" ry=\"4.2\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"91.8\" cy=\"178\" rx=\"5.2\" ry=\"2.1\" fill=\"#8e4a24\"/><ellipse cx=\"106.3\" cy=\"178\" rx=\"5.2\" ry=\"2.1\" fill=\"#8e4a24\"/><path d=\"M82.4 130.2H113.6L123 174.9H73z\" fill=\"#d9487a\"/><path d=\"M100.1 130.2H113.6L123 174.9H106.3z\" fill=\"#000\" opacity=\".12\"/><path d=\"M73 167.6H123.5\" stroke=\"#6b3fa3\" stroke-width=\"5.2\"/><path d=\"M87.6 135.4q4.2 12.5 2.1 31.2M100.1 135.4q4.2 12.5 3.1 31.2\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M84.5 105.2L78 134\" stroke=\"#f2cf3a\" stroke-width=\"6.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"78\" cy=\"134\" r=\"4.2\" fill=\"#b3683a\"/><path d=\"M111.5 105.2L120 138\" stroke=\"#f2cf3a\" stroke-width=\"6.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"120\" cy=\"138\" r=\"4.2\" fill=\"#b3683a\"/><path d=\"M84.5 103.1Q98 97.9 111.5 103.1L112.6 128.1H83.4z\" fill=\"#f2cf3a\"/><path d=\"M85.5 102.1L112.6 134.3L112.6 153L85.5 113.5z\" fill=\"#d9487a\"/><path d=\"M85.5 102.1L112.6 134.3\" stroke=\"#6b3fa3\" stroke-width=\"3.1\"/><rect x=\"94.4\" y=\"95.8\" width=\"7.3\" height=\"8.3\" fill=\"#8e4a24\"/><ellipse cx=\"98\" cy=\"88.6\" rx=\"8.8\" ry=\"9.5\" fill=\"#b3683a\"/><ellipse cx=\"102\" cy=\"89.4\" rx=\"4\" ry=\"8\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M89.2 87.7a8.8 9.7 0 0 1 17.7 0q-8.8 -6.6 -17.7 0z\" fill=\"#2a1a12\"/><circle cx=\"89.6\" cy=\"87.7\" r=\"4.9\" fill=\"#2a1a12\"/><circle cx=\"94.9\" cy=\"89\" r=\"1.5\" fill=\"#2a1a12\"/><circle cx=\"101.5\" cy=\"89\" r=\"1.5\" fill=\"#2a1a12\"/><path d=\"M95.3 93q2.7 2.2 5.3 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"98.4\" cy=\"85\" r=\"1.3\" fill=\"#c93a2b\"/><path d=\"M66 132h28l-4 18H70z\" fill=\"#b98e5a\"/><path d=\"M66 132h28\" stroke=\"#8f6a3b\" stroke-width=\"2\"/><path d=\"M68 132q12-14 24 0\" stroke=\"#8f6a3b\" stroke-width=\"3\" fill=\"none\"/><path d=\"M68 140l20 4M68 146l20 3\" stroke=\"#d4ab74\" stroke-width=\"1.2\" opacity=\".7\"/><g fill=\"#6a2c8a\"><circle cx=\"74\" cy=\"129\" r=\"3.6\"/><circle cx=\"82\" cy=\"126\" r=\"3.6\"/><circle cx=\"90\" cy=\"129\" r=\"3.6\"/></g><g fill=\"#c0392b\"><circle cx=\"78\" cy=\"131\" r=\"3\"/><circle cx=\"86\" cy=\"131\" r=\"3\"/></g><path d=\"M140 178q8-14 24 0\" fill=\"#7a5a3c\"/><rect x=\"138\" y=\"168\" width=\"32\" height=\"10\" rx=\"3\" fill=\"#6b4a2b\"/><path d=\"M142 166l4-8M164 166l-4-8\" stroke=\"#4a3320\" stroke-width=\"2\"/><path d=\"M146 158l22 0\" stroke=\"#e8731f\" stroke-width=\"3\" stroke-linecap=\"round\" opacity=\".0\"/><g transform=\"translate(154 160) scale(1.2)\"><path d=\"M-3 -10q-4-6 0-10t0-9M3 -10q-4-6 0-10t0-9\" stroke=\"#fff\" stroke-width=\"2.4\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M-10 -4Q-13 11 0 14Q13 11 10 -4z\" fill=\"#a0562f\"/><path d=\"M3 -3Q8 6 2 13Q12 10 10 -4z\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"10\" ry=\"3.6\" fill=\"#6b3a22\"/><path d=\"M-8 4Q0 7 8 4\" stroke=\"#d29265\" stroke-width=\"1.2\" fill=\"none\"/></g><path d=\"M144 170q-3-6 0-9M164 170q3-6 0-9\" stroke=\"#e8731f\" stroke-width=\"2.4\" stroke-linecap=\"round\" fill=\"none\"/></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(28 28) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(124 24) scale(0.8)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M86 40q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M100 34q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0 108Q34 84 70 100T136 92T200 100V200H0z\" fill=\"#5aa86a\"/><g transform=\"translate(20 112) scale(0.85)\"><path d=\"M-3 0Q1 -30 3 -58L7 -58Q7 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M2 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(5 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(184 112) scale(0.85)\"><path d=\"M-3 0Q-5 -30 -3 -58L1 -58Q1 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M-4 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(-1 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><g transform=\"translate(112 96)\"><rect x=\"-3\" y=\"0\" width=\"6\" height=\"30\" fill=\"#7a5a3c\"/><circle cx=\"0\" cy=\"-6\" r=\"20\" fill=\"#2f7556\"/><circle cx=\"-12\" cy=\"4\" r=\"12\" fill=\"#256046\"/><circle cx=\"12\" cy=\"4\" r=\"12\" fill=\"#2f7556\"/><circle cx=\"-4\" cy=\"-14\" r=\"9\" fill=\"#4fa070\"/></g><path d=\"M0 150Q50 145 100 149T200 147V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 172Q60 166 120 172T200 168V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 180h8M60 188h10M110 182h8M150 190h9M180 178h8M36 196h7\"/></g><path d=\"M10 184q-2-7-5-9M10 184q0-8 0-11M10 184q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M98 190q-2-7-5-9M98 190q0-8 0-11M98 190q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M188 182q-2-7-5-9M188 182q0-8 0-11M188 182q2-7 5-9\" stroke=\"#226b2e\" stroke-width=\"1.7\" stroke-linecap=\"round\" fill=\"none\"/><g transform=\"translate(150 150) scale(0.92)\"><ellipse cx=\"0\" cy=\"22\" rx=\"32\" ry=\"4\" fill=\"#000\" opacity=\".16\"/><rect x=\"-28\" y=\"-12\" width=\"56\" height=\"24\" rx=\"5\" fill=\"#3a7d58\"/><rect x=\"-28\" y=\"-12\" width=\"56\" height=\"8\" rx=\"4\" fill=\"#4d9a70\"/><path d=\"M-18 -12L-12 -28H14L22 -12z\" fill=\"#2f6a4a\"/><rect x=\"-10\" y=\"-26\" width=\"10\" height=\"11\" rx=\"1.5\" fill=\"#cfeaf5\"/><rect x=\"3\" y=\"-26\" width=\"11\" height=\"11\" rx=\"1.5\" fill=\"#cfeaf5\"/><circle cx=\"-4\" cy=\"-31\" r=\"5\" fill=\"#b3683a\"/><circle cx=\"8\" cy=\"-31\" r=\"5\" fill=\"#8e4a24\"/><path d=\"M-9 -34q5-5 10 0M3 -34q5-5 10 0\" fill=\"#2a1a12\"/><circle cx=\"-16\" cy=\"12\" r=\"8.5\" fill=\"#2a2a28\"/><circle cx=\"16\" cy=\"12\" r=\"8.5\" fill=\"#2a2a28\"/><circle cx=\"-16\" cy=\"12\" r=\"3.4\" fill=\"#a9a9a2\"/><circle cx=\"16\" cy=\"12\" r=\"3.4\" fill=\"#a9a9a2\"/><rect x=\"22\" y=\"-6\" width=\"7\" height=\"5\" rx=\"2\" fill=\"#f2cf3a\"/></g><g transform=\"translate(74 160) scale(-0.95 0.95)\"><ellipse cx=\"0\" cy=\"30\" rx=\"36\" ry=\"4\" fill=\"#000\" opacity=\".15\"/><path d=\"M-28 -4Q-48 -8 -44 -26\" stroke=\"#e8731f\" stroke-width=\"7\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M-40 -20l2 4M-44 -12l3 3\" stroke=\"#2b1a10\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><ellipse cx=\"0\" cy=\"0\" rx=\"30\" ry=\"15\" fill=\"#e8731f\"/><path d=\"M-18 8Q0 18 22 8\" fill=\"#fbe3c4\"/><path d=\"M-13 -14v14M-4 -15v16M5 -14v15M14 -12v13M-22 -9v10\" stroke=\"#2b1a10\" stroke-width=\"3.6\" stroke-linecap=\"round\"/><path d=\"M-18 11v18M-6 13v17M11 13v17M22 11v18\" stroke=\"#e8731f\" stroke-width=\"7.5\" stroke-linecap=\"round\"/><path d=\"M-20 29h6M-8 30h6M9 30h6M20 29h6\" stroke=\"#fbe3c4\" stroke-width=\"4.5\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"-8\" r=\"12\" fill=\"#e8731f\"/><path d=\"M22 -18l-4-9 9 4zM36 -19l5-8 4 9z\" fill=\"#e8731f\"/><path d=\"M24 -17q-2 5 0 8M31 -18q-2 5 0 8M37 -14q-1 3 0 6\" stroke=\"#2b1a10\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"36\" cy=\"-2\" rx=\"6.5\" ry=\"4.6\" fill=\"#fbe3c4\"/><circle cx=\"40.5\" cy=\"-3.5\" r=\"1.8\" fill=\"#2b1a10\"/><circle cx=\"33\" cy=\"-10\" r=\"2.2\" fill=\"#2b1a10\"/><circle cx=\"33.7\" cy=\"-10.7\" r=\".7\" fill=\"#fff\"/></g><ellipse cx=\"26\" cy=\"187\" rx=\"19.2\" ry=\"2.6\" fill=\"#000\" opacity=\".14\"/><path d=\"M21.5 156.6L20.9 186\" stroke=\"#b3683a\" stroke-width=\"4.8\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M30.5 156.6L31.8 186\" stroke=\"#b3683a\" stroke-width=\"4.8\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M16.4 155.3H35.6L36.9 177H15.1z\" fill=\"#2e9a55\"/><path d=\"M16.4 164.2H36.2M15.8 170.6H36.9\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".6\"/><path d=\"M23.4 156.6v16M30.5 156.6v16\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".45\"/><ellipse cx=\"20.2\" cy=\"186.5\" rx=\"3.2\" ry=\"1.3\" fill=\"#8e4a24\"/><ellipse cx=\"32.4\" cy=\"186.5\" rx=\"3.2\" ry=\"1.3\" fill=\"#8e4a24\"/><path d=\"M17 141.2L44 150\" stroke=\"#b3683a\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"44\" cy=\"150\" r=\"2.9\" fill=\"#b3683a\"/><path d=\"M35 141.2L10 168\" stroke=\"#b3683a\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"10\" cy=\"168\" r=\"2.9\" fill=\"#b3683a\"/><path d=\"M17 139.9Q26 136.7 35 139.9L35.6 156.6H16.4z\" fill=\"#f7f4ea\"/><path d=\"M29.2 139.9L35.6 156.6H27.3z\" fill=\"#000\" opacity=\".1\"/><rect x=\"23.8\" y=\"135.4\" width=\"4.5\" height=\"5.1\" fill=\"#8e4a24\"/><ellipse cx=\"26\" cy=\"131\" rx=\"5.4\" ry=\"5.9\" fill=\"#b3683a\"/><ellipse cx=\"28.4\" cy=\"131.5\" rx=\"2.4\" ry=\"4.9\" fill=\"#8e4a24\" opacity=\".3\"/><circle cx=\"24.1\" cy=\"131.2\" r=\"1.1\" fill=\"#2a1a12\"/><circle cx=\"28.2\" cy=\"131.2\" r=\"1.1\" fill=\"#2a1a12\"/><path d=\"M24.4 133.7q1.6 1.4 3.3 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M19.7 130.4a6.3 7.1 0 0 1 12.5 0q-6.3 -3 -12.5 0z\" fill=\"#c93a2b\"/><path d=\"M21.1 127.7q4.9 -4.4 9.8 -0.5\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.2\" fill=\"none\"/></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>", "<svg class=\"sv-ill\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"sky\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#63b3e6\"/><stop offset=\".7\" stop-color=\"#bfe3f3\"/><stop offset=\"1\" stop-color=\"#eaf5ee\"/></linearGradient><filter id=\"cr\" x=\"-3%\" y=\"-3%\" width=\"106%\" height=\"106%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" seed=\"4\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"2.6\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter><pattern id=\"hatch\" width=\"3.2\" height=\"3.2\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(38)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"3.2\" stroke=\"#3a2a1a\" stroke-width=\".7\" opacity=\".1\"/></pattern><pattern id=\"hatch2\" width=\"4\" height=\"4\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-32)\"><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"4\" stroke=\"#fff\" stroke-width=\".8\" opacity=\".12\"/></pattern></defs><rect width=\"200\" height=\"200\" fill=\"url(#sky)\"/><g filter=\"url(#cr)\"><g transform=\"translate(26 30) scale(1)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><g transform=\"translate(120 24) scale(0.8)\" fill=\"#fff\" opacity=\".95\"><ellipse cx=\"0\" cy=\"0\" rx=\"16\" ry=\"7\"/><ellipse cx=\"14\" cy=\"-5\" rx=\"13\" ry=\"8\"/><ellipse cx=\"28\" cy=\"0\" rx=\"15\" ry=\"7\"/></g><path d=\"M80 44q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M94 38q3-4 6 0q3-4 6 0\" stroke=\"#3a4a55\" stroke-width=\"1.2\" fill=\"none\" stroke-linecap=\"round\"/><g transform=\"translate(14 120) scale(0.85)\"><path d=\"M-3 0Q1 -30 3 -58L7 -58Q7 -30 3 0z\" fill=\"#8f6a3e\"/><path d=\"M-2 -10h5M-1 -20h5M0 -30h5M2 -42h5\" stroke=\"#6f4f2c\" stroke-width=\"1.4\"/><g transform=\"translate(5 -58)\"><path d=\"M0 0Q-14.1 -11.6 -28.2 -7.2Q-11.1 -4.6 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-14.1 -10.6 -28.2 -7.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-10.9 -17.1 -21.9 -18.2Q-7.9 -10.1 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q-10.9 -16.1 -21.9 -18.2\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-2.6 -18.3 -5.2 -20.7Q0.4 -11.3 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-2.6 -17.3 -5.2 -20.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q5.8 -19.2 11.6 -22.4Q8.8 -12.2 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q5.8 -18.2 11.6 -22.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q12.3 -15.2 24.5 -14.4Q15.3 -8.2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q12.3 -14.2 24.5 -14.4\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q13.8 -6.7 27.6 2.6Q16.8 0.3 0 3z\" fill=\"#2f8a3c\"/><path d=\"M0 0Q13.8 -5.7 27.6 2.6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q11.3 -2.1 22.6 11.7Q14.3 4.9 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q11.3 -1.1 22.6 11.7\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><path d=\"M0 0Q-12 -5 -24 6Q-9 2 0 3z\" fill=\"#62b94f\"/><path d=\"M0 0Q-12 -4 -24 6\" stroke=\"#226b2e\" stroke-width=\"1\" fill=\"none\"/><circle cx=\"-2\" cy=\"2\" r=\"3\" fill=\"#7a4a1a\"/><circle cx=\"3\" cy=\"3\" r=\"3\" fill=\"#7a4a1a\"/></g></g><path d=\"M0 150Q50 145 100 149T200 147V200H0z\" fill=\"#cdb78f\"/><path d=\"M0 172Q60 166 120 172T200 168V200H0z\" fill=\"#b39b70\" opacity=\".55\"/><g stroke=\"#b39b70\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\".7\"><path d=\"M20 180h8M60 188h10M110 182h8M150 190h9M180 178h8M36 196h7\"/></g><clipPath id=\"wl\"><rect x=\"106\" y=\"108\" width=\"72\" height=\"58\"/></clipPath><g clip-path=\"url(#wl)\"><rect x=\"99\" y=\"108\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"113\" y=\"108\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"127\" y=\"108\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"141\" y=\"108\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"155\" y=\"108\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"169\" y=\"108\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"106\" y=\"115\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"120\" y=\"115\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"134\" y=\"115\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"148\" y=\"115\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"162\" y=\"115\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"176\" y=\"115\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"99\" y=\"122\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"113\" y=\"122\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"127\" y=\"122\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"141\" y=\"122\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"155\" y=\"122\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"169\" y=\"122\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"106\" y=\"129\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"120\" y=\"129\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"134\" y=\"129\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"148\" y=\"129\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"162\" y=\"129\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"176\" y=\"129\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"99\" y=\"136\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"113\" y=\"136\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"127\" y=\"136\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"141\" y=\"136\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"155\" y=\"136\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"169\" y=\"136\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"106\" y=\"143\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"120\" y=\"143\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"134\" y=\"143\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"148\" y=\"143\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"162\" y=\"143\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"176\" y=\"143\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"99\" y=\"150\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"113\" y=\"150\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"127\" y=\"150\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"141\" y=\"150\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"155\" y=\"150\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"169\" y=\"150\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"106\" y=\"157\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"120\" y=\"157\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"134\" y=\"157\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"148\" y=\"157\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"162\" y=\"157\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"176\" y=\"157\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"99\" y=\"164\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"113\" y=\"164\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"127\" y=\"164\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"141\" y=\"164\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"155\" y=\"164\" width=\"14\" height=\"7\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"169\" y=\"164\" width=\"14\" height=\"7\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"106\" y=\"108\" width=\"20\" height=\"58\" fill=\"#000\" opacity=\".08\"/></g><path d=\"M98 110L142 76 186 110\" stroke=\"#7a5a3c\" stroke-width=\"5.5\" fill=\"none\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M110 110V92M126 110V84M142 76V110M158 110V84M174 110V92\" stroke=\"#7a5a3c\" stroke-width=\"3.5\"/><rect x=\"130\" y=\"134\" width=\"24\" height=\"32\" rx=\"2\" fill=\"#6b4a2b\"/><rect x=\"158\" y=\"126\" width=\"14\" height=\"14\" rx=\"1\" fill=\"#8cc6df\" stroke=\"#7a5a3c\" stroke-width=\"2.5\"/><path d=\"M176 114l12 52M186 110l12 56\" stroke=\"#8f6a3b\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M179 126h8M182 140h8M185 154h8\" stroke=\"#8f6a3b\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><path d=\"M6 176l26-34 26 34z\" fill=\"#e8c47a\"/><path d=\"M26 176l8-12 10 12z\" fill=\"#d1ae61\"/><g><ellipse cx=\"22\" cy=\"190\" rx=\"13\" ry=\"6\" fill=\"#8e8e86\"/><ellipse cx=\"44\" cy=\"193\" rx=\"11\" ry=\"5.5\" fill=\"#a9a9a0\"/></g><g transform=\"translate(64 168)\"><rect x=\"0\" y=\"0\" width=\"22\" height=\"9\" fill=\"#d06a3a\" stroke=\"#8f3f22\" stroke-width=\".7\"/><rect x=\"3\" y=\"-9\" width=\"22\" height=\"9\" fill=\"#bd5a30\" stroke=\"#8f3f22\" stroke-width=\".7\"/></g><g><rect x=\"76\" y=\"184\" width=\"42\" height=\"8\" rx=\"4\" fill=\"#9c7442\"/><rect x=\"80\" y=\"175\" width=\"42\" height=\"8\" rx=\"4\" fill=\"#b98e5a\"/></g><ellipse cx=\"88\" cy=\"169\" rx=\"28.8\" ry=\"3.8\" fill=\"#000\" opacity=\".14\"/><path d=\"M81.3 123.8L80.3 168\" stroke=\"#b3683a\" stroke-width=\"7.2\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M94.7 123.8L96.6 168\" stroke=\"#b3683a\" stroke-width=\"7.2\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M73.6 121.9H102.4L104.3 154.6H71.7z\" fill=\"#2e9a55\"/><path d=\"M73.6 135.4H103.4M72.6 145H104.3\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".6\"/><path d=\"M84.2 123.8v24M94.7 123.8v24\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".45\"/><ellipse cx=\"79.4\" cy=\"168.5\" rx=\"4.8\" ry=\"1.9\" fill=\"#8e4a24\"/><ellipse cx=\"97.6\" cy=\"168.5\" rx=\"4.8\" ry=\"1.9\" fill=\"#8e4a24\"/><path d=\"M74.6 100.8L112 124\" stroke=\"#b3683a\" stroke-width=\"6.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"112\" cy=\"124\" r=\"4.3\" fill=\"#b3683a\"/><path d=\"M101.4 100.8L108 138\" stroke=\"#b3683a\" stroke-width=\"6.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"108\" cy=\"138\" r=\"4.3\" fill=\"#b3683a\"/><path d=\"M74.6 98.9Q88 94.1 101.4 98.9L102.4 123.8H73.6z\" fill=\"#f7f4ea\"/><path d=\"M92.8 98.9L102.4 123.8H89.9z\" fill=\"#000\" opacity=\".1\"/><rect x=\"84.6\" y=\"92.2\" width=\"6.7\" height=\"7.7\" fill=\"#8e4a24\"/><ellipse cx=\"88\" cy=\"85.4\" rx=\"8.2\" ry=\"8.8\" fill=\"#b3683a\"/><ellipse cx=\"91.7\" cy=\"86.3\" rx=\"3.7\" ry=\"7.3\" fill=\"#8e4a24\" opacity=\".3\"/><circle cx=\"85.1\" cy=\"85.8\" r=\"1.4\" fill=\"#2a1a12\"/><circle cx=\"91.3\" cy=\"85.8\" r=\"1.4\" fill=\"#2a1a12\"/><path d=\"M85.6 89.5q2.4 2 4.9 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M78.6 84.6a9.4 10.6 0 0 1 18.8 0q-9.4 -4.5 -18.8 0z\" fill=\"#c93a2b\"/><path d=\"M80.7 80.5q7.3 -6.5 14.7 -0.8\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.2\" fill=\"none\"/><rect x=\"104\" y=\"108\" width=\"14\" height=\"6\" rx=\"1\" fill=\"#c9c9c0\" transform=\"rotate(-22 111 111)\"/><ellipse cx=\"32\" cy=\"179\" rx=\"21\" ry=\"2.8\" fill=\"#000\" opacity=\".14\"/><ellipse cx=\"27.8\" cy=\"178\" rx=\"3.5\" ry=\"1.4\" fill=\"#8e4a24\"/><ellipse cx=\"37.6\" cy=\"178\" rx=\"3.5\" ry=\"1.4\" fill=\"#8e4a24\"/><path d=\"M21.5 145.8H42.5L48.8 175.9H15.2z\" fill=\"#d9487a\"/><path d=\"M33.4 145.8H42.5L48.8 175.9H37.6z\" fill=\"#000\" opacity=\".12\"/><path d=\"M15.2 171H49.1\" stroke=\"#6b3fa3\" stroke-width=\"3.5\"/><path d=\"M25 149.3q2.8 8.4 1.4 21M33.4 149.3q2.8 8.4 2.1 21\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".3\"/><path d=\"M22.9 129L50 132\" stroke=\"#f2cf3a\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"50\" cy=\"132\" r=\"2.8\" fill=\"#b3683a\"/><path d=\"M41.1 129L14 150\" stroke=\"#f2cf3a\" stroke-width=\"4.2\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"14\" cy=\"150\" r=\"2.8\" fill=\"#b3683a\"/><path d=\"M22.9 127.6Q32 124.1 41.1 127.6L41.8 144.4H22.2z\" fill=\"#f2cf3a\"/><path d=\"M23.6 126.9L41.8 148.6L41.8 161.2L23.6 134.6z\" fill=\"#d9487a\"/><path d=\"M23.6 126.9L41.8 148.6\" stroke=\"#6b3fa3\" stroke-width=\"2.1\"/><rect x=\"29.6\" y=\"122.7\" width=\"4.9\" height=\"5.6\" fill=\"#8e4a24\"/><ellipse cx=\"32\" cy=\"117.8\" rx=\"6\" ry=\"6.4\" fill=\"#b3683a\"/><ellipse cx=\"34.7\" cy=\"118.4\" rx=\"2.7\" ry=\"5.4\" fill=\"#8e4a24\" opacity=\".3\"/><path d=\"M26.1 117.2a6 6.5 0 0 1 11.9 0q-6 -4.5 -11.9 0z\" fill=\"#2a1a12\"/><circle cx=\"26.3\" cy=\"117.2\" r=\"3.3\" fill=\"#2a1a12\"/><circle cx=\"29.9\" cy=\"118.1\" r=\"1.1\" fill=\"#2a1a12\"/><circle cx=\"34.4\" cy=\"118.1\" r=\"1.1\" fill=\"#2a1a12\"/><path d=\"M30.2 120.8q1.8 1.5 3.6 0\" stroke=\"#5a2a18\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"32.3\" cy=\"115.4\" r=\"1\" fill=\"#c93a2b\"/></g><rect width=\"200\" height=\"200\" fill=\"url(#hatch)\"/><rect width=\"200\" height=\"200\" fill=\"url(#hatch2)\"/></svg>"];
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
