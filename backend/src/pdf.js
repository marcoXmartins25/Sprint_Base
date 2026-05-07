const PDFDocument = require('pdfkit');

const COLORS = {
  indigo:    '#6366f1',
  violet:    '#7c3aed',
  gray900:   '#111827',
  gray700:   '#374151',
  gray600:   '#4b5563',
  gray400:   '#9ca3af',
  gray300:   '#d1d5db',
  gray200:   '#e5e7eb',
  gray100:   '#f3f4f6',
  gray50:    '#f9fafb',
  white:     '#ffffff',
  emerald:   '#10b981',
  emeraldBg: '#d1fae5',
  emeraldDk: '#065f46',
  blue:      '#3b82f6',
  blueBg:    '#dbeafe',
  blueDk:    '#1e40af',
  amber:     '#f59e0b',
  amberBg:   '#fef3c7',
  amberDk:   '#92400e',
  red:       '#ef4444',
  yellow:    '#f59e0b',
  green:     '#22c55e',
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

function rect(doc, x, y, w, h, color, radius = 4) {
  doc.save().roundedRect(x, y, w, h, radius).fill(color).restore();
}

function hoursTotal(tasks) {
  return tasks.reduce((sum, t) => sum + (parseFloat(t.hours) || 0), 0);
}

function fmtHours(h) {
  const n = parseFloat(h) || 0;
  if (n === 0) return '0h';
  if (Number.isInteger(n)) return `${n}h`;
  return `${n.toFixed(1)}h`;
}

function generateSprintReport(sprint, tasks, team = [], userPlan = 'free', branding = null) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });

  const W = doc.page.width;
  const H = doc.page.height;
  const M = 40;
  const contentW = W - M * 2;

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const todo = tasks.filter(t => t.status === 'to-do');
  const doneCount = done.length;
  const inProgressCount = inProgress.length;
  const todoCount = todo.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const totalHours = hoursTotal(tasks);

  // PAGE 1 - COVER / SUMMARY

  // Header gradient block (use custom color for Team plan)
  const headerColor = (userPlan === 'team' && branding?.primary_color) 
    ? branding.primary_color 
    : COLORS.indigo;
  
  rect(doc, 0, 0, W, 130, headerColor, 0);
  doc.save().rect(W * 0.55, 0, W * 0.45, 130).fill(COLORS.violet).restore();

  // Logo or SprintBase text
  if (userPlan === 'team' && branding?.company_name) {
    doc.fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.6)')
      .text(branding.company_name, M, 28);
  } else {
    doc.fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text('SprintBase', M, 28);
  }
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.white).text(sprint.title, M, 48, { width: contentW });
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
    .text(`${fmt(sprint.start_date)}  ->  ${fmt(sprint.end_date)}`, M, 80);
  doc.fontSize(8).fillColor('rgba(255,255,255,0.5)')
    .text(`Generated ${fmt(new Date())}`, M, 96);

  // Stats cards
  const statsY = 150;
  const statW = (contentW - 12) / 5;
  const stats = [
    { label: 'Total',       value: String(total),        color: COLORS.gray900 },
    { label: 'Done',        value: String(doneCount),    color: COLORS.emerald },
    { label: 'In Progress', value: String(inProgressCount), color: COLORS.blue },
    { label: 'To Do',       value: String(todoCount),    color: COLORS.gray600 },
    { label: 'Hours',       value: fmtHours(totalHours), color: COLORS.indigo },
  ];

  stats.forEach((s, i) => {
    const x = M + i * (statW + 3);
    rect(doc, x, statsY, statW, 56, COLORS.gray50, 8);
    doc.fontSize(20).font('Helvetica-Bold').fillColor(s.color)
      .text(s.value, x, statsY + 10, { width: statW, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
      .text(s.label, x, statsY + 36, { width: statW, align: 'center' });
  });

  // Progress bar
  const barY = statsY + 66;
  rect(doc, M, barY, contentW, 6, COLORS.gray100, 3);
  if (pct > 0) rect(doc, M, barY, Math.max(contentW * pct / 100, 6), 6, COLORS.emerald, 3);
  doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
    .text(`${pct}% complete`, M, barY + 10, { width: contentW, align: 'right' });

  // Team members section
  if (team.length > 0) {
    let ty = barY + 30;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.gray900).text('Team', M, ty);
    ty += 16;

    team.forEach((member, i) => {
      const x = M + i * 90;
      const initials = (member.name || member.email || '?')[0].toUpperCase();
      doc.save().circle(x + 7, ty + 7, 8).fill(COLORS.indigo).restore();
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.white)
        .text(initials, x + 3, ty + 4, { width: 8, align: 'center' });
      const displayName = member.name || member.email.split('@')[0];
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray600)
        .text(displayName, x + 19, ty + 5, { width: 65, ellipsis: true });
    });
    ty += 26;
  }

  // Completed tasks summary
  let y = barY + 30 + (team.length > 0 ? 26 : 0);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.gray900)
    .text('Completed', M, y);
  y += 16;

  if (done.length === 0) {
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
      .text('No tasks completed yet.', M, y);
    y += 14;
  } else {
    done.forEach(t => {
      if (y > H - 60) { doc.addPage({ margin: 0 }); y = 40; }
      doc.fontSize(10).fillColor(COLORS.emerald).text('[X]', M + 2, y - 2, { width: 20, align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.gray900)
        .text(t.title, M + 24, y, { width: contentW - 24, ellipsis: true });
      y += 15;
    });
  }

  // Pending tasks summary
  y += 8;
  if (y > H - 80) { doc.addPage({ margin: 0 }); y = 40; }

  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.gray900)
    .text('Pending', M, y);
  y += 16;

  const pending = [...inProgress, ...todo];
  if (pending.length === 0) {
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
      .text('All tasks are done!', M, y);
    y += 14;
  } else {
    pending.forEach(t => {
      if (y > H - 60) { doc.addPage({ margin: 0 }); y = 40; }
      const marker = t.status === 'in-progress' ? '[>]' : '[ ]';
      const color = t.status === 'in-progress' ? COLORS.blue : COLORS.gray400;
      doc.fontSize(9).fillColor(color).text(marker, M + 2, y - 2, { width: 20, align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.gray700)
        .text(t.title, M + 24, y, { width: contentW - 24, ellipsis: true });
      y += 15;
    });
  }

  // PAGE 2+ - DETAILED TASK LIST
  doc.addPage({ margin: 0 });
  y = 40;

  function sectionHeader(title, count, color, label) {
    if (y > H - 60) { doc.addPage({ margin: 0 }); y = 40; }
    rect(doc, M, y, 4, 20, color, 2);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.gray900)
      .text(`${label} ${title}`, M + 12, y + 2);
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
      .text(`${count} task${count !== 1 ? 's' : ''}`, 0, y + 5, { width: W - M - 10, align: 'right' });
    y += 26;
  }

  function taskRow(task, accentColor, idx) {
    if (y > H - 100) { doc.addPage({ margin: 0 }); y = 40; }

    const rowStartY = y;

    if (idx % 2 === 0) rect(doc, M, y, contentW, 1, COLORS.gray100, 0);

    rect(doc, M, y, 4, 44, accentColor, 2);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.gray900)
      .text(task.title, M + 12, y + 2, { width: contentW - 70 });

    const hours = parseFloat(task.hours) || 0;
    if (hours > 0) {
      const hText = fmtHours(hours);
      const hW = 38;
      rect(doc, W - M - 42, y + 4, hW, 14, COLORS.gray100, 4);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(COLORS.gray600)
        .text(hText, W - M - 42, y + 6, { width: hW, align: 'center' });
    }

    y += 16;

    if (task.description) {
      const descY = y;
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray600)
        .text(task.description, M + 12, y, { width: contentW - 80, lineBreak: true });
      const descLines = doc.heightOfString(task.description, { width: contentW - 80, fontSize: 8 });
      y = descY + descLines + 6;
    }

    const metaY = y;
    const priorityMap = {
      high:   { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
      medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium' },
      low:    { bg: '#d1fae5', text: '#166534', label: 'Low' },
    };
    const pCfg = priorityMap[task.priority] || priorityMap.medium;
    const pW = 46;
    rect(doc, M + 12, y, pW, 13, pCfg.bg, 4);
    doc.fontSize(6).font('Helvetica-Bold').fillColor(pCfg.text)
      .text(pCfg.label, M + 12, y + 2, { width: pW, align: 'center' });

    const dateX = M + 68;
    doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray400)
      .text(`${fmt(task.due_start)} -> ${fmt(task.due_end)}`, dateX, y + 2);

    if (task.assigned_to) {
      const name = task.assigned_to.split('@')[0];
      const nameX = W - M - 80;
      doc.save().circle(nameX + 5, y + 6, 5).fill(COLORS.indigo).restore();
      doc.fontSize(6).font('Helvetica-Bold').fillColor(COLORS.white)
        .text(name[0].toUpperCase(), nameX + 1, y + 4, { width: 8, align: 'center' });
      doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray600)
        .text(name, nameX + 13, y + 2, { width: 62, ellipsis: true });
    }

    y = metaY + 18;

    rect(doc, M + 4, y, contentW - 8, 0.5, COLORS.gray200, 0);
    y += 6;
  }

  sectionHeader('Completed', doneCount, COLORS.emerald, '[X]');
  done.forEach((t, i) => taskRow(t, COLORS.emerald, i));

  y += 6;
  sectionHeader('In Progress', inProgressCount, COLORS.blue, '[>]');
  inProgress.forEach((t, i) => taskRow(t, COLORS.blue, i));

  y += 6;
  sectionHeader('To Do', todoCount, COLORS.gray400, '[ ]');
  todo.forEach((t, i) => taskRow(t, COLORS.gray400, i));

  // FOOTER on all pages
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const fY = pageH - 24;

    rect(doc, 0, fY, pageW, 24, COLORS.gray50, 0);
    doc.lineCap('round').moveTo(M, fY + 8).lineTo(pageW - M, fY + 8)
      .strokeColor(COLORS.gray200).lineWidth(0.5).stroke();

    doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray400)
      .text('SprintBase - Confidential', M, fY + 12);

    doc.fontSize(7).fillColor(COLORS.gray400)
      .text(`Page ${i + 1} of ${pages.count}`, 0, fY + 12, { width: pageW - M, align: 'right' });
    
    // Add watermark for free plan
    if (userPlan === 'free') {
      doc.save();
      doc.translate(pageW / 2, pageH / 2);
      doc.rotate(-45, { origin: [0, 0] });
      doc.fontSize(60)
        .font('Helvetica-Bold')
        .fillColor(COLORS.gray200)
        .opacity(0.15)
        .text('SPRINTBASE FREE', -200, -20, { width: 400, align: 'center' });
      doc.restore();
    }
  }

  doc.end();
  return doc;
}

module.exports = { generateSprintReport };
