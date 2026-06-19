import React, { useState, useEffect } from 'react';
import { Activity, Book, Users, Loader2 } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';

const ActivityView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Build the activity feed from persisted books and users until a dedicated audit-log table exists.
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const [booksRes, usersRes] = await Promise.all([
          api.get(ENDPOINTS.BOOKS.ADMIN_LIST).catch(() => ({ data: [] })),
          api.get(ENDPOINTS.USER.ALL).catch(() => ({ data: [] }))
        ]);

        const books = (booksRes.data || []).map(b => ({
          id: b._id,
          type: 'book',
          title: `New book added: ${b.title}`,
          date: new Date(b.createdAt),
          icon: Book,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10'
        }));

        const users = (usersRes.data || []).map(u => ({
          id: u._id,
          type: 'user',
          title: `New user registered: ${u.name}`,
          date: new Date(u.createdAt),
          icon: Users,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10'
        }));

        // Combine and sort descending by date
        const combined = [...books, ...users].sort((a, b) => b.date - a.date).slice(0, 50);
        setLogs(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#c97b6b] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-black dark:text-white mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#c97b6b]" /> System Activity
        </h2>
        <p className="text-black/60 dark:text-white/60 text-sm">Recent events and interactions across the platform.</p>
      </div>

      <div className="relative border-l border-black/10 dark:border-white/10 ml-4 space-y-8 py-4">
        {logs.map((log) => {
          const Icon = log.icon;
          return (
            <div key={`${log.type}-${log.id}`} className="relative pl-8 group">
              <div className={`absolute -left-[18px] top-0.5 w-9 h-9 rounded-full ${log.bg} flex items-center justify-center border-4 border-white dark:border-[#161d27] group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${log.color}`} />
              </div>
              <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl p-4 transition-colors">
                <p className="font-medium text-sm text-black dark:text-white mb-1">{log.title}</p>
                <p className="text-xs text-black/50 dark:text-white/50">{log.date.toLocaleString()}</p>
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <p className="text-sm text-black/50 dark:text-white/50 pl-8">No recent activity found.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityView;

