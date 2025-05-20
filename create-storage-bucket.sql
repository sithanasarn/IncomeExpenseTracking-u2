-- Create a storage bucket for transaction receipts if it doesn't exist
-- Note: This is a Supabase-specific SQL function
SELECT create_storage_bucket('transaction-receipts', 'Public bucket for transaction receipt images');

-- Set up public access for the bucket
UPDATE storage.buckets 
SET public = true 
WHERE name = 'transaction-receipts';

-- Create a policy to allow uploads
CREATE POLICY "Allow public uploads to transaction-receipts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'transaction-receipts');

-- Create a policy to allow downloads
CREATE POLICY "Allow public downloads from transaction-receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'transaction-receipts');
