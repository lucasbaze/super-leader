create table "public"."group" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "icon" text not null,
    "user_id" uuid,
    "slug" text not null
);


alter table "public"."group" enable row level security;

create table "public"."group_member" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "group_id" uuid,
    "person_id" uuid,
    "user_id" uuid
);


alter table "public"."group_member" enable row level security;

CREATE UNIQUE INDEX group_member_unique_idx ON public.group_member USING btree (group_id, person_id, user_id);

CREATE UNIQUE INDEX group_person_pkey ON public.group_member USING btree (id);

CREATE UNIQUE INDEX group_pkey ON public."group" USING btree (id);

alter table "public"."group" add constraint "group_pkey" PRIMARY KEY using index "group_pkey";

alter table "public"."group_member" add constraint "group_person_pkey" PRIMARY KEY using index "group_person_pkey";

alter table "public"."group" add constraint "group_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group" validate constraint "group_user_id_fkey";

alter table "public"."group_member" add constraint "group_person_group_id_fkey" FOREIGN KEY (group_id) REFERENCES "group"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_member" validate constraint "group_person_group_id_fkey";

alter table "public"."group_member" add constraint "group_person_person_id_fkey" FOREIGN KEY (person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_member" validate constraint "group_person_person_id_fkey";

alter table "public"."group_member" add constraint "group_person_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_member" validate constraint "group_person_user_id_fkey";

grant delete on table "public"."group" to "anon";

grant insert on table "public"."group" to "anon";

grant references on table "public"."group" to "anon";

grant select on table "public"."group" to "anon";

grant trigger on table "public"."group" to "anon";

grant truncate on table "public"."group" to "anon";

grant update on table "public"."group" to "anon";

grant delete on table "public"."group" to "authenticated";

grant insert on table "public"."group" to "authenticated";

grant references on table "public"."group" to "authenticated";

grant select on table "public"."group" to "authenticated";

grant trigger on table "public"."group" to "authenticated";

grant truncate on table "public"."group" to "authenticated";

grant update on table "public"."group" to "authenticated";

grant delete on table "public"."group" to "service_role";

grant insert on table "public"."group" to "service_role";

grant references on table "public"."group" to "service_role";

grant select on table "public"."group" to "service_role";

grant trigger on table "public"."group" to "service_role";

grant truncate on table "public"."group" to "service_role";

grant update on table "public"."group" to "service_role";

grant delete on table "public"."group_member" to "anon";

grant insert on table "public"."group_member" to "anon";

grant references on table "public"."group_member" to "anon";

grant select on table "public"."group_member" to "anon";

grant trigger on table "public"."group_member" to "anon";

grant truncate on table "public"."group_member" to "anon";

grant update on table "public"."group_member" to "anon";

grant delete on table "public"."group_member" to "authenticated";

grant insert on table "public"."group_member" to "authenticated";

grant references on table "public"."group_member" to "authenticated";

grant select on table "public"."group_member" to "authenticated";

grant trigger on table "public"."group_member" to "authenticated";

grant truncate on table "public"."group_member" to "authenticated";

grant update on table "public"."group_member" to "authenticated";

grant delete on table "public"."group_member" to "service_role";

grant insert on table "public"."group_member" to "service_role";

grant references on table "public"."group_member" to "service_role";

grant select on table "public"."group_member" to "service_role";

grant trigger on table "public"."group_member" to "service_role";

grant truncate on table "public"."group_member" to "service_role";

grant update on table "public"."group_member" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."group"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "public"."group"
as permissive
for insert
to public
with check (true);


create policy "Enable users to update their own data only"
on "public"."group"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."group"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Create Group Member"
on "public"."group_member"
as permissive
for insert
to public
with check (true);


create policy "Enable delete for users based on user_id"
on "public"."group_member"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."group_member"
as permissive
for select
to public
using (true);



