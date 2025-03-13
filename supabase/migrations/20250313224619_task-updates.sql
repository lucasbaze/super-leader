alter table "public"."custom_field_options" add column "description" text;

alter table "public"."custom_fields" add column "field_description" text;

alter table "public"."custom_fields" add column "permanent" boolean not null default false;

alter table "public"."task_suggestion" add column "bad_suggestion" boolean;

alter table "public"."task_suggestion" add column "bad_suggestion_reason" text;


