/* ================================================================
   VÉRONIQUE — Collection Digitale
   app.js — JavaScript complet
   Sections :
     1. Loader
     2. Curseur personnalisé
     3. Navigation (scroll + burger mobile)
     4. Animations scroll (reveal)
     5. GSAP + ScrollTrigger
     6. Module Transformation (slider avant/après)
     7. Module Viral (partage + téléchargement)
     8. Galerie Collection (plein écran / lightbox)
     9. Formulaire Contact (validation)
     10. Utilitaires
================================================================ */

'use strict';

/* ================================================================
   1. LOADER
================================================================ */

(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Cache le loader après le chargement de la page
  // (le CSS gère aussi le fallback automatique via animation)
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 800);
  });

  // Sécurité : si load tarde, CSS animation prend le relais à 2s
})();


/* ================================================================
   2. CURSEUR PERSONNALISÉ
================================================================ */

(function initCursor() {
  const cursor         = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursor-follower');
  if (!cursor || !cursorFollower) return;

  // Désactivé sur mobile (touch)
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Follower avec lag fluide
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Agrandissement sur éléments interactifs
  const interactives = document.querySelectorAll('a, button, [data-cursor]');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform         = 'translate(-50%, -50%) scale(2.5)';
      cursorFollower.style.width     = '60px';
      cursorFollower.style.height    = '60px';
      cursorFollower.style.opacity   = '0.4';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform         = 'translate(-50%, -50%) scale(1)';
      cursorFollower.style.width     = '36px';
      cursorFollower.style.height    = '36px';
      cursorFollower.style.opacity   = '1';
    });
  });

  // Cacher si souris quitte la fenêtre
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity         = '0';
    cursorFollower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity         = '1';
    cursorFollower.style.opacity = '1';
  });
})();


/* ================================================================
   3. NAVIGATION
================================================================ */

(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('navBurger');
  const links   = document.getElementById('navLinks');
  if (!nav) return;

  // Effet scroll : ajoute classe .scrolled
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Masquer la nav en scrollant vers le bas, réafficher vers le haut
    if (scrollY > lastScroll && scrollY > 200) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Burger menu mobile
  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      links.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fermer au clic sur un lien
    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Fermer au clic dehors
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && links.classList.contains('open')) {
        burger.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Transition nav au chargement
  nav.style.transition = 'transform 0.4s ease, padding 0.45s ease, background 0.45s ease';
})();


/* ================================================================
   4. ANIMATIONS SCROLL (REVEAL)
   Fallback CSS si GSAP non disponible
================================================================ */

(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // une seule fois
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
})();


/* ================================================================
   5. GSAP + SCROLLTRIGGER
   Animations avancées si GSAP est chargé
================================================================ */

(function initGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero : animation d'entrée staggerée ──
  const heroTitle = document.querySelectorAll('.hero-title-line');
  if (heroTitle.length) {
    gsap.from(heroTitle, {
      y: 80,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out',
      delay: 1.2 // après le loader
    });
  }

  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    gsap.from(heroSub, {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 1.7
    });
  }

  const heroActions = document.querySelector('.hero-actions');
  if (heroActions) {
    gsap.from(heroActions, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 2
    });
  }

  // ── Parallaxe léger sur le hero ──
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia) {
    gsap.to(heroMedia, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // ── Mots du manifeste : apparition au scroll ──
  const manifesteWords = document.querySelectorAll('.manifeste-word');
  if (manifesteWords.length) {
    gsap.from(manifesteWords, {
      opacity: 0,
      y: 40,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.manifeste-title',
        start: 'top 80%',
      }
    });
  }

  // ── Stats : compteur animé ──
  document.querySelectorAll('.stat-number').forEach(el => {
    const text = el.textContent.trim();
    // Ne compte que si c'est un nombre pur
    if (/^\d+$/.test(text)) {
      const target = parseInt(text);
      gsap.from({ val: 0 }, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].val);
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    }
  });

  // ── Cards aperçu : entrée décalée ──
  const apercuCards = document.querySelectorAll('.apercu-card');
  if (apercuCards.length) {
    gsap.from(apercuCards, {
      opacity: 0,
      y: 60,
      stagger: 0.15,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.apercu-grid',
        start: 'top 80%'
      }
    });
  }

  // ── Ligne or : expansion ──
  document.querySelectorAll('.gold-line').forEach(line => {
    gsap.from(line, {
      scaleX: 0,
      transformOrigin: 'left',
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 90%'
      }
    });
  });

})();


/* ================================================================
   6. MODULE TRANSFORMATION — Slider avant/après
================================================================ */

(function initTransformation() {
  const sliders = document.querySelectorAll('.transfo-slider');
  if (!sliders.length) return;

  sliders.forEach(slider => {
    const handle    = slider.querySelector('.transfo-handle');
    const afterPane = slider.querySelector('.transfo-after');
    const line      = slider.querySelector('.transfo-divider');
    if (!handle || !afterPane) return;

    let isDragging = false;
    let startX     = 0;

    function getPercent(clientX) {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      return Math.min(Math.max(pct, 2), 98);
    }

    function setPosition(pct) {
      afterPane.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (handle) handle.style.left = pct + '%';
      if (line)   line.style.left   = pct + '%';
    }

    // Init à 50%
    setPosition(50);

    // ── Souris ──
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setPosition(getPercent(e.clientX));
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // ── Touch mobile ──
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      setPosition(getPercent(e.touches[0].clientX));
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Clic direct sur le slider
    slider.addEventListener('click', (e) => {
      if (!isDragging) setPosition(getPercent(e.clientX));
    });
  });
})();


/* ================================================================
   7. MODULE VIRAL — Partage & téléchargement
================================================================ */

(function initViral() {

  // ── Partage natif (Web Share API) ──
  const shareBtns = document.querySelectorAll('[data-share]');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const platform = btn.dataset.share;
      const url      = btn.dataset.url || window.location.href;
      const text     = btn.dataset.text || 'Découvrez la Collection Véronique !';

      if (platform === 'native' && navigator.share) {
        try {
          await navigator.share({ title: 'Collection Véronique', text, url });
        } catch (err) {
          // Annulé par l'utilisateur — silencieux
        }
        return;
      }

      // Liens de partage par plateforme
      const shareUrls = {
        whatsapp:  `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
        instagram: `https://www.instagram.com/`,
        tiktok:    `https://www.tiktok.com/`
      };

      if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
      }
    });
  });

  // ── Téléchargement d'image ──
  const downloadBtns = document.querySelectorAll('[data-download]');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const imgSrc  = btn.dataset.download;
      const imgName = btn.dataset.name || 'veronique-collection.jpg';
      if (!imgSrc) return;

      const link    = document.createElement('a');
      link.href     = imgSrc;
      link.download = imgName;
      link.click();
    });
  });

  // ── Copier le lien ──
  const copyBtns = document.querySelectorAll('[data-copy]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || window.location.href;
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = 'Copié !';
        setTimeout(() => { btn.textContent = original; }, 2000);
      } catch (err) {
        console.warn('Copie non supportée.');
      }
    });
  });

})();


/* ================================================================
   8. GALERIE COLLECTION — Lightbox plein écran
================================================================ */

(function initLightbox() {
  const triggers = document.querySelectorAll('[data-lightbox]');
  if (!triggers.length) return;

  // Créer la lightbox dans le DOM
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-inner">
      <button class="lightbox-close" aria-label="Fermer">×</button>
      <button class="lightbox-prev" aria-label="Précédent">&#8592;</button>
      <div class="lightbox-media">
        <img class="lightbox-img" src="" alt="">
        <div class="lightbox-caption">
          <p class="lightbox-title"></p>
          <p class="lightbox-desc"></p>
        </div>
      </div>
      <button class="lightbox-next" aria-label="Suivant">&#8594;</button>
    </div>
  `;
  document.body.appendChild(lb);

  const img     = lb.querySelector('.lightbox-img');
  const title   = lb.querySelector('.lightbox-title');
  const desc    = lb.querySelector('.lightbox-desc');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev  = lb.querySelector('.lightbox-prev');
  const btnNext  = lb.querySelector('.lightbox-next');

  const items = Array.from(triggers);
  let current = 0;

  function open(index) {
    current = index;
    const el   = items[index];
    img.src    = el.dataset.lightbox;
    img.alt    = el.dataset.title || '';
    title.textContent = el.dataset.title || '';
    desc.textContent  = el.dataset.desc  || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    btnPrev.style.display = items.length > 1 ? '' : 'none';
    btnNext.style.display = items.length > 1 ? '' : 'none';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prev() {
    current = (current - 1 + items.length) % items.length;
    open(current);
  }

  function next() {
    current = (current + 1) % items.length;
    open(current);
  }

  // Événements
  triggers.forEach((el, i) => el.addEventListener('click', () => open(i)));
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  lb.querySelector('.lightbox-backdrop').addEventListener('click', close);

  // Clavier
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // Swipe mobile
  let touchStartX = 0;
  lb.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  });

})();


/* ================================================================
   9. FORMULAIRE CONTACT — Validation côté client
================================================================ */

(function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    nom:     { el: form.querySelector('#nom'),     min: 2,  label: 'Le nom' },
    email:   { el: form.querySelector('#email'),   type: 'email', label: 'L\'email' },
    message: { el: form.querySelector('#message'), min: 10, label: 'Le message' }
  };

  function showError(el, msg) {
    clearError(el);
    el.classList.add('input-error');
    const err = document.createElement('p');
    err.className   = 'field-error';
    err.textContent = msg;
    el.parentNode.appendChild(err);
  }

  function clearError(el) {
    el.classList.remove('input-error', 'input-ok');
    const existing = el.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Validation en temps réel
  Object.values(fields).forEach(({ el, min, type, label }) => {
    if (!el) return;
    el.addEventListener('blur', () => {
      clearError(el);
      const val = el.value.trim();
      if (!val) {
        showError(el, `${label} est requis.`);
      } else if (type === 'email' && !validateEmail(val)) {
        showError(el, 'Adresse email invalide.');
      } else if (min && val.length < min) {
        showError(el, `${label} doit faire au moins ${min} caractères.`);
      } else {
        el.classList.add('input-ok');
      }
    });
  });

  // Soumission
  form.addEventListener('submit', (e) => {
    let valid = true;

    Object.values(fields).forEach(({ el, min, type, label }) => {
      if (!el) return;
      clearError(el);
      const val = el.value.trim();
      if (!val) {
        showError(el, `${label} est requis.`);
        valid = false;
      } else if (type === 'email' && !validateEmail(val)) {
        showError(el, 'Adresse email invalide.');
        valid = false;
      } else if (min && val.length < min) {
        showError(el, `${label} doit faire au moins ${min} caractères.`);
        valid = false;
      }
    });

    if (!valid) {
      e.preventDefault();
      // Scroll vers la première erreur
      const firstError = form.querySelector('.input-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

})();


/* ================================================================
   10. UTILITAIRES
================================================================ */

// ── Année dynamique dans le footer ──
(function setYear() {
  const yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();

// ── Lazy loading images (fallback si IntersectionObserver dispo) ──
(function lazyImages() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if ('loading' in HTMLImageElement.prototype) return; // natif supporté

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  imgs.forEach(img => observer.observe(img));
})();

// ── Smooth scroll sur ancres internes ──
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ── Flash messages : auto-fermeture après 5s ──
(function autoCloseFlash() {
  document.querySelectorAll('.flash').forEach(flash => {
    setTimeout(() => {
      flash.style.opacity = '0';
      flash.style.transition = 'opacity 0.4s ease';
      setTimeout(() => flash.remove(), 400);
    }, 5000);
  });
})();