import React, { useState, useEffect } from 'react';
import { useQuestions, Question } from '@/hooks/useQuestions';
import { Button } from './ui/button';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/supabaseClient';
import { CheckCircle, Loader2 } from 'lucide-react';

function groupByWeek(questions: Question[]) {
  const grouped: { [week: number]: Question[] } = {};
  questions.forEach((q) => {
    const week = q.week || 1;
    if (!grouped[week]) grouped[week] = [];
    grouped[week].push(q);
  });
  return grouped;
}

const QuestionsList: React.FC = () => {
  const { questions, loading, error, refreshQuestions, retryCount } = useQuestions();
  const { user } = useUser();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState<number | null>(null);

  // Fetch completed questions for user on mount
  useEffect(() => {
    if (!user) return;
    const fetchCompleted = async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('question_id')
        .eq('user_id', user.id)
        .eq('completed', true);
      if (!error && data) {
        setCompleted(new Set(data.map((row: any) => row.question_id)));
      }
    };
    fetchCompleted();
  }, [user]);

  // Toggle complete/incomplete in DB
  const handleToggleComplete = async (questionId: number) => {
    if (!user) return;
    setCompleting(questionId);
    const isCompleted = completed.has(questionId);
    if (isCompleted) {
      // Mark as uncomplete
      const { error } = await supabase
        .from('user_progress')
        .update({ completed: false, completed_at: null })
        .eq('user_id', user.id)
        .eq('question_id', questionId);
      if (!error) {
        setCompleted(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      }
    } else {
      // Mark as complete
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          question_id: questionId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,question_id' });
      if (!error) {
        setCompleted(prev => new Set(prev).add(questionId));
      }
    }
    setCompleting(null);
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b pb-3">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error && questions.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-600 font-semibold">⚠️ Connection Issue</span>
            {retryCount > 0 && (
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                Retry {retryCount}/3
              </span>
            )}
          </div>
          <p className="text-yellow-700 text-sm mb-3">{error}</p>
          <div className="flex gap-2">
            <button 
              onClick={refreshQuestions} 
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const grouped = groupByWeek(questions);
  
  // Show message if no questions found
  if (!loading && !error && questions.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 font-semibold mb-2">
            📝 No questions found
          </div>
          <p className="text-yellow-700 text-sm mb-4">
            It looks like there are no questions in the database yet.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Offline Mode Warning */}
      {error && questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium text-sm">📶 {error}</span>
            <button 
              onClick={refreshQuestions}
              className="ml-auto px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Reconnect
            </button>
          </div>
        </div>
      )}
      {Object.entries(grouped).map(([week, qs]) => (
        <div key={week} className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Week {week} <span className="text-gray-400 text-lg font-normal">({qs.length} questions)</span>
          </h2>
          <div className="flex flex-col gap-4">
            {qs.map((q) => (
              <div
                key={q.id}
                className={`border-b pb-3 flex items-center justify-between transition-colors duration-200 ${completed.has(q.id) ? 'bg-green-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-700">{q.week}.{q.number}</span>
                  <span className="font-medium text-lg text-blue-900 hover:underline cursor-pointer">{q.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {q.url && (
                    <a href={q.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">Solve</Button>
                    </a>
                  )}
                  <span
                    onClick={() => handleToggleComplete(q.id)}
                    className="ml-2 cursor-pointer"
                    aria-label={completed.has(q.id) ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completing === q.id ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      <CheckCircle
                        className={`w-6 h-6 transition-colors duration-200 ${completed.has(q.id) ? 'text-green-500' : 'text-gray-300'}`}
                        fill={completed.has(q.id) ? '#22c55e' : 'none'}
                      />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionsList; 