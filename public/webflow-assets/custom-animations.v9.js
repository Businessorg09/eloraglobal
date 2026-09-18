
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
     PERFECT VERSION: NO STICKY SCROLL, JUST CLEAN VERTICAL FADE
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
      // Re-add normal padding that we removed earlier
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
