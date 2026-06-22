import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, BookOpen, Heart, Rocket, Search, Sparkles, UserRound } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

gsap.registerPlugin(ScrollTrigger);

const genres = [
  { id: 1, title: 'Science Fiction', color: 'from-blue-500/20 to-purple-600/20', Icon: Rocket, animation: 'float', image: '/images/Science.webp' },
  { id: 2, title: 'Fantasy', color: 'from-emerald-500/20 to-teal-600/20', Icon: Sparkles, animation: 'spark', image: '/images/Fantasy.webp' },
  { id: 3, title: 'Mystery', color: 'from-slate-500/20 to-gray-600/20', Icon: Search, animation: 'pulse', image: '/images/NonFiction.webp' },
  { id: 4, title: 'Romance', color: 'from-rose-500/20 to-pink-600/20', Icon: Heart, animation: 'pulse', image: '/images/Romance.jpg' },
  { id: 5, title: 'Non-Fiction', color: 'from-amber-500/20 to-orange-600/20', Icon: BookOpen, animation: 'draw', image: '/images/NonFiction.webp' },
  { id: 6, title: 'Biography', color: 'from-indigo-500/20 to-cyan-600/20', Icon: UserRound, animation: 'float', image: '/images/Biography.jpg' },
];

const HorizontalScrollSection = () => {
  const sectionRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const [enablePinnedScroll, setEnablePinnedScroll] = useState(false);

  useEffect(() => {
    const updateMode = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      setEnablePinnedScroll(isDesktop && !prefersReducedMotion);
    };

    updateMode();
    window.addEventListener('resize', updateMode);

    return () => window.removeEventListener('resize', updateMode);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const scrollWrapper = scrollWrapperRef.current;
    if (!section || !scrollWrapper || !enablePinnedScroll) return;

    const getScrollAmount = () => {
      const scrollWidth = scrollWrapper.scrollWidth;
      return -(scrollWidth - window.innerWidth);
    };

    const tween = gsap.to(scrollWrapper, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => tween.kill();
  }, [enablePinnedScroll]);

  return (
    <section
      ref={sectionRef}
      id="genres"
      className={`relative flex flex-col justify-center border-y border-white/5 bg-[#0a0a0f] ${
        enablePinnedScroll ? 'h-screen overflow-hidden' : 'overflow-x-auto py-32'
      }`}
    >
      <div className="absolute top-20 left-6 md:left-16 z-10">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-accent)' }}>
          Genres
        </p>
        <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
          Explore vast worlds.
        </h2>
      </div>

      <div ref={scrollWrapperRef} className="mt-20 flex w-max gap-8 px-6 pb-4 md:px-16">
        {genres.map((g) => (
          <div
            key={g.id}
            className={`relative flex h-[350px] w-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-8 backdrop-blur-md group md:h-[450px] md:w-[400px] ${
              g.image ? 'bg-black' : `bg-gradient-to-br ${g.color}`
            }`}
          >
            {g.image && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-500 group-hover:opacity-60"
                  style={{ backgroundImage: `url('${g.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />
              </>
            )}

            {!g.image && (
              <g.Icon className="absolute -right-8 -bottom-8 h-60 w-60 text-white/5 transition-colors group-hover:text-white/10" />
            )}

            <div className="relative z-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md transition-transform group-hover:scale-110">
                <AnimateIcon animateOnHover animateOnView animation={g.animation}>
                  <g.Icon className="h-6 w-6 text-white" />
                </AnimateIcon>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>{g.title}</h3>
              <p className="text-sm font-medium text-white/80">Over 1,000+ books</p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-0 right-0 hidden justify-center text-white/40 md:flex">
        <div className="flex items-center gap-2">
          <AnimateIcon loop loopDelay={800} animation="turn">
            <ArrowRight className="h-5 w-5" />
          </AnimateIcon>
          <span className="text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
