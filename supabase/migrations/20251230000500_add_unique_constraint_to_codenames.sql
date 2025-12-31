-- Enforce Uniqueness on Code Name (display_name)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_display_name_key') then
    ALTER TABLE profiles ADD CONSTRAINT profiles_display_name_key UNIQUE (display_name);
  end if;
end $$;
