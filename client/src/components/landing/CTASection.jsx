import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";

const CTASection = () => {
  const scrollToFeatures = () => {
    const target = document.querySelector("#features");

    if (!target) return;

    const targetTop = Math.max(
      target.getBoundingClientRect().top + window.scrollY - 80,
      0
    );

    if (window.lenis) {
      window.lenis.scrollTo(targetTop, { duration: 1.1 });
      return;
    }

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-white px-6 py-28 text-slate-950 md:px-10 md:py-36"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute left-1/2 top-0 h-px w-px bg-blue-200 shadow-[0_0_120px_80px_rgba(37,99,235,0.08)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-6xl text-center"
      >
        <p className="mb-6 text-xs font-black uppercase tracking-[0.36em] text-[#ff3b30]">
          Ready to start?
        </p>

        <h2
          className="text-5xl md:text-8xl font-black uppercase leading-[0.92] tracking-[-0.06em]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your next
          <br />
          <span className="text-slate-400">chapter awaits.</span>
        </h2>

        <p className="mx-auto mt-8 max-w-xl text-base md:text-lg leading-relaxed text-slate-600">
          Join thousands of readers building better habits, one page at a time.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[#ff3b30] px-9 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_22px_55px_rgba(255,59,48,0.24)] transition hover:-translate-y-1 hover:bg-[#e6332a] active:translate-y-0"
          >
            <BookOpen className="h-4 w-4" />
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={scrollToFeatures}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-slate-500 transition hover:text-slate-950"
          >
            Learn more
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
