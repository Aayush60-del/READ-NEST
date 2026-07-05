import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Home, Library, Compass, BarChart2, Settings, HelpCircle, X, ShieldAlert, Flame, BookOpen } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '@/lib/api';
import { useNotification } from '@/contexts/useNotification';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

const DashboardNavbar = ({ hideLogo = true }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();
  const { user } = getStoredSession();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const displayName = user?.name || 'Reader';
  const displayEmail = user?.email || 'reader@readnest.app';
  const initial = displayName.charAt(0).toUpperCase();

  // Set initial state based on document class or localStorage
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && document.documentElement.classList.contains('dark'));
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const signOut = () => {
    clearSession();
    setProfileOpen(false);
    navigate('/auth');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = globalSearch.trim();
    if (!query) return;
    navigate(`/discover?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e4db] bg-[#fcf9f2]/95 py-4 backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#070b12]/95 md:py-8">
      <div className="w-full max-w-[1240px] ml-0 mr-auto px-4 md:px-10 flex items-center justify-between gap-4">

        {/* Left Side: Logo (Optional) & Search */}
        <div className="flex items-center gap-4 md:gap-6 flex-1">
          {/* Mobile Hamburger Menu Trigger */}
          <button onClick={() => setMobileNavOpen(true)} className="text-slate-700 transition-colors hover:text-[#c96f5c] dark:text-white dark:hover:text-[#ff9c7a] lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {!hideLogo && (
            <Link to="/" className="flex flex-col shrink-0">
              <span className="text-2xl md:text-3xl text-[#111827] font-bold tracking-wide transition-colors duration-300 dark:text-white">ReadNest</span>
              <span className="text-[10px] md:tracking-[0.2em] tracking-widest text-[#ff9c7a] mt-0.5 md:mt-1 uppercase opacity-80">Literary Sanctuary</span>
            </Link>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-lg w-full hidden md:block group">
            <button
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 hover:text-[#ff9c7a]"
              aria-label="Search books"
            >
              <AnimateIcon animateOnHover animation="pulse">
                <Search className="w-4 h-4" />
              </AnimateIcon>
            </button>
            <input
              type="search"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search books, authors, or genres..."
              className="w-full h-10 rounded-full border border-[#e1dbd1] bg-white/80 pl-11 pr-4 text-sm text-[#111827] placeholder:text-slate-400 shadow-sm transition-colors duration-300 focus:outline-none focus:border-[#c97b6b]/45 focus:bg-white dark:border-white/[0.08] dark:bg-[#0f1726] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#ff7a4f]/45 dark:focus:bg-[#111b2d]"
            />
          </form>
        </div>

        {/* Right Actions */}
        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-8 shrink-0">

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="group relative w-[52px] h-7 rounded-full bg-white border border-[#e1dbd1] p-[3px] flex items-center transition-colors hover:border-[#c97b6b]/40 shadow-sm dark:bg-[#0f1726] dark:border-white/[0.08] dark:hover:border-[#ff7a4f]/40"
          >
            {/* The sun and moon icons behind the toggle handle */}
            <div className="absolute inset-x-0 px-2 flex justify-between items-center pointer-events-none">
              <Moon className="w-[10px] h-[10px] text-slate-400 dark:text-white/30" />
              <Sun className="w-[11px] h-[11px] text-slate-400 dark:text-white/30" />
            </div>

            <motion.div
              initial={false}
              animate={{
                x: isDark ? 0 : 25,
                backgroundColor: isDark ? '#ff7a4f' : '#263244'
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative z-10 w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(232,165,80,0.24)] border border-transparent"
            >
              {isDark ? (
                <Moon className="w-2.5 h-2.5 text-[#0f1419] fill-current" />
              ) : (
                <Sun className="w-2.5 h-2.5 text-[#ff9c7a] fill-current" />
              )}
            </motion.div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative text-slate-500 hover:text-[#111827] transition-colors flex items-center justify-center duration-300 dark:text-slate-400 dark:hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#fcf9f2] dark:ring-[#070b12] flex items-center justify-center text-[8px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 top-12 w-80 rounded-xl border border-[#e8e4db] bg-white text-[#111827] shadow-2xl z-50 overflow-hidden dark:border-white/[0.08] dark:bg-[#0f1726] dark:text-white"
                  role="status"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4db] dark:border-white/[0.08]">
                    <h3 className="text-sm font-bold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-[#c97b6b] hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm font-semibold">No notifications</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Reading reminders and achievements will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => {
                            if (!notif.read) markAsRead(notif._id);
                            if (notif.url) {
                              setNotifOpen(false);
                              navigate(notif.url);
                            }
                          }}
                          className={`p-4 border-b border-[#e8e4db] hover:bg-[#ff7a4f]/6 transition-colors cursor-pointer flex gap-3 dark:border-white/[0.08] dark:hover:bg-white/[0.05] ${!notif.read ? 'bg-[#ff7a4f]/10' : ''}`}
                        >
                          <div className="mt-1 shrink-0">
                            <AnimateIcon animateOnView animation={notif.type.includes('streak') ? 'pulse' : 'draw'}>
                              {notif.type.includes('streak') ? <Flame className="w-4 h-4 text-[#c97b6b]" /> : <BookOpen className="w-4 h-4 text-[#c97b6b]" />}
                            </AnimateIcon>
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                            <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{notif.message}</p>
                            <p className="text-[10px] text-slate-500 mt-2">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-[#c97b6b] shrink-0 mt-1" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-white/[0.08] hidden md:block transition-colors duration-300"></div>

          {/* Profile Widget */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-3 transition-colors group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#111827] group-hover:text-[#c96f5c] transition-colors duration-300 dark:text-white dark:group-hover:text-white/80">{displayName}</p>
                <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase transition-colors duration-300"></p>
              </div>
              <div className="w-10 h-10 rounded overflow-hidden bg-[#efe6da] border border-[#e1dbd1] shadow-sm transition-colors duration-300 dark:bg-[#162235] dark:border-white/[0.08]">
                <div className="w-full h-full bg-gradient-to-br from-[#122e22] to-[#0a1811] flex items-center justify-center">
                  <span className="text-[#f5b870] font-bold text-lg">{initial}</span>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-52 bg-white border border-[#e8e4db] rounded-xl shadow-2xl overflow-hidden z-50 text-[#111827] transition-colors duration-300 dark:bg-[#0f1726] dark:border-white/[0.08] dark:text-white"
                >
                  <div className="px-4 py-3 border-b border-[#e8e4db] dark:border-white/[0.08]">
                    <p className="text-sm font-bold">{displayName}</p>
                    <p className="text-xs text-slate-500">{displayEmail}</p>
                  </div>
                  <div className="p-1">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-[#ff7a4f]/8 dark:hover:bg-white/[0.05]">
                      Profile
                    </Link>
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-[#ff7a4f]/8 dark:hover:bg-white/[0.05]">
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#e8e4db] p-1 dark:border-white/[0.08]">
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left">
                      <span className="text-sm text-red-400 font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] lg:hidden"
            />

            {/* Sidebar Slide-in */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 230 }}
              className="fixed inset-y-0 left-0 z-[210] flex w-[min(86vw,320px)] flex-col overflow-hidden border-r border-[#e8e4db] bg-[#fffaf3] text-[#111827] shadow-[24px_0_80px_rgba(0,0,0,0.32)] dark:border-white/[0.08] dark:bg-[#070b12] dark:text-white lg:hidden"
            >
              <div
                className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-5"
                style={{
                  paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
                  paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
                }}
              >
              <div className="mb-7 flex items-start justify-between gap-4 px-1">
                <div>
                  <h1 className="text-3xl font-bold tracking-normal text-[#111827] dark:text-white">ReadNest</h1>
                  <p className="text-[10px] tracking-[0.2em] text-[#ff9c7a] mt-1 uppercase opacity-80">Literary Sanctuary</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e8e4db] bg-white/70 text-slate-500 transition hover:border-[#c97b6b]/35 hover:text-[#111827] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400 dark:hover:text-white"
                  aria-label="Close navigation menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2 overflow-y-auto rounded-2xl border border-[#e8e4db] bg-white/70 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0b111b] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                {[
                  { icon: Home, label: 'Home', path: '/overview' },
                  { icon: Library, label: 'My Library', path: '/library' },
                  { icon: Compass, label: 'Discover', path: '/discover' },
                  { icon: BarChart2, label: 'Reading Stats', path: '/stats' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) => `relative flex min-h-12 items-center rounded-xl px-4 py-3 transition-all group ${isActive ? 'bg-[#ff7a4f]/12 text-[#c96f5c] dark:text-[#ff9c7a]' : 'text-slate-600 hover:bg-[#ff7a4f]/8 hover:text-[#111827] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white'}`}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ff7a4f] rounded-r-md"></div>}
                          <Icon className={`w-4 h-4 mr-4 transition-colors ${isActive ? 'text-[#c96f5c] dark:text-[#ff9c7a]' : ''}`} />
                          <span className={`font-medium text-sm tracking-wide transition-colors ${isActive ? 'text-[#c96f5c] dark:text-[#ff9c7a]' : ''}`}>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) => `relative flex min-h-12 items-center rounded-xl px-4 py-3 transition-all group ${isActive ? 'bg-[#ff7a4f]/12 text-[#ff9c7a]' : 'text-[#ff9c7a] hover:bg-[#ff7a4f]/10 hover:text-[#ff9c7a]'}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ff7a4f] rounded-r-md"></div>}
                        <ShieldAlert className={`w-4 h-4 mr-4 transition-colors ${isActive ? 'text-[#ff9c7a]' : ''}`} />
                        <span className={`font-medium text-sm tracking-wide transition-colors ${isActive ? 'text-[#ff9c7a]' : ''}`}>System Control</span>
                      </>
                    )}
                  </NavLink>
                )}
              </nav>

              <div className="mt-5 border-t border-[#e8e4db] pt-4 dark:border-white/[0.08]">
                <div className="space-y-1">
                  <NavLink to="/settings" onClick={() => setMobileNavOpen(false)} className="flex min-h-12 items-center rounded-xl px-4 py-3 text-sm font-medium tracking-wide text-slate-600 hover:bg-[#ff7a4f]/8 hover:text-[#111827] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white">
                    <Settings className="w-4 h-4 mr-4" /> Settings
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      navigate('/feedback');
                    }}
                    className="flex min-h-12 w-full items-center rounded-xl px-4 py-3 text-sm font-medium tracking-wide text-slate-600 hover:bg-[#ff7a4f]/8 hover:text-[#111827] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  >
                    <HelpCircle className="w-4 h-4 mr-4" /> Support
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </header>
    <MobileBottomNav />
    </>
  );
};

export default DashboardNavbar;

