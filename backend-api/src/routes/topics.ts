import express from 'express';
import { supabase } from '../index';

const router = express.Router();

// Get all topics
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = supabase
      .from('topics')
      .select('*')
      .order('title', { ascending: true });
    
    if (userId) {
      query = query.eq('user_id', userId as string);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single topic by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Topic not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new topic
router.post('/', async (req, res) => {
  try {
    const { title, user_id } = req.body;
    
    if (!title || !user_id) {
      return res.status(400).json({ error: 'Title and user_id are required' });
    }
    
    const { data, error } = await supabase
      .from('topics')
      .insert([{ title, user_id }])
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a topic
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const { error } = await supabase
      .from('topics')
      .update({ title })
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Topic not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true, message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Error updating topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a topic
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true, message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 