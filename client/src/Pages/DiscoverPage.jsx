import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Compass,
    Library,
    RefreshCw,
    Search,
    Sparkles,
    TrendingUp,
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

const unwrapRecommendations = (response) => response?.data?.data ?? response?.data ?? response ?? {};

const getBookId = (book) => book?._id || book?.id;

const getBookCategories = (book) => {
    const raw = book?.category ?? book?.genre ?? book?.categories ?? book?.genres;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return raw ? [raw] : [];
};

const getPrimaryCategory = (book) => getBookCategories(book)[0] || '';

const EmptyState = ({ title, text, action, onAction, to, icon: Icon = BookOpen }) => (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[32px] border border-dashed border-[#d7cfc4] bg-white/75 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.12] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#ff7a4f]/10 text-[#ff9c7a]">
            <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold text-[#111827] dark:text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{text}</p>
        {to ? (
            <Link to={to} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#ff7a4f] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#e9683f]">
                {action}
            </Link>
        ) : (
            <button type="button" onClick={onAction} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#ff7a4f] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#e9683f]">
                <RefreshCw className="h-4 w-4" />
                {action}
            </button>
        )}
    </div>
);

const LoadingShelves = () => (
    <>
        <div className="mb-10 grid min-h-[360px] animate-pulse rounded-[32px] border border-white/[0.08] bg-white/[0.05] lg:grid-cols-[0.72fr_1fr]" />
        <div className="flex gap-5 overflow-hidden pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-[145px] shrink-0 sm:w-[180px] lg:w-[210px]">
                    <div className="aspect-[2/3] animate-pulse rounded-2xl bg-white/[0.05]" />
                    <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-white/[0.08]" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-white/[0.08]" />
                </div>
            ))}
        </div>
    </>
);

const RecommendationShelf = ({ title, subtitle, icon: Icon, books, rowId, showProgress = false }) => {
    const rowRef = useRef(null);

    if (!books?.length) return null;

    const scrollRow = (direction) => {
        rowRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
    };

    return (
        <section className="mb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-[#c97b6b]">
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                            Recommended
                        </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#111827] dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
                </div>
                <div className="hidden gap-2 sm:flex">
                    <button type="button" onClick={() => scrollRow(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e4db] bg-white/70 text-slate-500 transition hover:border-[#ff7a4f]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-[#ff9c7a]" aria-label={`Scroll ${title} left`}>
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => scrollRow(1)} className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e4db] bg-white/70 text-slate-500 transition hover:border-[#ff7a4f]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-[#ff9c7a]" aria-label={`Scroll ${title} right`}>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div ref={rowRef} id={rowId} className="scrollbar-hide flex gap-5 overflow-x-auto pb-6 scroll-smooth md:gap-6">
                {books.map((book) => (
                    <BookCard
                        key={`${rowId}-${getBookId(book)}`}
                        book={book}
                        to={`/books/${getBookId(book)}`}
                        variant="compact"
                        showProgress={showProgress || book.percentageCompleted !== undefined}
                    />
                ))}
            </div>
        </section>
    );
};

const DiscoverPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [recommendations, setRecommendations] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState('All');
    const rowRef = useRef(null);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const [booksResult, recommendationsResult] = await Promise.allSettled([
                api.get(ENDPOINTS.BOOKS.LIST),
                api.get(ENDPOINTS.BOOKS.DISCOVER_RECOMMENDATIONS),
            ]);

            if (booksResult.status === 'fulfilled') {
                setBooks(unwrapBooks(booksResult.value));
            } else {
                console.error("Failed to load discover books:", booksResult.reason);
                setBooks([]);
            }

            if (recommendationsResult.status === 'fulfilled') {
                setRecommendations(unwrapRecommendations(recommendationsResult.value));
            } else {
                console.error("Failed to load discover recommendations:", recommendationsResult.reason);
                setRecommendations({});
            }
        } catch (error) {
            console.error("Failed to load discover books:", error);
            setBooks([]);
            setRecommendations({});
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
    const recommendationShelves = useMemo(() => ([
        {
            key: 'continue-reading',
            title: 'Continue Reading',
            subtitle: 'Books you started and have not finished yet.',
            icon: BookOpen,
            books: recommendations.continueReading || [],
            showProgress: true,
        },
        {
            key: 'similar-genres',
            title: 'Similar Genres',
            subtitle: 'Fresh books from categories you already spend time with.',
            icon: Sparkles,
            books: recommendations.similarGenres || [],
        },
        {
            key: 'short-reads',
            title: 'Short Reads',
            subtitle: 'Lower page-count books for quick reading sessions.',
            icon: Clock3,
            books: recommendations.shortReads || [],
        },
        {
            key: 'unfinished-books',
            title: 'Unfinished Books',
            subtitle: 'Started books sorted by your latest reading activity.',
            icon: RefreshCw,
            books: recommendations.unfinishedBooks || [],
            showProgress: true,
        },
        {
            key: 'trending-library',
            title: 'Trending in Library',
            subtitle: 'Books with the most reader activity across ReadNest.',
            icon: TrendingUp,
            books: recommendations.trendingInLibrary || [],
            showProgress: true,
        },
    ]), [recommendations]);
    const showRecommendations = !hasSearchOrFilter && recommendationShelves.some((shelf) => shelf.books.length);
    const resultLabel = searchQuery.trim()
        ? `Showing ${visibleBooks.length} ${visibleBooks.length === 1 ? 'result' : 'results'} for ${searchQuery.trim()}`
        : activeCategory !== 'All'
        ? `${visibleBooks.length} ${visibleBooks.length === 1 ? 'book' : 'books'} in ${activeCategory}`
        : 'Explore all books';

    const scrollRow = (direction) => {
        rowRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f2] text-[#111827] transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
            <Sidebar />

            <main className="min-h-screen w-full min-w-0 overflow-x-hidden pb-28 transition-all duration-300 ease-in-out lg:ml-[256px] lg:pb-16">
                <DashboardNavbar />

                <div className="relative ml-0 mr-auto w-full max-w-[1240px] px-4 pb-8 pt-4 sm:px-10 sm:pt-6">
                    <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#c97b6b]/10 blur-3xl" />
                    <section className="relative z-10 mb-6 rounded-[32px] border border-[#e8e4db] bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    <Compass className="h-3.5 w-3.5 text-[#ff9c7a]" />
                                    Book marketplace
                                </div>
                                <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-white sm:text-4xl">
                                    Discover Books
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                                    Find your next read, explore curated titles, and build your personal library.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/library" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#e8e4db] bg-white/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#111827] transition hover:border-[#c97b6b]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:border-[#ff7a4f]/40 dark:hover:text-[#ff9c7a]">
                                    Explore library
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="relative z-10 mb-6 rounded-[28px] border border-[#e8e4db] bg-white/75 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#070b12] px-4 py-3">
                                <Search className="h-5 w-5 shrink-0 text-slate-500" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => updateSearch(event.target.value)}
                                    placeholder="Search title, author, category..."
                                    className="w-full border-none bg-transparent p-0 text-sm text-[#111827] outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-600"
                                />
                                {searchQuery.trim() ? (
                                    <button
                                        type="button"
                                        onClick={() => updateSearch('')}
                                        className="rounded-full p-1 text-slate-500 transition-colors hover:bg-[#ff7a4f]/8 hover:text-[#111827] dark:hover:bg-white/[0.06] dark:hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>

                            <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
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
                                            : 'border-[#e8e4db] bg-white/70 text-slate-500 hover:text-[#111827] dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:hover:text-white'
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
                            {showRecommendations ? (
                                <div className="relative z-10">
                                    {recommendationShelves.map((shelf) => (
                                        <RecommendationShelf
                                            key={shelf.key}
                                            rowId={shelf.key}
                                            title={shelf.title}
                                            subtitle={shelf.subtitle}
                                            icon={shelf.icon}
                                            books={shelf.books}
                                            showProgress={shelf.showProgress}
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {!showRecommendations && featuredBook ? (
                                <motion.section
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35 }}
                                    className="mb-10 overflow-hidden rounded-[32px] border border-[#e8e4db] bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                                >
                                    <div className="grid min-h-[360px] lg:grid-cols-[0.72fr_1fr]">
                                        <div className="relative flex items-center justify-center overflow-hidden bg-[#0b111b] p-8">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_24%,rgba(201,123,107,0.26),transparent_34%)]" />
                                            <div className="relative aspect-[2/3] h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#1c2535] shadow-2xl sm:h-[300px]">
                                                <BookCover
                                                    src={featuredBook.coverImage}
                                                    title={featuredBook.title}
                                                    author={featuredBook.author}
                                                    priority
                                                    rounded="rounded-2xl"
                                                    imageClassName="object-contain bg-[#1c2535]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                            <div className="mb-4 flex flex-wrap gap-2">
                                                <span className="rounded-full border border-[#c97b6b]/20 bg-[#c97b6b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c97b6b]">
                                                    Featured
                                                </span>
                                                {getPrimaryCategory(featuredBook) ? (
                                                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        {getPrimaryCategory(featuredBook)}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <h2 className="text-3xl font-semibold leading-tight text-[#111827] dark:text-white sm:text-4xl">
                                                {featuredBook.title || 'Untitled book'}
                                            </h2>
                                            <p className="mt-3 text-sm font-semibold text-[#c97b6b]">
                                                {featuredBook.author || 'Unknown author'}
                                            </p>
                                            {featuredBook.description ? (
                                                <p className="mt-5 line-clamp-3 max-w-2xl text-sm leading-6 text-slate-400">
                                                    {featuredBook.description}
                                                </p>
                                            ) : null}
                                            <Link
                                                to={`/books/${getBookId(featuredBook)}`}
                                                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff7a4f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#e9683f] sm:w-max"
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
                                        <h2 className="text-2xl font-semibold text-[#111827] dark:text-white">
                                            {hasSearchOrFilter ? 'Matching Books' : showRecommendations ? 'Full Catalog' : 'All Books'}
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {hasSearchOrFilter ? 'Filtered from the current ReadNest catalog.' : 'Explore every available title in the catalog.'}
                                        </p>
                                    </div>
                                    <div className="hidden gap-2 sm:flex">
                                        <button type="button" onClick={() => scrollRow(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-400 transition hover:border-[#ff7a4f]/40 hover:text-[#ff9c7a]" aria-label="Scroll books left">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => scrollRow(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-400 transition hover:border-[#ff7a4f]/40 hover:text-[#ff9c7a]" aria-label="Scroll books right">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div ref={rowRef} className="scrollbar-hide flex gap-5 overflow-x-auto pb-6 scroll-smooth md:gap-6">
                                    {((showRecommendations ? visibleBooks : shelfBooks).length ? (showRecommendations ? visibleBooks : shelfBooks) : visibleBooks).map((book) => (
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
