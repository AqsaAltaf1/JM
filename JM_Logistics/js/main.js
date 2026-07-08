/**
 * JM Logistics Group LLC — Main JavaScript
 * Hero entrance, scroll animations, micro-interactions
 */

(function () {
  'use strict';

  const HERO_SESSION_KEY = 'jm_hero_played';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── DOM References ─── */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const hero = document.getElementById('hero');
  const heroImagePanel = document.getElementById('heroImagePanel');
  const heroContent = document.getElementById('heroContent');
  /* ─── Navbar Scroll ─── */
  function handleNavbarScroll() {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ─── Mobile Nav Toggle ─── */
  function closeMobileNav() {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
  });

  /* ─── Active Nav Link ─── */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link[href^="#"]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ─── Hero Entrance Animation ─── */
  function playHeroEntrance() {
    const alreadyPlayed = sessionStorage.getItem(HERO_SESSION_KEY);

    if (alreadyPlayed || prefersReducedMotion) {
      hero.classList.add('hero--skip', 'arcs-drawn', 'geo-revealed', 'image-settled');
      if (heroImagePanel) heroImagePanel.classList.add('revealed');
      revealHeroContent();
      return;
    }

    // Phase 1: Image slides in from right
    setTimeout(() => {
      if (heroImagePanel) heroImagePanel.classList.add('revealed');
      hero.classList.add('geo-revealed');
    }, 300);

    // Phase 2: Decorative arcs draw in
    setTimeout(() => {
      hero.classList.add('arcs-drawn');
    }, 500);

    // Phase 3: Copy staggers in
    setTimeout(() => {
      revealHeroContent();
    }, 700);

    // Phase 4: Ken-burns settle on image
    setTimeout(() => {
      hero.classList.add('image-settled');
      sessionStorage.setItem(HERO_SESSION_KEY, 'true');
    }, 2000);
  }

  function revealHeroContent() {
    heroContent.querySelectorAll('.reveal-item').forEach((el) => {
      el.classList.add('revealed');
    });
  }

  playHeroEntrance();

  /* ─── Scroll Animations — whole page ─── */
  const scrollObserverOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
  };

  function revealElement(el) {
    const delay = parseInt(el.dataset.delay || '0', 10);

    setTimeout(() => {
      el.classList.add('visible');

      if (el.classList.contains('check-item')) {
        el.classList.add('animated');
      }

      const iconDraw = el.querySelector('.icon-draw');
      if (iconDraw) iconDraw.classList.add('animated');
    }, delay);
  }

  // Fade / slide elements
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealElement(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, scrollObserverOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    revealObserver.observe(el);
  });

  // Stagger child elements
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const baseDelay = parseInt(el.dataset.delay || '0', 10);
      const children = el.querySelectorAll(':scope > *');

      children.forEach((child, i) => {
        child.style.transitionDelay = `${baseDelay + i * 70}ms`;
      });

      setTimeout(() => {
        el.classList.add('visible');
        el.querySelectorAll('.icon-draw').forEach((icon) => icon.classList.add('animated'));
      }, baseDelay);

      staggerObserver.unobserve(el);
    });
  }, scrollObserverOptions);

  document.querySelectorAll('.reveal-stagger').forEach((el) => {
    staggerObserver.observe(el);
  });

  // Section headers — staggered title / subtitle
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animated');
      headerObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate="header"]').forEach((el) => {
    headerObserver.observe(el);
  });

  // Whole sections fade in
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('scroll-visible');
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.section, .footer').forEach((el) => {
    sectionObserver.observe(el);
  });

  // If reduced motion — show everything immediately
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-stagger').forEach((el) => {
      el.classList.add('visible');
    });
    document.querySelectorAll('[data-animate="header"]').forEach((el) => {
      el.classList.add('animated');
    });
    document.querySelectorAll('.section, .footer').forEach((el) => {
      el.classList.add('scroll-visible');
    });
  }

  /* ─── Counter Animation ─── */
  function animateCounter(el, target, suffix = '') {
    const duration = 2000;
    const start = performance.now();
    const isDecimal = String(target).includes('.');

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? (target * eased).toFixed(1)
        : Math.floor(target * eased);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => {
    counterObserver.observe(el);
  });

  /* ─── Route Map Path Draw ─── */
  const routePath = document.getElementById('routePath');
  if (routePath) {
    const routeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            routePath.classList.add('animated');
            routeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    routeObserver.observe(routePath.closest('.route-map'));
  }

  /* ─── Process timeline animation ─── */
  const processTrack = document.querySelector('.process-track');
  if (processTrack) {
    const processObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const fill = document.getElementById('processLineFill');
          const truck = document.getElementById('timelineTruck');

          if (fill) fill.classList.add('animated');
          if (truck) {
            setTimeout(() => truck.classList.add('animated'), 100);
          }

          processObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    processObserver.observe(processTrack);
  }

  /* ─── FAQ Accordion ─── */
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach((openItem) => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ─── Smooth anchor scroll offset for fixed navbar ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ─── Services Carousel ─── */
  const servicesCarousel = document.getElementById('servicesCarousel');
  const servicesTrack = document.getElementById('servicesTrack');
  const servicesPrev = document.getElementById('servicesPrev');
  const servicesNext = document.getElementById('servicesNext');
  const servicesDots = document.getElementById('servicesDots');

  if (servicesCarousel && servicesTrack && servicesPrev && servicesNext) {
    const cards = servicesTrack.querySelectorAll('.service-card');
    let currentPage = 0;
    let dotButtons = [];

    function getCardsPerPage() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getTotalPages() {
      return Math.max(1, Math.ceil(cards.length / getCardsPerPage()));
    }

    function buildDots() {
      if (!servicesDots) return;

      const totalPages = getTotalPages();
      servicesDots.innerHTML = '';
      dotButtons = [];

      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'services-dot' + (i === currentPage ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to service page ${i + 1}`);
        dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
        dot.addEventListener('click', () => {
          currentPage = i;
          updateServicesCarousel();
        });
        servicesDots.appendChild(dot);
        dotButtons.push(dot);
      }
    }

    function updateServicesCarousel() {
      const perPage = getCardsPerPage();
      const totalPages = getTotalPages();
      currentPage = Math.min(currentPage, totalPages - 1);

      const gap = parseFloat(getComputedStyle(servicesTrack).gap) || 24;
      const cardWidth = cards[0].offsetWidth;
      const offset = currentPage * perPage * (cardWidth + gap);

      servicesTrack.style.transform = `translateX(-${offset}px)`;
      servicesPrev.disabled = currentPage === 0;
      servicesNext.disabled = currentPage >= totalPages - 1;

      if (dotButtons.length !== totalPages) {
        buildDots();
      } else {
        dotButtons.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentPage);
          dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
        });
      }
    }

    servicesPrev.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        updateServicesCarousel();
      }
    });

    servicesNext.addEventListener('click', () => {
      if (currentPage < getTotalPages() - 1) {
        currentPage++;
        updateServicesCarousel();
      }
    });

    window.addEventListener('resize', () => {
      buildDots();
      updateServicesCarousel();
    });

    buildDots();
    updateServicesCarousel();
  }

})();