import express from 'express';
import { supabase } from '../index';
import { validateNote, validateNoteUpdate } from '../middleware/validation';

const router = express.Router();

// Get all notes (with optional topic filter)
router.get('/', async (req, res) => {
  try {
    const { topicId, userId } = req.query;
    
    let query = supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (topicId) {
      query = query.eq('topic_id', topicId as string);
    }
    
    if (userId) {
      query = query.eq('user_id', userId as string);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Note not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error fetching note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
router.post('/', validateNote, async (req, res) => {
  try {
    const { topic_id, title, content, user_id } = req.body;
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ topic_id, title, content, user_id }])
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Process links asynchronously
    try {
      await supabase.functions.invoke('process-note-links', {
        body: { note: data },
      });
    } catch (functionErr) {
      console.error("Error invoking edge function:", functionErr);
    }
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a note
router.put('/:id', validateNoteUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Note not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    
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
    
    return res.json(data);
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { userId } = req.query;
    
    let searchQuery = supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false });
    
    if (userId) {
      searchQuery = searchQuery.eq('user_id', userId as string);
    }
    
    const { data, error } = await searchQuery;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error searching notes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 