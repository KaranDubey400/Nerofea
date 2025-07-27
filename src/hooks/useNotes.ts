import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
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
  const { user } = useUser();
  const {
    notes,
    notesLoading: loading,
    notesError: error,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote
  } = useAppStore();

  // Fetch notes when the component mounts or topicId changes
  useEffect(() => {
    if (user) {
      fetchNotes(topicId);
    }
  }, [user, topicId, fetchNotes]);

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refetch: () => fetchNotes(topicId, true) // Force refresh
  };
} 