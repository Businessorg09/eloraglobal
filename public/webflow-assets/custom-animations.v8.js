
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
  });

  /* ============================================================
     PROBLEM 1: 3 STEPS HORIZONTAL SCROLL (v8 FIX)
     The 3rd card wasn't scrolling far enough because negative margins broke scrollWidth.
  ============================================================ */
  const stepScrollTrack = document.querySelector('.scroll_track');
  const stepList = document.querySelector('.step_card-list');

  if (stepScrollTrack && stepList) {
    // FIX GAP: Make the scroll track height natural enough to read, but not excessive.
    stepScrollTrack.style.height = '180vh'; // 80vh of scroll distance

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
             // DO NOT rely on stepList.scrollWidth because of Webflow's negative margins!
             // Manually calculate the width of the cards.
             const cards = stepList.querySelectorAll('.step_card-stroke');
             let totalWidth = 0;
             cards.forEach(c => {
                 const style = window.getComputedStyle(c);
                 const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                 totalWidth += c.offsetWidth + margin;
             });
             // Add the gap between cards (usually around 24px per gap, 2 gaps = 48px)
             totalWidth += 60; 
             
             const scrollDistance = totalWidth - window.innerWidth;
             
             // Add extra padding so the 3rd card is perfectly visible in the center
             const extraPadding = window.innerWidth * 0.15; 
             return scrollDistance > 0 ? -(scrollDistance + extraPadding) : 0;
          },
          ease: 'none',
          duration: 0.85 // Leaves 15% of the scroll track (about 12vh) for resting
        }
      );
      
      // A small pause at the end so the 3rd card remains perfectly readable while pinned
      tl.to({}, { duration: 0.15 });
    });
  }

  /* ============================================================
     PROBLEM 2: INSIGHT CARDS SCROLL REVEAL (v8 FIX)
  ============================================================ */
  const insightScrollTrack = document.querySelector('.position_sticky-wrap');
  const insightCards = gsap.utils.toArray('.insight_card');

  if (insightScrollTrack && insightCards.length > 0) {
    
    // FIX: Set a reasonable height so the animation isn't too fast or too slow.
    // 160vh means 60vh of scrolling. This feels natural and not rushed.
    insightScrollTrack.style.height = '160vh';

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
      
      // A slightly longer resting pause to prevent the section from disappearing instantly
      tl.to({}, { duration: 0.3 });
    });
  }
