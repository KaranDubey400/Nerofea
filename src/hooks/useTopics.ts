import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useUser } from './useUser';

export interface Topic {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch topics
  const fetchTopics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  // Add new topic
  const addTopic = async (title: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert([{ title, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTopics(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add topic');
      throw err;
    }
  };

  // Update topic
  const updateTopic = async (id: string, title: string) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update({ title })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTopics(prev => prev.map(topic => topic.id === id ? data : topic));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic');
      throw err;
    }
  };

  // Delete topic
  const deleteTopic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTopics(prev => prev.filter(topic => topic.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
      throw err;
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [user]);

  return {
    topics,
    loading,
    error,
    addTopic,
    updateTopic,
    deleteTopic,
    refetch: fetchTopics
  };
} 