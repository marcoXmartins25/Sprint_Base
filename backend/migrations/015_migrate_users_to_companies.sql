-- Add company_id and company_role to users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS company_role VARCHAR(20) DEFAULT 'member' CHECK (company_role IN ('owner', 'admin', 'member'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);

-- Migrate existing users: create a company for each user
DO $$
DECLARE
  user_record RECORD;
  new_company_id INTEGER;
BEGIN
  FOR user_record IN SELECT id, email, name, plan, plan_expires_at, plan_updated_at FROM users WHERE company_id IS NULL
  LOOP
    -- Create company for this user
    INSERT INTO companies (name, email, plan, plan_expires_at, plan_updated_at, created_at)
    VALUES (
      COALESCE(user_record.name, 'Company') || '''s Company',
      'company_' || user_record.id || '@' || split_part(user_record.email, '@', 2),
      COALESCE(user_record.plan, 'free'),
      user_record.plan_expires_at,
      user_record.plan_updated_at,
      NOW()
    )
    RETURNING id INTO new_company_id;
    
    -- Link user to company as owner
    UPDATE users 
    SET company_id = new_company_id, company_role = 'owner'
    WHERE id = user_record.id;
  END LOOP;
END $$;

-- Remove plan columns from users (now in companies)
ALTER TABLE users DROP COLUMN IF EXISTS plan;
ALTER TABLE users DROP COLUMN IF EXISTS plan_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS plan_updated_at;

-- Make company_id required for new users
ALTER TABLE users ALTER COLUMN company_id SET NOT NULL;
