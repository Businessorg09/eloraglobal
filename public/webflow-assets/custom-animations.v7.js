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
     PROBLEM 1 FIX: 3 STEPS HORIZONTAL SCROLL
     The cards were cut off and didn't stay visible long enough.
  ============================================================ */
  const stepScrollTrack = document.querySelector('.scroll_track');
  const stepList = document.querySelector('.step_card-list');

  if (stepScrollTrack && stepList) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stepScrollTrack,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
      
      tl.fromTo(stepList,
        { x: 0 },
        {
          x: () => {
             // Calculate exactly how much to scroll left to fully reveal the last card
             const scrollDistance = stepList.scrollWidth - window.innerWidth;
             // Add extra padding (10vw) to ensure the 3rd card is completely inside the viewport,
             // rather than touching the exact right edge.
             const extraPadding = window.innerWidth * 0.1;
             return scrollDistance > 0 ? -(scrollDistance + extraPadding) : 0;
          },
          ease: 'none',
          // Allocate 75% of the scroll track for the animation movement
          duration: 0.75
        }
      );
      
      // Allocate the remaining 25% of the scroll track for a "reading pause"
      // The section remains pinned, but the cards stop moving so the user can read them fully
      tl.to({}, { duration: 0.25 });
    });
  }

  /* ============================================================
     PROBLEM 2 FIX: INSIGHT CARDS SCROLL REVEAL
     The user had to scroll 3-4 empty gestures because the track was 200vh.
  ============================================================ */
  const insightScrollTrack = document.querySelector('.position_sticky-wrap');
  const insightCards = gsap.utils.toArray('.insight_card');

  if (insightScrollTrack && insightCards.length > 0) {
    
    // FIX PROBLEM 2: Remove the excessive empty scroll space.
    // The Webflow CSS hardcoded this wrapper to 200vh, causing 3-4 empty scroll gestures.
    // We reduce it to a much more natural 130vh (which gives enough scrub distance without feeling disconnected).
    insightScrollTrack.style.height = '130vh';

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
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
          index * 0.4
        );
      });
      
      // Add a small natural pause at the end so the cards remain fully visible 
      // before transitioning to the next section
      tl.to({}, { duration: 0.3 });
    });
  }
