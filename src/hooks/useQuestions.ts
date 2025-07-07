import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/supabaseClient';

export interface Question {
  id: number;
  number: number;
  title: string;
  difficulty: string;
  topic: string;
  estimated_time?: string;
  url?: string;
  week?: number;
}

// Global cache to persist questions across component mounts
let questionsCache: Question[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>(questionsCache || []);
  const [loading, setLoading] = useState(!questionsCache);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fetchingRef = useRef(false);
  const maxRetries = 3; // Increased retry attempts

  const fetchQuestions = useCallback(async (retryAttempt = 0) => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    
    // Check if we have valid cache
    const now = Date.now();
    if (questionsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      setQuestions(questionsCache);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching questions from database... (attempt ${retryAttempt + 1})`);
      
      // Increased timeout to 10 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('week', { ascending: true })
        .order('number', { ascending: true })
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      console.log('Database response:', { data, error, count: data?.length });
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No questions found in database');
      }
      
      // Update cache
      questionsCache = data;
      cacheTimestamp = Date.now();
      setQuestions(questionsCache);
      setRetryCount(0);
      console.log('Questions loaded successfully:', questionsCache.length);
      
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      
      // If this is not the last retry attempt, try again
      if (retryAttempt < maxRetries - 1) {
        setRetryCount(retryAttempt + 1);
        setTimeout(() => {
          fetchingRef.current = false;
          fetchQuestions(retryAttempt + 1);
        }, 1000 * (retryAttempt + 1)); // Exponential backoff
        return;
      }
      
      // If all retries failed, show error instead of using mock data
      console.error('All retry attempts failed');
      setError(`Failed to load questions after ${maxRetries} attempts. Please refresh the page.`);
      setQuestions([]);
      
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Function to manually refresh questions
  const refreshQuestions = useCallback(async () => {
    questionsCache = null;
    cacheTimestamp = null;
    setRetryCount(0);
    setError(null);
    await fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, error, refreshQuestions, retryCount };
}
