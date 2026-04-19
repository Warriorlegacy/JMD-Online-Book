-- Drop duplicate unique index on users.username
-- Keep the one with conventional naming (users_username_key)
DROP INDEX IF EXISTS users_username_unique;

-- JMD duplicate index cleanup (if applicable)
DROP INDEX IF EXISTS idx_user_id;
