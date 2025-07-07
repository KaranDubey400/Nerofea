import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useUser } from './useUser';

export interface Note {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(topicId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch notes for a specific topic
  const fetchNotes = async (topicId?: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (topicId) {
        query = query.eq('topic_id', topicId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  // Add new note
  const addNote = async (topicId: string, title: string, content: string = '') => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ 
          topic_id: topicId, 
          title, 
          content, 
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
      throw err;
    }
  };

  // Update note
  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => prev.map(note => note.id === id ? data : note));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  useEffect(() => {
    fetchNotes(topicId);
  }, [user, topicId]);

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refetch: () => fetchNotes(topicId)
  };
} 