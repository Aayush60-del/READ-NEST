import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  Library,
  Moon,
  Sparkles,
  Sun,
  Trophy,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import api, { ENDPOINTS, getStoredSession } from '@/lib/api';
import { buildLast7Days, getReadDateSet, toDateKey } from '@/lib/readingInsights';
import BookCover from '@/components/books/BookCover';
import BookCard from '@/components/books/BookCard';

const getGreetingMeta = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning',
      subtitle: 'Start your day with a few thoughtful pages.',
      mood: 'morning',
      visualType: 'sunrise',
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      subtitle: 'Take a calm reading break and keep your momentum.',
      mood: 'afternoon',
      visualType: 'desk',
    };
  }

  return {
    greeting: 'Good evening',
    subtitle: 'A reader today, a leader tomorrow.',
    mood: 'night',
    visualType: 'moon',
  };
};

const unwrapPayload = (response, fallback) => response?.data?.data ?? response?.data ?? response ?? fallback;

const getBookId = (book) => book?.bookId || book?.book?._id || book?._id;
const getBookTitle = (book) => book?.title || book?.book?.title || 'Untitled book';
const getBookAuthor = (book) => book?.author || book?.book?.author || 'Unknown author';
const getBookCover = (book) =>
  book?.coverImage || book?.coverUrl || book?.image || book?.thumbnail || book?.book?.coverImage;

const getProgress = (book) => {
  const value = book?.percentageCompleted ?? book?.progress ?? 0;
  return Math.min(100, Math.max(0, Number(value) || 0));
};

const getStatValue = (stats, ...keys) => {
  for (const key of keys) {
    if (stats?.[key] !== undefined && stats?.[key] !== null) return stats[key];
  }
  return 0;
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const isCurrentMonth = (value) => {
  const key = toDateKey(value);
  if (!key) return false;
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return key.startsWith(monthKey);
};

const normalizeActivityDays = (streakData) => {
  const readDates = Array.isArray(streakData?.readDates) ? streakData.readDates : [];
  const last7Days = Array.isArray(streakData?.last7Days) ? streakData.last7Days : [];

  if (readDates.length) {
    return buildLast7Days(readDates);
  }

  if (last7Days.length) {
    return last7Days.map((day) => ({
      date: day.date,
      dayLabel: day.dayLabel || '',
      isToday: Boolean(day.isToday),
      read: Boolean(day.read),
    }));
  }

  return [];
};

const GlassCard = ({ children, className = '' }) => (
  <section
    className={`rounded-[28px] border border-[#e8e4db] bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] ${className}`}
  >
    {children}
  </section>
);

const GreetingVisual = ({ mood }) => {
  const isMorning = mood === 'morning';
  const isAfternoon = mood === 'afternoon';

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden rounded-r-[28px] md:block">
      <div
        className={`absolute inset-0 ${isMorning
            ? 'bg-[radial-gradient(circle_at_56%_30%,rgba(255,196,107,0.55),transparent_18%),linear-gradient(140deg,rgba(255,161,94,0.22),rgba(8,13,24,0.02)_48%,rgba(7,11,18,0.84))]'
            : isAfternoon
              ? 'bg-[radial-gradient(circle_at_55%_25%,rgba(255,205,130,0.5),transparent_17%),linear-gradient(140deg,rgba(201,123,107,0.22),rgba(11,17,27,0.2)_52%,rgba(7,11,18,0.82))]'
              : 'bg-[radial-gradient(circle_at_58%_28%,rgba(212,226,255,0.35),transparent_13%),linear-gradient(140deg,rgba(22,33,56,0.38),rgba(7,11,18,0.9))]'
          }`}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 220" fill="none" aria-hidden="true">
        {isMorning || isAfternoon ? (
          <>
            <circle cx="238" cy="56" r={isMorning ? 28 : 24} fill={isMorning ? '#ffd08a' : '#ffbe72'} opacity="0.95" />
            <path d="M52 124c28-10 47-10 74 0 24 9 52 9 80 0 30-10 59-9 88 3v93H52v-96Z" fill="#111827" opacity="0.55" />
            <path d="M88 130h92c10 0 18 8 18 18v34H70v-34c0-10 8-18 18-18Z" fill="#1b2435" />
            <path d="M118 102h76c5 0 9 4 9 9v42H109v-42c0-5 4-9 9-9Z" fill="#26344a" />
            <path d="M126 113h68v31h-68z" fill="#ffe0b8" opacity="0.28" />
            <path d="M222 144c14-23 39-18 45 5-14 3-28 3-45-5Z" fill="#c97b6b" opacity="0.78" />
            <path d="M266 111c16 11 20 27 12 48-13-16-17-31-12-48Z" fill="#6fc2a4" opacity="0.55" />
            <path d="M70 70c16-13 36-13 52 0M44 90c20-11 43-10 63 0" stroke="#f8d7bd" strokeWidth="5" strokeLinecap="round" opacity="0.28" />
          </>
        ) : (
          <>
            <circle cx="244" cy="52" r="23" fill="#dbeafe" />
            <circle cx="255" cy="45" r="23" fill="#111827" />
            {[72, 104, 147, 287, 315].map((x, index) => (
              <circle key={x} cx={x} cy={index % 2 ? 54 : 78} r={index % 2 ? 1.8 : 1.3} fill="#f8d7bd" opacity="0.75" />
            ))}
            <path d="M18 151c38-45 82-46 132-5 38-33 91-30 134 6 28-23 52-24 76-2v70H18v-69Z" fill="#111827" opacity="0.82" />
            <path d="M178 99c18 0 33 15 33 34v22h-66v-22c0-19 15-34 33-34Z" fill="#0a0f1a" />
            <path d="M150 145c28-15 54-15 82 0v20c-28-15-54-15-82 0v-20Z" fill="#c97b6b" />
            <path d="M192 121c15 9 24 22 27 39" stroke="#ffe0b8" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  );
};

const HeroCard = ({ displayName }) => {
  const meta = getGreetingMeta();

  return (
    <GlassCard className="relative min-h-[176px] overflow-hidden p-5 sm:min-h-[196px] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(201,123,107,0.13),transparent_32%)]" />
      <GreetingVisual mood={meta.mood} visualType={meta.visualType} />
      <div className="relative z-10 max-w-xl">
        <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e8e4db] bg-white text-[#c96f5c] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#ffb097] md:hidden">
          {meta.mood === 'night' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827] dark:text-white sm:text-4xl">
          {meta.greeting}, <span className="text-[#ff7a4f]">{displayName}</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">{meta.subtitle}</p>
      </div>
    </GlassCard>
  );
};

const StreakCard = ({ streak, activityDays, hasStreakData, loading }) => {
  if (loading) return <SkeletonCard className="min-h-[196px]" />;

  return (
    <GlassCard className="min-h-[176px] p-5 sm:min-h-[196px] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Reading Streak</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#111827] dark:text-white sm:mt-4">{streak} days</h2>
          <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            {streak > 0 ? "Amazing! You're on fire." : 'Start reading to build your streak.'}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#ff7a4f]/20 bg-[#ff7a4f]/10 text-[#ff9c7a]">
          <Flame className="h-5 w-5" />
        </div>
      </div>

      {hasStreakData && activityDays.length ? (
        <div className="mt-6 grid grid-cols-7 gap-2 sm:mt-7">
          {activityDays.slice(-7).map((day, index) => (
            <div key={`${day.date || day.dayLabel}-${index}`} className="flex flex-col items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full border text-[11px] ${day.read
                    ? 'border-[#ff9c7a]/35 bg-[#ff7a4f] text-white shadow-[0_0_18px_rgba(255,122,79,0.34)]'
                    : 'border-black/10 bg-black/[0.04] text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-600'
                  }`}
              >
                {day.read ? <Flame className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-500">{day.dayLabel?.slice(0, 1) || '-'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-3xl border border-black/10 bg-black/[0.03] p-4 text-sm text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
          Read 5 pages to light up your first day.
        </div>
      )}
    </GlassCard>
  );
};

const ContinueReadingCard = ({ book, loading }) => {
  if (loading) return <SkeletonCard className="min-h-[246px]" />;

  if (!book) {
    return (
      <EmptyState
        icon={Library}
        title="No active book yet"
        message="Start a book to see your reading progress here."
        cta="Explore Books"
        to="/discover"
        className="min-h-[246px]"
      />
    );
  }

  const title = getBookTitle(book);
  const author = getBookAuthor(book);
  const progress = getProgress(book);
  const currentPage = Number(book?.currentPage || 0);
  const totalPages = Number(book?.totalPages || book?.book?.totalPages || 0);
  const bookId = getBookId(book);

  return (
    <GlassCard className="min-h-[246px] p-5 sm:p-6">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Continue Reading</p>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <div className="relative mx-auto h-[140px] w-[94px] shrink-0 overflow-hidden rounded-xl border border-black/10 bg-[#f4eadf] shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#1c2535] dark:shadow-black/30 sm:mx-0 sm:h-[150px] sm:w-[100px]">
          <BookCover
            src={getBookCover(book)}
            title={title}
            author={author}
            rounded="rounded-xl"
            imageClassName="object-contain bg-[#1c2535]"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-[#111827] dark:text-white sm:text-xl">{title}</h2>
            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">{author}</p>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-semibold text-slate-500">
                {currentPage || '-'}{totalPages ? ` / ${totalPages}` : ''} pages
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/[0.08]">
              <div className="h-full rounded-full bg-[#ff7a4f] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-sm font-semibold text-[#111827] dark:text-white">{progress}%</div>
          </div>

          <Link
            to={bookId ? `/books/${bookId}/read` : '/library'}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#ff7a4f]/12 px-5 py-3 text-xs font-bold text-[#ff9c7a] transition hover:bg-[#ff7a4f] hover:text-white"
          >
            Resume Reading
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

const ActivityCard = ({ stats, activityDays, activeDaysThisMonth, loading }) => {
  if (loading) return <SkeletonCard className="min-h-[246px]" />;

  const pagesRead = getStatValue(stats, 'totalPagesRead', 'pagesRead');
  const booksCompleted = getStatValue(stats, 'CompletedBooks', 'completedBooks');
  const hasActivity = activityDays.some((day) => day.read);

  return (
    <GlassCard className="min-h-[246px] p-5 sm:p-6">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">This Month</p>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {[
          { label: 'Active Days', value: activeDaysThisMonth },
          { label: 'Pages Read', value: formatNumber(pagesRead) },
          { label: 'Books Done', value: formatNumber(booksCompleted) },
        ].map((item) => (
          <div key={item.label}>
            <div className="text-2xl font-semibold text-[#111827] dark:text-white">{item.value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>

      {hasActivity ? (
        <div className="mt-7 flex h-[86px] items-end gap-2">
          {activityDays.map((day, index) => (
            <div key={`${day.date}-${index}`} className="flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${day.read
                    ? 'bg-gradient-to-t from-[#ff7a4f] to-[#ffc19c] shadow-[0_0_18px_rgba(255,122,79,0.22)]'
                    : 'bg-black/[0.08] dark:bg-white/[0.06]'
                  }`}
                style={{ height: day.read ? '72%' : '12%' }}
                title={day.date}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7 grid h-[86px] place-items-center rounded-3xl border border-dashed border-black/10 bg-black/[0.03] px-4 text-center text-sm text-slate-500 dark:border-white/[0.1] dark:bg-white/[0.03]">
          Read at least 5 pages to start building activity.
        </div>
      )}
    </GlassCard>
  );
};

const StatCard = ({ icon: Icon, label, value, loading, accent = false }) => (
  <GlassCard className="min-h-[126px] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.14]">
    <div className="flex h-full flex-col justify-between gap-5">
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl ${accent ? 'bg-[#ff7a4f]/12 text-[#c96f5c] dark:text-[#ff9c7a]' : 'bg-black/[0.05] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400'
          }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className={accent ? 'text-3xl font-semibold text-[#c96f5c] dark:text-[#ff9c7a]' : 'text-3xl font-semibold text-[#111827] dark:text-white'}>
          {loading ? '-' : value}
        </div>
        <div className="mt-1 text-[11px] font-semibold text-slate-500">{label}</div>
      </div>
    </div>
  </GlassCard>
);

const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[28px] border border-[#e8e4db] bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.05] ${className}`} />
);

const EmptyState = ({ icon: Icon = BookOpen, title, message, cta, to, className = '' }) => (
  <GlassCard className={`flex flex-col items-center justify-center p-7 text-center ${className}`}>
    <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-[#ff7a4f]/20 bg-[#ff7a4f]/10 text-[#ff9c7a]">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="text-lg font-semibold text-[#111827] dark:text-white">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">{message}</p>
    {to && cta ? (
      <Link
        to={to}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#ff7a4f] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#e9683f]"
      >
        {cta}
      </Link>
    ) : null}
  </GlassCard>
);

const OverviewPage = () => {
  const { user } = getStoredSession();
  const displayName = user?.name || 'Reader';

  const [continueReading, setContinueReading] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [recentBooks, setRecentBooks] = React.useState([]);
  const [streakData, setStreakData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const recentScrollRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [crRes, statsRes, booksRes, streakRes] = await Promise.all([
          api.get(ENDPOINTS.BOOKS.CONTINUE_READING),
          api.get(ENDPOINTS.BOOKS.STATS),
          api.get(ENDPOINTS.BOOKS.LIST),
          api.get(ENDPOINTS.BOOKS.STREAK),
        ]);

        setContinueReading(unwrapPayload(crRes, []));
        setStats(unwrapPayload(statsRes, null));
        setRecentBooks(unwrapPayload(booksRes, []));
        setStreakData(unwrapPayload(streakRes, null));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentBook = Array.isArray(continueReading) ? continueReading[0] : null;
  const books = Array.isArray(recentBooks) ? recentBooks : [];
  const streak = Number(streakData?.streak || streakData?.currentStreak || 0);
  const readDates = Array.isArray(streakData?.readDates) ? streakData.readDates : [];
  const activityDays = normalizeActivityDays(streakData);
  const readSet = getReadDateSet(readDates);
  const activeDaysThisMonth = [...readSet].filter(isCurrentMonth).length;
  const hasStreakData = Boolean(streakData && (streak > 0 || readDates.length || activityDays.some((day) => day.read)));
  const pagesRead = getStatValue(stats, 'totalPagesRead', 'pagesRead');
  const booksCompleted = getStatValue(stats, 'CompletedBooks', 'completedBooks');
  const completionRate = getStatValue(stats, 'CompletionRate', 'completionRate');

  const scrollRecentlyAdded = (direction) => {
    recentScrollRef.current?.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111827] transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
      <Sidebar />

      <main className="min-h-screen w-full min-w-0 overflow-x-hidden pb-28 transition-all duration-300 ease-in-out lg:ml-[256px] lg:pb-12">
        <DashboardNavbar />

        <div className="relative ml-0 mr-auto w-full max-w-[1240px] px-4 pb-8 pt-2 sm:px-10 sm:pt-3">
          <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#c97b6b]/12 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-52 h-80 w-80 rounded-full bg-[#f2b66d]/10 blur-3xl dark:bg-[#315b8f]/10" />

          <div className="relative z-10 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <HeroCard displayName={displayName} />
            <StreakCard streak={streak} activityDays={activityDays} hasStreakData={hasStreakData} loading={loading} />
          </div>

          <div className="relative z-10 mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
            <ContinueReadingCard book={currentBook} loading={loading} />
            <ActivityCard
              stats={stats}
              activityDays={activityDays}
              activeDaysThisMonth={activeDaysThisMonth}
              loading={loading}
            />
          </div>

          <section className="relative z-10 mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            <StatCard icon={FileText} label="Pages Read" value={formatNumber(pagesRead)} loading={loading} />
            <StatCard icon={Trophy} label="Books Completed" value={formatNumber(booksCompleted)} loading={loading} />
            <StatCard icon={Flame} label="Current Streak" value={streak} loading={loading} accent />
            <StatCard icon={Sparkles} label="Completion Rate" value={`${completionRate}%`} loading={loading} />
          </section>

          <section className="relative z-10 mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#ff9c7a]">Library</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111827] dark:text-white">Recently Added</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollRecentlyAdded(-1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e4db] bg-white/70 text-slate-500 transition hover:border-[#c97b6b]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-[#ff7a4f]/40 dark:hover:text-[#ff9c7a]"
                  aria-label="Scroll recently added left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRecentlyAdded(1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e4db] bg-white/70 text-slate-500 transition hover:border-[#c97b6b]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-[#ff7a4f]/40 dark:hover:text-[#ff9c7a]"
                  aria-label="Scroll recently added right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-hidden pb-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonCard key={index} className="h-[320px] w-[145px] shrink-0 sm:w-[180px] lg:w-[210px]" />
                ))}
              </div>
            ) : books.length > 0 ? (
              <div ref={recentScrollRef} className="scrollbar-hide flex gap-4 overflow-x-auto pb-3 scroll-smooth md:gap-6">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} to={`/books/${book._id}`} variant="compact" />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No books added yet"
                message="Your recently added books will appear here as soon as the library has content."
                cta="Explore Books"
                to="/discover"
                className="min-h-[220px]"
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
