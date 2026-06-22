import ReaderCharacterMotion from "@/components/visuals/ReaderCharacterMotion";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import api, { ENDPOINTS, clearSession, saveSession } from '@/lib/api';
import { ArrowLeft, BookOpenCheck, ShieldCheck, User } from 'lucide-react';
import AnimateIcon from '@/components/animate-ui/AnimateIcon';

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#c97b6b]/15 blur-[120px]" style={{ animation: 'authOrb1 8s ease-in-out infinite alternate' }} />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2f766d]/12 blur-[120px]" style={{ animation: 'authOrb2 12s ease-in-out infinite alternate' }} />
    <div className="absolute inset-0 bg-[#060606]/85 backdrop-blur-[60px]" />
    <style>{`
      @keyframes authOrb1 { from { transform: translate(0,0); } to { transform: translate(5%,8%); } }
      @keyframes authOrb2 { from { transform: translate(0,0); } to { transform: translate(-5%,-6%); } }
    `}</style>
  </div>
);


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [loginMode, setLoginMode] = useState('user'); // 'user' | 'admin'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });
  const [forgotMessage, setForgotMessage] = useState('');

  const navigate = useNavigate();

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
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#060606] selection:bg-[#c97b6b] selection:text-white">
      <AnimatedBackground />
      <div className="pointer-events-none hidden xl:block fixed right-[7%] bottom-[8%] z-10 w-[360px]">
        <ReaderCharacterMotion
          size="full"
          imageClassName="h-[360px]"
          showBadge={false}
          showGlow={true}
          dark
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <AnimateIcon animateOnHover animation="draw">
              <BookOpenCheck className="h-8 w-8 text-[#c97b6b] group-hover:scale-110 transition-transform duration-300" />
            </AnimateIcon>
            <span className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              ReadNest
            </span>
          </Link>
          <p className="text-sm tracking-wide uppercase text-white/30" style={{ fontFamily: 'var(--font-accent)' }}>
            Your digital reading space
          </p>
        </div>

        {/* Login Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setLoginMode('user')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border ${
              loginMode === 'user'
                ? 'bg-white/10 border-white/20 text-white'
                : 'border-white/5 text-white/30 hover:text-white/50 hover:border-white/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            User Login
          </button>
          <button
            onClick={() => setLoginMode('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border ${
              loginMode === 'admin'
                ? 'bg-[#c97b6b]/15 border-[#c97b6b]/40 text-[#c97b6b]'
                : 'border-white/5 text-white/30 hover:text-white/50 hover:border-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Login
          </button>
        </div>

        {/* Admin mode indicator */}
        <AnimatePresence>
          {loginMode === 'admin' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c97b6b]/20 bg-[#c97b6b]/8 text-[#c97b6b] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Admin credentials required. Access will be verified server-side.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glassmorphism Container */}
        <div className="bg-[#111111]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full h-12 grid-cols-2 p-1 border rounded-xl bg-black/40 border-white/5">
              <TabsTrigger
                value="signin"
                className="rounded-lg text-sm font-semibold tracking-wide text-white/50 data-[state=active]:bg-[#c97b6b] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#c97b6b]/20 transition-all duration-300"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                LOGIN
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg text-sm font-semibold tracking-wide text-white/50 data-[state=active]:bg-[#c97b6b] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#c97b6b]/20 transition-all duration-300"
                style={{ fontFamily: 'var(--font-accent)' }}
              >
                SIGN UP
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
                {/* Name - signup only */}
                {activeTab === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/20 focus-visible:border-[#c97b6b] focus-visible:ring-1 focus-visible:ring-[#c97b6b] transition-all"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="hello@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/20 focus-visible:border-[#c97b6b] focus-visible:ring-1 focus-visible:ring-[#c97b6b] transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1 pr-1">
                    <Label htmlFor="password" className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Password
                    </Label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setForgotMessage('Password reset is not available yet. Please contact support or sign in with Google/GitHub if your account uses OAuth.')}
                        className="text-[10px] font-bold text-[#c97b6b] hover:text-[#c97b6b]/80 transition-colors tracking-widest uppercase"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/20 focus-visible:border-[#c97b6b] focus-visible:ring-1 focus-visible:ring-[#c97b6b] transition-all"
                  />
                </div>

                <div className="pt-2" />

                {forgotMessage && activeTab === 'signin' && (
                  <div
                    role="status"
                    className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
                  >
                    {forgotMessage}
                  </div>
                )}

                {status.message && (
                  <div
                    role={status.type === 'error' ? 'alert' : 'status'}
                    className={`rounded-xl border px-4 py-3 text-sm ${status.type === 'error'
                      ? 'border-red-500/30 bg-red-500/10 text-red-300'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={status.loading}
                    className={`w-full h-12 rounded-xl font-bold text-sm tracking-widest uppercase transition-all ${
                      loginMode === 'admin'
                        ? 'bg-[#c97b6b] hover:bg-[#b8695c] text-white shadow-[0_0_20px_rgba(201,123,107,0.2)] hover:shadow-[0_0_30px_rgba(201,123,107,0.35)]'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                    }`}
                    style={{ fontFamily: 'var(--font-accent)' }}
                  >
                    {status.loading
                      ? 'Please wait...'
                      : activeTab === 'signin'
                        ? loginMode === 'admin' ? 'Access Admin Panel' : 'Access Library'
                        : 'Create Account'}
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </form>

          {/* Social Auth - only for user login */}
          {loginMode === 'user' && (
            <>
              <div className="flex items-center gap-4 mt-8 mb-6">
                <div className="flex-1 h-[1px] bg-white/5" />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">OR CONTINUE WITH</span>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => { window.location.href = `${API_BASE_URL}/auth/google`; }}
                  variant="outline"
                  className="transition-colors h-11 rounded-xl border-white/10 bg-black/20 hover:bg-white/5 text-white/70 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { window.location.href = `${API_BASE_URL}/auth/github`; }}
                  className="transition-colors h-11 rounded-xl border-white/10 bg-black/20 hover:bg-white/5 text-white/70 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-[11px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors inline-flex items-center gap-2">
            <AnimateIcon animateOnHover animation="turn"><ArrowLeft className="h-4 w-4" /></AnimateIcon>
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;













