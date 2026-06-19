import { motion } from "framer-motion";
import {
  BarChart3,
  Bookmark,
  BookOpen,
  Flame,
  MonitorSmartphone,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import AnimateIcon from "@/components/animate-ui/AnimateIcon";
import ScrollReveal from "../ScrollReveal";

const benefits = [
  {
    icon: BookOpen,
    title: "Continue Reading",
    desc: "Pick up right where you left off.",
    animation: "pulse",
  },
  {
    icon: Bookmark,
    title: "Bookmarks",
    desc: "Save your favorite passages.",
    animation: "float",
  },
  {
    icon: NotebookPen,
    title: "Notes",
    desc: "Annotate and highlight text.",
    animation: "draw",
  },
  {
    icon: Flame,
    title: "Reading Streaks",
    desc: "Stay consistent with daily goals.",
    animation: "pulse",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Insights into your reading habits.",
    animation: "pulse",
  },
  {
    icon: MonitorSmartphone,
    title: "Cross Device",
    desc: "Sync progress across all devices.",
    animation: "float",
  },
];

const BenefitsSection = () => {
  return (
    <section
      id="benefits"
      className="section-padding bg-[#f6f4ef] text-slate-950"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-right mb-16">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-[#c97b6b]">
              Everything you need
            </p>

            <h2
              className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              At your fingertips.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((b, i) => (
            <ScrollReveal key={b.title} delay={0.08 + i * 0.05}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="group rounded-3xl border border-slate-200 bg-white/75 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <div className="mb-16 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-slate-700 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                  <AnimateIcon animateOnHover animateOnView animation={b.animation}>
                    <b.icon className="h-5 w-5" />
                  </AnimateIcon>
                </div>

                <h4
                  className="mb-2 text-xl font-black uppercase tracking-tight text-slate-950"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {b.title}
                </h4>

                <p className="text-base leading-relaxed text-slate-600">
                  {b.desc}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-slate-500">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-[0.24em]">
            Designed for focused reading
          </span>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

