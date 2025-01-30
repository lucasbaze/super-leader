create table "public"."interactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "type" text,
    "note" text,
    "person_id" uuid,
    "user_id" uuid
);


alter table "public"."interactions" enable row level security;

create table "public"."person" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "first_name" text not null,
    "last_name" text,
    "birthday" date,
    "bio" text,
    "ai_summary" text,
    "user_id" uuid,
    "date_met" date
);


alter table "public"."person" enable row level security;

alter table "public"."messages" add column "user_id" uuid;

CREATE UNIQUE INDEX interactions_pkey ON public.interactions USING btree (id);

CREATE UNIQUE INDEX person_pkey ON public.person USING btree (id);

alter table "public"."interactions" add constraint "interactions_pkey" PRIMARY KEY using index "interactions_pkey";

alter table "public"."person" add constraint "person_pkey" PRIMARY KEY using index "person_pkey";

alter table "public"."interactions" add constraint "interactions_person_id_fkey" FOREIGN KEY (person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."interactions" validate constraint "interactions_person_id_fkey";

alter table "public"."interactions" add constraint "interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."interactions" validate constraint "interactions_user_id_fkey";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

alter table "public"."person" add constraint "person_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person" validate constraint "person_user_id_fkey";

grant delete on table "public"."interactions" to "anon";

grant insert on table "public"."interactions" to "anon";

grant references on table "public"."interactions" to "anon";

grant select on table "public"."interactions" to "anon";

grant trigger on table "public"."interactions" to "anon";

grant truncate on table "public"."interactions" to "anon";

grant update on table "public"."interactions" to "anon";

grant delete on table "public"."interactions" to "authenticated";

grant insert on table "public"."interactions" to "authenticated";

grant references on table "public"."interactions" to "authenticated";

grant select on table "public"."interactions" to "authenticated";

grant trigger on table "public"."interactions" to "authenticated";

grant truncate on table "public"."interactions" to "authenticated";

grant update on table "public"."interactions" to "authenticated";

grant delete on table "public"."interactions" to "service_role";

grant insert on table "public"."interactions" to "service_role";

grant references on table "public"."interactions" to "service_role";

grant select on table "public"."interactions" to "service_role";

grant trigger on table "public"."interactions" to "service_role";

grant truncate on table "public"."interactions" to "service_role";

grant update on table "public"."interactions" to "service_role";

grant delete on table "public"."person" to "anon";

grant insert on table "public"."person" to "anon";

grant references on table "public"."person" to "anon";

grant select on table "public"."person" to "anon";

grant trigger on table "public"."person" to "anon";

grant truncate on table "public"."person" to "anon";

grant update on table "public"."person" to "anon";

grant delete on table "public"."person" to "authenticated";

grant insert on table "public"."person" to "authenticated";

grant references on table "public"."person" to "authenticated";

grant select on table "public"."person" to "authenticated";

grant trigger on table "public"."person" to "authenticated";

grant truncate on table "public"."person" to "authenticated";

grant update on table "public"."person" to "authenticated";

grant delete on table "public"."person" to "service_role";

grant insert on table "public"."person" to "service_role";

grant references on table "public"."person" to "service_role";

grant select on table "public"."person" to "service_role";

grant trigger on table "public"."person" to "service_role";

grant truncate on table "public"."person" to "service_role";

grant update on table "public"."person" to "service_role";

create policy "Enable insert for users based on user_id"
on "public"."interactions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "public"."person"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."person"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



