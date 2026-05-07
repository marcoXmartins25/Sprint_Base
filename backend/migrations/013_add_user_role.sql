ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Validar que o role é um dos permitidos
ALTER TABLE users
  ADD CONSTRAINT check_role CHECK (role IN ('user', 'admin'));

-- Tornar admin@admin.com admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@admin.com';
