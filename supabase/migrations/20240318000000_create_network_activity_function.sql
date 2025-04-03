-- Create a function to get network activity by period
CREATE OR REPLACE FUNCTION get_network_activity_by_period(
  p_user_id UUID,
  p_days INTEGER,
  p_offset INTEGER,
  p_core_group_slugs TEXT[]
)
RETURNS TABLE (
  date DATE,
  inner5 INTEGER,
  central50 INTEGER,
  strategic100 INTEGER,
  everyone INTEGER
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Calculate date range
  v_end_date := CURRENT_DATE - p_offset;
  v_start_date := v_end_date - p_days + 1;

  RETURN QUERY
  WITH daily_activity AS (
    SELECT
      DATE(i.created_at) as activity_date,
      CASE 
        WHEN g.slug = p_core_group_slugs[1] THEN 1 ELSE 0
      END as is_inner5,
      CASE 
        WHEN g.slug = p_core_group_slugs[2] THEN 1 ELSE 0
      END as is_central50,
      CASE 
        WHEN g.slug = p_core_group_slugs[3] THEN 1 ELSE 0
      END as is_strategic100,
      CASE 
        WHEN g.slug IS NULL THEN 1 ELSE 0
      END as is_everyone
    FROM interactions i
    LEFT JOIN group_member gm ON i.person_id = gm.person_id
    LEFT JOIN "group" g ON gm.group_id = g.id
    WHERE i.user_id = p_user_id
    AND DATE(i.created_at) BETWEEN v_start_date AND v_end_date
  )
  SELECT
    generate_series(v_start_date, v_end_date, '1 day'::interval)::DATE as date,
    COALESCE(SUM(is_inner5), 0) as inner5,
    COALESCE(SUM(is_central50), 0) as central50,
    COALESCE(SUM(is_strategic100), 0) as strategic100,
    COALESCE(SUM(is_everyone), 0) as everyone
  FROM daily_activity
  GROUP BY generate_series(v_start_date, v_end_date, '1 day'::interval)::DATE
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 