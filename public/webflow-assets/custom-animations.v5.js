
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

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const connectSection = document.querySelector('.section_inner-hero');

    if (connectSection) {
      gsap.to('.hero_line', {
        yPercent: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section_inner-hero',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('.inner_hero-bg-line-wrap', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section_inner-hero',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    const cards = gsap.utils.toArray('.step_card-stroke');
    if (cards.length > 0) {
      cards.forEach((card) => {
        const arrow = card.querySelector('.arrow_wrap');

        const tl = gsap.timeline({ paused: true });

        tl.to(
          arrow,
          {
            x: '5px',
            y: '-5px',
            duration: 0.3,
            ease: 'power2.out',
          },
          0,
        );

        card.addEventListener('mouseenter', () => tl.play());
        card.addEventListener('mouseleave', () => tl.reverse());
      });
    }

  });

  /* ============================================================
     3 STEPS HORIZONTAL SCROLL (CUSTOM GSAP RESTORED!)
  ============================================================ */
  const stepScrollTrack = document.querySelector('.scroll_track');
  const stepList = document.querySelector('.step_card-list');

  if (stepScrollTrack && stepList) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      gsap.fromTo(stepList,
        { x: 0 },
        {
          x: () => {
             const scrollDistance = stepList.scrollWidth - window.innerWidth;
             return scrollDistance > 0 ? -(scrollDistance + 100) : 0;
          },
          ease: 'none',
          scrollTrigger: {
            trigger: stepScrollTrack,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );
    });
  }

  /* ============================================================
     INSIGHT CARDS SCROLL REVEAL (CUSTOM GSAP RESTORED!)
  ============================================================ */
  const insightScrollTrack = document.querySelector('.position_sticky-wrap');
  const insightCards = gsap.utils.toArray('.insight_card');

  if (insightScrollTrack && insightCards.length > 0) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: insightScrollTrack,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
      
      insightCards.forEach((card, index) => {
        tl.fromTo(card, 
          { opacity: 0.1, y: 80, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power1.out' },
          index * 0.5
        );
      });
    });
  }
