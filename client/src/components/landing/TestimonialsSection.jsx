import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import AnimateIcon from "@/components/animate-ui/AnimateIcon";
import ScrollReveal from "../ScrollReveal";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "CTO of Arjuna",
    quote:
      "ReadNest helped me build a daily reading habit. The streak feature keeps me motivated and I have finished more books this month than all of last year.",
  },
  {
    name: "Alex Chen",
    role: "Marketing Lead at Bima",
    quote:
      "The distraction-free reader is exactly what I needed. No clutter, no ads — just me and the book. The dark mode is chef's kiss.",
  },
  {
    name: "Maria Santos",
    role: "Founder at Batavia",
    quote:
      "I love how my notes and bookmarks sync everywhere. Switching between my phone and laptop feels seamless. Best reading app I have used.",
  },
];

const TestimonialsSection = () => {
  return (
    <section data-gsap-section
      id="testimonials"
      className="section-padding bg-[#f7f3ea] text-slate-950"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal delay={0.1}>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-600 mb-4">
            Reader love
          </p>

          <h2
            className="text-4xl md:text-6xl font-black tracking-tight mb-14 max-w-2xl uppercase text-slate-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            What they say.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={0.15 + i * 0.1}>
              <motion.div
                whileHover={{
                  y: -7,
                  borderColor: "rgba(15, 23, 42, 0.22)",
                  boxShadow: "0 26px 80px rgba(15, 23, 42, 0.12)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="rounded-3xl border border-slate-900/10 bg-white/75 p-7 h-full flex flex-col group shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center overflow-hidden shadow-lg shadow-slate-950/15">
                    <AnimateIcon animateOnHover animateOnView animation="pulse">
                      <UserRound className="h-5 w-5 text-white" />
                    </AnimateIcon>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {t.name}
                    </p>
                    <p className="text-lg font-semibold text-slate-600 group-hover:text-orange-600 transition-colors">
                      {t.role}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <span
                    className="text-4xl font-black text-orange-600 leading-none block mb-4"
                    style={{ fontFamily: "serif" }}
                  >
                    "
                  </span>

                  <p className="text-[15px] text-slate-700 leading-[1.75] font-medium">
                    {t.quote}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


