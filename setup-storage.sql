-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the transaction-receipts bucket if it doesn't exist
-- Note: This is a simplified version as the actual createBucket function
-- is part of Supabase's internal API
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'transaction-receipts'
    ) THEN
        -- Insert the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('transaction-receipts', 'transaction-receipts', true);
        
        RAISE NOTICE 'Created transaction-receipts bucket';
    ELSE
        -- Update the bucket to ensure it's public
        UPDATE storage.buckets 
        SET public = true 
        WHERE name = 'transaction-receipts';
        
        RAISE NOTICE 'Updated transaction-receipts bucket to be public';
    END IF;
END $$;

-- Create policies for the transaction-receipts bucket

-- Allow public uploads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow public uploads to transaction-receipts'
    ) THEN
        CREATE POLICY "Allow public uploads to transaction-receipts"
        ON storage.objects FOR INSERT
        TO public
        WITH CHECK (bucket_id = 'transaction-receipts');
        
        RAISE NOTICE 'Created upload policy for transaction-receipts';
    END IF;
END $$;

-- Allow public downloads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow public downloads from transaction-receipts'
    ) THEN
        CREATE POLICY "Allow public downloads from transaction-receipts"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'transaction-receipts');
        
        RAISE NOTICE 'Created download policy for transaction-receipts';
    END IF;
END $$;

-- Allow public updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow public updates to transaction-receipts'
    ) THEN
        CREATE POLICY "Allow public updates to transaction-receipts"
        ON storage.objects FOR UPDATE
        TO public
        USING (bucket_id = 'transaction-receipts');
        
        RAISE NOTICE 'Created update policy for transaction-receipts';
    END IF;
END $$;

-- Allow public deletes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Allow public deletes from transaction-receipts'
    ) THEN
        CREATE POLICY "Allow public deletes from transaction-receipts"
        ON storage.objects FOR DELETE
        TO public
        USING (bucket_id = 'transaction-receipts');
        
        RAISE NOTICE 'Created delete policy for transaction-receipts';
    END IF;
END $$;

-- Ensure RLS is enabled on the objects table
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Output current bucket configuration
SELECT name, public FROM storage.buckets WHERE name = 'transaction-receipts';

-- Output current policies
SELECT 
    p.policyname, 
    CASE
        WHEN p.cmd = 'r' THEN 'SELECT'
        WHEN p.cmd = 'a' THEN 'INSERT'
        WHEN p.cmd = 'w' THEN 'UPDATE'
        WHEN p.cmd = 'd' THEN 'DELETE'
        ELSE p.cmd::TEXT
    END AS operation,
    pg_get_expr(p.qual, p.polrelid) AS definition
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'storage'
  AND c.relname = 'objects'
  AND pg_get_expr(p.qual, p.polrelid) LIKE '%transaction-receipts%';
