-- Create note_links table to store links between notes
CREATE TABLE IF NOT EXISTS public.note_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_note_id UUID NOT NULL,
    target_note_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.note_links 
    ADD CONSTRAINT fk_source_note 
    FOREIGN KEY (source_note_id) 
    REFERENCES public.notes(id) 
    ON DELETE CASCADE;

ALTER TABLE public.note_links 
    ADD CONSTRAINT fk_target_note 
    FOREIGN KEY (target_note_id) 
    REFERENCES public.notes(id) 
    ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;

-- Create policies for note_links table
-- Users can view their own note links
CREATE POLICY "Users can view own note links" ON public.note_links
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own note links
CREATE POLICY "Users can insert own note links" ON public.note_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own note links
CREATE POLICY "Users can delete own note links" ON public.note_links
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS note_links_source_note_id_idx ON public.note_links(source_note_id);
CREATE INDEX IF NOT EXISTS note_links_target_note_id_idx ON public.note_links(target_note_id);
CREATE INDEX IF NOT EXISTS note_links_user_id_idx ON public.note_links(user_id);