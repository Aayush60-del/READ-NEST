import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingGsapEffects = () => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-gsap-section]").forEach((section) => {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 70,
            scale: 0.985,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
            },
          }
        );
      });

      gsap.utils.toArray("[data-gsap-parallax]").forEach((el) => {
        const speed = Number(el.dataset.speed || 60);

        gsap.to(el, {
          y: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });

      gsap.utils.toArray("[data-gsap-glow]").forEach((glow, index) => {
        gsap.to(glow, {
          x: index % 2 === 0 ? 60 : -60,
          y: index % 2 === 0 ? -35 : 35,
          scale: 1.08,
          duration: 5 + index,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      const heroWords = document.querySelectorAll("[data-hero-word]");

      if (heroWords.length) {
        gsap.fromTo(
          heroWords,
          {
            opacity: 0,
            y: 80,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power4.out",
            stagger: 0.08,
            delay: 0.15,
          }
        );
      }

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
};

export default LandingGsapEffects;

