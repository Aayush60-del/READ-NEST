import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit2, LogOut, BookOpen, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api, { ENDPOINTS, clearSession, getStoredSession } from '@/lib/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = getStoredSession();
  const displayName = user?.name || 'Reader';
  const displayEmail = user?.email || 'reader@readnest.app';
  const initial = displayName.charAt(0).toUpperCase();

  const [stats, setStats] = useState({ CompletedBooks: 0, totalPagesRead: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(ENDPOINTS.BOOKS.STATS);
        if (res.data) setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const signOut = () => {
    clearSession();
    navigate("/");
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111827] font-sans flex transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
        <DashboardNavbar />

        <div className="relative ml-0 mr-auto max-w-[1240px] w-full px-4 sm:px-10 pt-6 pb-20">
          <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#c97b6b]/10 blur-3xl" />

          {/* Header */}
          <div className="relative z-10 mb-8 flex flex-col justify-between gap-6 rounded-[32px] border border-[#e8e4db] bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#ff9c7a]">Reader profile</p>
              <h1 className="text-4xl font-semibold text-[#111827] dark:text-white mb-2 tracking-tight transition-colors">Profile</h1>
              <p className="text-slate-400 transition-colors">Manage your reading identity</p>
            </div>
            <Link
              to="/settings"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#ff7a4f] px-6 py-3 font-semibold text-white transition-all hover:bg-[#e9683f] active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mb-8 rounded-[28px] border border-[#e8e4db] bg-white/75 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
          >
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 border-b border-white/[0.08] pb-8">
              <div className="w-28 h-28 shrink-0 rounded-full bg-gradient-to-br from-[#c97b6b] to-[#a65d50] flex items-center justify-center shadow-lg">
                <span className="text-5xl font-serif font-bold text-white">{initial}</span>
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-[#111827] dark:text-white mb-2 transition-colors">{displayName}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-4 py-1.5 bg-[#c97b6b]/10 text-[#c97b6b] text-xs font-bold tracking-widest rounded-full uppercase">
                    Active Reader
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" /> Member since {joinDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#c97b6b]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#c97b6b]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Email</p>
                  <p className="text-sm font-medium text-[#111827] dark:text-white">{displayEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#c97b6b]/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#c97b6b]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Account Type</p>
                  <p className="text-sm font-medium text-[#111827] dark:text-white capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-6 rounded-[28px] border border-[#e8e4db] bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
            >
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Books Completed</p>
                <p className="text-4xl font-semibold text-[#111827] transition-colors dark:text-white">{loading ? '-' : stats.CompletedBooks}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-6 rounded-[28px] border border-[#e8e4db] bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Pages Read</p>
                <p className="text-4xl font-semibold text-[#111827] transition-colors dark:text-white">{loading ? '-' : stats.totalPagesRead}</p>
              </div>
            </motion.div>
          </div>

          {/* Logout Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={signOut}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-bold tracking-widest uppercase transition-all border border-red-500/20 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

