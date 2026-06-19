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
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleAnchorClick = (event, href) => {
    event.preventDefault();
    setOpen(false);

    const target = document.querySelector(href);
    if (!target) return;

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(target, { offset: -72, duration: 1.05 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>

      <motion.header
        animate={{ y: hidden && !open ? -80 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 md:px-10 h-[72px] transition-colors duration-300 ${
          open || scrolled ? 'bg-white/[0.92] backdrop-blur-xl border-b border-black/10 shadow-sm' : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <a href="#hero" onClick={(event) => handleAnchorClick(event, '#hero')} className={`flex items-center gap-2 font-bold text-xl tracking-tight transition-colors ${open || scrolled ? 'text-black' : 'text-white'}`}>
          <AnimateIcon animateOnHover animation="draw"><BookOpenCheck className="h-7 w-7 text-primary" /></AnimateIcon>
          ReadNest
        </a>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Sign In link */}
          <Link
            to="/auth"
            className={`text-sm sm:text-[15px] font-bold tracking-widest transition-colors uppercase ${open || scrolled ? 'text-black hover:text-blue-600' : 'text-white/80 hover:text-white'}`}
          >
            Sign In
          </Link>

          <Link
            to="/feedback"
            className={`hidden sm:block text-[15px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-300 ${open || scrolled ? 'text-black border-black/20 hover:bg-black hover:text-white' : 'text-white border-white/20 hover:bg-white hover:text-black'}`}
          >
            LET'S TALK
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-1 sm:gap-2 text-lg sm:text-2xl font-medium tracking-widest transition-colors ${open || scrolled ? 'text-black' : 'text-white/80 hover:text-white'}`}
          >
            {open ? (
              <AnimateIcon animateOnHover animation="turn"><X className="h-6 w-6" /></AnimateIcon>
            ) : (
              <>
                <span className="hidden sm:block w-1.5 h-1.5 rounded-sm bg-primary" />
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[180]"
            />

            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] z-[190] bg-background border-l border-border flex flex-col justify-between px-8 md:px-12 pt-28 pb-12 shadow-2xl"
            >
              <div className="flex flex-col w-full">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    onClick={(event) => handleAnchorClick(event, l.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="group flex items-baseline gap-2 py-5 border-b border-border/50"
                  >
                    <span className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter group-hover:text-muted-foreground transition-colors ">
                      {l.label}
                    </span>
                    {i === 0 && (
                      <span className="w-2.5 h-2.5 bg-primary mb-2" />
                    )}
                  </motion.a>
                ))}
              </div>

              <div className="w-full mt-12 grid grid-cols-1 gap-8">
                <div>
                  <p className="text-[15px] uppercase tracking-widest font-medium mb-2 ">(EMAIL)</p>
                  <a href="mailto:negiius724@gmail.com" className="text-lg md:text-xl font-bold text-primary hover:opacity-80  transition-opacity">
                    negiius724@gmail.com
                  </a>
                </div>

                <div>
                  <p className="text-[15px] uppercase tracking-widest font-medium mb-3">(SOCIALS)</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        {s.label}
                        <AnimateIcon animateOnHover animation="float"><ArrowUpRight className="h-3.5 w-3.5" /></AnimateIcon>
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

