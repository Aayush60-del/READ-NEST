import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Book, Settings, Users, Activity, Search, ShieldAlert } from 'lucide-react';
import ManageBooksView from '../components/admin/ManageBooksView';
import UploadBookView from '../components/admin/UploadBookView';
import MembersView from '../components/admin/MembersView';
import ActivityView from '../components/admin/ActivityView';
import SystemSettingsView from '../components/admin/SystemSettingsView';
import api, { ENDPOINTS, getStoredSession } from '@/lib/api';
import AdminAnalyticsOverview from '../components/admin/AdminAnalyticsOverview';
import { normalizeAdminAnalytics } from '@/lib/adminAnalytics';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  const { user } = getStoredSession();

  const tabs = [
    { id: 'manage', label: 'Library', icon: Book, desc: 'Manage catalog' },
    { id: 'upload', label: 'Upload', icon: Upload, desc: 'Add new books' },
    { id: 'users', label: 'Members', icon: Users, desc: 'User accounts' },
    { id: 'activity', label: 'Activity', icon: Activity, desc: 'System logs' },
    { id: 'settings', label: 'System', icon: Settings, desc: 'Config' }
  ];

  const fetchAnalytics = useCallback(async () => {
    if (user?.role !== 'admin') {
      setAnalyticsLoading(false);
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError('');

    try {
      const payload = await api.get(ENDPOINTS.ADMIN.ANALYTICS);
      setAnalytics(normalizeAdminAnalytics(payload));
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setAnalytics(null);
      setAnalyticsError(err.message || 'Failed to load admin analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Verify role explicitly (redundant but safe)
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#161d27] rounded-2xl border border-red-500/20 p-8 text-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-black dark:text-white mb-2">Access Denied</h2>
          <p className="text-black/60 dark:text-white/60 text-sm">You do not have administrative privileges to view this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-[#1a1a1a] dark:text-[#e4e2e1] font-sans flex transition-colors duration-300 selection:bg-[#c97b6b] selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
        <DashboardNavbar />

        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-10 pt-10">

          <AdminAnalyticsOverview
            analytics={analytics}
            loading={analyticsLoading}
            error={analyticsError}
            onRefresh={fetchAnalytics}
            onUploadClick={() => setActiveTab('upload')}
          />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Navigation - horizontal scroll on mobile, vertical sidebar on desktop */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-[#243040]/50 rounded-2xl p-2 lg:sticky lg:top-32 shadow-sm transition-colors duration-300">
                <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all relative group overflow-hidden ${
                        isActive
                          ? 'bg-[#c97b6b]/10 text-[#c97b6b]'
                          : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="admin-active-tab"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#c97b6b] rounded-r-full"
                        />
                      )}
                      <Icon className={`w-4 h-4 lg:w-5 lg:h-5 shrink-0 ${isActive ? 'text-[#c97b6b]' : 'text-current opacity-70'}`} />
                      <p className={`text-xs lg:text-sm font-semibold whitespace-nowrap ${isActive ? 'text-[#c97b6b]' : ''}`}>{tab.label}</p>
                    </button>
                  );
                })}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-[#243040]/50 rounded-2xl shadow-sm overflow-hidden min-h-[600px] transition-colors duration-300"
                >
                  {/* Top Bar */}
                  <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-[#e8e4db] dark:border-[#243040]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.02] transition-colors duration-300">
                    <h2 className="text-lg sm:text-xl font-serif text-black dark:text-white">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h2>

                    {activeTab === 'manage' && (
                      <div className="flex items-center gap-3">
                        <div className="relative group hidden sm:block">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 group-focus-within:text-[#c97b6b] transition-colors" />
                          <input
                            type="text"
                            value={catalogSearch}
                            onChange={(event) => setCatalogSearch(event.target.value)}
                            placeholder="Search catalog..."
                            className="w-48 xl:w-64 h-9 bg-white dark:bg-[#0f1419] border border-[#e8e4db] dark:border-[#243040] rounded-lg pl-9 pr-4 text-xs text-black dark:text-white focus:outline-none focus:border-[#c97b6b] dark:focus:border-[#c97b6b] transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                    {/* Tab Content */}
                  <div className="p-0">
                    {activeTab === 'manage' && <ManageBooksView searchQuery={catalogSearch} />}
                    {activeTab === 'upload' && <UploadBookView />}
                    {activeTab === 'users' && <MembersView />}
                    {activeTab === 'activity' && <ActivityView analytics={analytics} loading={analyticsLoading} />}
                    {activeTab === 'settings' && <SystemSettingsView />}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminPage;

