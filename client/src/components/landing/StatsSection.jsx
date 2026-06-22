import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpenCheck, Flame, Rows3 } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';
import ScrollReveal from '../ScrollReveal';

const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const stats = [
  { value: 42, suffix: '+', label: 'Days Reading', accent: '#ff3b30', Icon: Flame, animation: 'pulse' },
  { value: 12, suffix: '', label: 'Books Completed', accent: 'var(--color-primary)', Icon: BookOpenCheck, animation: 'draw' },
  { value: 8000, suffix: '+', label: 'Pages Read', accent: 'var(--color-accent)', Icon: Rows3, animation: 'float' },
];

const StatsSection = () => {
  return (
    <section data-gsap-section id="stats" className="py-24 md:py-32 px-6 md:px-12 relative">
      <div className="absolute top-0 left-6 right-6 md:left-12 md:right-12 h-px bg-blue/[0.06]" />
      <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-white/[0.06]" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.12}>
              <div className="group rounded-[28px] border border-white/[0.06] bg-white/[0.025] p-6 text-center md:text-left backdrop-blur-sm">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <span className="w-9 h-9 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center" style={{ color: s.accent }}>
                    <AnimateIcon animateOnHover animateOnView animation={s.animation}>
                      <s.Icon className="h-5 w-5" />
                    </AnimateIcon>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-medium" style={{ fontFamily: 'var(--font-accent)' }}>
                    {s.label}
                  </span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="cursor-default text-5xl font-black tracking-tighter text-slate-950 md:text-6xl lg:text-7xl"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <AnimatedCounter target={s.value} suffix={s.suffix} duration={2000} />
                </motion.div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
