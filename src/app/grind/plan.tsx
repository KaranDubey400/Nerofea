import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuestionsList from '@/components/QuestionsList';
import Image from 'next/image';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function GrindPlanPage() {
  const router = useRouter();
  const [weeks, setWeeks] = useState(1);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);

  useAuthGuard();

  // Mock data for summary - this will be calculated from actual data
  const summary = {
    totalHours: weeks * hoursPerWeek,
    totalQuestions: 100,
    difficultyBreakdown: {
      Easy: 41,
      Medium: 59,
      Hard: 0
    },
    topicBreakdown: {
      'Array': 15,
      'Stack': 6,
      'Linked List': 8,
      'String': 9,
      'Binary Tree': 11,
      'Binary Search': 4,
      'Graph': 13,
      'Binary Search Tree': 4,
      'Hash Table': 1,
      'Dynamic Programming': 8,
      'Binary': 7,
      'Math': 2,
      'Heap': 3,
      'Trie': 3,
      'Recursion': 4,
      'Matrix': 2
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => router.push('/dashboard')}
                title="Go to dashboard"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Image src="/neo.png" alt="Nerofea Logo" width={36} height={36} />
                <span className="text-2xl font-bold text-gray-900">Nerofea</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize Plan
              </Button>
              <Button variant="outline" size="sm">
                Help
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content: Two Halves */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar removed as per user request */}
        {/* Right Content: Questions List */}
        <div className="flex-1 h-[calc(100vh-4.5rem)] overflow-y-auto px-4 py-8">
          <QuestionsList />
        </div>
      </div>
    </div>
  );
} 