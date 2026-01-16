-- Update the function to get list by share code to include is_archived
DROP FUNCTION IF EXISTS public.get_list_by_code(text);

CREATE OR REPLACE FUNCTION public.get_list_by_code(_code text)
RETURNS TABLE (
  id uuid,
  name text,
  baby_name text,
  father_name text,
  mother_name text,
  phone text,
  owner_id uuid,
  share_code text,
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, baby_name, father_name, mother_name, phone, owner_id, share_code, is_archived, created_at, updated_at
  FROM public.shopping_lists
  WHERE UPPER(share_code) = UPPER(_code)
$$;
