create table "public"."person_organization" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "person_id" uuid not null,
    "organization_id" uuid not null
);


alter table "public"."person_organization" enable row level security;

CREATE UNIQUE INDEX person_organization_pkey ON public.person_organization USING btree (id);

alter table "public"."person_organization" add constraint "person_organization_pkey" PRIMARY KEY using index "person_organization_pkey";

alter table "public"."person_organization" add constraint "person_organization_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organization(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person_organization" validate constraint "person_organization_organization_id_fkey";

alter table "public"."person_organization" add constraint "person_organization_person_id_fkey" FOREIGN KEY (person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person_organization" validate constraint "person_organization_person_id_fkey";

alter table "public"."person_organization" add constraint "person_organization_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person_organization" validate constraint "person_organization_user_id_fkey";

grant delete on table "public"."person_organization" to "anon";

grant insert on table "public"."person_organization" to "anon";

grant references on table "public"."person_organization" to "anon";

grant select on table "public"."person_organization" to "anon";

grant trigger on table "public"."person_organization" to "anon";

grant truncate on table "public"."person_organization" to "anon";

grant update on table "public"."person_organization" to "anon";

grant delete on table "public"."person_organization" to "authenticated";

grant insert on table "public"."person_organization" to "authenticated";

grant references on table "public"."person_organization" to "authenticated";

grant select on table "public"."person_organization" to "authenticated";

grant trigger on table "public"."person_organization" to "authenticated";

grant truncate on table "public"."person_organization" to "authenticated";

grant update on table "public"."person_organization" to "authenticated";

grant delete on table "public"."person_organization" to "service_role";

grant insert on table "public"."person_organization" to "service_role";

grant references on table "public"."person_organization" to "service_role";

grant select on table "public"."person_organization" to "service_role";

grant trigger on table "public"."person_organization" to "service_role";

grant truncate on table "public"."person_organization" to "service_role";

grant update on table "public"."person_organization" to "service_role";

create policy "Allow anyone to insert"
on "public"."person_organization"
as permissive
for insert
to public
with check (true);


create policy "Enable delete for users based on user_id"
on "public"."person_organization"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable read access for all users"
on "public"."person_organization"
as permissive
for select
to public
using (true);



