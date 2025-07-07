'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/supabaseClient';
import { useUser } from '@/hooks/useUser';
import { Calendar, Trash2, Eye, Plus } from 'lucide-react';
import { StudyPlanGenerator } from '@/components/StudyPlanGenerator';

interface SavedPlan {
  id: string;
  title: string;
  content: string;
  created_at: string;
  duration: string;
  level: string;
}

export const StudyPlanManager = () => {
  const [mounted, setMounted] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { user } = useUser();

  // Safe hydration for Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSavedPlans = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('folder', 'Study Plans')
        .eq('source_api', 'study-plan-generator')
        .order('created_at', { ascending: false })
        .limit(10); // Limit to 10 plans for better performance

      if (error) {
        console.error('Error fetching saved plans:', error);
        return;
      }

      const plans = data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || '',
        created_at: note.created_at || '',
        duration: extractDuration(note.title),
        level: extractLevel(note.title)
      }));

      setSavedPlans(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const extractDuration = useCallback((title: string): string => {
    const match = title.match(/(\d+)-Day/);
    return match ? `${match[1]} days` : 'Unknown';
  }, []);

  const extractLevel = useCallback((title: string): string => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    for (const level of levels) {
      if (title.toLowerCase().includes(level.toLowerCase())) {
        return level;
      }
    }
    return 'Unknown';
  }, []);

  const deletePlan = useCallback(async (planId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', planId);

      if (error) {
        setNotification({
          type: "error",
          message: "Failed to delete study plan"
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
      setNotification({
        type: "success",
        message: "Study plan deleted successfully"
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting plan:', error);
      setNotification({
        type: "error",
        message: "Failed to delete study plan"
      });
      setTimeout(() => setNotification(null), 3000);
    }
  }, []);

  // Fetch plans when user changes
  useEffect(() => {
    if (mounted && user) {
      fetchSavedPlans();
    }
  }, [mounted, user, fetchSavedPlans]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Generate New Study Plan</h2>
          <Button variant="outline" onClick={() => setShowGenerator(false)}>
            Back to Saved Plans
          </Button>
        </div>
        <StudyPlanGenerator onPlanSaved={() => {
          setShowGenerator(false);
          fetchSavedPlans();
        }} />
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{selectedPlan.title}</h2>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>
            Back to Plans
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {selectedPlan.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Study Plans</h3>
          <p className="text-gray-600 text-sm">Manage your personalized study plans</p>
        </div>
        <Button onClick={() => setShowGenerator(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-400">
          <Plus className="w-4 h-4" />
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading plans...</p>
        </div>
      ) : savedPlans.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="text-center py-6">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No study plans yet</h3>
            <p className="text-gray-600 text-xs mb-3">Create your first personalized study plan</p>
            <Button size="sm" onClick={() => setShowGenerator(true)} className="bg-gradient-to-r from-indigo-500 to-blue-400">
              Create Study Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {savedPlans.slice(0, 3).map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{plan.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0">{plan.duration}</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">{plan.level}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 truncate flex-1 mr-2">
                    {plan.content.split('\n')[0].replace('# ', '')}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPlan(plan)}
                      className="flex items-center gap-1 text-xs px-2 py-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePlan(plan.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
