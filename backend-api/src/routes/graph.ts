import express from 'express';
import { supabase } from '../index';

const router = express.Router();

// Get graph data
router.get('/data', async (req, res) => {
  try {
    const [notesRes, linksRes] = await Promise.all([
      supabase.from('notes').select('id, title'),
      supabase.from('note_links').select('source_note_id, target_note_id')
    ]);
    
    if (notesRes.error) {
      return res.status(500).json({ error: notesRes.error.message });
    }
    
    if (linksRes.error) {
      return res.status(500).json({ error: linksRes.error.message });
    }
    
    const nodes = (notesRes.data || []).map(note => ({
      id: note.id,
      name: note.title
    }));
    
    const links = (linksRes.data || []).map(link => ({
      source: link.source_note_id,
      target: link.target_note_id
    }));
    
    return res.json({ nodes, links });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 