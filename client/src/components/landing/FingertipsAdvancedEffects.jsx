import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FingertipsAdvancedEffects = () => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px), (hover: none), (pointer: coarse)").matches;

    if (prefersReducedMotion) return;

    const cleanups = [];

    const ctx = gsap.context(() => {
      const sections = Array.from(document.querySelectorAll(".landing-page section, section"));
      const section = sections.find((item) =>
        item.textContent?.toLowerCase().includes("at your fingertips")
      );

      if (!section) return;

      section.classList.add("rn-fingertips-section");

      const label = Array.from(section.querySelectorAll("p, span, div")).find((el) =>
        el.textContent?.trim().toLowerCase() === "everything you need"
      );

      const heading = Array.from(section.querySelectorAll("h1, h2")).find((el) =>
        el.textContent?.toLowerCase().includes("at your fingertips")
      );

      const cards = Array.from(section.querySelectorAll("article, .card, div")).filter((el) => {
        const text = el.textContent || "";
        const hasFeatureTitle =
          text.includes("CONTINUE READING") ||
          text.includes("BOOKMARKS") ||
          text.includes("NOTES") ||
          text.includes("READING STREAKS") ||
          text.includes("ANALYTICS") ||
          text.includes("CROSS DEVICE");

        const rect = el.getBoundingClientRect();
        return hasFeatureTitle && rect.width > 180 && rect.height > 120;
      });

      const uniqueCards = [];
      cards.forEach((card) => {
        if (!uniqueCards.some((existing) => existing.contains(card) || card.contains(existing))) {
          uniqueCards.push(card);
        }
      });

      uniqueCards.forEach((card) => card.classList.add("rn-fingertips-card"));

      const icons = uniqueCards
        .map((card) => card.querySelector("svg, img, [class*='icon']"))
        .filter(Boolean);

      const bottomCaption = Array.from(section.querySelectorAll("p, span, div")).find((el) =>
        el.textContent?.toLowerCase().includes("designed for focused reading")
      );

      if (label) {
        gsap.fromTo(
          label,
          {
            opacity: 0,
            y: -14,
            letterSpacing: "0.36em",
          },
          {
            opacity: 1,
            y: 0,
            letterSpacing: "0.28em",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true,
            },
          }
        );
      }

      if (heading) {
        gsap.fromTo(
          heading,
          {
            opacity: 0,
            y: 58,
            clipPath: "inset(0 0 100% 0)",
          },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 68%",
              once: true,
            },
          }
        );
      }

      if (uniqueCards.length) {
        gsap.fromTo(
          uniqueCards,
          {
            opacity: 0,
            y: 70,
            scale: 0.94,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: {
              each: 0.08,
              from: "start",
            },
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 58%",
              once: true,
            },
          }
        );
      }

      if (icons.length) {
        gsap.fromTo(
          icons,
          {
            opacity: 0,
            scale: 0.7,
            rotate: -10,
          },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.75,
            stagger: 0.06,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: section,
              start: "top 56%",
              once: true,
            },
          }
        );
      }

      if (bottomCaption) {
        gsap.fromTo(
          bottomCaption,
          {
            opacity: 0,
            y: 18,
            letterSpacing: "0.22em",
          },
          {
            opacity: 1,
            y: 0,
            letterSpacing: "0.34em",
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bottomCaption,
              start: "top 90%",
              once: true,
            },
          }
        );
      }

      if (!isMobile) {
        uniqueCards.forEach((card) => {
          const icon = card.querySelector("svg, img, [class*='icon']");

          gsap.set(card, {
            transformPerspective: 900,
            transformOrigin: "center center",
          });

          const xTo = gsap.quickTo(card, "rotateY", {
            duration: 0.45,
            ease: "power3.out",
          });

          const yTo = gsap.quickTo(card, "rotateX", {
            duration: 0.45,
            ease: "power3.out",
          });

          const liftTo = gsap.quickTo(card, "y", {
            duration: 0.35,
            ease: "power3.out",
          });

          const scaleTo = gsap.quickTo(card, "scale", {
            duration: 0.35,
            ease: "power3.out",
          });

          const handleMove = (event) => {
            const rect = card.getBoundingClientRect();
            const relX = event.clientX - rect.left;
            const relY = event.clientY - rect.top;
            const rotateY = ((relX / rect.width) - 0.5) * 8;
            const rotateX = -((relY / rect.height) - 0.5) * 8;

            card.style.setProperty("--rn-glow-x", `${relX}px`);
            card.style.setProperty("--rn-glow-y", `${relY}px`);

            xTo(rotateY);
            yTo(rotateX);
            liftTo(-10);
            scaleTo(1.015);

            if (icon) {
              gsap.to(icon, {
                scale: 1.08,
                rotate: rotateY > 0 ? 4 : -4,
                duration: 0.35,
                ease: "power3.out",
              });
            }
          };

          const handleLeave = () => {
            xTo(0);
            yTo(0);
            liftTo(0);
            scaleTo(1);

            if (icon) {
              gsap.to(icon, {
                scale: 1,
                rotate: 0,
                duration: 0.35,
                ease: "power3.out",
              });
            }
          };

          card.addEventListener("mousemove", handleMove);
          card.addEventListener("mouseleave", handleLeave);

          cleanups.push(() => {
            card.removeEventListener("mousemove", handleMove);
            card.removeEventListener("mouseleave", handleLeave);
          });
        });
      }

      ScrollTrigger.refresh();
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return null;
};

export default FingertipsAdvancedEffects;
