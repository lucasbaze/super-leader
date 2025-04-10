alter table "public"."suggestions" add column "topic" text not null;

set check_function_bodies = off;

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
      p.id AS person_id,
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
      person_id,
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
      person_id,
      first_name,
      last_name
    FROM ranked_interactions
    WHERE rn = 1
  ),
  interaction_counts AS (
    SELECT
      ci.group_name,
      COUNT(*)::bigint as interaction_count
    FROM categorized_interactions ci
    GROUP BY ci.group_name
  ),
  unique_people AS (
    SELECT
      ci.group_name,
      ci.person_id,
      ci.first_name,
      ci.last_name
    FROM categorized_interactions ci
    GROUP BY ci.group_name, ci.person_id, ci.first_name, ci.last_name
  )
  SELECT
    ic.group_name,
    ic.interaction_count,
    jsonb_agg(
      jsonb_build_object(
        'name', up.first_name || ' ' || up.last_name
      )
    ) as people
  FROM interaction_counts ic
  JOIN unique_people up ON ic.group_name = up.group_name
  GROUP BY ic.group_name, ic.interaction_count
  ORDER BY 
    CASE ic.group_name
      WHEN 'inner5' THEN 1
      WHEN 'central50' THEN 2
      WHEN 'strategic100' THEN 3
      ELSE 4
    END;

END;
$function$
;


