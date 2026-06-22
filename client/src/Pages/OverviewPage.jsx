import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { BookOpen, FileText, ChevronLeft, ChevronRight, Flame, Trophy, Zap, ArrowUpRight } from 'lucide-react';
import api, { ENDPOINTS, getStoredSession } from '@/lib/api';
import { Link } from 'react-router-dom';
import { buildLast7Days } from '@/lib/readingInsights';
import BookCover from '@/components/books/BookCover';

// --- Helpers ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// --- Streak Flame Component ---
const StreakFlame = ({ count }) => {
  const size = count >= 30 ? 'w-12 h-12' : count >= 7 ? 'w-10 h-10' : 'w-9 h-9';
  const glow = count >= 30
    ? 'drop-shadow-[0_0_18px_rgba(249,115,22,0.8)]'
    : count >= 7
    ? 'drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]'
    : '';

  return (
    <div className={`${size} ${glow} rounded-full bg-orange-500/15 text-orange-500 flex items-center justify-center transition-all duration-500`}>
      <Flame
        className="w-[70%] h-[70%]"
        style={{ animation: count >= 7 ? 'flamePulse 2s ease-in-out infinite' : 'none' }}
      />
    </div>
  );
};

// --- Empty State ---
const EmptyCard = ({ message, linkTo, linkText }) => (
  <div className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-transparent rounded-[24px] p-10 flex flex-col items-center justify-center shadow-lg mb-12 min-h-[200px] transition-colors duration-300 gap-4">
    <BookOpen className="w-10 h-10 text-black/20 dark:text-white/20" />
    <p className="text-black/50 dark:text-white/50 text-center font-serif text-lg">{message}</p>
    {linkTo && (
      <Link
        to={linkTo}
        className="px-6 py-2.5 rounded-xl bg-[#c97b6b] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#b8695c] transition-colors"
      >
        {linkText}
      </Link>
    )}
  </div>
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
        setContinueReading(crRes?.data || []);
        setStats(statsRes?.data || null);
        setRecentBooks(booksRes?.data || []);
        setStreakData(streakRes?.data || null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const streak = streakData?.streak || 0;
  const readDates = streakData?.readDates || [];
  const last7Days = streakData?.last7Days?.length ? streakData.last7Days : buildLast7Days(readDates);

  const scrollRecentlyAdded = (direction) => {
    recentScrollRef.current?.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-black dark:text-[#e4e2e1] font-sans flex transition-colors duration-300">
      <style>{`
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes streakCelebrate {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
      `}</style>

      <Sidebar />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen">
        <DashboardNavbar />

        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-10 py-6 sm:py-10 pb-32">

          {/* Welcome Header */}
          <div className="mb-10 sm:mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-black/40 dark:text-white/40 mb-2 transition-colors duration-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl sm:text-[2.75rem] font-serif font-bold text-black dark:text-white mb-2 transition-colors duration-300 leading-tight">
              {getGreeting()},{' '}
              <span className="text-[#c97b6b] dark:text-[#e8a898]">{displayName}</span>{' '}
              <span className="inline-block origin-bottom-right rotate-12"></span>
            </h1>
            <p className="text-base text-black/50 dark:text-white/50 transition-colors duration-300">
              Ready for your next chapter? Keep up the momentum.
            </p>
          </div>

          {/* Continue Reading */}
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-serif font-bold text-black dark:text-white transition-colors duration-300">Continue Reading</h2>
            <Link to="/library" className="text-xs font-bold tracking-[0.15em] text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 uppercase">
              Full Library <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-[#161d27] rounded-[24px] mb-12 min-h-[200px] animate-pulse transition-colors duration-300" />
          ) : continueReading.length > 0 ? (
            <div className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-transparent rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-lg mb-12 min-h-[320px] transition-colors duration-300">
              {/* Cover */}
              <div className="w-full md:w-[34%] h-[320px] md:h-auto relative overflow-hidden bg-gradient-to-br from-[#122e22] via-[#10251b] to-[#07120d]">
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                  <div className="h-[88%] aspect-[2/3] max-w-[76%] shadow-2xl rounded-xl bg-[#142e22] border border-white/10 flex items-center justify-center overflow-hidden">
                    <BookCover
                      src={continueReading[0].coverImage}
                      title={continueReading[0].title}
                      author={continueReading[0].author}
                      priority
                      rounded="rounded-xl"
                      imageClassName="object-contain bg-[#10251b] opacity-95"
                    />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="w-full md:w-[62%] p-6 md:p-10 flex flex-col justify-between gap-6 md:gap-0">
                <div>
                  <span className="bg-[#fcf0ec] dark:bg-[#42221e] text-[#c97b6b] text-[10px] font-bold px-2.5 py-1 rounded tracking-wider uppercase inline-block mb-4">
                    CURRENTLY READING
                  </span>
                  <h3 className="text-2xl md:text-4xl leading-tight font-serif text-[#0f1419] dark:text-[#f2e6d8] mb-1 transition-colors duration-300">
                    {continueReading[0].title}
                  </h3>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider mb-2">Progress</div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl font-serif text-black dark:text-white">{continueReading[0].percentageCompleted}%</span>
                      <span className="text-xs text-black/50 dark:text-white/50">{continueReading[0].currentPage} / {continueReading[0].totalPages} Pages</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c97b6b] rounded-full transition-all duration-500"
                        style={{ width: `${continueReading[0].percentageCompleted}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/books/${continueReading[0].bookId}/read`}
                    className="w-full bg-[#3b2a1a] dark:bg-[#d6d4d0] hover:opacity-80 text-white dark:text-black font-bold text-sm tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16"><path d="M4 2v12l10-6z" /></svg>
                    CONTINUE READING
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <EmptyCard
              message="You're not reading any books yet."
              linkTo="/discover"
              linkText="Find a book"
            />
          )}

          {/* Stats & Streak Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
            {/* Stats */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-transparent p-6 rounded-[24px] flex flex-col justify-center min-h-[140px] transition-colors duration-300">
                <BookOpen className="w-5 h-5 text-black/40 dark:text-white/40 mb-3" />
                <div className="text-4xl font-serif text-black dark:text-white mb-1">{loading ? '-' : stats?.CompletedBooks ?? 0}</div>
                <div className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Books Completed</div>
              </div>
              <div className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-transparent p-6 rounded-[24px] flex flex-col justify-center min-h-[140px] transition-colors duration-300">
                <FileText className="w-5 h-5 text-black/40 dark:text-white/40 mb-3" />
                <div className="text-4xl font-serif text-black dark:text-white mb-1">{loading ? '-' : stats?.totalPagesRead ?? 0}</div>
                <div className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Pages Read</div>
              </div>
            </div>

            {/* Streak Widget */}
            <div className="md:col-span-8 bg-[#f5efdf] dark:bg-[#1f1e1d] border border-[#e8e4db] dark:border-transparent rounded-[24px] p-6 md:p-8 flex flex-col justify-between transition-colors duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <StreakFlame count={streak} />
                    <div>
                      <h3 className="text-4xl font-serif text-black dark:text-white leading-none">
                        Day {streak}
                      </h3>
                      <p className="text-[10px] text-[#c97b6b] dark:text-[#e8a898] font-bold tracking-widest uppercase mt-1">
                        {streak === 0 ? 'Start your streak today' : streak >= 30 ? 'Legendary Streak!' : streak >= 7 ? 'On fire!' : 'Reading Streak'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Calendar */}
              <div className="flex justify-between items-center mb-6 gap-1 sm:gap-2">
                {(last7Days.length > 0 ? last7Days : Array.from({ length: 7 }, (_, i) => ({
                  dayLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
                  read: false,
                  isToday: i === 6,
                }))).map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">{day.dayLabel}</span>
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center transition-all duration-300 ${
                      day.read
                        ? 'bg-[#c97b6b] dark:bg-[#e8a898] shadow-md'
                        : day.isToday
                        ? 'border-2 border-[#c97b6b]/40 dark:border-[#e8a898]/30 bg-white/60 dark:bg-white/5'
                        : 'bg-white dark:bg-white/5 border border-[#e8e4db] dark:border-transparent'
                    }`}>
                      {day.read ? (
                        <Flame className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" style={{ animation: "flamePulse 2s ease-in-out infinite" }} />
                      ) : day.isToday ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c97b6b]/60 dark:bg-[#e8a898]/60" />
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Streak Level Info */}
              <div className="bg-white/60 dark:bg-[#0f1419]/50 border border-[#e8e4db] dark:border-transparent rounded-[16px] p-4 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      streak >= 30 ? 'bg-amber-500/20 text-amber-500' :
                      streak >= 7 ? 'bg-orange-500/20 text-orange-500' :
                      'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40'
                    }`}>
                      {streak >= 30 ? (
                        <Trophy className="w-4 h-4" />
                      ) : streak >= 7 ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black dark:text-white">
                        {streak >= 30 ? 'Legendary' : streak >= 7 ? 'On Fire' : 'Building Habit'}
                      </p>
                      <p className="text-[10px] text-black/40 dark:text-white/40 font-medium">
                        {streak >= 30
                          ? 'You are in the top tier of readers'
                          : streak >= 7
                          ? `${30 - streak} days to legendary status`
                          : streak === 0
                          ? 'Read today to start your streak'
                          : `${7 - streak} more days to reach On Fire`}
                      </p>
                    </div>
                  </div>
                  <Link to="/stats" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c97b6b] tracking-widest uppercase hover:opacity-70 transition-opacity">
                    Stats <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Added */}
          {!loading && (
            <div className="mb-14">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-serif font-bold text-black dark:text-[#f2e6d8] transition-colors duration-300">Recently Added</h2>
                <div className="flex gap-2">
                  <button onClick={() => scrollRecentlyAdded(-1)} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black/50 dark:text-white/50" aria-label="Scroll recently added left">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollRecentlyAdded(1)} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black/50 dark:text-white/50" aria-label="Scroll recently added right">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {recentBooks.length > 0 ? (
                <div ref={recentScrollRef} className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-3 scroll-smooth">
                  {recentBooks.map((book) => (
                    <Link key={book._id} to={`/books/${book._id}`} className="group block min-w-[155px] sm:min-w-[185px] md:min-w-[220px] max-w-[240px]">
                      <div className="aspect-[3/4] bg-[#d3bca8] dark:bg-[#243040] rounded-xl mb-4 overflow-hidden relative shadow-md transition-shadow hover:shadow-xl">
                        <BookCover
                          src={book.coverImage}
                          title={book.title}
                          author={book.author}
                          rounded="rounded-xl"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h4 className="font-serif text-black dark:text-[#f2e6d8] text-sm mb-1 truncate group-hover:text-[#c97b6b] transition-colors">{book.title}</h4>
                      <p className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest truncate">{book.author}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyCard
                  message="No books in the library yet."
                  linkTo="/discover"
                  linkText="Discover books"
                />
              )}
            </div>
          )}

          {/* Discover CTA */}
          <div className="bg-gradient-to-br from-[#3b2a1a] to-[#2a1d12] dark:from-[#1c2535] dark:to-[#141b28] rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-2 text-center md:text-left">Ready to discover something new?</h2>
              <p className="text-white/50 text-sm text-center md:text-left">Browse the entire library and add books to your collection.</p>
            </div>
            <Link
              to="/discover"
              className="w-full md:w-auto text-center px-8 py-4 rounded-xl bg-[#c97b6b] hover:bg-[#b8695c] text-white font-bold text-sm tracking-widest uppercase transition-all shrink-0 shadow-lg hover:shadow-[0_8px_30px_rgba(201,123,107,0.3)]"
            >
              Browse Library
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OverviewPage;




