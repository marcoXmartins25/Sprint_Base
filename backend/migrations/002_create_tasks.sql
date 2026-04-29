CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'to-do',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('to-do', 'in-progress', 'done')),
  CHECK (priority IN ('low', 'medium', 'high'))
);
