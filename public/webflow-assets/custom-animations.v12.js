!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

gsap.registerPlugin(Flip,ScrollTrigger,SplitText,MotionPathPlugin,CustomEase);


  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', () => {
    const lenis = new Lenis({
      duration: 1,
      smoothWheel: true,
      smoothTouch: false,
      allowNestedScroll: true,

      easing: (t) => {
        return 1 - Math.pow(1 - t, 3);
      },
    });

    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  });



  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  /* ============================================================
     FEATURE TABS
  ============================================================ */

  const tabPanes = document.querySelectorAll('.feature_tab-pane');

  function animateTabPane(pane) {
    if (!pane) return;

    gsap.killTweensOf(pane);

    gsap.fromTo(
      pane,

      {
        y: 30,
        opacity: 0,
      },

      {
        y: 0,
        opacity: 1,
        duration: 1.3,
        ease: 'power2.out',
        overwrite: true,
      },
    );
  }

  tabPanes.forEach((pane) => {
    const observer = new MutationObserver(() => {
      if (pane.classList.contains('w--tab-active')) {
        animateTabPane(pane);
      }
    });

    observer.observe(pane, {
      attributes: true,
      attributeFilter: ['class'],
    });
  });

  /* ============================================================
     CONNECT SECTION
  ============================================================ */

  const connectSection = document.querySelector('.connect_wrapper');

  if (connectSection) {
    const circles = ['.connect_circle-inner', '.connect_circle-third', '.connect_circle-second', '.connect_circle-icon-wrap'];

    const leftItems = gsap.utils.toArray('.connect_marquee-wrap:not(.is-right) .connect_loop-logo');

    const rightItems = gsap.utils.toArray('.connect_marquee-wrap.is-right .connect_loop-logo');

    const centerIcon = document.querySelector('.connect_icon');

    const bg = document.querySelector('.connect_bg-img');

    /* --------------------------------
       INITIAL STATE
    -------------------------------- */

    gsap.set(circles, {
      scale: 0.7,
      opacity: 0,
    });

    gsap.set(centerIcon, {
      scale: 0.5,
      opacity: 0,
    });

    gsap.set([...leftItems, ...rightItems], {
      scale: 0.5,
      opacity: 0,
    });

    gsap.set(bg, {
      scale: 1.1,
      opacity: 0,
    });

    /* --------------------------------
       INTRO TIMELINE
    -------------------------------- */

    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: connectSection,
        start: 'top 75%',
        once: true,
      },
    });

    intro

      /* Background */

      .to(bg, {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: 'power3.out',
      })

      /* Outer Circle */

      .to(
        '.connect_circle-inner',

        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
        },

        '-=1.2',
      )

      /* Third Circle */

      .to(
        '.connect_circle-third',

        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
        },

        '-=0.8',
      )

      /* Second Circle */

      .to(
        '.connect_circle-second',

        {
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
        },

        '-=0.7',
      )

      /* Icon Wrapper */

      .to(
        '.connect_circle-icon-wrap',

        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
        },

        '-=0.5',
      )

      /* Center Logo */

      .to(
        centerIcon,

        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'back.out(1.8)',
        },

        '-=0.4',
      )

      /* Left Icons */

      .to(
        leftItems,

        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'back.out(1.7)',
        },

        '-=0.3',
      )

      /* Right Icons */

      .to(
        rightItems,

        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'back.out(1.7)',
        },

        '-=0.5',
      );

    /* --------------------------------
       CIRCLE ROTATIONS
    -------------------------------- */

    gsap.to('.connect_circle-inner', {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: 'none',
    });

    gsap.to('.connect_circle-third', {
      rotation: -360,
      duration: 30,
      repeat: -1,
      ease: 'none',
    });

    gsap.to('.connect_circle-second', {
      rotation: 360,
      duration: 22,
      repeat: -1,
      ease: 'none',
    });

    /* --------------------------------
       CENTER LOGO BREATHING
    -------------------------------- */

    gsap.to(
      centerIcon,

      {
        scale: 1.06,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      },
    );

    /* --------------------------------
       LEFT ICON FLOAT
    -------------------------------- */

    leftItems.forEach((item, index) => {
      gsap.to(item, {
        y: index % 2 === 0 ? -8 : 8,

        duration: 2.5 + index * 0.4,

        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    /* --------------------------------
       RIGHT ICON FLOAT
    -------------------------------- */

    rightItems.forEach((item, index) => {
      gsap.to(item, {
        y: index % 2 === 0 ? 8 : -8,

        duration: 2.8 + index * 0.35,

        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    /* --------------------------------
       BACKGROUND BREATHING
    -------------------------------- */

    gsap.to(
      bg,

      {
        scale: 1.05,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      },
    );

    /* --------------------------------
       ICON HOVER
    -------------------------------- */

    [...leftItems, ...rightItems].forEach((item) => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          scale: 1.12,
          duration: 0.35,
          ease: 'power2.out',
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
    });

    /* --------------------------------
       SCROLL PARALLAX
    -------------------------------- */

    gsap.to(
      connectSection,

      {
        y: -40,
        ease: 'none',

        scrollTrigger: {
          trigger: connectSection,

          start: 'top bottom',
          end: 'bottom top',

          scrub: 1.5,
        },
      },
    );
  }

  /* ============================================================
     CARD STAGGER
  ============================================================ */

  ScrollTrigger.batch('[data-stagger="animate"] > *', {
    interval: 0.08,

    start: 'top 90%',

    onEnter: (batch) => {
      gsap.fromTo(batch, 
        { y: 40, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.3,
          ease: 'power3.out',
          stagger: 0.3,
          overwrite: true,
        }
      );
    },
  });

  /* ============================================================
     CLIENT CARD FLIP
  ============================================================ */

  gsap.utils.toArray('.client_card').forEach((card) => {
    gsap.set(card, {
      transformStyle: 'preserve-3d',

      transformPerspective: 1000,
    });

    const q = gsap.utils.selector(card);

    const front = q('.client_card-front');

    const back = q('.client_card-back');

    gsap.set(back, {
      rotationY: -180,
    });

    const tl = gsap.timeline({
      paused: true,
    });

    tl.to(front, {
      duration: 1,

      rotationY: 180,

      ease: 'power2.inOut',
    })

      .to(
        back,

        {
          duration: 1,

          rotationY: 0,

          ease: 'power2.inOut',
        },

        0,
      )

      .to(
        card,

        {
          z: 10,
        },

        0,
      )

      .to(
        card,

        {
          z: 0,
        },

        0.5,
      );

    card.addEventListener('mouseenter', () => {
      tl.play();
    });

    card.addEventListener('mouseleave', () => {
      tl.reverse();
    });
  });

 


  /* ============================================================
     PERFECT VERSION OVERRIDES: NO STICKY SCROLL, JUST CLEAN VERTICAL FADE
     This fixes the broken Webflow native animations for these sections.
  ============================================================ */

  // 1. Remove massive CSS scroll tracks so there are NO GAPS
  const stepScrollTrack = document.querySelector('.scroll_track');
  if (stepScrollTrack) stepScrollTrack.style.height = 'auto';
  
  const insightScrollTrack = document.querySelector('.position_sticky-wrap');
  if (insightScrollTrack) insightScrollTrack.style.height = 'auto';

  // 2. Remove sticky position so everything scrolls normally
  const stepSection = document.querySelector('.section_step');
  if (stepSection) stepSection.style.position = 'relative';
  
  const insightSection = document.querySelector('.section_insight');
  if (insightSection) {
      insightSection.style.position = 'relative';
      insightSection.style.paddingTop = '8.75rem';
  }

  // 3. Simple, beautiful fade-in animations for Steps
  const stepCards = gsap.utils.toArray('.step_card-stroke');
  if (stepCards.length > 0) {
    stepCards.forEach((card, i) => {
      gsap.fromTo(card, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  // 4. Simple, beautiful fade-in animations for Insights
  const insightCards = gsap.utils.toArray('.insight_card');
  if (insightCards.length > 0) {
    insightCards.forEach((card, i) => {
      gsap.fromTo(card, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }
