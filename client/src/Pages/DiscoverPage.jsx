import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Compass,
    Library,
    RefreshCw,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import api, { ENDPOINTS } from '@/lib/api';
import BookCover from '@/components/books/BookCover';
import BookCard from '@/components/books/BookCard';

const unwrapBooks = (response) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? [];
    return Array.isArray(payload) ? payload : [];
};

const getBookId = (book) => book?._id || book?.id;

const getBookCategories = (book) => {
    const raw = book?.category ?? book?.genre ?? book?.categories ?? book?.genres;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return raw ? [raw] : [];
};

const getPrimaryCategory = (book) => getBookCategories(book)[0] || '';

const EmptyState = ({ title, text, action, onAction, to, icon: Icon = BookOpen }) => (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[32px] border border-dashed border-[#d7cfc4] bg-white/70 p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#161d27]/70">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#c97b6b]/10 text-[#c97b6b]">
            <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold text-black dark:text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/55">{text}</p>
        {to ? (
            <Link to={to} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#c97b6b] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b8695c]">
                {action}
            </Link>
        ) : (
            <button type="button" onClick={onAction} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#c97b6b] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#b8695c]">
                <RefreshCw className="h-4 w-4" />
                {action}
            </button>
        )}
    </div>
);

const LoadingShelves = () => (
    <>
        <div className="mb-10 grid min-h-[360px] animate-pulse rounded-[32px] border border-[#e8e4db] bg-white/70 dark:border-white/5 dark:bg-[#161d27]/70 lg:grid-cols-[0.72fr_1fr]" />
        <div className="flex gap-5 overflow-hidden pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-[145px] shrink-0 sm:w-[180px] lg:w-[210px]">
                    <div className="aspect-[2/3] animate-pulse rounded-2xl bg-white dark:bg-[#161d27]" />
                    <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                </div>
            ))}
        </div>
    </>
);

const DiscoverPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState('All');
    const rowRef = useRef(null);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.BOOKS.LIST);
            setBooks(unwrapBooks(res));
        } catch (error) {
            console.error("Failed to load discover books:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

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

    const clearFilters = () => {
        updateSearch('');
        setActiveCategory('All');
    };

    const categories = useMemo(() => {
        const unique = new Set();
        books.forEach((book) => {
            getBookCategories(book).forEach((category) => unique.add(category));
        });
        return ['All', ...Array.from(unique).sort((a, b) => String(a).localeCompare(String(b)))];
    }, [books]);

    const visibleBooks = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return books.filter((book) => {
            const categoriesForBook = getBookCategories(book);
            const matchesCategory = activeCategory === 'All' || categoriesForBook.includes(activeCategory);
            const searchableText = [
                book.title,
                book.author,
                book.description,
                ...categoriesForBook,
            ].filter(Boolean).join(' ').toLowerCase();
            const matchesQuery = !query || searchableText.includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [books, searchQuery, activeCategory]);

    const featuredBook = visibleBooks[0] || null;
    const shelfBooks = visibleBooks.slice(featuredBook ? 1 : 0);
    const hasSearchOrFilter = Boolean(searchQuery.trim()) || activeCategory !== 'All';
    const resultLabel = searchQuery.trim()
        ? `Showing ${visibleBooks.length} ${visibleBooks.length === 1 ? 'result' : 'results'} for ${searchQuery.trim()}`
        : activeCategory !== 'All'
        ? `${visibleBooks.length} ${visibleBooks.length === 1 ? 'book' : 'books'} in ${activeCategory}`
        : 'Explore all books';

    const scrollRow = (direction) => {
        rowRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] text-[#1a1a1a] transition-colors duration-300 dark:bg-[#0f1419] dark:text-[#e4e2e1]">
            <Sidebar />

            <main className="min-h-screen w-full min-w-0 overflow-x-hidden pb-28 transition-all duration-300 ease-in-out lg:ml-[256px] lg:pb-16">
                <DashboardNavbar />

                <div className="ml-0 mr-auto w-full max-w-[1240px] px-4 pb-8 pt-4 sm:px-10 sm:pt-6">
                    <section className="mb-6 rounded-[32px] border border-[#e8e4db] bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#161d27]/70 sm:p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8e4db] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
                                    <Compass className="h-3.5 w-3.5 text-[#c97b6b]" />
                                    Book marketplace
                                </div>
                                <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white sm:text-4xl">
                                    Discover Books
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55 dark:text-white/55 sm:text-base">
                                    Find your next read, explore curated titles, and build your personal library.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/library" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#e8e4db] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:border-[#c97b6b]/40 hover:text-[#c97b6b] dark:border-white/10 dark:bg-white/5 dark:text-white">
                                    Explore library
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="mb-6 rounded-[28px] border border-[#e8e4db] bg-white p-3 shadow-sm dark:border-white/5 dark:bg-[#161d27]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#e8e4db] bg-[#fcf9f2] px-4 py-3 dark:border-white/5 dark:bg-[#0f1419]">
                                <Search className="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => updateSearch(event.target.value)}
                                    placeholder="Search title, author, category..."
                                    className="w-full border-none bg-transparent p-0 text-sm text-black outline-none placeholder:text-black/30 focus:ring-0 dark:text-white dark:placeholder:text-white/30"
                                />
                                {searchQuery.trim() ? (
                                    <button
                                        type="button"
                                        onClick={() => updateSearch('')}
                                        className="rounded-full p-1 text-black/35 transition-colors hover:bg-black/5 hover:text-black dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>

                            <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-black/45 dark:text-white/45">
                                {loading ? 'Loading books' : resultLabel}
                            </p>
                        </div>
                    </section>

                    {categories.length > 1 ? (
                        <div className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`min-h-10 whitespace-nowrap rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                                        activeCategory === category
                                            ? 'border-[#c97b6b] bg-[#c97b6b] text-white shadow-lg shadow-[#c97b6b]/20'
                                            : 'border-[#e8e4db] bg-white text-black/50 hover:text-black dark:border-white/5 dark:bg-[#161d27] dark:text-white/50 dark:hover:text-white'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {loading ? (
                        <LoadingShelves />
                    ) : books.length === 0 ? (
                        <EmptyState
                            icon={Library}
                            title="No books available yet"
                            text="Books added by the admin will appear here."
                            action="Refresh"
                            onAction={fetchBooks}
                        />
                    ) : visibleBooks.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="No books found"
                            text="Try another title, author, or category."
                            action="Clear filters"
                            onAction={clearFilters}
                        />
                    ) : (
                        <>
                            {featuredBook ? (
                                <motion.section
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35 }}
                                    className="mb-10 overflow-hidden rounded-[32px] border border-[#e8e4db] bg-white shadow-[0_24px_80px_rgba(31,41,55,0.08)] dark:border-white/5 dark:bg-[#161d27] dark:shadow-black/20"
                                >
                                    <div className="grid min-h-[360px] lg:grid-cols-[0.72fr_1fr]">
                                        <div className="relative flex items-center justify-center overflow-hidden bg-[#f2e8dc] p-8 dark:bg-[#111827]">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_24%,rgba(201,123,107,0.26),transparent_34%)]" />
                                            <div className="relative aspect-[2/3] h-[260px] overflow-hidden rounded-2xl border border-white/50 bg-[#d3bca8] shadow-2xl dark:border-white/10 dark:bg-[#1c2535] sm:h-[300px]">
                                                <BookCover
                                                    src={featuredBook.coverImage}
                                                    title={featuredBook.title}
                                                    author={featuredBook.author}
                                                    priority
                                                    rounded="rounded-2xl"
                                                    imageClassName="object-contain bg-[#f2e8dc] dark:bg-[#1c2535]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                            <div className="mb-4 flex flex-wrap gap-2">
                                                <span className="rounded-full border border-[#c97b6b]/20 bg-[#c97b6b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c97b6b]">
                                                    Featured
                                                </span>
                                                {getPrimaryCategory(featuredBook) ? (
                                                    <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black/55 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
                                                        {getPrimaryCategory(featuredBook)}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <h2 className="text-3xl font-semibold leading-tight text-black dark:text-white sm:text-4xl">
                                                {featuredBook.title || 'Untitled book'}
                                            </h2>
                                            <p className="mt-3 text-sm font-semibold text-[#c97b6b]">
                                                {featuredBook.author || 'Unknown author'}
                                            </p>
                                            {featuredBook.description ? (
                                                <p className="mt-5 line-clamp-3 max-w-2xl text-sm leading-6 text-black/60 dark:text-white/60">
                                                    {featuredBook.description}
                                                </p>
                                            ) : null}
                                            <Link
                                                to={`/books/${getBookId(featuredBook)}`}
                                                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3b2a1a] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2f2115] dark:bg-white dark:text-black dark:hover:bg-[#f2e8dc] sm:w-max"
                                            >
                                                View Details
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.section>
                            ) : null}

                            <section className="mb-10">
                                <div className="mb-5 flex items-end justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-[#c97b6b]">
                                            <Sparkles className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                                                {hasSearchOrFilter ? 'Search results' : 'Browse'}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-semibold text-black dark:text-white">
                                            {hasSearchOrFilter ? 'Matching Books' : 'All Books'}
                                        </h2>
                                        <p className="mt-2 text-sm text-black/50 dark:text-white/50">
                                            {hasSearchOrFilter ? 'Filtered from the current ReadNest catalog.' : 'Explore every available title in the catalog.'}
                                        </p>
                                    </div>
                                    <div className="hidden gap-2 sm:flex">
                                        <button type="button" onClick={() => scrollRow(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-black/55 transition hover:bg-black/5 dark:border-white/10 dark:text-white/55 dark:hover:bg-white/5" aria-label="Scroll books left">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => scrollRow(1)} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-black/55 transition hover:bg-black/5 dark:border-white/10 dark:text-white/55 dark:hover:bg-white/5" aria-label="Scroll books right">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div ref={rowRef} className="scrollbar-hide flex gap-5 overflow-x-auto pb-6 scroll-smooth md:gap-6">
                                    {(shelfBooks.length ? shelfBooks : visibleBooks).map((book) => (
                                        <BookCard
                                            key={getBookId(book)}
                                            book={book}
                                            to={`/books/${getBookId(book)}`}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DiscoverPage;
