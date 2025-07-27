import express from 'express';
import { supabase } from '../index';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { user } = req.query;
    
    if (!user) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user as string)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 