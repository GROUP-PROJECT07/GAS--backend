-- Ensure this bucket exists first in Supabase Storage UI
-- Enable RLS for storage and restrict file access

-- Only allow access if authenticated
create policy "Authenticated can access files"
on storage.objects for all using (
  auth.role() != 'anon'
);
