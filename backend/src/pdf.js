const PDFDocument = require('pdfkit');

const COLORS = {
  indigo:    '#6366f1',
  violet:    '#7c3aed',
  gray900:   '#111827',
  gray600:   '#4b5563',
  gray400:   '#9ca3af',
  gray100:   '#f3f4f6',
  gray50:    '#f9fafb',
  white:     '#ffffff',
  emerald:   '#10b981',
  blue:      '#3b82f6',
  red:       '#ef4444',
  yellow:    '#f59e0b',
  green:     '#22c55e',
  archived:  '#e5e7eb',
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

function rect(doc, x, y, w, h, color, radius = 4) {
  doc.save().roundedRect(x, y, w, h, radius).fill(color).restore();
}

function priorityBadge(doc, x, y, priority) {
  const map = {
    high:   { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
    medium: { bg: '#fef9c3', text: '#92400e', label: 'Medium' },
    low:    { bg: '#dcfce7', text: '#166534', label: 'Low' },
  };
  const cfg = map[priority] || map.medium;
  const w = 48, h = 14;
  rect(doc, x, y - 2, w, h, cfg.bg, 7);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(cfg.text).text(cfg.label, x, y, { width: w, align: 'center' });
}

function statusBadge(doc, x, y, status) {
  const map = {
    'done':        { bg: '#d1fae5', text: '#065f46', label: 'Done' },
    'in-progress': { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
    'to-do':       { bg: '#f3f4f6', text: '#374151', label: 'To Do' },
  };
  const cfg = map[status] || map['to-do'];
  const w = 62, h = 14;
  rect(doc, x, y - 2, w, h, cfg.bg, 7);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(cfg.text).text(cfg.label, x, y, { width: w, align: 'center' });
}

function generateSprintReport(sprint, tasks) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });

  const W = doc.page.width;
  const M = 40; // margin
  const contentW = W - M * 2;

  // ── HEADER GRADIENT BLOCK ──
  rect(doc, 0, 0, W, 130, COLORS.indigo, 0);
  // subtle second color overlay
  doc.save()
    .rect(W * 0.5, 0, W * 0.5, 130)
    .fill(COLORS.violet)
    .restore();

  // App name
  doc.fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text('SprintBase', M, 28);

  // Sprint title
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.white).text(sprint.title, M, 48, { width: contentW });

  // Dates
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
    .text(`${fmt(sprint.start_date)}  →  ${fmt(sprint.end_date)}`, M, 80);

  // Generated
  doc.fontSize(8).fillColor('rgba(255,255,255,0.5)')
    .text(`Generated ${fmt(new Date())}`, M, 96);

  // ── STATS ROW ──
  const statsY = 150;
  const total      = tasks.length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo       = tasks.filter(t => t.status === 'to-do').length;
  const pct        = total > 0 ? Math.round((done / total) * 100) : 0;

  const statW = (contentW - 9) / 4;
  const stats = [
    { label: 'Total',       value: total,      color: COLORS.gray900 },
    { label: 'To Do',       value: todo,       color: COLORS.gray600 },
    { label: 'In Progress', value: inProgress, color: COLORS.blue },
    { label: 'Done',        value: done,       color: COLORS.emerald },
  ];

  stats.forEach((s, i) => {
    const x = M + i * (statW + 3);
    rect(doc, x, statsY, statW, 56, COLORS.gray50, 8);
    doc.fontSize(22).font('Helvetica-Bold').fillColor(s.color)
      .text(String(s.value), x, statsY + 10, { width: statW, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
      .text(s.label, x, statsY + 36, { width: statW, align: 'center' });
  });

  // Progress bar
  const barY = statsY + 66;
  rect(doc, M, barY, contentW, 6, COLORS.gray100, 3);
  if (pct > 0) rect(doc, M, barY, contentW * pct / 100, 6, COLORS.emerald, 3);
  doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
    .text(`${pct}% complete`, M, barY + 10, { width: contentW, align: 'right' });

  // ── TASKS SECTION ──
  let y = barY + 30;

  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLORS.gray900)
    .text('Tasks', M, y);
  y += 22;

  // Table header
  rect(doc, M, y, contentW, 22, COLORS.gray100, 6);
  const cols = { name: M + 8, priority: M + 210, status: M + 268, start: M + 340, end: M + 390, assign: M + 440 };

  doc.fontSize(7).font('Helvetica-Bold').fillColor(COLORS.gray400);
  doc.text('TASK NAME',  cols.name,     y + 7);
  doc.text('PRIORITY',   cols.priority, y + 7);
  doc.text('STATUS',     cols.status,   y + 7);
  doc.text('START',      cols.start,    y + 7);
  doc.text('END',        cols.end,      y + 7);
  doc.text('ASSIGN',     cols.assign,   y + 7);
  y += 26;

  tasks.forEach((task, i) => {
    const rowH = task.description ? 38 : 28;

    // alternating row bg
    if (i % 2 === 0) rect(doc, M, y, contentW, rowH, COLORS.gray50, 4);

    // archived overlay
    if (task.archived) {
      doc.save().rect(M, y, contentW, rowH).fillOpacity(0.04).fill('#000').restore();
    }

    // Task name
    const titleColor = task.status === 'done' ? COLORS.gray400 : COLORS.gray900;
    doc.fontSize(9).font('Helvetica-Bold').fillColor(titleColor)
      .text(task.title, cols.name, y + 7, { width: 195, ellipsis: true });

    if (task.description) {
      doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray400)
        .text(task.description, cols.name, y + 20, { width: 195, ellipsis: true });
    }

    // Done strikethrough simulation — line over title
    if (task.status === 'done') {
      const tw = Math.min(doc.widthOfString(task.title, { fontSize: 9 }), 195);
      doc.save().moveTo(cols.name, y + 12).lineTo(cols.name + tw, y + 12)
        .strokeColor(COLORS.gray400).lineWidth(0.8).stroke().restore();
    }

    // Priority badge
    priorityBadge(doc, cols.priority, y + 8, task.priority);

    // Status badge
    statusBadge(doc, cols.status, y + 8, task.status);

    // Dates
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray600);
    doc.text(fmt(task.due_start), cols.start, y + 9, { width: 44 });
    doc.text(fmt(task.due_end),   cols.end,   y + 9, { width: 44 });

    // Assign
    if (task.assigned_to) {
      const name = task.assigned_to.split('@')[0];
      // avatar circle
      doc.save().circle(cols.assign + 7, y + rowH / 2, 7).fill(COLORS.indigo).restore();
      doc.fontSize(6).font('Helvetica-Bold').fillColor(COLORS.white)
        .text(name[0].toUpperCase(), cols.assign + 3, y + rowH / 2 - 3, { width: 8, align: 'center' });
      doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray600)
        .text(name, cols.assign + 17, y + rowH / 2 - 3, { width: 60, ellipsis: true });
    }

    // Archived tag
    if (task.archived) {
      rect(doc, W - M - 52, y + rowH / 2 - 7, 48, 13, COLORS.archived, 6);
      doc.fontSize(6).font('Helvetica-Bold').fillColor(COLORS.gray600)
        .text('ARQUIVADA', W - M - 52, y + rowH / 2 - 4, { width: 48, align: 'center' });
    }

    y += rowH + 2;

    // page break
    if (y > doc.page.height - 60) {
      doc.addPage({ margin: 0 });
      y = 40;
    }
  });

  // ── FOOTER ──
  const footerY = doc.page.height - 30;
  rect(doc, 0, footerY, W, 30, COLORS.gray50, 0);
  doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray400)
    .text('SprintBase — Confidential', M, footerY + 10)
    .text(`${tasks.length} tasks  ·  ${pct}% complete`, 0, footerY + 10, { width: W - M, align: 'right' });

  doc.end();
  return doc;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
}

module.exports = { generateSprintReport };
