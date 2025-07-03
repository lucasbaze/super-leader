alter table "public"."waitlist" add column "enabled" boolean not null default false;

create policy "Anyone can check status"
on "public"."waitlist"
as permissive
for select
to public
using (true);



