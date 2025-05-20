-- Function to get policies for a specific bucket
CREATE OR REPLACE FUNCTION get_policies_for_bucket(bucket_name TEXT)
RETURNS TABLE (
  policy_name TEXT,
  operation TEXT,
  definition TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname::TEXT AS policy_name,
    CASE
      WHEN p.cmd = 'r' THEN 'SELECT'
      WHEN p.cmd = 'a' THEN 'INSERT'
      WHEN p.cmd = 'w' THEN 'UPDATE'
      WHEN p.cmd = 'd' THEN 'DELETE'
      ELSE p.cmd::TEXT
    END AS operation,
    pg_get_expr(p.qual, p.polrelid)::TEXT AS definition
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'storage'
    AND c.relname = 'objects'
    AND pg_get_expr(p.qual, p.polrelid) LIKE '%' || bucket_name || '%';
END;
$$;
