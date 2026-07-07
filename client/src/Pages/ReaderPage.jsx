import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, BookOpen, Bookmark, Maximize, Minimize, X,
    ZoomIn, ZoomOut, Save, ChevronLeft, ChevronRight,
    Sun, Moon, Coffee, Eye, Settings2, Check, Clock,
    BarChart2, RefreshCw, AlertTriangle, FileX
} from 'lucide-react';
import api, { API_BASE_URL, ENDPOINTS, getStoredSession } from '@/lib/api';
import StreakCelebration from '@/components/streak/StreakCelebration';
import { useStreakCelebration } from '@/hooks/useStreakCelebration';

// Use version-matched PDF.js worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const READING_MODES = {
    dark: {
        label: 'Dark',
        icon: Moon,
        bg: '#0f1419',
        pageBg: '#1c2535',
        text: 'text-white',
        border: 'border-white/5',
        description: 'Classic dark theme',
    },
    light: {
        label: 'Light',
        icon: Sun,
        bg: '#f5f0e8',
        pageBg: '#ffffff',
        text: 'text-gray-900',
        border: 'border-black/10',
        description: 'Bright & clean',
    },
    sepia: {
        label: 'Sepia',
        icon: Coffee,
        bg: '#2c1f0e',
        pageBg: '#f4e4c0',
        text: 'text-amber-100',
        border: 'border-amber-900/30',
        description: 'Warm vintage feel',
    },
    eyecomfort: {
        label: 'Eye Comfort',
        icon: Eye,
        bg: '#1a2332',
        pageBg: '#f0f4e8',
        text: 'text-blue-100',
        border: 'border-blue-900/20',
        description: 'Reduces eye strain',
    },
};

const MIN_SESSION_SECONDS_FOR_READING_DAY = 5 * 60;
const AUTO_SAVE_DEBOUNCE_MS = 1200;
const AUTO_SAVE_INTERVAL_MS = 20000;
const STREAK_MILESTONES = [7, 14, 30, 50, 100, 365];

const unwrapApiPayload = (response) => response?.data?.data ?? response?.data ?? response ?? {};

const getWeeklyProgress = (streakPayload = {}) => {
    const days = streakPayload.weeklyProgress || streakPayload.last7Days || streakPayload.week || [];

    if (!Array.isArray(days) || days.length !== 7) return [];

    return days.map((day) => {
        if (typeof day === 'boolean') return day;
        return Boolean(day?.read ?? day?.completed ?? day?.hasRead ?? day?.pagesRead);
    });
};

// -- Toast ----------------------------------------------------------------------
const Toast = ({ message, type = 'success', onDone }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 2500);
        return () => clearTimeout(t);
    }, [onDone]);

    const colors =
        type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold text-sm tracking-wide flex items-center gap-2 ${colors}`}
        >
            {type === 'success' && <Check className="w-4 h-4" />}
            {type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {message}
        </motion.div>
    );
};

// -- PDF Error States ----------------------------------------------------------
const PDFErrorState = ({ type, theme, onRetry }) => {
    if (type === 'missing') {
        return (
            <div className={`flex flex-col items-center justify-center py-24 gap-5 ${theme.text}`}>
                <FileX className="w-16 h-16 opacity-30" />
                <p className="text-lg font-serif opacity-60">PDF file is missing</p>
                <p className="text-sm opacity-40 max-w-xs text-center">
                    This book has no associated PDF file. Please contact the administrator.
                </p>
                <Link
                    to="/library"
                    className="mt-2 px-6 py-2 bg-[#c97b6b] text-white rounded-xl text-sm font-bold"
                >
                    Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center py-24 gap-5 ${theme.text}`}>
            <AlertTriangle className="w-16 h-16 text-[#c97b6b] opacity-60" />
            <p className="text-lg font-serif opacity-70">Failed to load PDF</p>
            <p className="text-sm opacity-40 max-w-xs text-center">
                The PDF could not be loaded. Please retry or check your login session.
            </p>
            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#c97b6b] hover:bg-[#b8695c] text-white rounded-xl text-sm font-bold transition-all"
            >
                <RefreshCw className="w-4 h-4" /> Retry
            </button>
        </div>
    );
};

// -- Main Reader ----------------------------------------------------------------
const ReaderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const autoSaveDebounceRef = useRef(null);
    const activeReadingSecondsRef = useRef(0);
    const sessionReadPagesRef = useRef(new Set());
    const touchStartRef = useRef(null);
    const streakCelebrationAttemptedRef = useRef(false);
    const bookCompletionCelebratedRef = useRef(false);
    const initialProgressReconciledRef = useRef(false);
    const {
        isOpen: isStreakCelebrationOpen,
        previousStreak,
        newStreak,
        weeklyProgress,
        milestone,
        type: celebrationType,
        title: celebrationTitle,
        message: celebrationMessage,
        ctaLabel: celebrationCtaLabel,
        showStreakCelebration,
        closeStreakCelebration,
    } = useStreakCelebration();

    // -- Core state ----------------------------------------------------------
    const [book, setBook] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfData, setPdfData] = useState(null);
    const pdfObjectUrlRef = useRef(null);
    const pageContainerRef = useRef(null);
    const [pageRenderWidth, setPageRenderWidth] = useState(() =>
        typeof window !== "undefined" ? Math.max(280, Math.min(window.innerWidth - 24, 900)) : 900
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pdfError, setPdfError] = useState(false);  // PDF-specific render error
    const [retryCount, setRetryCount] = useState(0);

    // -- Single source of truth for page -------------------------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // -- Reader UI -----------------------------------------------------------
    const [zoom, setZoom] = useState(1.0);
    const [mode, setMode] = useState('dark');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activePanel, setActivePanel] = useState(null); // 'settings' | 'stats' | null
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarkRecords, setBookmarkRecords] = useState([]);
    const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false);

    // -- Reading stats --------------------------------------------------------
    const [pagesRead, setPagesRead] = useState(new Set());
    const [readingSeconds, setReadingSeconds] = useState(0);

    const theme = READING_MODES[mode];
    const progress =
        totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
    const currentPageRef = useRef(currentPage);
    const totalPagesRef = useRef(totalPages);
    currentPageRef.current = currentPage;
    totalPagesRef.current = totalPages;

    const pdfFile = useMemo(() => {
        if (!pdfUrl) return null;

        const { token } = getStoredSession();

        return {
            url: pdfUrl,
            httpHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: false,
            disableRange: true,
            disableStream: true,
            disableAutoFetch: true,
        };
    }, [pdfUrl]);

    // -- Helpers --------------------------------------------------------------
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, id: Date.now() });
    }, []);

    // -- Fetch book data ------------------------------------------------------
    const fetchReaderData = useCallback(async () => {
        setLoading(true);
        setError('');
        setPdfError(false);
        setPdfUrl(null);
        setPdfData(null);
        setTotalPages(0);
        initialProgressReconciledRef.current = false;
        activeReadingSecondsRef.current = 0;
        setReadingSeconds(0);

        try {
            // 1. Load book metadata
            const bookRes = await api.get(ENDPOINTS.BOOKS.DETAIL(id));
            setBook(bookRes.data);

            // 2. Restore last read page
            const progressRes = await api
                .get(ENDPOINTS.BOOKS.PROGRESS(id))
                .catch(() => null);

            const savedPage = progressRes?.data?.currentPage;
            if (savedPage && savedPage > 1) {
                setCurrentPage(savedPage);
            }
            const savedTotalPages = Number(progressRes?.data?.totalPages) || 0;
            bookCompletionCelebratedRef.current = Boolean(
                progressRes?.data?.isCompleted &&
                savedTotalPages > 0 &&
                Number(savedPage) >= savedTotalPages
            );

            // 3. Restore bookmarks
            const bookmarkRes = await api
                .get(ENDPOINTS.BOOKS.BOOKMARKS(id))
                .catch(() => ({ data: [] }));
            const records = bookmarkRes?.data || [];
            setBookmarkRecords(records);
            setBookmarks(records.map((item) => item.pageNumber));

            // 4. Use protected backend PDF stream directly.
            // react-pdf receives the URL with Authorization headers via pdfFile.
            const { token } = getStoredSession();

            if (!token) {
                console.error("[ReaderPage] No auth token found for PDF.");
                setPdfError("load");
                return;
            }

            const backendBaseUrl = API_BASE_URL
                .replace(/\/api\/?$/, "")
                .replace(/\/$/, "");

            const streamUrl = `${backendBaseUrl}/lib/books/${id}/pdf-file`;

            console.log("[ReaderPage] PDF stream URL prepared:", streamUrl);

            setPdfUrl(streamUrl);
            setPdfData(null);
        } catch (err) {
            console.error('[ReaderPage] Failed to load:', err);
            setError(err.message || 'Failed to load book.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        return () => {
            if (pdfObjectUrlRef.current) {
                URL.revokeObjectURL(pdfObjectUrlRef.current);
                pdfObjectUrlRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (id) fetchReaderData();
    }, [id, fetchReaderData, retryCount]);

    // -- Reading time tracker -------------------------------------------------
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState !== 'visible' || totalPagesRef.current < 1) return;

            activeReadingSecondsRef.current += 1;
            setReadingSeconds(activeReadingSecondsRef.current);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // -- Save progress function -----------------------------------------------
    const saveProgress = useCallback(
        async (page = currentPageRef.current, silent = false, options = {}) => {
            if (!id || !page || page < 1) return;
            const pageNumber = Number(page);
            const knownTotalPages = Number(totalPagesRef.current) || 0;
            if (knownTotalPages < 1) return;
            const safeTotalPages = Math.max(1, knownTotalPages);
            const percentageCompleted = Math.min(
                100,
                Math.round((pageNumber / safeTotalPages) * 100)
            );
            const sessionPagesRead = sessionReadPagesRef.current.size;
            const sessionReadingSeconds = activeReadingSecondsRef.current;
            const payload = {
                currentPage: pageNumber,
                percentageCompleted,
                progress: percentageCompleted,
                totalPages: safeTotalPages,
                sessionPagesRead,
                sessionReadingSeconds,
            };

            if (options.keepalive) {
                const { token } = getStoredSession();
                fetch(`${API_BASE_URL}${ENDPOINTS.BOOKS.PROGRESS(id)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(payload),
                    keepalive: true,
                }).catch(err => console.error('[ReaderPage] Keepalive progress save failed:', err));
                return;
            }

            setSaving(true);
            setSaveStatus('saving');
            try {
                const saveRes = await api.post(ENDPOINTS.BOOKS.PROGRESS(id), payload);
                const savedProgress = unwrapApiPayload(saveRes);
                const isBookCompleted = Boolean(savedProgress?.isCompleted) || percentageCompleted >= 100;

                if (isBookCompleted && !bookCompletionCelebratedRef.current) {
                    bookCompletionCelebratedRef.current = true;
                    showStreakCelebration({
                        type: 'book_finished',
                        achievementKey: `book-finished:${id}`,
                        force: true,
                        previousStreak: 0,
                        newStreak: 100,
                        weeklyProgress: [],
                        milestone: true,
                        title: 'Book finished!',
                        message: 'You turned the final page. Beautiful work.',
                        ctaLabel: 'Nice',
                    });
                }

                if (!isBookCompleted) {
                    bookCompletionCelebratedRef.current = false;
                }

                if (
                    !isBookCompleted &&
                    !streakCelebrationAttemptedRef.current &&
                    sessionReadingSeconds >= MIN_SESSION_SECONDS_FOR_READING_DAY
                ) {
                    streakCelebrationAttemptedRef.current = true;

                    api.get(ENDPOINTS.BOOKS.STREAK)
                        .then((streakRes) => {
                            const streakPayload = unwrapApiPayload(streakRes);
                            const updatedStreak = Number(
                                streakPayload.streak ??
                                streakPayload.currentStreak ??
                                streakPayload.newStreak ??
                                0
                            );

                            if (!updatedStreak) return;
                            const isSevenDayMilestone = updatedStreak === 7;
                            const isStreakMilestone = STREAK_MILESTONES.includes(updatedStreak);

                            showStreakCelebration({
                                type: isSevenDayMilestone || isStreakMilestone ? 'streak' : 'pages_read',
                                achievementKey: isSevenDayMilestone || isStreakMilestone
                                    ? `streak:${updatedStreak}`
                                    : `reading-time:${id}:${new Date().toISOString().slice(0, 10)}`,
                                previousStreak: Number(
                                    streakPayload.previousStreak ?? Math.max(updatedStreak - 1, 0)
                                ),
                                newStreak: updatedStreak,
                                weeklyProgress: getWeeklyProgress(streakPayload),
                                milestone: isSevenDayMilestone || isStreakMilestone,
                                title: isSevenDayMilestone
                                    ? '7 day streak!'
                                    : isStreakMilestone
                                    ? `${updatedStreak} day streak!`
                                    : '5 minutes read!',
                                message: isSevenDayMilestone
                                    ? 'One full week complete. Your reading habit is getting strong.'
                                    : isStreakMilestone
                                    ? 'Milestone unlocked! Your reading habit is becoming powerful.'
                                    : "Today's reading day is counted. Five focused minutes, real momentum.",
                                ctaLabel: 'Keep Reading',
                            });
                        })
                        .catch((error) => {
                            console.error('[ReaderPage] Failed to load streak celebration data:', error);
                        });
                }

                if (!silent) showToast('Progress saved!');
                setSaveStatus('saved');
            } catch (err) {
                console.error('[ReaderPage] Save progress failed:', err);
                if (!silent) showToast('Failed to save progress', 'error');
                setSaveStatus('unsaved');
            } finally {
                setSaving(false);
            }
        },
        [id, showToast, showStreakCelebration]
    );

    // -- Track pages read and debounce progress saves after page changes -------
    useEffect(() => {
        if (currentPage > 0) {
            // Session-only Set controls whether today's streak/heatmap can count.
            sessionReadPagesRef.current.add(currentPage);
            setPagesRead(new Set(sessionReadPagesRef.current));
            setSaveStatus('unsaved');
        }
        setIsCurrentPageBookmarked(bookmarks.includes(currentPage));

        clearTimeout(autoSaveDebounceRef.current);
        autoSaveDebounceRef.current = setTimeout(() => {
            saveProgress(currentPage, true);
        }, AUTO_SAVE_DEBOUNCE_MS);

        return () => clearTimeout(autoSaveDebounceRef.current);
    }, [currentPage, bookmarks, saveProgress]);

    useEffect(() => {
        if (!totalPages || initialProgressReconciledRef.current) return;
        initialProgressReconciledRef.current = true;
        saveProgress(currentPageRef.current, true);
    }, [totalPages, saveProgress]);

    // -- Auto-save every 20 seconds while the reader is open -------------------
    useEffect(() => {
        autoSaveTimerRef.current = setInterval(() => {
            saveProgress(currentPageRef.current, true);
        }, AUTO_SAVE_INTERVAL_MS);
        return () => clearInterval(autoSaveTimerRef.current);
    }, [saveProgress]);

    const handleBackToLibrary = useCallback(async (event) => {
        event.preventDefault();
        await saveProgress(currentPageRef.current, true);

        if (activeReadingSecondsRef.current < MIN_SESSION_SECONDS_FOR_READING_DAY) {
            showToast("Read for at least 5 minutes to count today's streak.", 'error');
        }

        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate(id ? `/books/${id}` : '/library');
    }, [id, navigate, saveProgress, showToast]);

    useEffect(() => {
        return () => clearTimeout(autoSaveDebounceRef.current);
    }, []);

    // -- Save on page unload --------------------------------------------------
    useEffect(() => {
        const handleUnload = () => {
            saveProgress(currentPageRef.current, true, { keepalive: true });
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') handleUnload();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [saveProgress]);

    // -- Keyboard navigation --------------------------------------------------
    useEffect(() => {
        const handleKey = e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (!totalPages) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                setCurrentPage(p => Math.min(totalPages, p + 1));
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setCurrentPage(p => Math.max(1, p - 1));
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [totalPages]);

    // -- Fullscreen -----------------------------------------------------------
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    };
    useEffect(() => {
        const handle = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handle);
        return () => document.removeEventListener('fullscreenchange', handle);
    }, []);

    // -- Bookmark current page ------------------------------------------------
    const toggleBookmark = async () => {
        const has = bookmarks.includes(currentPage);

        try {
            if (has) {
                const record = bookmarkRecords.find((item) => item.pageNumber === currentPage);
                if (record?._id) {
                    await api.delete(`/lib/books/BookMarks/${record._id}`);
                }
                setBookmarkRecords(prev => prev.filter((item) => item.pageNumber !== currentPage));
                setBookmarks(prev => prev.filter(page => page !== currentPage));
                showToast('Bookmark removed');
                return;
            }

            const res = await api.post(ENDPOINTS.BOOKS.BOOKMARKS(id), { pageNumber: currentPage });
            if (res?.data) {
                setBookmarkRecords(prev => [...prev, res.data]);
            }
            setBookmarks(prev => [...prev, currentPage]);
            showToast(`Page ${currentPage} bookmarked`);
        } catch (error) {
            console.error('[ReaderPage] Bookmark update failed:', error);
            showToast('Failed to update bookmark', 'error');
        }
    };

    // -- Zoom -----------------------------------------------------------------
    const zoomIn = () =>
        setZoom(z => Math.min(3.0, parseFloat((z + 0.15).toFixed(2))));
    const zoomOut = () =>
        setZoom(z => Math.max(0.5, parseFloat((z - 0.15).toFixed(2))));

    // -- Retry handler ---------------------------------------------------------
    const handleRetry = () => {
        setRetryCount(c => c + 1);
    };

    // -- PDF callbacks ---------------------------------------------------------
    const onDocumentLoadSuccess = ({ numPages }) => {
        setTotalPages(numPages);
        setPdfError(false);
        setCurrentPage((page) => Math.min(Math.max(page, 1), numPages || 1));
    };

    const onDocumentLoadError = err => {
        console.error('[react-pdf] Document load error:', {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
            raw: err,
        });
        setPdfError('load');
    };

    // -- Page navigation helpers ----------------------------------------------
    const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const goToNextPage = () =>
        setCurrentPage(p => Math.min(totalPages || p, p + 1));

    const handleReaderTouchStart = (event) => {
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
        };
    };

    const handleReaderTouchEnd = (event) => {
        if (!touchStartRef.current || !totalPages) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        touchStartRef.current = null;

        if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

        if (deltaX < 0) {
            goToNextPage();
            return;
        }

        goToPrevPage();
    };

    // -- Loading screen --------------------------------------------------------
    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#0f1419] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#c97b6b]/30 border-t-[#c97b6b] rounded-full animate-spin" />
                <p className="text-white/50 font-serif text-lg animate-pulse">
                    Opening your book...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen bg-[#0f1419] flex flex-col items-center justify-center gap-4 p-8 text-center">
                <BookOpen className="w-16 h-16 text-[#c97b6b]/40" />
                <p className="text-white text-xl font-serif">{error}</p>
                <p className="text-white/40 text-sm max-w-md">
                    Please ensure the book was uploaded correctly and AWS S3 is configured.
                </p>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-6 py-2 bg-[#c97b6b] text-white rounded-xl text-sm font-bold"
                    >
                        <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                    <Link
                        to="/library"
                        className="px-6 py-2 border border-white/20 text-white rounded-xl text-sm font-bold"
                    >
                        Back to Library
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none"
            style={{ background: theme.bg }}
        >
            {/* -- TOAST ----------------------------------------------------- */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDone={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            {/* -- TOP TOOLBAR ----------------------------------------------- */}
            <header
                className={`flex-none min-h-14 px-3 sm:px-4 flex items-center justify-between z-30 border-b ${theme.border} shadow-lg shadow-black/10`}
                style={{ background: `${theme.bg}f2`, backdropFilter: 'blur(18px)' }}
            >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={handleBackToLibrary}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
                        title="Back to Library"
                    >
                        <ArrowLeft className={`w-5 h-5 ${theme.text}`} />
                    </button>
                    <div className="min-w-0">
                        <h1 className={`text-sm font-bold truncate ${theme.text}`}>
                            {book?.data?.title || book?.title || 'Unknown Book'}
                        </h1>
                        <p className={`text-[10px] tracking-widest uppercase opacity-40 ${theme.text}`}>
                            {book?.data?.author || book?.author}
                        </p>
                    </div>
                </div>

                {/* Center page indicator */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                    <button
                        id="btn-prev-page"
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1}
                        className={`p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-colors ${theme.text}`}
                        title="Previous Page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className={`px-3 py-1.5 rounded-xl border ${theme.border} text-[11px] font-bold tracking-widest ${theme.text} bg-white/5 shadow-sm`}>
                        {currentPage} / {totalPages || '...'} <span className="px-1 opacity-40">|</span> {progress}%
                    </div>
                    <button
                        id="btn-next-page"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
                        className={`p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-colors ${theme.text}`}
                        title="Next Page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Right */}
                <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-end">
                    <span className={`hidden lg:inline-flex items-center gap-1.5 rounded-full border ${theme.border} bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-70`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-[#c97b6b]'}`} />
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
                    </span>
                    <button
                        id="btn-zoom-out"
                        onClick={zoomOut}
                        title="Zoom Out"
                        className={`hidden sm:block p-1 sm:p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.text} opacity-70 hover:opacity-100`}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className={`hidden sm:inline-block text-[11px] font-bold w-10 text-center ${theme.text} opacity-50`}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        id="btn-zoom-in"
                        onClick={zoomIn}
                        title="Zoom In"
                        className={`hidden sm:block p-1 sm:p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.text} opacity-70 hover:opacity-100`}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="hidden sm:block w-px h-5 bg-white/10 mx-1" />
                    <button
                        id="btn-bookmark"
                        onClick={toggleBookmark}
                        title={isCurrentPageBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                            isCurrentPageBookmarked ? 'text-[#c97b6b]' : `${theme.text} opacity-70`
                        }`}
                    >
                        <Bookmark
                            className="w-4 h-4"
                            fill={isCurrentPageBookmarked ? 'currentColor' : 'none'}
                        />
                    </button>
                    <button
                        id="btn-stats"
                        onClick={() => setActivePanel(p => (p === 'stats' ? null : 'stats'))}
                        title="Reading Stats"
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                            activePanel === 'stats' ? 'text-[#c97b6b]' : `${theme.text} opacity-70`
                        }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                    </button>
                    <button
                        id="btn-settings"
                        onClick={() => setActivePanel(p => (p === 'settings' ? null : 'settings'))}
                        title="Reading Settings"
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                            activePanel === 'settings' ? 'text-[#c97b6b]' : `${theme.text} opacity-70`
                        }`}
                    >
                        <Settings2 className="w-4 h-4" />
                    </button>
                    <button
                        id="btn-fullscreen"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        className={`hidden sm:block p-1 sm:p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.text} opacity-70 hover:opacity-100`}
                    >
                        {isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                        ) : (
                            <Maximize className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </header>
            <div className="h-1.5 flex-none bg-black/20">
                <div
                    className="h-full rounded-r-full bg-[#c97b6b] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* -- MAIN CONTENT ----------------------------------------------- */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* PDF Viewer: react-pdf Document/Page only */}
                <main
                    ref={pageContainerRef}
                    onTouchStart={handleReaderTouchStart}
                    onTouchEnd={handleReaderTouchEnd}
                    className="flex-1 overflow-auto flex items-start justify-center px-2 pb-28 pt-5 sm:px-6 sm:pb-24 sm:pt-7"
                    style={{ touchAction: 'pan-y' }}
                >
                    {pdfError === 'missing' ? (
                        <PDFErrorState type="missing" theme={theme} onRetry={handleRetry} />
                    ) : pdfError === 'load' ? (
                        <PDFErrorState type="load" theme={theme} onRetry={handleRetry} />
                    ) : pdfFile ? (
                        <Document
                            file={pdfFile}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className={`flex flex-col items-center justify-center gap-4 py-32 ${theme.text}`}>
                                    <div className="w-10 h-10 border-4 border-[#c97b6b]/30 border-t-[#c97b6b] rounded-full animate-spin" />
                                    <p className="text-sm font-semibold opacity-50">Preparing your reader...</p>
                                </div>
                            }
                            error={
                                <PDFErrorState
                                    type="load"
                                    theme={theme}
                                    onRetry={handleRetry}
                                />
                            }
                        >
                            {!pdfError && (
                                <Page
                                    pageNumber={currentPage}
                                width={pageRenderWidth}
                                    scale={zoom}
                                    renderAnnotationLayer={true}
                                    renderTextLayer={true}
                                    className="overflow-hidden rounded-sm shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
                                    loading={
                                        <div
                                            className="flex flex-col items-center justify-center gap-3 bg-white/5"
                                            style={{ width: 612 * zoom, height: 792 * zoom }}
                                        >
                                            <div className="w-8 h-8 border-4 border-[#c97b6b]/30 border-t-[#c97b6b] rounded-full animate-spin" />
                                            <p className={`text-xs ${theme.text} opacity-40`}>Rendering page...</p>
                                        </div>
                                    }
                                    error={
                                        <PDFErrorState
                                            type="load"
                                            theme={theme}
                                            onRetry={handleRetry}
                                        />
                                    }
                                />
                            )}
                        </Document>
                    ) : (
                        <div className={`text-center py-24 ${theme.text} opacity-30`}>
                            <BookOpen className="w-16 h-16 mx-auto mb-4" />
                            <p>No PDF available for this book</p>
                        </div>
                    )}
                </main>

                {/* -- SETTINGS PANEL -------------------------------------- */}
                <AnimatePresence>
                    {activePanel === 'settings' && (
                        <motion.aside
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className={`absolute right-0 inset-y-0 w-full sm:w-72 z-40 border-l flex flex-col ${theme.border}`}
                            style={{ background: theme.bg }}
                        >
                            <div
                                className={`flex items-center justify-between p-5 border-b ${theme.border}`}
                            >
                                <h2
                                    className={`font-bold tracking-widest uppercase text-xs ${theme.text}`}
                                >
                                    Reading Settings
                                </h2>
                                <button
                                    onClick={() => setActivePanel(null)}
                                    className={`p-1 rounded ${theme.text} hover:bg-white/10`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* Reading Mode */}
                                <div>
                                    <p
                                        className={`text-[10px] font-bold tracking-widest uppercase mb-3 opacity-50 ${theme.text}`}
                                    >
                                        Reading Mode
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(READING_MODES).map(([key, m]) => {
                                            const Icon = m.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    id={`btn-mode-${key}`}
                                                    onClick={() => setMode(key)}
                                                    title={m.description}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                                        mode === key
                                                            ? 'border-[#c97b6b] text-[#c97b6b] bg-[#c97b6b]/10'
                                                            : `${theme.border} ${theme.text} opacity-60 hover:opacity-100 bg-white/5`
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" /> {m.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Zoom */}
                                <div>
                                    <p
                                        className={`text-[10px] font-bold tracking-widest uppercase mb-3 opacity-50 ${theme.text}`}
                                    >
                                        Zoom - {Math.round(zoom * 100)}%
                                    </p>
                                    <input
                                        type="range"
                                        min={50}
                                        max={200}
                                        step={5}
                                        value={Math.round(zoom * 100)}
                                        onChange={e => setZoom(e.target.value / 100)}
                                        className="w-full accent-[#c97b6b] cursor-pointer"
                                    />
                                    <div
                                        className={`flex justify-between text-[10px] opacity-40 mt-1 ${theme.text}`}
                                    >
                                        <span>50%</span>
                                        <span>100%</span>
                                        <span>200%</span>
                                    </div>
                                </div>

                                {/* Bookmarks */}
                                {bookmarks.length > 0 && (
                                    <div>
                                        <p
                                            className={`text-[10px] font-bold tracking-widest uppercase mb-3 opacity-50 ${theme.text}`}
                                        >
                                            Bookmarks ({bookmarks.length})
                                        </p>
                                        <div className="space-y-1.5">
                                            {bookmarks
                                                .sort((a, b) => a - b)
                                                .map(pg => (
                                                    <button
                                                        key={pg}
                                                        onClick={() => {
                                                            setCurrentPage(pg);
                                                            setActivePanel(null);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border ${theme.border} bg-white/5 text-xs hover:bg-white/10 transition-all`}
                                                    >
                                                        <Bookmark
                                                            className="w-3.5 h-3.5 text-[#c97b6b]"
                                                            fill="currentColor"
                                                        />
                                                        <span className={theme.text}>Page {pg}</span>
                                                        {pg === currentPage && (
                                                            <span className="ml-auto text-[#c97b6b] text-[10px] font-bold">
                                                                CURRENT
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    )}

                    {/* -- STATS PANEL ------------------------------------- */}
                    {activePanel === 'stats' && (
                        <motion.aside
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className={`absolute right-0 inset-y-0 w-full sm:w-72 z-40 border-l flex flex-col ${theme.border}`}
                            style={{ background: theme.bg }}
                        >
                            <div
                                className={`flex items-center justify-between p-5 border-b ${theme.border}`}
                            >
                                <h2
                                    className={`font-bold tracking-widest uppercase text-xs ${theme.text}`}
                                >
                                    Reading Stats
                                </h2>
                                <button
                                    onClick={() => setActivePanel(null)}
                                    className={`p-1 rounded ${theme.text} hover:bg-white/10`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 p-5 space-y-4">
                                {[
                                    {
                                        label: 'Current Page',
                                        value: `${currentPage} / ${totalPages || '...'}`,
                                        icon: BookOpen,
                                    },
                                    {
                                        label: 'Completion',
                                        value: `${progress}%`,
                                        icon: BarChart2,
                                    },
                                    {
                                        label: 'Pages Read',
                                        value: `${pagesRead.size} pages`,
                                        icon: Check,
                                    },
                                    {
                                        label: 'Reading Time',
                                        value: `${Math.floor(readingSeconds / 60)} min`,
                                        icon: Clock,
                                    },
                                    {
                                        label: 'Bookmarks',
                                        value: `${bookmarks.length}`,
                                        icon: Bookmark,
                                    },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className={`flex items-center justify-between p-4 rounded-xl border ${theme.border} bg-white/5`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-4 h-4 text-[#c97b6b]" />
                                            <span className={`text-sm ${theme.text} opacity-70`}>
                                                {label}
                                            </span>
                                        </div>
                                        <span className={`text-sm font-bold ${theme.text}`}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                                {/* Progress Bar */}
                                <div>
                                    <div className="h-2 rounded-full overflow-hidden bg-white/10">
                                        <div
                                            className="h-full bg-[#c97b6b] transition-all duration-500 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p
                                        className={`text-[10px] text-center mt-2 opacity-40 ${theme.text}`}
                                    >
                                        {progress}% complete
                                    </p>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* -- BOTTOM PROGRESS BAR ---------------------------------------- */}
            <footer
                className={`flex-none min-h-16 flex items-center gap-3 px-3 sm:px-6 z-30 border-t ${theme.border} shadow-[0_-18px_50px_rgba(0,0,0,0.22)]`}
                style={{ background: `${theme.bg}f2`, backdropFilter: 'blur(18px)' }}
            >
                {/* Mobile page nav */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1}
                        className={`grid h-11 w-11 place-items-center rounded-2xl border ${theme.border} bg-white/5 disabled:opacity-20 ${theme.text}`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
                        className={`grid h-11 w-11 place-items-center rounded-2xl border ${theme.border} bg-white/5 disabled:opacity-20 ${theme.text}`}
                        aria-label="Next page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress slider */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                    <span className={`text-[10px] font-bold opacity-40 shrink-0 ${theme.text}`}>
                        1
                    </span>
                    <input
                        id="progress-slider"
                        type="range"
                        min={1}
                        max={totalPages || 1}
                        value={currentPage}
                        onChange={e => setCurrentPage(Number(e.target.value))}
                        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-[#c97b6b]"
                        title={`Page ${currentPage} of ${totalPages}`}
                    />
                    <span className={`text-[10px] font-bold opacity-40 shrink-0 ${theme.text}`}>
                        {totalPages || '...'}
                    </span>
                </div>

                <button
                    onClick={toggleBookmark}
                    className={`md:hidden grid h-11 w-11 place-items-center rounded-2xl border ${theme.border} bg-white/5 transition-colors ${
                        isCurrentPageBookmarked ? 'text-[#c97b6b]' : `${theme.text} opacity-80`
                    }`}
                    aria-label={isCurrentPageBookmarked ? 'Remove bookmark' : 'Bookmark page'}
                >
                    <Bookmark className="h-4 w-4" fill={isCurrentPageBookmarked ? 'currentColor' : 'none'} />
                </button>

                {/* Save button */}
                <button
                    id="btn-save-progress"
                    onClick={() => saveProgress(currentPage, false)}
                    disabled={saving}
                    className="flex min-h-11 items-center gap-2 px-3 sm:px-4 py-2 bg-[#c97b6b] hover:bg-[#b8695c] text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl disabled:opacity-50 transition-all shrink-0"
                    title="Save reading progress"
                >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                </button>
            </footer>

            <StreakCelebration
                open={isStreakCelebrationOpen}
                onClose={closeStreakCelebration}
                previousStreak={previousStreak}
                newStreak={newStreak}
                weeklyProgress={weeklyProgress}
                milestone={milestone}
                type={celebrationType}
                title={celebrationTitle}
                message={celebrationMessage}
                ctaLabel={celebrationCtaLabel}
            />
        </div>
    );
};

export default ReaderPage;



