-- Add company_id to sprints
ALTER TABLE sprints 
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;

-- Add company_id to tasks
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE;

-- Migrate existing sprints and tasks to companies
-- Link sprints to the company of user id 1 (or first user)
DO $$
DECLARE
  default_company_id INTEGER;
BEGIN
  -- Get the company_id of the first user
  SELECT company_id INTO default_company_id FROM users ORDER BY id LIMIT 1;
  
  -- Update sprints without company_id
  UPDATE sprints SET company_id = default_company_id WHERE company_id IS NULL;
  
  -- Update tasks without company_id
  UPDATE tasks SET company_id = default_company_id WHERE company_id IS NULL;
END $$;

-- Make company_id required
ALTER TABLE sprints ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN company_id SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sprints_company ON sprints(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_company ON tasks(sprint_id, company_id);
