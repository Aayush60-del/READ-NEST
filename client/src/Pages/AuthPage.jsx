import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, Loader2, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import api, { API_BASE_URL, ENDPOINTS, clearSession, fetchCurrentUser, getStoredSession, saveSession } from '@/lib/api';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [loginMode, setLoginMode] = useState('user');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const isSignup = activeTab === 'signup';

  useEffect(() => {
    let isActive = true;
    const { token, user } = getStoredSession();

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    const redirectAuthenticatedUser = (nextUser) => {
      if (!isActive || !nextUser) return;
      navigate(nextUser.role === 'admin' ? '/admin' : '/overview', { replace: true });
    };

    if (user) {
      redirectAuthenticatedUser(user);
      return () => {
        isActive = false;
      };
    }

    fetchCurrentUser()
      .then(redirectAuthenticatedUser)
      .catch(() => {
        clearSession();
      });

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const copy = useMemo(() => {
    if (loginMode === 'admin') {
      return {
        label: 'Admin access',
        title: 'Sign in as admin',
        subtitle: 'Manage books, uploads, and members.',
        cta: 'Access admin',
      };
    }

    if (isSignup) {
      return {
        label: 'Create account',
        title: 'Start reading with ReadNest',
        subtitle: 'Save progress, notes, highlights, and streaks.',
        cta: 'Create account',
      };
    }

    return {
      label: 'Member access',
      title: 'Welcome back',
      subtitle: 'Continue from where you left off.',
      cta: 'Access library',
    };
  }, [isSignup, loginMode]);

  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setStatus({ loading: false, message: '', type: '' });
    if (mode === 'admin') setActiveTab('signin');
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setStatus({ loading: false, message: '', type: '' });
    if (value === 'signup') setLoginMode('user');
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: '', type: '' });

    try {
      const isLogin = activeTab === 'signin';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      const endpoint = isLogin ? ENDPOINTS.AUTH.LOGIN : ENDPOINTS.AUTH.REGISTER;
      const payload = await api.post(endpoint, body);

      if (loginMode === 'admin') {
        if (payload.user?.role !== 'admin') {
          clearSession();
          setStatus({ loading: false, message: 'Access denied. This account is not an admin.', type: 'error' });
          return;
        }

        saveSession(payload);
        setStatus({ loading: false, message: 'Admin access granted.', type: 'success' });
        navigate('/admin');
        return;
      }

      saveSession(payload);
      setStatus({ loading: false, message: payload.message || 'Welcome to ReadNest.', type: 'success' });
      navigate('/overview');
    } catch (error) {
      setStatus({ loading: false, message: error.message, type: 'error' });
    }
  };

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <div className="min-h-screen bg-[#080c12] px-4 py-5 text-white sm:px-6">
      <Link
        to="/"
        className="fixed left-4 top-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white/60 transition hover:border-white/20 hover:text-white sm:left-6 sm:top-6"
      >
        <AnimateIcon animateOnHover animation="turn"><ArrowLeft className="h-4 w-4" /></AnimateIcon>
        Home
      </Link>

      <main className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-5xl items-center gap-10 pt-16 lg:grid-cols-[0.9fr_430px] lg:pt-0">
        <motion.section {...motionProps} className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#c97b6b]/25 bg-[#c97b6b]/12 text-[#f4cda6]">
              <BookOpenCheck className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-4xl font-black tracking-tight">ReadNest</span>
              <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.28em] text-[#f4cda6]/70">
                Literary sanctuary
              </span>
            </span>
          </Link>

          <h1 className="mt-10 max-w-xl text-5xl font-black leading-[1.02] tracking-tight">
            A quieter place to return to your books.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/56">
            Simple sign in, real progress, notes, highlights, and reading sessions in one workspace.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {['Progress', 'Notes', 'Streaks'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/52">{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...motionProps} className="w-full">
          <div className="mx-auto w-full max-w-[430px] rounded-[24px] border border-white/10 bg-[#0f151d] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:p-6">
            <div className="mb-7 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#c97b6b]/25 bg-[#c97b6b]/12 text-[#f4cda6]">
                  <BookOpenCheck className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-3xl font-black tracking-tight">ReadNest</span>
                  <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#f4cda6]/70">
                    Literary sanctuary
                  </span>
                </span>
              </Link>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f4cda6]/72">{copy.label}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">{copy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/52">{copy.subtitle}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/18 p-1">
              <button
                type="button"
                onClick={() => handleModeChange('user')}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-[0.13em] transition ${
                  loginMode === 'user'
                    ? 'bg-white text-[#080c12]'
                    : 'text-white/42 hover:bg-white/[0.05] hover:text-white/78'
                }`}
              >
                <User className="h-4 w-4" />
                User
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('admin')}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-[0.13em] transition ${
                  loginMode === 'admin'
                    ? 'bg-white text-[#080c12]'
                    : 'text-white/42 hover:bg-white/[0.05] hover:text-white/78'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
              <TabsList className="grid h-[46px] w-full grid-cols-2 rounded-2xl border border-white/10 bg-black/18 p-1">
                <TabsTrigger
                  value="signin"
                  className="rounded-xl text-sm font-black text-white/45 transition data-active:bg-[#c97b6b] data-active:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl text-sm font-black text-white/45 transition data-active:bg-[#c97b6b] data-active:text-white"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {loginMode === 'admin' && (
              <p className="mt-4 rounded-2xl border border-[#f4cda6]/15 bg-[#f4cda6]/8 px-4 py-3 text-sm leading-6 text-[#f4cda6]/78">
                Admin mode is login-only and verified after sign in.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">
                        Full name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.055] px-4 text-[15px] text-white placeholder:text-white/28 focus-visible:border-[#c97b6b] focus-visible:outline-none focus-visible:ring-0"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="hello@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.055] pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus-visible:border-[#c97b6b] focus-visible:outline-none focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">
                      Password
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.055] pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus-visible:border-[#c97b6b] focus-visible:outline-none focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {status.message && (
                    <div
                      role={status.type === 'error' ? 'alert' : 'status'}
                      className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                        status.type === 'error'
                          ? 'border-red-400/25 bg-red-500/10 text-red-200'
                          : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status.loading}
                    className="h-12 w-full rounded-2xl bg-[#c97b6b] text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(201,123,107,0.20)] transition hover:bg-[#d38676] disabled:opacity-70"
                  >
                    {status.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {status.loading ? 'Please wait...' : copy.cta}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </form>

            {loginMode === 'user' && (
              <>
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Or continue with</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => { window.location.href = `${API_BASE_URL}/auth/google`; }}
                    variant="outline"
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.045] text-white/78 transition hover:bg-white/[0.075] hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { window.location.href = `${API_BASE_URL}/auth/github`; }}
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.045] text-white/78 transition hover:bg-white/[0.075] hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default AuthPage;
