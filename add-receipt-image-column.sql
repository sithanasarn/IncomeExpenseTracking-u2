-- Add receipt_image column to transactions table
ALTER TABLE transactions 
ADD COLUMN receipt_image TEXT;
