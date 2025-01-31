create or replace function update_person_details(
  p_person_id uuid,
  p_bio text,
  p_contact_methods jsonb,
  p_addresses jsonb,
  p_websites jsonb
) returns void language plpgsql security definer as $$
declare
  v_user_id uuid;
begin
  -- Get the user_id from the person record
  select user_id into v_user_id from person where id = p_person_id;
  
  -- Update person bio
  update person
  set bio = p_bio,
      updated_at = now()
  where id = p_person_id;
  
  -- Handle contact methods
  -- First delete any contact methods not in the new list
  delete from contact_methods
  where person_id = p_person_id
  and (
    p_contact_methods is null 
    or id not in (
      select (value->>'id')::uuid
      from jsonb_array_elements(p_contact_methods)
      where value->>'id' is not null
    )
  );

  -- Then update or insert contact methods
  if p_contact_methods is not null and jsonb_array_length(p_contact_methods) > 0 then
    with new_contacts as (
      select *
      from jsonb_to_recordset(p_contact_methods) as x(
        id uuid,
        type text,
        value text,
        label text,
        is_primary boolean
      )
    )
    merge into contact_methods cm
    using new_contacts nc
    on cm.id = nc.id
    when matched then
      update set
        type = nc.type,
        value = nc.value,
        label = nc.label,
        is_primary = nc.is_primary,
        updated_at = now()
    when not matched then
      insert (person_id, type, value, label, is_primary, user_id)
      values (p_person_id, nc.type, nc.value, nc.label, nc.is_primary, v_user_id);
  end if;

  -- Handle addresses
  -- First delete addresses not in the new list
  delete from addresses
  where person_id = p_person_id
  and (
    p_addresses is null 
    or id not in (
      select (value->>'id')::uuid
      from jsonb_array_elements(p_addresses)
      where value->>'id' is not null
    )
  );

  -- Then update or insert addresses
  if p_addresses is not null and jsonb_array_length(p_addresses) > 0 then
    with new_addresses as (
      select *
      from jsonb_to_recordset(p_addresses) as x(
        id uuid,
        street text,
        city text,
        state text,
        country text,
        label text,
        is_primary boolean
      )
    )
    merge into addresses a
    using new_addresses na
    on a.id = na.id
    when matched then
      update set
        street = na.street,
        city = na.city,
        state = na.state,
        country = na.country,
        label = na.label,
        is_primary = na.is_primary,
        updated_at = now()
    when not matched then
      insert (person_id, street, city, state, country, label, is_primary, user_id)
      values (p_person_id, na.street, na.city, na.state, na.country, na.label, na.is_primary, v_user_id);
  end if;

  -- Handle websites
  -- First delete websites not in the new list
  delete from websites
  where person_id = p_person_id
  and (
    p_websites is null 
    or id not in (
      select (value->>'id')::uuid
      from jsonb_array_elements(p_websites)
      where value->>'id' is not null
    )
  );

  -- Then update or insert websites
  if p_websites is not null and jsonb_array_length(p_websites) > 0 then
    with new_websites as (
      select *
      from jsonb_to_recordset(p_websites) as x(
        id uuid,
        url text,
        label text
      )
    )
    merge into websites w
    using new_websites nw
    on w.id = nw.id
    when matched then
      update set
        url = nw.url,
        label = nw.label,
        updated_at = now()
    when not matched then
      insert (person_id, url, label, user_id)
      values (p_person_id, nw.url, nw.label, v_user_id);
  end if;
end;
$$; 