import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookMarked,
  BookOpenCheck,
  Flame,
  Library,
  Search,
} from 'lucide-react';
import { getStoredSession } from '@/lib/api';

export const ONBOARDING_STORAGE_KEY = 'readnest_onboarding_seen';

const SPLASH_DURATION_MS = 1100;

const slides = [
  {
    title: 'Discover Books That Move You',
    subtitle: 'Explore curated reads and build your personal digital library.',
    Icon: Search,
    AccentIcon: BookOpenCheck,
  },
  {
    title: 'Track Your Reading Habit',
    subtitle: 'Follow your pages, streaks, heatmap, and progress in one calm dashboard.',
    Icon: Flame,
    AccentIcon: BarChart3,
  },
  {
    title: 'Read Anywhere, Continue Anytime',
    subtitle: 'Resume books, save progress, bookmark pages, and stay consistent.',
    Icon: BookMarked,
    AccentIcon: Library,
  },
];

const FloatingBackdrop = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#c97b6b]/18 blur-3xl"
      animate={{ x: [0, 18, 0], y: [0, 26, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -right-28 bottom-16 h-72 w-72 rounded-full bg-[#2f766d]/16 blur-3xl"
      animate={{ x: [0, -22, 0], y: [0, -18, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute left-1/2 top-1/4 h-36 w-36 -translate-x-1/2 rounded-full bg-white/8 blur-2xl"
      animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.12, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

const SplashScreen = () => (
  <motion.div
    key="splash"
    className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#070b12] px-6 text-white"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.35, ease: 'easeInOut' }}
  >
    <FloatingBackdrop />
    <motion.div
      className="relative z-10 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="mb-7 grid h-24 w-24 place-items-center rounded-[2rem] border border-white/10 bg-[#111827]/90 shadow-[0_24px_80px_rgba(201,123,107,0.22)] backdrop-blur-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BookOpenCheck className="h-12 w-12 text-[#c97b6b]" strokeWidth={1.8} />
      </motion.div>
      <h1 className="text-4xl font-semibold tracking-normal text-white">ReadNest</h1>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#c97b6b]">
        Literary Sanctuary
      </p>
    </motion.div>
  </motion.div>
);

const SlideVisual = ({ Icon, AccentIcon }) => (
  <motion.div
    className="relative mx-auto grid h-56 w-full max-w-[280px] place-items-center sm:h-64"
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="absolute inset-x-8 bottom-5 h-16 rounded-full bg-[#c97b6b]/20 blur-2xl" />
    <div className="absolute left-3 top-7 h-16 w-16 rounded-full border border-white/10 bg-white/[0.04]" />
    <div className="absolute bottom-7 right-4 h-12 w-12 rounded-full bg-[#2f766d]/20" />
    <div className="relative grid h-40 w-40 place-items-center rounded-[2rem] border border-white/10 bg-[#161d27] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
      <div className="absolute inset-3 rounded-[1.5rem] border border-[#c97b6b]/20 bg-[#c97b6b]/8" />
      <Icon className="relative h-20 w-20 text-[#f5dfd9]" strokeWidth={1.5} />
    </div>
    <div className="absolute right-8 top-8 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-[#f8efe8] text-[#c97b6b] shadow-2xl shadow-black/30">
      <AccentIcon className="h-8 w-8" strokeWidth={1.7} />
    </div>
  </motion.div>
);

const OnboardingContent = ({ onFinish }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onFinish();
  };

  const handleContinue = () => {
    if (isLastSlide) {
      completeOnboarding();
      return;
    }

    setActiveIndex((current) => current + 1);
  };

  return (
    <motion.main
      key="onboarding"
      className="relative flex min-h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(201,123,107,0.18),transparent_34%),linear-gradient(160deg,#070b12_0%,#0f1419_50%,#070b12_100%)] px-4 py-5 text-white sm:px-8 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <FloatingBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-5xl items-center justify-center">
        <section className="flex min-h-[calc(100svh-2.5rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-none border-white/10 bg-transparent sm:min-h-[760px] sm:rounded-[2.25rem] sm:border sm:bg-[#111827]/78 sm:p-2 sm:shadow-[0_30px_110px_rgba(0,0,0,0.45)] sm:backdrop-blur-2xl">
          <div className="relative flex min-h-full flex-1 flex-col px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:rounded-[1.85rem] sm:bg-[linear-gradient(180deg,rgba(22,29,39,0.96),rgba(7,11,18,0.96))] sm:px-7 sm:pb-7 sm:pt-7">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#c97b6b]/15 text-[#c97b6b]">
                  <BookOpenCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none text-white">ReadNest</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Literary Sanctuary
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={completeOnboarding}
                className="rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45 transition hover:bg-white/5 hover:text-white"
              >
                Skip
              </button>
            </header>

            <div className="flex flex-1 flex-col justify-center py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -36 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <SlideVisual Icon={activeSlide.Icon} AccentIcon={activeSlide.AccentIcon} />
                  <h1 className="mx-auto mt-8 max-w-sm text-3xl font-semibold leading-tight tracking-normal text-white sm:text-[2.1rem]">
                    {activeSlide.title}
                  </h1>
                  <p className="mx-auto mt-4 max-w-[320px] text-base leading-7 text-white/58">
                    {activeSlide.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="space-y-5">
              <div className="flex items-center justify-center gap-2" aria-label="Onboarding progress">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeIndex ? 'w-8 bg-[#c97b6b]' : 'w-2.5 bg-white/18 hover:bg-white/32'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                type="button"
                onClick={handleContinue}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#c97b6b] px-5 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_48px_rgba(201,123,107,0.28)] transition hover:bg-[#b8695c]"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLastSlide ? 'Get Started' : 'Continue'}
              </motion.button>

              <button
                type="button"
                onClick={completeOnboarding}
                className="mx-auto block px-4 py-1 text-sm font-semibold text-white/45 transition hover:text-white"
              >
                Skip for now
              </button>
            </footer>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);

  const redirectPath = useMemo(() => {
    const { token, user } = getStoredSession();
    if (!token || !user) return null;
    return user.role === 'admin' ? '/admin' : '/overview';
  }, []);

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
      return undefined;
    }

    const timer = window.setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [navigate, redirectPath]);

  if (redirectPath) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen />
      ) : (
        <OnboardingContent onFinish={() => navigate('/auth', { replace: true })} />
      )}
    </AnimatePresence>
  );
};

export default OnboardingPage;
