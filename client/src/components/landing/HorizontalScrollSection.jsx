import { useRef } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Rocket,
  Sparkles,
} from "lucide-react";

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
  const scrollRef = useRef(null);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction * Math.min(window.innerWidth * 0.85, 430),
      behavior: "smooth",
    });
  };

  return (
    <section
      id="genres"
      className="relative overflow-hidden bg-[#09090d] py-20 sm:py-24 lg:py-32 text-white"
    >
      <div className="relative z-10">
        <div className="mb-10 px-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-[#c97b6b]">
                Genres
              </p>

              <h2 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] sm:text-6xl lg:text-8xl">
                Explore vast worlds.
              </h2>
            </motion.div>

            <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollByAmount(-1)}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-xl transition hover:bg-white hover:text-black"
                aria-label="Scroll genres left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollByAmount(1)}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-xl transition hover:bg-white hover:text-black"
                aria-label="Scroll genres right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="rn-genre-scroll flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:gap-6 sm:px-10 lg:px-[max(4rem,calc((100vw-80rem)/2+4rem))]"
        >
          {genres.map((genre, index) => {
            const Icon = genre.icon;

            return (
              <motion.article
                key={genre.title}
                initial={{ opacity: 0, y: 42, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative h-[470px] min-w-[82vw] snap-start overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_32px_90px_rgba(0,0,0,0.35)] sm:h-[560px] sm:min-w-[390px] lg:min-w-[430px]"
              >
                <img
                  src={genre.image}
                  alt={genre.title}
                  draggable="false"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/88" />
                <div className="absolute inset-0 bg-black/20 transition duration-500 group-hover:bg-black/5" />

                <div className="relative z-10 flex h-full flex-col justify-end p-7 sm:p-8">
                  <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/15 text-white shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-500 group-hover:-translate-y-2 group-hover:bg-white group-hover:text-black">
                    <Icon className="h-9 w-9" />
                  </div>

                  <h3 className="text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
                    {genre.title}
                  </h3>

                  <p className="mt-4 text-lg font-semibold text-white/75 sm:text-xl">
                    {genre.count}
                  </p>

                  <div className="mt-7 h-px w-full bg-white/15">
                    <div className="h-full w-0 bg-[#c97b6b] transition-all duration-700 group-hover:w-full" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between px-6 sm:hidden">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-white/35">
            Swipe cards
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70"
              aria-label="Scroll genres left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70"
              aria-label="Scroll genres right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
