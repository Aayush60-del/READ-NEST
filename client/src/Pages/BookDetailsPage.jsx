import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Bookmark, Plus, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';
import BookCover from '@/components/books/BookCover';

const BookDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const similarRef = useRef(null);

    const [book, setBook] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const res = await api.get(ENDPOINTS.BOOKS.DETAIL(id));
                setBook(res?.data || null);
                
                // Fetch some random books for "Similar Books" section
                const simRes = await api.get(ENDPOINTS.BOOKS.LIST);
                const filteredSims = (simRes?.data || []).filter(b => b._id !== id).slice(0, 5);
                setSimilarBooks(filteredSims);
            } catch (error) {
                console.error("Failed to load book:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBookDetails();
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
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] flex items-center justify-center text-black dark:text-white">
                <p className="text-xl font-serif animate-pulse">Loading manuscript...</p>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] flex flex-col items-center justify-center text-black dark:text-white">
                <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-xl font-serif mb-4">This book could not be found.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 border border-black/20 dark:border-white/20 rounded">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcf9f2] dark:bg-[#0f1419] text-black dark:text-[#e4e2e1] font-sans flex transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-[256px] relative z-10 transition-all duration-300 ease-in-out min-h-screen pb-20">
                <DashboardNavbar />

                <div className="max-w-[1200px] mx-auto px-4 md:px-10 pt-6">

                    {/* Top Section: Cover & Details */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

                        {/* Left: Book Cover */}
                        <div className="w-full sm:w-[380px] mx-auto lg:mx-0 shrink-0">
                            <BookCover
                                src={book.coverImage}
                                title={book.title}
                                author={book.author}
                                priority
                                rounded="rounded-md"
                                className="aspect-[2/3] shadow-2xl"
                            />
                        </div>

                        {/* Right: Book Info */}
                        <div className="flex-1 pt-4">
                            <h1 className="text-4xl md:text-6xl font-serif text-black dark:text-white mb-4 transition-colors duration-300 leading-tight">{book.title}</h1>
                            <p className="text-xl md:text-2xl text-[#a65d50] dark:text-[#c97b6b] font-serif italic mb-12">{book.author}</p>

                            <div className="flex flex-wrap gap-6 md:gap-16 mb-12 border-b border-black/10 dark:border-white/10 pb-8 transition-colors duration-300">
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 mb-2">Category</div>
                                    <div className="font-medium text-lg">{book.category || 'General'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 mb-2">Pages</div>
                                    <div className="font-medium text-lg">{book.totalPages || '?'}</div>
                                </div>
                            </div>

                            <div className="mb-12">
                                <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 mb-4">Description</div>
                                <p className="text-lg leading-relaxed opacity-80 font-serif">
                                    {book.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to={`/books/${id}/read`} className="px-10 py-4 bg-[#c97b6b] hover:bg-[#b8695c] text-white font-bold text-sm tracking-wider rounded-md transition-colors shadow-lg text-center">
                                    Read Now
                                </Link>
                                <Link to={`/books/${id}/read`} className="px-8 py-4 bg-transparent border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 font-bold text-sm tracking-wider rounded-md transition-colors flex items-center justify-center gap-3">
                                    <Bookmark className="w-4 h-4" /> Open Reader
                                </Link>
                                <button onClick={handleAddToLibrary} disabled={adding} className="px-8 py-4 bg-transparent border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 font-bold text-sm tracking-wider rounded-md transition-colors flex items-center justify-center gap-3 disabled:opacity-60">
                                    <Plus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add To Library'}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Section: Similar Books */}
                    {similarBooks.length > 0 && (
                        <div className="mt-24">
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-4xl font-serif text-black dark:text-white transition-colors duration-300">Similar Books</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => scrollSimilar(-1)} className="w-10 h-10 rounded border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="Scroll similar books left"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={() => scrollSimilar(1)} className="w-10 h-10 rounded border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="Scroll similar books right"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div ref={similarRef} className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-3 scroll-smooth">
                                {similarBooks.map((simBook) => (
                                    <Link to={`/books/${simBook._id}`} key={simBook._id} className="group cursor-pointer min-w-[150px] sm:min-w-[190px] md:min-w-[220px]">
                                        <div className="w-full aspect-[2/3] bg-[#1a1a1a] rounded shadow-lg mb-4 opacity-90 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10">
                                            <BookCover
                                                src={simBook.coverImage}
                                                title={simBook.title}
                                                author={simBook.author}
                                                rounded="rounded"
                                                className="transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h4 className="font-serif font-medium text-lg leading-tight group-hover:text-[#a65d50] dark:group-hover:text-[#c97b6b] transition-colors line-clamp-2">{simBook.title}</h4>
                                    </Link>
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

