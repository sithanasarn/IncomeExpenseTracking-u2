-- Create a storage bucket for transaction receipts if it doesn't exist
-- Note: This is a Supabase-specific SQL function
SELECT create_storage_bucket('transaction-receipts', 'Public bucket for transaction receipt images');

-- Set up public access for the bucket
UPDATE storage.buckets 
SET public = true 
WHERE name = 'transaction-receipts';
