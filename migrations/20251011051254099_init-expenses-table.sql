-- Up Migration
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) on DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    amount DECIMAL(12, 2) NOT NULL CHECK(amount > 0),
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- indexes for common queries
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);

-- Down Migration
DROP TABLE IF EXISTS expenses CASCADE;