-- Function to create a storage policy
CREATE OR REPLACE FUNCTION create_storage_policy(
  bucket_name TEXT,
  policy_name TEXT,
  definition TEXT,
  operation TEXT DEFAULT 'ALL'
) RETURNS VOID AS $$
DECLARE
  op_code TEXT;
BEGIN
  -- Convert operation string to PostgreSQL policy command code
  CASE operation
    WHEN 'SELECT' THEN op_code := 'r';
    WHEN 'INSERT' THEN op_code := 'a';
    WHEN 'UPDATE' THEN op_code := 'w';
    WHEN 'DELETE' THEN op_code := 'd';
    WHEN 'ALL' THEN op_code := '*';
    ELSE op_code := operation;
  END CASE;

  -- Check if policy already exists
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = policy_name
  ) THEN
    -- Drop existing policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
  END IF;

  -- Create the policy
  EXECUTE format(
    'CREATE POLICY %I ON storage.objects FOR %s TO public USING (%s)',
    policy_name,
    operation,
    definition
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
