import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bug,
  Clock,
  Lightbulb,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";

const feedbackTypes = [
  { id: "feedback", label: "Feedback", Icon: MessageSquare },
  { id: "bug", label: "Bug Report", Icon: Bug },
  { id: "feature", label: "Feature", Icon: Lightbulb },
];

const FeedbackPage = () => {
  const [type, setType] = useState("feedback");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(`ReadNest ${type}: ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nType: ${type}\n\nMessage:\n${form.message}`
    );

    window.location.href = `mailto:support@readnest.app?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f4ef] text-slate-950">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#f6f4ef]" />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.25) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="absolute -top-20 -left-28 h-[28rem] w-[28rem] rounded-full bg-blue-100 blur-3xl opacity-70" />
        <div className="absolute top-[28%] right-[-8%] h-[26rem] w-[26rem] rounded-full bg-slate-200 blur-3xl opacity-80" />
        <div className="absolute bottom-[-12%] left-[35%] h-[22rem] w-[22rem] rounded-full bg-[#d58d72]/20 blur-3xl" />
      </div>

      <header className="relative z-10 px-6 md:px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-slate-950">
            ReadNest
          </span>
        </Link>

        <Link
          to="/overview"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm transition hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      <section className="relative z-10 px-6 md:px-10 py-12 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-blue-600">
              Support and Feedback
            </p>

            <h1
              className="text-5xl md:text-7xl font-black uppercase leading-[0.92] tracking-[-0.055em] text-slate-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Let's
              <br />
              talk
              <br />
              <span className="text-slate-400">about it.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-relaxed text-slate-600">
              Found a bug, have an idea, or want to suggest a better reading
              experience? Send it here and keep improving ReadNest.
            </p>

            <div className="mt-10 grid gap-4 max-w-md">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Email
                    </p>
                    <p className="text-sm font-bold text-slate-950">
                      support@readnest.app
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Response Time
                    </p>
                    <p className="text-sm font-bold text-slate-950">
                      Within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 md:p-7 shadow-[0_30px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl"
          >
            <div className="grid grid-cols-3 gap-3">
              {feedbackTypes.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setType(id)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                    type === id
                      ? "bg-black text-white shadow-[0_16px_35px_rgba(15,23,42,0.16)]"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-950"
                  }`}
                >
                  <Icon className="hidden h-4 w-4 sm:block" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Name
                </span>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-200 bg-[#f6f4ef] px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Email
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-[#f6f4ef] px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Message
              </span>
              <textarea
                required
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your feedback, bug, or idea in detail..."
                rows={7}
                className="w-full resize-none rounded-xl border border-slate-200 bg-[#f6f4ef] px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
              />
            </label>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-600" />
                <span>
                  Your message opens in your email app, so you can review it
                  before sending.
                </span>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-7 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-slate-800"
              >
                Send
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
};

export default FeedbackPage;




