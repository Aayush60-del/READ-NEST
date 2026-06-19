import { useRef, useEffect } from 'react';
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

  useEffect(() => {
    const section = sectionRef.current;
    const scrollWrapper = scrollWrapperRef.current;
    if (!section || !scrollWrapper) return;

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
  }, []);

  return (
    <section ref={sectionRef} id="genres" className="overflow-hidden bg-[#0a0a0f] relative h-screen flex flex-col justify-center border-y border-white/5">
      <div className="absolute top-20 left-6 md:left-16 z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] font-medium mb-4" style={{ fontFamily: 'var(--font-accent)' }}>
          Genres
        </p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Explore vast worlds.
        </h2>
      </div>

      <div ref={scrollWrapperRef} className="flex gap-8 px-6 md:px-16 mt-20 w-max">
        {genres.map((g) => (
          <div
            key={g.id}
            className={`w-[280px] md:w-[400px] h-[350px] md:h-[450px] rounded-3xl border border-white/10 ${g.image ? 'bg-black' : `bg-gradient-to-br ${g.color}`} p-8 flex flex-col justify-end relative overflow-hidden group backdrop-blur-md`}
          >
            {g.image && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                  style={{ backgroundImage: `url('${g.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />
              </>
            )}

            {!g.image && (
              <g.Icon className="absolute -right-8 -bottom-8 h-60 w-60 text-white/5 group-hover:text-white/10 transition-colors" />
            )}

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform backdrop-blur-md">
                <AnimateIcon animateOnHover animateOnView animation={g.animation}>
                  <g.Icon className="h-6 w-6 text-white" />
                </AnimateIcon>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{g.title}</h3>
              <p className="text-sm text-white/80 font-medium">Over 1,000+ books</p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center text-white/40">
        <div className="flex items-center gap-2">
          <AnimateIcon loop loopDelay={800} animation="turn"><ArrowRight className="h-5 w-5" /></AnimateIcon>
          <span className="text-xs tracking-widest uppercase font-medium">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScrollSection;

