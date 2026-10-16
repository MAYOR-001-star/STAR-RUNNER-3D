/* Hats, accessories, dreads/braids: second half of the avatar builder. */
(function () {
  'use strict';
  window.finishAvatar = function (avatar, parts, s, mat) {
    var hairM = mat(s.hairColor || '#17120f');
    var hair = s.hair || 'short';
    if (hair === 'dreads') {
      for (var d = -2; d <= 2; d++) {
        var dr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.12), hairM);
        dr.position.set(d * 0.16, 1.85, -0.1); avatar.add(dr);
      }
    }
    if (hair === 'braids') {
      for (var q = -1; q <= 1; q++) {
        var br = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), hairM);
        br.position.set(q * 0.25, 1.9, -0.35); avatar.add(br);
      }
    }
    var hat = s.hat || 'none';
    if (hat === 'cap') {
      var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.22, 16), mat(s.primaryColor || '#888888'));
      c1.position.y = 2.62; avatar.add(c1);
      var brim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.4), mat(s.primaryColor || '#888888'));
      brim.position.set(0, 2.54, 0.5); avatar.add(brim);
    } else if (hat === 'beanie') {
      var be = new THREE.Mesh(new THREE.SphereGeometry(0.46, 14, 12, 0, Math.PI * 2, 0, 1.4), mat(s.secondaryColor || '#888888'));
      be.position.y = 2.5; avatar.add(be);
    } else if (hat === 'tophat') {
      var th = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.55, 16), mat('#111111'));
      th.position.y = 2.85; avatar.add(th);
    } else if (hat === 'crown') {
      var cr = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0x664400 }));
      cr.position.y = 2.72; avatar.add(cr);
    }
    var acc = s.accessory || 'none';
    if (acc === 'glasses') {
      var g1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.05), mat('#111111'));
      g1.position.set(-0.18, 2.2, 0.38);
      var g2 = g1.clone(); g2.position.x = 0.18; avatar.add(g1); avatar.add(g2);
    } else if (acc === 'beard') {
      var bd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.15), hairM);
      bd.position.set(0, 1.85, 0.3); avatar.add(bd);
    } else if (acc === 'scarf') {
      var scf = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.12, 8, 16), mat('#e0245e'));
      scf.position.y = 1.78; scf.rotation.x = Math.PI / 2; avatar.add(scf);
    } else if (acc === 'backpack') {
      var bp = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.3), mat(s.secondaryColor || '#555555'));
      bp.position.set(0, 1.3, -0.42); avatar.add(bp);
    } else if (acc === 'earrings') {
      var e1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0x553300 }));
      e1.position.set(-0.44, 2.05, 0);
      var e2 = e1.clone(); e2.position.x = 0.44; avatar.add(e1); avatar.add(e2);
    }
    var eyeM = new THREE.MeshBasicMaterial({ color: 0x141414 });
    var eL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeM);
    eL.position.set(-0.15, 2.2, 0.37);
    var eR = eL.clone(); eR.position.x = 0.15;
    avatar.add(eL); avatar.add(eR);
    var lane = window.gameLane || 1;
    avatar.position.set([-2.2, 0, 2.2][lane], 0, 0);
    window.getScene().add(avatar);
    window.setAvatar(avatar);
  };
})();
