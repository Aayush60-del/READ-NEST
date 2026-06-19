import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Library, Sparkles } from "lucide-react";
import AnimateIcon from "@/components/animate-ui/AnimateIcon";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f6f4ef] text-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#f6f4ef]" />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.25) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="absolute -top-24 -left-32 h-[30rem] w-[30rem] rounded-full bg-blue-100 blur-3xl opacity-70" />
        <div className="absolute top-[28%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-slate-200 blur-3xl opacity-80" />
        <div className="absolute bottom-[-10%] left-[36%] h-[22rem] w-[22rem] rounded-full bg-[#d58d72]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 pb-20 pt-32 md:px-10 lg:grid-cols-[1fr_0.9fr] lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 35, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 shadow-sm">
            <AnimateIcon animateOnView animation="spark">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </AnimateIcon>

            <span className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">
              Your reading platform
            </span>
          </div>

          <h1
            className="text-[clamp(3.4rem,8vw,7rem)] font-black uppercase leading-[0.92] tracking-[-0.065em]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Read
            <br />
            <span className="text-slate-400">better.</span>
            <br />
            Remember
            <br />
            <span className="text-blue-700">always.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Track progress, save notes, build reading streaks, and finish books
            with an interface that feels calm, focused, and alive.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-2xl bg-black px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-slate-800"
            >
              <BookOpen className="h-4 w-4" />
              Start Reading
            </Link>

            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-7 py-4 text-sm font-black uppercase tracking-wide text-slate-900 transition hover:bg-slate-100"
            >
              <Library className="h-4 w-4" />
              Explore Library
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-4 text-slate-500">
            <span className="h-px w-12 bg-slate-300" />
            <span className="text-xs font-black uppercase tracking-[0.28em]">
              Built for serious readers
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 70, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto max-w-[460px] rounded-[2.2rem] border border-slate-200 bg-white/80 p-5 shadow-[0_35px_110px_rgba(15,23,42,0.12)] backdrop-blur-xl"
          >
            <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-blue-100 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-[#d58d72]/25 blur-2xl" />

            <div className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[#19172a]">
              <img
                src="/images/readnest-character.png"
                alt="ReadNest reader character reading a book"
                className="h-[430px] w-full object-cover object-center"
                draggable="false"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Focus Mode
                </div>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-950">42</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Day Streak
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-950">8k+</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Pages
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-950">12</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Books
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;


