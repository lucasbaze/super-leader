create table "public"."organization" (
    "name" text not null,
    "url" text,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "description" text,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."organization" enable row level security;

alter table "public"."user_context" drop column "processed";

CREATE UNIQUE INDEX organization_pkey ON public.organization USING btree (id);

alter table "public"."organization" add constraint "organization_pkey" PRIMARY KEY using index "organization_pkey";

alter table "public"."organization" add constraint "organization_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."organization" validate constraint "organization_user_id_fkey";

grant delete on table "public"."organization" to "anon";

grant insert on table "public"."organization" to "anon";

grant references on table "public"."organization" to "anon";

grant select on table "public"."organization" to "anon";

grant trigger on table "public"."organization" to "anon";

grant truncate on table "public"."organization" to "anon";

grant update on table "public"."organization" to "anon";

grant delete on table "public"."organization" to "authenticated";

grant insert on table "public"."organization" to "authenticated";

grant references on table "public"."organization" to "authenticated";

grant select on table "public"."organization" to "authenticated";

grant trigger on table "public"."organization" to "authenticated";

grant truncate on table "public"."organization" to "authenticated";

grant update on table "public"."organization" to "authenticated";

grant delete on table "public"."organization" to "service_role";

grant insert on table "public"."organization" to "service_role";

grant references on table "public"."organization" to "service_role";

grant select on table "public"."organization" to "service_role";

grant trigger on table "public"."organization" to "service_role";

grant truncate on table "public"."organization" to "service_role";

grant update on table "public"."organization" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."organization"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for authenticated users only"
on "public"."organization"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable users to update their own data only"
on "public"."organization"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."organization"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Update their own data"
on "public"."user_context"
as permissive
for update
to authenticated, service_role
using ((( SELECT auth.uid() AS uid) = user_id));



