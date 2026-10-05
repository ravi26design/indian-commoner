/* Resources uploads + moderation (prototype, no backend).
   - Videos / Podcasts / Literature / Newsfeed / Laws and Regulations each get an
     "Upload …" button. It captures the same metadata those pages show for a
     resource (title, themes, level, link/file, and — per page — date/source or
     region/subject/type).
   - A submission goes to a Moderator queue (moderation.html). Once a Moderator
     approves it, it appears on the page under "Community uploads".
   - Everything (records in localStorage, file bytes in IndexedDB) lives in this
     browser only. Exposes window.icRes for moderation.html. */
(function () {
  var STORE = 'ic_resource_submissions';
  var THEMES = ['Governing the Commons', 'Commons as Culture', 'Commons as Microhabitats',
    'Livelihoods, Subsistence and Valuation of Commons', 'Gender and Commons', 'Power and Commons',
    'Conversion of Commons', 'Others'];
  var ME = 'Priya Sharma';          // the prototype's one signed-in persona
  var MAX_MB = 150;

  // What each page shows for a resource, and so what its upload form asks for.
  var MODS = {
    videos:     { kind: 'Video',      cta: 'Upload Video',                 icon: 'video',     accept: 'video/*,.mp4,.webm,.mov',      linkHint: 'YouTube or other video link', themes: true,  level: true,  file: true,  linkReq: false },
    podcasts:   { kind: 'Podcast',    cta: 'Upload Podcasts',              icon: 'mic',       accept: 'audio/*,.mp3,.m4a,.wav,.ogg',  linkHint: 'Podcast or audio link',       themes: true,  level: false, file: true,  linkReq: false },
    literature: { kind: 'Literature', cta: 'Upload Literature',            icon: 'book-open', accept: '.pdf,.doc,.docx,.epub,.txt',   linkHint: 'Link to the publication',     themes: true,  level: true,  file: true,  linkReq: false },
    newsfeed:   { kind: 'Newsfeed',   cta: 'Upload Newsfeed',              icon: 'newspaper', accept: '',                             linkHint: 'Link to the original article', themes: false, level: false, file: false, linkReq: false, news: true },
    laws:       { kind: 'Law',        cta: 'Upload Laws and Regulations',  icon: 'scale',     accept: '.pdf,.doc,.docx,.txt',         linkHint: 'Link to the official text',   themes: false, level: false, file: true,  linkReq: false, law: true }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function fmtSize(b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  function fmtDate(ts) { return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function fmtMonth(v) { return v ? new Date(v + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''; }
  function safeUrl(u) { return /^https?:\/\/\S+$/i.test(u || '') ? u : ''; }
  function role() { try { return localStorage.getItem('ic-role') || ''; } catch (e) { return ''; } }
  function loggedIn() { try { return localStorage.getItem('ic-logged-in') === '1'; } catch (e) { return false; } }

  // ---- storage: records in localStorage, file bytes in IndexedDB -------------
  function getItems() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; } }
  function setItems(l) { try { localStorage.setItem(STORE, JSON.stringify(l)); } catch (e) {} }
  function db() {
    return new Promise(function (res, rej) {
      var q = indexedDB.open('ic-uploads', 1);
      q.onupgradeneeded = function () { q.result.createObjectStore('files'); };
      q.onsuccess = function () { res(q.result); };
      q.onerror = function () { rej(q.error); };
    });
  }
  function idb(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction('files', mode), r = fn(tx.objectStore('files'));
        tx.oncomplete = function () { res(r && r.result); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function putFile(id, b) { return idb('readwrite', function (s) { return s.put(b, id); }); }
  function getFile(id) { return idb('readonly', function (s) { return s.get(id); }); }
  function delFile(id) { return idb('readwrite', function (s) { return s.delete(id); }); }

  function ytId(u) {
    var m = /(?:youtube\.com\/watch\?(?:[^#]*&)?v=|youtu\.be\/)([\w-]{11})/.exec(u || '');
    return m ? m[1] : '';
  }

  // ---- one resource card, shared by the pages and the moderation queue --------
  // mode: 'public' (approved, on the resource page) | 'mine' (own pending/rejected) | 'mod' (moderator)
  function cardHtml(i, mode) {
    var cfg = MODS[i.page] || MODS.literature;
    var link = safeUrl(i.link), yt = ytId(link);
    var tags = (i.themes || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join('');
    if (i.level) tags += '<span class="tag">' + esc(i.level) + '</span>';
    if (i.region) tags += '<span class="tag">' + esc(i.region) + '</span>';
    if (i.subject) tags += '<span class="tag">' + esc(i.subject) + '</span>';
    if (i.type) tags += '<span class="tag solid">' + esc(i.type) + '</span>';
    var status = '';
    if (mode !== 'public') {
      status = '<span class="up-status st-' + i.status + '">' + (i.status === 'pending' ? 'Awaiting moderator review' : i.status === 'approved' ? 'Published' : 'Not approved') + '</span>';
    }
    var media = yt
      ? '<a class="up-yt" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer"><img src="https://img.youtube.com/vi/' + yt + '/hqdefault.jpg" alt="" loading="lazy"><span class="v-play"><i data-lucide="play"></i></span></a>'
      : '';
    var line = i.news ? '<div class="up-extra">' + esc([fmtMonth(i.date), i.source].filter(Boolean).join(' · ')) + '</div>' : '';
    var secs = i.sections || [], firstP = '';
    for (var k = 0; k < secs.length && !firstP; k++) firstP = (secs[k].text || '').trim();
    var excerpt = firstP ? '<p class="up-excerpt">' + esc(firstP.length > 170 ? firstP.slice(0, 170).replace(/\s+\S*$/, '') + '…' : firstP) + '</p>' : '';
    var meta = [];
    if (i.fileName) meta.push(esc(i.fileName) + ' · ' + fmtSize(i.fileSize));
    meta.push('Submitted by ' + esc(i.by) + ' · ' + fmtDate(i.ts));
    var acts = '';
    if (secs.length) acts += '<a class="btn btn-outline sm" href="resources-newsfeed-article.html?id=' + encodeURIComponent(i.id) + '"><i data-lucide="book-open"></i> Read article</a>';
    if (link) acts += '<a class="btn btn-outline sm" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link"></i> ' + (secs.length ? 'Original link' : 'Open link') + '</a>';
    if (i.hasFile) acts += '<button type="button" class="btn btn-outline sm" data-act="open"><i data-lucide="eye"></i> Open file</button>' +
                           '<button type="button" class="btn btn-outline sm" data-act="download"><i data-lucide="download"></i> Download</button>';
    var reason = (i.status === 'rejected' && i.reason) ? '<p class="up-reason"><b>Moderator note:</b> ' + esc(i.reason) + '</p>' : '';
    if (mode === 'mine') acts += '<button type="button" class="btn btn-ghost sm up-del" data-act="delete"><i data-lucide="trash-2"></i> Delete</button>';
    if (mode === 'mod') {
      if (i.status === 'pending') {
        acts += '<button type="button" class="btn btn-primary sm" data-act="approve"><i data-lucide="check"></i> Approve</button>' +
                '<button type="button" class="btn btn-outline sm up-del" data-act="reject"><i data-lucide="x"></i> Reject</button>';
      } else {
        acts += '<button type="button" class="btn btn-outline sm" data-act="reopen"><i data-lucide="rotate-ccw"></i> Move back to pending</button>';
      }
    }
    return '<article class="card up-card" data-id="' + i.id + '"><div class="up-media">' + media + '</div><div class="up-body">' +
      '<div class="up-tags"><span class="tag solid up-kind"><i data-lucide="' + cfg.icon + '"></i> ' + esc(cfg.kind) + '</span>' + status + '</div>' +
      '<h3>' + esc(i.title) + '</h3>' + line + excerpt +
      (tags ? '<div class="up-tags">' + tags + '</div>' : '') + reason +
      '<div class="up-meta">' + meta.join('<br>') + '</div>' +
      '<div class="up-acts">' + acts + '</div></div></article>';
  }

  // Inline player for uploaded video/audio, then file open/download wiring.
  var urls = [];
  function hydrate(root, items) {
    items.forEach(function (i) {
      if (!i.hasFile || !/^(video|audio)\//.test(i.fileType || '')) return;
      getFile(i.id).then(function (blob) {
        var slot = root.querySelector('[data-id="' + i.id + '"] .up-media');
        if (!blob || !slot || slot.innerHTML) return;
        var u = URL.createObjectURL(blob); urls.push(u);
        slot.innerHTML = i.fileType.indexOf('video/') === 0 ? '<video controls preload="metadata" src="' + u + '"></video>' : '<audio controls preload="metadata" src="' + u + '"></audio>';
      }).catch(function () {});
    });
    if (window.lucide) lucide.createIcons();
  }
  function fileAction(i, act) {
    getFile(i.id).then(function (blob) {
      if (!blob) return;
      var u = URL.createObjectURL(blob);
      if (act === 'open') window.open(u, '_blank');
      else { var a = document.createElement('a'); a.href = u; a.download = i.fileName || 'download'; a.click(); }
      setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
    });
  }
  function resetUrls() { urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; }

  window.icRes = { MODS: MODS, getItems: getItems, setItems: setItems, delFile: delFile, cardHtml: cardHtml, hydrate: hydrate,
                   fileAction: fileAction, resetUrls: resetUrls, esc: esc };

  // ======================= resource pages =======================
  var m = location.pathname.match(/resources-([a-z]+)\.html/);
  var page = m && m[1], cfg = MODS[page];
  if (!cfg) return;
  var head = document.querySelector('.pagehead .in');
  if (!head) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary sm up-btn';
  btn.innerHTML = '<i data-lucide="upload"></i> ' + esc(cfg.cta);
  head.appendChild(btn);

  function makeSection(title, note) {
    var s = document.createElement('section');
    s.className = 'section resbg up-sec'; s.style.paddingBottom = '0'; s.hidden = true;
    s.innerHTML = '<div class="mx"><div class="up-sec-h"><h2>' + esc(title) + '</h2><span>' + esc(note) + '</span></div><div class="grid g3 up-list"></div></div>';
    return s;
  }
  var pagehead = document.querySelector('.pagehead');
  var secMine = makeSection('Your submissions', 'Waiting for a Moderator, or not approved. Approved items move to Community uploads.');
  var secPub = makeSection('Community uploads', 'Approved by a Moderator. Saved in this browser only — there is no server behind this prototype yet.');
  pagehead.parentNode.insertBefore(secPub, pagehead.nextSibling);
  pagehead.parentNode.insertBefore(secMine, pagehead.nextSibling);

  function render() {
    resetUrls();
    var all = getItems().filter(function (i) { return i.page === page; });
    var pub = all.filter(function (i) { return i.status === 'approved'; });
    var mine = all.filter(function (i) { return i.status !== 'approved' && i.by === ME; });
    secPub.hidden = !pub.length; secMine.hidden = !mine.length;
    secPub.querySelector('.up-list').innerHTML = pub.map(function (i) { return cardHtml(i, 'public'); }).join('');
    secMine.querySelector('.up-list').innerHTML = mine.map(function (i) { return cardHtml(i, 'mine'); }).join('');
    hydrate(secPub, pub); hydrate(secMine, mine);
  }
  [secPub, secMine].forEach(function (sec) {
    sec.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var id = b.closest('.up-card').getAttribute('data-id');
      var item = getItems().filter(function (i) { return i.id === id; })[0]; if (!item) return;
      var act = b.getAttribute('data-act');
      if (act === 'delete') {
        if (!window.confirm('Delete “' + item.title + '”?')) return;
        setItems(getItems().filter(function (i) { return i.id !== id; })); delFile(id).catch(function () {}); render();
      } else fileAction(item, act);
    });
  });

  // ---- upload modal ----
  function opts(list) { return list.map(function (v) { return '<option>' + esc(v) + '</option>'; }).join(''); }
  function pageValues(cat) {
    return [].map.call(document.querySelectorAll('.fp-cat[data-cat="' + cat + '"] input[type=checkbox]'), function (c) { return c.value; });
  }
  var modal = document.createElement('div');
  modal.className = 'modal-back';
  var fields = '<label class="up-f"><span>Title <span class="req">*</span></span><input type="text" name="title" maxlength="200" placeholder="Title as it should appear"></label>';
  if (cfg.themes) {
    fields += '<fieldset class="up-f up-themes"><legend>Themes <span class="req">*</span></legend><div class="up-chips">' +
      THEMES.map(function (t) { return '<label class="up-chip"><input type="checkbox" name="themes" value="' + esc(t) + '"><span>#' + esc(t) + '</span></label>'; }).join('') + '</div></fieldset>';
  }
  if (cfg.level) fields += '<label class="up-f"><span>Level <span class="req">*</span></span><select name="level">' + opts(['Beginner', 'Intermediate', 'Advanced']) + '</select></label>';
  if (cfg.news) {
    fields += '<div class="up-row"><label class="up-f"><span>Published <span class="req">*</span></span><input type="month" name="date"></label>' +
      '<label class="up-f"><span>Source / publication <span class="req">*</span></span><input type="text" name="source" maxlength="120" placeholder="e.g. Down To Earth"></label></div>' +
      '<div class="up-f up-article"><span>Article <span class="req">*</span></span>' +
        '<p class="up-hint">Write the article as sub-titles and paragraphs. Add as many sections as you need.</p>' +
        '<div class="up-secs"></div>' +
        '<button type="button" class="btn btn-outline sm up-add"><i data-lucide="plus"></i> Add sub-title &amp; paragraph</button></div>';
  }
  if (cfg.law) {
    fields += '<div class="up-row"><label class="up-f"><span>Region <span class="req">*</span></span><select name="region">' + opts(['Central (India)'].concat(pageValues('region'), ['Other'])) + '</select></label>' +
      '<label class="up-f"><span>Type <span class="req">*</span></span><select name="type">' + opts(pageValues('type').concat(['Other'])) + '</select></label></div>' +
      '<label class="up-f"><span>Subject <span class="req">*</span></span><select name="subject">' + opts(pageValues('subject').concat(['Other'])) + '</select></label>';
  }
  if (cfg.file) {
    fields += '<div class="up-f"><span>File</span><label class="up-drop"><i data-lucide="upload-cloud"></i><span class="up-drop-t">Choose a file</span><small>Up to ' + MAX_MB + ' MB</small>' +
      '<input type="file" name="file" accept="' + esc(cfg.accept) + '" hidden></label></div><div class="up-or"><span>or</span></div>';
  }
  fields += '<label class="up-f"><span>' + (cfg.news ? 'Original link <small class="up-opt">(optional)</small>' : 'Link') + '</span><input type="url" name="link" placeholder="https://… (' + esc(cfg.linkHint) + ')"></label>';
  modal.innerHTML =
    '<div class="modal-card wide pw-modal up-modal' + (cfg.news ? ' up-news' : '') + '" role="dialog" aria-modal="true" aria-labelledby="up-title">' +
      '<div class="fm-head"><div><span class="kicker">Goes to a Moderator for review</span><b id="up-title">' + esc(cfg.cta) + '</b></div>' +
        '<button type="button" class="modal-x" data-up-close aria-label="Close"><i data-lucide="x"></i></button></div>' +
      '<form class="fm-body up-form" novalidate>' + fields +
        '<p class="up-err" role="alert" hidden></p>' +
        '<div class="up-foot"><button type="button" class="btn btn-outline" data-up-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary"><i data-lucide="send"></i> Submit for review</button></div></form></div>';
  document.body.appendChild(modal);

  var form = modal.querySelector('form'), err = modal.querySelector('.up-err');
  var fileIn = form.elements.file, dropT = modal.querySelector('.up-drop-t');
  function showErr(t) { err.textContent = t; err.hidden = !t; }
  function close() { modal.classList.remove('open'); }

  // Newsfeed: the article is built from any number of sub-title + paragraph sections.
  var secsEl = modal.querySelector('.up-secs');
  function addSection() {
    var d = document.createElement('div');
    d.className = 'up-sect';
    d.innerHTML = '<div class="up-sect-h"><b class="up-sect-n"></b><button type="button" class="up-sect-x" aria-label="Remove this section"><i data-lucide="trash-2"></i></button></div>' +
      '<label class="up-f"><span>Sub-title</span><input type="text" class="up-sub" maxlength="160" placeholder="Sub-title (optional)"></label>' +
      '<label class="up-f"><span>Paragraph</span><textarea class="up-par" rows="4" maxlength="4000" placeholder="Write the paragraph. Leave a blank line to start another paragraph under the same sub-title."></textarea></label>';
    secsEl.appendChild(d);
    renumber();
    if (window.lucide) lucide.createIcons();
    return d;
  }
  function renumber() {
    var all = secsEl.querySelectorAll('.up-sect');
    all.forEach(function (d, n) {
      d.querySelector('.up-sect-n').textContent = 'Section ' + (n + 1);
      d.querySelector('.up-sect-x').hidden = all.length < 2;
    });
  }
  if (secsEl) {
    modal.querySelector('.up-add').addEventListener('click', function () { addSection().querySelector('input').focus(); });
    secsEl.addEventListener('click', function (e) {
      var x = e.target.closest('.up-sect-x'); if (!x) return;
      x.closest('.up-sect').remove(); renumber();
    });
  }
  btn.addEventListener('click', function () {
    if (!loggedIn()) { location.href = 'login.html?return=' + encodeURIComponent(location.href); return; }
    form.reset(); if (dropT) dropT.textContent = 'Choose a file'; showErr('');
    if (secsEl) { secsEl.innerHTML = ''; addSection(); }
    modal.classList.add('open'); form.elements.title.focus();
  });
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-up-close]')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  if (fileIn) fileIn.addEventListener('change', function () { dropT.textContent = fileIn.files[0] ? fileIn.files[0].name : 'Choose a file'; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, title = f.title.value.trim(), link = f.link.value.trim(), file = fileIn ? (fileIn.files[0] || null) : null;
    var themes = cfg.themes ? [].filter.call(form.querySelectorAll('input[name=themes]'), function (c) { return c.checked; }).map(function (c) { return c.value; }) : [];
    if (!title) return showErr('Please add a title.');
    if (cfg.themes && !themes.length) return showErr('Pick at least one theme.');
    if (cfg.news && !f.date.value) return showErr('Add the month it was published.');
    if (cfg.news && !f.source.value.trim()) return showErr('Add the source / publication.');
    var sections = [];
    if (cfg.news) {
      [].forEach.call(secsEl.querySelectorAll('.up-sect'), function (d) {
        var sub = d.querySelector('.up-sub').value.trim(), text = d.querySelector('.up-par').value.trim();
        if (sub || text) sections.push({ sub: sub, text: text });
      });
      if (!sections.some(function (x) { return x.text; })) return showErr('Write at least one paragraph for the article.');
      if (sections.some(function (x) { return x.sub && !x.text; })) return showErr('Each sub-title needs a paragraph under it.');
    }
    if (!cfg.news && !file && !link) return showErr('Choose a file or paste a link.');
    if (link && !safeUrl(link)) return showErr('The link should start with http:// or https://');
    if (file && file.size > MAX_MB * 1048576) return showErr('That file is larger than ' + MAX_MB + ' MB.');
    var isMod = role() === 'Moderator';           // a Moderator's own upload needs no second review
    var id = 'r' + Date.now() + Math.floor(Math.random() * 1000);
    var item = {
      id: id, page: page, title: title, themes: themes, level: cfg.level ? f.level.value : '', link: link,
      news: !!cfg.news, sections: sections, date: cfg.news ? f.date.value : '', source: cfg.news ? f.source.value.trim() : '',
      region: cfg.law ? f.region.value : '', subject: cfg.law ? f.subject.value : '', type: cfg.law ? f.type.value : '',
      hasFile: !!file, fileName: file ? file.name : '', fileSize: file ? file.size : 0, fileType: file ? file.type : '',
      status: isMod ? 'approved' : 'pending', by: ME, ts: Date.now()
    };
    var done = function () {
      var all = getItems(); all.unshift(item); setItems(all); close(); render();
      showToast(isMod ? 'Published — it’s now on this page.' : 'Submitted. A Moderator will review it before it appears here.');
      (isMod ? secPub : secMine).scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (file) putFile(id, file).then(done).catch(function () { showErr('Couldn’t save the file in this browser (storage may be full or blocked).'); });
    else done();
  });

  function showToast(t) {
    var el = document.createElement('div');
    el.className = 'up-toast'; el.setAttribute('role', 'status'); el.textContent = t;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 400); }, 3800);
  }

  render();
  if (window.lucide) lucide.createIcons();
})();
