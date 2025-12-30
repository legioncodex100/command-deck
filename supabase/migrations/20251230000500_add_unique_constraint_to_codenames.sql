-- Enforce Uniqueness on Code Name (display_name)
ALTER TABLE profiles
ADD CONSTRAINT profiles_display_name_key UNIQUE (display_name);
