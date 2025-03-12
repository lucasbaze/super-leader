-- Custom Fields Migration

-- Custom Field Definitions
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'person' or 'group'
    group_id UUID NULL REFERENCES "group"(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    -- Ensure unique names per context
    UNIQUE (name, entity_type, group_id, user_id)
);

-- Custom Field Options (for dropdowns and multi-select)
CREATE TABLE custom_field_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    -- Ensure unique values per field
    UNIQUE (custom_field_id, value)
);

-- Custom Field Values
CREATE TABLE custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- References either person.id or group.id
    value TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Ensure one value per entity per field
    UNIQUE (custom_field_id, entity_id)
);

-- Enable RLS
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_custom_fields_user_id ON custom_fields(user_id);
CREATE INDEX idx_custom_fields_group_id ON custom_fields(group_id);
CREATE INDEX idx_custom_field_options_field_id ON custom_field_options(custom_field_id);
CREATE INDEX idx_custom_field_values_field_id ON custom_field_values(custom_field_id);
CREATE INDEX idx_custom_field_values_entity_id ON custom_field_values(entity_id);

-- Custom Fields RLS policies
CREATE POLICY "Users can view their own custom fields"
    ON custom_fields FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom fields"
    ON custom_fields FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom fields"
    ON custom_fields FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom fields"
    ON custom_fields FOR DELETE
    USING (auth.uid() = user_id);

-- Custom Field Options RLS policies
CREATE POLICY "Users can view their own custom field options"
    ON custom_field_options FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom field options"
    ON custom_field_options FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom field options"
    ON custom_field_options FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom field options"
    ON custom_field_options FOR DELETE
    USING (auth.uid() = user_id);

-- Custom Field Values RLS policies
CREATE POLICY "Users can view their own custom field values"
    ON custom_field_values FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom field values"
    ON custom_field_values FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom field values"
    ON custom_field_values FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom field values"
    ON custom_field_values FOR DELETE
    USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_custom_fields_updated_at
    BEFORE UPDATE ON custom_fields
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_field_options_updated_at
    BEFORE UPDATE ON custom_field_options
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at
    BEFORE UPDATE ON custom_field_values
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();