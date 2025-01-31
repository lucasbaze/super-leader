-- Function to begin a test transaction
create or replace function begin_test_transaction()
returns void
language plpgsql
security definer
as $$
begin
  -- Start transaction
  execute 'begin';
end;
$$;

-- Function to rollback a test transaction
create or replace function rollback_test_transaction()
returns void
language plpgsql
security definer
as $$
begin
  -- Rollback transaction
  execute 'rollback';
end;
$$; 