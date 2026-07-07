import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Bookmark, Plus, ChevronLeft, ChevronRight, BookOpen, RefreshCw, AlertTriangle } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';
import BookCover from '@/components/books/BookCover';
import BookCard from '@/components/books/BookCard';

const BookDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const similarRef = useRef(null);

    const [book, setBook] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchBookDetails = async () => {
        if (!id) return;

        setLoading(true);
        setError('');
        try {
            const res = await api.get(ENDPOINTS.BOOKS.DETAIL(id));
            const nextBook = res?.data || null;
            setBook(nextBook);

            const simRes = await api.get(ENDPOINTS.BOOKS.LIST);
            const allBooks = simRes?.data || [];
            const nextSimilar = allBooks
                .filter((candidate) => candidate._id !== id)
                .filter((candidate) => {
                    if (!nextBook?.category?.length) return true;
                    const currentCategories = Array.isArray(nextBook.category) ? nextBook.category : [nextBook.category];
                    const candidateCategories = Array.isArray(candidate.category) ? candidate.category : [candidate.category];
                    return candidateCategories.some((category) => currentCategories.includes(category));
                })
                .slice(0, 8);
            setSimilarBooks(nextSimilar.length ? nextSimilar : allBooks.filter((candidate) => candidate._id !== id).slice(0, 8));
        } catch (loadError) {
            console.error("Failed to load book:", loadError);
            setBook(null);
            setSimilarBooks([]);
            setError(loadError.message || 'Failed to load this book.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookDetails();
    }, [id]);


    const scrollSimilar = (direction) => {
        similarRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });
    };

    const handleAddToLibrary = async () => {
        if (!id) return;
        setAdding(true);
        try {
            await api.post(ENDPOINTS.BOOKS.PROGRESS(id), { currentPage: 1 });
            navigate('/library');
        } catch (error) {
            console.error('Failed to add book to library:', error);
            setError(error.message || 'Could not add this book to your library.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcf9f2] text-[#111827] transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
                <Sidebar />
                <main className="min-h-screen w-full min-w-0 overflow-x-hidden pb-24 lg:ml-[256px]">
                    <DashboardNavbar />
                    <div className="relative ml-0 mr-auto w-full max-w-[1240px] px-4 pb-16 pt-6 md:px-10">
                        <div className="relative z-10 flex flex-col gap-8 rounded-[32px] border border-[#e8e4db] bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0f1726]/75 lg:flex-row lg:gap-12 lg:p-8">
                            <div className="mx-auto aspect-[2/3] w-full max-w-[320px] animate-pulse rounded-2xl bg-[#e8e4db] dark:bg-white/[0.06]" />
                            <div className="flex-1 pt-4">
                                <div className="h-3 w-32 animate-pulse rounded-full bg-[#e8e4db] dark:bg-white/[0.08]" />
                                <div className="mt-5 h-12 w-4/5 animate-pulse rounded-2xl bg-[#e8e4db] dark:bg-white/[0.08]" />
                                <div className="mt-4 h-7 w-52 animate-pulse rounded-full bg-[#e8e4db] dark:bg-white/[0.08]" />
                                <div className="mt-10 flex gap-4">
                                    <div className="h-16 w-32 animate-pulse rounded-2xl bg-[#e8e4db] dark:bg-white/[0.08]" />
                                    <div className="h-16 w-28 animate-pulse rounded-2xl bg-[#e8e4db] dark:bg-white/[0.08]" />
                                </div>
                                <div className="mt-10 space-y-3">
                                    <div className="h-3 w-full animate-pulse rounded-full bg-[#e8e4db] dark:bg-white/[0.08]" />
                                    <div className="h-3 w-11/12 animate-pulse rounded-full bg-[#e8e4db] dark:bg-white/[0.08]" />
                                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#e8e4db] dark:bg-white/[0.08]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-[#fcf9f2] text-[#111827] dark:bg-[#070b12] dark:text-white">
                <Sidebar />
                <main className="flex min-h-screen w-full items-center justify-center px-4 lg:ml-[256px]">
                    <div className="max-w-md rounded-[28px] border border-[#e8e4db] bg-white/75 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0f1726]/75">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#ff7a4f]/10 text-[#ff9c7a]">
                            {error ? <AlertTriangle className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                        </div>
                        <h1 className="text-2xl font-semibold">{error ? 'Could not load this book' : 'This book could not be found'}</h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {error || 'The title may have been removed, or the link is no longer valid.'}
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button onClick={fetchBookDetails} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#ff7a4f] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#e9683f]">
                                <RefreshCw className="h-4 w-4" />
                                Retry
                            </button>
                            <button onClick={() => navigate('/discover')} className="rounded-2xl border border-[#e8e4db] bg-white/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#111827] transition hover:border-[#c97b6b]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white">
                                Back to Discover
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcf9f2] text-[#111827] font-sans flex transition-colors duration-300 dark:bg-[#070b12] dark:text-white">
            <Sidebar />

            <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-24 lg:pb-20">
                <DashboardNavbar />

                <div className="relative ml-0 mr-auto max-w-[1240px] w-full px-4 md:px-10 pt-6 pb-16">
                    <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#c97b6b]/10 blur-3xl" />

                    {/* Top Section: Cover & Details */}
                    <div className="relative z-10 flex flex-col gap-8 rounded-[32px] border border-[#e8e4db] bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1726]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:flex-row lg:gap-12 lg:p-8">

                        {/* Left: Book Cover */}
                        <div className="w-full sm:w-[320px] mx-auto lg:mx-0 shrink-0">
                            <BookCover
                                src={book.coverImage}
                                title={book.title}
                                author={book.author}
                                priority
                                rounded="rounded-2xl"
                                className="aspect-[2/3] border border-white/10 shadow-2xl"
                            />
                        </div>

                        {/* Right: Book Info */}
                        <div className="flex-1 pt-4">
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#ff9c7a]">Book details</p>
                            <h1 className="text-4xl md:text-6xl font-semibold text-[#111827] dark:text-white mb-4 transition-colors duration-300 leading-tight">{book.title}</h1>
                            <p className="text-xl md:text-2xl text-[#ff9c7a] font-medium mb-10">{book.author}</p>

                            <div className="flex flex-wrap gap-4 md:gap-6 mb-10 border-b border-white/[0.08] pb-8 transition-colors duration-300">
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Category</div>
                                    <div className="rounded-2xl border border-[#e8e4db] bg-white/70 px-4 py-3 font-medium text-[#111827] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white">{book.category || 'General'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Pages</div>
                                    <div className="rounded-2xl border border-[#e8e4db] bg-white/70 px-4 py-3 font-medium text-[#111827] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white">{book.totalPages || '?'}</div>
                                </div>
                            </div>

                            <div className="mb-12">
                                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4">Description</div>
                                <p className="text-base leading-7 text-slate-400">
                                    {book.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to={`/books/${id}/read`} className="rounded-2xl bg-[#ff7a4f] px-10 py-4 text-center text-sm font-bold tracking-wider text-white shadow-lg transition-colors hover:bg-[#e9683f]">
                                    Read Now
                                </Link>
                                <Link to={`/books/${id}/read`} className="flex items-center justify-center gap-3 rounded-2xl border border-[#e8e4db] bg-white/70 px-8 py-4 text-sm font-bold tracking-wider text-[#111827] transition-colors hover:border-[#c97b6b]/40 hover:text-[#c96f5c] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:border-[#ff7a4f]/40 dark:hover:text-[#ff9c7a]">
                                    <Bookmark className="w-4 h-4" /> Open Reader
                                </Link>
                                <button onClick={handleAddToLibrary} disabled={adding} className="flex items-center justify-center gap-3 rounded-2xl border border-[#e8e4db] bg-white/70 px-8 py-4 text-sm font-bold tracking-wider text-[#111827] transition-colors hover:border-[#c97b6b]/40 hover:text-[#c96f5c] disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:border-[#ff7a4f]/40 dark:hover:text-[#ff9c7a]">
                                    <Plus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add To Library'}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Section: Similar Books */}
                    {similarBooks.length > 0 && (
                        <div className="relative z-10 mt-10">
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-3xl font-semibold text-[#111827] transition-colors duration-300 dark:text-white">Similar Books</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => scrollSimilar(-1)} className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-slate-400 hover:border-[#ff7a4f]/40 hover:text-[#ff9c7a] transition-colors" aria-label="Scroll similar books left"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={() => scrollSimilar(1)} className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-slate-400 hover:border-[#ff7a4f]/40 hover:text-[#ff9c7a] transition-colors" aria-label="Scroll similar books right"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div ref={similarRef} className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-3 scroll-smooth">
                                {similarBooks.map((simBook) => (
                                    <BookCard
                                        key={simBook._id}
                                        book={simBook}
                                        to={`/books/${simBook._id}`}
                                        variant="compact"
                                        showAuthor={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default BookDetailsPage;

