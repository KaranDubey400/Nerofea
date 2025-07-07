'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/supabaseClient';
import { useSupabaseNotes } from '@/hooks/useSupabaseNotes';
import { StudyPlanManager } from '@/components/StudyPlanManager';
import { Bot, Search, Calendar, Sparkles, Loader2 } from 'lucide-react';

export const AIFeatures = () => {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'research' | 'explain' | 'studyplan'>('research');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { createAINote } = useSupabaseNotes();

  const quickActions = useMemo(() => [
    { key: 'research', label: 'Research' },
    { key: 'explain', label: 'Explain' },
    { key: 'studyplan', label: 'Generate Plan' },
  ], []);

  useEffect(() => { setMounted(true); }, []);

  const handleAI = useCallback(async () => {
    if (!prompt.trim() && mode !== 'studyplan') return;
    setLoading(true);
    setResult('');
    try {
      if (mode === 'research') {
        const query = `DSA related: ${prompt}`;
        const response = await supabase.functions.invoke('tavily-search', { body: { query } });
        if (response.error) throw response.error;
        setResult(response.data?.content || 'No resources found.');
      } else if (mode === 'explain') {
        const response = await supabase.functions.invoke('groq-chat', { body: { message: prompt } });
        if (response.error) throw response.error;
        setResult(response.data?.response || 'No explanation found.');
      } else if (mode === 'studyplan') {
        setResult('studyplan');
      }
      if (mode !== 'studyplan') {
        setNotification({ type: 'success', message: 'AI has processed your query successfully!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'AI se answer nahi mila. Please try again!' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [prompt, mode]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-100 min-h-[90vh] rounded-2xl shadow-2xl">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">
                {notification.type === 'success' ? 'Success!' : 'Error'}
              </h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-indigo-500 to-blue-400 text-transparent bg-clip-text">
          Nerofea Assistant
        </h2>
        <p className="text-gray-600">Enhance your notes with AI-powered DSA research, explanations, summaries, and study planning</p>
      </div>
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white/90 shadow-xl border-0 rounded-2xl p-6 mb-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            {quickActions.map(action => (
              <button
                key={action.key}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium transition-all shadow-sm
                  ${mode === action.key
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-400 text-white border-transparent scale-105 shadow-lg'
                    : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'}
                `}
                onClick={() => { setMode(action.key as any); setResult(''); setPrompt(''); }}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
          {mode !== 'studyplan' && (
            <>
              <Textarea
                placeholder={
                  mode === 'research' ? 'What DSA study material do you want? (e.g. best books for graphs)'
                  : 'Type your question, prompt, or request...'
                }
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                className="rounded-lg border-blue-200 focus:ring-2 focus:ring-indigo-400"
                disabled={loading}
              />
              <Button
                type="button"
                onClick={handleAI}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white shadow-lg hover:from-blue-500 hover:to-indigo-400 transition-all mt-2"
              >
                {loading ? 'Processing...' : quickActions.find(a => a.key === mode)?.label || 'Ask AI'}
              </Button>
            </>
          )}
          {/* Result Area */}
          {result && mode !== 'studyplan' && (
            <div className="space-y-3 mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-700">AI Result</span>
              </div>
              <Textarea
                value={result}
                readOnly
                className="min-h-[120px] rounded-lg border-green-200 focus:ring-2 focus:ring-green-400 bg-white/80"
                placeholder="AI generated content will appear here..."
              />
            </div>
          )}
          {mode === 'studyplan' && (
            <div className="mt-4 border-t pt-4">
              <StudyPlanManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
