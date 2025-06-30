create table "public"."action_plan" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "action_plan" jsonb not null,
    "state" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."action_plan" enable row level security;

CREATE UNIQUE INDEX action_plan_pkey ON public.action_plan USING btree (id);

alter table "public"."action_plan" add constraint "action_plan_pkey" PRIMARY KEY using index "action_plan_pkey";

alter table "public"."action_plan" add constraint "action_plan_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."action_plan" validate constraint "action_plan_user_id_fkey";

grant delete on table "public"."action_plan" to "anon";

grant insert on table "public"."action_plan" to "anon";

grant references on table "public"."action_plan" to "anon";

grant select on table "public"."action_plan" to "anon";

grant trigger on table "public"."action_plan" to "anon";

grant truncate on table "public"."action_plan" to "anon";

grant update on table "public"."action_plan" to "anon";

grant delete on table "public"."action_plan" to "authenticated";

grant insert on table "public"."action_plan" to "authenticated";

grant references on table "public"."action_plan" to "authenticated";

grant select on table "public"."action_plan" to "authenticated";

grant trigger on table "public"."action_plan" to "authenticated";

grant truncate on table "public"."action_plan" to "authenticated";

grant update on table "public"."action_plan" to "authenticated";

grant delete on table "public"."action_plan" to "service_role";

grant insert on table "public"."action_plan" to "service_role";

grant references on table "public"."action_plan" to "service_role";

grant select on table "public"."action_plan" to "service_role";

grant trigger on table "public"."action_plan" to "service_role";

grant truncate on table "public"."action_plan" to "service_role";

grant update on table "public"."action_plan" to "service_role";

create policy "Enable users to CRUD their own data only"
on "public"."action_plan"
as permissive
for all
to authenticated, service_role
using ((( SELECT auth.uid() AS uid) = user_id));



