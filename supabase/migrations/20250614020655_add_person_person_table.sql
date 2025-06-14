create table "public"."person_person_relation" (
    "id" uuid not null default gen_random_uuid(),
    "node_person_id" uuid not null,
    "edge_person_id" uuid not null,
    "relation" text,
    "note" text,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null
);


alter table "public"."person_person_relation" enable row level security;

alter table "public"."user_profile" add column "avatar_url" text;

CREATE UNIQUE INDEX people_relations_pkey ON public.person_person_relation USING btree (id);

CREATE UNIQUE INDEX unique_person_person_pair ON public.person_person_relation USING btree (node_person_id, edge_person_id);

alter table "public"."person_person_relation" add constraint "people_relations_pkey" PRIMARY KEY using index "people_relations_pkey";

alter table "public"."person_person_relation" add constraint "people_relations_edge_person_id_fkey" FOREIGN KEY (edge_person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person_person_relation" validate constraint "people_relations_edge_person_id_fkey";

alter table "public"."person_person_relation" add constraint "people_relations_node_person_id_fkey" FOREIGN KEY (node_person_id) REFERENCES person(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person_person_relation" validate constraint "people_relations_node_person_id_fkey";

alter table "public"."person_person_relation" add constraint "person_person_relation_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."person_person_relation" validate constraint "person_person_relation_user_id_fkey";

alter table "public"."person_person_relation" add constraint "unique_person_person_pair" UNIQUE using index "unique_person_person_pair";

grant delete on table "public"."person_person_relation" to "anon";

grant insert on table "public"."person_person_relation" to "anon";

grant references on table "public"."person_person_relation" to "anon";

grant select on table "public"."person_person_relation" to "anon";

grant trigger on table "public"."person_person_relation" to "anon";

grant truncate on table "public"."person_person_relation" to "anon";

grant update on table "public"."person_person_relation" to "anon";

grant delete on table "public"."person_person_relation" to "authenticated";

grant insert on table "public"."person_person_relation" to "authenticated";

grant references on table "public"."person_person_relation" to "authenticated";

grant select on table "public"."person_person_relation" to "authenticated";

grant trigger on table "public"."person_person_relation" to "authenticated";

grant truncate on table "public"."person_person_relation" to "authenticated";

grant update on table "public"."person_person_relation" to "authenticated";

grant delete on table "public"."person_person_relation" to "service_role";

grant insert on table "public"."person_person_relation" to "service_role";

grant references on table "public"."person_person_relation" to "service_role";

grant select on table "public"."person_person_relation" to "service_role";

grant trigger on table "public"."person_person_relation" to "service_role";

grant truncate on table "public"."person_person_relation" to "service_role";

grant update on table "public"."person_person_relation" to "service_role";

create policy "Enable users to CRUD their own data only"
on "public"."person_person_relation"
as permissive
for all
to authenticated, service_role
using ((( SELECT auth.uid() AS uid) = user_id));



