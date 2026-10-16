/* Builds the 3D runner from the start.ng character style. */
(function () {
  'use strict';
  var avatar = null;
  var parts = {};
  function mat(c) { return new THREE.MeshLambertMaterial({ color: c }); }
  window.buildAvatar = function () {
    var sc = window.getScene();
    if (!sc) return;
    if (avatar) sc.remove(avatar);
    avatar = new THREE.Group();
    parts = {};
    var p = window.getPlayer ? window.getPlayer() : null;
    var s = (p && p.style) || {};
    var skin = mat(s.skinColor || '#c68642');
    var top = mat(s.primaryColor || '#4b7bec');
    var bot = mat(s.secondaryColor || '#2b2f4a');
    var hairM = mat(s.hairColor || '#17120f');
    var legL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.8, 0.34), bot);
    legL.position.set(-0.22, 0.4, 0);
    var legR = legL.clone(); legR.position.x = 0.22;
    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.5), top);
    torso.position.y = 1.25;
    var armL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.26), top);
    armL.position.set(-0.62, 1.25, 0);
    var armR = armL.clone(); armR.position.x = 0.62;
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), skin);
    head.position.y = 2.15;
    avatar.add(legL); avatar.add(legR); avatar.add(torso);
    avatar.add(armL); avatar.add(armR); avatar.add(head);
    parts = { legL: legL, legR: legR, armL: armL, armR: armR, torso: torso, head: head };
    var hair = s.hair || 'short';
    if (hair === 'afro') {
      var a = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), hairM);
      a.position.y = 2.42; a.scale.set(1.15, 0.9, 1.15); avatar.add(a);
    } else if (hair === 'bun') {
      var b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 14), hairM);
      b.position.y = 2.38; b.scale.set(1, 0.55, 1); avatar.add(b);
      var bun = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), hairM);
      bun.position.set(0, 2.66, -0.15); avatar.add(bun);
    } else if (hair === 'ponytail') {
      var pp = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 14), hairM);
      pp.position.y = 2.36; pp.scale.set(1, 0.6, 1); avatar.add(pp);
      var tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.16), hairM);
      tail.position.set(0, 2.1, -0.5); avatar.add(tail);
    } else if (hair !== 'bald') {
      var sh = new THREE.Mesh(new THREE.SphereGeometry(0.47, 14, 14), hairM);
      sh.position.y = 2.4; sh.scale.set(1, 0.55, 1); avatar.add(sh);
    }
    window.finishAvatar(avatar, parts, s, mat);
  };
  window.getAvatar = function () { return avatar; };
  window.setAvatar = function (g) { avatar = g; };
  window.getAvatarParts = function () { return parts; };
})();
