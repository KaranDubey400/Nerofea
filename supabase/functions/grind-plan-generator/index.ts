import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GrindPlanRequest {
  weeks: number;
  hoursPerWeek: number;
  difficulties: string[];
}

interface DSAProblem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  leetcode_url?: string;
  gfg_url?: string;
  estimated_time: number; // in minutes
}

// DSA Problems Database
const dsaProblems: DSAProblem[] = [
  // Arrays
  { id: '1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/two-sum/', estimated_time: 15 },
  { id: '2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', estimated_time: 20 },
  { id: '3', title: 'Contains Duplicate', difficulty: 'Easy', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/contains-duplicate/', estimated_time: 10 },
  { id: '4', title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/product-of-array-except-self/', estimated_time: 30 },
  { id: '5', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/maximum-subarray/', estimated_time: 25 },
  { id: '6', title: '3Sum', difficulty: 'Medium', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/3sum/', estimated_time: 40 },
  { id: '7', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/merge-intervals/', estimated_time: 35 },
  { id: '8', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Arrays', leetcode_url: 'https://leetcode.com/problems/trapping-rain-water/', estimated_time: 45 },
  
  // Strings
  { id: '9', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Strings', leetcode_url: 'https://leetcode.com/problems/valid-parentheses/', estimated_time: 15 },
  { id: '10', title: 'Valid Anagram', difficulty: 'Easy', topic: 'Strings', leetcode_url: 'https://leetcode.com/problems/valid-anagram/', estimated_time: 15 },
  { id: '11', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', leetcode_url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', estimated_time: 30 },
  { id: '12', title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'Strings', leetcode_url: 'https://leetcode.com/problems/longest-palindromic-substring/', estimated_time: 35 },
  { id: '13', title: 'Group Anagrams', difficulty: 'Medium', topic: 'Strings', leetcode_url: 'https://leetcode.com/problems/group-anagrams/', estimated_time: 25 },
  
  // Linked Lists
  { id: '14', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked Lists', leetcode_url: 'https://leetcode.com/problems/reverse-linked-list/', estimated_time: 20 },
  { id: '15', title: 'Detect Cycle in Linked List', difficulty: 'Easy', topic: 'Linked Lists', leetcode_url: 'https://leetcode.com/problems/linked-list-cycle/', estimated_time: 25 },
  { id: '16', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked Lists', leetcode_url: 'https://leetcode.com/problems/merge-two-sorted-lists/', estimated_time: 25 },
  { id: '17', title: 'Remove Nth Node From End of List', difficulty: 'Medium', topic: 'Linked Lists', leetcode_url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', estimated_time: 30 },
  { id: '18', title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked Lists', leetcode_url: 'https://leetcode.com/problems/add-two-numbers/', estimated_time: 35 },
  
  // Trees
  { id: '19', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', estimated_time: 15 },
  { id: '20', title: 'Same Tree', difficulty: 'Easy', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/same-tree/', estimated_time: 20 },
  { id: '21', title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/invert-binary-tree/', estimated_time: 20 },
  { id: '22', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', estimated_time: 30 },
  { id: '23', title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/validate-binary-search-tree/', estimated_time: 35 },
  { id: '24', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', estimated_time: 30 },
  { id: '25', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Trees', leetcode_url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', estimated_time: 45 },
  
  // Dynamic Programming
  { id: '26', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/climbing-stairs/', estimated_time: 20 },
  { id: '27', title: 'House Robber', difficulty: 'Medium', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/house-robber/', estimated_time: 30 },
  { id: '28', title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/coin-change/', estimated_time: 40 },
  { id: '29', title: 'Longest Increasing Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/longest-increasing-subsequence/', estimated_time: 45 },
  { id: '30', title: 'Word Break', difficulty: 'Medium', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/word-break/', estimated_time: 40 },
  { id: '31', title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/longest-common-subsequence/', estimated_time: 45 },
  { id: '32', title: 'Edit Distance', difficulty: 'Hard', topic: 'Dynamic Programming', leetcode_url: 'https://leetcode.com/problems/edit-distance/', estimated_time: 50 },
  
  // Graphs
  { id: '33', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', leetcode_url: 'https://leetcode.com/problems/number-of-islands/', estimated_time: 35 },
  { id: '34', title: 'Course Schedule', difficulty: 'Medium', topic: 'Graphs', leetcode_url: 'https://leetcode.com/problems/course-schedule/', estimated_time: 40 },
  { id: '35', title: 'Graph Valid Tree', difficulty: 'Medium', topic: 'Graphs', leetcode_url: 'https://leetcode.com/problems/graph-valid-tree/', estimated_time: 35 },
  { id: '36', title: 'Alien Dictionary', difficulty: 'Hard', topic: 'Graphs', leetcode_url: 'https://leetcode.com/problems/alien-dictionary/', estimated_time: 50 },
  
  // Heaps
  { id: '37', title: 'Kth Largest Element in Array', difficulty: 'Medium', topic: 'Heaps', leetcode_url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', estimated_time: 30 },
  { id: '38', title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Heaps', leetcode_url: 'https://leetcode.com/problems/merge-k-sorted-lists/', estimated_time: 45 },
  { id: '39', title: 'Find Median from Data Stream', difficulty: 'Hard', topic: 'Heaps', leetcode_url: 'https://leetcode.com/problems/find-median-from-data-stream/', estimated_time: 40 },
  
  // Binary Search
  { id: '40', title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', leetcode_url: 'https://leetcode.com/problems/binary-search/', estimated_time: 15 },
  { id: '41', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', leetcode_url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', estimated_time: 35 },
  { id: '42', title: 'Find First and Last Position', difficulty: 'Medium', topic: 'Binary Search', leetcode_url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', estimated_time: 30 },
];

function generateGrindPlan(request: GrindPlanRequest) {
  const { weeks, hoursPerWeek, difficulties } = request;
  
  // Calculate total study time in minutes
  const totalMinutes = weeks * hoursPerWeek * 60;
  
  // Filter problems by selected difficulties
  const availableProblems = dsaProblems.filter(problem => 
    difficulties.includes(problem.difficulty)
  );
  
  // Shuffle problems for randomization
  const shuffledProblems = [...availableProblems].sort(() => Math.random() - 0.5);
  
  // Calculate problems per week
  const totalProblemTime = shuffledProblems.reduce((sum, problem) => sum + problem.estimated_time, 0);
  const problemsPerWeek = Math.ceil(shuffledProblems.length / weeks);
  
  // Create weekly schedule
  const weeklySchedule = [];
  let currentWeek = 1;
  let currentWeekProblems = [];
  let currentWeekTime = 0;
  
  for (const problem of shuffledProblems) {
    if (currentWeek > weeks) break;
    
    if (currentWeekTime + problem.estimated_time <= hoursPerWeek * 60 && currentWeekProblems.length < problemsPerWeek) {
      currentWeekProblems.push(problem);
      currentWeekTime += problem.estimated_time;
    } else {
      if (currentWeekProblems.length > 0) {
        weeklySchedule.push({
          week: currentWeek,
          problems: currentWeekProblems,
          totalTime: currentWeekTime,
          topics: [...new Set(currentWeekProblems.map(p => p.topic))]
        });
      }
      currentWeek++;
      currentWeekProblems = [problem];
      currentWeekTime = problem.estimated_time;
    }
  }
  
  // Add remaining problems to last week
  if (currentWeekProblems.length > 0 && currentWeek <= weeks) {
    weeklySchedule.push({
      week: currentWeek,
      problems: currentWeekProblems,
      totalTime: currentWeekTime,
      topics: [...new Set(currentWeekProblems.map(p => p.topic))]
    });
  }
  
  // Generate study tips
  const studyTips = [
    "Start with easy problems to build confidence",
    "Practice problems from the same topic together",
    "Review solutions and understand different approaches",
    "Time yourself to improve speed",
    "Focus on understanding patterns rather than memorizing solutions",
    "Take breaks between study sessions",
    "Use a whiteboard or paper for problem-solving",
    "Discuss problems with peers or mentors"
  ];
  
  return {
    plan: {
      duration: weeks,
      hoursPerWeek,
      difficulties,
      totalProblems: shuffledProblems.length,
      weeklySchedule
    },
    studyTips,
    topics: [...new Set(shuffledProblems.map(p => p.topic))],
    difficultyBreakdown: difficulties.reduce((acc, diff) => {
      acc[diff] = shuffledProblems.filter(p => p.difficulty === diff).length;
      return acc;
    }, {} as Record<string, number>)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { weeks, hoursPerWeek, difficulties }: GrindPlanRequest = await req.json();
    
    if (!weeks || !hoursPerWeek || !difficulties || difficulties.length === 0) {
      throw new Error('Invalid request: weeks, hoursPerWeek, and difficulties are required');
    }
    
    if (weeks < 1 || weeks > 52) {
      throw new Error('Weeks must be between 1 and 52');
    }
    
    if (hoursPerWeek < 1 || hoursPerWeek > 168) {
      throw new Error('Hours per week must be between 1 and 168');
    }
    
    const grindPlan = generateGrindPlan({ weeks, hoursPerWeek, difficulties });
    
    return new Response(JSON.stringify(grindPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Failed to generate grind plan'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 