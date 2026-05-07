ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Validar que o plano é um dos 3 permitidos
ALTER TABLE users
  ADD CONSTRAINT check_plan CHECK (plan IN ('free', 'pro', 'team'));
