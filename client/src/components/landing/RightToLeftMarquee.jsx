import {
  BookOpen,
  Bookmark,
  Flame,
  LibraryBig,
  NotebookPen,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const marqueeItems = [
  { label: "Immersive Reader", Icon: BookOpen },
  { label: "Reading Streaks", Icon: Flame },
  { label: "Smart Library", Icon: LibraryBig },
  { label: "Bookmarks", Icon: Bookmark },
  { label: "Notes & Highlights", Icon: NotebookPen },
  { label: "Progress Tracking", Icon: TrendingUp },
  { label: "Calm Reading Flow", Icon: Sparkles },
];

const RightToLeftMarquee = () => {
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <section className="relative overflow-hidden bg-[#f6f4ef] border-y border-slate-200 py-8">
      <div className="absolute left-0 top-0 z-10 h-full w-28 bg-gradient-to-r from-[#f6f4ef] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-28 bg-gradient-to-l from-[#f6f4ef] to-transparent pointer-events-none" />

      <div className="marquee-track flex w-max gap-4">
        {items.map(({ label, Icon }, index) => (
          <div
            key={`${label}-${index}`}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-6 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Icon className="h-4 w-4" />
            </span>

            <span
              className="whitespace-nowrap text-sm font-black uppercase tracking-[0.18em] text-slate-800"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RightToLeftMarquee;

