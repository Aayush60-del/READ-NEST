import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';

// Lazy loaded pages
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const AuthPage = lazy(() => import('./Pages/AuthPage'));
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

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <BrowserRouter>
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/feedback" element={<FeedbackPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
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

