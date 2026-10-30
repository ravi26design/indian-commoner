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

  // Real member photos by display name. Drop an image into assets/img/avatars/ and add a line here, e.g.
  //   'Indu': 'assets/img/avatars/indu.jpg'
  // and that member's avatar shows the photo in thread lists and the Members directory. (Empty until real photos are supplied.)
  var MEMBER_PHOTOS = {
  };
  var photoIndex = null;
  // The signed-in member's account appears in the Members directory as "Admin" (their profile says "Admin User")
  // and as "Priya Sharma" elsewhere; whatever photo they uploaded in Edit Profile shows for both.
  var OWN_NAMES = ['priya sharma', 'admin'];
  function memberPhoto(name) {
    var key = String(name || '').trim().toLowerCase();
    if (OWN_NAMES.indexOf(key) !== -1 && photo()) return photo();
    if (!photoIndex) {
      photoIndex = {};
      var extra = {};
      try { extra = JSON.parse(localStorage.getItem('ic_member_photos') || '{}'); } catch (e) {}
      [MEMBER_PHOTOS, extra].forEach(function (src) { Object.keys(src).forEach(function (k) { photoIndex[k.trim().toLowerCase()] = src[k]; }); });
    }
    return photoIndex[String(name || '').trim().toLowerCase()] || '';
  }
  window.icMemberPhoto = memberPhoto;
  // Show a member's photo in an avatar element when one is available (otherwise leave the initial as it is).
  window.icApplyMemberPhoto = function (el, name) {
    var p = memberPhoto(name);
    if (!el || !p) return false;
    el.classList.add('has-photo'); el.textContent = '';
    var i = document.createElement('img'); i.src = p; i.alt = ''; el.appendChild(i);
    return true;
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
