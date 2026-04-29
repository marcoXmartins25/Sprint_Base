require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./routes/auth');
const authRoutes = require('./routes/auth').router;
const sprintRoutes = require('./routes/sprints');
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/sprints', verifyToken, sprintRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/sprints', verifyToken, reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
