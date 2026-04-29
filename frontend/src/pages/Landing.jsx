import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Sprint Tracker</span>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Open App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Built for teams that ship
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
            Manage sprints.
            <br />
            <span className="text-gray-400">Deliver results.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Plan weekly sprints, track task progress, and generate professional PDF reports — all in one place. No fluff, no complexity.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything you need. Nothing you don't.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weekly Sprint Planning</h3>
              <p className="text-gray-500 leading-relaxed">
                Create and manage weekly sprints with clear start and end dates. Keep your team focused on what matters most.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Task Tracking</h3>
              <p className="text-gray-500 leading-relaxed">
                Organize tasks by priority and status. Visual progress bars give you an instant view of sprint health.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Reports</h3>
              <p className="text-gray-500 leading-relaxed">
                Generate professional PDF reports with one click. Perfect for stakeholder meetings and sprint retrospectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Three steps to better sprints</h2>
          </div>
          <div className="space-y-12">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create a Sprint</h3>
                <p className="text-gray-500 leading-relaxed">Set a title, pick your dates, and you're ready to go. Sprints are designed around a weekly cycle.</p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Add & Track Tasks</h3>
                <p className="text-gray-500 leading-relaxed">Break down your goals into actionable tasks. Assign priority, track progress, and update status as you go.</p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Your Report</h3>
                <p className="text-gray-500 leading-relaxed">When your sprint is done, export a clean PDF summary with all the metrics your stakeholders care about.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Who it's for</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for people who ship</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Team Leads</h3>
              <p className="text-gray-400 leading-relaxed">
                Keep your team aligned and focused. Track progress without micromanaging. Generate reports that show real results.
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Project Managers</h3>
              <p className="text-gray-400 leading-relaxed">
                Plan sprints that deliver. Monitor velocity, spot bottlenecks early, and communicate progress with clean PDF reports.
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Developers</h3>
              <p className="text-gray-400 leading-relaxed">
                Know exactly what to work on each week. Track your progress visually and stay accountable without overhead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Ready to take control of your sprints?
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Start managing your weekly sprints today. Simple, fast, and effective.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
          >
            Open Sprint Tracker
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Sprint Tracker</span>
          </div>
          <p className="text-sm text-gray-400">Manage sprints. Deliver results.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
