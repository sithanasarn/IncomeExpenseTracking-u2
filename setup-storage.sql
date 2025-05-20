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
    END IF;
END $$;
