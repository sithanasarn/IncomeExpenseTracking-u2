-- This function may not work on all Supabase instances
-- It's just for demonstration purposes
CREATE OR REPLACE FUNCTION get_project_details()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jsonb_build_object(
      'project_name', current_database(),
      'version', version(),
      'current_user', current_user
    );
$$;
