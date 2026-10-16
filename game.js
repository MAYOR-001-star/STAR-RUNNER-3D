/* Star Runner 3D: scene, loop, input, scoring. */
(function () {
  'use strict';
  var canvas = document.getElementById('scene');
  var renderer = null, scene = null, camera = null;
  var laneX = [-2.2, 0, 2.2];
  var state = 'menu';
  var lane = 1, vy = 0, y = 0, sliding = false, slideT = 0;
  var dist = 0, stars = 0, speed = 9, spawnT = 0, runT = 0;
  var obs = [], coins = [];
  window.gameLane = 1;
  window.getScene = function () { return scene; };
  function $(id) { return document.getElementById(id); }
  function initThree() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e1a);
    scene.fog = new THREE.Fog(0x0b0e1a, 18, 60);
    camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 200);
    camera.position.set(0, 4.4, 7.5);
    camera.lookAt(0, 1.4, -6);
    scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x1a1030, 0.95));
    var sun = new THREE.DirectionalLight(0xfff2c0, 1.1);
    sun.position.set(4, 10, 4); scene.add(sun);
    var i;
    for (i = -2; i < 8; i++) {
      var t = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.2, 4),
        new THREE.MeshLambertMaterial({ color: 0x232842 }));
      t.position.set(0, -0.1, -i * 4);
      t.userData.scroll = true; scene.add(t);
    }
    for (i = -1; i <= 1; i++) {
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 60),
        new THREE.MeshBasicMaterial({ color: 0xd8fd71 }));
      rail.position.set(i * 2.2 + 1.1, -0.02, -20); scene.add(rail);
    }
    for (i = 0; i < 140; i++) {
      var st = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.09, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      st.position.set((Math.random() - 0.5) * 60, 4 + Math.random() * 16, -Math.random() * 70);
      scene.add(st);
    }
    var moon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xf5f0ff }));
    moon.position.set(-12, 12, -55); scene.add(moon);
    window.buildAvatar();
    window.addEventListener('resize', function () {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
    renderer.setSize(innerWidth, innerHeight);
  }
  function spawnRow() {
    var i, l;
    if (Math.random() < 0.62) {
      var blocked = [];
      var n = Math.random() < 0.45 ? 2 : 1;
      var guard = 0;
      while (blocked.length < n && guard++ < 20) {
        l = (Math.random() * 3) | 0;
        if (blocked.indexOf(l) < 0) blocked.push(l);
      }
      blocked.forEach(function (ll) {
        var h = 1.1;
        var o = new THREE.Mesh(new THREE.BoxGeometry(1.6, h, 0.5),
          new THREE.MeshLambertMaterial({ color: 0xffb020, emissive: 0x553300 }));
        o.position.set(laneX[ll], h / 2, -34);
        o.userData.h = h; scene.add(o); obs.push(o);
      });
    } else {
      l = (Math.random() * 3) | 0;
      for (i = 0; i < 3; i++) {
        var c = new THREE.Mesh(new THREE.OctahedronGeometry(0.32),
          new THREE.MeshLambertMaterial({ color: 0xd8fd71, emissive: 0x445500 }));
        c.position.set(laneX[l], 1.0, -32 - i * 2.2);
        scene.add(c); coins.push(c);
      }
    }
  }
  function reset() {
    var i;
    for (i = 0; i < obs.length; i++) scene.remove(obs[i]);
    for (i = 0; i < coins.length; i++) scene.remove(coins[i]);
    obs = []; coins = [];
    lane = 1; window.gameLane = 1;
    vy = 0; y = 0; sliding = false;
    dist = 0; stars = 0; speed = 9; spawnT = 0; runT = 0;
    window.buildAvatar();
    $('ui-dist').textContent = '0'; $('ui-stars').textContent = '0';
  }
  function startGame() {
    reset(); state = 'play'; $('overlay').hidden = true;
    $('btn-pause').hidden = false; $('btn-pause').textContent = 'II';
    var p = window.getPlayer();
    window.StartNG.toast(p.signedIn ? ('Go, ' + p.name + '!') : 'Go! Guest mode');
  }

  function endGame() {
    if (state === 'paused') state = 'play';
    state = 'over';
    $('btn-pause').hidden = true;
    var d = Math.floor(dist);
    var pb = parseInt(localStorage.getItem('sr3d_best') || '0', 10);
    if (d > pb) localStorage.setItem('sr3d_best', String(d));
    var p = window.getPlayer();
    $('overlay').hidden = false;
    $('menu').innerHTML = '<h1>Wipeout!</h1><p><b>' + d + 'm</b> - <b>' + stars +
      ' stars</b><br>' + (p.signedIn ? ('Saving as ' + window.StartNG.esc(p.name) + '...') : 'Guests cannot save. Sign in!') +
      '</p><div id="save-line" style="font-weight:800;color:#d8fd71"></div>' +
      '<button class="btn" id="again">Run again</button><ol id="board"></ol>';
    $('again').onclick = startGame;
    window.StartNG.save(d, stars, function (r) {
      var line = $('save-line');
      if (!line) return;
      if (r && r.ok) line.textContent = 'Saved! Rank #' + ((r.result && r.result.rank) || '?');
      else if (r) line.textContent = r.error || 'Could not save.';
    });
  }
  function doLeft() { if (state !== 'play') return; lane = Math.max(0, lane - 1); window.gameLane = lane; }
  function doRight() { if (state !== 'play') return; lane = Math.min(2, lane + 1); window.gameLane = lane; }
  function doJump() { if (state !== 'play') return; if (y <= 0.01) vy = 8.2; }
  function doSlide() { if (state !== 'play') return; if (y > 0.1) vy = Math.min(vy, -9); sliding = true; slideT = 0.7; }
  function idle() { if (state === 'menu' || state === 'over') { startGame(); return true; } return false; }
  function togglePause() {
    if (state === 'play') {
      state = 'paused';
      $('overlay').hidden = false;
      $('pause-menu').hidden = false;
      $('pause-dist-val').textContent = Math.floor(dist);
      $('pause-stars-val').textContent = stars;
      $('btn-pause').textContent = '▶';
    } else if (state === 'paused') {
      state = 'play';
      $('pause-menu').hidden = true;
      $('overlay').hidden = true;
      $('btn-pause').textContent = 'II';
    }
  }
  window.addEventListener('keydown', function (e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') doLeft();
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') doRight();
    else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') { e.preventDefault(); if (!idle()) doJump(); }
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') doSlide();
    else if (e.code === 'KeyP') { e.preventDefault(); togglePause(); }
  });
  function bindHold(id, fn) { $(id).addEventListener('pointerdown', function (e) { e.preventDefault(); fn(); }); }
  bindHold('btn-left', doLeft); bindHold('btn-right', doRight);
  bindHold('btn-up', doJump); bindHold('btn-down', doSlide);
  $('btn-pause').onclick = togglePause;
  $('btn-resume').onclick = togglePause;
  $('btn-quit').onclick = function () { state = 'menu'; $('pause-menu').hidden = true; $('menu').hidden = false; $('btn-pause').hidden = true; };
  var touchX = null, touchY = null;
  canvas.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; touchX = t.clientX; touchY = t.clientY; }, { passive: true });
  canvas.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX, dy = t.clientY - touchY;
    if (Math.abs(dx) > Math.abs(dy)) { if (dx > 0) doRight(); else doLeft(); }
    else { if (dy < 0) { if (!idle()) doJump(); } else doSlide(); }
    touchX = null;
  }, { passive: true });
  $('btn-play').onclick = startGame;
  $('btn-sign').onclick = window.StartNG.signIn;
  $('player-signin').onclick = window.StartNG.signIn;
  var last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!renderer) return;
    var av = window.getAvatar();
    if (state === 'play' && av) {
      runT += dt; speed = Math.min(22, 9 + runT * 0.35); dist += speed * dt;
      $('ui-dist').textContent = Math.floor(dist);
      spawnT -= dt;
      if (spawnT <= 0) { spawnRow(); spawnT = Math.max(0.55, 1.35 - runT * 0.02); }
      var tx = laneX[lane];
      av.position.x += (tx - av.position.x) * Math.min(1, dt * 12);
      if (y > 0 || vy !== 0) { y += vy * dt; vy -= 24 * dt; if (y <= 0) { y = 0; vy = 0; } }
      if (sliding) { slideT -= dt; if (slideT <= 0) sliding = false; }
      av.position.y = y + (sliding ? -0.35 : 0);
      var parts = window.getAvatarParts();
      var t = now / 1000, s2 = Math.sin(t * 14);
      if (y > 0.01) { parts.legL.rotation.x = -0.7; parts.legR.rotation.x = 0.7; parts.armL.rotation.x = -2.4; parts.armR.rotation.x = -2.4; }
      else { parts.legL.rotation.x = s2 * 0.9; parts.legR.rotation.x = -s2 * 0.9; parts.armL.rotation.x = -s2 * 0.8; parts.armR.rotation.x = s2 * 0.8; }
      av.rotation.x = sliding ? -0.9 : (y > 0.01 ? -0.25 : 0);
      var i, o, c, j;
      for (i = obs.length - 1; i >= 0; i--) {
        o = obs[i]; o.position.z += speed * dt;
        if (o.position.z > 6) { scene.remove(o); obs.splice(i, 1); continue; }
        if (Math.abs(o.position.z) < 0.8 && Math.abs(av.position.x - o.position.x) < 1.0) {
          var h = o.userData.h || 1.1, feet = y + (sliding ? 0.15 : 0);
          if (!(y > 0.05 && feet > h - 0.25)) { endGame(); return; }
        }
      }
      for (j = coins.length - 1; j >= 0; j--) {
        c = coins[j]; c.position.z += speed * dt; c.rotation.y += dt * 4;
        if (c.position.z > 6) { scene.remove(c); coins.splice(j, 1); continue; }
        if (Math.abs(c.position.z) < 0.9 && Math.abs(av.position.x - c.position.x) < 1.0 && Math.abs((y + 1.0) - c.position.y) < 1.1) {
          scene.remove(c); coins.splice(j, 1); stars++; $('ui-stars').textContent = stars;
        }
      }
      var k;
      for (k = 0; k < scene.children.length; k++) {
        var sc2 = scene.children[k];
        if (sc2.userData && sc2.userData.scroll) { sc2.position.z += speed * dt; if (sc2.position.z > 8) sc2.position.z -= 40; }
      }
    } else if (state === 'menu' && av) { av.rotation.y += dt * 0.8; }
    renderer.render(scene, camera);
  }
  try { initThree(); }
  catch (e) { document.getElementById('loading').textContent = 'WebGL unavailable.'; return; }
  document.getElementById('loading').style.display = 'none';
  window.StartNG.refresh(true);
  window.StartNG.board();
  requestAnimationFrame(loop);
})();
