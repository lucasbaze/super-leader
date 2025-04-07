set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_network_activity_by_period(p_user_id uuid, p_days integer, p_offset integer, p_core_group_slugs text[], p_timezone text DEFAULT 'UTC'::text)
 RETURNS TABLE(date date, inner5 bigint, central50 bigint, strategic100 bigint, everyone bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Convert current timestamp to user's timezone before date operations
  v_end_date := (CURRENT_TIMESTAMP AT TIME ZONE p_timezone)::date - (p_offset || ' days')::interval;
  v_start_date := v_end_date - ((p_days - 1) || ' days')::interval;

  RETURN QUERY
  WITH all_days AS (
    SELECT generate_series(v_start_date, v_end_date, '1 day')::date AS date
  ),
  prioritized_interactions AS (
    SELECT
      i.id AS interaction_id,
      (i.created_at AT TIME ZONE p_timezone)::date AS interaction_date,
      CASE
        WHEN g.slug = p_core_group_slugs[1] THEN 1
        WHEN g.slug = p_core_group_slugs[2] THEN 2
        WHEN g.slug = p_core_group_slugs[3] THEN 3
        ELSE 4
      END AS group_priority,
      COALESCE(g.slug, 'everyone') AS group_slug
    FROM interactions i
    LEFT JOIN group_member gm ON i.person_id = gm.person_id
    LEFT JOIN "group" g ON gm.group_id = g.id
    WHERE i.user_id = p_user_id
      AND (i.created_at AT TIME ZONE p_timezone)::date BETWEEN v_start_date AND v_end_date
  ),
  ranked_interactions AS (
    SELECT
      interaction_id,
      interaction_date,
      group_slug,
      ROW_NUMBER() OVER (
        PARTITION BY interaction_id
        ORDER BY group_priority
      ) AS rn
    FROM prioritized_interactions
  ),
  deduped AS (
    SELECT
      interaction_date,
      CASE
        WHEN group_slug = p_core_group_slugs[1] THEN 'inner5'
        WHEN group_slug = p_core_group_slugs[2] THEN 'central50'
        WHEN group_slug = p_core_group_slugs[3] THEN 'strategic100'
        ELSE 'everyone'
      END AS group_category
    FROM ranked_interactions
    WHERE rn = 1
  ),
  grouped_counts AS (
    SELECT
      interaction_date AS date,
      group_category,
      COUNT(*) AS count
    FROM deduped
    GROUP BY interaction_date, group_category
  )
    SELECT
    d.date,
    COALESCE(SUM(CASE WHEN gc.group_category = 'inner5' THEN gc.count END), 0)::BIGINT AS inner5,
    COALESCE(SUM(CASE WHEN gc.group_category = 'central50' THEN gc.count END), 0)::BIGINT AS central50,
    COALESCE(SUM(CASE WHEN gc.group_category = 'strategic100' THEN gc.count END), 0)::BIGINT AS strategic100,
    COALESCE(SUM(CASE WHEN gc.group_category = 'everyone' THEN gc.count END), 0)::BIGINT AS everyone
  FROM all_days d
  LEFT JOIN grouped_counts gc ON d.date = gc.date
  GROUP BY d.date
  ORDER BY d.date;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_people_needing_follow_up(p_user_id uuid, p_group_id uuid, p_date timestamp with time zone)
 RETURNS TABLE(id uuid, first_name text, last_name text, user_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.id, p.first_name, p.last_name, p.user_id
  FROM person p
  JOIN group_member gm ON p.id = gm.person_id
  LEFT JOIN interactions i ON p.id = i.person_id
  WHERE p.user_id = p_user_id
    AND gm.group_id = p_group_id
    AND (
      i.id IS NULL 
      OR NOT EXISTS (
        SELECT 1 
        FROM interactions i2 
        WHERE i2.person_id = p.id 
        AND i2.created_at > p_date
      )
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_todays_network_activity(p_user_id uuid, p_core_group_slugs text[], p_timezone text DEFAULT 'UTC'::text)
 RETURNS TABLE(group_name text, interaction_count bigint, people jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_today DATE;
BEGIN
  -- Get today's date in user's timezone
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE p_timezone)::date;

  RETURN QUERY
  WITH today_interactions AS (
    SELECT
      i.id AS interaction_id,
      p.first_name,
      p.last_name,
      CASE
        WHEN g.slug = p_core_group_slugs[1] THEN 1
        WHEN g.slug = p_core_group_slugs[2] THEN 2
        WHEN g.slug = p_core_group_slugs[3] THEN 3
        ELSE 4
      END AS group_priority,
      COALESCE(g.slug, 'everyone') AS group_slug
    FROM interactions i
    JOIN person p ON i.person_id = p.id
    LEFT JOIN group_member gm ON i.person_id = gm.person_id
    LEFT JOIN "group" g ON gm.group_id = g.id
    WHERE i.user_id = p_user_id
      AND (i.created_at AT TIME ZONE p_timezone)::date = v_today
  ),
  ranked_interactions AS (
    SELECT
      interaction_id,
      first_name,
      last_name,
      group_slug,
      ROW_NUMBER() OVER (
        PARTITION BY interaction_id
        ORDER BY group_priority
      ) AS rn
    FROM today_interactions
  ),
  categorized_interactions AS (
    SELECT
      CASE
        WHEN group_slug = p_core_group_slugs[1] THEN 'inner5'
        WHEN group_slug = p_core_group_slugs[2] THEN 'central50'
        WHEN group_slug = p_core_group_slugs[3] THEN 'strategic100'
        ELSE 'everyone'
      END AS group_name,
      first_name,
      last_name
    FROM ranked_interactions
    WHERE rn = 1
  )
  SELECT
    ci.group_name,
    COUNT(*)::bigint as interaction_count,
    jsonb_agg(
      jsonb_build_object(
        'name', ci.first_name || ' ' || ci.last_name
      )
    ) as people
  FROM categorized_interactions ci
  GROUP BY ci.group_name
  ORDER BY 
    CASE ci.group_name
      WHEN 'inner5' THEN 1
      WHEN 'central50' THEN 2
      WHEN 'strategic100' THEN 3
      ELSE 4
    END;

END;
$function$
;


