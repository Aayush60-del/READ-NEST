import { useEffect } from "react";

const MobileLandingMotion = () => {
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    if (!media.matches) return;

    const root = document.querySelector(".landing-page");
    if (!root) return;

    const targets = Array.from(
      root.querySelectorAll(
        [
          "section",
          "section h1",
          "section h2",
          "section p",
          "section a",
          "section button",
          "section img",
          "section [class*='rounded']",
          "section [class*='card']"
        ].join(",")
      )
    ).filter((el) => !el.closest("nav"));

    targets.forEach((el, index) => {
      el.setAttribute("data-mobile-motion", "true");
      el.style.setProperty("--rn-mobile-delay", `${Math.min((index % 7) * 65, 390)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rn-mobile-motion-in");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));

    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        root.style.setProperty("--rn-mobile-scroll", `${Math.sin(y / 280) * 8}px`);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
};

export default MobileLandingMotion;
