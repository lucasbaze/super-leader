-- First, clean existing data
truncate table public.messages;

-- Insert seed data
insert into public.messages (content, author_name, created_at) values
    ('Welcome to the message board! This is a seed message.', 'Admin', now() - interval '1 day'),
    ('Hey everyone! Excited to be here.', 'Alice', now() - interval '12 hours'),
    ('This is a great place to test Supabase functionality!', 'Bob', now() - interval '6 hours'),
    ('Anyone want to build something cool?', 'Charlie', now() - interval '3 hours'),
    ('Just testing out the timestamps...', 'David', now() - interval '1 hour'); 