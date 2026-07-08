import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Library,
    Compass,
    BarChart2,
    Settings,
    HelpCircle,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import { clearSession, getStoredSession } from '../../lib/api';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

export const Sidebar = () => {
    const navigate = useNavigate();
    const { user } = getStoredSession();

    const navItems = [
        { icon: Home, label: 'Home', path: '/overview' },
        { icon: Library, label: 'My Library', path: '/library' },
        { icon: Compass, label: 'Discover', path: '/discover' },
        { icon: BarChart2, label: 'Reading Stats', path: '/stats' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ icon: ShieldAlert, label: 'System Control', path: '/admin' });
    }

    const handleLogout = () => {
        clearSession();
        navigate('/');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] flex-col border-r border-slate-200 bg-white pt-8 pb-8 text-slate-900 shadow-sm transition-colors dark:border-slate-800 dark:bg-[#090b11] dark:text-slate-100 lg:flex">
            <div className="px-6 mb-8">
                <NavLink to="/overview" className="block">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 transition-colors dark:text-white">ReadNest</h1>
                </NavLink>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold transition-colors dark:text-slate-400">Literary Sanctuary</p>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group relative text-sm font-medium
                                ${isActive
                                    ? 'bg-slate-100 text-[#c96f5c] dark:bg-white/[0.06] dark:text-[#ff9c7a]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.03] dark:hover:text-slate-100'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#c96f5c] dark:bg-[#ff9c7a] rounded-r-full transition-colors"></div>}
                                    <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-[#c96f5c] dark:text-[#ff9c7a]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                    <span className="tracking-wide">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="px-3 mt-auto flex flex-col gap-1">
                <div className="space-y-1 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <NavLink
                        to="/settings"
                        className="flex items-center px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium tracking-wide dark:text-slate-400 dark:hover:bg-white/[0.03] dark:hover:text-slate-100"
                    >
                        <Settings className="w-4 h-4 mr-3 text-slate-400" />
                        Settings
                    </NavLink>
                    <NavLink
                        to="/feedback"
                        className="flex items-center px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium tracking-wide dark:text-slate-400 dark:hover:bg-white/[0.03] dark:hover:text-slate-100"
                    >
                        <HelpCircle className="w-4 h-4 mr-3 text-slate-400" />
                        Support
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2.5 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-all text-sm font-medium tracking-wide"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

