import { useEffect, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function BookFlameIcon({ milestone = false }) {
  return (
    <motion.div
      className="relative mx-auto flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32"
      initial={{ scale: 0.75, rotate: -4, filter: "grayscale(1)" }}
      animate={{
        scale: [0.75, 1.18, 1],
        rotate: [-4, 3, 0],
        filter: "grayscale(0)",
      }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full blur-2xl",
          milestone
            ? "bg-amber-400/50"
            : "bg-orange-500/35"
        )}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: [0, 1, 0.65],
          scale: [0.6, 1.35, 1.05],
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />

      <motion.svg
        viewBox="0 0 160 160"
        className="relative z-10 h-full w-full drop-shadow-[0_0_30px_rgba(251,146,60,0.55)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M47 108C47 82 62 68 70 48C74 63 88 70 91 88C98 78 100 66 98 55C113 69 122 87 122 108C122 132 105 148 84 148C62 148 47 132 47 108Z"
          initial={{ fill: "#6b7280" }}
          animate={{
            fill: ["#6b7280", "#f97316", "#fb923c", "#facc15"],
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
        <motion.path
          d="M68 118C68 103 76 95 80 82C84 94 96 99 96 118C96 132 88 140 80 140C72 140 68 132 68 118Z"
          initial={{ fill: "#9ca3af" }}
          animate={{
            fill: ["#9ca3af", "#fed7aa", "#fff7ed"],
          }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        />
        <motion.path
          d="M42 102C55 95 68 96 80 104C92 96 105 95 118 102V128C105 121 92 122 80 130C68 122 55 121 42 128V102Z"
          fill="#1f2937"
          stroke="#f59e0b"
          strokeWidth="5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
        />
        <motion.path
          d="M80 104V130"
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, delay: 0.42 }}
        />
      </motion.svg>

      <motion.div
        className="absolute left-5 top-8 h-16 w-5 rotate-12 rounded-full bg-white/25 blur-sm"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 78, opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
      />
    </motion.div>
  );
}

function SparkParticles({ reduced = false, milestone = false }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: milestone ? 28 : 18 }, (_, index) => ({
        id: index,
        angle: (index / (milestone ? 28 : 18)) * Math.PI * 2,
        distance: 58 + (index % 5) * 11,
        size: 4 + (index % 4),
        delay: 0.05 + (index % 8) * 0.035,
      })),
    [milestone]
  );

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-[118px] h-1 w-1 -translate-x-1/2 -translate-y-1/2">
      {sparks.map((spark) => {
        const x = Math.cos(spark.angle) * spark.distance;
        const y = Math.sin(spark.angle) * spark.distance;

        return (
          <motion.span
            key={spark.id}
            className={cn(
              "absolute rounded-sm",
              spark.id % 3 === 0
                ? "bg-yellow-200"
                : spark.id % 3 === 1
                ? "bg-orange-400"
                : "bg-amber-500"
            )}
            style={{
              width: spark.size,
              height: spark.size,
              left: 0,
              top: 0,
              boxShadow: "0 0 16px rgba(251, 191, 36, 0.85)",
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{
              x,
              y,
              opacity: [0, 1, 0],
              scale: [0.2, 1, 0.35],
              rotate: 180,
            }}
            transition={{
              duration: 0.8,
              delay: spark.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        );
      })}
    </div>
  );
}

function RollingNumber({ value }) {
  return (
    <div className="relative h-[72px] overflow-hidden sm:h-[84px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          className="bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-500 bg-clip-text text-6xl font-black leading-none text-transparent sm:text-7xl"
          initial={{ y: 70, rotateX: -75, opacity: 0, scale: 0.72 }}
          animate={{ y: 0, rotateX: 0, opacity: 1, scale: 1 }}
          exit={{ y: -70, rotateX: 75, opacity: 0, scale: 0.72 }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WeeklyTracker({ weeklyProgress = [] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const progress =
    weeklyProgress.length === 7
      ? weeklyProgress
      : [true, true, true, true, false, false, false];

  return (
    <motion.div
      className="mx-auto mt-6 grid w-full max-w-sm grid-cols-7 gap-2"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.055,
            delayChildren: 0.45,
          },
        },
      }}
    >
      {days.map((day, index) => {
        const done = Boolean(progress[index]);

        return (
          <motion.div
            key={`${day}-${index}`}
            className="flex flex-col items-center gap-2"
            variants={{
              hidden: { y: 14, opacity: 0, scale: 0.82 },
              show: { y: 0, opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-bold shadow-lg",
                done
                  ? "border-amber-300/40 bg-gradient-to-br from-amber-300 to-orange-500 text-zinc-950 shadow-orange-500/25"
                  : "border-white/10 bg-white/5 text-zinc-500"
              )}
            >
              {done ? (
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 600,
                    damping: 18,
                    delay: 0.55 + index * 0.055,
                  }}
                >
                  ✓
                </motion.span>
              ) : (
                day
              )}
            </div>
            <span className="text-[11px] font-medium text-zinc-500">{day}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function getMessage(streak, milestone) {
  if (milestone) return "Milestone unlocked! Your reading habit is becoming powerful.";
  if (streak >= 30) return "A serious reading habit is forming.";
  if (streak >= 7) return "One full week of consistency.";
  return "Small pages. Big progress.";
}

export default function StreakCelebration({
  open,
  onClose,
  previousStreak = 0,
  newStreak = 1,
  weeklyProgress = [],
  milestone = false,
}) {
  const reducedMotion = useReducedMotion();
  const message = getMessage(newStreak, milestone);

  useEffect(() => {
    if (!open || !milestone || reducedMotion) return;

    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 42,
        spread: 58,
        startVelocity: 32,
        ticks: 120,
        gravity: 0.9,
        scalar: 0.82,
        origin: { x: 0.5, y: 0.42 },
        colors: ["#facc15", "#fb923c", "#f97316", "#fff7ed"],
        disableForReducedMotion: true,
      });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [open, milestone, reducedMotion]);

  useEffect(() => {
    if (!open) return;

    navigator.vibrate?.(20);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = oldOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80 px-4 py-6 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Reading streak celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.16 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 text-center shadow-2xl shadow-orange-950/40 sm:p-8"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.92 }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.96 }
            }
            transition={{ duration: reducedMotion ? 0.08 : 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -left-24 -top-24 h-52 w-52 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
            {milestone ? (
              <motion.div
                className="absolute inset-x-8 top-4 h-24 rounded-full bg-amber-300/20 blur-3xl"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0.45], scale: [0.4, 1.25, 1] }}
                transition={{ duration: 0.8 }}
              />
            ) : null}

            <SparkParticles reduced={reducedMotion} milestone={milestone} />

            <div className="relative z-10">
              <BookFlameIcon milestone={milestone} />

              <motion.p
                className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-300/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.38, duration: 0.25 }}
              >
                Daily Reading Streak
              </motion.p>

              <motion.div
                className="mt-3 flex items-end justify-center gap-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.22, duration: 0.35 }}
              >
                <RollingNumber value={newStreak} />
                <span className="mb-2 text-xl font-extrabold text-zinc-200 sm:text-2xl">
                  days
                </span>
              </motion.div>

              <p className="sr-only" aria-live="polite">
                Your reading streak increased from {previousStreak} to {newStreak} days.
              </p>

              <motion.h2
                className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.48, duration: 0.28 }}
              >
                {milestone ? "Milestone unlocked!" : "You kept it alive!"}
              </motion.h2>

              <motion.p
                className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.58, duration: 0.28 }}
              >
                {message}
              </motion.p>

              <WeeklyTracker weeklyProgress={weeklyProgress} />

              <motion.div
                className="mt-7 rounded-3xl border border-amber-300/15 bg-gradient-to-br from-amber-300/10 to-orange-500/10 p-4"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: reducedMotion ? 0 : 0.82, duration: 0.32 }}
              >
                <p className="text-sm font-semibold text-amber-100">
                  Read again tomorrow to protect your streak.
                </p>
              </motion.div>

              <motion.button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-5 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-orange-500/25 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-zinc-950 active:scale-[0.98]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.98, duration: 0.28 }}
              >
                Continue Reading
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
