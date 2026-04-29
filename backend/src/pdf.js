const PDFDocument = require('pdfkit');

function generateSprintReport(sprint, tasks) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'to-do').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const highPriority = tasks.filter(t => t.priority === 'high');
  const mediumPriority = tasks.filter(t => t.priority === 'medium');
  const lowPriority = tasks.filter(t => t.priority === 'low');

  doc.fontSize(24).font('Helvetica-Bold').text('Sprint Report', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(18).font('Helvetica-Bold').text(sprint.title, { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica').text(
    `Period: ${formatDate(sprint.start_date)} - ${formatDate(sprint.end_date)}`,
    { align: 'center' }
  );
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').text(
    `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    { align: 'center' }
  );

  doc.moveDown(1);
  drawLine(doc);
  doc.moveDown(1);

  doc.fontSize(16).font('Helvetica-Bold').text('Summary');
  doc.moveDown(0.5);

  doc.fontSize(11).font('Helvetica').text(`Total Tasks: ${totalTasks}`);
  doc.text(`Completed: ${doneTasks}`);
  doc.text(`In Progress: ${inProgressTasks}`);
  doc.text(`To Do: ${todoTasks}`);
  doc.text(`Completion Rate: ${completionRate}%`);
  doc.moveDown(0.5);

  doc.fontSize(11).font('Helvetica').text(`High Priority: ${highPriority.length}`);
  doc.text(`Medium Priority: ${mediumPriority.length}`);
  doc.text(`Low Priority: ${lowPriority.length}`);

  doc.moveDown(1);
  drawLine(doc);
  doc.moveDown(1);

  doc.fontSize(16).font('Helvetica-Bold').text('Tasks');
  doc.moveDown(1);

  tasks.forEach((task, index) => {
    const statusIcon = task.status === 'done' ? '[X]' : task.status === 'in-progress' ? '[~]' : '[ ]';
    const priorityLabel = task.priority.toUpperCase();

    doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${task.title}`);
    doc.fontSize(10).font('Helvetica').text(`   Status: ${statusIcon} ${task.status.replace('-', ' ').toUpperCase()}`);
    doc.text(`   Priority: ${priorityLabel}`);
    if (task.description) {
      doc.text(`   Description: ${task.description}`);
    }
    doc.moveDown(0.5);

    if (index < tasks.length - 1) {
      drawLine(doc);
      doc.moveDown(0.5);
    }
  });

  doc.moveDown(2);
  drawLine(doc);
  doc.moveDown(0.5);
  doc.fontSize(8).font('Helvetica').text('Sprint Tracker - Confidential', { align: 'center' });

  doc.end();
  return doc;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function drawLine(doc) {
  const y = doc.y + 5;
  doc.moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
}

module.exports = { generateSprintReport };
