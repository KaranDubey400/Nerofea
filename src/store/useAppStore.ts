import { create } from 'zustand';
import { supabase } from '@/supabaseClient';
import type { Note } from '@/hooks/useNotes';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Topic {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
}

interface NoteLink {
  id: string;
  source_note_id: string;
  target_note_id: string;
  user_id: string;
  created_at: string;
}

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface Cache {
  notes: CacheEntry<Note[]> | null;
  topics: CacheEntry<Topic[]> | null;
  links: CacheEntry<NoteLink[]> | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AppState {
  // Notes state
  notes: Note[];
  notesLoading: boolean;
  notesError: string | null;
  
  // Topics state
  topics: Topic[];
  topicsLoading: boolean;
  topicsError: string | null;
  
  // Links state
  links: NoteLink[];
  linksLoading: boolean;
  linksError: string | null;
  
  // Selected states
  selectedTopicId: string | null;
  selectedNoteId: string | null;
  
  // Cache
  cache: Cache;
  
  // Actions
  fetchNotes: (topicId?: string, forceRefresh?: boolean) => Promise<void>;
  fetchNoteById: (noteId: string) => Promise<Note | null>;
  fetchTopics: (forceRefresh?: boolean) => Promise<void>;
  fetchLinks: (forceRefresh?: boolean) => Promise<void>;
  
  addNote: (topicId: string, title: string, content: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  
  addTopic: (title: string) => Promise<Topic | null>;
  ensureGeneratedPlansTopicExists: () => Promise<Topic | null>;
  updateTopic: (id: string, title: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  
  setSelectedTopicId: (id: string | null) => void;
  setSelectedNoteId: (id: string | null) => void;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: (key: keyof Cache) => void;
  
  // Graph data
  getGraphData: () => { nodes: any[], links: any[] };
}

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry: CacheEntry<any> | null): boolean => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial states
  notes: [],
  notesLoading: false,
  notesError: null,
  
  topics: [],
  topicsLoading: false,
  topicsError: null,
  
  links: [],
  linksLoading: false,
  linksError: null,
  
  selectedTopicId: null,
  selectedNoteId: null,
  
  cache: {
    notes: null,
    topics: null,
    links: null,
  },
  
  // Fetch notes with caching
  fetchNotes: async (topicId?: string, forceRefresh = false) => {
    const state = get();
    
    // Create specific cache key for topic-specific notes
    const cacheKey = topicId ? `notes-${topicId}` : 'notes-all';
    
    // Check cache first (unless force refresh) - but we need topic-specific caching
    if (!forceRefresh && topicId && state.cache.notes && isCacheValid(state.cache.notes)) {
      // Only use cache if we're fetching the same topic
      const cachedNotes = state.cache.notes.data.filter(note => note.topic_id === topicId);
      set({ notes: cachedNotes, notesLoading: false, notesError: null });
      return;
    }
    
    try {
      set({ notesLoading: true, notesError: null });
      
      let query = supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (topicId) {
        query = query.eq('topic_id', topicId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const notesData = data || [];
      
      // Update cache - but be smarter about topic-specific notes
      set(state => {
        const newCacheData = topicId ? 
          // If fetching specific topic, merge with existing cache
          [...state.cache.notes?.data.filter(note => note.topic_id !== topicId) || [], ...notesData] :
          // If fetching all notes, replace cache completely
          notesData;
        
        return {
          notes: notesData,
          notesLoading: false,
          cache: {
            ...state.cache,
            notes: {
              data: newCacheData,
              timestamp: Date.now()
            }
          }
        };
      });
    } catch (err) {
      console.error('Error fetching notes:', err);
      set({ 
        notesError: err instanceof Error ? err.message : 'Failed to fetch notes',
        notesLoading: false 
      });
    }
  },
  
  // Fetch topics with caching
  fetchTopics: async (forceRefresh = false) => {
    const state = get();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && state.cache.topics && isCacheValid(state.cache.topics)) {
      set({ topics: state.cache.topics.data, topicsLoading: false, topicsError: null });
      return;
    }
    
    try {
      set({ topicsLoading: true, topicsError: null });
      
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      const topicsData = data || [];
      
      // Update cache
      set(state => ({
        topics: topicsData,
        topicsLoading: false,
        cache: {
          ...state.cache,
          topics: {
            data: topicsData,
            timestamp: Date.now()
          }
        }
      }));
    } catch (err) {
      console.error('Error fetching topics:', err);
      set({ 
        topicsError: err instanceof Error ? err.message : 'Failed to fetch topics',
        topicsLoading: false 
      });
    }
  },
  
  // Fetch single note by ID
  fetchNoteById: async (noteId: string) => {
    try {
      // First check if note is already in the store
      const state = get();
      const existingNote = state.notes.find(note => note.id === noteId);
      if (existingNote) {
        return existingNote;
      }
      
      // If not found, fetch from database
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Note not found
          return null;
        }
        throw error;
      }
      
      // Add the note to the store if it's not already there
      if (data && !state.notes.find(note => note.id === data.id)) {
        set(state => ({
          notes: [...state.notes, data],
          cache: {
            ...state.cache,
            notes: null // Invalidate cache since we added a new note
          }
        }));
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching note by ID:', err);
      return null;
    }
  },
  
  // Fetch links with caching
  fetchLinks: async (forceRefresh = false) => {
    const state = get();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && state.cache.links && isCacheValid(state.cache.links)) {
      set({ links: state.cache.links.data, linksLoading: false, linksError: null });
      return;
    }
    
    try {
      set({ linksLoading: true, linksError: null });
      
      const { data, error } = await supabase
        .from('note_links')
        .select('*');
      
      if (error) throw error;
      
      const linksData = data || [];
      
      // Update cache
      set(state => ({
        links: linksData,
        linksLoading: false,
        cache: {
          ...state.cache,
          links: {
            data: linksData,
            timestamp: Date.now()
          }
        }
      }));
    } catch (err) {
      console.error('Error fetching links:', err);
      set({ 
        linksError: err instanceof Error ? err.message : 'Failed to fetch links',
        linksLoading: false 
      });
    }
  },
  
  // Add note with optimistic update
  addNote: async (topicId: string, title: string, content: string) => {
    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      
      // Create optimistic note
      const optimisticNote: Note = {
        id: tempId,
        topic_id: topicId,
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Update UI immediately
      set(state => ({ 
        notes: [optimisticNote, ...state.notes],
        cache: {
          ...state.cache,
          notes: null // Invalidate cache
        }
      }));
      
      // Actually save to database
      const { data, error } = await supabase
        .from('notes')
        .insert([{ 
          topic_id: topicId, 
          title, 
          content,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Process links
      try {
        await supabase.functions.invoke('process-note-links', {
          body: { note: data },
        });
      } catch (functionErr) {
        console.error("Error invoking edge function:", functionErr);
      }
      
      // Replace optimistic note with real one
      set(state => ({
        notes: state.notes.map(note => note.id === tempId ? data : note),
        cache: {
          ...state.cache,
          notes: null // Invalidate cache
        }
      }));
      
      return data;
    } catch (err) {
      console.error('Error adding note:', err);
      
      // Revert optimistic update
      set(state => ({
        notes: state.notes.filter(note => !note.id.startsWith('temp-')),
        cache: {
          ...state.cache,
          notes: null // Invalidate cache
        }
      }));
      
      return null;
    }
  },
  
  // Update note with optimistic update
  updateNote: async (id: string, updates: Partial<Note>) => {
    try {
      // Apply optimistic update
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, ...updates, updated_at: new Date().toISOString() } 
            : note
        ),
        cache: {
          ...state.cache,
          notes: null // Invalidate cache
        }
      }));
      
      // Actually update in database
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Process links if content was updated
      if (updates.content) {
        try {
          await supabase.functions.invoke('process-note-links', {
            body: { note: data },
          });
        } catch (functionErr) {
          console.error("Error invoking edge function:", functionErr);
        }
      }
      
      // Update with actual data from server
      set(state => ({
        notes: state.notes.map(note => note.id === id ? data : note),
        cache: {
          ...state.cache,
          notes: null // Invalidate cache
        }
      }));
      
      return data;
    } catch (err) {
      console.error('Error updating note:', err);
      
      // Revert to original state by re-fetching
      get().fetchNotes(get().selectedTopicId || undefined, true);
      
      return null;
    }
  },
  
  // Delete note
  deleteNote: async (id: string) => {
    try {
      // Optimistic delete
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        cache: {
          ...state.cache,
          notes: null // Invalidate cache
        }
      }));
      
      // Actually delete from database
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting note:', err);
      
      // Revert by re-fetching
      get().fetchNotes(get().selectedTopicId || undefined, true);
    }
  },
  
  // Add topic
  addTopic: async (title: string) => {
    try {
      console.log('Adding topic with title:', title);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }
      
      if (!userData.user) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user found');
      }
      
      console.log('Current user ID:', userData.user.id);
      
      const { data, error } = await supabase
        .from('topics')
        .insert([{ 
          title,
          user_id: userData.user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Topic added successfully:', data);
      
      set(state => ({ 
        topics: [...state.topics, data].sort((a, b) => a.title.localeCompare(b.title)),
        cache: {
          ...state.cache,
          topics: null // Invalidate cache
        }
      }));
      return data;
    } catch (err) {
      console.error('Error adding topic:', err);
      return null;
    }
  },

  // Create or get Generated Plans topic
  ensureGeneratedPlansTopicExists: async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('No authenticated user found');
      }

      // Check if Generated Plans topic already exists
      const { data: existingTopic, error: searchError } = await supabase
        .from('topics')
        .select('*')
        .eq('title', 'Generated Plans')
        .eq('user_id', userData.user.id)
        .single();

      if (!searchError && existingTopic) {
        return existingTopic;
      }

      // Create Generated Plans topic if it doesn't exist
      const { data: newTopic, error: createError } = await supabase
        .from('topics')
        .insert([{ 
          title: 'Generated Plans',
          user_id: userData.user.id
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Update the topics in the store
      set(state => ({ 
        topics: [...state.topics, newTopic].sort((a, b) => a.title.localeCompare(b.title)),
        cache: {
          ...state.cache,
          topics: null // Invalidate cache
        }
      }));

      return newTopic;
    } catch (err) {
      console.error('Error ensuring Generated Plans topic exists:', err);
      return null;
    }
  },
  
  // Update topic
  updateTopic: async (id: string, title: string) => {
    try {
      // Optimistic update
      set(state => ({
        topics: state.topics.map(topic => 
          topic.id === id ? { ...topic, title } : topic
        ),
        cache: {
          ...state.cache,
          topics: null // Invalidate cache
        }
      }));
      
      // Actually update in database
      const { error } = await supabase
        .from('topics')
        .update({ title })
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error updating topic:', err);
      
      // Revert by re-fetching
      get().fetchTopics(true);
    }
  },
  
  // Delete topic
  deleteTopic: async (id: string) => {
    try {
      // Optimistic delete
      set(state => ({
        topics: state.topics.filter(topic => topic.id !== id),
        cache: {
          ...state.cache,
          topics: null // Invalidate cache
        }
      }));
      
      // Actually delete from database
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting topic:', err);
      
      // Revert by re-fetching
      get().fetchTopics(true);
    }
  },
  
  // Set selected topic ID
  setSelectedTopicId: (id: string | null) => {
    set({ selectedTopicId: id });
    if (id) {
      get().fetchNotes(id);
    }
  },
  
  // Set selected note ID
  setSelectedNoteId: (id: string | null) => {
    set({ selectedNoteId: id });
  },
  
  // Clear all cache
  clearCache: () => {
    set(state => ({
      cache: {
        notes: null,
        topics: null,
        links: null,
      }
    }));
  },
  
  // Invalidate specific cache
  invalidateCache: (key: keyof Cache) => {
    set(state => ({
      cache: {
        ...state.cache,
        [key]: null
      }
    }));
  },
  
  // Get graph data
  getGraphData: () => {
    const { notes, links } = get();
    
    const nodes = notes.map(note => ({
      id: note.id,
      name: note.title
    }));
    
    const formattedLinks = links.map(link => ({
      source: link.source_note_id,
      target: link.target_note_id
    }));
    
    return { nodes, links: formattedLinks };
  }
}));