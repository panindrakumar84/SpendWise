-- Up Migration
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- insert default categories
INSERT INTO categories (name, description) VALUES
    ('Food', 'Groceries, restaurants, and dining'),
    ('Transport', 'Public transport, fuel, parking'),
    ('Entertainment', 'Movies, games, subscriptions'),
    ('Utilities', 'Electricity, water, internet'),
    ('Health', 'Medical, pharmacy, fitness'),
    ('Shopping', 'Clothing, electronics, general shopping'),
    ('Others', 'Miscellaneous expenses');

-- Down Migration
DROP TABLE IF EXISTS categories CASCADE;