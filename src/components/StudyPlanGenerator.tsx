'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/supabaseClient';
import { useAppStore } from '@/store/useAppStore';
import { Loader2, Calendar, Target, Clock } from 'lucide-react';

interface StudyPlanGeneratorProps {
  onPlanSaved: () => void;
}

export const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ onPlanSaved }) => {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('7');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { addNote, ensureGeneratedPlansTopicExists } = useAppStore();

  // Safe hydration for Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const levels = useMemo(() => [
    { value: 'beginner', label: 'Beginner', description: 'No prior knowledge required' },
    { value: 'intermediate', label: 'Intermediate', description: 'Basic understanding needed' },
    { value: 'advanced', label: 'Advanced', description: 'Strong foundation required' }
  ], []);

  const durations = useMemo(() => [
    { value: '3', label: '3 Days' },
    { value: '7', label: '1 Week' },
    { value: '14', label: '2 Weeks' },
    { value: '30', label: '1 Month' }
  ], []);

  const generatePlan = useCallback(async () => {
    if (!topic.trim()) {
      setNotification({ type: 'error', message: 'Please enter a topic' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setLoading(true);
    setGeneratedPlan('');

    try {
      // Create a more structured and detailed prompt for better study plans
      const prompt = `Create a comprehensive ${duration}-day study plan for learning "${topic}" at ${level} level.

**Requirements:**
- Create a detailed day-by-day breakdown
- Include specific learning objectives for each day
- Provide recommended resources (books, videos, websites, practice problems)
- Include hands-on exercises and projects
- Add progress checkpoints and assessments
- Include tips for effective learning and retention

**Format the response as follows:**

# ${duration}-Day ${level.charAt(0).toUpperCase() + level.slice(1)} Study Plan: ${topic}

## Overview
[Brief overview of what will be learned]

## Daily Breakdown

### Day 1: [Topic/Focus]
**Learning Objectives:**
- [Objective 1]
- [Objective 2]

**Resources:**
- [Resource 1]
- [Resource 2]

**Exercises:**
- [Exercise 1]
- [Exercise 2]

**Checkpoint:** [What to verify you've learned]

---

[Continue for each day...]

## Tips for Success
- [Tip 1]
- [Tip 2]
- [Tip 3]

## Final Assessment
[How to test your knowledge at the end]`;

      console.log('Generating study plan for:', topic, 'Duration:', duration, 'Level:', level);

      // Try Supabase Edge Function first
      try {
        console.log('Attempting to use Supabase Edge Function...');
        const result = await supabase.functions.invoke('groq-chat', {
          body: { message: prompt }
        });

        console.log('Supabase API Response:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Supabase function error');
        }

        if (result.data && result.data.response) {
          setGeneratedPlan(result.data.response);
          setNotification({ type: 'success', message: 'Study plan generated successfully!' });
          setTimeout(() => setNotification(null), 3000);
          return;
        }
      } catch (supabaseError) {
        console.log('Supabase function failed, using fallback method:', supabaseError);
      }

      // Fallback: Generate a structured study plan locally
      console.log('Using fallback study plan generation...');
      const fallbackPlan = generateFallbackStudyPlan(topic, duration, level);
      setGeneratedPlan(fallbackPlan);
      setNotification({ type: 'success', message: 'Study plan generated using fallback method!' });
      setTimeout(() => setNotification(null), 3000);

    } catch (err: any) {
      console.error('Error generating plan:', err);
      let errorMessage = 'Failed to generate study plan. Please try again.';
      
      if (err?.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Study plan generation takes longer - please try again with a shorter topic or wait a moment.';
      } else if (err?.message?.includes('GROQ_API_KEY')) {
        errorMessage = 'Groq API key not configured. Using fallback method.';
      } else if (err?.message?.includes('Function not found')) {
        errorMessage = 'AI service not deployed. Using fallback method.';
      } else if (err?.message?.includes('fetch')) {
        errorMessage = 'Network error. Using fallback method.';
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setNotification({ type: 'error', message: errorMessage });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [topic, duration, level]);

  // Fallback study plan generator
  const generateFallbackStudyPlan = (topic: string, duration: string, level: string) => {
    const days = parseInt(duration);
    const levelTitle = level.charAt(0).toUpperCase() + level.slice(1);
    
    let plan = `# ${duration}-Day ${levelTitle} Study Plan: ${topic}

## Overview
This ${duration}-day study plan will help you master ${topic} at the ${level} level. Each day builds upon the previous, ensuring comprehensive learning and practical application.

## Daily Breakdown

`;

    // Generate daily breakdown based on level and duration
    for (let day = 1; day <= days; day++) {
      const dayFocus = getDayFocus(topic, day, days, level);
      
      plan += `### Day ${day}: ${dayFocus.title}
**Learning Objectives:**
${dayFocus.objectives.map(obj => `- ${obj}`).join('\n')}

**Resources:**
${dayFocus.resources.map(res => `- ${res}`).join('\n')}

**Exercises:**
${dayFocus.exercises.map(ex => `- ${ex}`).join('\n')}

**Checkpoint:** ${dayFocus.checkpoint}

---

`;
    }

    plan += `## Tips for Success
- Set aside dedicated time each day for focused study
- Practice hands-on exercises to reinforce concepts
- Review previous days' material before starting new topics
- Take notes and create your own summaries
- Join study groups or forums to discuss concepts
- Don't rush - quality learning takes time

## Final Assessment
- Complete all daily exercises
- Create a summary document of key concepts
- Build a small project using what you've learned
- Test your knowledge with practice problems
- Reflect on your learning journey and identify areas for improvement

## Additional Resources
- Online courses and tutorials
- Documentation and official guides
- Community forums and discussion groups
- Practice platforms and coding challenges
- Books and reference materials

Good luck with your ${topic} learning journey! 🚀`;

    return plan;
  };

  // Helper function to generate day-specific content
  const getDayFocus = (topic: string, day: number, totalDays: number, level: string) => {
    const isBeginner = level === 'beginner';
    const isIntermediate = level === 'intermediate';
    const isAdvanced = level === 'advanced';

    // Topic-specific resources and exercises
    const getTopicSpecificContent = (topic: string, level: string) => {
      const topicLower = topic.toLowerCase();
      
      if (topicLower.includes('react') || topicLower.includes('javascript') || topicLower.includes('js')) {
        return {
          resources: [
            'React documentation and tutorials',
            'JavaScript.info and MDN Web Docs',
            'CodeSandbox and CodePen for practice',
            'React DevTools for debugging'
          ],
          exercises: [
            'Build a simple React component',
            'Create a todo list application',
            'Practice with React hooks',
            'Debug using browser developer tools'
          ]
        };
      } else if (topicLower.includes('python') || topicLower.includes('django') || topicLower.includes('flask')) {
        return {
          resources: [
            'Python official documentation',
            'Real Python tutorials and guides',
            'PyCharm or VS Code for development',
            'Python interactive shell for practice'
          ],
          exercises: [
            'Write basic Python scripts',
            'Create a simple web application',
            'Practice with Python libraries',
            'Work with data structures and algorithms'
          ]
        };
      } else if (topicLower.includes('data') || topicLower.includes('machine') || topicLower.includes('ai')) {
        return {
          resources: [
            'Kaggle for datasets and competitions',
            'Coursera and edX courses',
            'Jupyter notebooks for experimentation',
            'TensorFlow and PyTorch documentation'
          ],
          exercises: [
            'Analyze a dataset using pandas',
            'Build a simple machine learning model',
            'Visualize data with matplotlib/seaborn',
            'Participate in Kaggle competitions'
          ]
        };
      } else {
        return {
          resources: [
            'Official documentation and guides',
            'Online courses and tutorials',
            'Community forums and discussion groups',
            'Practice platforms and exercises'
          ],
          exercises: [
            'Complete hands-on exercises',
            'Build small projects',
            'Practice with real-world examples',
            'Join study groups and discussions'
          ]
        };
      }
    };

    const topicContent = getTopicSpecificContent(topic, level);

    if (day === 1) {
      return {
        title: `Introduction to ${topic}`,
        objectives: [
          'Understand the basic concepts and terminology',
          'Set up your development environment',
          'Complete your first hands-on exercise'
        ],
        resources: [
          ...topicContent.resources.slice(0, 2),
          'YouTube tutorials for beginners',
          'Online interactive tutorials'
        ],
        exercises: [
          'Install and configure required tools',
          'Complete a "Hello World" equivalent exercise',
          ...topicContent.exercises.slice(0, 1)
        ],
        checkpoint: 'Able to explain basic concepts and complete simple exercises'
      };
    } else if (day === totalDays) {
      return {
        title: `Advanced ${topic} Concepts and Final Project`,
        objectives: [
          'Master advanced concepts and techniques',
          'Complete a comprehensive final project',
          'Review and consolidate all learned material'
        ],
        resources: [
          ...topicContent.resources,
          'Advanced documentation and tutorials',
          'Real-world project examples'
        ],
        exercises: [
          ...topicContent.exercises.slice(0, 2),
          'Build a complete project from scratch',
          'Present your project and explain your decisions'
        ],
        checkpoint: 'Successfully completed a comprehensive project and can explain advanced concepts'
      };
    } else {
      const progress = day / totalDays;
      let focus: string;
      let objectives: string[];
      let resources: string[];
      let exercises: string[];

      if (progress < 0.3) {
        // Early phase - fundamentals
        focus = `Core ${topic} Fundamentals`;
        objectives = [
          'Master fundamental concepts and principles',
          'Practice basic operations and techniques',
          'Build confidence with hands-on exercises'
        ];
        resources = [
          'Comprehensive tutorials and guides',
          'Practice problems and exercises',
          'Community forums for questions'
        ];
        exercises = [
          'Complete structured practice problems',
          'Build small components or modules',
          'Participate in discussions and ask questions'
        ];
      } else if (progress < 0.7) {
        // Middle phase - intermediate concepts
        focus = `Intermediate ${topic} Techniques`;
        objectives = [
          'Learn intermediate concepts and patterns',
          'Apply knowledge to more complex problems',
          'Develop problem-solving skills'
        ];
        resources = [
          'Intermediate-level courses and tutorials',
          'Real-world examples and case studies',
          'Advanced documentation and references'
        ];
        exercises = [
          'Solve intermediate-level problems',
          'Build more complex applications',
          'Analyze and refactor existing code'
        ];
      } else {
        // Late phase - advanced concepts
        focus = `Advanced ${topic} Applications`;
        objectives = [
          'Explore advanced features and techniques',
          'Apply knowledge to real-world scenarios',
          'Optimize and improve existing solutions'
        ];
        resources = [
          'Advanced tutorials and expert guides',
          'Open-source projects and examples',
          'Professional development resources'
        ];
        exercises = [
          'Implement advanced features',
          'Optimize performance and efficiency',
          'Contribute to open-source projects'
        ];
      }

      return {
        title: focus,
        objectives,
        resources,
        exercises,
        checkpoint: `Confident with ${focus.toLowerCase()} and ready for next level`
      };
    }
  };

  const savePlan = useCallback(async () => {
    if (!generatedPlan.trim()) return;

    try {
      // Ensure Generated Plans topic exists
      const generatedPlansIndex = await ensureGeneratedPlansTopicExists();
      if (!generatedPlansIndex) {
        throw new Error('Failed to create or find Generated Plans topic');
      }

      const title = `${duration}-Day ${level.charAt(0).toUpperCase() + level.slice(1)} Study Plan: ${topic}`;
      
      // Convert plain text to HTML with proper formatting
      const formattedContent = generatedPlan
        .split('\n')
        .map(line => {
          if (line.startsWith('# ')) {
            return `<h1>${line.replace('# ', '')}</h1>`;
          } else if (line.startsWith('## ')) {
            return `<h2>${line.replace('## ', '')}</h2>`;
          } else if (line.startsWith('### ')) {
            return `<h3>${line.replace('### ', '')}</h3>`;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            return `<strong>${line.replace(/\*\*/g, '')}</strong>`;
          } else if (line.startsWith('- ')) {
            return `<li>${line.replace('- ', '')}</li>`;
          } else if (line.trim() === '---') {
            return '<hr>';
          } else if (line.trim() === '') {
            return '<br>';
          } else {
            return `<p>${line}</p>`;
          }
        })
        .join('');
      
      await addNote(generatedPlansIndex.id, title, formattedContent);

      setNotification({ type: 'success', message: 'Study plan saved to Generated Plans!' });
      setTimeout(() => setNotification(null), 3000);
      onPlanSaved();
    } catch (error) {
      console.error('Error saving plan:', error);
      setNotification({ type: 'error', message: 'Failed to save study plan. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [generatedPlan, duration, level, topic, addNote, ensureGeneratedPlansTopicExists, onPlanSaved]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-4 h-4" />
            Generate Study Plan
          </CardTitle>
          <CardDescription className="text-sm">
            Create a personalized study plan for any topic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Topic Input */}
          <div>
            <label className="block text-xs font-medium mb-1">Topic to Study</label>
            <Input
              placeholder="e.g., Data Structures, Algorithms, React..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-xs font-medium mb-1">Study Duration</label>
            <div className="grid grid-cols-2 gap-1">
              {durations.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setDuration(dur.value)}
                  className={`p-2 rounded-lg border text-left transition-all text-xs ${
                    duration === dur.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{dur.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <label className="block text-xs font-medium mb-1">Your Level</label>
            <div className="grid gap-1">
              {levels.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setLevel(lvl.value)}
                  className={`p-2 rounded-lg border text-left transition-all text-xs ${
                    level === lvl.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <div>
                      <div className="font-medium">{lvl.label}</div>
                      <div className="text-xs text-gray-600">{lvl.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generatePlan}
            disabled={loading || !topic.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Generate Study Plan'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Plan */}
      {generatedPlan && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calendar className="w-5 h-5" />
                Generated Study Plan
              </CardTitle>
              <Button onClick={savePlan} className="bg-green-600 hover:bg-green-700 text-white">
                💾 Save to Notes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg border border-green-200 p-6 shadow-sm">
              <div className="prose prose-sm max-w-none">
                <div 
                  className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    lineHeight: '1.6'
                  }}
                >
                  {generatedPlan.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={index} className="text-2xl font-bold text-blue-800 mb-4 mt-6 first:mt-0">
                          {line.replace('# ', '')}
                        </h1>
                      );
                    } else if (line.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl font-semibold text-blue-700 mb-3 mt-5">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    } else if (line.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg font-medium text-green-700 mb-2 mt-4">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <strong key={index} className="font-semibold text-gray-800">
                          {line.replace(/\*\*/g, '')}
                        </strong>
                      );
                    } else if (line.startsWith('- ')) {
                      return (
                        <div key={index} className="flex items-start gap-2 mb-1">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-gray-700">{line.replace('- ', '')}</span>
                        </div>
                      );
                    } else if (line.trim() === '---') {
                      return (
                        <hr key={index} className="my-4 border-gray-300" />
                      );
                    } else if (line.trim() === '') {
                      return <div key={index} className="h-2"></div>;
                    } else {
                      return (
                        <p key={index} className="text-gray-700 mb-2">
                          {line}
                        </p>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 