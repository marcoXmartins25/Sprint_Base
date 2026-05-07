import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'introduction', label: 'Introduction',
    items: [
      { id: 'what-is', label: 'What is SprintBase?' },
      { id: 'quick-start', label: 'Quick Start' },
    ],
  },
  {
    id: 'sprints', label: 'Sprints',
    items: [
      { id: 'create-sprint', label: 'Creating a Sprint' },
      { id: 'edit-sprint', label: 'Editing a Sprint' },
      { id: 'delete-sprint', label: 'Deleting a Sprint' },
    ],
  },
  {
    id: 'tasks', label: 'Tasks',
    items: [
      { id: 'add-task', label: 'Adding a Task' },
      { id: 'inline-edit', label: 'Inline Editing' },
      { id: 'priority', label: 'Priority & Status' },
      { id: 'hours', label: 'Tracking Hours' },
      { id: 'assign', label: 'Assigning Members' },
      { id: 'task-fields', label: 'Task Fields' },
    ],
  },
  {
    id: 'reports', label: 'Reports',
    items: [
      { id: 'pdf-report', label: 'Exporting PDF' },
    ],
  },
  {
    id: 'account', label: 'Account',
    items: [
      { id: 'profile', label: 'Profile & Avatar' },
      { id: 'edit-email', label: 'Changing Email' },
    ],
  },
];

function Code({ children }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4">
      <pre className="bg-gray-900 text-gray-100 rounded-xl px-5 py-4 text-sm overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
      <button onClick={copy}
        className="absolute top-3 right-3 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition">
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

function Callout({ type = 'info', children }) {
  const styles = {
    info:    { bg: 'bg-indigo-50 border-indigo-200', icon: 'ℹ️', text: 'text-indigo-800' },
    tip:     { bg: 'bg-emerald-50 border-emerald-200', icon: '💡', text: 'text-emerald-800' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: '⚠️', text: 'text-amber-800' },
  };
  const s = styles[type];
  return (
    <div className={`flex gap-3 ${s.bg} border rounded-xl px-4 py-3 my-4`}>
      <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
      <p className={`text-sm ${s.text} leading-relaxed`}>{children}</p>
    </div>
  );
}

function Badge({ color, children }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green:  'bg-emerald-100 text-emerald-700',
    red:    'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray:   'bg-gray-100 text-gray-600',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ id, title, children }) {
  return (
    <div id={id} className="mb-10 scroll-mt-24">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState('what-is');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = () => {
      const ids = SECTIONS.flatMap(s => s.items.map(i => i.id));
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(id); break; }
      }
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const allItems = SECTIONS.flatMap(s => s.items);
  const filtered = search
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-14 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-base font-bold text-gray-900">
              Sprint<span className="text-indigo-600">Base</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-500">Documentation</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex pt-14">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-gray-100 py-8 px-4">
          {/* Search */}
          <div className="relative mb-6">
            <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>

          {filtered ? (
            <div className="space-y-1">
              {filtered.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  className="block px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                  {item.label}
                </a>
              ))}
              {filtered.length === 0 && <p className="text-xs text-gray-400 px-3">No results</p>}
            </div>
          ) : (
            <nav className="space-y-6">
              {SECTIONS.map(section => (
                <div key={section.id}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">{section.label}</p>
                  <div className="space-y-0.5">
                    {section.items.map(item => (
                      <a key={item.id} href={`#${item.id}`}
                        className={`block px-3 py-1.5 text-sm rounded-lg transition ${
                          active === item.id
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          )}
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-12 py-10 max-w-3xl">

          {/* Introduction */}
          <Section id="introduction" title="Introduction">
            <SubSection id="what-is" title="What is SprintBase?">
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                <strong>SprintBase</strong> is a sprint management tool built for developers and small teams. It lets you plan weekly sprints, track tasks with priorities, hours and assignees, and export professional PDF reports.
              </p>
              <div className="grid grid-cols-3 gap-3 my-4">
                {[
                  { icon: '🗂️', label: 'Sprint Planning' },
                  { icon: '✅', label: 'Task Tracking' },
                  { icon: '📄', label: 'PDF Reports' },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-xs font-semibold text-gray-600">{label}</p>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection id="quick-start" title="Quick Start">
              <Callout type="tip">You can be up and running in under 5 minutes.</Callout>
              <Step n="1" title="Sign In">Go to <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign In</Link> and enter your credentials.</Step>
              <Step n="2" title="Create a Sprint">Click <Badge color="indigo">+ New Sprint</Badge> on the Dashboard, fill in the title and dates.</Step>
              <Step n="3" title="Add Tasks">Open the sprint and click <Badge color="indigo">+ Add Task</Badge>. Fill in the details.</Step>
              <Step n="4" title="Track Progress">Update task statuses inline. The progress bar updates automatically.</Step>
              <Step n="5" title="Export">Click <Badge color="gray">↓ PDF</Badge> to download your sprint report.</Step>
            </SubSection>
          </Section>

          {/* Sprints */}
          <Section id="sprints" title="Sprints">
            <SubSection id="create-sprint" title="Creating a Sprint">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                From the Dashboard, click <Badge color="indigo">+ New Sprint</Badge>. A modal will appear with the following fields:
              </p>
              <div className="overflow-hidden rounded-xl border border-gray-100 my-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Field</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Required</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { field: 'Title', req: true, desc: 'Name of the sprint, e.g. "Sprint 12 — Auth"' },
                      { field: 'Start Date', req: true, desc: 'When the sprint begins' },
                      { field: 'End Date', req: true, desc: 'When the sprint ends. Must be after start date.' },
                    ].map(({ field, req, desc }) => (
                      <tr key={field}>
                        <td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{field}</td>
                        <td className="px-4 py-2.5 text-xs">{req ? <Badge color="red">Required</Badge> : <Badge color="gray">Optional</Badge>}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Callout type="info">Sprints are ordered dynamically — the active sprint (today falls between start and end) always appears first.</Callout>
            </SubSection>

            <SubSection id="edit-sprint" title="Editing a Sprint">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Hover over a sprint card on the Dashboard. A pencil icon <Badge color="indigo">✏️</Badge> will appear in the top-right corner. Click it to open the edit modal with the current values pre-filled.
              </p>
            </SubSection>

            <SubSection id="delete-sprint" title="Deleting a Sprint">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Hover over a sprint card and click the trash icon <Badge color="red">🗑️</Badge>. A confirmation dialog will appear.
              </p>
              <Callout type="warning">Deleting a sprint permanently removes all its tasks. This action cannot be undone.</Callout>
            </SubSection>
          </Section>

          {/* Tasks */}
          <Section id="tasks" title="Tasks">
            <SubSection id="add-task" title="Adding a Task">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Inside a sprint, click <Badge color="indigo">+ Add Task</Badge>. The task form supports:
              </p>
              <div className="overflow-hidden rounded-xl border border-gray-100 my-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Field</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Type</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { field: 'Task Name', type: 'Text', desc: 'Short description of the task' },
                      { field: 'Week', type: 'Text', desc: 'Sprint week this task belongs to, e.g. S1, W3' },
                      { field: 'Priority', type: 'Select', desc: 'Low / Medium / High' },
                      { field: 'Status', type: 'Select', desc: 'To Do / In Progress / Done' },
                      { field: 'Due Start', type: 'Date', desc: 'When work should begin' },
                      { field: 'Date End', type: 'Date', desc: 'Deadline for the task' },
                      { field: 'Assign', type: 'Select', desc: 'Team member from your users list' },
                      { field: 'Deliverable', type: 'Text', desc: 'Resultado esperado / entregável da task' },
                      { field: 'Definition of Done', type: 'Text', desc: 'Critérios que definem quando a task está concluída' },
                      { field: 'Hours', type: 'Number', desc: 'Time spent on the task (e.g. 2.5)' },
                      { field: 'Dependencies', type: 'Text', desc: 'Tasks or resources this task depends on' },
                      { field: 'Risk', type: 'Text', desc: 'Identified risk associated with this task' },
                      { field: 'Description', type: 'Text', desc: 'Optional longer description' },
                    ].map(({ field, type, desc }) => (
                      <tr key={field}>
                        <td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{field}</td>
                        <td className="px-4 py-2.5 text-xs"><Badge color="gray">{type}</Badge></td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SubSection>

            <SubSection id="inline-edit" title="Inline Editing">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Every cell in the task table is editable without opening a modal:
              </p>
              <div className="space-y-2 my-4">
                {[
                  { cell: 'Task Name', action: 'Click to edit inline. Press Enter to save, Escape to cancel.' },
                  { cell: 'Week', action: 'Click to edit inline. e.g. S1, W3.' },
                  { cell: 'Priority / Status', action: 'Click the badge to open a dropdown. Select an option to save instantly.' },
                  { cell: 'Due Start / Date End', action: 'Click the calendar icon to open a date picker. Click Apply to save.' },
                  { cell: 'Assign', action: 'Click the avatar to open a user dropdown with names and avatars.' },
                  { cell: 'Deliverable', action: 'Click to edit inline. Describes the expected output.' },
                  { cell: 'Definition of Done', action: 'Click to edit inline. Defines the completion criteria.' },
                  { cell: 'Hours', action: 'Click to edit inline. Enter a number (e.g. 1.5 for 1h30m).' },
                  { cell: 'Dependencies', action: 'Click to edit inline. List the task dependencies.' },
                  { cell: 'Risk', action: 'Click to edit inline. Describes the associated risk.' },
                ].map(({ cell, action }) => (
                  <div key={cell} className="flex gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <Badge color="indigo">{cell}</Badge>
                    <p className="text-xs text-gray-600 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection id="priority" title="Priority & Status">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">Tasks are automatically sorted by priority — High tasks always appear at the top.</p>
              <div className="grid grid-cols-2 gap-4 my-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Priority</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2"><Badge color="red">High</Badge><span className="text-xs text-gray-500">Critical tasks, shown first</span></div>
                    <div className="flex items-center gap-2"><Badge color="yellow">Medium</Badge><span className="text-xs text-gray-500">Normal priority</span></div>
                    <div className="flex items-center gap-2"><Badge color="green">Low</Badge><span className="text-xs text-gray-500">Nice to have</span></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Status & Progress Weight</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2"><Badge color="gray">To Do</Badge><span className="text-xs text-gray-500">0% weight</span></div>
                    <div className="flex items-center gap-2"><Badge color="indigo">In Progress</Badge><span className="text-xs text-gray-500">50% weight</span></div>
                    <div className="flex items-center gap-2"><Badge color="green">Done</Badge><span className="text-xs text-gray-500">100% weight</span></div>
                  </div>
                </div>
              </div>
              <Callout type="info">The progress bar uses a weighted formula: <code className="bg-white px-1 rounded text-xs">(done×100 + inProgress×50) / total</code></Callout>
            </SubSection>

            <SubSection id="hours" title="Tracking Hours">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                The <strong>Hours</strong> column tracks time spent on each task. Click the cell and type a number. Decimals are supported (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">1.5</code> = 1h 30min).
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                The total hours across all tasks is shown in the stats bar at the top of the sprint view in <span className="text-violet-600 font-semibold">violet</span>.
              </p>
            </SubSection>

            <SubSection id="assign" title="Assigning Members">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Click the <strong>Assign</strong> cell to open a dropdown with all users in the system. Each user shows their avatar (or initial) and name.
              </p>
              <Callout type="tip">Users are pulled from the database. To add a new user, they need to be registered via the login page or seeded directly in the DB.</Callout>
            </SubSection>

            <SubSection id="task-fields" title="Task Fields">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Each task supports the following additional fields for more complete management:
              </p>
              <div className="space-y-3 my-4">
                {[
                  { icon: '📅', field: 'Week', desc: 'Identifies the sprint week this task belongs to. Useful for organising work across longer sprints.' },
                  { icon: '📦', field: 'Deliverable', desc: 'The concrete output expected from this task — what will be delivered when it is done.' },
                  { icon: '✅', field: 'Definition of Done', desc: 'Objective criteria that define when the task can be considered complete. Removes ambiguity.' },
                  { icon: '🔗', field: 'Dependencies', desc: 'Other tasks, services or resources this task depends on before it can progress.' },
                  { icon: '⚠️', field: 'Risk', desc: 'Identified risk that may impact the completion of this task. Helps anticipate blockers.' },
                ].map(({ icon, field, desc }) => (
                  <div key={field} className="flex gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-lg shrink-0">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-0.5">{field}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Callout type="tip">All these fields are editable inline directly in the sprint table, no modal required.</Callout>
            </SubSection>
          </Section>

          {/* Reports */}
          <Section id="reports" title="Reports">
            <SubSection id="pdf-report" title="Exporting PDF">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Click the <Badge color="gray">↓ PDF</Badge> button in the top-right of any sprint view. The report includes:
              </p>
              <ul className="space-y-1.5 my-4">
                {[
                  'Sprint title, dates and generation timestamp',
                  'Stats: Total, To Do, In Progress, Done',
                  'Progress bar with completion percentage',
                  'Full task table with all fields: Week, Priority, Status, Dates, Assign, Deliverable, Definition of Done, Hours, Dependencies and Risk',
                  'Colour-coded priority and status badges',
                  'Strikethrough on completed tasks',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-emerald-500 mt-0.5">✓</span>{item}
                  </li>
                ))}
              </ul>
              <Callout type="info">The PDF is generated server-side and downloaded directly. No third-party services involved.</Callout>
            </SubSection>
          </Section>

          {/* Account */}
          <Section id="account" title="Account">
            <SubSection id="profile" title="Profile & Avatar">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Click your avatar in the top-right navbar to go to your profile page. From there you can:
              </p>
              <ul className="space-y-1.5 my-4">
                {[
                  'Upload a profile photo (max 2MB) by clicking your avatar',
                  'Set a display name that appears across the app',
                  'Change your email address',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 mt-0.5">→</span>{item}
                  </li>
                ))}
              </ul>
              <Callout type="info">Profile photos are served securely — they require authentication to access and are never publicly exposed.</Callout>
            </SubSection>

            <SubSection id="edit-email" title="Changing Email">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                On the Profile page, edit the <strong>Email</strong> field and click <Badge color="indigo">Save Changes</Badge>. The system validates that the new email is not already in use.
              </p>
              <Callout type="warning">After changing your email, use the new address to log in next time.</Callout>
            </SubSection>
          </Section>

          {/* Bottom nav */}
          <div className="border-t border-gray-100 pt-8 flex justify-between items-center">
            <p className="text-xs text-gray-400">SprintBase Documentation</p>
            <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Sign In →
            </Link>
          </div>
        </main>

        {/* Right TOC */}
        <aside className="w-48 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4 hidden xl:block">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.flatMap(s => s.items).map(item => (
              <a key={item.id} href={`#${item.id}`}
                className={`block text-xs py-1 transition ${active === item.id ? 'text-indigo-600 font-medium' : 'text-gray-400 hover:text-gray-700'}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
