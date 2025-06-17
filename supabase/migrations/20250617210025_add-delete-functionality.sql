create policy "Enable delete for users based on user_id"
on "public"."person"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));



