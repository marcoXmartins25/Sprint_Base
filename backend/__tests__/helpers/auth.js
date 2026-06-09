const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sprint-tracker-secret-key-2026';

const makeToken = (userId = 1) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

const authHeader = (userId = 1) => ({
  Authorization: `Bearer ${makeToken(userId)}`,
});

module.exports = { makeToken, authHeader };
