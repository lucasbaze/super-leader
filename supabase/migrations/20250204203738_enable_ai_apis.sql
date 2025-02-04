drop policy "Enable users to view their own data only" on "public"."person";

drop policy "Enable insert for users based on user_id" on "public"."interactions";

alter table "public"."interactions" drop constraint "interactions_user_id_fkey";

alter table "public"."interactions" add constraint "interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."interactions" validate constraint "interactions_user_id_fkey";

create policy "Enable delete for users based on user_id"
on "public"."interactions"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."interactions"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "ISSUE: Enable anyone to view"
on "public"."person"
as permissive
for select
to public
using (true);


create policy "Enable insert for users based on user_id"
on "public"."interactions"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



