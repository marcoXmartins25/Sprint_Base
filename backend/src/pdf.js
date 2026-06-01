const PDFDocument = require('pdfkit');

const M = 40;

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

const priorityMap = {
  high:   { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Med'  },
  low:    { bg: '#d1fae5', text: '#166534', label: 'Low'  },
};

const statusMap = {
  'done':        { bg: '#d1fae5', text: '#065f46', label: 'Done'      },
  'in-progress': { bg: '#dbeafe', text: '#1e40af', label: 'Em Curso'  },
  'to-do':       { bg: '#f3f4f6', text: '#374151', label: 'Por Fazer' },
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

function sortByPriority(arr) {
  return [...arr].sort(
    (a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 1)
  );
}

function ensureSpace(doc, ty, needed, H) {
  if (ty + needed > H - 50) {
    doc.addPage();
    return M + 10;
  }
  return ty;
}

function addFooter(doc, userPlan) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const fY = pageH - 24;

    rect(doc, 0, fY, pageW, 24, COLORS.gray50, 0);
    doc.moveTo(M, fY + 8).lineTo(pageW - M, fY + 8)
      .strokeColor(COLORS.gray200).lineWidth(0.5).stroke();

    doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray400)
      .text('SprintBase · Confidencial', M, fY + 12);
    doc.fontSize(7).fillColor(COLORS.gray400)
      .text(`Página ${i + 1} de ${pages.count}`, 0, fY + 12, { width: pageW - M, align: 'right' });

    if (userPlan === 'free') {
      doc.save();
      doc.translate(pageW / 2, pageH / 2);
      doc.rotate(-45, { origin: [0, 0] });
      doc.fontSize(60).font('Helvetica-Bold').fillColor(COLORS.gray200).opacity(0.15)
        .text('SPRINTBASE FREE', -200, -20, { width: 400, align: 'center' });
      doc.restore();
    }
  }
}

function drawHeader(doc, sprint, subtitle, userPlan, branding) {
  const W = doc.page.width;
  const contentW = W - M * 2;
  const headerColor = (userPlan === 'team' && branding?.primary_color)
    ? branding.primary_color
    : COLORS.indigo;

  rect(doc, 0, 0, W, 90, headerColor, 0);
  doc.save().rect(W * 0.55, 0, W * 0.45, 90).fill(COLORS.violet).restore();

  const companyName = (userPlan === 'team' && branding?.company_name)
    ? branding.company_name
    : 'SprintBase';

  doc.fontSize(7).font('Helvetica').fillColor('rgba(255,255,255,0.5)').text(companyName, M, 14);
  doc.fontSize(7).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.7)').text(subtitle.toUpperCase(), M, 25);
  doc.fontSize(17).font('Helvetica-Bold').fillColor(COLORS.white).text(sprint.title, M, 37, { width: contentW });
  doc.fontSize(8).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
    .text(`${fmt(sprint.start_date)}  →  ${fmt(sprint.end_date)}`, M, 60);
  doc.fontSize(7).fillColor('rgba(255,255,255,0.5)')
    .text(`Gerado em ${fmt(new Date())}`, M, 72);
}

// ─── PLANNING PDF ────────────────────────────────────────────────────────────

function generateSprintPlan(sprint, tasks, team = [], userPlan = 'free', branding = null) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
  const W = doc.page.width;
  const H = doc.page.height;
  const contentW = W - M * 2;

  drawHeader(doc, sprint, 'Plano de Sprint', userPlan, branding);

  // Stats
  const statsY = 106;
  const statW = (contentW - 8) / 3;
  [
    { label: 'Total de Tasks',  value: String(tasks.length),              color: COLORS.gray900 },
    { label: 'Horas Estimadas', value: fmtHours(hoursTotal(tasks)),        color: COLORS.indigo  },
    { label: 'Membros',         value: team.length > 0 ? String(team.length) : '—', color: COLORS.violet  },
  ].forEach((s, i) => {
    const x = M + i * (statW + 4);
    rect(doc, x, statsY, statW, 56, COLORS.gray50, 8);
    doc.fontSize(20).font('Helvetica-Bold').fillColor(s.color)
      .text(s.value, x, statsY + 10, { width: statW, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray400)
      .text(s.label, x, statsY + 36, { width: statW, align: 'center' });
  });

  let ty = statsY + 70;

  // Group tasks by assignee
  const assigneeMap = {};
  const unassigned = [];
  tasks.forEach(t => {
    if (t.assigned_to && t.assigned_to.trim()) {
      const key = t.assigned_to.toLowerCase();
      if (!assigneeMap[key]) assigneeMap[key] = { assignee: t.assigned_to, tasks: [] };
      assigneeMap[key].tasks.push(t);
    } else {
      unassigned.push(t);
    }
  });

  const groups = Object.values(assigneeMap).sort((a, b) => a.assignee.localeCompare(b.assignee));
  if (unassigned.length > 0) groups.push({ assignee: null, tasks: unassigned });

  // Planning columns: Priority | Task | Hours | Definition of Done
  const PC = {
    priority: { x: M,       w: 55  },
    title:    { x: M + 55,  w: 210 },
    hours:    { x: M + 265, w: 55  },
    dod:      { x: M + 320, w: 195 },
  };

  for (const group of groups) {
    ty = ensureSpace(doc, ty, 60, H);

    const rawName = group.assignee || '';
    const displayName = rawName
      ? (rawName.includes('@') ? rawName.split('@')[0] : rawName)
      : 'Sem Atribuição';

    const groupColor = group.assignee ? COLORS.indigo : COLORS.gray400;
    rect(doc, M, ty, contentW, 28, groupColor, 6);

    if (group.assignee) {
      doc.save().circle(M + 16, ty + 14, 8).fill('rgba(255,255,255,0.25)').restore();
      doc.fontSize(7).font('Helvetica-Bold').fillColor(COLORS.white)
        .text(displayName[0].toUpperCase(), M + 12, ty + 10, { width: 8, align: 'center', lineBreak: false });
    }

    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.white)
      .text(displayName, group.assignee ? M + 30 : M + 12, ty + 9, { lineBreak: false });

    doc.fontSize(7.5).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
      .text(
        `${group.tasks.length} task${group.tasks.length !== 1 ? 's' : ''} · ${fmtHours(hoursTotal(group.tasks))}`,
        0, ty + 10, { width: W - M - 8, align: 'right', lineBreak: false }
      );

    ty += 32;

    // Column header
    rect(doc, M, ty, contentW, 18, COLORS.gray900, 0);
    [
      { label: 'PRIORIDADE',       key: 'priority' },
      { label: 'TASK',             key: 'title'    },
      { label: 'HRS',              key: 'hours'    },
      { label: 'DEFINIÇÃO DE DONE', key: 'dod'    },
    ].forEach(col => {
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor(COLORS.gray400)
        .text(col.label, PC[col.key].x + 6, ty + 6, { width: PC[col.key].w - 6, lineBreak: false });
    });
    ty += 22;

    sortByPriority(group.tasks).forEach((t, i) => {
      ty = ensureSpace(doc, ty, 28, H);
      const rowH = 26;
      if (i % 2 === 0) rect(doc, M, ty, contentW, rowH, COLORS.gray50, 0);
      const cy = ty + 9;

      const pCfg = priorityMap[t.priority] || priorityMap.medium;
      const pBadgeW = PC.priority.w - 12;
      rect(doc, PC.priority.x + 6, ty + 7, pBadgeW, 12, pCfg.bg, 3);
      doc.fontSize(6).font('Helvetica-Bold').fillColor(pCfg.text)
        .text(pCfg.label, PC.priority.x + 6, ty + 9, { width: pBadgeW, align: 'center', lineBreak: false });

      doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray900)
        .text(t.title, PC.title.x + 6, cy, { width: PC.title.w - 8, ellipsis: true, lineBreak: false });

      const h = parseFloat(t.hours) || 0;
      doc.fontSize(7).font('Helvetica').fillColor(h > 0 ? COLORS.gray600 : COLORS.gray300)
        .text(h > 0 ? fmtHours(h) : '—', PC.hours.x + 6, cy,
          { width: PC.hours.w - 6, align: 'center', lineBreak: false });

      const dod = t.definition_of_done && t.definition_of_done.trim();
      doc.fontSize(6.5).font('Helvetica').fillColor(dod ? COLORS.gray600 : COLORS.gray300)
        .text(dod || '—', PC.dod.x + 6, cy, { width: PC.dod.w - 8, ellipsis: true, lineBreak: false });

      doc.moveTo(M, ty + rowH).lineTo(M + contentW, ty + rowH)
        .strokeColor(COLORS.gray200).lineWidth(0.5).stroke();

      ty += rowH;
    });

    ty += 18;
  }

  addFooter(doc, userPlan);
  doc.end();
  return doc;
}

// ─── REPORT PDF ──────────────────────────────────────────────────────────────

function generateSprintReport(sprint, tasks, team = [], userPlan = 'free', branding = null) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
  const W = doc.page.width;
  const H = doc.page.height;
  const contentW = W - M * 2;

  const done       = tasks.filter(t => t.status === 'done');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const todo       = tasks.filter(t => t.status === 'to-do');
  const total      = tasks.length;
  const pct        = total > 0 ? Math.round((done.length / total) * 100) : 0;
  const totalHours = hoursTotal(tasks);

  drawHeader(doc, sprint, 'Relatório de Sprint', userPlan, branding);

  // Stats cards
  const statsY = 106;
  const statW = (contentW - 12) / 5;
  [
    { label: 'Total',     value: String(total),          color: COLORS.gray900 },
    { label: 'Concluído', value: String(done.length),    color: COLORS.emerald },
    { label: 'Em Curso',  value: String(inProgress.length), color: COLORS.blue },
    { label: 'Por Fazer', value: String(todo.length),    color: COLORS.gray600 },
    { label: 'Horas',     value: fmtHours(totalHours),   color: COLORS.indigo  },
  ].forEach((s, i) => {
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
    .text(`${pct}% concluído`, M, barY + 10, { width: contentW, align: 'right' });

  // Executive Summary
  let ty = barY + 28;
  rect(doc, M, ty, contentW, 52, COLORS.gray50, 8);
  doc.save().roundedRect(M, ty, 4, 52, 2).fill(COLORS.emerald).restore();

  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.gray900)
    .text('Resumo Executivo', M + 14, ty + 8);

  const summaryLine = done.length === total && total > 0
    ? `Todas as ${total} tasks foram concluídas. ${fmtHours(totalHours)} registadas.`
    : `${done.length} de ${total} tasks concluídas (${pct}%).${inProgress.length > 0 ? ` ${inProgress.length} ainda em curso.` : ''} ${fmtHours(totalHours)} registadas.`;

  doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray600)
    .text(summaryLine, M + 14, ty + 24, { width: contentW - 28 });

  ty += 62;

  // Task sections — Done first (with deliverable), then In Progress, then To Do
  const sections = [
    {
      label: 'Concluído',
      tasks: done,
      headerBg:   COLORS.emeraldBg,
      headerText: COLORS.emeraldDk,
      accentColor: COLORS.emerald,
      showDeliverable: true,
    },
    {
      label: 'Em Curso',
      tasks: inProgress,
      headerBg:   COLORS.blueBg,
      headerText: COLORS.blueDk,
      accentColor: COLORS.blue,
      showDeliverable: false,
    },
    {
      label: 'Por Fazer',
      tasks: todo,
      headerBg:   COLORS.gray100,
      headerText: COLORS.gray700,
      accentColor: COLORS.gray400,
      showDeliverable: false,
    },
  ].filter(s => s.tasks.length > 0);

  // Done columns: Priority | Task | Assignee | Hours | Deliverable
  const RC_done = {
    priority:    { x: M,       w: 55  },
    title:       { x: M + 55,  w: 155 },
    assignee:    { x: M + 210, w: 105 },
    hours:       { x: M + 315, w: 50  },
    deliverable: { x: M + 365, w: 150 },
  };
  // Other columns: Priority | Task | Assignee | Hours
  const RC_other = {
    priority: { x: M,       w: 55  },
    title:    { x: M + 55,  w: 210 },
    assignee: { x: M + 265, w: 145 },
    hours:    { x: M + 410, w: 105 },
  };

  for (const section of sections) {
    ty = ensureSpace(doc, ty, 50, H);

    // Section header
    rect(doc, M, ty, contentW, 24, section.headerBg, 6);
    doc.save().roundedRect(M, ty, 4, 24, 2).fill(section.accentColor).restore();
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(section.headerText)
      .text(section.label, M + 12, ty + 7, { lineBreak: false });
    doc.fontSize(8).font('Helvetica').fillColor(section.accentColor)
      .text(`${section.tasks.length} task${section.tasks.length !== 1 ? 's' : ''}`,
        0, ty + 8, { width: W - M - 8, align: 'right', lineBreak: false });
    ty += 28;

    // Column header
    const RC = section.showDeliverable ? RC_done : RC_other;
    rect(doc, M, ty, contentW, 18, COLORS.gray900, 0);
    (section.showDeliverable
      ? [
          { label: 'PRIORIDADE',  key: 'priority'    },
          { label: 'TASK',        key: 'title'       },
          { label: 'RESPONSÁVEL', key: 'assignee'    },
          { label: 'HRS',         key: 'hours'       },
          { label: 'ENTREGÁVEL',  key: 'deliverable' },
        ]
      : [
          { label: 'PRIORIDADE',  key: 'priority' },
          { label: 'TASK',        key: 'title'    },
          { label: 'RESPONSÁVEL', key: 'assignee' },
          { label: 'HRS',         key: 'hours'    },
        ]
    ).forEach(col => {
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor(COLORS.gray400)
        .text(col.label, RC[col.key].x + 6, ty + 6, { width: RC[col.key].w - 6, lineBreak: false });
    });
    ty += 22;

    sortByPriority(section.tasks).forEach((t, i) => {
      ty = ensureSpace(doc, ty, 28, H);
      const rowH = 26;
      if (i % 2 === 0) rect(doc, M, ty, contentW, rowH, COLORS.gray50, 0);
      const cy = ty + 9;

      // Priority badge
      const pCfg = priorityMap[t.priority] || priorityMap.medium;
      const pBadgeW = RC.priority.w - 12;
      rect(doc, RC.priority.x + 6, ty + 7, pBadgeW, 12, pCfg.bg, 3);
      doc.fontSize(6).font('Helvetica-Bold').fillColor(pCfg.text)
        .text(pCfg.label, RC.priority.x + 6, ty + 9, { width: pBadgeW, align: 'center', lineBreak: false });

      // Title
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray900)
        .text(t.title, RC.title.x + 6, cy, { width: RC.title.w - 8, ellipsis: true, lineBreak: false });

      // Assignee
      if (t.assigned_to) {
        const name = t.assigned_to.includes('@') ? t.assigned_to.split('@')[0] : t.assigned_to;
        doc.save().circle(RC.assignee.x + 10, ty + 13, 5).fill(COLORS.indigo).restore();
        doc.fontSize(5.5).font('Helvetica-Bold').fillColor(COLORS.white)
          .text(name[0].toUpperCase(), RC.assignee.x + 6, ty + 10, { width: 8, align: 'center', lineBreak: false });
        doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray600)
          .text(name, RC.assignee.x + 20, cy, { width: RC.assignee.w - 22, ellipsis: true, lineBreak: false });
      } else {
        doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray300)
          .text('—', RC.assignee.x + 6, cy, { lineBreak: false });
      }

      // Hours
      const h = parseFloat(t.hours) || 0;
      doc.fontSize(7).font('Helvetica').fillColor(h > 0 ? COLORS.gray600 : COLORS.gray300)
        .text(h > 0 ? fmtHours(h) : '—', RC.hours.x + 6, cy,
          { width: RC.hours.w - 6, align: section.showDeliverable ? 'left' : 'right', lineBreak: false });

      // Deliverable (done section only)
      if (section.showDeliverable) {
        const del = t.deliverable && t.deliverable.trim();
        doc.fontSize(6.5).font('Helvetica').fillColor(del ? COLORS.emeraldDk : COLORS.gray300)
          .text(del || '—', RC_done.deliverable.x + 6, cy,
            { width: RC_done.deliverable.w - 8, ellipsis: true, lineBreak: false });
      }

      doc.moveTo(M, ty + rowH).lineTo(M + contentW, ty + rowH)
        .strokeColor(COLORS.gray200).lineWidth(0.5).stroke();

      ty += rowH;
    });

    ty += 16;
  }

  // Team Performance
  if (team.length > 0) {
    ty = ensureSpace(doc, ty, 50 + team.length * 28, H);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.gray900)
      .text('Desempenho da Equipa', M, ty);
    doc.fontSize(7).font('Helvetica').fillColor(COLORS.gray400)
      .text('por membro', M + 150, ty + 2);
    ty += 18;

    const TC = {
      name:       { x: M,       w: 180 },
      tasksDone:  { x: M + 180, w: 100 },
      tasksTotal: { x: M + 280, w: 100 },
      hours:      { x: M + 380, w: 135 },
    };

    rect(doc, M, ty, contentW, 18, COLORS.gray900, 0);
    [
      { label: 'MEMBRO',      key: 'name'       },
      { label: 'TASKS DONE',  key: 'tasksDone'  },
      { label: 'TASKS TOTAL', key: 'tasksTotal' },
      { label: 'HORAS',       key: 'hours'      },
    ].forEach(col => {
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor(COLORS.gray400)
        .text(col.label, TC[col.key].x + 6, ty + 6, { width: TC[col.key].w - 6, lineBreak: false });
    });
    ty += 22;

    team.forEach((member, i) => {
      const memberTasks = tasks.filter(
        t => t.assigned_to && t.assigned_to.toLowerCase() === member.email.toLowerCase()
      );
      const memberDone  = memberTasks.filter(t => t.status === 'done').length;
      const memberTotal = memberTasks.length;
      const memberHours = hoursTotal(memberTasks);
      const memberPct   = memberTotal > 0 ? Math.round((memberDone / memberTotal) * 100) : 0;

      const rowH = 26;
      if (i % 2 === 0) rect(doc, M, ty, contentW, rowH, COLORS.gray50, 0);
      const cy = ty + 9;

      // Avatar + name
      doc.save().circle(TC.name.x + 12, ty + 13, 7).fill(COLORS.indigo).restore();
      const initials = (member.name || member.email || '?')[0].toUpperCase();
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(COLORS.white)
        .text(initials, TC.name.x + 8, ty + 10, { width: 8, align: 'center', lineBreak: false });
      const displayName = member.name || member.email.split('@')[0];
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray900)
        .text(displayName, TC.name.x + 26, cy, { width: TC.name.w - 28, ellipsis: true, lineBreak: false });

      // Tasks done
      doc.fontSize(8).font('Helvetica-Bold').fillColor(memberDone > 0 ? COLORS.emerald : COLORS.gray400)
        .text(String(memberDone), TC.tasksDone.x + 6, cy, { lineBreak: false });

      // Tasks total
      doc.fontSize(8).font('Helvetica').fillColor(COLORS.gray600)
        .text(`${memberTotal} (${memberPct}%)`, TC.tasksTotal.x + 6, cy, { lineBreak: false });

      // Hours
      doc.fontSize(8).font('Helvetica').fillColor(memberHours > 0 ? COLORS.gray700 : COLORS.gray300)
        .text(memberHours > 0 ? fmtHours(memberHours) : '—', TC.hours.x + 6, cy, { lineBreak: false });

      doc.moveTo(M, ty + rowH).lineTo(M + contentW, ty + rowH)
        .strokeColor(COLORS.gray200).lineWidth(0.5).stroke();

      ty += rowH;
    });
  }

  addFooter(doc, userPlan);
  doc.end();
  return doc;
}

module.exports = { generateSprintReport, generateSprintPlan };
