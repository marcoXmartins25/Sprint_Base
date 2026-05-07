import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import TaskForm from '../components/TaskForm';
import Avatar from '../components/Avatar';

const priorityConfig = {
  high:   { label: 'High',   cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low:    { label: 'Low',    cls: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
};

const statusConfig = {
  'to-do':       { label: 'To Do',       cls: 'bg-gray-100 text-gray-600',       dot: 'bg-gray-400' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  'done':        { label: 'Done',        cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : '—';

function Badge({ cfg }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function EditableText({ value, onSave, placeholder = '—' }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');
  const ref = useRef();

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const save = () => { setEditing(false); if (val !== value) onSave(val); };

  if (editing) return (
    <input ref={ref} value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(value || ''); setEditing(false); } }}
      className="w-full bg-white border border-indigo-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
    />
  );

  return (
    <span onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 text-xs text-gray-600 transition min-w-[40px] inline-block">
      {value || <span className="text-gray-300">{placeholder}</span>}
    </span>
  );
}

function EditableDate({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [val, setVal] = useState(value ? value.slice(0, 10) : '');
  const triggerRef = useRef();
  const dropRef = useRef();

  useEffect(() => { setVal(value ? value.slice(0, 10) : ''); }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setOpen(true);
  };

  const handleSave = (v) => {
    setOpen(false);
    onSave(v || null);
  };

  const display = value
    ? new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
    : null;

  return (
    <>
      <span ref={triggerRef} onClick={handleOpen}
        className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition group">
        <svg className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {display
          ? <span className="text-xs font-medium text-gray-600">{display}</span>
          : <span className="text-xs text-gray-300">Set date</span>}
      </span>

      {open && createPortal(
        <div ref={dropRef}
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-600">Pick a date</span>
            {value && (
              <button onClick={() => handleSave('')}
                className="text-xs text-red-400 hover:text-red-600 transition font-medium">
                Clear
              </button>
            )}
          </div>
          <input
            type="date"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition"
          />
          <div className="flex gap-2 mt-3">
            <button onClick={() => setOpen(false)}
              className="flex-1 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
            <button onClick={() => handleSave(val)}
              className="flex-1 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:opacity-90 transition">
              Apply
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function EditableSelect({ value, options, renderValue, renderOption, onSave }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setOpen((o) => !o);
  };

  const renderOpt = renderOption || renderValue;

  return (
    <>
      <span ref={triggerRef} onClick={handleOpen} className="cursor-pointer">
        {renderValue(value)}
      </span>
      {open && createPortal(
        <div ref={dropRef}
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[160px] max-h-48 overflow-y-auto">
          {options.map((o) => (
            <button key={o.value} type="button"
              onClick={() => { onSave(o.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition ${o.value === value ? 'bg-gray-50' : ''}`}>
              {renderOpt(o.value)}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function AvatarCircle({ user, size = 'w-6 h-6' }) {
  if (!user) return <span className="text-gray-300 text-xs">—</span>;
  const initials = (user.name || user.email || '?')[0].toUpperCase();
  const display = user.name || user.email?.split('@')[0] || '';
  if (user.avatar_url) return (
    <img src={user.avatar_url} alt={display}
      className={`${size} rounded-full object-cover shrink-0`} title={display} />
  );
  return (
    <div className={`${size} rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0`}
      title={display}>
      {initials}
    </div>
  );
}

function SprintDetail() {
  const { id } = useParams();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [sprintData, tasksData, usersData] = await Promise.all([
        api.getSprint(id), api.getSprintTasks(id), api.getUsers(),
      ]);
      setSprint(sprintData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => { await api.createTask(data); setShowForm(false); loadData(); };

  const updateField = async (taskId, field, value) => {
    await api.updateTask(taskId, { [field]: value });
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, [field]: value } : t));
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const filtered = (filter === 'all' ? tasks : tasks.filter((t) => t.status === filter))
    .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    todo: tasks.filter((t) => t.status === 'to-do').length,
    hours: tasks.reduce((sum, t) => sum + (parseFloat(t.hours) || 0), 0),
  };
  const pct = stats.total > 0 ? Math.round(
    ((stats.done * 100) + (stats.inProgress * 50)) / stats.total
  ) : 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  if (!sprint) return <div className="text-center py-20 text-gray-500">Sprint not found</div>;

  const fmtDate = (d) => new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((u) => ({ value: u.email, label: u.name || u.email.split('@')[0], user: u })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/app" className="text-sm text-gray-400 hover:text-gray-700 transition inline-flex items-center gap-1 mb-2">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{sprint.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{fmtDate(sprint.start_date)} → {fmtDate(sprint.end_date)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => api.downloadReport(id)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            ↓ PDF
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200">
            + Add Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="grid grid-cols-5 gap-4 mb-4">
          {[
            { label: 'Total',       value: stats.total,      cls: 'text-gray-900' },
            { label: 'To Do',       value: stats.todo,       cls: 'text-gray-500' },
            { label: 'In Progress', value: stats.inProgress, cls: 'text-blue-600' },
            { label: 'Done',        value: stats.done,       cls: 'text-emerald-600' },
            { label: 'Hours',       value: `${stats.hours}h`, cls: 'text-violet-600' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="text-center">
              <p className={`text-2xl font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">{pct}% complete</p>
      </div>

      <div className="flex gap-2">
        {['all', 'to-do', 'in-progress', 'done'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}>
            {s === 'all' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-56">Task Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-16">Week</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Due Start</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Date End</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Assign</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-40">Deliverable</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-40">Def. of Done</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Dependencies</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-32">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">Status</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-16">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-gray-500 font-medium">No tasks yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add Task" to create the first one</p>
                </td>
              </tr>
            ) : filtered.map((task) => (
              <tr key={task.id} className={`border-b border-gray-50 hover:bg-gray-50/40 transition group ${task.archived ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <EditableText value={task.title} onSave={(v) => updateField(task.id, 'title', v)} />
                  {task.description && (
                    <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <EditableText value={task.week} onSave={(v) => updateField(task.id, 'week', v)} placeholder="S1" />
                </td>
                <td className="px-4 py-3">
                  <EditableSelect
                    value={task.priority}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                    renderValue={(v) => <Badge cfg={priorityConfig[v] || priorityConfig.medium} />}
                    onSave={(v) => updateField(task.id, 'priority', v)}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableDate value={task.due_start} onSave={(v) => updateField(task.id, 'due_start', v)} />
                </td>
                <td className="px-4 py-3">
                  <EditableDate value={task.due_end} onSave={(v) => updateField(task.id, 'due_end', v)} />
                </td>
                <td className="px-4 py-3">
                  <EditableSelect
                    value={task.assigned_to || ''}
                    options={userOptions}
                    renderValue={(v) => {
                      if (!v) return <span className="text-gray-300 text-xs">—</span>;
                      const user = users.find((u) => u.email === v);
                      return <Avatar user={user || { email: v }} size="w-6 h-6" />;
                    }}
                    renderOption={(v) => {
                      if (!v) return <span className="text-gray-400 text-xs">Unassigned</span>;
                      const user = users.find((u) => u.email === v);
                      const display = user?.name || v.split('@')[0];
                      return (
                        <div className="flex items-center gap-2">
                          <Avatar user={user || { email: v }} size="w-5 h-5" />
                          <span className="text-xs text-gray-700">{display}</span>
                        </div>
                      );
                    }}
                    onSave={(v) => updateField(task.id, 'assigned_to', v)}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableText value={task.deliverable} onSave={(v) => updateField(task.id, 'deliverable', v)} placeholder="Deliverable" />
                </td>
                <td className="px-4 py-3">
                  <EditableText value={task.definition_of_done} onSave={(v) => updateField(task.id, 'definition_of_done', v)} placeholder="DoD" />
                </td>
                <td className="px-4 py-3">
                  <EditableText
                    value={task.hours > 0 ? String(task.hours) : ''}
                    onSave={(v) => updateField(task.id, 'hours', parseFloat(v) || 0)}
                    placeholder="0h"
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableText value={task.dependencies} onSave={(v) => updateField(task.id, 'dependencies', v)} placeholder="Dependencies" />
                </td>
                <td className="px-4 py-3">
                  <EditableText value={task.risk} onSave={(v) => updateField(task.id, 'risk', v)} placeholder="Risk" />
                </td>
                <td className="px-4 py-3">
                  <EditableSelect
                    value={task.status}
                    options={[
                      { value: 'to-do', label: 'To Do' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'done', label: 'Done' },
                    ]}
                    renderValue={(v) => <Badge cfg={statusConfig[v] || statusConfig['to-do']} />}
                    onSave={(v) => updateField(task.id, 'status', v)}
                  />
                </td>
                <td className="px-2 py-3">
                  <button onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition rounded">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <TaskForm sprintId={id} users={users} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

export default SprintDetail;
