-- Create a table for categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a table for transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default categories
INSERT INTO categories (name, type) VALUES
  ('Salary', 'income'),
  ('Freelance', 'income'),
  ('Investments', 'income'),
  ('Gifts', 'income'),
  ('Other Income', 'income'),
  ('Housing', 'expense'),
  ('Food', 'expense'),
  ('Transportation', 'expense'),
  ('Entertainment', 'expense'),
  ('Utilities', 'expense'),
  ('Healthcare', 'expense'),
  ('Personal', 'expense'),
  ('Education', 'expense'),
  ('Other Expense', 'expense');

-- Create RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow public access to categories (read-only)
CREATE POLICY "Allow public read access to categories" 
  ON categories FOR SELECT 
  USING (true);

-- For transactions, we'll need to set up auth later
CREATE POLICY "Allow public access to transactions" 
  ON transactions FOR ALL 
  USING (true);
