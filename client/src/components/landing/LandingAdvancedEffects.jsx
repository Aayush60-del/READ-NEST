import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingAdvancedEffects = () => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px), (hover: none), (pointer: coarse)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      /*
        HERO LOAD REVEAL
        Non-destructive: does not change text/content.
      */
      const hero = document.querySelector("#hero");
      if (hero) {
        const heroTitle = hero.querySelector("h1");
        const heroText = hero.querySelector("p");
        const heroButtons = hero.querySelectorAll("a, button");
        const heroVisual = hero.querySelector("img")?.closest("div");

        gsap.set([heroTitle, heroText, ...heroButtons], {
          opacity: 0,
          y: 34,
        });

        if (heroVisual) {
          gsap.set(heroVisual, {
            opacity: 0,
            y: 36,
            scale: 0.96,
          });
        }

        const heroTl = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        heroTl
          .to(heroTitle, {
            opacity: 1,
            y: 0,
            duration: 0.85,
          })
          .to(
            heroText,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
            },
            "-=0.45"
          )
          .to(
            heroButtons,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
            },
            "-=0.35"
          );

        if (heroVisual) {
          heroTl.to(
            heroVisual,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
            },
            "-=0.65"
          );

          gsap.to(heroVisual, {
            y: isMobile ? -6 : -12,
            duration: 3.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      }

      /*
        GENERIC SECTION REVEAL
        Works on all landing sections, but light and controlled.
      */
      const sections = gsap.utils.toArray(".landing-page section");

      sections.forEach((section) => {
        if (!section || section.id === "hero") return;

        const heading = section.querySelector("h2");
        const smallText = section.querySelector("p");
        const cards = section.querySelectorAll("article, .card, [class*='rounded']");

        if (heading) {
          gsap.fromTo(
            heading,
            {
              opacity: 0,
              y: 34,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 78%",
                once: true,
              },
            }
          );
        }

        if (smallText) {
          gsap.fromTo(
            smallText,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: {
                trigger: smallText,
                start: "top 86%",
                once: true,
              },
            }
          );
        }

        if (cards.length) {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 28,
              scale: 0.985,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                once: true,
              },
            }
          );
        }
      });

      /*
        GENRE IMAGE PARALLAX
        Desktop only. It does not change horizontal scroll logic.
      */
      if (!isMobile) {
        const genreCards = gsap.utils.toArray("#genres article");

        genreCards.forEach((card) => {
          const image = card.querySelector("img");
          if (!image) return;

          gsap.fromTo(
            image,
            {
              scale: 1.08,
              yPercent: -4,
            },
            {
              scale: 1.14,
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "left right",
                end: "right left",
                scrub: true,
                horizontal: true,
              },
            }
          );
        });
      }

      /*
        STATS COUNT-UP
        Reads current visible number text and animates it.
      */
      const statsSection = document.querySelector("#stats");
      if (statsSection) {
        const statNumbers = Array.from(statsSection.querySelectorAll("h3, .stat-number, [data-stat-number]"))
          .filter((el) => /\d/.test(el.textContent || ""));

        statNumbers.forEach((el) => {
          const original = el.textContent.trim();
          const match = original.match(/(\d+)(.*)/);

          if (!match) return;

          const target = Number(match[1]);
          const suffix = match[2] || "";
          const counter = { value: 0 };

          gsap.to(counter, {
            value: target,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsSection,
              start: "top 72%",
              once: true,
            },
            onUpdate: () => {
              el.textContent = `${Math.round(counter.value)}${suffix}`;
            },
            onComplete: () => {
              el.textContent = original;
            },
          });
        });
      }

      /*
        MAGNETIC CTA BUTTONS
        Desktop only. Subtle SaaS hover.
      */
      if (!isMobile) {
        const magneticButtons = gsap.utils.toArray("#cta a, #cta button, #hero a, #hero button");

        magneticButtons.forEach((button) => {
          const xTo = gsap.quickTo(button, "x", {
            duration: 0.35,
            ease: "power3.out",
          });

          const yTo = gsap.quickTo(button, "y", {
            duration: 0.35,
            ease: "power3.out",
          });

          const handleMove = (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            xTo(x * 0.16);
            yTo(y * 0.22);
          };

          const handleLeave = () => {
            xTo(0);
            yTo(0);
          };

          button.addEventListener("mousemove", handleMove);
          button.addEventListener("mouseleave", handleLeave);
        });
      }

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
};

export default LandingAdvancedEffects;
