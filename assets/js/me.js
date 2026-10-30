/* Indian Commoner — the logged-in member as other scripts need to show them: real name, initials and optional profile photo.
   Loaded in <head> so page scripts can use it before site.js runs. The prototype has one fixed persona (Priya Sharma);
   threads and replies she writes are stored with the author "You". */
(function () {
  var ME = { name: 'Priya Sharma', initials: 'PS' };
  var KEY = 'ic_profile_photo';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function photo() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }

  // Exact post date and time, e.g. "30 Oct 2026, 10:42 PM".
  window.icDateTime = function (ts) {
    var d = new Date(+ts);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
      d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  };

  window.icMe = ME;
  window.icPhoto = photo;
  window.icSetPhoto = function (dataUrl) {
    try { if (dataUrl) localStorage.setItem(KEY, dataUrl); else localStorage.removeItem(KEY); } catch (e) { return false; }
    return true;
  };
  // "You" is how this browser's own posts are stored; show them under the member's real name.
  window.icDisplayName = function (author) { return author === 'You' ? ME.name : author; };
  // Fill an avatar element: the profile photo for the member's own posts when they have one, else initials.
  window.icFillAvatar = function (el, author) {
    if (!el) return;
    var mine = author === 'You', p = mine ? photo() : '';
    el.classList.toggle('has-photo', !!p);
    if (p) { el.textContent = ''; var i = document.createElement('img'); i.src = p; i.alt = ''; el.appendChild(i); }
    else el.textContent = mine ? ME.initials : String(author || '?').charAt(0).toUpperCase();
  };
  window.icAvatarHtml = function (author, extraStyle) {
    var mine = author === 'You', p = mine ? photo() : '';
    return '<span class="pw-av' + (p ? ' has-photo' : '') + '"' + (extraStyle ? ' style="' + esc(extraStyle) + '"' : '') + '>' +
      (p ? '<img src="' + esc(p) + '" alt="">' : esc(mine ? ME.initials : String(author || '?').charAt(0).toUpperCase())) + '</span>';
  };
})();
