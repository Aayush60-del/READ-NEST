import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpenCheck, Rows3, Users } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';
import ScrollReveal from '../ScrollReveal';

const AnimatedCounter = ({ target, loading = false, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView || loading) return;
    const numericTarget = Math.max(0, Number(target) || 0);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericTarget));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(numericTarget);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration, loading]);

  return <span ref={ref}>{loading ? '-' : count.toLocaleString()}</span>;
};

const getStats = (stats) => {
  const safeStats = stats || {};

  return [
    { value: safeStats.totalUsers || 0, label: 'Readers', accent: '#ff3b30', Icon: Users, animation: 'pulse' },
    { value: safeStats.publishedBooks || safeStats.totalBooks || 0, label: 'Books Available', accent: 'var(--color-primary)', Icon: BookOpenCheck, animation: 'draw' },
    { value: safeStats.totalPagesRead || 0, label: 'Pages Read', accent: 'var(--color-accent)', Icon: Rows3, animation: 'float' },
  ];
};

const StatsSection = ({ stats, loading = false }) => {
  const liveStats = getStats(stats);

  return (
    <section data-gsap-section id="stats" className="py-24 md:py-32 px-6 md:px-12 relative">
      <div className="absolute top-0 left-6 right-6 md:left-12 md:right-12 h-px bg-blue/[0.06]" />
      <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 h-px bg-white/[0.06]" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {liveStats.map((s, i) => (
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
                  <AnimatedCounter target={s.value} loading={loading} duration={2000} />
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
