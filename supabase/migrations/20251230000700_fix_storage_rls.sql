-- Allow users to DELETE their own avatar files
create policy "Allow users to delete their own avatars"
on storage.objects for delete
using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to SELECT (list) their own avatar files (needed for the cleanup check)
create policy "Allow users to list their own avatars"
on storage.objects for select
using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
