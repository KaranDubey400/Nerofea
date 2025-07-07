"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { FaRobot } from "react-icons/fa";
import { Target, Clock, TrendingUp, BookOpen, Loader2, ExternalLink, CheckCircle, Calendar, Save, Bot, X, MessageSquare, Search } from "lucide-react";
import { supabase } from "@/supabaseClient";
import QuestionsList from '@/components/QuestionsList';
import QuestionsSidebar from '@/components/QuestionsSidebar';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useQuestions, Question } from '@/hooks/useQuestions';
import { Textarea } from "@/components/ui/textarea";

// Updated TypeScript interfaces
interface WeekPlan {
  weekNumber: number;
  questions: Question[];
  totalHours: number;
  totalMinutes: number;
  totalQuestions: number;
  efficiency: number;
  difficultyDistribution: Record<string, number>;
  topicDistribution: Record<string, number>;
}

interface PlanSummary {
  totalHours: number;
  totalMinutes: number;
  totalQuestions: number;
  difficultyBreakdown: Record<string, number>;
  topicBreakdown: Record<string, number>;
  weekPlans: WeekPlan[];
  efficiency: number;
  unusedTime: number;
  estimatedCompletionTime: string;
  learningProgression: {
    easyPercentage: number;
    mediumPercentage: number;
    hardPercentage: number;
  };
}

interface StudyPlan {
  id?: number;
  user_id: string;
  name: string;
  description: string;
  weeks: number;
  hours_per_week: number;
  difficulty_preferences: string[];
  status: 'active' | 'completed' | 'paused';
  created_at?: string;
}

export default function GrindPlanPage() {
  useAuthGuard();
  const { user, profile, signOut } = useUser();
  const router = useRouter();
  const { questions, loading: questionsLoading, error: questionsError, refreshQuestions } = useQuestions();
  
  // State management
  const [weeks, setWeeks] = useState<number>(1);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>(['Easy', 'Medium']);
  const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // NEW: Completed questions state
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState<number | null>(null); // question id being completed

  // AI Assistant state
  const [showAI, setShowAI] = useState(false);
  const [aiMode, setAiMode] = useState<'research' | 'explain'>('explain');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const difficulties = ['Easy', 'Medium', 'Hard'];

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
        setCompletedQuestions(new Set(data.map((row: any) => row.question_id)));
      }
    };
    fetchCompleted();
  }, [user]);

  // Handler to mark question as complete
  const handleToggleComplete = async (questionId: number) => {
    if (!user) return;
    setCompleting(questionId);
    const isCompleted = completedQuestions.has(questionId);
    if (isCompleted) {
      // Mark as uncomplete
      const { error } = await supabase
        .from('user_progress')
        .update({ completed: false, completed_at: null })
        .eq('user_id', user.id)
        .eq('question_id', questionId);
      if (!error) {
        setCompletedQuestions(prev => {
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
        setCompletedQuestions(prev => new Set(prev).add(questionId));
      }
    }
    setCompleting(null);
  };

  // AI Assistant handlers (match AIFeatures logic)
  const handleAISubmit = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      if (aiMode === 'research') {
        const query = `DSA related: ${aiPrompt}`;
        const response = await supabase.functions.invoke('tavily-search', { body: { query } });
        if (response.error) throw response.error;
        setAiResult(response.data?.content || 'No resources found.');
      } else if (aiMode === 'explain') {
        const response = await supabase.functions.invoke('groq-chat', { body: { message: aiPrompt } });
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

  // Helper functions
  const calculateDifficultyBreakdown = (questions: Question[]) => {
    return questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const calculateTopicBreakdown = (questions: Question[]) => {
    return questions.reduce((acc, q) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  // Advanced helper functions
  const parseEstimatedTime = (timeString: string): number => {
    return parseInt(timeString?.replace(' mins', '') || '20');
  };

  const calculateEfficiencyScore = (question: Question): number => {
    const difficultyWeight = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const topicWeight = {
      'Array': 1.2, 'String': 1.1, 'Binary Tree': 1.3,
      'Graph': 1.4, 'Dynamic Programming': 1.5, 'Stack': 1.0,
      'Queue': 1.1, 'Heap': 1.3, 'Binary Search': 1.2,
      'Two Pointers': 1.1, 'Backtracking': 1.4, 'Linked List': 1.2,
      'Binary Search Tree': 1.3, 'Design': 1.1
    };
    
    const time = parseEstimatedTime(question.estimated_time || '20');
    const difficultyValue = difficultyWeight[question.difficulty as keyof typeof difficultyWeight] || 1;
    const topicValue = topicWeight[question.topic as keyof typeof topicWeight] || 1;
    
    return (difficultyValue * topicValue) / time;
  };

  const optimizeTimeUsage = (questions: Question[], totalMinutes: number) => {
    // Sort questions by efficiency (time vs learning value)
    const sortedByEfficiency = questions.sort((a, b) => 
      calculateEfficiencyScore(b) - calculateEfficiencyScore(a)
    );
    
    // Select questions that maximize learning within time limit
    let selected: Question[] = [];
    let timeUsed = 0;
    
    for (const question of sortedByEfficiency) {
      const questionTime = parseEstimatedTime(question.estimated_time || '20');
      if (timeUsed + questionTime <= totalMinutes) {
        selected.push(question);
        timeUsed += questionTime;
      }
    }
    
    return {
      selectedQuestions: selected,
      timeUsed,
      efficiency: Math.round((timeUsed / totalMinutes) * 100),
      unusedTime: totalMinutes - timeUsed
    };
  };

  const smartDistributeQuestions = (questions: Question[], weeks: number) => {
    // Group questions by difficulty
    const easyQuestions = questions.filter(q => q.difficulty === 'Easy');
    const mediumQuestions = questions.filter(q => q.difficulty === 'Medium');
    const hardQuestions = questions.filter(q => q.difficulty === 'Hard');
    
    // Calculate distribution ratios
    const totalQuestions = questions.length;
    const questionsPerWeek = Math.ceil(totalQuestions / weeks);
    
    // Progressive difficulty distribution
    const distribution: WeekPlan[] = [];
    
    for (let week = 1; week <= weeks; week++) {
      const weekQuestions: Question[] = [];
      
      // Early weeks: More Easy questions
      if (week <= Math.ceil(weeks * 0.3)) {
        const easyCount = Math.min(questionsPerWeek * 0.7, easyQuestions.length);
        const mediumCount = Math.min(questionsPerWeek * 0.3, mediumQuestions.length);
        
        weekQuestions.push(
          ...easyQuestions.splice(0, Math.floor(easyCount)),
          ...mediumQuestions.splice(0, Math.floor(mediumCount))
        );
      }
      // Middle weeks: Balanced mix
      else if (week <= Math.ceil(weeks * 0.7)) {
        const easyCount = Math.min(questionsPerWeek * 0.4, easyQuestions.length);
        const mediumCount = Math.min(questionsPerWeek * 0.5, mediumQuestions.length);
        const hardCount = Math.min(questionsPerWeek * 0.1, hardQuestions.length);
        
        weekQuestions.push(
          ...easyQuestions.splice(0, Math.floor(easyCount)),
          ...mediumQuestions.splice(0, Math.floor(mediumCount)),
          ...hardQuestions.splice(0, Math.floor(hardCount))
        );
      }
      // Later weeks: More challenging questions
      else {
        const mediumCount = Math.min(questionsPerWeek * 0.6, mediumQuestions.length);
        const hardCount = Math.min(questionsPerWeek * 0.4, hardQuestions.length);
        
        weekQuestions.push(
          ...mediumQuestions.splice(0, Math.floor(mediumCount)),
          ...hardQuestions.splice(0, Math.floor(hardCount))
        );
      }
      
      // Fill remaining slots with available questions
      const remainingSlots = questionsPerWeek - weekQuestions.length;
      if (remainingSlots > 0) {
        const allRemaining = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
        weekQuestions.push(...allRemaining.splice(0, remainingSlots));
      }
      
      // Calculate week statistics
      const weekMinutes = weekQuestions.reduce((sum, q) => sum + parseEstimatedTime(q.estimated_time || '20'), 0);
      const weekHours = Math.round(weekMinutes / 60 * 100) / 100;
      const weekEfficiency = weekMinutes > 0 ? Math.round((weekMinutes / (hoursPerWeek * 60)) * 100) : 0;
      
      distribution.push({
        weekNumber: week,
        questions: weekQuestions,
        totalMinutes: weekMinutes,
        totalHours: weekHours,
        totalQuestions: weekQuestions.length,
        efficiency: weekEfficiency,
        difficultyDistribution: calculateDifficultyBreakdown(weekQuestions),
        topicDistribution: calculateTopicBreakdown(weekQuestions)
      });
    }
    
    return distribution;
  };

  const calculateLearningProgression = (questions: Question[]) => {
    const total = questions.length;
    if (total === 0) return { easyPercentage: 0, mediumPercentage: 0, hardPercentage: 0 };
    
    const easyCount = questions.filter(q => q.difficulty === 'Easy').length;
    const mediumCount = questions.filter(q => q.difficulty === 'Medium').length;
    const hardCount = questions.filter(q => q.difficulty === 'Hard').length;
    
    return {
      easyPercentage: Math.round((easyCount / total) * 100),
      mediumPercentage: Math.round((mediumCount / total) * 100),
      hardPercentage: Math.round((hardCount / total) * 100)
    };
  };

  const formatCompletionTime = (totalMinutes: number, weeks: number): string => {
    const avgMinutesPerWeek = totalMinutes / weeks;
    const avgHoursPerWeek = avgMinutesPerWeek / 60;
    
    if (avgHoursPerWeek <= 5) return `${weeks} weeks (${Math.round(avgHoursPerWeek * 10) / 10}h/week)`;
    if (avgHoursPerWeek <= 10) return `${weeks} weeks (${Math.round(avgHoursPerWeek * 10) / 10}h/week)`;
    return `${weeks} weeks (${Math.round(avgHoursPerWeek * 10) / 10}h/week)`;
  };

  // Advanced plan generation algorithm
  const generatePlan = useCallback(() => {
    if (questions.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Step 1: Validate inputs
      if (weeks < 1 || hoursPerWeek < 1) {
        throw new Error('Invalid input parameters');
      }
      
      // Step 2: Filter questions based on difficulty preferences
      const filteredQuestions = questions.filter(q => 
        selectedDifficulty.includes(q.difficulty)
      );
      
      if (filteredQuestions.length === 0) {
        setError('No questions found for selected difficulty levels.');
        setIsGenerating(false);
        return;
      }
      
      // Step 3: Calculate total available time
      const totalAvailableMinutes = weeks * hoursPerWeek * 60;
      
      // Step 4: Optimize question selection using efficiency algorithm
      const optimization = optimizeTimeUsage(filteredQuestions, totalAvailableMinutes);
      
      if (optimization.selectedQuestions.length === 0) {
        setError('No questions fit within the time constraint. Try increasing hours per week or number of weeks.');
        setIsGenerating(false);
        return;
      }
      
      // Step 5: Smart distribution across weeks
      const weekDistribution = smartDistributeQuestions(optimization.selectedQuestions, weeks);
      
      // Step 6: Calculate comprehensive summary
      const allQuestions = optimization.selectedQuestions;
      const totalMinutes = optimization.timeUsed;
      const totalHours = Math.round(totalMinutes / 60 * 100) / 100;
      const learningProgression = calculateLearningProgression(allQuestions);
      
      const summary: PlanSummary = {
        totalHours,
        totalMinutes,
        totalQuestions: allQuestions.length,
        difficultyBreakdown: calculateDifficultyBreakdown(allQuestions),
        topicBreakdown: calculateTopicBreakdown(allQuestions),
        weekPlans: weekDistribution,
        efficiency: optimization.efficiency,
        unusedTime: optimization.unusedTime,
        estimatedCompletionTime: formatCompletionTime(totalMinutes, weeks),
        learningProgression
      };
      
      setPlanSummary(summary);
      console.log('Advanced plan generated:', {
        totalQuestions: allQuestions.length,
        efficiency: optimization.efficiency,
        timeUsed: totalMinutes,
        unusedTime: optimization.unusedTime
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
      console.error('Error generating plan:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [weeks, hoursPerWeek, selectedDifficulty, questions]);

  // Auto-generate plan when inputs change (with timeout for performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (questions.length > 0) {
        generatePlan();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [weeks, hoursPerWeek, selectedDifficulty, questions, generatePlan]);
  
  // Also generate plan immediately when questions load
  useEffect(() => {
    if (questions.length > 0 && !planSummary) {
      generatePlan();
    }
  }, [questions, planSummary, generatePlan]);

  // Save plan to database
  const savePlan = async () => {
    if (!planSummary || !user) return;
    
    setIsSaving(true);
    try {
      const planData: Omit<StudyPlan, 'id' | 'created_at'> = {
        user_id: user.id,
        name: `${weeks}-Week Grind Plan`,
        description: `Customized plan with ${hoursPerWeek} hours/week focusing on ${selectedDifficulty.join(', ')} problems`,
        weeks,
        hours_per_week: hoursPerWeek,
        difficulty_preferences: selectedDifficulty,
        status: 'active'
      };
      
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .insert(planData)
        .select()
        .single();
      
      if (planError) throw planError;
      
      // Save week plans
      for (const weekPlan of planSummary.weekPlans) {
        const { error: weekError } = await supabase
          .from('plan_weeks')
          .insert({
            plan_id: plan.id,
            week_number: weekPlan.weekNumber,
            total_hours: weekPlan.totalHours,
            total_questions: weekPlan.totalQuestions
          });
        
        if (weekError) throw weekError;
      }
      
      alert('Plan saved successfully!');
      
    } catch (err: any) {
      console.error('Error saving plan:', err);
      alert('Failed to save plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Nav Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => router.push("/dashboard")}
            title="Go to dashboard"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <Image src="/neo.png" alt="Nerofea Logo" width={36} height={36} />
            <span className="text-2xl font-bold text-gray-900">Nerofea</span>
          </button>
          <Button 
            type="button"
            variant="outline" 
            className="text-base font-medium flex items-center gap-2 border"
            onClick={() => router.push("/ai-features")}
          >
            <FaRobot className="text-lg" /> Fea
          </Button>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-blue-400 text-white hover:from-indigo-600 hover:to-blue-500 text-base font-medium flex items-center gap-2"
            onClick={() => router.push("/grind/plan")}
          >
            <Target className="w-4 h-4" />
            Grind
          </Button>
        </div>
        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{profile?.username}</span>
            <Image
              src={profile?.avatar_url || "/neo.png"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full border"
            />
          </div>
          <Button type="button" variant="outline" className="ml-2" onClick={() => router.push("/profile")}>Profile</Button>
          <Button type="button" variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-5">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Configuration Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 max-w-sm w-full mx-auto">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Customize Plan
                  </div>
                  <button 
                    onClick={toggleAI}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium transition-all ${
                      showAI 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                    }`}
                  >
                    {showAI ? <X className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    {showAI ? 'Close AI' : 'AI Help'}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2 pt-0">
                <div className="space-y-3 mt-0">
                  <Label className="text-xs font-semibold">Schedule</Label>
                  {/* Weeks Selector */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium text-gray-600">Weeks:</Label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={weeks}
                      onChange={(e) => setWeeks(parseInt(e.target.value))}
                      className="w-32 h-2 accent-blue-500"
                    />
                    <span className="text-xs text-gray-500">{weeks}</span>
                  </div>
                  {/* Hours per Week Selector */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium text-gray-600">Hours/Week:</Label>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                      className="w-32 h-2 accent-blue-500"
                    />
                    <span className="text-xs text-gray-500">{hoursPerWeek}</span>
                  </div>
                </div>
                
                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Difficulty</Label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => {
                          setSelectedDifficulty(prev => 
                            prev.includes(difficulty)
                              ? prev.filter(d => d !== difficulty)
                              : [...prev, difficulty]
                          );
                        }}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          selectedDifficulty.includes(difficulty)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Advanced Plan Summary Section */}
                {planSummary && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Advanced Plan Summary {isGenerating && <span className="text-xs text-gray-500">(updating...)</span>}</Label>
                    
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center bg-blue-50 rounded-lg p-2 h-12 flex flex-col items-center justify-center">
                        <div className="text-base font-bold text-blue-600 leading-tight">
                          {planSummary.totalHours}h
                        </div>
                        <div className="text-xs text-gray-600">Total Study Time</div>
                      </div>
                      <div className="text-center bg-green-50 rounded-lg p-2 h-12 flex flex-col items-center justify-center">
                        <div className="text-base font-bold text-green-600 leading-tight">
                          {planSummary.totalQuestions}
                        </div>
                        <div className="text-xs text-gray-600">Questions</div>
                      </div>
                    </div>

                    {/* Learning Progression - show question counts instead of percentage */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">Learning Progression</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Easy</span>
                          <span className="font-medium">{planSummary.difficultyBreakdown['Easy'] || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${((planSummary.difficultyBreakdown['Easy'] || 0) / planSummary.totalQuestions) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Medium</span>
                          <span className="font-medium">{planSummary.difficultyBreakdown['Medium'] || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${((planSummary.difficultyBreakdown['Medium'] || 0) / planSummary.totalQuestions) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Hard</span>
                          <span className="font-medium">{planSummary.difficultyBreakdown['Hard'] || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${((planSummary.difficultyBreakdown['Hard'] || 0) / planSummary.totalQuestions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Topics Section in Advanced Plan Summary */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">Topics</Label>
                      <div className="text-xs text-gray-500 mb-1">Questions grouped by topics</div>
                      <ul className="space-y-1">
                        {Object.entries(planSummary.topicBreakdown)
                          .sort(([, a], [, b]) => b - a)
                          .map(([topic, count]) => (
                            <li key={topic} className="flex justify-between">
                              <span className="font-medium text-gray-800">{topic}</span>
                              <span className="font-mono">{count}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Completion Time */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">Estimated Completion</Label>
                      <div className="text-sm font-medium text-gray-800">
                        {planSummary.estimatedCompletionTime}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right - Plan Summary and Week Plans */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading State - Only show if no questions available */}
            {(questionsLoading && questions.length === 0) && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading questions...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State - Show when questions fail to load */}
            {questionsError && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-red-500 mb-4">
                      <X className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-red-600 mb-4">{questionsError}</p>
                    <Button onClick={refreshQuestions} variant="outline">
                      <Loader2 className="w-4 h-4 mr-2" />
                      Retry Loading Questions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Plan Generation Loading */}
            {isGenerating && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Generating your personalized plan...</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Advanced Week Plans */}
            {planSummary?.weekPlans.map((weekPlan) => (
              <Card key={weekPlan.weekNumber}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Week {weekPlan.weekNumber}
                    </span>
                    <div className="text-sm font-normal text-gray-600">
                      {weekPlan.totalQuestions} questions • {weekPlan.totalHours}h • {weekPlan.efficiency}% efficiency
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Week Statistics */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{weekPlan.totalMinutes}m</div>
                        <div className="text-gray-500">Total Time</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{weekPlan.efficiency}%</div>
                        <div className="text-gray-500">Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{Object.keys(weekPlan.topicDistribution).length}</div>
                        <div className="text-gray-500">Topics</div>
                      </div>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3">
                    {weekPlan.questions.map((question, index) => (
                      <div key={question.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500 font-mono">
                            {weekPlan.weekNumber}.{index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-blue-900">{question.title}</div>
                            <div className="text-sm text-gray-600">
                              <Badge 
                                variant={question.difficulty === 'Easy' ? 'secondary' : 
                                        question.difficulty === 'Medium' ? 'default' : 'destructive'}
                                className="mr-2 text-xs"
                              >
                                {question.difficulty}
                              </Badge>
                              {question.topic} • {question.estimated_time}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {question.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={question.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Solve
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={completing === question.id}
                            onClick={() => handleToggleComplete(question.id)}
                            aria-label={completedQuestions.has(question.id) ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {completing === question.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <CheckCircle
                                className={`w-5 h-5 ${completedQuestions.has(question.id) ? 'text-green-500' : 'text-gray-400'}`}
                                fill={completedQuestions.has(question.id) ? '#22c55e' : 'none'}
                              />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* AI Assistant - Fixed Position Pink Panel */}
      {showAI && (
        <div className="fixed top-4 right-4 w-80 h-fit z-50">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-2xl border border-pink-200 p-6">
            <div className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-600" />
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Nerofea Assistant
              </span>
            </div>
            
            {/* Mode Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setAiMode('explain'); setAiResult(''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  aiMode === 'explain'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-pink-600 hover:bg-pink-50 border border-pink-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Explain
              </button>
              <button
                onClick={() => { setAiMode('research'); setAiResult(''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  aiMode === 'research'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-pink-600 hover:bg-pink-50 border border-pink-200'
                }`}
              >
                <Search className="w-4 h-4" />
                Research
              </button>
            </div>
            
            {/* Input Area */}
            <div className="space-y-3">
              <Textarea
                placeholder={aiMode === 'explain' ? 'Ask about any DSA grind plan strategy...' : 'What DSA grind resources do you need?'}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="border-pink-200 focus:ring-pink-400 focus:border-pink-400 bg-white/80"
                disabled={aiLoading}
              />
              <Button
                onClick={handleAISubmit}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2"
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
              <div className="mt-4 bg-white/90 rounded-lg p-4 border border-pink-200">
                <div className="text-sm font-semibold text-pink-700 mb-2">AI Response:</div>
                <div className="text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
