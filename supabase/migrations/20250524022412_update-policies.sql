drop policy "Allow anyone to insert" on "public"."person_organization";

drop policy "Enable read access for all users" on "public"."person_organization";

create policy "Enable insert for users based on user_id"
on "public"."person_organization"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."person_organization"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



