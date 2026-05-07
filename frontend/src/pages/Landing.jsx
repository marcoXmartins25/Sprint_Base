import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TASKS = [
  { title: 'Design new dashboard', priority: 'high', status: 'done', hours: 4 },
  { title: 'Fix authentication bug', priority: 'high', status: 'done', hours: 2 },
  { title: 'Write API documentation', priority: 'medium', status: 'in-progress', hours: 3 },
  { title: 'Setup CI/CD pipeline', priority: 'medium', status: 'in-progress', hours: 5 },
  { title: 'Add unit tests', priority: 'low', status: 'to-do', hours: 0 },
  { title: 'Performance audit', priority: 'low', status: 'to-do', hours: 0 },
];

const priorityBadge = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
};

const statusBadge = {
  'done':        'bg-emerald-100 text-emerald-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'to-do':       'bg-gray-100 text-gray-500',
};

const statusLabel = {
  'done': 'Done', 'in-progress': 'In Progress', 'to-do': 'To Do',
};

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 30);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function TaskRow({ task, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100 bg-white transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : task.status === 'in-progress' ? 'border-blue-400' : 'border-gray-300'}`}>
        {task.status === 'done' && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        {task.status === 'in-progress' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
      </div>
      <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[task.priority]}`}>{task.priority}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>
      {task.hours > 0 && <span className="text-xs text-gray-400">{task.hours}h</span>}
    </div>
  );
}

function SprintPreview() {
  const done = TASKS.filter(t => t.status === 'done').length;
  const inProgress = TASKS.filter(t => t.status === 'in-progress').length;
  const pct = Math.round(((done * 100) + (inProgress * 50)) / TASKS.length);
  const totalHours = TASKS.reduce((s, t) => s + t.hours, 0);

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-xl shadow-gray-200/50 w-full max-w-lg">
      {/* Sprint header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">SPRINT 12</p>
          <p className="text-sm font-bold text-gray-800">Product Launch Prep</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Active</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Total', value: TASKS.length, cls: 'text-gray-800' },
          { label: 'Done', value: done, cls: 'text-emerald-600' },
          { label: 'In Progress', value: inProgress, cls: 'text-blue-600' },
          { label: 'Hours', value: `${totalHours}h`, cls: 'text-violet-600' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white rounded-xl p-2 text-center border border-gray-100">
            <p className={`text-lg font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span><span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {TASKS.map((task, i) => <TaskRow key={task.title} task={task} delay={i * 150} />)}
      </div>
    </div>
  );
}

export default function Landing() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Cursor glow */}
      <div className="pointer-events-none fixed inset-0 z-0 transition-opacity"
        style={{ background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06), transparent 80%)` }} />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-base font-bold text-gray-900">Sprint<span className="text-indigo-600">Base</span></span>
          </Link>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition hidden sm:block">Features</a>
            <Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition hidden sm:block">Pricing</Link>
            <Link to="/docs" className="text-sm text-gray-500 hover:text-gray-900 transition hidden sm:block">Docs</Link>
            <Link to="/login"
              className="px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Sprint management, reimagined
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                Ship faster.<br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Stay organized.
                </span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                Plan sprints, track tasks with priorities and hours, assign team members, and export beautiful PDF reports — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register-company"
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition shadow-lg shadow-indigo-200 text-center">
                  Get Started Free
                </Link>
                <a href="#features"
                  className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-center">
                  See how it works
                </a>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-100">
                {[
                  { value: 100, suffix: '+', label: 'Sprints created' },
                  { value: 98, suffix: '%', label: 'Tasks tracked' },
                  { value: 5, suffix: 'min', label: 'To get started' },
                ].map(({ value, suffix, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-gray-900"><AnimatedCounter target={value} suffix={suffix} /></p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live preview */}
            <div className="flex justify-center lg:justify-end">
              <SprintPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything your team needs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🗂️', color: 'bg-indigo-50', title: 'Sprint Planning', desc: 'Create sprints with dates, track progress with a live completion bar based on all task statuses.' },
              { icon: '✅', color: 'bg-emerald-50', title: 'Task Management', desc: 'Priority levels, due dates, hour tracking, and inline editing — no modals needed.' },
              { icon: '👥', color: 'bg-violet-50', title: 'Team Assignment', desc: 'Assign tasks to team members with avatar support. See who is working on what at a glance.' },
              { icon: '📊', color: 'bg-blue-50', title: 'Progress Tracking', desc: 'Smart progress bar that weighs Done (100%), In Progress (50%) and To Do (0%).' },
              { icon: '📄', color: 'bg-amber-50', title: 'PDF Reports', desc: 'Export beautiful, branded PDF reports with all task details, priorities and statuses.' },
              { icon: '🔒', color: 'bg-rose-50', title: 'Secure by Default', desc: 'JWT authentication, protected file uploads, and per-user data isolation.' },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-xl mb-4`}>{icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Up and running in minutes</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-violet-200 to-transparent" />
            <div className="space-y-10">
              {[
                { n: '1', title: 'Create a Sprint', desc: 'Set a title and pick your start/end dates. The sprint card appears instantly on your dashboard.' },
                { n: '2', title: 'Add Tasks', desc: 'Click "+ Add Task" and fill in title, priority, dates, hours and assignee. Edit anything inline directly in the table.' },
                { n: '3', title: 'Track & Update', desc: 'Click on Priority or Status to change them with a dropdown. Watch the progress bar update in real time.' },
                { n: '4', title: 'Export PDF', desc: 'Hit "↓ PDF" to download a branded report with all task details, ready to share with stakeholders.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-6 items-start pl-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 z-10">
                    {n}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 shadow-2xl shadow-indigo-200">
            <h2 className="text-3xl font-bold text-white mb-4">Choose your plan</h2>
            <p className="text-indigo-200 mb-8">Start free. Upgrade as you grow. Cancel anytime.</p>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition shadow-lg">
              View Pricing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">Sprint<span className="text-indigo-600">Base</span></span>
          <p className="text-xs text-gray-400">Ship faster. Stay organized.</p>
        </div>
      </footer>
    </div>
  );
}
