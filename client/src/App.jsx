import React, { Suspense, lazy, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';
import { clearSession, fetchCurrentUser, getStoredSession } from '@/lib/api';

const ONBOARDING_STORAGE_KEY = 'readnest_onboarding_seen';

// Lazy loaded pages
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const AuthPage = lazy(() => import('./Pages/AuthPage'));
const OnboardingPage = lazy(() => import('./Pages/OnboardingPage'));
const FeedbackPage = lazy(() => import('./Pages/FeedbackPage'));
const OverviewPage = lazy(() => import('./Pages/OverviewPage'));
const ReaderPage = lazy(() => import('./Pages/ReaderPage'));
const LibraryPage = lazy(() => import('./Pages/LibraryPage'));
const BookDetailsPage = lazy(() => import('./Pages/BookDetailsPage'));
const DiscoverPage = lazy(() => import('./Pages/DiscoverPage'));
const ReadingStatsPage = lazy(() => import('./Pages/ReadingStatsPage'));
const AdminPage = lazy(() => import('./Pages/AdminPage'));
const ProfilePage = lazy(() => import('./Pages/ProfilePage'));
const SettingsPage = lazy(() => import('./Pages/SettingsPage'));
const OAuthSuccess = lazy(() => import('./Pages/OAuthSuccess'));

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center px-6">
    <div className="max-w-md text-center bg-[#161d27] p-8 rounded-2xl border border-white/5 shadow-2xl">
      <p className="text-sm font-bold text-[#c97b6b] uppercase tracking-widest">404 Error</p>
      <h1 className="mt-3 font-serif text-4xl text-white">Page not found</h1>
      <p className="mt-4 mb-8 text-white/60">
        The page you opened does not exist in ReadNest.
      </p>
      <Link
        to="/overview"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#c97b6b] px-5 text-sm font-bold tracking-widest uppercase text-white shadow-sm transition hover:bg-[#b8695c]"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);

const FallbackLoader = () => (
  <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#c97b6b] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const PublicEntryRoute = () => {
  const [sessionState, setSessionState] = useState(() => {
    const { token, user } = getStoredSession();
    return { token, user, loading: Boolean(token) && !user };
  });

  useEffect(() => {
    let isActive = true;

    if (!sessionState.token || sessionState.user) {
      return () => {
        isActive = false;
      };
    }

    fetchCurrentUser()
      .then((nextUser) => {
        if (!isActive) return;
        setSessionState((current) => ({ ...current, user: nextUser, loading: false }));
      })
      .catch(() => {
        clearSession();
        if (!isActive) return;
        setSessionState({ token: null, user: null, loading: false });
      });

    return () => {
      isActive = false;
    };
  }, [sessionState.token, sessionState.user]);

  if (sessionState.loading) {
    return <FallbackLoader />;
  }

  if (sessionState.token && sessionState.user) {
    return <Navigate to={sessionState.user.role === 'admin' ? '/admin' : '/overview'} replace />;
  }

  const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';

  if (!hasSeenOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<FallbackLoader />}>
            <Routes>
              <Route path="/" element={<PublicEntryRoute />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/feedback" element={<FeedbackPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<OverviewPage />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/reading-stats" element={<ReadingStatsPage />} />
                <Route path="/stats" element={<ReadingStatsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/books/:id" element={<BookDetailsPage />} />
                <Route path="/books/:id/read" element={<ReaderPage />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
