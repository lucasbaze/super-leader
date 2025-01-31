-- Example for the person table
ALTER POLICY "Enable read access for authenticated users" ON "public"."person"
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

ALTER POLICY "Enable write access for authenticated users" ON "public"."person"
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Repeat for other tables as needed 