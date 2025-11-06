-- Drop overly permissive storage policies that don't verify ownership
DROP POLICY IF EXISTS "Authenticated users can upload memory files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update memory files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete memory files" ON storage.objects;

-- The correct user-specific policies remain:
-- - 'Users can upload own media'
-- - 'Users can update own media' 
-- - 'Users can delete own media'
-- These properly verify folder ownership via storage.foldername(name)[1]