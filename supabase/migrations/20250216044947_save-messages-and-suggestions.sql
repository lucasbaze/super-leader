create table "public"."suggestions" (
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "person_id" uuid,
    "suggestion" json not null,
    "type" text not null default '"content"'::text,
    "saved" boolean not null default false,
    "viewed" boolean default false,
    "bad" boolean not null default false,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."suggestions" enable row level security;

alter table "public"."addresses" alter column "city" drop not null;

alter table "public"."addresses" alter column "country" drop not null;

alter table "public"."addresses" alter column "street" drop not null;

alter table "public"."messages" drop column "author_name";

alter table "public"."messages" drop column "content";

alter table "public"."messages" add column "group_id" uuid;

alter table "public"."messages" add column "message" json not null;

alter table "public"."messages" add column "person_id" uuid;

alter table "public"."messages" add column "type" text;

alter table "public"."person" add column "follow_up_score" real not null default '0.5'::real;

alter table "public"."person" alter column "user_id" set not null;

CREATE UNIQUE INDEX suggestions_pkey ON public.suggestions USING btree (id);

alter table "public"."suggestions" add constraint "suggestions_pkey" PRIMARY KEY using index "suggestions_pkey";

alter table "public"."messages" add constraint "messages_group_id_fkey" FOREIGN KEY (group_id) REFERENCES "group"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_group_id_fkey";

alter table "public"."messages" add constraint "messages_person_id_fkey" FOREIGN KEY (person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_person_id_fkey";

alter table "public"."suggestions" add constraint "suggestions_person_id_fkey" FOREIGN KEY (person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."suggestions" validate constraint "suggestions_person_id_fkey";

alter table "public"."suggestions" add constraint "suggestions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."suggestions" validate constraint "suggestions_user_id_fkey";

grant delete on table "public"."suggestions" to "anon";

grant insert on table "public"."suggestions" to "anon";

grant references on table "public"."suggestions" to "anon";

grant select on table "public"."suggestions" to "anon";

grant trigger on table "public"."suggestions" to "anon";

grant truncate on table "public"."suggestions" to "anon";

grant update on table "public"."suggestions" to "anon";

grant delete on table "public"."suggestions" to "authenticated";

grant insert on table "public"."suggestions" to "authenticated";

grant references on table "public"."suggestions" to "authenticated";

grant select on table "public"."suggestions" to "authenticated";

grant trigger on table "public"."suggestions" to "authenticated";

grant truncate on table "public"."suggestions" to "authenticated";

grant update on table "public"."suggestions" to "authenticated";

grant delete on table "public"."suggestions" to "service_role";

grant insert on table "public"."suggestions" to "service_role";

grant references on table "public"."suggestions" to "service_role";

grant select on table "public"."suggestions" to "service_role";

grant trigger on table "public"."suggestions" to "service_role";

grant truncate on table "public"."suggestions" to "service_role";

grant update on table "public"."suggestions" to "service_role";

create policy "Allow any updates"
on "public"."person"
as permissive
for update
to public
using (true);


create policy "Anyone can update"
on "public"."suggestions"
as permissive
for update
to public
using (true);


create policy "Enable insert for users based on user_id"
on "public"."suggestions"
as permissive
for insert
to public
with check (true);


create policy "Enable users to view their own data only"
on "public"."suggestions"
as permissive
for select
to public
using (true);



