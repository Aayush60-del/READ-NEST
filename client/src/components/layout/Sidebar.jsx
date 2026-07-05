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
        <motion.aside
            className="fixed inset-y-0 left-0 z-50 bg-card hidden lg:flex flex-col pt-8 pb-8 border-r border-border transition-colors w-[256px]"
        >
            <div className="px-8 mb-10">
                <NavLink to="/overview" className="block">
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground transition-colors">ReadNest</h1>
                </NavLink>
                <p className="text-[10px] tracking-[0.2em] text-primary mt-1 uppercase opacity-80 transition-colors">Literary Sanctuary</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md transition-colors"></div>}
                                    <AnimateIcon animate={isActive} animateOnHover animation={isActive ? 'pulse' : 'float'} className="mr-4">
                                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </AnimateIcon>
                                    <span className={`text-sm tracking-wide transition-colors ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="px-6 mt-auto flex flex-col gap-6">
                <div className="space-y-1 border-t border-border pt-4">
                    <NavLink
                        to="/settings"
                        className="flex items-center px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm font-medium tracking-wide"
                    >
                        <AnimateIcon animateOnHover animation="turn" className="mr-4"><Settings className="w-4 h-4" /></AnimateIcon>
                        Settings
                    </NavLink>
                    <NavLink
                        to="/feedback"
                        className="w-full flex items-center px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm font-medium tracking-wide"
                    >
                        <AnimateIcon animateOnHover animation="pulse" className="mr-4"><HelpCircle className="w-4 h-4" /></AnimateIcon>
                        Support
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all text-sm font-medium tracking-wide"
                    >
                        <AnimateIcon animateOnHover animation="turn" className="mr-4"><LogOut className="w-4 h-4" /></AnimateIcon>
                        Logout
                    </button>
                </div>
            </div>
        </motion.aside>
    );
};

