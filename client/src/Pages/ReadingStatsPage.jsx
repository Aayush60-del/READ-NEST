import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { Flame, BookOpen, Clock, Zap, BarChart, Book, CalendarDays, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { ENDPOINTS } from '@/lib/api';
import { Link } from 'react-router-dom';
import { buildReadingHeatmap, getBestStreakFromDates, getReadDateSet } from '@/lib/readingInsights';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';
import StreakCelebration from '@/components/streak/StreakCelebration';
import { useStreakCelebration } from '@/hooks/useStreakCelebration';

const StatCard = ({ icon: Icon, label, value, helper, accent = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`rounded-[28px] p-5 md:p-6 border shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${accent
            ? 'bg-[#fff4ef] dark:bg-[#241714] border-[#c97b6b]/25 shadow-[#c97b6b]/5'
            : 'bg-white dark:bg-[#161d27] border-[#e8e4db] dark:border-white/5 shadow-black/[0.03]'
            }`}
    >
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#c97b6b]/10 blur-2xl" />
        <div className="relative z-10 flex min-h-[138px] flex-col justify-between">
            <AnimateIcon animateOnView animateOnHover animation={accent ? 'pulse' : 'float'}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent ? 'bg-[#c97b6b]/12 text-[#c97b6b]' : 'bg-black/[0.04] text-black/45 dark:bg-white/[0.06] dark:text-white/50'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </AnimateIcon>
            <div>
                <div className={`text-3xl md:text-4xl font-semibold ${accent ? 'text-[#c97b6b]' : 'text-black dark:text-white'}`}>{value}</div>
                <div className={`text-[10px] font-bold tracking-widest uppercase ${accent ? 'text-[#c97b6b]/70' : 'text-black/40 dark:text-white/40'}`}>{label}</div>
                {helper ? (
                    <p className="mt-2 text-xs leading-5 text-black/45 dark:text-white/45">{helper}</p>
                ) : null}
            </div>
        </div>
    </motion.div>
);

const LoadingBlock = ({ className = '' }) => (
    <div className={`animate-pulse rounded-[28px] border border-[#e8e4db] bg-white/70 dark:border-white/5 dark:bg-[#161d27]/70 ${className}`} />
);



const formatHeatmapDayLabel = (dateValue) => {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const formatHeatmapMonthLabel = (dateValue) => {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", { month: "short" });
};

const formatHeatmapFullLabel = (dateValue) => {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatHeatmapRangeLabel = (days = []) => {
  const flatDays = days.flat ? days.flat().filter(Boolean) : [];
  if (!flatDays.length) return "Last 30 days";

  const first = flatDays[0]?.date;
  const last = flatDays[flatDays.length - 1]?.date;

  if (!first || !last) return "Last 30 days";

  return `${formatHeatmapFullLabel(first)} - ${formatHeatmapFullLabel(last)}`;
};

const ReadingStatsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [streakData, setStreakData] = useState(null);
    const streakCelebration = useStreakCelebration();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, streakRes] = await Promise.all([
                    api.get(ENDPOINTS.BOOKS.STATS),
                    api.get(ENDPOINTS.BOOKS.STREAK)
                ]);
                setStats(statsRes?.data?.data || statsRes?.data || null);
                setStreakData(streakRes?.data?.data || streakRes?.data || null);
            } catch (err) {
                console.error("Failed to fetch reading stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const booksRead = stats?.CompletedBooks || 0;
    const pagesRead = stats?.totalPagesRead || 0;
    const currentlyReading = stats?.CurrentlyReading || 0;
    const completionRate = stats?.CompletionRate || 0;
    const streak = streakData?.streak || 0;
    const readDates = streakData?.readDates || [];
    const readSet = getReadDateSet(readDates);
    const heatmapWeeks = buildReadingHeatmap(readDates, 5);
    const heatmap = heatmapWeeks.flat().slice(-30);

    const heatmapRangeLabel = formatHeatmapRangeLabel(heatmap);
    const weeklyActivity = heatmapWeeks.map((week) => week.filter((day) => day.read).length);
    const activeDays = readSet.size;
    const bestStreak = Math.max(streak, getBestStreakFromDates(readDates));
    const habitScore = Math.min(100, Math.round((activeDays / 30) * 100));
    const hasData = booksRead > 0 || currentlyReading > 0 || activeDays > 0;

    const previewStreak = () => {
        streakCelebration.showStreakCelebration({
            force: true,
            previousStreak: 6,
            newStreak: 7,
            milestone: true,
            weeklyProgress: [true, true, true, true, true, true, true],
        });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-[#1a1a1a] dark:text-[#e4e2e1] font-sans flex transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
                <DashboardNavbar />

                <div className="ml-0 mr-auto max-w-[1240px] w-full px-4 sm:px-10 pt-6">
                    <div className="mb-8 rounded-[32px] border border-[#e8e4db] bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#161d27]/70 sm:p-7">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#c97b6b] mb-3">Reading Analytics</p>
                            <h1 className="text-3xl sm:text-4xl font-semibold text-black dark:text-white mb-3 tracking-tight">Your reading habit, visualized.</h1>
                            <p className="text-black/60 dark:text-white/60 text-sm md:text-base tracking-wide max-w-2xl">
                                Track your streaks, pages, books, and consistency in one calm dashboard.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#161d27] border border-[#c97b6b]/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-[#c97b6b]/5 shrink-0">
                            <div className="w-11 h-11 rounded-2xl bg-[#c97b6b]/10 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-[#c97b6b]" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold tracking-widest text-black/50 dark:text-white/50 uppercase">Current Streak</div>
                                <div className="font-serif text-2xl text-black dark:text-white">{loading ? '-' : streak} Days</div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <StatCard icon={BookOpen} label="Books Completed" value={loading ? '-' : booksRead} helper="Finished books in your library." />
                        <StatCard icon={BarChart} label="Pages Read" value={loading ? '-' : pagesRead} helper="Total saved reading progress." />
                        <StatCard icon={Clock} label="Currently Reading" value={loading ? '-' : currentlyReading} helper="Books still in progress." />
                        <StatCard icon={Zap} label="Completion Rate" value={loading ? '-' : `${completionRate}%`} helper="Based on completed books." accent />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <LoadingBlock className="min-h-[420px] xl:col-span-8" />
                            <LoadingBlock className="min-h-[420px] xl:col-span-4" />
                            <LoadingBlock className="min-h-[280px] xl:col-span-7" />
                            <LoadingBlock className="min-h-[280px] xl:col-span-5" />
                        </div>
                    ) : !hasData ? (
                        <div className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-transparent rounded-[28px] p-10 flex flex-col items-center justify-center shadow-lg min-h-[340px]">
                            <Book className="w-12 h-12 text-black/20 dark:text-white/20 mb-4" />
                            <h2 className="text-2xl font-serif text-black dark:text-white mb-2">No reading data yet</h2>
                            <p className="text-black/50 dark:text-white/50 text-center mb-6 max-w-md">Open a book and read at least 5 pages to start building your heatmap and streak.</p>
                            <Link to="/discover" className="px-6 py-3 rounded-xl bg-[#c97b6b] text-white text-sm font-bold tracking-widest uppercase hover:bg-[#b8695c] transition-colors">
                                Discover Books
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <motion.section
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                className="xl:col-span-8 bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-white/5 rounded-[28px] p-5 md:p-7 shadow-lg"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-[#c97b6b] mb-2">
                                            <CalendarDays className="w-4 h-4" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase">30-DAY MONTH VIEW</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-serif text-black dark:text-white">Consistency calendar</h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                                        <span>Less</span>

                                        <span className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 flex items-center justify-center">
                                            <Flame className="w-3.5 h-3.5 text-black/20 dark:text-white/25" />
                                        </span>

                                        <span className="w-7 h-7 rounded-full bg-[#3a2417]/80 border border-[#ff7a1a]/10 flex items-center justify-center">
                                            <Flame className="w-3.5 h-3.5 text-[#ff7a1a]/70" strokeWidth={2.5} />
                                        </span>

                                        <span className="w-7 h-7 rounded-full bg-[#3a2417] border border-[#ff7a1a]/25 flex items-center justify-center shadow-[0_0_18px_rgba(255,122,26,0.25)]">
                                            <Flame className="w-3.5 h-3.5 text-[#ff7a1a]" strokeWidth={2.8} />
                                        </span>

                                        <span>More</span>
                                    </div>
                                </div>

                                <div className="mt-5 mb-5 flex items-center justify-between gap-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/45 dark:text-white/45">
                                        {heatmapRangeLabel}
                                    </p>

                                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c97b6b]">
                                        30 days
                                    </p>
                                </div>

                                {readDates.length === 0 ? (
                                    <div className="rounded-[24px] border border-dashed border-[#d7cfc4] bg-[#fcf9f2] p-8 text-center dark:border-white/10 dark:bg-[#0f1419]/50">
                                        <CalendarDays className="mx-auto mb-3 h-8 w-8 text-[#c97b6b]" />
                                        <p className="text-sm font-semibold text-black dark:text-white">Read at least 5 pages to light up your heatmap.</p>
                                        <p className="mt-2 text-xs leading-5 text-black/50 dark:text-white/50">Your last 30 days of reading activity will appear here once progress is logged.</p>
                                    </div>
                                ) : (
                                <div className="overflow-x-auto pb-2 scrollbar-hide">
                                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 min-w-[640px] sm:min-w-0">
                                        {heatmap.map((day, index) => {
                                            const dateNumber = day.date
                                                ? Number(String(day.date).split("-")[2])
                                                : "";

                                            const monthLabel = day.date
                                                ? formatHeatmapMonthLabel(day.date)
                                                : "";

                                            const dayLabel = day.date
                                                ? formatHeatmapDayLabel(day.date)
                                                : "";

                                            const fullLabel = day.date
                                                ? formatHeatmapFullLabel(day.date)
                                                : "";

                                            return (
                                                <motion.div
                                                    key={`${day.date}-${index}`}
                                                    title={`${dayLabel}, ${fullLabel}${day.read ? ' • Reading logged' : ' • No reading logged'}`}
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                                                    className={`relative w-14 h-16 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                                                        day.read
                                                            ? 'bg-[#3a2417] border-[#ff7a1a]/30 shadow-[0_0_20px_rgba(255,122,26,0.30)]'
                                                            : day.isToday
                                                                ? 'bg-[#fff1e8] dark:bg-[#2d1d14] border-[#ff7a1a]/45'
                                                                : 'bg-black/[0.035] dark:bg-white/[0.055] border-black/5 dark:border-white/5 hover:bg-[#3a2417]/45 hover:border-[#ff7a1a]/20'
                                                    }`}
                                                >
                                                    <span
                                                        className={`text-[8px] font-black uppercase tracking-wider ${
                                                            day.read
                                                                ? 'text-[#ffb26b]'
                                                                : day.isToday
                                                                    ? 'text-[#ff7a1a]/80'
                                                                    : 'text-black/30 dark:text-white/30'
                                                        }`}
                                                    >
                                                        {dayLabel}
                                                    </span>

                                                    {day.read ? (
                                                        <Flame
                                                            className="my-1 w-5 h-5 text-[#ff7a1a] drop-shadow-[0_0_10px_rgba(255,122,26,0.55)]"
                                                            strokeWidth={2.7}
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`my-1 text-[13px] font-black leading-none ${
                                                                day.isToday
                                                                    ? 'text-[#ff7a1a]'
                                                                    : 'text-black/45 dark:text-white/45'
                                                            }`}
                                                        >
                                                            {dateNumber}
                                                        </span>
                                                    )}

                                                    <span
                                                        className={`text-[8px] font-black uppercase tracking-wider ${
                                                            day.read
                                                                ? 'text-white/55'
                                                                : day.isToday
                                                                    ? 'text-[#ff7a1a]/80'
                                                                    : 'text-black/25 dark:text-white/25'
                                                        }`}
                                                    >
                                                        {monthLabel} {day.read ? dateNumber : ""}
                                                    </span>

                                                    <span className="sr-only">
                                                        {dayLabel}, {fullLabel}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                                )}
                            </motion.section>

                            <motion.section
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.05 }}
                                className="xl:col-span-4 bg-gradient-to-br from-[#3b2a1a] to-[#1d140d] dark:from-[#1c2535] dark:to-[#111827] rounded-[28px] p-6 md:p-7 text-white shadow-lg overflow-hidden relative"
                            >
                                <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#c97b6b]/20 blur-3xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">Consistency Score</p>
                                            <h2 className="text-5xl font-serif mt-1">{habitScore}%</h2>
                                            <p className="mt-2 max-w-[220px] text-xs leading-5 text-white/45">Based on your last 30 days of reading activity.</p>
                                        </div>
                                        <AnimateIcon animateOnView animation="pulse">
                                            <Target className="w-9 h-9 text-[#e8a898]" />
                                        </AnimateIcon>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${habitScore}%` }}
                                            transition={{ duration: 0.9, ease: 'easeOut' }}
                                            className="h-full rounded-full bg-[#c97b6b]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-white/[0.08] border border-white/10 p-4">
                                            <p className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Active Days</p>
                                            <p className="text-2xl font-serif mt-1">{activeDays}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/[0.08] border border-white/10 p-4">
                                            <p className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Best Streak</p>
                                            <p className="text-2xl font-serif mt-1">{bestStreak}</p>
                                        </div>
                                        <div className="col-span-2 rounded-2xl bg-white/[0.08] border border-white/10 p-4">
                                            <p className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Current Streak</p>
                                            <p className="text-2xl font-serif mt-1">{streak} days</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            <section className="xl:col-span-7 bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-white/5 rounded-[28px] p-5 md:p-7 shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#c97b6b] mb-2">Weekly rhythm</p>
                                        <h2 className="text-2xl font-serif text-black dark:text-white">Activity by week</h2>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Last 5 weeks</span>
                                </div>
                                {weeklyActivity.some(Boolean) ? (
                                <div className="flex items-end gap-3 h-44">
                                    {weeklyActivity.map((count, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                            <motion.div
                                                initial={{ height: 4 }}
                                                animate={{ height: `${Math.max(7, (count / 7) * 100)}%` }}
                                                transition={{ duration: 0.6, delay: index * 0.03 }}
                                                className={`w-full rounded-t-xl ${count ? 'bg-[#c97b6b]' : 'bg-black/5 dark:bg-white/10'}`}
                                                title={`${count} reading days`}
                                            />
                                            <span className="text-[10px] font-bold text-black/35 dark:text-white/35">{count}</span>
                                        </div>
                                    ))}
                                </div>
                                ) : (
                                    <div className="flex h-44 items-center justify-center rounded-[24px] border border-dashed border-[#d7cfc4] bg-[#fcf9f2] p-6 text-center dark:border-white/10 dark:bg-[#0f1419]/50">
                                        <p className="text-sm text-black/55 dark:text-white/55">Weekly reading bars will appear after your first logged reading day.</p>
                                    </div>
                                )}
                            </section>

                            <section className="xl:col-span-5 bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-white/5 rounded-[28px] p-5 md:p-7 shadow-lg">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-[#c97b6b] mb-2">Milestones</p>
                                <h2 className="text-2xl font-serif text-black dark:text-white mb-6">Reader achievements</h2>
                                <div className="space-y-3">
                                    {[
                                        { label: 'First book started', done: currentlyReading > 0 || booksRead > 0 },
                                        { label: '7-day streak', done: bestStreak >= 7 },
                                        { label: '1,000 pages read', done: pagesRead >= 1000 },
                                        { label: 'Finish 5 books', done: booksRead >= 5 },
                                    ].map((item) => (
                                        <div key={item.label} className={`flex items-center gap-3 p-3 rounded-2xl border ${item.done ? 'bg-[#c97b6b]/10 border-[#c97b6b]/20' : 'bg-black/[0.025] dark:bg-white/[0.035] border-black/5 dark:border-white/5'}`}>
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.done ? 'bg-[#c97b6b] text-white' : 'bg-black/5 dark:bg-white/10 text-black/30 dark:text-white/30'}`}>
                                                <AnimateIcon animateOnHover animation={item.done ? 'spark' : 'float'}>
                                                    <Trophy className="w-4 h-4" />
                                                </AnimateIcon>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-black dark:text-white">{item.label}</p>
                                                <p className="text-[11px] text-black/40 dark:text-white/40">{item.done ? 'Unlocked' : 'Keep reading to unlock'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {import.meta.env.DEV ? (
                <button
                    type="button"
                    onClick={previewStreak}
                    className="fixed bottom-24 right-4 z-50 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-400 sm:bottom-6 sm:right-6"
                >
                    Preview Streak Animation
                </button>
            ) : null}

            <StreakCelebration
                open={streakCelebration.isOpen}
                onClose={streakCelebration.closeStreakCelebration}
                previousStreak={streakCelebration.previousStreak}
                newStreak={streakCelebration.newStreak}
                weeklyProgress={streakCelebration.weeklyProgress}
                milestone={streakCelebration.milestone}
            />
        </div>
    );
};
export default ReadingStatsPage;







