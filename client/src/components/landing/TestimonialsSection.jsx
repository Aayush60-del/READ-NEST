import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bookmark, Clock3, Highlighter, Quote, Smartphone } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const readerNotes = [
  {
    reader: "Final-year law student",
    context: "Reads case PDFs between classes",
    quote:
      "I mostly use ReadNest on my phone. The reader opens where I left off, and bookmarks make it easy to return to important pages before revision.",
    detail: "31 saved pages",
    icon: Bookmark,
  },
  {
    reader: "Commute reader",
    context: "Short sessions, usually at night",
    quote:
      "The streak only counts when I actually spend time reading. That feels better than apps that reward random page skipping.",
    detail: "5 min sessions",
    icon: Clock3,
  },
  {
    reader: "Book-club organizer",
    context: "Tracks notes across laptop and mobile",
    quote:
      "Notes, highlights, and progress stay in one place. I can prepare discussion points without digging through screenshots.",
    detail: "18 highlights",
    icon: Highlighter,
  },
];

const checkpoints = [
  { label: "Mobile reader", value: "tested on small screens", icon: Smartphone },
  { label: "Progress", value: "saved by page and time", icon: Clock3 },
  { label: "Bookmarks", value: "kept with each book", icon: Bookmark },
];

const TestimonialsSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".rn-testimonial-card");

      if (prefersReducedMotion) {
        gsap.set(cards, { opacity: 1, clearProps: "transform" });
        return;
      }

      gsap.set(cards, {
        opacity: 0,
        x: 150,
        y: 86,
        scale: 0.94,
        rotateZ: 3,
        transformOrigin: "right center",
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 76%",
          end: "center 34%",
          scrub: 0.65,
        },
      }).to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotateZ: 0,
        duration: 1,
        stagger: {
          each: 0.22,
          from: "start",
        },
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-gsap-section
      id="testimonials"
      className="section-padding bg-[#f4f0e7] text-[#1d252f]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-14">
        <ScrollReveal delay={0.1} className="w-full lg:w-[40%] lg:shrink-0">
          <div className="lg:sticky lg:top-28 lg:max-w-[440px]">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.24em] text-[#b85f49]">
              Reader notes
            </p>

            <div
              role="heading"
              aria-level={2}
              className="max-w-md text-4xl font-semibold leading-[1.05] tracking-tight text-[#1d252f] md:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Less praise. More proof from the reading flow.
            </div>

            <p className="mt-6 max-w-sm text-base leading-7 text-slate-600">
              Feedback is shown like the product is used: page by page, session
              by session, without fake company titles.
            </p>

            <div className="mt-8 space-y-3 border-y border-slate-900/10 py-5">
              {checkpoints.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1d252f] text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1d252f]">{label}</p>
                    <p className="text-sm text-slate-500">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div
          className="w-full space-y-4 lg:ml-auto lg:w-[54%] lg:pt-2"
        >
          {readerNotes.map((note) => {
            const Icon = note.icon;

            return (
              <article
                key={note.reader}
                className="rn-testimonial-card grid gap-5 rounded-[22px] border border-slate-900/10 bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(29,37,47,0.07)] transition-[border-color,transform] duration-300 hover:translate-x-1 hover:border-slate-900/20 sm:grid-cols-[150px_1fr] sm:p-6"
              >
                <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-start sm:justify-between">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1d252f] text-white shadow-[0_12px_30px_rgba(29,37,47,0.18)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1d252f]">
                      {note.reader}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {note.context}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-900/10 pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                  <Quote className="mb-4 h-5 w-5 text-[#b85f49]" />
                  <p className="text-[15px] leading-7 text-slate-700">
                    {note.quote}
                  </p>
                  <div className="mt-5 inline-flex items-center rounded-full border border-slate-900/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#b85f49]">
                    {note.detail}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
