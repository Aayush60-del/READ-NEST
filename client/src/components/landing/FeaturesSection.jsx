import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, LibraryBig, TrendingUp } from "lucide-react";

const features = [
  {
    id: "reader",
    number: "01",
    title: "Immersive Reader",
    description:
      "Read in a clean, focused space with distraction-free controls, dark mode, bookmarks, notes, and smooth progress saving.",
    icon: BookOpen,
  },
  {
    id: "progress",
    number: "02",
    title: "Reading Progress",
    description:
      "Track pages, books, streaks, completion rate, and daily consistency with meaningful reading insights.",
    icon: TrendingUp,
  },
  {
    id: "library",
    number: "03",
    title: "Smart Library",
    description:
      "Organize your collection with smart shelves, tags, and recommendations tailored to your taste.",
    icon: LibraryBig,
  },
];

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <section
      id="features"
      className="relative bg-[#f8f7f3] px-2 sm:px-8 lg:px-10 py-20 sm:py-24 lg:py-32 text-black overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 sm:mb-20"
        >
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#c97b6b] mb-4">
            Core Experience
          </p>

          <h2 className="max-w-4xl text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.92] tracking-[-0.06em]">
            Built for focused reading.
          </h2>
        </motion.div>

        <div className="border-t border-black/10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isOpen = activeFeature === feature.id;

            return (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setActiveFeature(feature.id)}
                onMouseLeave={() => setActiveFeature(null)}
                onClick={() =>
                  setActiveFeature(isOpen ? null : feature.id)
                }
                className={`group cursor-pointer border-b border-black/10 py-8 sm:py-10 transition-all duration-500 ${
                  isOpen ? "bg-white/70 px-4 sm:px-6 rounded-3xl shadow-[0_24px_70px_rgba(15,23,42,0.08)] my-4 border-transparent" : ""
                }`}
              >
                <div className="grid grid-cols-[42px_1fr_58px] sm:grid-cols-[70px_1fr_78px] gap-4 sm:gap-8 items-center">
                  <span className="text-sm font-medium sm:text-base text-slate-400">
                    {feature.number}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase tracking-[-0.06em] leading-[0.95]">
                      {feature.title}
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, y: -8 }}
                          animate={{ height: "auto", opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -8 }}
                          transition={{
                            duration: 0.38,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl mt-5 text-base leading-relaxed sm:mt-6 sm:text-xl text-slate-500">
                            {feature.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{
                        scale: isOpen ? 1.08 : 1,
                        rotate: isOpen ? -4 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                        isOpen
                          ? "bg-[#c97b6b] text-white"
                          : "bg-[#eef5ff] text-slate-900"
                      }`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </motion.div>

                    <motion.div
                      animate={{
                        rotate: isOpen ? -45 : 0,
                        x: isOpen ? 4 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className={`hidden sm:flex h-8 w-8 items-center justify-center transition-colors ${
                        isOpen ? "text-[#c97b6b]" : "text-slate-400"
                      }`}
                    >
                      <ArrowUpRight className="w-7 h-7" />
                    </motion.div>
                  </div>
                </div>

                <div className="mt-5 flex sm:hidden items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                  <span>{isOpen ? "Tap to close" : "Tap to read more"}</span>
                  <ArrowUpRight
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? "-rotate-45 text-[#c97b6b]" : ""
                    }`}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
