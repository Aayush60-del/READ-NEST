import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const lines = [
  "A carefully crafted sanctuary",
  "for focused reading. Track progress,",
  "save notes, and build lifelong habits.",
];

const ScrollTextSection = () => {
  const sectionRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const progress = progressRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const lineEls = gsap.utils.toArray(".rn-about-line");

      gsap.set(lineEls, {
        opacity: 0.16,
        y: 32,
        filter: "blur(10px)",
        color: "rgba(45, 42, 38, 0.20)",
      });

      if (progress) {
        gsap.set(progress, {
          scaleX: 0,
          transformOrigin: "left center",
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.min(window.innerHeight * 0.95, 900)}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      if (progress) {
        tl.to(progress, { scaleX: 1, ease: "none" }, 0);
      }

      tl.to(
        lineEls,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          color: "#2d2a26",
          stagger: 0.18,
          ease: "none",
        },
        0.06
      );

      tl.fromTo(
        ".rn-about-copy",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, ease: "none" },
        0.72
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="rn-about-saas relative overflow-hidden bg-[#f6f4ef] text-[#2d2a26] border-y border-black/10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10rem] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-[-12rem] bottom-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[#c97b6b]/10 blur-3xl" />
      </div>

      <div className="rn-about-saas-inner relative z-10">
        <div className="rn-about-saas-container">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="rn-about-kicker"
          >
            <div className="rn-about-icon">
              <Sparkles className="h-5 w-5 text-[#2563eb]" />
            </div>

            <div>
              <p className="rn-about-eyebrow">Designed for focused reading</p>
              <p className="rn-about-scroll">Scroll to reveal</p>
            </div>
          </motion.div>

          <div className="rn-about-progress-wrap">
            <div ref={progressRef} className="rn-about-progress" />
          </div>

          <span className="rn-about-pill">About ReadNest</span>

          <h2 className="rn-about-title">
            {lines.map((line) => (
              <span key={line} className="rn-about-line">
                {line}
              </span>
            ))}
          </h2>

          <p className="rn-about-copy">
            Minimal interface. Smart progress tracking. A calm reading space built to help readers stay consistent without digital noise.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ScrollTextSection;

