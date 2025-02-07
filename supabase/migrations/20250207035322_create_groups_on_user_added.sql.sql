alter table "public"."group" add column "updated_at" timestamp with time zone not null default now();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Inner 5
  insert into public.group (id, user_id, name, slug, icon)
  values (
    gen_random_uuid(),
    new.id,
    'Inner 5',
    'inner-5',
    '5'
  );

  -- Central 50
  insert into public.group (id, user_id, name, slug, icon)
  values (
    gen_random_uuid(),
    new.id,
    'Central 50',
    'central-50',
    '50'
  );

  -- Strategic 100
  insert into public.group (id, user_id, name, slug, icon)
  values (
    gen_random_uuid(),
    new.id,
    'Strategic 100',
    'strategic-100',
    '100'
  );

  -- School
  insert into public.group (id, user_id, name, slug, icon)
  values (
    gen_random_uuid(),
    new.id,
    'School',
    'school',
    '🎓'
  );

  -- Community
  insert into public.group (id, user_id, name, slug, icon)
  values (
    gen_random_uuid(),
    new.id,
    'Community',
    'community',
    '🏘️'
  );

  -- Work
  insert into public.group (id, user_id, name, slug, icon)
  values (
    gen_random_uuid(),
    new.id,
    'Work',
    'work',
    '💼'
  );

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE TRIGGER handle_group_updated_at BEFORE UPDATE ON public."group" FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


