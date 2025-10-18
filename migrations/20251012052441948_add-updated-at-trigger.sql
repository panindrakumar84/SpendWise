-- Up Migration

-- Create reusable function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for expenses table (since it also has updated_at)
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Down Migration

-- Drop triggers
DROP TRIGGER IF EXISTS update_expenses_updated_at on expenses;
DROP TRIGGER IF EXISTS update_users_updated_at on users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();