drop policy "Enable users to view their own data only" on "public"."interactions";

create policy "Enable users to view their own data only"
on "public"."interactions"
as permissive
for select
to public
using (true);



