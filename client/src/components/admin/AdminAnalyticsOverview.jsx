import {
  Activity,
  Book,
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  FileText,
  Library,
  RefreshCw,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

const formatMetricValue = (value, loading) => {
  if (loading) return '-';
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString();
};

const MetricCard = ({ label, value, icon: Icon, loading }) => (
  <div className="rounded-2xl border border-[#e8e4db] bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,20,25,0.06)] backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-[#161d27]/90 dark:shadow-none">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c97b6b]/10 text-[#c97b6b]">
        <Icon className="h-4 w-4" />
      </div>
      {loading && <div className="h-2 w-10 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />}
    </div>
    <div className="font-serif text-2xl text-black dark:text-white">{formatMetricValue(value, loading)}</div>
    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{label}</div>
  </div>
);

const AdminAnalyticsOverview = ({ analytics, loading, error, onRefresh }) => {
  const metricCards = [
    { label: 'Total Users', value: analytics?.totalUsers, icon: Users },
    { label: 'New Users Today', value: analytics?.newUsersToday, icon: UserPlus },
    { label: 'New Users This Week', value: analytics?.newUsersThisWeek, icon: CalendarPlus },
    { label: 'Active Readers Today', value: analytics?.activeReadersToday, icon: UserCheck },
    { label: 'Active Readers This Week', value: analytics?.activeReadersThisWeek, icon: Activity },
    { label: 'Total Books', value: analytics?.totalBooks, icon: BookOpen },
    { label: 'Published Books', value: analytics?.publishedBooks, icon: CheckCircle2 },
    { label: 'Total Pages Read', value: analytics?.totalPagesRead, icon: FileText },
    { label: 'Completed Books', value: analytics?.completedBooks, icon: Book },
    { label: 'Total Library Items', value: analytics?.totalLibraryItems, icon: Library },
  ];

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-full bg-[#c97b6b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c97b6b]">Admin Panel</span>
            <span className="text-sm text-black/40 dark:text-white/40">Live analytics</span>
          </div>
          <h1 className="font-serif text-4xl tracking-tight text-black dark:text-white">System Control</h1>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8e4db] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-black/60 shadow-sm transition hover:text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#161d27] dark:text-white/60 dark:hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#c97b6b]' : 'text-[#c97b6b]'}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {metricCards.map(({ label, value, icon }) => (
          <MetricCard key={label} label={label} value={value} icon={icon} loading={loading} />
        ))}
      </div>
    </>
  );
};

export default AdminAnalyticsOverview;
