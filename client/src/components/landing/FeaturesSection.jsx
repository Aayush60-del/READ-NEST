import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, BookOpenText, LibraryBig, TrendingUp } from "lucide-react";
import AnimateIcon from "@/components/animate-ui/AnimateIcon";
import ScrollReveal from "../ScrollReveal";

const features = [
  {
    Icon: BookOpenText,
    animation: "draw",
    title: "Immersive Reader",
    description:
      "Read in a clean, focused space with distraction-free controls, dark mode, bookmarks, notes, and smooth progress saving.",
    number: "01",
  },
  {
    Icon: TrendingUp,
    animation: "pulse",
    title: "Reading Progress",
    description:
      "Track pages, books, streaks, completion rate, and daily consistency with meaningful reading insights.",
    number: "02",
  },
  {
    Icon: LibraryBig,
    animation: "float",
    title: "Smart Library",
    description:
      "Organize your collection with smart shelves, tags, and recommendations tailored to your taste.",
    number: "03",
  },
];

const FeaturesSection = () => {
  const [hovered, setHovered] = useState(2);

  return (
    <section data-gsap-section id="features" className="section-padding bg-white text-black">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal delay={0.1}>
          <div className="mb-24">
            <p
              className="text-xs font-black uppercase tracking-[0.35em] text-blue-600 mb-5"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              (What we offer)
            </p>

            <h2
              className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.95]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Built for readers,
              <br />
              <span className="text-slate-400">by readers.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div data-gsap-stagger className="divide-y divide-slate-200 border-y border-slate-200">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={0.1 + i * 0.08}>
              <motion.div data-gsap-item
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group cursor-default"
              >
                <div className="grid grid-cols-12 items-center gap-4 py-8 md:py-10">
                  <div className="col-span-1">
                    <span className="text-xs font-mono text-slate-500">
                      {f.number}
                    </span>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        hovered === i
                          ? "bg-blue-100 text-blue-700"
                          : "bg-blue-50 text-slate-900"
                      }`}
                    >
                      <AnimateIcon
                        animate={hovered === i}
                        animateOnView
                        animation={f.animation}
                      >
                        <f.Icon className="h-5 w-5" />
                      </AnimateIcon>
                    </div>
                  </div>

                  <div className="col-span-7 md:col-span-8">
                    <h3
                      className={`text-xl md:text-3xl font-black uppercase tracking-tight transition-colors ${
                        hovered === i ? "text-blue-700" : "text-black"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {f.title}
                    </h3>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <AnimateIcon animate={hovered === i} animation="turn">
                      <ArrowRight
                        className={`h-5 w-5 transition-colors ${
                          hovered === i ? "text-black" : "text-slate-400"
                        }`}
                      />
                    </AnimateIcon>
                  </div>
                </div>

                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pl-[calc(8.33%+16.66%+1rem)] md:pl-[calc(8.33%+8.33%+1rem)]">
                        <p className="max-w-xl text-sm md:text-base text-slate-500 leading-relaxed">
                          {f.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;







