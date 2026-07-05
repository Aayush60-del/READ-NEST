import ReaderCharacterMotion from "@/components/visuals/ReaderCharacterMotion";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Compass, BookOpen, Search, X } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';
import BookCover from '@/components/books/BookCover';
import BookCard from '@/components/books/BookCard';
const normalizeCategory = (category) => {
    if (Array.isArray(category)) return category[0] || 'General';
    return category || 'General';
};

const DiscoverPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState('All');
    const rowRef = useRef(null);

    useEffect(() => {
        const paramSearch = (searchParams.get('search') || '').trim();
        setSearchQuery(paramSearch);
    }, [searchParams]);

    const updateSearch = (value) => {
        setSearchQuery(value);
        const nextParams = new URLSearchParams(searchParams);
        const trimmedValue = value.trim();
        if (trimmedValue) nextParams.set('search', trimmedValue);
        else nextParams.delete('search');
        setSearchParams(nextParams, { replace: true });
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await api.get(ENDPOINTS.BOOKS.LIST);
                setBooks(res?.data || []);
            } catch (error) {
                console.error("Failed to load discover books:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const categories = useMemo(() => {
        const unique = new Set(books.flatMap((book) => Array.isArray(book.category) ? book.category : [book.category || 'General']));
        return ['All', ...[...unique].filter(Boolean)];
    }, [books]);

    const visibleBooks = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return books.filter((book) => {
            const category = Array.isArray(book.category) ? book.category : [book.category || 'General'];
            const matchesCategory = activeCategory === 'All' || category.includes(activeCategory);
            const searchableText = [
                book.title,
                book.author,
                ...category,
            ].filter(Boolean).join(' ').toLowerCase();
            const matchesQuery = !query || searchableText.includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [books, searchQuery, activeCategory]);

    const featuredBook = visibleBooks[0] || null;
    const trendingBooks = visibleBooks.slice(1);

    const curatedCollections = [
        { title: 'Deep Focus Reads', count: 'Build attention', gradient: 'from-[#2c3e50] to-[#000000]' },
        { title: 'Weekend Escapes', count: 'Light stories', gradient: 'from-[#4b1d52] to-[#110517]' },
        { title: 'Timeless Classics', count: 'Essential picks', gradient: 'from-[#5e4b3c] to-[#1a120b]' },
    ];

    const scrollRow = (direction) => {
        rowRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
    };

    return (
        <div className="discover-page min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-[#1a1a1a] dark:text-[#e4e2e1] font-sans flex transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
                <DashboardNavbar />

                <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-10 pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#f0ece1] dark:bg-[#1c2535] rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-lg shrink-0">
                                <Compass className="w-6 h-6 text-[#c97b6b]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#c97b6b] mb-2">Discover</p>
                                <h1 className="text-4xl md:text-5xl font-serif text-black dark:text-white tracking-tight">Find your next book.</h1>
                                <p className="text-black/50 dark:text-white/50 italic font-serif text-lg mt-2">Search, filter, and pick a world to enter.</p>
                            </div>
                        </div>

                        <div className="w-full lg:w-[380px] bg-white dark:bg-[#161d27] border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                            <Search className="w-4 h-4 text-black/35 dark:text-white/35" />
                            <input
                                value={searchQuery}
                                onChange={(event) => updateSearch(event.target.value)}
                                placeholder="Search title, author, category..."
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-black dark:text-white placeholder-black/35 dark:placeholder-white/35"
                            />
                            {searchQuery.trim() && (
                                <button
                                    type="button"
                                    onClick={() => updateSearch('')}
                                    className="rounded-full p-1 text-black/35 transition-colors hover:bg-black/5 hover:text-black dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-8">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border whitespace-nowrap transition-all ${activeCategory === category
                                    ? 'bg-[#c97b6b] border-[#c97b6b] text-white shadow-lg shadow-[#c97b6b]/20'
                                    : 'bg-white dark:bg-[#161d27] border-black/5 dark:border-white/5 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {!loading && visibleBooks.length === 0 ? (
                        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-lg dark:border-white/5 dark:bg-[#161d27] md:grid-cols-[0.9fr_1.1fr]">
                            <ReaderCharacterMotion size="medium" imageClassName="h-[260px]" showBadge={false} dark />
                            <div className="text-center md:text-left">
                                <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#c97b6b] md:mx-0" />
                                <h2 className="font-serif text-3xl text-black dark:text-white">
                                    {searchQuery.trim() ? `No books found for "${searchQuery.trim()}"` : 'No matching books yet.'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/55">Try a different title, author, or category. The discovery shelf updates instantly as your catalog grows.</p>
                                <button onClick={() => { updateSearch(''); setActiveCategory('All'); }} className="mt-6 inline-flex rounded-xl bg-[#c97b6b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#b8695c]">Clear Filters</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {featuredBook && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full min-h-[420px] bg-white dark:bg-[#161d27] rounded-[2rem] overflow-hidden relative shadow-2xl border border-black/5 dark:border-white/5 mb-14 flex items-center group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 dark:from-black/80 dark:via-[#161d27]/95 dark:to-transparent z-10"></div>
                                    <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#c97b6b]/20 blur-3xl"></div>

                                    <div className="relative z-20 w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center h-full">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-[#c97b6b]/20 text-[#c97b6b] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#c97b6b]/20 backdrop-blur-sm">Featured</span>
                                            <span className="bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-black/10 dark:border-white/10 backdrop-blur-sm">{normalizeCategory(featuredBook.category)}</span>
                                        </div>

                                        <h2 className="text-3xl md:text-5xl font-serif text-black dark:text-white mb-2 leading-tight group-hover:text-[#c97b6b] transition-colors">{featuredBook.title}</h2>
                                        <p className="font-sans text-xl text-[#c97b6b] mb-6 italic">- {featuredBook.author}</p>
                                        <p className="text-black/60 dark:text-white/60 leading-relaxed font-serif text-lg mb-8 line-clamp-3">
                                            {featuredBook.description || 'A fresh pick from your ReadNest library.'}
                                        </p>

                                        <Link to={`/books/${featuredBook._id}`} className="w-full text-center md:w-max px-8 py-4 bg-[#111827] text-white dark:bg-white dark:text-black font-bold text-sm tracking-wider uppercase rounded-xl hover:scale-105 transition-transform shadow-lg">
                                            View Manuscript
                                        </Link>
                                    </div>

                                    <div className="hidden md:block absolute right-16 lg:right-24 top-1/2 -translate-y-1/2 w-[230px] aspect-[2/3] z-20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                                        <div className="w-full h-full bg-[#121c25] rounded-xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center border border-black/10 dark:border-white/10">
                                            <BookCover
                                                src={featuredBook.coverImage}
                                                title={featuredBook.title}
                                                author={featuredBook.author}
                                                priority
                                                rounded="rounded-xl"
                                            />
                                        </div>
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/60 blur-xl rounded-[100%]"></div>
                                    </div>
                                </motion.div>
                            )}

                            {trendingBooks.length > 0 && (
                                <div className="mb-16">
                                    <div className="flex items-end justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-6 h-6 text-[#c97b6b]" />
                                            <h2 className="text-3xl font-serif text-black dark:text-white">Trending Now</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => scrollRow(-1)} className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 grid place-items-center hover:bg-black/5 dark:hover:bg-white/5" aria-label="Scroll left"><ChevronLeft className="w-4 h-4" /></button>
                                            <button onClick={() => scrollRow(1)} className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 grid place-items-center hover:bg-black/5 dark:hover:bg-white/5" aria-label="Scroll right"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div ref={rowRef} className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide scroll-smooth">
                                        {trendingBooks.map((book) => (
                                            <BookCard
                                                key={book._id}
                                                book={book}
                                                to={`/books/${book._id}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-16">
                                <h2 className="text-3xl font-serif text-black dark:text-white mb-8">Curated Collections</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {curatedCollections.map((collection) => (
                                        <div key={collection.title} className={`h-48 rounded-[1.5rem] bg-gradient-to-br ${collection.gradient} p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-xl`}>
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                            <div className="relative z-10">
                                                <h3 className="font-serif text-2xl text-white mb-1">{collection.title}</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#c97b6b]">{collection.count}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DiscoverPage;


