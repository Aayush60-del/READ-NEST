import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, BookOpenCheck } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

const FooterSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const textX = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

  return (
    <footer ref={sectionRef} className="border-t border-white/5 bg-[#060608]">
      <div
        className="overflow-hidden py-12 md:py-20 cursor-pointer relative"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <motion.div style={{ x: textX }}>
          <h2 className="giant-text text-center text-white/[0.03] hover:text-white/[0.08] transition-colors duration-700 select-none uppercase">
            READNEST
          </h2>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AnimateIcon animateOnView animation="draw">
                <BookOpenCheck className="h-7 w-7 text-[var(--color-primary)]" />
              </AnimateIcon>
              <span className="font-black text-2xl text-white uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>ReadNest</span>
            </div>
            <p className="text-xl text-[var(--color-text-muted)] hover:text-white" style={{ fontFamily: 'var(--font-accent)' }}>
              Your distraction-free reading space.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 border-t border-white/[0.04]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-[15px] text-[var(--color-text-muted)] tracking-wide hover:text-white" style={{ fontFamily: 'var(--font-accent)' }}>
            (c) 2026 ReadNest. All rights reserved.
          </span>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {['Features', 'Library', 'Reader', 'Pricing'].map((item) => (
              <a key={item} href="#" className="text-[11px] text-[var(--color-text-muted)] hover:text-white transition-colors uppercase tracking-widest" style={{ fontFamily: 'var(--font-accent)' }}>
                {item}
              </a>
            ))}
          </div>

          <div className="flex gap-6">
            {[
              { label: 'GitHub', href: 'https://github.com' },
              { label: 'Twitter', href: 'https://twitter.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[var(--color-text-muted)] hover:text-white transition-colors flex items-center gap-0.5 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                {item.label}
                <AnimateIcon animateOnHover animation="float"><ArrowUpRight className="h-3 w-3" /></AnimateIcon>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

