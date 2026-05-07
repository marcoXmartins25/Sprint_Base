require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('./routes/auth');
const authRoutes = require('./routes/auth').router;
const sprintRoutes = require('./routes/sprints');
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');
const planRoutes = require('./routes/plan');
const brandingRoutes = require('./routes/branding');
const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const teamRoutes = require('./routes/team');
const invitesRoutes = require('./routes/invites');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

const fs = require('fs');
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/invites', invitesRoutes);

// Servir uploads apenas para utilizadores autenticados
app.get('/uploads/:file', verifyToken, (req, res) => {
  const filePath = path.join(uploadsDir, req.params.file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filePath);
});

app.get('/api/users', verifyToken, async (req, res) => {
  const { pool } = require('./db');
  const result = await pool.query('SELECT id, email, name, avatar_url, role FROM users ORDER BY name, email');
  res.json(result.rows);
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
  const { pool } = require('./db');
  const { name, email } = req.body;
  try {
    if (email) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.params.id]);
      if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already in use' });
    }
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, email, name, avatar_url',
      [name, email, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:id/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  const { pool } = require('./db');
  const avatarUrl = `/uploads/${req.file.filename}`;
  const result = await pool.query(
    'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, email, name, avatar_url',
    [avatarUrl, req.params.id]
  );
  res.json(result.rows[0]);
});
app.use('/api/sprints', verifyToken, sprintRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/sprints', verifyToken, reportRoutes);
app.use('/api/team', verifyToken, teamRoutes);
app.use('/api/users', verifyToken, planRoutes);
app.use('/api/users', verifyToken, brandingRoutes);
app.use('/api/admin/users', verifyToken, usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
