import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/supabaseClient';
import { Bot, X, Loader2, Search, MessageSquare } from 'lucide-react';

const QuestionsSidebar: React.FC = () => {
  const router = useRouter();
  
  // AI Assistant state
  const [showAI, setShowAI] = useState(false);
  const [aiMode, setAiMode] = useState<'research' | 'explain'>('explain');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  
  // Dummy data for now
  const weeks = 1;
  const hoursPerWeek = 40;
  const totalQuestions = 100;
  const totalHours = 40;
  const easyCount = 41;
  const mediumCount = 59;
  const topics = [
    { name: 'Array', count: 15 },
    { name: 'Stack', count: 6 },
    { name: 'Linked List', count: 8 },
    { name: 'String', count: 9 },
    { name: 'Binary Tree', count: 11 },
    { name: 'Binary Search', count: 4 },
    { name: 'Graph', count: 13 },
    { name: 'Binary Search Tree', count: 4 },
    { name: 'Hash Table', count: 1 },
    { name: 'Dynamic Programming', count: 8 },
    { name: 'Binary', count: 7 },
    { name: 'Math', count: 2 },
    { name: 'Heap', count: 3 },
    { name: 'Trie', count: 3 },
    { name: 'Recursion', count: 4 },
    { name: 'Matrix', count: 2 },
  ];
  
  // AI Assistant handlers
  const handleAISubmit = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    setAiResult('');
    
    try {
      if (aiMode === 'research') {
        const query = `DSA coding problem help: ${aiPrompt}`;
        const response = await supabase.functions.invoke('tavily-search', { body: { query } });
        if (response.error) throw response.error;
        setAiResult(response.data?.content || 'No resources found.');
      } else if (aiMode === 'explain') {
        const response = await supabase.functions.invoke('groq-chat', { 
          body: { message: `Help me with this DSA problem: ${aiPrompt}` } 
        });
        if (response.error) throw response.error;
        setAiResult(response.data?.response || 'No explanation found.');
      }
    } catch (err: any) {
      setAiResult('Error: ' + (err?.message || 'Failed to get AI response. Please try again.'));
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, aiMode]);
  
  const toggleAI = () => {
    setShowAI(!showAI);
    if (!showAI) {
      // Reset state when opening
      setAiPrompt('');
      setAiResult('');
    }
  };

  return (
    <>
      {/* Main Sidebar Container */}
      <aside className="w-full h-fit sticky top-3">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
          {/* Home Button */}
          <button 
            className="mb-3 text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            ← Home
          </button>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Customize Plan</h2>
            <button 
              onClick={toggleAI}
              className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium transition-all ${
                showAI 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                  : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600'
              }`}
            >
              {showAI ? <X className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              {showAI ? 'AI Help' : 'AI Help'}
            </button>
          </div>
          
          {/* Schedule Section */}
          <div className="space-y-3 mb-4">
            <div className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
              Schedule
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded p-2">
                <label className="flex items-center gap-2 text-sm">
                  <span className="w-14 font-medium text-gray-600">Weeks:</span>
                  <input 
                    type="range" 
                    min={1} 
                    max={12} 
                    value={weeks} 
                    readOnly 
                    className="accent-blue-500 flex-1" 
                  />
                  <span className="font-bold w-6 text-right text-blue-600">{weeks}</span>
                </label>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <label className="flex items-center gap-2 text-sm">
                  <span className="w-14 font-medium text-gray-600">Hours:</span>
                  <input 
                    type="range" 
                    min={1} 
                    max={40} 
                    value={hoursPerWeek} 
                    readOnly 
                    className="accent-blue-500 flex-1" 
                  />
                  <span className="font-bold w-6 text-right text-blue-600">{hoursPerWeek}</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Questions Summary Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <div className="text-sm font-bold mb-3 text-gray-800 flex items-center gap-1">
              📊 Summary
            </div>
            
            {/* Total Hours and Questions */}
            <div className="flex items-center justify-center gap-3 mb-3 bg-white rounded p-2 shadow-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{totalHours}h</div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-xs text-gray-500">Questions</div>
              </div>
            </div>
            
            {/* Difficulty Breakdown */}
            <div className="flex gap-2 mb-3 justify-center">
              <span className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-bold">
                E: {easyCount}
              </span>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-bold">
                M: {mediumCount}
              </span>
            </div>
            
            {/* Topics Grid */}
            <div className="bg-white rounded p-2 shadow-sm">
              <div className="text-xs font-semibold text-gray-600 mb-2">Topics</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {topics.map((topic) => (
                  <div key={topic.name} className="flex justify-between items-center py-1 px-1 hover:bg-blue-50 rounded transition-colors">
                    <span className="text-blue-600 font-medium truncate">{topic.name}:</span>
                    <span className="font-bold text-gray-700">{topic.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      
      {/* AI Assistant - Fixed Position */}
      {showAI && (
        <div className="fixed top-4 right-4 w-80 h-fit z-50">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-2xl border border-purple-200 p-6">
            <div className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              Nerofea Assistant
            </div>
            
            {/* Mode Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setAiMode('explain'); setAiResult(''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  aiMode === 'explain'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Explain
              </button>
              <button
                onClick={() => { setAiMode('research'); setAiResult(''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  aiMode === 'research'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                <Search className="w-4 h-4" />
                Research
              </button>
            </div>
            
            {/* Input Area */}
            <div className="space-y-3">
              <Textarea
                placeholder={aiMode === 'explain' ? 'Ask about any DSA problem or concept...' : 'What DSA resources do you need?'}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="border-purple-200 focus:ring-purple-400 focus:border-purple-400 bg-white/80"
                disabled={aiLoading}
              />
              <Button
                onClick={handleAISubmit}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Ask AI ${aiMode === 'explain' ? 'to Explain' : 'for Research'}`
                )}
              </Button>
            </div>
            
            {/* Result Area */}
            {aiResult && (
              <div className="mt-4 bg-white/90 rounded-lg p-4 border border-purple-200">
                <div className="text-sm font-semibold text-purple-700 mb-2">AI Response:</div>
                <div className="text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionsSidebar;
