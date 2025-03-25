alter table "public"."task_suggestion" drop column "content";

alter table "public"."task_suggestion" drop column "type";

alter table "public"."task_suggestion" add column "context" jsonb not null;

alter table "public"."task_suggestion" add column "suggested_action" jsonb not null;

alter table "public"."task_suggestion" add column "suggested_action_type" text not null;

alter table "public"."task_suggestion" add column "trigger" text not null;

alter table "public"."task_suggestion" alter column "end_at" set not null;

alter table "public"."task_suggestion" alter column "person_id" drop not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_people_with_upcoming_birthdays(p_user_id uuid, p_start_date text, p_end_date text)
 RETURNS TABLE(id uuid, first_name text, last_name text, birthday date)
 LANGUAGE sql
AS $function$
  select id, first_name, last_name, birthday
  from person
  where user_id = p_user_id
    and birthday is not null
    and (
      -- Case 1: Birthday is in current year
      (to_char(birthday, 'MM-DD') >= p_start_date and to_char(birthday, 'MM-DD') <= p_end_date)
      or
      -- Case 2: Birthday is in next year (for dates near year end)
      (p_start_date > p_end_date and to_char(birthday, 'MM-DD') <= p_end_date)
    );
$function$
;


