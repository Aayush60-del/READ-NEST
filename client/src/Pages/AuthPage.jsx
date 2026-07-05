import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import api, { API_BASE_URL, ENDPOINTS, clearSession, fetchCurrentUser, getStoredSession, saveSession } from '@/lib/api';
import { ArrowLeft, BookOpenCheck, LibraryBig, Loader2, Moon, ShieldCheck, Sparkles, User } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,123,107,0.18),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(47,118,109,0.14),transparent_28%),linear-gradient(135deg,#07111f_0%,#0b1018_46%,#15100f_100%)]" />
    <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#c97b6b]/18 blur-[120px]" style={{ animation: 'authOrb1 10s ease-in-out infinite alternate' }} />
    <div className="absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[#2f766d]/18 blur-[130px]" style={{ animation: 'authOrb2 13s ease-in-out infinite alternate' }} />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#05070c] to-transparent" />
    <style>{`
      @keyframes authOrb1 { from { transform: translate3d(0, 0, 0) scale(1); } to { transform: translate3d(6%, 8%, 0) scale(1.08); } }
      @keyframes authOrb2 { from { transform: translate3d(0, 0, 0) scale(1); } to { transform: translate3d(-7%, -5%, 0) scale(1.06); } }
    `}</style>
  </div>
);

const BrandIllustration = () => (
  <div className="relative mt-10 hidden h-[310px] w-full max-w-[520px] lg:block">
    <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c97b6b]/18 blur-3xl" />
    <svg
      viewBox="0 0 520 310"
      role="img"
      aria-label="Glowing open book under a moonlit library sky"
      className="relative h-full w-full drop-shadow-[0_28px_60px_rgba(0,0,0,0.45)]"
    >
      <defs>
        <linearGradient id="bookCover" x1="80" x2="440" y1="170" y2="255" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C97B6B" />
          <stop offset="1" stopColor="#7F4B55" />
        </linearGradient>
        <linearGradient id="pageGlow" x1="143" x2="382" y1="121" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF3D3" />
          <stop offset="1" stopColor="#D9B98B" />
        </linearGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M90 235C132 199 181 190 251 225C322 188 386 199 430 235V262C371 238 309 236 260 267C207 236 148 238 90 262V235Z" fill="url(#bookCover)" />
      <path d="M106 116C159 111 211 128 251 161V225C207 192 159 181 106 194V116Z" fill="url(#pageGlow)" />
      <path d="M414 116C361 111 309 128 269 161V225C313 192 361 181 414 194V116Z" fill="url(#pageGlow)" />
      <path d="M251 161V225" stroke="#7F4B55" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M128 142C164 139 196 148 226 169M128 166C164 162 195 171 226 190" stroke="#7F4B55" strokeWidth="4" strokeLinecap="round" opacity="0.22" />
      <path d="M392 142C356 139 324 148 294 169M392 166C356 162 325 171 294 190" stroke="#7F4B55" strokeWidth="4" strokeLinecap="round" opacity="0.22" />
      <path d="M116 111C158 103 208 112 251 148" fill="none" stroke="#FFF4D5" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
      <path d="M404 111C362 103 312 112 269 148" fill="none" stroke="#FFF4D5" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
      <path d="M161 76H346" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
      <path d="M185 49H319" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="10" strokeLinecap="round" />
      <path d="M342 48C326 68 333 97 358 106C330 112 309 91 317 65C322 49 333 43 342 48Z" fill="#F6D391" filter="url(#softGlow)" />
      <circle cx="151" cy="65" r="3" fill="#F6D391" />
      <circle cx="226" cy="36" r="2.5" fill="#FFFFFF" opacity="0.75" />
      <circle cx="390" cy="83" r="2.5" fill="#FFFFFF" opacity="0.7" />
      <path d="M132 86L137 97L149 101L138 106L133 118L128 106L117 101L128 96L132 86Z" fill="#F6D391" opacity="0.9" />
      <path d="M411 128L415 136L424 139L416 143L412 152L408 143L399 139L407 136L411 128Z" fill="#F6D391" opacity="0.75" />
      <ellipse cx="260" cy="254" rx="155" ry="20" fill="#000000" opacity="0.28" />
    </svg>
  </div>
);

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [loginMode, setLoginMode] = useState('user'); // 'user' | 'admin'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: '' });

    try {
      const isLogin = activeTab === 'signin';
      const body = isLogin
          ? { email: formData.email, password: formData.password }
          : formData;

      const endpoint = isLogin ? ENDPOINTS.AUTH.LOGIN : ENDPOINTS.AUTH.REGISTER;
      const payload = await api.post(endpoint, body);

      // Admin mode: verify role
      if (loginMode === 'admin') {
        if (payload.user?.role !== 'admin') {
          clearSession();
          setStatus({ loading: false, message: 'Access denied. This account does not have admin privileges.', type: 'error' });
          return;
        }
        saveSession(payload);
        setStatus({ loading: false, message: 'Admin access granted.', type: 'success' });
        navigate('/admin');
      } else {
        saveSession(payload);
        setStatus({ loading: false, message: payload.message || 'Welcome to ReadNest.', type: 'success' });
        navigate('/overview');
      }
    } catch (error) {
      setStatus({ loading: false, message: error.message, type: 'error' });
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2 } },
  };

  const isSignup = activeTab === 'signup';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070c] px-4 py-6 text-white selection:bg-[#c97b6b] selection:text-white sm:px-6 lg:px-8">
      <AnimatedBackground />

      <Link
        to="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white/55 backdrop-blur-xl transition hover:border-white/20 hover:text-white sm:left-8 sm:top-8"
      >
        <AnimateIcon animateOnHover animation="turn"><ArrowLeft className="h-4 w-4" /></AnimateIcon>
        Home
      </Link>

      <main className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-8 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:gap-14 lg:pt-0">
        <motion.section
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center lg:text-left"
        >
          <div className="mx-auto flex max-w-xl flex-col items-center lg:mx-0 lg:items-start">
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#f6d391]/25 bg-[#c97b6b]/15 shadow-[0_0_40px_rgba(201,123,107,0.18)] backdrop-blur-xl">
                <BookOpenCheck className="h-7 w-7 text-[#f6d391] transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span>
                <span className="block text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  ReadNest
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.36em] text-[#f6d391]/70">
                  Literary Sanctuary
                </span>
              </span>
            </Link>

            <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Enter a calmer way to read, track, and return to your books.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/62 sm:text-lg">
              Read smarter, track progress, and build a consistent reading habit.
            </p>

            <div className="mt-8 grid w-full max-w-lg grid-cols-3 gap-3">
              {[
                { icon: LibraryBig, label: 'Library' },
                { icon: Moon, label: 'Focus' },
                { icon: Sparkles, label: 'Progress' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-center backdrop-blur-xl lg:text-left">
                  <Icon className="mx-auto h-5 w-5 text-[#f6d391] lg:mx-0" />
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-white/55">{label}</p>
                </div>
              ))}
            </div>

            <BrandIllustration />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#101722]/72 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-7 lg:rounded-[32px]">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#c97b6b]/14 blur-3xl" />
            <div className="absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-[#2f766d]/12 blur-3xl" />

            <div className="relative">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f6d391]/70">
                  {loginMode === 'admin' ? 'Admin access' : 'Member access'}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {isSignup ? 'Create your ReadNest account' : 'Welcome back'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  {isSignup ? 'Start building your digital library.' : 'Continue your reading journey.'}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5">
                <button
                  type="button"
                  onClick={() => setLoginMode('user')}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    loginMode === 'user'
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                  }`}
                >
                  <User className="h-4 w-4" />
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('admin')}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    loginMode === 'admin'
                      ? 'bg-[#c97b6b]/18 text-[#f6d391] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
              </div>

              <AnimatePresence>
                {loginMode === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 rounded-2xl border border-[#c97b6b]/25 bg-[#c97b6b]/10 px-4 py-3 text-sm leading-6 text-[#f7d8bd]">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      Admin credentials required. Access will be verified server-side.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-7">
                <TabsList className="grid h-[52px] w-full grid-cols-2 rounded-2xl border border-white/10 bg-black/25 p-1.5">
                  <TabsTrigger
                    value="signin"
                    className="rounded-xl text-sm font-bold tracking-wide text-white/45 transition-all duration-300 data-[state=active]:bg-[#c97b6b] data-[state=active]:text-white data-[state=active]:shadow-[0_12px_30px_rgba(201,123,107,0.25)]"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-xl text-sm font-bold tracking-wide text-white/45 transition-all duration-300 data-[state=active]:bg-[#c97b6b] data-[state=active]:text-white data-[state=active]:shadow-[0_12px_30px_rgba(201,123,107,0.25)]"
                  >
                    Sign up
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-5"
                  >
                    {isSignup && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="pl-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          className="h-[52px] rounded-2xl border-white/10 bg-white/[0.055] px-4 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/24 focus-visible:border-[#f6d391]/70 focus-visible:ring-4 focus-visible:ring-[#c97b6b]/20"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="pl-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="hello@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-[52px] rounded-2xl border-white/10 bg-white/[0.055] px-4 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/24 focus-visible:border-[#f6d391]/70 focus-visible:ring-4 focus-visible:ring-[#c97b6b]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="pl-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="********"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-[52px] rounded-2xl border-white/10 bg-white/[0.055] px-4 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/24 focus-visible:border-[#f6d391]/70 focus-visible:ring-4 focus-visible:ring-[#c97b6b]/20"
                      />
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

                    <motion.div whileHover={{ scale: status.loading ? 1 : 1.01 }} whileTap={{ scale: status.loading ? 1 : 0.99 }}>
                      <Button
                        type="submit"
                        disabled={status.loading}
                        className="h-[52px] w-full rounded-2xl bg-[#c97b6b] text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_45px_rgba(201,123,107,0.28)] transition-all hover:bg-[#d98c7c] hover:shadow-[0_22px_55px_rgba(201,123,107,0.36)] disabled:opacity-70"
                      >
                        {status.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {status.loading
                          ? 'Please wait...'
                          : isSignup
                            ? 'Create Account'
                            : loginMode === 'admin' ? 'Access Admin Panel' : 'Access Library'}
                      </Button>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </form>

              {loginMode === 'user' && (
                <>
                  <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/28">Or continue with</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => { window.location.href = `${API_BASE_URL}/auth/google`; }}
                      variant="outline"
                      className="h-12 rounded-2xl border-white/10 bg-white/[0.045] text-white/72 transition-colors hover:bg-white/[0.075] hover:text-white"
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
                      className="h-12 rounded-2xl border-white/10 bg-white/[0.045] text-white/72 transition-colors hover:bg-white/[0.075] hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default AuthPage;
