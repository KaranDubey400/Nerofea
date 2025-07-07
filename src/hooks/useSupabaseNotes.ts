import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import { useUser } from './useUser';

export interface SupabaseNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  status: 'to-revisit' | 'in-progress' | 'mastered';
  links: string[];
  ai_generated: boolean;
  source_api: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useSupabaseNotes = () => {
  const [notes, setNotes] = useState<SupabaseNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SupabaseNote | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }

      // Type cast the data to ensure proper typing
      const typedNotes = (data || []).map(note => ({
        ...note,
        status: note.status as 'to-revisit' | 'in-progress' | 'mastered'
      })) as SupabaseNote[];

      setNotes(typedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(async (folder: string) => {
    if (!user) return null;

    const newNote = {
      title: 'Untitled Note',
      content: '# New Note\n\nStart writing your notes here...',
      tags: [],
      folder,
      status: 'in-progress' as const,
      links: [],
      ai_generated: false,
      source_api: null,
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        return null;
      }

      const typedNote = {
        ...data,
        status: data.status as 'to-revisit' | 'in-progress' | 'mastered'
      } as SupabaseNote;

      setNotes(prev => [typedNote, ...prev]);
      setSelectedNote(typedNote);
      return typedNote;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  }, [user]);

  const updateNote = useCallback(async (updatedNote: SupabaseNote) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: updatedNote.title,
          content: updatedNote.content,
          tags: updatedNote.tags,
          folder: updatedNote.folder,
          status: updatedNote.status,
          links: updatedNote.links,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedNote.id);

      if (error) {
        console.error('Error updating note:', error);
        return;
      }

      setNotes(prev => prev.map(note => 
        note.id === updatedNote.id ? { ...updatedNote, updated_at: new Date().toISOString() } : note
      ));
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting note:', error);
        return;
      }

      setNotes(prev => prev.filter(note => note.id !== noteId));
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, []);

  const createAINote = useCallback(async (title: string, content: string, folder: string, sourceApi: string) => {
    if (!user) return null;

    const newNote = {
      title,
      content,
      tags: ['ai-generated'],
      folder,
      status: 'in-progress' as const,
      links: [],
      ai_generated: true,
      source_api: sourceApi,
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) {
        console.error('Error creating AI note:', error);
        return null;
      }

      const typedNote = {
        ...data,
        status: data.status as 'to-revisit' | 'in-progress' | 'mastered'
      } as SupabaseNote;

      setNotes(prev => [typedNote, ...prev]);
      return typedNote;
    } catch (error) {
      console.error('Error creating AI note:', error);
      return null;
    }
  }, [user]);

  return {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
    createAINote,
    loading,
  };
};
