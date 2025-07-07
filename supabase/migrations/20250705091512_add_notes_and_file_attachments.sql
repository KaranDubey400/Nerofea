-- Create topics table to store user topics
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create policies for topics table
-- Users can view their own topics
CREATE POLICY "Users can view own topics" ON public.topics
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own topics
CREATE POLICY "Users can insert own topics" ON public.topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own topics
CREATE POLICY "Users can update own topics" ON public.topics
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own topics
CREATE POLICY "Users can delete own topics" ON public.topics
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at for topics
CREATE OR REPLACE TRIGGER handle_topics_updated_at
    BEFORE UPDATE ON public.topics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS topics_user_id_idx ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS topics_created_at_idx ON public.topics(created_at);

-- Create notes table to store user notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes table
-- Users can view their own notes
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at for notes
CREATE OR REPLACE TRIGGER handle_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_topic_id_idx ON public.notes(topic_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at);

-- Create note_attachments table to store file attachments for notes
CREATE TABLE IF NOT EXISTS public.note_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on note_attachments
ALTER TABLE public.note_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for note_attachments table
-- Users can view their own note attachments
CREATE POLICY "Users can view own note attachments" ON public.note_attachments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own note attachments
CREATE POLICY "Users can insert own note attachments" ON public.note_attachments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own note attachments
CREATE POLICY "Users can update own note attachments" ON public.note_attachments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own note attachments
CREATE POLICY "Users can delete own note attachments" ON public.note_attachments
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS note_attachments_note_id_idx ON public.note_attachments(note_id);
CREATE INDEX IF NOT EXISTS note_attachments_user_id_idx ON public.note_attachments(user_id);
CREATE INDEX IF NOT EXISTS note_attachments_created_at_idx ON public.note_attachments(created_at);

-- Create storage bucket for note attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('note-attachments', 'note-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for note attachments bucket
CREATE POLICY "Users can upload their own note attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'note-attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own note attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'note-attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own note attachments" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'note-attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own note attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'note-attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    ); 