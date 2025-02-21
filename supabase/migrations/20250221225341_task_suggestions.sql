create table "public"."task_suggestion" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "person_id" uuid not null,
    "type" text not null,
    "content" json not null,
    "end_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "skipped_at" timestamp with time zone,
    "snoozed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."task_suggestion" enable row level security;

CREATE UNIQUE INDEX task_suggestion_pkey ON public.task_suggestion USING btree (id);

alter table "public"."task_suggestion" add constraint "task_suggestion_pkey" PRIMARY KEY using index "task_suggestion_pkey";

alter table "public"."task_suggestion" add constraint "task_suggestion_person_id_fkey" FOREIGN KEY (person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."task_suggestion" validate constraint "task_suggestion_person_id_fkey";

alter table "public"."task_suggestion" add constraint "task_suggestion_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."task_suggestion" validate constraint "task_suggestion_user_id_fkey";

grant delete on table "public"."task_suggestion" to "anon";

grant insert on table "public"."task_suggestion" to "anon";

grant references on table "public"."task_suggestion" to "anon";

grant select on table "public"."task_suggestion" to "anon";

grant trigger on table "public"."task_suggestion" to "anon";

grant truncate on table "public"."task_suggestion" to "anon";

grant update on table "public"."task_suggestion" to "anon";

grant delete on table "public"."task_suggestion" to "authenticated";

grant insert on table "public"."task_suggestion" to "authenticated";

grant references on table "public"."task_suggestion" to "authenticated";

grant select on table "public"."task_suggestion" to "authenticated";

grant trigger on table "public"."task_suggestion" to "authenticated";

grant truncate on table "public"."task_suggestion" to "authenticated";

grant update on table "public"."task_suggestion" to "authenticated";

grant delete on table "public"."task_suggestion" to "service_role";

grant insert on table "public"."task_suggestion" to "service_role";

grant references on table "public"."task_suggestion" to "service_role";

grant select on table "public"."task_suggestion" to "service_role";

grant trigger on table "public"."task_suggestion" to "service_role";

grant truncate on table "public"."task_suggestion" to "service_role";

grant update on table "public"."task_suggestion" to "service_role";

create policy "Anyone can delete"
on "public"."task_suggestion"
as permissive
for delete
to public
using (true);


create policy "Anyone can insert tasks"
on "public"."task_suggestion"
as permissive
for insert
to public
with check (true);


create policy "Anyone can update tasks"
on "public"."task_suggestion"
as permissive
for update
to public
using (true);


create policy "Anyone can view tasks"
on "public"."task_suggestion"
as permissive
for select
to public
using (true);



