import ReaderCharacterMotion from "@/components/visuals/ReaderCharacterMotion";
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ChevronDown, BookOpen } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';
import BookCard from '@/components/books/BookCard';

const getBookId = (book) => book?.bookId?._id || book?.bookId || book?._id || book?.id;
const getProgress = (book) => Math.min(100, Math.max(0, Number(book?.percentageCompleted ?? book?.progress ?? 0) || 0));

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
                return `${book.title} ${book.author}`.toLowerCase().includes(query);
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

    return (
        <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-[#1a1a1a] dark:text-[#e4e2e1] font-sans flex transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
                <DashboardNavbar />

                <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-10 pt-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 md:gap-0">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif text-black dark:text-white mb-2 tracking-tight">My Library</h1>
                            <p className="text-black/60 dark:text-white/60 italic font-serif text-base md:text-lg">Your personal reading collection</p>
                        </div>
                        <div className="px-5 py-2.5 bg-[#f0ece1] dark:bg-[#1c2535] rounded-full flex items-center gap-3 border border-black/5 dark:border-white/5 shadow-sm">
                            <div className="w-2 h-2 bg-[#c97b6b] rounded-full shadow-[0_0_8px_rgba(232,165,80,0.8)]"></div>
                            <span className="text-xs font-bold tracking-widest text-black dark:text-white uppercase">{books.length} BOOKS</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                        <div className="bg-[#ffffff] dark:bg-[#161d27] p-4 md:p-6 rounded-xl border border-black/5 dark:border-white/5 shadow-lg">
                            <div className="text-[10px] font-bold tracking-widest uppercase text-black/50 dark:text-white/50 mb-3">CURRENTLY READING</div>
                            <div className="font-serif text-4xl text-black dark:text-white">{stats ? stats.CurrentlyReading : 0}</div>
                        </div>
                        <div className="bg-[#ffffff] dark:bg-[#161d27] p-4 md:p-6 rounded-xl border border-black/5 dark:border-white/5 shadow-lg">
                            <div className="text-[10px] font-bold tracking-widest uppercase text-black/50 dark:text-white/50 mb-3">COMPLETED</div>
                            <div className="font-serif text-4xl text-black dark:text-white">{stats ? stats.CompletedBooks : 0}</div>
                        </div>
                        <div className="bg-[#ffffff] dark:bg-[#161d27] p-4 md:p-6 rounded-xl border border-black/5 dark:border-white/5 shadow-lg">
                            <div className="text-[10px] font-bold tracking-widest uppercase text-black/50 dark:text-white/50 mb-3">PAGES READ</div>
                            <div className="font-serif text-4xl text-black dark:text-white">{stats ? stats.totalPagesRead : 0}</div>
                        </div>
                        <div className="bg-[#ffffff] dark:bg-[#161d27] p-4 md:p-6 rounded-xl border border-black/5 dark:border-white/5 shadow-lg">
                            <div className="text-[10px] font-bold tracking-widest uppercase text-black/50 dark:text-white/50 mb-3">COMPLETION RATE</div>
                            <div className="font-serif text-4xl text-[#c97b6b]">{stats ? stats.CompletionRate : 0}%</div>
                        </div>
                    </div>

                    <div className="mb-8 rounded-2xl border border-black/5 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-[#161d27]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-black/5 bg-[#fcf9f2] px-4 py-3 dark:border-white/5 dark:bg-[#0f1419]">
                                <SearchIcon className="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search by title or author..."
                                    className="w-full border-none bg-transparent p-0 text-sm text-black outline-none placeholder:text-black/30 focus:ring-0 dark:text-white dark:placeholder:text-white/30"
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex overflow-x-auto scrollbar-hide rounded-full border border-black/5 bg-[#fcf9f2] p-1.5 dark:border-white/5 dark:bg-[#0f1419]">
                                    {['All', 'Reading', 'Completed'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                                ? 'bg-[#c97b6b] text-white shadow-sm'
                                                : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex items-center gap-3 rounded-xl border border-black/5 bg-[#fcf9f2] px-4 py-3 dark:border-white/5 dark:bg-[#0f1419]">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Sort</span>
                                    <select
                                        value={sortBy}
                                        onChange={(event) => setSortBy(event.target.value)}
                                        className="cursor-pointer appearance-none border-none bg-transparent py-0 pl-0 pr-7 text-sm font-medium text-black focus:ring-0 dark:text-white"
                                    >
                                        <option value="recent">Recently Read</option>
                                        <option value="progress">Progress</option>
                                        <option value="title">Title</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {!loading && books.length === 0 ? (
                        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-lg dark:border-white/5 dark:bg-[#161d27] md:grid-cols-[0.9fr_1.1fr]">
                            <ReaderCharacterMotion size="medium" imageClassName="h-[260px]" showBadge={false} dark />
                            <div className="text-center md:text-left">
                                <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#c97b6b] md:mx-0" />
                                <h2 className="font-serif text-3xl text-black dark:text-white">Your shelf is waiting.</h2>
                                <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/55">Add your first book and ReadNest will start tracking progress, streaks, and reading rhythm automatically.</p>
                                <Link to="/discover" className="mt-6 inline-flex rounded-xl bg-[#c97b6b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#b8695c]">Discover Books</Link>
                            </div>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-60">
                            <SearchIcon className="w-14 h-14 mb-4" />
                            <p className="text-xl font-serif">No books match your filters.</p>
                            <button onClick={resetFilters} className="mt-4 px-6 py-2 bg-[#c97b6b] text-white rounded-lg">Reset filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                            <AnimatePresence mode='popLayout'>
                                {filteredBooks.map((book) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
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
                                        <Link to={`/books/${book.id}/read`} className={`mt-4 flex w-full items-center justify-center rounded py-3.5 text-center text-xs font-bold uppercase tracking-widest transition-all ${book.status === 'completed'
                                                ? 'bg-transparent border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                                : 'bg-[#3b2a1a] dark:bg-white text-white dark:text-black hover:opacity-90 shadow-lg'
                                                }`}>
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


