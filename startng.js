/* start.ng connect-page helper + player state. No build step. */
(function () {
  'use strict';
  var START_NG = 'https://start.ng';
  var framePromise = null;
  function connectFrame() {
    if (!framePromise) {
      framePromise = new Promise(function (res, rej) {
        var el = document.createElement('iframe');
        el.src = START_NG + '/connect';
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        el.onload = function () { res(el); };
        el.onerror = rej;
        document.body.append(el);
      });
    }
    return framePromise;
  }
  function askStartNg(message, replyType, timeoutMs) {
    timeoutMs = timeoutMs || 5000;
    return connectFrame().then(function (el) {
      return new Promise(function (resolve) {
        var requestId = Math.random().toString(36).slice(2);
        var timer = setTimeout(function () { done(null); }, timeoutMs);
        function done(reply) {
          clearTimeout(timer);
          window.removeEventListener('message', onMessage);
          resolve(reply);
        }
        function onMessage(e) {
          if (e.origin !== START_NG || e.source !== el.contentWindow) return;
          var d = e.data || {};
          if (d.type === replyType && d.requestId === requestId) done(d);
        }
        window.addEventListener('message', onMessage);
        try {
          var payload = {};
          for (var k in message) payload[k] = message[k];
          payload.requestId = requestId;
          el.contentWindow.postMessage(payload, START_NG);
        } catch (err) { done(null); }
      });
    }).catch(function () { return null; });
  }
  var guestStyle = { body: 'male', primaryColor: '#4b7bec', secondaryColor: '#2b2f4a', skinColor: '#c68642', hairColor: '#17120f', hair: 'short', hat: 'none', accessory: 'none' };
  var player = { name: 'Guest', account: null, style: guestStyle, face: '', signedIn: false, id: null };
  function $(id) { return document.getElementById(id); }
  function toast(t) {
    var e = $('toast'); if (!e) return;
    e.textContent = t; e.style.opacity = 1;
    clearTimeout(e._t); e._t = setTimeout(function () { e.style.opacity = 0; }, 2200);
  }
  function signIn() {
    location.href = 'https://start.ng/?return_to=' + encodeURIComponent(location.origin + location.pathname);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function paintPlayer() {
    $('player-name').textContent = player.name;
    $('player-account').textContent = player.signedIn ? ('@' + player.account) : 'Not signed in';
    $('player-signin').hidden = player.signedIn;
    if (player.face) $('player-face').src = player.face;
    var pb = parseInt(localStorage.getItem('sr3d_best') || '0', 10);
    var bl = $('best-line');
    if (bl) bl.textContent = pb > 0 ? ('Your device best: ' + pb + 'm') : 'Sign in with start.ng to save scores.';
  }
  function refreshPlayer(silent) {
    return askStartNg({ type: 'startng:whoami' }, 'startng:user', 4000).then(function (reply) {
      if (reply && reply.user) {
        var u = reply.user;
        var st = {};
        for (var k in guestStyle) st[k] = (u.style && u.style[k]) || guestStyle[k];
        player = { name: u.name || 'Runner', account: u.account || '', style: st, face: u.face || '', signedIn: true, id: u.id };
      } else if (reply && reply.guest) {
        var g = reply.guest || {};
        var st2 = {};
        for (var k2 in guestStyle) st2[k2] = (g.style && g.style[k2]) || guestStyle[k2];
        player = { name: g.name || 'Guest', account: null, style: st2, face: g.face || '', signedIn: false, id: null };
      }
      paintPlayer();
      if (window.buildAvatar) window.buildAvatar();
      if (!silent) toast(player.signedIn ? ('Welcome, ' + player.name + '!') : 'Playing as Guest');
    });
  }
  function loadBoard() {
    var b = $('board'); if (!b) return;
    askStartNg({ type: 'startng:leaderboard', limit: 10 }, 'startng:leaderboardData', 6000).then(function (r) {
      var rows = (r && r.entries) || [];
      if (!rows.length) { b.innerHTML = '<li><span>No runs yet - be the first!</span><span>*</span></li>'; return; }
      b.innerHTML = '';
      rows.forEach(function (e) {
        var li = document.createElement('li');
        if (player.id && e.player_id === player.id) li.className = 'me';
        var s = e.stats || {};
        li.innerHTML = '<span>#' + e.rank + ' ' + esc(e.name) + '</span><span>' + (s.distance || e.score || 0) + 'm / ' + (s.stars || 0) + '</span>';
        b.appendChild(li);
      });
    });
  }
  function saveScore(d, st, cb) {
    if (!player.signedIn) { loadBoard(); if (cb) cb(null); return; }
    askStartNg({ type: 'startng:score', stats: { distance: d, stars: st } }, 'startng:scoreSaved', 6000).then(function (r) {
      if (cb) cb(r);
      loadBoard();
    });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshPlayer(true); });
  window.addEventListener('focus', function () { refreshPlayer(true); });
  window.StartNG = { ask: askStartNg, refresh: refreshPlayer, board: loadBoard, save: saveScore, toast: toast, signIn: signIn, esc: esc };
  window.getPlayer = function () { return player; };
})();
