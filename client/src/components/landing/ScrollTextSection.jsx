import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollTextSection = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const words = textRef.current?.querySelectorAll(".scroll-word");

    if (!section || !words?.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      gsap.set(words, {
        color: "rgba(45, 42, 38, 0.10)",
        opacity: prefersReducedMotion || isMobile ? 1 : 0.25,
        y: prefersReducedMotion || isMobile ? 0 : 18,
      });

      if (prefersReducedMotion || isMobile) {
        gsap.set(words, {
          color: "#2d2a26",
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.to(words, {
        color: "#2d2a26",
        opacity: 1,
        y: 0,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1300",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });
    }, section);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, []);

  const text =
    "A carefully crafted sanctuary designed to eliminate digital noise, track your progress, and build lifelong reading habits.";

  return (
    <section
      ref={sectionRef}
      id="about-text"
      className="relative min-h-[70vh] overflow-hidden bg-[#f6f4ef] border-y border-slate-200 md:h-screen"
    >
      <div className="flex h-full w-full items-center px-6 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="mb-8 text-xs md:text-sm uppercase tracking-[0.38em] text-blue-700 font-black">
            (About)
          </p>

          <p
            ref={textRef}
            className="max-w-5xl text-[clamp(2.1rem,4.8vw,5rem)] font-black leading-[1.18] tracking-[-0.025em]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {text.split(" ").map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="scroll-word inline-block mr-[0.24em] will-change-transform"
              >
                {word}
              </span>
            ))}
          </p>

          <div className="mt-10 flex items-center gap-3 text-slate-500">
            <span className="h-px w-12 bg-slate-400" />
            <span className="text-xs uppercase tracking-[0.28em] font-bold">
              Scroll to reveal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollTextSection;
