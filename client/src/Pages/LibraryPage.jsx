import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    ChevronDown,
    Layers3,
    Library,
    Percent,
    RotateCcw,
    Search as SearchIcon,
    SlidersHorizontal,
    Trophy,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import api, { ENDPOINTS } from '@/lib/api';
import BookCard from '@/components/books/BookCard';

const getBookId = (book) => book?.bookId?._id || book?.bookId || book?._id || book?.id;
const getProgress = (book) => Math.min(100, Math.max(0, Number(book?.percentageCompleted ?? book?.progress ?? 0) || 0));

const getStatsValue = (stats, key, fallback = 0) => {
    const value = stats?.[key];
    return value === 0 ? 0 : value ?? fallback;
};

const SummaryCard = ({ icon: Icon, label, value, loading, accent = false }) => (
    <div className={`flex min-h-[142px] flex-col justify-between rounded-[28px] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${
        accent
            ? 'border-[#ff7a4f]/25 bg-[#ff7a4f]/10 text-[#ff9c7a]'
            : 'border-[#e8e4db] bg-white/75 dark:border-white/[0.08] dark:bg-[#0f1726]/75'
    }`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            accent
                ? 'bg-[#ff7a4f]/12 text-[#ff9c7a]'
                : 'bg-white/[0.06] text-slate-400'
        }`}>
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <div className={`text-3xl font-semibold ${accent ? 'text-[#c96f5c] dark:text-[#ff9c7a]' : 'text-[#111827] dark:text-white'}`}>
                {loading ? '-' : value}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {label}
            </div>
        </div>
    </div>
);

const LoadingGrid = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="min-w-0">
                <div className="aspect-[2/3] w-full animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.05]" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-white/[0.08]" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-white/[0.08]" />
                <div className="mt-4 h-11 animate-pulse rounded-2xl bg-white/[0.08]" />
            </div>
        ))}
    </div>
);

const EmptyState = ({ icon: Icon = BookOpen, title, text, action, onAction, to }) => (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[32px] border border-dashed border-[#d7cfc4] bg-white/75 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.12] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#ff7a4f]/10 text-[#ff9c7a]">
            <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold text-[#111827] dark:text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
        {to ? (
            <Link to={to} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#ff7a4f] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#e9683f]">
                {action}
            </Link>
        ) : (
            <button type="button" onClick={onAction} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#ff7a4f] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#e9683f]">
                <RotateCcw className="h-4 w-4" />
                {action}
            </button>
        )}
    </div>
);

const LibraryPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [books, setBooks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    useEffect(() => {
        const fetchLibraryData = async () => {
            try {
                const [booksRes, statsRes] = await Promise.all([
                    api.get(ENDPOINTS.BOOKS.MY_LIBRARY),
                    api.get(ENDPOINTS.BOOKS.STATS)
                ]);

                const formattedBooks = (booksRes?.data || []).map(b => {
                    const sourceBook = typeof b.bookId === 'object' ? b.bookId : b;
                    const progress = getProgress(b);
                    const isCompleted = Boolean(b.isCompleted) || progress >= 100;
                    const currentPage = Number(b.currentPage ?? b.pagesRead ?? 0) || 0;

                    return {
                        id: getBookId(b),
                        title: b.title || sourceBook?.title || 'Unknown Title',
                        author: b.author || sourceBook?.author || 'Unknown Author',
                        category: b.category || sourceBook?.category || sourceBook?.genre || '',
                        coverImage: b.coverImage || b.coverUrl || b.image || b.thumbnail || sourceBook?.coverImage,
                        coverUrl: b.coverUrl || sourceBook?.coverUrl,
                        image: b.image || sourceBook?.image,
                        thumbnail: b.thumbnail || sourceBook?.thumbnail,
                        progress,
                        currentPage,
                        pagesRead: currentPage,
                        totalPages: Number(b.totalPages ?? sourceBook?.totalPages ?? 0) || 0,
                        lastReadAt: b.lastReadAt || b.updatedAt || sourceBook?.updatedAt || b.createdAt || '',
                        updatedAt: b.updatedAt || sourceBook?.updatedAt || b.createdAt || '',
                        isCompleted,
                        status: isCompleted ? 'completed' : 'reading'
                    };
                });

                setBooks(formattedBooks);
                setStats(statsRes?.data || null);
            } catch (err) {
                console.error("Failed to load library data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLibraryData();
    }, []);

    const filteredBooks = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return books
            .filter(book => {
                if (activeTab === 'Reading') return !book.isCompleted;
                if (activeTab === 'Completed') return book.isCompleted;
                return true;
            })
            .filter(book => {
                if (!query) return true;
                return `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query);
            })
            .sort((a, b) => {
                if (sortBy === 'progress') return b.progress - a.progress;
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                return new Date(b.lastReadAt || b.updatedAt || 0) - new Date(a.lastReadAt || a.updatedAt || 0);
            });
    }, [books, activeTab, searchQuery, sortBy]);

    const resetFilters = () => {
        setSearchQuery('');
        setActiveTab('All');
        setSortBy('recent');
    };

    const totalBooks = books.length;
    const currentlyReading = books.filter(book => !book.isCompleted).length;
    const completedBooks = books.filter(book => book.isCompleted).length;
    const averageProgress = totalBooks
        ? Math.round(books.reduce((sum, book) => sum + (Number(book.progress) || 0), 0) / totalBooks)
        : 0;

    const emptyFilterText = searchQuery.trim()
        ? `No books match "${searchQuery.trim()}" in ${activeTab.toLowerCase()} books.`
        : `No books found in the ${activeTab.toLowerCase()} filter.`;

    return (
        <div className="min-h-screen bg-[#fcf9f2] text-[#111827] transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
            <Sidebar />

            <main className="min-h-screen w-full min-w-0 overflow-x-hidden pb-28 transition-all duration-300 ease-in-out lg:ml-[256px] lg:pb-16">
                <DashboardNavbar />

                <div className="relative ml-0 mr-auto w-full max-w-[1240px] px-4 pb-8 pt-4 sm:px-10 sm:pt-6">
                    <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#c97b6b]/10 blur-3xl" />
                    <section className="relative z-10 mb-8 rounded-[32px] border border-[#e8e4db] bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c97b6b]">Reading workspace</p>
                                <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-white sm:text-4xl">
                                    My Library
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                                    Your personal reading space. Continue books, track progress, and organize your reading journey.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 rounded-3xl border border-[#e8e4db] bg-white/70 p-2 text-center shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
                                <div className="px-3 py-2">
                                    <p className="text-lg font-semibold text-[#111827] dark:text-white">{loading ? '-' : totalBooks}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Books</p>
                                </div>
                                <div className="px-3 py-2">
                                    <p className="text-lg font-semibold text-[#111827] dark:text-white">{loading ? '-' : currentlyReading}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Reading</p>
                                </div>
                                <div className="px-3 py-2">
                                    <p className="text-lg font-semibold text-[#111827] dark:text-white">{loading ? '-' : completedBooks}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Done</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="relative z-10 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                        <SummaryCard icon={Library} label="Total Books" value={totalBooks} loading={loading} />
                        <SummaryCard icon={BookOpen} label="Currently Reading" value={getStatsValue(stats, 'CurrentlyReading', currentlyReading)} loading={loading} />
                        <SummaryCard icon={Trophy} label="Completed" value={getStatsValue(stats, 'CompletedBooks', completedBooks)} loading={loading} />
                        <SummaryCard icon={Percent} label="Average Progress" value={`${averageProgress}%`} loading={loading} accent />
                    </section>

                    <section className="relative z-10 mb-8 rounded-[28px] border border-[#e8e4db] bg-white/75 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#e8e4db] bg-[#fcf9f2] px-4 py-3 dark:border-white/[0.08] dark:bg-[#070b12]">
                                <SearchIcon className="h-5 w-5 shrink-0 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search by title, author, or category..."
                                    className="w-full border-none bg-transparent p-0 text-sm text-[#111827] outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-600"
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex rounded-full border border-[#e8e4db] bg-[#fcf9f2] p-1.5 dark:border-white/[0.08] dark:bg-[#070b12]">
                                    {['All', 'Reading', 'Completed'].map(tab => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveTab(tab)}
                                            className={`min-h-10 flex-1 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all sm:flex-none sm:px-5 ${
                                                activeTab === tab
                                                    ? 'bg-[#c97b6b] text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-[#111827] dark:hover:text-white'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex min-h-12 items-center gap-3 rounded-2xl border border-[#e8e4db] bg-[#fcf9f2] px-4 dark:border-white/[0.08] dark:bg-[#070b12]">
                                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sort</span>
                                    <select
                                        value={sortBy}
                                        onChange={(event) => setSortBy(event.target.value)}
                                        className="w-full cursor-pointer appearance-none border-none bg-transparent py-0 pl-0 pr-8 text-sm font-medium text-[#111827] focus:ring-0 dark:text-white sm:w-auto"
                                    >
                                        <option value="recent">Recently Read</option>
                                        <option value="progress">Progress</option>
                                        <option value="title">Title A-Z</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 opacity-50" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {loading ? (
                        <LoadingGrid />
                    ) : books.length === 0 ? (
                        <EmptyState
                            icon={Library}
                            title="Your library is empty"
                            text="Explore books and add your first read to start tracking progress."
                            action="Discover Books"
                            to="/discover"
                        />
                    ) : filteredBooks.length === 0 ? (
                        <EmptyState
                            icon={SearchIcon}
                            title="No books found"
                            text={emptyFilterText}
                            action="Clear filters"
                            onAction={resetFilters}
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {filteredBooks.map((book) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        transition={{ duration: 0.24 }}
                                        key={book.id}
                                        className="min-w-0"
                                    >
                                        <BookCard
                                            book={book}
                                            to={`/books/${book.id}`}
                                            variant="library"
                                            showProgress
                                            progress={book.progress}
                                            className="w-full min-w-0"
                                        />
                                        <Link
                                            to={`/books/${book.id}/read`}
                                            className={`mt-4 flex min-h-11 w-full items-center justify-center rounded-2xl px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
                                                book.status === 'completed'
                                                    ? 'border border-[#e8e4db] bg-white/70 text-[#111827] hover:border-[#c97b6b]/35 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:border-[#ff7a4f]/35 dark:hover:text-[#ff9c7a]'
                                                    : 'bg-[#ff7a4f] text-white shadow-lg shadow-[#ff7a4f]/15 hover:bg-[#e9683f]'
                                            }`}
                                        >
                                            {book.status === 'completed' ? 'Read Again' : 'Continue Reading'}
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LibraryPage;
