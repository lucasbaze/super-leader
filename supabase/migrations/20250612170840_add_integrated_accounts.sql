drop policy "Enable users to view their own data only" on "public"."user_profile";

create table "public"."integrated_accounts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "account_id" text,
    "account_name" text not null,
    "account_status" text not null,
    "auth_status" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now()
);


alter table "public"."integrated_accounts" enable row level security;

alter table "public"."person" add column "linkedin_public_id" text;

alter table "public"."person" add column IF NOT EXISTS "title" text;

CREATE UNIQUE INDEX integrated_accounts_pkey ON public.integrated_accounts USING btree (id);

alter table "public"."integrated_accounts" add constraint "integrated_accounts_pkey" PRIMARY KEY using index "integrated_accounts_pkey";

alter table "public"."integrated_accounts" add constraint "integrated_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."integrated_accounts" validate constraint "integrated_accounts_user_id_fkey";

grant delete on table "public"."integrated_accounts" to "anon";

grant insert on table "public"."integrated_accounts" to "anon";

grant references on table "public"."integrated_accounts" to "anon";

grant select on table "public"."integrated_accounts" to "anon";

grant trigger on table "public"."integrated_accounts" to "anon";

grant truncate on table "public"."integrated_accounts" to "anon";

grant update on table "public"."integrated_accounts" to "anon";

grant delete on table "public"."integrated_accounts" to "authenticated";

grant insert on table "public"."integrated_accounts" to "authenticated";

grant references on table "public"."integrated_accounts" to "authenticated";

grant select on table "public"."integrated_accounts" to "authenticated";

grant trigger on table "public"."integrated_accounts" to "authenticated";

grant truncate on table "public"."integrated_accounts" to "authenticated";

grant update on table "public"."integrated_accounts" to "authenticated";

grant delete on table "public"."integrated_accounts" to "service_role";

grant insert on table "public"."integrated_accounts" to "service_role";

grant references on table "public"."integrated_accounts" to "service_role";

grant select on table "public"."integrated_accounts" to "service_role";

grant trigger on table "public"."integrated_accounts" to "service_role";

grant truncate on table "public"."integrated_accounts" to "service_role";

grant update on table "public"."integrated_accounts" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."integrated_accounts"
as permissive
for insert
to authenticated, service_role
with check (true);


create policy "Enable users to update their own data only"
on "public"."integrated_accounts"
as permissive
for update
to authenticated, service_role
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."integrated_accounts"
as permissive
for select
to authenticated, service_role, supabase_admin
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for authenticated users only"
on "public"."user_profile"
as permissive
for insert
to authenticated, service_role
with check (true);


create policy "Enable users to view their own data only"
on "public"."user_profile"
as permissive
for select
to authenticated, service_role
using ((( SELECT auth.uid() AS uid) = user_id));



