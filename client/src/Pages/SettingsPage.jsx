import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, LogOut, Sun, Moon, Eye, EyeOff, CheckCircle2, AlertCircle, Bell, Palette, Shield, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, clearSession, getStoredSession } from '@/lib/api';
import { requestForToken } from '@/config/firebase';

// ---- Section Wrapper ----
const Section = ({ id, title, description, icon: Icon, accentColor = '#c97b6b', children, delay = 0 }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="overflow-hidden rounded-[28px] border border-[#e8e4db] bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl scroll-mt-28 dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
  >
    <div className="px-5 sm:px-6 py-5 border-b border-white/[0.08] flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}18` }}>
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#111827] dark:text-white">{title}</h2>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </motion.div>
);

// ---- Field ----
const Field = ({ label, id, type = 'text', value, onChange, placeholder, disabled, rightElement }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-[10px] font-bold tracking-widest uppercase text-slate-500">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-12 rounded-2xl border border-[#e8e4db] bg-[#fcf9f2] px-4 text-sm text-[#111827] placeholder:text-slate-400 transition-colors focus:outline-none focus:border-[#c97b6b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-[#070b12] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#ff7a4f]"
      />
      {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
    </div>
  </div>
);

// ---- Toast/Status ----
const StatusMessage = ({ status }) => {
  if (!status.message) return null;
  const isError = status.type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
        isError
          ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
      }`}
    >
      {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
      {status.message}
    </motion.div>
  );
};

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 p-4 bg-[#fcf9f2] rounded-2xl border border-[#e8e4db] dark:bg-[#070b12] dark:border-white/[0.08]">
    <div>
      <p className="text-sm font-semibold text-[#111827] dark:text-white">{label}</p>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c97b6b] ${
        checked ? 'bg-[#ff7a4f]' : 'bg-white/10'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user: storedUser } = getStoredSession();
  const [currentUser, setCurrentUser] = useState(storedUser);
  const user = currentUser;

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileStatus, setProfileStatus] = useState({ loading: false, message: '', type: '' });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: '', type: '' });

  // Theme state
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && document.documentElement.classList.contains('dark'))
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Notifications state
  const [notifSettings, setNotifSettings] = useState({
    enabled: true,
    dailyReminders: true,
    streakAchievements: true,
    bookCompletion: true,
  });

  React.useEffect(() => {
    // Fetch current settings if available in session or backend
    if (user?.notificationSettings) {
      setNotifSettings(user.notificationSettings);
    } else {
      // Sync from backend
      api.get(ENDPOINTS.USER.PROFILE).then((res) => {
        if (res?.user?.notificationSettings) setNotifSettings(res.user.notificationSettings);
      }).catch(()=>{});
    }
  }, [user]);

  const handleNotifToggle = async (key, value) => {
    const previous = notifSettings;
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);

    try {
      if (key === 'enabled' && value === true) {
        const token = await requestForToken();
        if (token) {
          await api.post(ENDPOINTS.NOTIFICATIONS.FCM_TOKEN, { token });
        }
      }

      const res = await api.put(ENDPOINTS.NOTIFICATIONS.SETTINGS, { [key]: value });

      const updatedUser = res?.user || res;
      if (updatedUser?._id || updatedUser?.id) {
        const normalizedUser = {
          id: updatedUser._id || updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          notificationSettings: updatedUser.notificationSettings,
        };

        setCurrentUser(normalizedUser);
        localStorage.setItem('readnest_user', JSON.stringify(normalizedUser));
      }
    } catch (err) {
      console.error("Failed to save notification setting", err);
      setNotifSettings(previous);
    }
  };

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();

    const name = profileForm.name.trim();
    const email = profileForm.email.trim().toLowerCase();

    if (!name || !email) {
      setProfileStatus({ loading: false, message: 'Name and email are required.', type: 'error' });
      return;
    }

    setProfileStatus({ loading: true, message: '', type: '' });

    try {
      const res = await api.put(ENDPOINTS.AUTH.PROFILE, { name, email });
      const updatedUser = res?.user;

      if (updatedUser) {
        const normalizedUser = {
          id: updatedUser._id || updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          notificationSettings: updatedUser.notificationSettings,
        };

        setCurrentUser(normalizedUser);
        localStorage.setItem('readnest_user', JSON.stringify(normalizedUser));
        setProfileForm({ name: normalizedUser.name, email: normalizedUser.email });
      }

      setProfileStatus({ loading: false, message: 'Profile updated successfully.', type: 'success' });
      setTimeout(() => setProfileStatus(s => ({ ...s, message: '' })), 3000);
    } catch (err) {
      setProfileStatus({ loading: false, message: err.message || 'Failed to update profile.', type: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ loading: false, message: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ loading: false, message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    setPasswordStatus({ loading: true, message: '', type: '' });
    try {
      await api.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ loading: false, message: 'Password changed successfully.', type: 'success' });
      setTimeout(() => setPasswordStatus(s => ({ ...s, message: '' })), 3000);
    } catch (err) {
      setPasswordStatus({ loading: false, message: err.message, type: 'error' });
    }
  };

  const signOut = () => {
    clearSession();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete(ENDPOINTS.AUTH.ACCOUNT);
    } catch (error) {
      console.error('Account deletion failed before local sign-out:', error);
    }
    clearSession();
    navigate('/');
  };

  const initial = (user?.name || 'R').charAt(0).toUpperCase();
  const settingsNav = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger-zone', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#111827] font-sans flex transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
        <DashboardNavbar />

        <div className="relative ml-0 mr-auto max-w-[1240px] w-full px-4 sm:px-10 pt-6 pb-20">
          <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#c97b6b]/10 blur-3xl" />

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mb-8 rounded-[32px] border border-[#e8e4db] bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c97b6b]">Account center</p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-white sm:text-4xl">Settings</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Manage your account, reading preferences, and app experience.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c97b6b] to-[#a65d50] shadow-lg">
                  <span className="text-xl font-bold text-white">{initial}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827] dark:text-white">{user?.name || 'Reader'}</p>
                  <p className="max-w-[220px] truncate text-xs text-slate-500">{user?.email || 'No email available'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
            <aside className="xl:sticky xl:top-28 xl:self-start">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto rounded-[28px] border border-[#e8e4db] bg-white/75 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)] xl:block xl:space-y-1">
                {settingsNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex min-h-11 shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-[#ff7a4f]/10 hover:text-[#ff9c7a] xl:w-full"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">

            {/* -- Profile Settings -- */}
            <Section id="profile" title="Profile" description="Update your display name and email" icon={User} delay={0.05}>
              <form onSubmit={handleProfileSave} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-4 border-b border-white/[0.08]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c97b6b] to-[#a65d50] flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-serif font-bold text-white">{initial}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827] dark:text-white">{user?.name || 'Reader'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name"
                    id="name"
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                  <Field
                    label="Email Address"
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>

                <StatusMessage status={profileStatus} />

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={profileStatus.loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2.5 bg-[#c97b6b] hover:bg-[#b8695c] text-white text-sm font-bold tracking-widest uppercase rounded-xl transition-colors disabled:opacity-60"
                  >
                    {profileStatus.loading ? 'Saving...' : 'Save Profile'}
                  </motion.button>
                </div>
              </form>
            </Section>

            {/* -- Change Password -- */}
            <Section id="security" title="Account Security" description="Change your password" icon={Lock} accentColor="#5227FF" delay={0.1}>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Field
                  label="Current Password"
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  rightElement={
                    <button type="button" onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}>
                      {showPasswords.current
                        ? <EyeOff className="w-4 h-4 text-slate-500" />
                        : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="New Password"
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="New password"
                    rightElement={
                      <button type="button" onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}>
                        {showPasswords.new
                          ? <EyeOff className="w-4 h-4 text-slate-500" />
                          : <Eye className="w-4 h-4 text-slate-500" />}
                      </button>
                    }
                  />
                  <Field
                    label="Confirm New Password"
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    rightElement={
                      <button type="button" onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}>
                        {showPasswords.confirm
                          ? <EyeOff className="w-4 h-4 text-slate-500" />
                          : <Eye className="w-4 h-4 text-slate-500" />}
                      </button>
                    }
                  />
                </div>

                <StatusMessage status={passwordStatus} />

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={passwordStatus.loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2.5 bg-[#1a1a2e] dark:bg-[#5227FF] hover:opacity-90 text-white text-sm font-bold tracking-widest uppercase rounded-xl transition-colors disabled:opacity-60"
                  >
                    {passwordStatus.loading ? 'Updating...' : 'Update Password'}
                  </motion.button>
                </div>
              </form>
            </Section>

            {/* -- Notification Settings -- */}
            <Section id="notifications" title="Notifications" description="Manage your push notifications and alerts" icon={Bell} accentColor="#f59e0b" delay={0.12}>
              <div className="space-y-4">
                <Toggle 
                  label="Browser Push Notifications" 
                  description="Receive notifications even when ReadNest is closed"
                  checked={notifSettings.enabled}
                  onChange={(v) => handleNotifToggle('enabled', v)}
                />
                
                {notifSettings.enabled && (
                  <div className="pl-4 ml-4 border-l-2 border-[#c97b6b]/20 space-y-4 transition-all duration-300 opacity-100">
                    <Toggle 
                      label="Daily Reminders" 
                      description="Motivational quotes and streak protection alerts at 12 PM, 6 PM, and 9 PM"
                      checked={notifSettings.dailyReminders}
                      onChange={(v) => handleNotifToggle('dailyReminders', v)}
                    />
                    <Toggle 
                      label="Streak Achievements" 
                      description="Celebrate when you hit 3, 7, 30+ day reading milestones"
                      checked={notifSettings.streakAchievements}
                      onChange={(v) => handleNotifToggle('streakAchievements', v)}
                    />
                    <Toggle 
                      label="Book Completions" 
                      description="Get notified when you successfully finish a book"
                      checked={notifSettings.bookCompletion}
                      onChange={(v) => handleNotifToggle('bookCompletion', v)}
                    />
                  </div>
                )}
              </div>
            </Section>

            {/* -- Preferences -- */}
            <Section id="appearance" title="Appearance" description="Personalize your display experience" icon={Palette} accentColor="#2f766d" delay={0.15}>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => isDark && toggleTheme()}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    !isDark
                      ? 'border-[#c97b6b]/35 bg-[#c97b6b]/10'
                      : 'border-white/[0.08] bg-[#070b12] hover:border-[#ff7a4f]/25'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#ff9c7a] shadow-sm">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] dark:text-white">Light mode</p>
                    <p className="text-xs text-slate-500">Warm, clean reading workspace.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => !isDark && toggleTheme()}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    isDark
                      ? 'border-[#c97b6b]/35 bg-[#c97b6b]/10'
                      : 'border-white/[0.08] bg-[#070b12] hover:border-[#ff7a4f]/25'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111827] text-[#e8a898] shadow-sm">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] dark:text-white">Dark mode</p>
                    <p className="text-xs text-slate-500">Deep navy interface for focus.</p>
                  </div>
                </button>
              </div>
            </Section>

            {/* -- Security / Danger Zone -- */}
            <Section id="danger-zone" title="Danger Zone" description="Session and account management" icon={LogOut} accentColor="#ef4444" delay={0.2}>
              <div className="space-y-4">
                {/* Sign Out */}
                <div className="flex items-center justify-between p-4 bg-[#fcf9f2] rounded-xl border border-[#e8e4db] dark:bg-[#070b12] dark:border-white/[0.08]">
                  <div>
                    <p className="text-sm font-semibold text-[#111827] dark:text-white">Sign out</p>
                    <p className="text-xs text-slate-500">End your current session</p>
                  </div>
                  <motion.button
                    onClick={signOut}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black/[0.05] hover:bg-black/[0.08] rounded-xl text-sm font-bold text-[#111827] transition-colors dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </motion.button>
                </div>

                {/* Delete Account */}
                <div className="p-4 bg-red-500/[0.04] dark:bg-red-500/[0.08] rounded-xl border border-red-500/10">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Account</p>
                      <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5">
                        Permanently remove your account and all data. This cannot be undone.
                      </p>
                    </div>
                    {!deleteConfirm ? (
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setDeleteConfirm(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wide transition-colors"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            </div>
          </div>
        </div>
    </main>
    </div>
  );
};

export default SettingsPage;



