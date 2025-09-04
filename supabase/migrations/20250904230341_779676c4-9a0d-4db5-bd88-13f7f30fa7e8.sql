-- Make the avatars bucket public so images don't expire
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatars';