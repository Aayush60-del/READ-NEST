import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpenCheck } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Library', to: '/auth' },
  { label: 'Reader', href: '#reader' },
  { label: 'Pricing', href: '#cta' },
];

const FooterSection = () => {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMotion, setIsMobileMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)').matches
  );
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const textX = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);
  const shouldReduceMotion = prefersReducedMotion || isMobileMotion;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)');
    const update = () => setIsMobileMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const scrollToTarget = (target) => {
    if (!target) return;

    const targetTop = Math.max(
      target.getBoundingClientRect().top + window.scrollY - 72,
      0
    );

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(targetTop, { duration: 1.05 });
      return;
    }

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  };

  const handleFooterAnchorClick = (event, href) => {
    event.preventDefault();
    const target = document.querySelector(href);
    scrollToTarget(target);
  };

  return (
    <footer ref={sectionRef} className="border-t border-white/5 bg-[#060608]">
      <div
        className="relative cursor-pointer overflow-hidden py-12 md:py-20"
        onClick={() => {
          if (window.lenis?.scrollTo) {
            window.lenis.scrollTo(0, { duration: 1.05 });
            return;
          }

          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <motion.div style={shouldReduceMotion ? undefined : { x: textX }}>
          <h2 className="giant-text text-center text-white/[0.03] hover:text-white/[0.08] transition-colors duration-700 select-none uppercase">
            READNEST
          </h2>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <AnimateIcon animateOnView animation="draw">
                <BookOpenCheck className="h-7 w-7 text-[var(--color-primary)]" />
              </AnimateIcon>
              <span className="text-2xl font-black tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-heading)' }}>ReadNest</span>
            </div>
            <p className="text-xl text-[var(--color-text-muted)] hover:text-white" style={{ fontFamily: 'var(--font-accent)' }}>
              Your distraction-free reading space.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-white/[0.04] px-6 py-8 md:px-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <span className="text-[15px] tracking-wide text-[var(--color-text-muted)] hover:text-white" style={{ fontFamily: 'var(--font-accent)' }}>
            (c) 2026 ReadNest. All rights reserved.
          </span>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {footerLinks.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[11px] uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-white"
                  style={{ fontFamily: 'var(--font-accent)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => handleFooterAnchorClick(event, item.href)}
                  className="text-[11px] uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-white"
                  style={{ fontFamily: 'var(--font-accent)' }}
                >
                  {item.label}
                </a>
              )
            )}
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
                className="flex items-center gap-0.5 text-[11px] uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-white"
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
