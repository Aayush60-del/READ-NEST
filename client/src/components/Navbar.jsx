import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpenCheck, X } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

const navLinks = [
  { label: 'HOME', href: '#hero' },
  { label: 'FEATURES', href: '#features' },
  { label: 'READER', href: '#reader' },
  { label: 'GENRES', href: '#genres' },
  { label: 'START', href: '#cta' },
];

const socials = [
  { label: 'GitHub', href: 'https://github.com/Aayush60-del' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aayush-negi-a08367334/' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const scrollToSection = (target) => {
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

  const handleAnchorClick = (event, href) => {
    event.preventDefault();
    setOpen(false);

    const target = document.querySelector(href);
    if (!target) return;

    scrollToSection(target);
  };

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? -80 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-[200] flex h-[72px] items-center justify-between px-6 transition-colors duration-300 md:px-10 ${
          open || scrolled
            ? 'bg-white/[0.92] backdrop-blur-xl border-b border-black/10 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <a
          href="#hero"
          onClick={(event) => handleAnchorClick(event, '#hero')}
          className={`flex items-center gap-2 text-xl font-bold tracking-tight transition-colors ${
            open || scrolled ? 'text-black' : 'text-white'
          }`}
        >
          <AnimateIcon animateOnHover animation="draw">
            <BookOpenCheck className="h-7 w-7 text-primary" />
          </AnimateIcon>
          ReadNest
        </a>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/auth"
            className={`text-sm font-bold tracking-widest uppercase transition-colors sm:text-[15px] ${
              open || scrolled
                ? 'text-black hover:text-blue-600'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Sign In
          </Link>

          <Link
            to="/feedback"
            className={`hidden rounded-full border px-4 py-2 text-[15px] font-bold tracking-widest uppercase transition-all duration-300 sm:block ${
              open || scrolled
                ? 'text-black border-black/20 hover:bg-black hover:text-white'
                : 'text-white border-white/20 hover:bg-white hover:text-black'
            }`}
          >
            LET&apos;S TALK
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-1 text-lg font-medium tracking-widest transition-colors sm:gap-2 sm:text-2xl ${
              open || scrolled ? 'text-black' : 'text-white/80 hover:text-white'
            }`}
          >
            {open ? (
              <AnimateIcon animateOnHover animation="turn">
                <X className="h-6 w-6" />
              </AnimateIcon>
            ) : (
              <>
                <span className="hidden h-1.5 w-1.5 rounded-sm bg-primary sm:block" />
                MENU
              </>
            )}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[180] bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[190] flex w-full flex-col justify-between border-l border-border bg-background px-8 pt-28 pb-12 shadow-2xl md:w-[500px] md:px-12"
            >
              <div className="flex w-full flex-col">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    onClick={(event) => handleAnchorClick(event, l.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="group flex items-baseline gap-2 border-b border-border/50 py-5"
                  >
                    <span className="text-4xl font-black tracking-tighter text-foreground uppercase transition-colors group-hover:text-muted-foreground md:text-5xl">
                      {l.label}
                    </span>
                    {i === 0 && <span className="mb-2 h-2.5 w-2.5 bg-primary" />}
                  </motion.a>
                ))}
              </div>

              <div className="mt-12 grid w-full grid-cols-1 gap-8">
                <div>
                  <p className="mb-2 text-[15px] font-medium tracking-widest uppercase">
                    (EMAIL)
                  </p>
                  <a
                    href="mailto:negiius724@gmail.com"
                    className="text-lg font-bold text-primary transition-opacity hover:opacity-80 md:text-xl"
                  >
                    negiius724@gmail.com
                  </a>
                </div>

                <div>
                  <p className="mb-3 text-[15px] font-medium tracking-widest uppercase">
                    (SOCIALS)
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {s.label}
                        <AnimateIcon animateOnHover animation="float">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </AnimateIcon>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
