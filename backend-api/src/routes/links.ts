import express from 'express';
import { supabase } from '../index';

const router = express.Router();

// Get all links
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('note_links')
      .select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching links:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Process links for a note
router.post('/process', async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({ error: 'Note data is required' });
    }
    
    const { error } = await supabase.functions.invoke('process-note-links', {
      body: { note },
    });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true, message: 'Links processed successfully' });
  } catch (error) {
    console.error('Error processing links:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 