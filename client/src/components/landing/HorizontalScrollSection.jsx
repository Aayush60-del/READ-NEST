import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen, Compass, Heart, Rocket, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const genres = [
  {
    title: "Science Fiction",
    count: "Over 1,000+ books",
    image: "/images/Science.webp",
    icon: Rocket,
  },
  {
    title: "Fantasy",
    count: "Over 1,200+ books",
    image: "/images/Fantasy.webp",
    icon: Sparkles,
  },
  {
    title: "Romance",
    count: "Over 900+ books",
    image: "/images/Romance.jpg",
    icon: Heart,
  },
  {
    title: "Biography",
    count: "Over 700+ books",
    image: "/images/Biography.jpg",
    icon: BookOpen,
  },
  {
    title: "Non Fiction",
    count: "Over 850+ books",
    image: "/images/NonFiction.webp",
    icon: Compass,
  },
];

const HorizontalScrollSection = () => {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;

    if (!section || !viewport || !track) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(track, { clearProps: "transform" });
      if (progress) {
        gsap.set(progress, { scaleX: 1, transformOrigin: "left center" });
      }
      return undefined;
    }

    const cleanupFns = [];
    const ctx = gsap.context(() => {
      const getDistance = () => {
        return Math.max(0, track.scrollWidth - viewport.clientWidth);
      };

      gsap.set(track, { x: 0 });
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

      const horizontalTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance() + 80}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(progress, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance() + 80}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      const images = Array.from(track.querySelectorAll("img"));

      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", refresh, { once: true });
          cleanupFns.push(() => img.removeEventListener("load", refresh));
        }
      });

      window.addEventListener("resize", refresh);
      cleanupFns.push(() => {
        window.removeEventListener("resize", refresh);
        horizontalTween.kill();
      });
    }, section);

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="genres"
      className="relative overflow-hidden bg-[#09090d] text-white"
    >
      <div className="relative flex items-center min-h-screen py-20 overflow-hidden sm:py-24 lg:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[-15%] top-[20%] h-[320px] w-[320px] rounded-full bg-[#c97b6b]/10 blur-3xl" />
          <div className="absolute right-[-20%] bottom-[8%] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full">
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-5 sm:mb-7 lg:mb-8"
              >
                <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-[#c97b6b]">
                  Genres
                </p>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <h2 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] sm:text-6xl lg:text-8xl">
                    Explore vast worlds.
                  </h2>
                </div>
              </motion.div>

              <div className="w-full h-px mb-6 overflow-hidden bg-white/10">
                <div ref={progressRef} className="h-full w-full bg-[#c97b6b]" />
              </div>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="rn-genre-viewport relative w-full overflow-x-auto overflow-y-hidden lg:overflow-hidden"
          >
            <div
              ref={trackRef}
              className="rn-genre-track flex w-max items-stretch gap-5 px-6 sm:gap-6 sm:px-10 lg:px-[max(4rem,calc((100vw-80rem)/2+4rem))]"
            >
              {genres.map((genre, index) => {
                const Icon = genre.icon;

                return (
                  <motion.article
                    key={genre.title}
                    initial={{ opacity: 0, y: 44, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.75,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rn-genre-card group relative w-[82vw] max-w-[430px] shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_32px_90px_rgba(0,0,0,0.35)] sm:w-[390px] lg:w-[430px]"
                  >
                    <img
                      src={genre.image}
                      alt={genre.title}
                      draggable="false"
                      className="absolute inset-0 object-cover w-full h-full transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/88" />
                    <div className="absolute inset-0 transition duration-500 bg-black/20 group-hover:bg-black/5" />

                    <div className="relative z-10 flex flex-col justify-end h-full p-7 sm:p-8">
                      <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/15 text-white shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-500 group-hover:-translate-y-2 group-hover:bg-white group-hover:text-black">
                        <Icon className="h-9 w-9" />
                      </div>

                      <h3 className="rn-genre-card-title text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
                        {genre.title}
                      </h3>

                      <p className="rn-genre-card-count mt-3 text-base font-semibold text-white/75 sm:text-lg">
                        {genre.count}
                      </p>

                      <div className="w-full h-px mt-7 bg-white/15">
                        <div className="h-full w-0 bg-[#c97b6b] transition-all duration-700 group-hover:w-full" />
                      </div>
                    </div>
                  </motion.article>
                );
              })}

              <div className="flex h-[460px] w-[40vw] max-w-[220px] shrink-0 items-center justify-center sm:h-[540px]">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScrollSection;


