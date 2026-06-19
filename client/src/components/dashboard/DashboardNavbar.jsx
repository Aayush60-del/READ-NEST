import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Home, Library, Compass, BarChart2, Settings, HelpCircle, X, ShieldAlert, Flame, BookOpen } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getStoredSession } from '@/lib/api';
import { useNotification } from '@/contexts/useNotification';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

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
    <header className="sticky top-0 z-50 w-full bg-[#fcf9f2] dark:bg-[#0f1419] py-4 md:py-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 flex items-center justify-between gap-4">

        {/* Left Side: Logo (Optional) & Search */}
        <div className="flex items-center gap-4 md:gap-6 flex-1">
          {/* Mobile Hamburger Menu Trigger */}
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-black dark:text-white hover:text-[#c97b6b] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {!hideLogo && (
            <Link to="/" className="flex flex-col shrink-0">
              <span className="font-serif text-2xl md:text-3xl text-black dark:text-white tracking-wide transition-colors duration-300">ReadNest</span>
              <span className="text-[10px] md:tracking-[0.2em] tracking-widest text-[#c97b6b] mt-0.5 md:mt-1 uppercase opacity-80">Literary Sanctuary</span>
            </Link>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-lg w-full hidden md:block group">
            <AnimateIcon animateOnHover animation="pulse" className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
              <Search className="w-4 h-4 transition-colors duration-300" />
            </AnimateIcon>
            <input
              type="search"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search books, authors, or genres..."
              className="w-full h-10 bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-[#243040] rounded-full pl-11 pr-4 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#c97b6b] dark:focus:border-white/20 focus:bg-[#fcfcfc] dark:focus:bg-[#1c2535] transition-colors duration-300 shadow-sm dark:shadow-none"
            />
          </form>
        </div>

        {/* Right Actions */}
        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-8 shrink-0">

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="group relative w-[52px] h-7 rounded-full bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-[#243040] p-[3px] flex items-center transition-colors hover:border-[#cccccc] dark:hover:border-white/20 shadow-sm dark:shadow-none"
          >
            {/* The sun and moon icons behind the toggle handle */}
            <div className="absolute inset-x-0 px-2 flex justify-between items-center pointer-events-none">
              <Moon className="w-[10px] h-[10px] text-black/20 dark:text-white/30" />
              <Sun className="w-[11px] h-[11px] text-black/20 dark:text-white/30" />
            </div>

            <motion.div
              initial={false}
              animate={{
                x: isDark ? 0 : 25,
                backgroundColor: isDark ? '#c97b6b' : '#fcfcfc'
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative z-10 w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_12px_rgba(232,165,80,0.3)] border border-[#e8e4db] dark:border-transparent"
            >
              {isDark ? (
                <Moon className="w-2.5 h-2.5 text-[#0f1419] fill-current" />
              ) : (
                <Sun className="w-2.5 h-2.5 text-[#c97b6b] fill-current" />
              )}
            </motion.div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative text-black/50 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors flex items-center justify-center duration-300"
            >
              <Bell className="w-5 h-5" />
              {/* Notification dot */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#fcf9f2] dark:ring-[#0f1419] flex items-center justify-center text-[8px] font-bold text-white">
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
                  className="absolute right-0 top-12 w-80 rounded-xl border border-[#e8e4db] bg-white text-black shadow-2xl dark:border-[#243040] dark:bg-[#161d27] dark:text-white z-50 overflow-hidden"
                  role="status"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
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
                        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
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
                          className={`p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-[#c97b6b]/5 dark:bg-[#c97b6b]/10' : ''}`}
                        >
                          <div className="mt-1 shrink-0">
                            <AnimateIcon animateOnView animation={notif.type.includes('streak') ? 'pulse' : 'draw'}>
                              {notif.type.includes('streak') ? <Flame className="w-4 h-4 text-[#c97b6b]" /> : <BookOpen className="w-4 h-4 text-[#c97b6b]" />}
                            </AnimateIcon>
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                            <p className="text-xs text-black/60 dark:text-white/60 mt-1 whitespace-pre-wrap">{notif.message}</p>
                            <p className="text-[10px] text-black/40 dark:text-white/40 mt-2">
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
          <div className="w-px h-8 bg-black/10 dark:bg-white/10 hidden md:block transition-colors duration-300"></div>

          {/* Profile Widget */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-3 transition-colors group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-black dark:text-white group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors duration-300">{displayName}</p>
                <p className="text-[8px] font-bold text-black/40 dark:text-white/40 tracking-widest uppercase transition-colors duration-300"></p>
              </div>
              <div className="w-10 h-10 rounded overflow-hidden bg-white dark:bg-[#243040] border border-[#e8e4db] dark:border-[#243040] shadow-sm dark:shadow-none transition-colors duration-300">
                <div className="w-full h-full bg-gradient-to-br from-[#cce5d9] to-[#ebf2ef] dark:from-[#122e22] dark:to-[#0a1811] flex items-center justify-center">
                  <span className="text-[#3b8c6a] dark:text-[#f5b870] font-serif font-bold text-lg">{initial}</span>
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
                  className="absolute right-0 top-14 w-52 bg-white dark:bg-[#161d27] border border-[#e8e4db] dark:border-[#243040] rounded-xl shadow-2xl overflow-hidden z-50 text-black dark:text-white transition-colors duration-300"
                >
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
                    <p className="text-sm font-bold">{displayName}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{displayEmail}</p>
                  </div>
                  <div className="p-1">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                      Profile
                    </Link>
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-black/5 dark:border-white/5 p-1">
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
                      <span className="text-sm text-red-600 dark:text-red-500 font-medium">Sign Out</span>
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#fcf9f2] dark:bg-[#0c1117] z-[210] flex flex-col pt-8 pb-8 border-r border-[#e8e4db] dark:border-[#1a2330] shadow-2xl lg:hidden"
            >
              <div className="px-8 mb-10 flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-3xl text-black dark:text-white tracking-wide">ReadNest</h1>
                  <p className="text-[10px] tracking-[0.2em] text-[#c97b6b] mt-1 uppercase opacity-80">Literary Sanctuary</p>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2">
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
                      className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-all group relative ${isActive ? 'bg-[#e8e4db] dark:bg-[#192230] text-black dark:text-white' : 'text-black/50 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#c97b6b] rounded-r-md"></div>}
                          <Icon className={`w-4 h-4 mr-4 transition-colors ${isActive ? 'text-[#c97b6b]' : ''}`} />
                          <span className={`font-medium text-sm tracking-wide transition-colors ${isActive ? 'text-black dark:text-white' : ''}`}>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-all group relative ${isActive ? 'bg-[#e8e4db] dark:bg-[#192230] text-[#c97b6b]' : 'text-[#c97b6b] hover:bg-[#c97b6b]/10 hover:text-[#c97b6b]'}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#c97b6b] rounded-r-md"></div>}
                        <ShieldAlert className={`w-4 h-4 mr-4 transition-colors ${isActive ? 'text-[#c97b6b]' : ''}`} />
                        <span className={`font-medium text-sm tracking-wide transition-colors ${isActive ? 'text-[#c97b6b]' : ''}`}>System Control</span>
                      </>
                    )}
                  </NavLink>
                )}
              </nav>

              <div className="px-6 mt-auto flex flex-col gap-6">
                <div className="space-y-1">
                  <NavLink to="/settings" onClick={() => setMobileNavOpen(false)} className="flex items-center px-4 py-3 rounded-lg text-black/50 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium tracking-wide">
                    <Settings className="w-4 h-4 mr-4" /> Settings
                  </NavLink>
                  <button className="w-full flex items-center px-4 py-3 rounded-lg text-black/50 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium tracking-wide">
                    <HelpCircle className="w-4 h-4 mr-4" /> Support
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </header>
  );
};

export default DashboardNavbar;

