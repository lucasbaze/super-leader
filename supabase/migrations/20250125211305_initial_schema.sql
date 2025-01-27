-- Create a simple public message board table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    content text not null,
    author_name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS but allow all operations
alter table public.messages enable row level security;

-- Create policies that allow anyone to do anything
create policy "Anyone can view messages"
    on messages for select
    using ( true );

create policy "Anyone can create messages"
    on messages for insert
    with check ( true );

create policy "Anyone can update messages"
    on messages for update
    using ( true );

create policy "Anyone can delete messages"
    on messages for delete
    using ( true );

-- Add some sample messages
insert into public.messages (content, author_name) values
    ('Hello world! First message on this board.', 'System'),
    ('Testing the message board. Feel free to add your own messages!', 'Tester');
