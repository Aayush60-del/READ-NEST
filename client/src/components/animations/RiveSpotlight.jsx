import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { BookOpenCheck, Sparkles, Quote } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';
import { cn } from '@/lib/utils';

const RivePlayer = lazy(() => import('./RivePlayer'));

const FallbackBookVisual = ({ compact = false }) => (
  <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl shadow-2xl">
    <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#c97b6b]/25 blur-3xl" />
    <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#2f766d]/25 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_48%)]" />

    <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
          <AnimateIcon animateOnView animation="spark">
            <Sparkles className="h-3.5 w-3.5 text-[#e8a898]" />
          </AnimateIcon>
          Rive ready
        </div>
        <div className="h-2 w-2 rounded-full bg-[#4d9e94] shadow-[0_0_18px_rgba(77,158,148,0.8)]" />
      </div>

      <div className="relative mx-auto my-8 flex w-full max-w-[360px] items-center justify-center">
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -10, 0], rotate: [-2, 1.5, -2] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-56 w-44 rounded-r-[22px] rounded-l-lg border-l-[10px] border-[#3b2a1a] bg-gradient-to-br from-[#f4d7bd] via-[#d9967e] to-[#9f4f43] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="absolute inset-4 rounded-r-2xl border border-white/25 bg-white/10" />
          <div className="absolute left-7 right-7 top-12 h-px bg-white/35" />
          <div className="absolute left-7 right-12 top-20 h-px bg-white/25" />
          <div className="absolute left-7 right-16 top-28 h-px bg-white/20" />
          <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between text-white/70">
            <BookOpenCheck className="h-7 w-7" />
            <Quote className="h-5 w-5" />
          </div>
        </motion.div>

        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            aria-hidden="true"
            className="absolute rounded-full border border-white/10 bg-white/[0.06]"
            style={{
              width: 72 + index * 40,
              height: 72 + index * 40,
            }}
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.18, 0.04, 0.18] }}
            transition={{ duration: 4 + index, repeat: Infinity, delay: index * 0.4, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {!compact && (
        <div className="grid grid-cols-3 gap-3 text-white">
          {[
            ['42', 'day streak'],
            ['8k+', 'pages'],
            ['12', 'books'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-center">
              <p className="font-serif text-2xl">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const RiveSpotlight = ({
  src = import.meta.env.VITE_RIVE_READER_SRC || '',
  artboard = import.meta.env.VITE_RIVE_READER_ARTBOARD || undefined,
  stateMachine = import.meta.env.VITE_RIVE_READER_STATE_MACHINE || 'State Machine 1',
  className = '',
  compact = false,
}) => {
  const fallback = <FallbackBookVisual compact={compact} />;

  return (
    <div className={cn('relative', className)}>
      {src ? (
        <Suspense fallback={fallback}>
          <RivePlayer
            src={src}
            artboard={artboard}
            stateMachine={stateMachine}
            className="h-full min-h-[320px] w-full"
            fallback={fallback}
          />
        </Suspense>
      ) : fallback}
    </div>
  );
};

export default RiveSpotlight;

