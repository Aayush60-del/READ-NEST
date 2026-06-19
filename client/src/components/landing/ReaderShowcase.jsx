import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, BookmarkPlus, ChevronRight, Gauge, Moon, NotebookPen, StickyNote, SunMedium, Type } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';
import ScrollReveal from '../ScrollReveal';

const readerFeatures = [
  { Icon: Moon, animation: 'float', label: 'Dark Mode', desc: 'Easy on the eyes for late-night reading' },
  { Icon: SunMedium, animation: 'pulse', label: 'Sepia Theme', desc: 'Warm tones for a paper-like feel' },
  { Icon: BookmarkPlus, animation: 'draw', label: 'Bookmarks', desc: 'Mark and revisit your favorite passages' },
  { Icon: StickyNote, animation: 'draw', label: 'Quick Notes', desc: 'Jot down thoughts without leaving the page' },
  { Icon: ChevronRight, animation: 'turn', label: 'Page Navigation', desc: 'Smooth and intuitive page turning' },
  { Icon: Gauge, animation: 'pulse', label: 'Reading Progress', desc: 'Always know where you stand' },
];

const ReaderShowcase = () => {
  return (
    <section data-gsap-section id="reader" className="section-padding overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] font-medium mb-4" style={{ fontFamily: 'var(--font-accent)' }}>
            Reader
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-16" style={{ fontFamily: 'var(--font-heading)' }}>
            Your reading experience,<br />
            <span className="text-gradient">perfected.</span>
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="absolute -inset-6 bg-[var(--color-accent)]/5 rounded-[32px] blur-2xl" />
              <div className="relative rounded-3xl border border-white/[0.08] bg-[#111118] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <AnimateIcon animateOnHover animation="turn">
                      <ArrowLeft className="h-5 w-5 text-[var(--color-text-muted)]" />
                    </AnimateIcon>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Chapter 7: The Secret</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AnimateIcon animateOnHover animation="pulse"><Type className="h-5 w-5 text-[var(--color-text-muted)]" /></AnimateIcon>
                    <AnimateIcon animateOnHover animation="pulse"><NotebookPen className="h-5 w-5 text-[var(--color-text-muted)]" /></AnimateIcon>
                    <AnimateIcon animateOnHover animation="draw"><Bookmark className="h-5 w-5 text-[var(--color-text-muted)] hover:text-white" /></AnimateIcon>
                  </div>
                </div>

                <div className="p-8 md:p-12 space-y-5 min-h-[350px]">
                  <p className="text-[var(--color-text-secondary)] leading-[1.9] text-[15px]">
                    The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.
                  </p>
                  <div className="text-[var(--color-text-secondary)] leading-[1.9] text-[15px]">
                    Your identity emerges out of your habits.
                    <div className="border-l-4 border-[var(--color-accent)] pl-4 py-2 bg-white/[0.02] rounded-r-lg mt-2">
                      <p className="italic text-white/90">
                        "Every action is a vote for the type of person you wish to become."
                      </p>
                    </div>
                  </div>
                  <p className="text-[var(--color-text-muted)] leading-[1.9] text-[15px] opacity-60">
                    No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity...
                  </p>
                </div>

                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">Page 142 of 320</span>
                  <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '45%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-[var(--color-accent)] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-1">
            {readerFeatures.map((f, i) => (
              <ScrollReveal key={f.label} delay={0.1 + i * 0.08} direction="right">
                <motion.div
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors cursor-default group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-accent)]/10 transition-colors">
                    <AnimateIcon animateOnHover animateOnView animation={f.animation}>
                      <f.Icon className="h-6 w-6 text-[var(--color-text-muted)] group-hover:text-blue-600 transition-colors" />
                    </AnimateIcon>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black-400 hover:text-blue-600 text-sm">{f.label}</h4>
                    <p className="text-xl text-[var(--color-text-muted)] mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReaderShowcase;


