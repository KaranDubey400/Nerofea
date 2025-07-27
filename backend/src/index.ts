import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Notes endpoints
app.get('/api/notes', async (req, res) => {
  try {
    const { topicId } = req.query;
    
    let query = supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (topicId) {
      query = query.eq('topic_id', topicId as string);
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

app.post('/api/notes', async (req, res) => {
  try {
    const { topic_id, title, content, user_id } = req.body;
    
    if (!topic_id || !title || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ topic_id, title, content, user_id }])
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Process links
    try {
      await supabase.functions.invoke('process-note-links', {
        body: { note: data },
      });
    } catch (functionErr) {
      console.error("Error invoking edge function:", functionErr);
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
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

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Topics endpoints
app.get('/api/topics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('title', { ascending: true });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const { title, user_id } = req.body;
    
    if (!title || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from('topics')
      .insert([{ title, user_id }])
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Error creating topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/topics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    const { error } = await supabase
      .from('topics')
      .update({ title })
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/topics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Links endpoints
app.get('/api/links', async (req, res) => {
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

// Process links endpoint
app.post('/api/process-links', async (req, res) => {
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
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error processing links:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Graph data endpoint
app.get('/api/graph-data', async (req, res) => {
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/api`);
}); 