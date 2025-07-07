-- Create study_plans table to store AI-generated study plans
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    days INTEGER NOT NULL DEFAULT 30,
    level TEXT NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on study_plans
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for study_plans table
-- Users can view their own study plans
CREATE POLICY "Users can view own study plans" ON public.study_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own study plans
CREATE POLICY "Users can insert own study plans" ON public.study_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own study plans
CREATE POLICY "Users can update own study plans" ON public.study_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own study plans
CREATE POLICY "Users can delete own study plans" ON public.study_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for study_plans
CREATE OR REPLACE TRIGGER handle_study_plans_updated_at
    BEFORE UPDATE ON public.study_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS study_plans_user_id_idx ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS study_plans_created_at_idx ON public.study_plans(created_at);
