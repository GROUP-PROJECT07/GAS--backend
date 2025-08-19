create policy "Authenticated can access files"
on storage.objects for all using (
  auth.role() != 'anon'
);
