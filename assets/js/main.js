/* REFL-CI — site vitrine : menu mobile, fenêtre « Bientôt disponible », visionneuse de galerie */
(function () {
  'use strict';

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('menu');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Liens vers l'application (pas encore en ligne) ----------
     Quand l'application REFL-CI sera publiée, il suffira de renseigner
     son adresse ci-dessous : les boutons y mèneront directement. */
  var APP_URL = 'https://refl-ci-app.vercel.app'; // à remplacer par le domaine définitif
  var CHEMINS = { adherer: '/adhesion', niveau: '/mes-infos' }; // la carte de membre viendra plus tard
  var TITRES = {
    adherer: 'Adhérer au REFL-CI',
    niveau: 'Voir mes infos',
    carte: 'Demander ma carte de membre'
  };

  var dialogue = document.getElementById('bientot');
  document.querySelectorAll('[data-app]').forEach(function (lien) {
    var cle = lien.getAttribute('data-app');
    if (APP_URL && CHEMINS[cle]) {
      lien.setAttribute('href', APP_URL + CHEMINS[cle]);
      return;
    }
    lien.addEventListener('click', function (e) {
      if (!dialogue || typeof dialogue.showModal !== 'function') return; // repli : lien vers la page Contact
      e.preventDefault();
      var titre = dialogue.querySelector('[data-titre]');
      if (titre) titre.textContent = TITRES[cle] || 'Bientôt disponible';
      dialogue.showModal();
    });
  });
  if (dialogue) {
    dialogue.addEventListener('click', function (e) {
      if (e.target === dialogue || e.target.closest('[data-fermer]')) dialogue.close();
    });
  }

  /* ---------- Délégations régionales : choix de la DRENA ---------- */
  var choix = document.getElementById('choix-drena');
  var listeDrena = document.getElementById('liste-delegations');
  if (choix && listeDrena) {
    var filtrer = function () {
      var v = choix.value;
      listeDrena.classList.toggle('une', !!v);
      listeDrena.querySelectorAll('[data-drena]').forEach(function (li) {
        li.hidden = !!v && li.getAttribute('data-drena') !== v;
      });
    };
    choix.addEventListener('change', filtrer);
    filtrer();
  }

  /* ---------- Visionneuse de galerie ---------- */
  var liens = Array.prototype.slice.call(document.querySelectorAll('.galerie a[data-grand]'));
  if (!liens.length) return;

  var boite = document.createElement('div');
  boite.className = 'visionneuse';
  boite.setAttribute('role', 'dialog');
  boite.setAttribute('aria-modal', 'true');
  boite.setAttribute('aria-label', 'Visionneuse de photos');
  boite.innerHTML =
    '<button class="fermer" type="button" aria-label="Fermer">×</button>' +
    '<button class="prec" type="button" aria-label="Photo précédente">‹</button>' +
    '<img alt="">' +
    '<button class="suiv" type="button" aria-label="Photo suivante">›</button>' +
    '<p class="leg"></p>';
  document.body.appendChild(boite);
  var img = boite.querySelector('img');
  var leg = boite.querySelector('.leg');
  var courant = 0;
  var dernierFocus = null;

  function groupe() {
    var album = liens[courant].closest('.galerie');
    return liens.filter(function (l) { return l.closest('.galerie') === album; });
  }
  function afficher(i) {
    courant = i;
    var l = liens[i];
    var vignette = l.querySelector('img');
    img.src = l.getAttribute('data-grand');
    img.alt = vignette ? vignette.alt : '';
    var g = groupe();
    leg.textContent = (vignette ? vignette.alt : '') + '  ·  ' + (g.indexOf(l) + 1) + ' / ' + g.length;
  }
  function deplacer(sens) {
    var g = groupe();
    var pos = g.indexOf(liens[courant]);
    var cible = g[(pos + sens + g.length) % g.length];
    afficher(liens.indexOf(cible));
  }
  function fermer() {
    boite.classList.remove('ouverte');
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if (dernierFocus) dernierFocus.focus();
  }
  liens.forEach(function (l, i) {
    l.addEventListener('click', function (e) {
      e.preventDefault();
      dernierFocus = l;
      afficher(i);
      boite.classList.add('ouverte');
      document.body.style.overflow = 'hidden';
      boite.querySelector('.fermer').focus();
    });
  });
  boite.querySelector('.fermer').addEventListener('click', fermer);
  boite.querySelector('.prec').addEventListener('click', function () { deplacer(-1); });
  boite.querySelector('.suiv').addEventListener('click', function () { deplacer(1); });
  boite.addEventListener('click', function (e) { if (e.target === boite) fermer(); });
  document.addEventListener('keydown', function (e) {
    if (!boite.classList.contains('ouverte')) return;
    if (e.key === 'Escape') fermer();
    if (e.key === 'ArrowLeft') deplacer(-1);
    if (e.key === 'ArrowRight') deplacer(1);
  });
  var x0 = null;
  boite.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  boite.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) deplacer(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
