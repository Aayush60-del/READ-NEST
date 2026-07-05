import { NavLink, useLocation } from 'react-router-dom';
import { BarChart2, Compass, Home, Library, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', path: '/dashboard', aliases: ['/dashboard', '/overview'], icon: Home },
  { label: 'Library', path: '/library', aliases: ['/library'], icon: Library },
  { label: 'Discover', path: '/discover', aliases: ['/discover'], icon: Compass },
  { label: 'Stats', path: '/reading-stats', aliases: ['/reading-stats', '/stats'], icon: BarChart2 },
  { label: 'Profile', path: '/profile', aliases: ['/profile'], icon: User },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#e8e4db] bg-white/90 px-2 pt-2 shadow-[0_-8px_30px_rgba(15,20,25,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#111827]/90 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {navItems.map(({ label, path, aliases, icon: Icon }) => {
          const active = aliases.some((alias) =>
            location.pathname === alias || location.pathname.startsWith(`${alias}/`)
          );

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors',
                active
                  ? 'text-[#c97b6b]'
                  : 'text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
