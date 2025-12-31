-- Allow users to DELETE their own avatar files
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow users to delete their own avatars') then
    create policy "Allow users to delete their own avatars" on storage.objects for delete using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow users to list their own avatars') then
    create policy "Allow users to list their own avatars" on storage.objects for select using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
  end if;
end $$;
