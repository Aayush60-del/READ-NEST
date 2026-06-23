import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const aboutText =
  "A carefully crafted sanctuary designed to eliminate digital noise, track your progress, and build lifelong reading habits.";

const ScrollTextSection = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const progressRef = useRef(null);

  const words = useMemo(() => aboutText.split(" "), []);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const progress = progressRef.current;

    if (!section || !text) return;

    const ctx = gsap.context(() => {
      const wordEls = gsap.utils.toArray(".rn-about-word");

      gsap.set(wordEls, {
        opacity: 0.18,
        y: 28,
        filter: "blur(10px)",
        color: "rgba(45, 42, 38, 0.22)",
      });

      gsap.set(progress, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.15,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        progress,
        {
          scaleX: 1,
          ease: "none",
        },
        0
      );

      tl.to(
        wordEls,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          color: "#2d2a26",
          stagger: 0.055,
          ease: "none",
        },
        0.05
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[175vh] sm:h-[185vh] bg-[#f6f4ef] text-[#2d2a26] border-y border-black/10"
    >
      <div className="sticky top-0 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c97b6b]/10 blur-3xl" />
          <div className="absolute right-[-120px] top-[18%] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-[-120px] bottom-[14%] h-[260px] w-[260px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 sm:mb-14 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-white border border-black/10 shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#2563eb]" />
              </div>

              <div>
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.38em] text-[#2563eb]">
                  Designed for focused reading
                </p>
                <p className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-black/35">
                  Scroll to reveal
                </p>
              </div>
            </motion.div>

            <div className="mb-8 sm:mb-10 h-px w-full bg-black/10 overflow-hidden">
              <div
                ref={progressRef}
                className="h-full w-full bg-[#c97b6b]"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.32em] text-black/55 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
                About ReadNest
              </span>
            </div>

            <h2
              ref={textRef}
              className="max-w-6xl text-[3.05rem] sm:text-[5.4rem] lg:text-[7.4rem] font-black leading-[0.92] tracking-[-0.075em]"
            >
              {words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="rn-about-word inline-block mr-[0.18em]"
                >
                  {word}
                </span>
              ))}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-2xl text-base sm:text-xl leading-relaxed text-black/45"
            >
              Minimal interface. Strong habit tracking. A calm reading space that feels premium on every device.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollTextSection;
