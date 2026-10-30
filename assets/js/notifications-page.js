/* Notifications page: every notification from the themes the member subscribes to. */
(function () {
  var main = document.getElementById('np-main'), out = document.getElementById('np-signedout');
  var logged = false;
  try { logged = localStorage.getItem('ic-logged-in') === '1' || localStorage.getItem('ic-logged-in') === 'true'; } catch (e) {}
  if (!logged) { out.hidden = false; document.querySelectorAll('.np-actions').forEach(function (e) { e.hidden = true; }); return; }
  main.hidden = false;

  var list = document.getElementById('np-list'), filter = 'all';
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(ts) {
    var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; if (m < 1440) return Math.floor(m / 60) + ' h ago';
    return Math.floor(m / 1440) + ' day' + (m < 2880 ? '' : 's') + ' ago';
  }
  var ART = '<svg class="np-art" viewBox="0 0 180 110" aria-hidden="true"><circle cx="90" cy="58" r="46" fill="#e6f3f1"/><ellipse cx="90" cy="98" rx="74" ry="8" fill="#cfe6e1"/>' +
    '<path d="M90 24c-16 0-26 11-26 27v14l-8 11h68l-8-11V51c0-16-10-27-26-27z" fill="#fff" stroke="#01796f" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M82 82a8 8 0 0 0 16 0" fill="#f3d27a" stroke="#01796f" stroke-width="2.5"/><circle cx="90" cy="22" r="4" fill="#01796f"/>' +
    '<path d="M132 36l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#a89c50"/><path d="M42 44l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#a89c50" opacity=".7"/></svg>';

  function paint() {
    var all = icNotifications(), unread = all.filter(function (n) { return !n.read; });
    document.getElementById('np-n-all').textContent = all.length;
    document.getElementById('np-n-unread').textContent = unread.length;
    var shown = filter === 'unread' ? unread : all;
    if (!shown.length) {
      list.innerHTML = '<div class="np-empty">' + ART + '<b>' + (all.length ? 'You are all caught up' : 'No notifications yet') + '</b>' +
        '<span>' + (all.length ? 'There is nothing unread.' : 'Subscribe to a theme and new discussions in it will show up here.') + '</span>' +
        (all.length ? '' : '<a class="btn btn-primary sm" href="member-profile.html#subs"><i data-lucide="bell-ring"></i> Subscribe to themes</a>') + '</div>';
    } else {
      list.innerHTML = shown.map(function (n) {
        return '<article class="np-item' + (n.read ? '' : ' unread') + '" data-id="' + esc(n.id) + '">' +
          '<span class="np-ic"><i data-lucide="bell-ring"></i></span>' +
          '<div class="np-body"><div class="np-meta"><span class="tag tint-teal">' + esc(n.theme) + '</span>' + (n.sample ? '<span class="tag tint-slate">Sample</span>' : '') +
          '<span class="np-when" title="' + esc(icDateTime(n.ts)) + '">' + esc(ago(n.ts)) + ' · ' + esc(icDateTime(n.ts)) + '</span></div>' +
          '<h3><a href="' + esc(n.href) + '" data-open>' + esc(n.title) + '</a></h3>' +
          '<p>New discussion in a theme you subscribe to.</p></div>' +
          '<div class="np-ops"><a class="btn btn-outline sm" href="' + esc(n.href) + '" data-open>Open</a>' +
          '<button type="button" class="clearbtn" data-toggle>' + (n.read ? 'Mark as unread' : 'Mark as read') + '</button>' +
          '<button type="button" class="clearbtn danger" data-del aria-label="Delete notification"><i data-lucide="x"></i></button></div></article>';
      }).join('');
    }
    var subs = icSubs().themes;
    document.getElementById('np-subs-sum').textContent = subs.length
      ? 'You are subscribed to ' + subs.length + ' theme' + (subs.length === 1 ? '' : 's') + '.'
      : 'You are not subscribed to any theme yet.';
    document.getElementById('np-chips').innerHTML = subs.map(function (t) { return '<span class="tag tint-teal">' + esc(t) + '</span>'; }).join('');
    document.getElementById('np-readall').disabled = !unread.length;
    document.getElementById('np-clear').disabled = !all.length;
    if (window.lucide) lucide.createIcons();
    window.dispatchEvent(new Event('ic-notes'));          // keep the header bell in step
  }
  list.addEventListener('click', function (e) {
    var item = e.target.closest('.np-item'); if (!item) return;
    var id = item.getAttribute('data-id');
    if (e.target.closest('[data-open]')) { icMarkRead(id); return; }   // follow the link, marked read first
    if (e.target.closest('[data-toggle]')) { var n = icNotifications().filter(function (x) { return x.id === id; })[0]; if (n && n.read) icMarkUnread(id); else icMarkRead(id); paint(); }
    if (e.target.closest('[data-del]')) { icDeleteNotification(id); paint(); }
  });
  document.getElementById('np-tabs').addEventListener('click', function (e) {
    var b = e.target.closest('.seg-tab'); if (!b) return;
    document.querySelectorAll('#np-tabs .seg-tab').forEach(function (x) { x.classList.toggle('on', x === b); });
    filter = b.getAttribute('data-f'); paint();
  });
  document.getElementById('np-readall').addEventListener('click', function () { icMarkRead(); paint(); });
  document.getElementById('np-clear').addEventListener('click', function () { if (confirm('Clear all notifications?')) { icClearNotifications(); paint(); } });
  window.addEventListener('storage', paint);
  paint();
})();
