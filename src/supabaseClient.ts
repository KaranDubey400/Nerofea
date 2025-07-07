import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtopjneotszhuxxbmhxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0b3BqbmVvdHN6aHV4eGJtaHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDYzMzcsImV4cCI6MjA2NzIyMjMzN30.2m3RHKCYvT8WbO0LyT8PkPE2RQ3LS5UP690x1xS8j8M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 