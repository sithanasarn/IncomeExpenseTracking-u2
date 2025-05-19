-- Create a table for categories if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a table for transactions if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow public access to categories (read-only)
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
CREATE POLICY "Allow public read access to categories" 
  ON categories FOR SELECT 
  USING (true);

-- For transactions, allow public access for now
DROP POLICY IF EXISTS "Allow public access to transactions" ON transactions;
CREATE POLICY "Allow public access to transactions" 
  ON transactions FOR ALL 
  USING (true);
