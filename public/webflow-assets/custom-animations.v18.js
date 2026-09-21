/* ============================================================
   ELORA GLOBAL — PREMIUM ANIMATION ENGINE v18
   Author: Senior Frontend Engineer
   Strategy:
     • Always use gsap.fromTo (never gsap.to for reveals) so initial
       states are guaranteed regardless of what CSS says.
     • Kill the broken 250vh scroll_track height BEFORE any GSAP init.
     • Never rely on CSS opacity:0 set by Webflow — we own the state.
     • Section headings, hero, cards, stagger items all animate.
     • Smooth Lenis scroll is only active on desktop (≥768px).
============================================================ */

!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js";("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

/* ─────────────────────────────────────────
   STEP 1: FIX LAYOUT BEFORE ANYTHING ELSE
   The Webflow CSS sets .scroll_track { height: 250vh }
   which causes massive gaps. Kill it immediately.
───────────────────────────────────────── */
(function fixLayout() {
  const kill = ['.scroll_track', '.position_sticky-wrap'];
  kill.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.style.height = 'auto'; el.style.overflow = 'visible'; }
  });

  // Make step cards and insight cards naturally wrap
  const stepCardList = document.querySelector('.step_card-list');
  if (stepCardList) {
    stepCardList.style.flexWrap = 'wrap';
    stepCardList.style.marginRight = '0';
  }

  const insightCardList = document.querySelector('.insight_card-list');
  if (insightCardList) {
    insightCardList.style.flexWrap = 'wrap';
    insightCardList.style.marginRight = '0';
  }

  // Remove sticky positioning that pins sections in place
  const stepSection = document.querySelector('.section_step');
  if (stepSection) stepSection.style.position = 'relative';

  const insightSection = document.querySelector('.section_insight');
  if (insightSection) insightSection.style.position = 'relative';
})();


/* ─────────────────────────────────────────
   STEP 2: REGISTER GSAP PLUGINS
───────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, MotionPathPlugin, CustomEase);


/* ─────────────────────────────────────────
   STEP 3: SMOOTH SCROLL (Desktop only)
───────────────────────────────────────── */
const mm = gsap.matchMedia();

mm.add('(min-width: 768px)', () => {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
    allowNestedScroll: true,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  return () => lenis.destroy();
});


/* ─────────────────────────────────────────
   STEP 4: HERO SECTION ENTRANCE
───────────────────────────────────────── */
(function heroAnimation() {
  const heroHeading = document.querySelector('.hero_heading, .section_hero h1, .heading-style-h1');
  const heroSub     = document.querySelector('.hero_description, .hero_content > p, .text-xl');
  const heroButtons = document.querySelector('.hero_button-wrap, .button_wrap');
  const heroImage   = document.querySelector('.hero_image-wrap, .hero_img, .hero_visual');

  const heroTl = gsap.timeline({ delay: 0.15 });

  if (heroHeading) {
    heroTl.fromTo(heroHeading,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }
    );
  }
  if (heroSub) {
    heroTl.fromTo(heroSub,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    );
  }
  if (heroButtons) {
    heroTl.fromTo(heroButtons,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    );
  }
  if (heroImage) {
    heroTl.fromTo(heroImage,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
      '-=0.7'
    );
  }
})();


/* ─────────────────────────────────────────
   STEP 5: SECTION HEADING REVEALS
   Every major section heading fades up on scroll.
───────────────────────────────────────── */
(function sectionHeadings() {
  const headings = gsap.utils.toArray('.section_heading');

  headings.forEach(heading => {
    gsap.fromTo(heading,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
})();


/* ─────────────────────────────────────────
   STEP 6: STEP CARDS (Section 3)
   3 cards fade up one-by-one with stagger.
───────────────────────────────────────── */
(function stepCards() {
  const cards = gsap.utils.toArray('.step_card-stroke');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: i * 0.15,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
})();


/* ─────────────────────────────────────────
   STEP 7: INSIGHT CARDS (Section 4)
───────────────────────────────────────── */
(function insightCards() {
  const cards = gsap.utils.toArray('.insight_card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
})();


/* ─────────────────────────────────────────
   STEP 8: FEATURE TABS
───────────────────────────────────────── */
(function featureTabs() {
  const tabPanes = document.querySelectorAll('.feature_tab-pane');

  function animateTabPane(pane) {
    if (!pane) return;
    gsap.killTweensOf(pane);
    gsap.fromTo(pane,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.3, ease: 'power2.out', overwrite: true }
    );
  }

  tabPanes.forEach(pane => {
    const observer = new MutationObserver(() => {
      if (pane.classList.contains('w--tab-active')) animateTabPane(pane);
    });
    observer.observe(pane, { attributes: true, attributeFilter: ['class'] });
  });
})();


/* ─────────────────────────────────────────
   STEP 9: DATA-STAGGER ELEMENTS
   FAQ items, Blog cards, Pricing cards, Testimonials.
   Uses fromTo so it ALWAYS works regardless of CSS state.
───────────────────────────────────────── */
(function staggerElements() {
  ScrollTrigger.batch('[data-stagger="animate"] > *', {
    interval: 0.08,
    start: 'top 88%',
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, y: 50, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'power3.out',
          stagger: 0.12,
          overwrite: true,
        }
      );
    },
  });

  // Also handle card-fade-in attribute (testimonials, FAQ icon-box)
  gsap.utils.toArray('[card-fade-in]').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
})();


/* ─────────────────────────────────────────
   STEP 10: PRICING CARDS
───────────────────────────────────────── */
(function pricingCards() {
  const cards = gsap.utils.toArray('.pricing_card-plan');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
})();


/* ─────────────────────────────────────────
   STEP 11: CTA SECTION
───────────────────────────────────────── */
(function ctaSection() {
  const cta = document.querySelector('.section_cta');
  if (!cta) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: cta,
      start: 'top 80%',
      toggleActions: 'play none none none',
    }
  });

  tl.fromTo('[cta-title]',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }
  );
  tl.fromTo('[cta-description]',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
    '-=0.5'
  );
  tl.fromTo('[cta-button]',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
    '-=0.4'
  );
  tl.fromTo('[cta-glow]',
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
    0
  );
})();


/* ─────────────────────────────────────────
   STEP 12: CONNECT SECTION (Preserved from original)
───────────────────────────────────────── */
(function connectSection() {
  const connectWrapper = document.querySelector('.connect_wrapper');
  if (!connectWrapper) return;

  const circles  = ['.connect_circle-inner', '.connect_circle-third', '.connect_circle-second', '.connect_circle-icon-wrap'];
  const leftItems  = gsap.utils.toArray('.connect_marquee-wrap:not(.is-right) .connect_loop-logo');
  const rightItems = gsap.utils.toArray('.connect_marquee-wrap.is-right .connect_loop-logo');
  const centerIcon = document.querySelector('.connect_icon');
  const bg = document.querySelector('.connect_bg-img');

  // Set initial states
  gsap.set(circles, { scale: 0.7, opacity: 0 });
  gsap.set(centerIcon, { scale: 0.5, opacity: 0 });
  gsap.set([...leftItems, ...rightItems], { scale: 0.5, opacity: 0 });
  if (bg) gsap.set(bg, { scale: 1.1, opacity: 0 });

  const intro = gsap.timeline({
    scrollTrigger: { trigger: connectWrapper, start: 'top 75%', once: true }
  });

  if (bg) intro.to(bg, { opacity: 1, scale: 1, duration: 1.8, ease: 'power3.out' });
  intro
    .to('.connect_circle-inner', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, '-=1.2')
    .to('.connect_circle-third',  { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' }, '-=0.8')
    .to('.connect_circle-second', { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.7')
    .to('.connect_circle-icon-wrap', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.5')
    .to(centerIcon, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }, '-=0.4')
    .to(leftItems,  { opacity: 1, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.7)' }, '-=0.3')
    .to(rightItems, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.7)' }, '-=0.5');

  // Continuous rotations
  gsap.to('.connect_circle-inner', { rotation: 360, duration: 40, repeat: -1, ease: 'none' });
  gsap.to('.connect_circle-third', { rotation: -360, duration: 30, repeat: -1, ease: 'none' });
  gsap.to('.connect_circle-second',{ rotation: 360, duration: 22, repeat: -1, ease: 'none' });

  // Center logo breathing
  if (centerIcon) {
    gsap.to(centerIcon, { scale: 1.06, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  // Icon floats
  leftItems.forEach((item, i) => {
    gsap.to(item, { y: i % 2 === 0 ? -8 : 8, duration: 2.5 + i * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
  rightItems.forEach((item, i) => {
    gsap.to(item, { y: i % 2 === 0 ? 8 : -8, duration: 2.8 + i * 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });

  // Hover effects
  [...leftItems, ...rightItems].forEach(item => {
    item.addEventListener('mouseenter', () => gsap.to(item, { scale: 1.12, duration: 0.35, ease: 'power2.out' }));
    item.addEventListener('mouseleave', () => gsap.to(item, { scale: 1, duration: 0.4, ease: 'power2.out' }));
  });

  // Scroll parallax
  gsap.to(connectWrapper, {
    y: -40,
    ease: 'none',
    scrollTrigger: { trigger: connectWrapper, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
  });
})();


/* ─────────────────────────────────────────
   STEP 13: CLIENT CARD FLIP (Testimonials)
───────────────────────────────────────── */
(function clientCardFlip() {
  gsap.utils.toArray('.client_card').forEach(card => {
    gsap.set(card, { transformStyle: 'preserve-3d', transformPerspective: 1000 });

    const q     = gsap.utils.selector(card);
    const front = q('.client_card-front');
    const back  = q('.client_card-back');

    gsap.set(back, { rotationY: -180 });

    const tl = gsap.timeline({ paused: true });
    tl.to(front, { duration: 1, rotationY: 180, ease: 'power2.inOut' })
      .to(back,  { duration: 1, rotationY: 0,   ease: 'power2.inOut' }, 0)
      .to(card,  { z: 10 }, 0)
      .to(card,  { z: 0  }, 0.5);

    card.addEventListener('mouseenter', () => tl.play());
    card.addEventListener('mouseleave', () => tl.reverse());
  });
})();


/* ─────────────────────────────────────────
   STEP 14: SLIDE-UP ELEMENTS (footer, etc.)
───────────────────────────────────────── */
(function slideUpElements() {
  gsap.utils.toArray('[slide-up-1]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  gsap.utils.toArray('[slide-up-tablet]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      }
    );
  });
})();
