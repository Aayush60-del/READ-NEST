import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  Library,
  Target,
  Trophy,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import api, { ENDPOINTS, getStoredSession } from '@/lib/api';
import { buildLast7Days } from '@/lib/readingInsights';
import BookCover from '@/components/books/BookCover';
import BookCard from '@/components/books/BookCard';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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

const getTodayLabel = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

const StatCard = ({ icon: Icon, label, value, loading, accent = false }) => (
  <div
    className={`group flex min-h-[144px] flex-col justify-between rounded-[28px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
      accent
        ? 'border-[#c97b6b]/25 bg-[#fff4ef] shadow-[#c97b6b]/5 dark:bg-[#241714]'
        : 'border-[#e8e4db] bg-white shadow-black/[0.03] dark:border-white/5 dark:bg-[#161d27]'
    }`}
  >
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
        accent
          ? 'bg-[#c97b6b]/12 text-[#c97b6b]'
          : 'bg-black/[0.04] text-black/45 dark:bg-white/[0.06] dark:text-white/50'
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>

    <div>
      <div className={`text-3xl font-semibold ${accent ? 'text-[#c97b6b]' : 'text-black dark:text-white'}`}>
        {loading ? '-' : value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
        {label}
      </div>
    </div>
  </div>
);

const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[28px] border border-[#e8e4db] bg-white/70 dark:border-white/5 dark:bg-[#161d27]/70 ${className}`} />
);

const EmptyState = ({ icon: Icon = BookOpen, title, message, cta, to }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d7cfc4] bg-white/70 p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#161d27]/70">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c97b6b]/10 text-[#c97b6b]">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="text-lg font-semibold text-black dark:text-white">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-black/55 dark:text-white/55">{message}</p>
    {to && cta ? (
      <Link
        to={to}
        className="mt-5 rounded-2xl bg-[#c97b6b] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b8695c]"
      >
        {cta}
      </Link>
    ) : null}
  </div>
);

const ContinueReadingHero = ({ book, loading }) => {
  if (loading) {
    return <SkeletonCard className="min-h-[430px] lg:min-h-[500px]" />;
  }

  if (!book) {
    return (
      <EmptyState
        icon={Library}
        title="No active book yet"
        message="Start a book from Discover and it will appear here when you are ready to continue."
        cta="Explore books"
        to="/discover"
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
    <section className="overflow-hidden rounded-[32px] border border-[#e8e4db] bg-white shadow-[0_24px_80px_rgba(31,41,55,0.08)] dark:border-white/5 dark:bg-[#161d27] dark:shadow-black/20">
      <div className="grid min-h-[430px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[#f2e8dc] p-8 dark:bg-[#111827]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(201,123,107,0.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent)] dark:bg-[radial-gradient(circle_at_28%_22%,rgba(201,123,107,0.22),transparent_34%)]" />
          <div className="relative aspect-[2/3] h-[260px] max-h-[80%] overflow-hidden rounded-2xl border border-white/50 bg-[#d3bca8] shadow-2xl dark:border-white/10 dark:bg-[#1c2535] sm:h-[320px]">
            <BookCover
              src={getBookCover(book)}
              title={title}
              author={author}
              priority
              rounded="rounded-2xl"
              imageClassName="object-contain bg-[#f2e8dc] dark:bg-[#1c2535]"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-[#c97b6b]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#c97b6b]">
              Continue reading
            </span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-black dark:text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm font-medium text-black/55 dark:text-white/55">{author}</p>
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                  Progress
                </p>
                <p className="mt-1 text-3xl font-semibold text-black dark:text-white">{progress}%</p>
              </div>
              <p className="text-right text-xs font-semibold text-black/50 dark:text-white/50">
                {currentPage || '-'}{totalPages ? ` / ${totalPages}` : ''} pages
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-[#c97b6b] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <Link
            to={bookId ? `/books/${bookId}/read` : '/library'}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#3b2a1a] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2f2115] dark:bg-[#d6d4d0] dark:text-black dark:hover:bg-white"
          >
            Resume Reading
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const StreakCard = ({ streak, last7Days, hasStreakData, loading }) => {
  if (loading) return <SkeletonCard className="min-h-[240px]" />;

  return (
    <section className="rounded-[32px] border border-[#e8e4db] bg-[#f5efdf] p-6 shadow-sm dark:border-white/5 dark:bg-[#1c2535]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c97b6b]">Today</p>
          <h2 className="mt-3 text-3xl font-semibold text-black dark:text-white">{streak} day streak</h2>
          <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
            {hasStreakData ? 'Pick up your book and protect your reading rhythm.' : 'Start reading to build your streak.'}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#c97b6b]/15 text-[#c97b6b]">
          <Flame className="h-6 w-6" />
        </div>
      </div>

      {hasStreakData && last7Days.length ? (
        <div className="mt-7 grid grid-cols-7 gap-2">
          {last7Days.map((day, index) => (
            <div key={`${day.date || day.dayLabel}-${index}`} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">
                {day.dayLabel}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition-colors ${
                  day.read
                    ? 'border-[#c97b6b]/30 bg-[#c97b6b] text-white shadow-lg shadow-[#c97b6b]/20'
                    : day.isToday
                    ? 'border-[#c97b6b]/35 bg-white/70 text-[#c97b6b] dark:bg-white/5'
                    : 'border-black/5 bg-white/60 text-black/25 dark:border-white/5 dark:bg-white/5 dark:text-white/25'
                }`}
              >
                {day.read ? <Flame className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-3xl border border-[#e8e4db] bg-white/60 p-4 text-sm text-black/55 dark:border-white/5 dark:bg-black/10 dark:text-white/55">
          Read 5 pages today to count your reading day.
        </div>
      )}
    </section>
  );
};

const GoalCard = () => (
  <section className="rounded-[32px] border border-[#e8e4db] bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#161d27]">
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c97b6b]/10 text-[#c97b6b]">
        <Target className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
          Reading day
        </p>
        <h3 className="mt-2 text-xl font-semibold text-black dark:text-white">Read 5 pages today</h3>
        <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
          A small session is enough to keep your habit alive.
        </p>
      </div>
    </div>
  </section>
);

const OverviewPage = () => {
  const { user } = getStoredSession();
  const displayName = user?.name || 'Reader';

  const [continueReading, setContinueReading] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const last7Days = Array.isArray(streakData?.last7Days) && streakData.last7Days.length
    ? streakData.last7Days
    : readDates.length
    ? buildLast7Days(readDates)
    : [];
  const hasStreakData = Boolean(streakData && (streak > 0 || readDates.length || last7Days.some((day) => day.read)));

  const scrollRecentlyAdded = (direction) => {
    recentScrollRef.current?.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-black transition-colors duration-300 dark:bg-[#0f1419] dark:text-[#e4e2e1]">
      <Sidebar />

      <main className="min-h-screen w-full min-w-0 overflow-x-hidden pb-28 transition-all duration-300 ease-in-out lg:ml-[256px] lg:pb-12">
        <DashboardNavbar />

        <div className="ml-0 mr-auto w-full max-w-[1240px] px-4 pb-8 pt-4 sm:px-10 sm:pt-6">
          <section className="mb-8 flex flex-col justify-between gap-5 rounded-[32px] border border-[#e8e4db] bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#161d27]/70 sm:p-7 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8e4db] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
                <CalendarDays className="h-3.5 w-3.5 text-[#c97b6b]" />
                {getTodayLabel()}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl">
                {getGreeting()}, <span className="text-[#c97b6b]">{displayName}</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55 dark:text-white/55 sm:text-base">
                Pick up where you left off and keep your reading streak alive.
              </p>
            </div>
            <Link
              to="/discover"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#e8e4db] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:border-[#c97b6b]/40 hover:text-[#c97b6b] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              Discover books
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>

          <div className="mb-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <ContinueReadingHero book={currentBook} loading={loading} />
            <div className="grid gap-6">
              <StreakCard streak={streak} last7Days={last7Days} hasStreakData={hasStreakData} loading={loading} />
              <GoalCard />
            </div>
          </div>

          <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            <StatCard icon={FileText} label="Pages Read" value={stats?.totalPagesRead ?? 0} loading={loading} />
            <StatCard icon={Trophy} label="Books Completed" value={stats?.CompletedBooks ?? 0} loading={loading} />
            <StatCard icon={Flame} label="Current Streak" value={streak} loading={loading} accent />
            <StatCard icon={BookOpen} label="Completion Rate" value={`${stats?.CompletionRate ?? 0}%`} loading={loading} />
          </section>

          <section className="mb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c97b6b]">Library</p>
                <h2 className="mt-2 text-2xl font-semibold text-black dark:text-white">Recently Added</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollRecentlyAdded(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/50 transition hover:bg-black/5 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/10"
                  aria-label="Scroll recently added left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRecentlyAdded(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/50 transition hover:bg-black/5 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/10"
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
                  <BookCard
                    key={book._id}
                    book={book}
                    to={`/books/${book._id}`}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No books added yet"
                message="Your recently added books will appear here as soon as the library has content."
                cta="Discover books"
                to="/discover"
              />
            )}
          </section>

          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#3b2a1a] to-[#2a1d12] p-7 shadow-[0_24px_80px_rgba(59,42,26,0.16)] dark:from-[#1c2535] dark:to-[#111827] sm:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e8a898]">Next read</p>
                <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Discover your next read</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                  Explore curated books and continue building your reading habit.
                </p>
              </div>
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#c97b6b] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b8695c]"
              >
                Browse Discover
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
