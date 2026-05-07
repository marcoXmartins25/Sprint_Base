ALTER TABLE sprints
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT NULL;

-- Index para queries de sprints ativas
CREATE INDEX IF NOT EXISTS idx_sprints_archived ON sprints(archived_at) WHERE archived_at IS NULL;
