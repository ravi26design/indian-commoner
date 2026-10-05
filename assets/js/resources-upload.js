/* Resources upload — Videos, Podcasts, Literature, Newsfeed, Laws and Regulations.
   Only a user signed in with the "Resources" role sees the Upload button.
   Prototype: there is no backend, so uploaded items (and the files themselves,
   kept in IndexedDB) live in this browser only and are listed under
   "Uploaded by you" on the page. */
(function () {
  var MODS = {
    videos:     { kind: 'Video',      icon: 'video',     accept: 'video/*,.mp4,.webm,.mov',            linkHint: 'YouTube or other video link',  extra: null,                         level: true  },
    podcasts:   { kind: 'Podcast',    icon: 'mic',       accept: 'audio/*,.mp3,.m4a,.wav,.ogg',        linkHint: 'Podcast or audio link',        extra: 'Host / series',              level: false },
    literature: { kind: 'Literature', icon: 'book-open', accept: '.pdf,.doc,.docx,.epub,.txt',         linkHint: 'Link to the publication',      extra: 'Author(s)',                  level: false },
    newsfeed:   { kind: 'Newsfeed',   icon: 'newspaper', accept: '.pdf,.doc,.docx,image/*,.txt',       linkHint: 'Link to the article',          extra: 'Source / publication',       level: false },
    laws:       { kind: 'Law',        icon: 'scale',     accept: '.pdf,.doc,.docx,.txt',               linkHint: 'Link to the official text',    extra: 'Jurisdiction (state / Centre)', level: false }
  };
  var m = location.pathname.match(/resources-([a-z]+)\.html/);
  var page = m && m[1];
  var cfg = MODS[page];
  if (!cfg) return;
  // The page's own Beginner / Intermediate / Advanced tabs (where it has them) -> ask for a level.
  cfg.level = !!document.querySelector('[data-levelgroup]');

  var role = '', logged = false;
  try { role = localStorage.getItem('ic-role') || ''; logged = localStorage.getItem('ic-logged-in') === '1'; } catch (e) {}
  if (!logged || role !== 'Resources') return;

  var MAX_MB = 150;
  var LANGS = ['English', 'हिन्दी', 'मराठी', 'తెలుగు', 'ಕನ್ನಡ', 'தமிழ்', 'ଓଡ଼ିଆ', 'Other'];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function fmtSize(b) {
    if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' KB';
    return (b / 1024 / 1024).toFixed(1) + ' MB';
  }
  function fmtDate(ts) { return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

  // ---- storage: metadata in localStorage, file bytes in IndexedDB ----------
  function getItems() {
    try { return JSON.parse(localStorage.getItem('ic_uploads') || '[]'); } catch (e) { return []; }
  }
  function setItems(list) {
    try { localStorage.setItem('ic_uploads', JSON.stringify(list)); } catch (e) {}
  }
  function db() {
    return new Promise(function (res, rej) {
      var req = indexedDB.open('ic-uploads', 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('files'); };
      req.onsuccess = function () { res(req.result); };
      req.onerror = function () { rej(req.error); };
    });
  }
  function idb(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction('files', mode), st = tx.objectStore('files'), r = fn(st);
        tx.oncomplete = function () { res(r && r.result); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function putFile(id, blob) { return idb('readwrite', function (s) { return s.put(blob, id); }); }
  function getFile(id) { return idb('readonly', function (s) { return s.get(id); }); }
  function delFile(id) { return idb('readwrite', function (s) { return s.delete(id); }); }

  // ---- Upload button in the page header ----------------------------------
  var head = document.querySelector('.pagehead .in');
  if (!head) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary sm up-btn';
  btn.innerHTML = '<i data-lucide="upload"></i> Upload ' + esc(cfg.kind.toLowerCase());
  head.appendChild(btn);

  // ---- "Uploaded by you" section ---------------------------------------
  var main = document.querySelector('main');
  var sec = document.createElement('section');
  sec.className = 'section resbg up-sec';
  sec.style.paddingBottom = '0';
  sec.hidden = true;
  sec.innerHTML = '<div class="mx"><div class="up-sec-h"><h2>Uploaded by you</h2>' +
    '<span>Saved in this browser only — there is no server behind this prototype yet.</span></div>' +
    '<div class="grid g3 up-list"></div></div>';
  var pagehead = document.querySelector('.pagehead');
  pagehead.parentNode.insertBefore(sec, pagehead.nextSibling);
  var listEl = sec.querySelector('.up-list');
  var urls = [];

  function render() {
    urls.forEach(function (u) { URL.revokeObjectURL(u); });
    urls = [];
    var items = getItems().filter(function (i) { return i.page === page; });
    sec.hidden = !items.length;
    listEl.innerHTML = items.map(function (i) {
      return '<article class="card up-card" data-id="' + i.id + '">' +
        '<div class="up-media"></div>' +
        '<div class="up-body">' +
          '<div class="up-tags"><span class="tag solid"><i data-lucide="' + cfg.icon + '"></i> ' + esc(cfg.kind) + '</span>' +
            (i.level ? '<span class="tag">' + esc(i.level) + '</span>' : '') +
            (i.lang ? '<span class="tag">' + esc(i.lang) + '</span>' : '') + '</div>' +
          '<h3>' + esc(i.title) + '</h3>' +
          (i.extra ? '<div class="up-extra">' + esc(i.extra) + '</div>' : '') +
          (i.desc ? '<p>' + esc(i.desc) + '</p>' : '') +
          '<div class="up-meta">' + (i.fileName ? esc(i.fileName) + ' · ' + fmtSize(i.fileSize) + ' · ' : '') + 'Added ' + fmtDate(i.ts) + '</div>' +
          '<div class="up-acts">' +
            (i.link ? '<a class="btn btn-outline sm" href="' + esc(i.link) + '" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link"></i> Open link</a>' : '') +
            (i.hasFile ? '<button type="button" class="btn btn-outline sm" data-act="open"><i data-lucide="eye"></i> Open file</button>' +
                         '<button type="button" class="btn btn-outline sm" data-act="download"><i data-lucide="download"></i> Download</button>' : '') +
            '<button type="button" class="btn btn-ghost sm up-del" data-act="delete"><i data-lucide="trash-2"></i> Delete</button>' +
          '</div></div></article>';
    }).join('');
    // Inline player for uploaded video/audio files.
    items.forEach(function (i) {
      if (!i.hasFile || !/^(video|audio)\//.test(i.fileType || '')) return;
      getFile(i.id).then(function (blob) {
        var card = listEl.querySelector('[data-id="' + i.id + '"] .up-media');
        if (!blob || !card) return;
        var u = URL.createObjectURL(blob); urls.push(u);
        card.innerHTML = i.fileType.indexOf('video/') === 0
          ? '<video controls preload="metadata" src="' + u + '"></video>'
          : '<audio controls preload="metadata" src="' + u + '"></audio>';
      }).catch(function () {});
    });
    if (window.lucide) lucide.createIcons();
  }

  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var card = b.closest('.up-card'), id = card.getAttribute('data-id');
    var item = getItems().filter(function (i) { return i.id === id; })[0];
    if (!item) return;
    var act = b.getAttribute('data-act');
    if (act === 'delete') {
      if (!window.confirm('Delete “' + item.title + '”? This removes it from your uploads.')) return;
      setItems(getItems().filter(function (i) { return i.id !== id; }));
      delFile(id).catch(function () {});
      render();
    } else {
      getFile(id).then(function (blob) {
        if (!blob) return;
        var u = URL.createObjectURL(blob);
        if (act === 'open') { window.open(u, '_blank'); }
        else { var a = document.createElement('a'); a.href = u; a.download = item.fileName || 'download'; a.click(); }
        setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
      });
    }
  });

  // ---- Upload modal -------------------------------------------------------
  var modal = document.createElement('div');
  modal.className = 'modal-back';
  modal.innerHTML =
    '<div class="modal-card wide pw-modal up-modal" role="dialog" aria-modal="true" aria-labelledby="up-title">' +
      '<div class="fm-head"><div><span class="kicker">Resources</span><b id="up-title">Upload ' + esc(cfg.kind.toLowerCase()) + '</b></div>' +
        '<button type="button" class="modal-x" data-up-close aria-label="Close"><i data-lucide="x"></i></button></div>' +
      '<form class="fm-body up-form" novalidate>' +
        '<label class="up-f"><span>Title <span class="req">*</span></span><input type="text" name="title" maxlength="160" placeholder="Give it a clear title"></label>' +
        '<label class="up-f">Description<textarea name="desc" rows="3" maxlength="600" placeholder="What is this about? (optional)"></textarea></label>' +
        (cfg.extra ? '<label class="up-f">' + esc(cfg.extra) + '<input type="text" name="extra" maxlength="120"></label>' : '') +
        '<div class="up-row">' +
          (cfg.level ? '<label class="up-f">Level<select name="level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>' : '') +
          '<label class="up-f">Language<select name="lang">' + LANGS.map(function (l) { return '<option>' + esc(l) + '</option>'; }).join('') + '</select></label>' +
        '</div>' +
        '<div class="up-f">File<label class="up-drop"><i data-lucide="upload-cloud"></i><span class="up-drop-t">Choose a file</span>' +
          '<small>Up to ' + MAX_MB + ' MB</small><input type="file" name="file" accept="' + esc(cfg.accept) + '" hidden></label></div>' +
        '<div class="up-or"><span>or</span></div>' +
        '<label class="up-f">Link<input type="url" name="link" placeholder="https://… (' + esc(cfg.linkHint) + ')"></label>' +
        '<p class="up-err" role="alert" hidden></p>' +
        '<div class="up-foot"><button type="button" class="btn btn-outline" data-up-close>Cancel</button>' +
          '<button type="submit" class="btn btn-primary"><i data-lucide="upload"></i> Upload</button></div>' +
      '</form></div>';
  document.body.appendChild(modal);

  var form = modal.querySelector('form'), err = modal.querySelector('.up-err');
  var fileIn = form.elements.file, dropT = modal.querySelector('.up-drop-t');
  function showErr(t) { err.textContent = t; err.hidden = !t; }
  function open() { form.reset(); dropT.textContent = 'Choose a file'; showErr(''); modal.classList.add('open'); form.elements.title.focus(); }
  function close() { modal.classList.remove('open'); }
  btn.addEventListener('click', open);
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-up-close]')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  fileIn.addEventListener('change', function () {
    dropT.textContent = fileIn.files[0] ? fileIn.files[0].name : 'Choose a file';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = form.elements.title.value.trim();
    var link = form.elements.link.value.trim();
    var file = fileIn.files[0] || null;
    if (!title) { showErr('Please add a title.'); return; }
    if (!file && !link) { showErr('Choose a file or paste a link.'); return; }
    if (link && !/^https?:\/\/\S+$/i.test(link)) { showErr('The link should start with http:// or https://'); return; }
    if (file && file.size > MAX_MB * 1024 * 1024) { showErr('That file is larger than ' + MAX_MB + ' MB.'); return; }
    var id = 'u' + Date.now() + Math.floor(Math.random() * 1000);
    var item = {
      id: id, page: page, kind: cfg.kind, title: title, desc: form.elements.desc.value.trim(),
      extra: cfg.extra ? form.elements.extra.value.trim() : '', level: cfg.level ? form.elements.level.value : '',
      lang: form.elements.lang.value, link: link, hasFile: !!file,
      fileName: file ? file.name : '', fileSize: file ? file.size : 0, fileType: file ? file.type : '', ts: Date.now()
    };
    var done = function () {
      var all = getItems(); all.unshift(item); setItems(all);
      close(); render();
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (file) putFile(id, file).then(done).catch(function () { showErr('Couldn’t save the file in this browser (storage may be full or blocked).'); });
    else done();
  });

  render();
  if (window.lucide) lucide.createIcons();
})();
