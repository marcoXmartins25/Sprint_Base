ALTER TABLE users
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#6366f1';

-- Validar que a cor é um hex válido
ALTER TABLE users
  ADD CONSTRAINT check_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$');
