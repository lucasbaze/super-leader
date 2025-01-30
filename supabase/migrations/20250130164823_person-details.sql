

-- Create addresses table
CREATE TABLE public.addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    street text NOT NULL,
    city text NOT NULL,
    state text,
    country text NOT NULL,
    is_primary boolean DEFAULT false,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create contact_methods table with text type instead of enum
CREATE TABLE public.contact_methods (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,  -- Changed from enum to text
    value text NOT NULL,
    is_primary boolean DEFAULT false,
    label text,
    is_contact_method boolean DEFAULT true,
    platform_icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Modify websites table to include updated_at
CREATE TABLE public.websites (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url text NOT NULL,
    icon text,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL  -- Added updated_at
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_addresses_person_id ON public.addresses(person_id);
CREATE INDEX idx_contact_methods_person_id ON public.contact_methods(person_id);
CREATE INDEX idx_websites_person_id ON public.websites(person_id);

-- Create RLS policies for addresses
CREATE POLICY "Users can view their own addresses"
    ON public.addresses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
    ON public.addresses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
    ON public.addresses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
    ON public.addresses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for contact_methods
CREATE POLICY "Users can view their own contact methods"
    ON public.contact_methods
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact methods"
    ON public.contact_methods
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact methods"
    ON public.contact_methods
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact methods"
    ON public.contact_methods
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for websites
CREATE POLICY "Users can view their own website entries"
    ON public.websites
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own website entries"
    ON public.websites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own website entries"
    ON public.websites
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own website entries"
    ON public.websites
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_methods_updated_at
    BEFORE UPDATE ON public.contact_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for websites updated_at
CREATE TRIGGER update_websites_updated_at
    BEFORE UPDATE ON public.websites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at to existing messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- Create trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at to existing person table if not exists
ALTER TABLE public.person 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- Create trigger for person updated_at
CREATE TRIGGER update_person_updated_at
    BEFORE UPDATE ON public.person
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
