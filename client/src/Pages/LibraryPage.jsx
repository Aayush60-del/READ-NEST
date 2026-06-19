import ReaderCharacterMotion from "@/components/visuals/ReaderCharacterMotion";
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ChevronDown, Check, BookOpen } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';
import BookCover from '@/components/books/BookCover';
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

                const formattedBooks = (booksRes?.data || []).map(b => ({
                    id: b.bookId,
                    title: b.title || 'Unknown Title',
                    author: b.author || 'Unknown Author',
                    coverImage: b.coverImage,
                    progress: b.percentageCompleted || 0,
                    pagesRead: b.currentPage || 0,
                    totalPages: b.totalPages || 0,
                    updatedAt: b.updatedAt || b.createdAt || '',
                    status: b.isCompleted ? 'completed' : 'reading'
                }));

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

    const filteredBooks = books
        .filter(book => {
            if (activeTab === 'Reading') return book.status === 'reading';
            if (activeTab === 'Completed') return book.status === 'completed';
            return true;
        })
        .filter(book => {
            const query = searchQuery.trim().toLowerCase();
            if (!query) return true;
            return `${book.title} ${book.author}`.toLowerCase().includes(query);
        })
        .sort((a, b) => {
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });

    return (
        <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-[#1a1a1a] dark:text-[#e4e2e1] font-sans flex transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-20">
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

                    <div className="flex mb-12 overflow-x-auto scrollbar-hide pb-2">
                        <div className="bg-[#ffffff] dark:bg-[#161d27] p-1.5 rounded-full inline-flex border border-black/5 dark:border-white/5 min-w-max">
                            {['All', 'Reading', 'Completed'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-[#c97b6b] text-white shadow-sm'
                                        : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-black/5 dark:border-white/5 gap-4 md:gap-0">
                        <div className="flex items-center gap-3 w-full md:w-1/3">
                            <SearchIcon className="w-5 h-5 text-black/40 dark:text-white/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search your library..."
                                className="bg-transparent border-none outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm w-full font-serif italic"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-black/40 dark:text-white/40">SORT BY:</span>
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value)}
                                    className="bg-transparent border-none p-0 text-sm text-black dark:text-white font-medium focus:ring-0 cursor-pointer"
                                >
                                    <option value="recent">Recently Read</option>
                                    <option value="progress">Progress</option>
                                    <option value="title">Title</option>
                                </select>
                                <ChevronDown className="w-4 h-4 opacity-50 -ml-6 pointer-events-none" />
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
                            <button onClick={() => { setSearchQuery(''); setActiveTab('All'); }} className="mt-4 px-6 py-2 bg-[#c97b6b] text-white rounded-lg">Clear filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                            <AnimatePresence mode='popLayout'>
                                {filteredBooks.map((book) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        key={book.id}
                                        className="group"
                                    >
                                        <Link to={`/books/${book.id}`} className="block">
                                            <div className={`w-full aspect-[2/3] bg-[#d3bca8] rounded-xl shadow-2xl relative overflow-hidden mb-5 transition-transform duration-500 group-hover:-translate-y-2 flex items-center justify-center`}>

                                                <BookCover
                                                    src={book.coverImage}
                                                    title={book.title}
                                                    author={book.author}
                                                    rounded="rounded-xl"
                                                    className="transition-transform duration-500 group-hover:scale-105"
                                                />

                                                <div className="absolute top-4 right-4">
                                                    {book.status === 'completed' ? (
                                                        <div className="bg-[#0e3b2e] border border-[#1b6b54] text-[#4ade80] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                                                            <Check className="w-3 h-3" />
                                                            <span className="text-[10px] font-bold tracking-widest uppercase">Completed</span>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-white px-3 py-1.5 rounded-full shadow-lg">
                                                            <span className="text-[10px] font-bold tracking-widest uppercase">{book.progress}%</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Spine shading */}
                                                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/50 to-transparent"></div>
                                            </div>
                                        </Link>

                                        <div>
                                            <h3 className="font-serif text-xl tracking-wide text-black dark:text-white mb-1 group-hover:text-[#c97b6b] transition-colors line-clamp-1">{book.title}</h3>
                                            <p className="font-sans text-sm text-black/50 dark:text-white/50 mb-5">{book.author}</p>

                                            <div className="mb-4">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 dark:text-white/40">{book.status === 'completed' ? `Completed` : 'Progress'}</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-black/60 dark:text-white/60">{book.status === 'completed' ? '100%' : `${book.pagesRead}/${book.totalPages} pp.`}</span>
                                                </div>
                                                <div className="h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${book.progress}%` }}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                        className={`h-full ${book.status === 'completed' ? 'bg-[#4ade80]' : 'bg-[#c97b6b]'} rounded-full shadow-[0_0_10px_rgba(232,165,80,0.5)]`}
                                                    />
                                                </div>
                                            </div>

                                            <Link to={`/books/${book.id}/read`} className={`block w-full py-3.5 text-center text-xs font-bold tracking-widest uppercase rounded flex items-center justify-center transition-all ${book.status === 'completed'
                                                ? 'bg-transparent border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                                : 'bg-[#3b2a1a] dark:bg-white text-white dark:text-black hover:opacity-90 shadow-lg'
                                                }`}>
                                                {book.status === 'completed' ? 'Read Again' : 'Continue Reading'}
                                            </Link>
                                        </div>
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


