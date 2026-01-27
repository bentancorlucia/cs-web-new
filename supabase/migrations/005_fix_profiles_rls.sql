-- ===========================================
-- FIX: Recursive RLS policy on profiles
-- ===========================================

-- Helper function to check if user is admin/funcionario (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin_or_funcionario(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND rol IN ('admin', 'funcionario', 'directivo')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON public.profiles;

-- Recreate with the SECURITY DEFINER function
CREATE POLICY "Admins pueden ver todos los perfiles" ON public.profiles
    FOR SELECT
    USING (is_admin_or_funcionario(auth.uid()));
