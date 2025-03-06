alter table "public"."messages" drop constraint "messages_group_id_fkey";

alter table "public"."messages" drop constraint "messages_person_id_fkey";

create table "public"."conversations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "name" text not null default 'New Conversation'::text,
    "owner_type" text not null,
    "owner_identifier" text not null
);


alter table "public"."conversations" enable row level security;

create table "public"."user_context" (
    "id" uuid not null default gen_random_uuid(),
    "content" text not null,
    "reason" text not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "processed" boolean not null default false,
    "processed_at" timestamp with time zone
);


alter table "public"."user_context" enable row level security;

create table "public"."user_profile" (
    "first_name" text,
    "last_name" text,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "context_summary" jsonb,
    "id" uuid not null default gen_random_uuid(),
    "context_summary_completeness_score" smallint not null default '0'::smallint
);


alter table "public"."user_profile" enable row level security;

alter table "public"."messages" drop column "group_id";

alter table "public"."messages" drop column "person_id";

alter table "public"."messages" drop column "type";

alter table "public"."messages" add column "conversation_id" uuid not null;

alter table "public"."messages" alter column "user_id" set not null;

alter table "public"."person" add column "completeness_score" smallint default '0'::smallint;

alter table "public"."person" alter column "ai_summary" set data type jsonb using "ai_summary"::jsonb;

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX user_context_pkey ON public.user_context USING btree (id);

CREATE UNIQUE INDEX user_profile_pkey ON public.user_profile USING btree (id);

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."user_context" add constraint "user_context_pkey" PRIMARY KEY using index "user_context_pkey";

alter table "public"."user_profile" add constraint "user_profile_pkey" PRIMARY KEY using index "user_profile_pkey";

alter table "public"."conversations" add constraint "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user_id_fkey";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."user_context" add constraint "user_context_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_context" validate constraint "user_context_user_id_fkey";

alter table "public"."user_profile" add constraint "user_profile_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_profile" validate constraint "user_profile_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_everyone_else_completeness_score(p_user_id uuid, p_core_group_slugs text[])
 RETURNS TABLE(avg_completeness double precision, count bigint)
 LANGUAGE plpgsql
AS $function$
DECLARE
  avg_score FLOAT;
  people_count BIGINT;
BEGIN
  -- Get both the average and count in a single query
  SELECT 
    COALESCE(AVG(p.completeness_score), 0),
    COUNT(p.id)
  INTO 
    avg_score, people_count
  FROM 
    person p
  WHERE 
    p.user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 
      FROM group_member gm
      JOIN "group" g ON gm.group_id = g.id
      WHERE 
        gm.person_id = p.id
        AND g.user_id = p_user_id
        AND g.slug = ANY(p_core_group_slugs)
    );
    
  -- Return as a single row with two columns
  RETURN QUERY SELECT avg_score, people_count;
END;
$function$
;

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."user_context" to "anon";

grant insert on table "public"."user_context" to "anon";

grant references on table "public"."user_context" to "anon";

grant select on table "public"."user_context" to "anon";

grant trigger on table "public"."user_context" to "anon";

grant truncate on table "public"."user_context" to "anon";

grant update on table "public"."user_context" to "anon";

grant delete on table "public"."user_context" to "authenticated";

grant insert on table "public"."user_context" to "authenticated";

grant references on table "public"."user_context" to "authenticated";

grant select on table "public"."user_context" to "authenticated";

grant trigger on table "public"."user_context" to "authenticated";

grant truncate on table "public"."user_context" to "authenticated";

grant update on table "public"."user_context" to "authenticated";

grant delete on table "public"."user_context" to "service_role";

grant insert on table "public"."user_context" to "service_role";

grant references on table "public"."user_context" to "service_role";

grant select on table "public"."user_context" to "service_role";

grant trigger on table "public"."user_context" to "service_role";

grant truncate on table "public"."user_context" to "service_role";

grant update on table "public"."user_context" to "service_role";

grant delete on table "public"."user_profile" to "anon";

grant insert on table "public"."user_profile" to "anon";

grant references on table "public"."user_profile" to "anon";

grant select on table "public"."user_profile" to "anon";

grant trigger on table "public"."user_profile" to "anon";

grant truncate on table "public"."user_profile" to "anon";

grant update on table "public"."user_profile" to "anon";

grant delete on table "public"."user_profile" to "authenticated";

grant insert on table "public"."user_profile" to "authenticated";

grant references on table "public"."user_profile" to "authenticated";

grant select on table "public"."user_profile" to "authenticated";

grant trigger on table "public"."user_profile" to "authenticated";

grant truncate on table "public"."user_profile" to "authenticated";

grant update on table "public"."user_profile" to "authenticated";

grant delete on table "public"."user_profile" to "service_role";

grant insert on table "public"."user_profile" to "service_role";

grant references on table "public"."user_profile" to "service_role";

grant select on table "public"."user_profile" to "service_role";

grant trigger on table "public"."user_profile" to "service_role";

grant truncate on table "public"."user_profile" to "service_role";

grant update on table "public"."user_profile" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."conversations"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable users to update their own data only"
on "public"."conversations"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."conversations"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for authenticated users only"
on "public"."user_context"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable users to view their own data only"
on "public"."user_context"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to update their own data only"
on "public"."user_profile"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."user_profile"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER user_profile_updated_at AFTER UPDATE ON public.user_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


