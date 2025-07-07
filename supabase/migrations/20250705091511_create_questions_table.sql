-- Create questions table to store coding problems
CREATE TABLE IF NOT EXISTS public.questions (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    estimated_time TEXT DEFAULT '20 mins',
    url TEXT,
    week INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions table - allow all authenticated users to read
CREATE POLICY "Users can view all questions" ON public.questions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at for questions
CREATE OR REPLACE TRIGGER handle_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS questions_topic_idx ON public.questions(topic);
CREATE INDEX IF NOT EXISTS questions_week_idx ON public.questions(week);
CREATE INDEX IF NOT EXISTS questions_number_idx ON public.questions(number);

-- Insert 168 coding problems
INSERT INTO public.questions (number, title, difficulty, topic, estimated_time, url, week) VALUES
-- Week 1: Arrays and Strings (Easy)
(1, 'Two Sum', 'Easy', 'Array', '15 mins', 'https://leetcode.com/problems/two-sum/', 1),
(2, 'Valid Parentheses', 'Easy', 'Stack', '20 mins', 'https://leetcode.com/problems/valid-parentheses/', 1),
(3, 'Valid Palindrome', 'Easy', 'String', '15 mins', 'https://leetcode.com/problems/valid-palindrome/', 1),
(4, 'Valid Anagram', 'Easy', 'String', '15 mins', 'https://leetcode.com/problems/valid-anagram/', 1),
(5, 'Best Time to Buy and Sell Stock', 'Easy', 'Array', '20 mins', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 1),
(6, 'Contains Duplicate', 'Easy', 'Array', '10 mins', 'https://leetcode.com/problems/contains-duplicate/', 1),
(7, 'Missing Number', 'Easy', 'Array', '15 mins', 'https://leetcode.com/problems/missing-number/', 1),
(8, 'Single Number', 'Easy', 'Array', '15 mins', 'https://leetcode.com/problems/single-number/', 1),
(9, 'Climbing Stairs', 'Easy', 'Dynamic Programming', '20 mins', 'https://leetcode.com/problems/climbing-stairs/', 1),
(10, 'Maximum Subarray', 'Easy', 'Array', '20 mins', 'https://leetcode.com/problems/maximum-subarray/', 1),
(11, 'Move Zeroes', 'Easy', 'Array', '15 mins', 'https://leetcode.com/problems/move-zeroes/', 1),
(12, 'Squares of a Sorted Array', 'Easy', 'Array', '15 mins', 'https://leetcode.com/problems/squares-of-a-sorted-array/', 1),
(13, '3Sum', 'Medium', 'Array', '30 mins', 'https://leetcode.com/problems/3sum/', 1),
(14, 'Container With Most Water', 'Medium', 'Array', '25 mins', 'https://leetcode.com/problems/container-with-most-water/', 1),
(15, 'Product of Array Except Self', 'Medium', 'Array', '25 mins', 'https://leetcode.com/problems/product-of-array-except-self/', 1),

-- Week 2: Linked Lists and Trees (Easy-Medium)
(16, 'Merge Two Sorted Lists', 'Easy', 'Linked List', '20 mins', 'https://leetcode.com/problems/merge-two-sorted-lists/', 2),
(17, 'Reverse Linked List', 'Easy', 'Linked List', '15 mins', 'https://leetcode.com/problems/reverse-linked-list/', 2),
(18, 'Linked List Cycle', 'Easy', 'Linked List', '15 mins', 'https://leetcode.com/problems/linked-list-cycle/', 2),
(19, 'Remove Nth Node From End of List', 'Medium', 'Linked List', '20 mins', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', 2),
(20, 'Add Two Numbers', 'Medium', 'Linked List', '25 mins', 'https://leetcode.com/problems/add-two-numbers/', 2),
(21, 'Invert Binary Tree', 'Easy', 'Binary Tree', '15 mins', 'https://leetcode.com/problems/invert-binary-tree/', 2),
(22, 'Maximum Depth of Binary Tree', 'Easy', 'Binary Tree', '15 mins', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 2),
(23, 'Same Tree', 'Easy', 'Binary Tree', '15 mins', 'https://leetcode.com/problems/same-tree/', 2),
(24, 'Symmetric Tree', 'Easy', 'Binary Tree', '20 mins', 'https://leetcode.com/problems/symmetric-tree/', 2),
(25, 'Path Sum', 'Easy', 'Binary Tree', '20 mins', 'https://leetcode.com/problems/path-sum/', 2),
(26, 'Binary Tree Level Order Traversal', 'Medium', 'Binary Tree', '25 mins', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 2),
(27, 'Construct Binary Tree from Preorder and Inorder Traversal', 'Medium', 'Binary Tree', '30 mins', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', 2),
(28, 'Validate Binary Search Tree', 'Medium', 'Binary Search Tree', '25 mins', 'https://leetcode.com/problems/validate-binary-search-tree/', 2),
(29, 'Lowest Common Ancestor of a BST', 'Easy', 'Binary Search Tree', '20 mins', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', 2),
(30, 'Kth Smallest Element in a BST', 'Medium', 'Binary Search Tree', '25 mins', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', 2),

-- Week 3: Stacks, Queues, and Heaps (Easy-Medium)
(31, 'Min Stack', 'Medium', 'Stack', '20 mins', 'https://leetcode.com/problems/min-stack/', 3),
(32, 'Valid Parentheses', 'Easy', 'Stack', '20 mins', 'https://leetcode.com/problems/valid-parentheses/', 3),
(33, 'Evaluate Reverse Polish Notation', 'Medium', 'Stack', '25 mins', 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', 3),
(34, 'Implement Queue using Stacks', 'Easy', 'Stack', '20 mins', 'https://leetcode.com/problems/implement-queue-using-stacks/', 3),
(35, 'Implement Stack using Queues', 'Easy', 'Queue', '20 mins', 'https://leetcode.com/problems/implement-stack-using-queues/', 3),
(36, 'Kth Largest Element in an Array', 'Medium', 'Heap', '25 mins', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 3),
(37, 'Merge k Sorted Lists', 'Hard', 'Heap', '35 mins', 'https://leetcode.com/problems/merge-k-sorted-lists/', 3),
(38, 'Top K Frequent Elements', 'Medium', 'Heap', '25 mins', 'https://leetcode.com/problems/top-k-frequent-elements/', 3),
(39, 'Find Median from Data Stream', 'Hard', 'Heap', '30 mins', 'https://leetcode.com/problems/find-median-from-data-stream/', 3),
(40, 'Sliding Window Maximum', 'Hard', 'Queue', '30 mins', 'https://leetcode.com/problems/sliding-window-maximum/', 3),

-- Week 4: Binary Search and Two Pointers (Easy-Medium)
(41, 'Binary Search', 'Easy', 'Binary Search', '15 mins', 'https://leetcode.com/problems/binary-search/', 4),
(42, 'Search Insert Position', 'Easy', 'Binary Search', '15 mins', 'https://leetcode.com/problems/search-insert-position/', 4),
(43, 'First Bad Version', 'Easy', 'Binary Search', '15 mins', 'https://leetcode.com/problems/first-bad-version/', 4),
(44, 'Sqrt(x)', 'Easy', 'Binary Search', '15 mins', 'https://leetcode.com/problems/sqrtx/', 4),
(45, 'Search in Rotated Sorted Array', 'Medium', 'Binary Search', '25 mins', 'https://leetcode.com/problems/search-in-rotated-sorted-array/', 4),
(46, 'Find First and Last Position of Element in Sorted Array', 'Medium', 'Binary Search', '25 mins', 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', 4),
(47, 'Two Sum II - Input Array Is Sorted', 'Medium', 'Two Pointers', '20 mins', 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', 4),
(48, '3Sum Closest', 'Medium', 'Two Pointers', '25 mins', 'https://leetcode.com/problems/3sum-closest/', 4),
(49, 'Remove Duplicates from Sorted Array', 'Easy', 'Two Pointers', '15 mins', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', 4),
(50, 'Remove Element', 'Easy', 'Two Pointers', '15 mins', 'https://leetcode.com/problems/remove-element/', 4),

-- Week 5: Dynamic Programming (Easy-Medium)
(51, 'Climbing Stairs', 'Easy', 'Dynamic Programming', '20 mins', 'https://leetcode.com/problems/climbing-stairs/', 5),
(52, 'House Robber', 'Medium', 'Dynamic Programming', '25 mins', 'https://leetcode.com/problems/house-robber/', 5),
(53, 'House Robber II', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/house-robber-ii/', 5),
(54, 'Coin Change', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/coin-change/', 5),
(55, 'Longest Increasing Subsequence', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/longest-increasing-subsequence/', 5),
(56, 'Word Break', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/word-break/', 5),
(57, 'Combination Sum IV', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/combination-sum-iv/', 5),
(58, 'Decode Ways', 'Medium', 'Dynamic Programming', '25 mins', 'https://leetcode.com/problems/decode-ways/', 5),
(59, 'Unique Paths', 'Medium', 'Dynamic Programming', '25 mins', 'https://leetcode.com/problems/unique-paths/', 5),
(60, 'Unique Paths II', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/unique-paths-ii/', 5),

-- Week 6: Graphs and BFS/DFS (Easy-Medium)
(61, 'Number of Islands', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/number-of-islands/', 6),
(62, 'Flood Fill', 'Easy', 'Graph', '20 mins', 'https://leetcode.com/problems/flood-fill/', 6),
(63, 'Course Schedule', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/course-schedule/', 6),
(64, 'Course Schedule II', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/course-schedule-ii/', 6),
(65, 'Redundant Connection', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/redundant-connection/', 6),
(66, 'Graph Valid Tree', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/graph-valid-tree/', 6),
(67, 'Number of Connected Components in an Undirected Graph', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', 6),
(68, 'Clone Graph', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/clone-graph/', 6),
(69, 'Pacific Atlantic Water Flow', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/pacific-atlantic-water-flow/', 6),
(70, 'Surrounded Regions', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/surrounded-regions/', 6),

-- Week 7: Advanced Arrays and Strings (Medium)
(71, 'Longest Substring Without Repeating Characters', 'Medium', 'String', '25 mins', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 7),
(72, 'Longest Palindromic Substring', 'Medium', 'String', '30 mins', 'https://leetcode.com/problems/longest-palindromic-substring/', 7),
(73, 'Zigzag Conversion', 'Medium', 'String', '25 mins', 'https://leetcode.com/problems/zigzag-conversion/', 7),
(74, 'String to Integer (atoi)', 'Medium', 'String', '25 mins', 'https://leetcode.com/problems/string-to-integer-atoi/', 7),
(75, 'Roman to Integer', 'Easy', 'String', '20 mins', 'https://leetcode.com/problems/roman-to-integer/', 7),
(76, 'Integer to Roman', 'Medium', 'String', '25 mins', 'https://leetcode.com/problems/integer-to-roman/', 7),
(77, 'Longest Common Prefix', 'Easy', 'String', '20 mins', 'https://leetcode.com/problems/longest-common-prefix/', 7),
(78, 'Group Anagrams', 'Medium', 'String', '25 mins', 'https://leetcode.com/problems/group-anagrams/', 7),
(79, 'Subsets', 'Medium', 'Backtracking', '25 mins', 'https://leetcode.com/problems/subsets/', 7),
(80, 'Subsets II', 'Medium', 'Backtracking', '30 mins', 'https://leetcode.com/problems/subsets-ii/', 7),

-- Week 8: Advanced Trees and Backtracking (Medium-Hard)
(81, 'Binary Tree Inorder Traversal', 'Easy', 'Binary Tree', '20 mins', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', 8),
(82, 'Binary Tree Preorder Traversal', 'Easy', 'Binary Tree', '20 mins', 'https://leetcode.com/problems/binary-tree-preorder-traversal/', 8),
(83, 'Binary Tree Postorder Traversal', 'Easy', 'Binary Tree', '20 mins', 'https://leetcode.com/problems/binary-tree-postorder-traversal/', 8),
(84, 'Serialize and Deserialize Binary Tree', 'Hard', 'Binary Tree', '35 mins', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', 8),
(85, 'Binary Tree Maximum Path Sum', 'Hard', 'Binary Tree', '35 mins', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', 8),
(86, 'Sum Root to Leaf Numbers', 'Medium', 'Binary Tree', '25 mins', 'https://leetcode.com/problems/sum-root-to-leaf-numbers/', 8),
(87, 'Count Complete Tree Nodes', 'Medium', 'Binary Tree', '30 mins', 'https://leetcode.com/problems/count-complete-tree-nodes/', 8),
(88, 'Lowest Common Ancestor of a Binary Tree', 'Medium', 'Binary Tree', '30 mins', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', 8),
(89, 'Permutations', 'Medium', 'Backtracking', '25 mins', 'https://leetcode.com/problems/permutations/', 8),
(90, 'Permutations II', 'Medium', 'Backtracking', '30 mins', 'https://leetcode.com/problems/permutations-ii/', 8),

-- Week 9: Advanced Dynamic Programming (Medium-Hard)
(91, 'Longest Palindromic Subsequence', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/longest-palindromic-subsequence/', 9),
(92, 'Longest Common Subsequence', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/longest-common-subsequence/', 9),
(93, 'Edit Distance', 'Hard', 'Dynamic Programming', '35 mins', 'https://leetcode.com/problems/edit-distance/', 9),
(94, 'Regular Expression Matching', 'Hard', 'Dynamic Programming', '40 mins', 'https://leetcode.com/problems/regular-expression-matching/', 9),
(95, 'Wildcard Matching', 'Hard', 'Dynamic Programming', '40 mins', 'https://leetcode.com/problems/wildcard-matching/', 9),
(96, 'Interleaving String', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/interleaving-string/', 9),
(97, 'Distinct Subsequences', 'Hard', 'Dynamic Programming', '35 mins', 'https://leetcode.com/problems/distinct-subsequences/', 9),
(98, 'Minimum Path Sum', 'Medium', 'Dynamic Programming', '25 mins', 'https://leetcode.com/problems/minimum-path-sum/', 9),
(99, 'Triangle', 'Medium', 'Dynamic Programming', '25 mins', 'https://leetcode.com/problems/triangle/', 9),
(100, 'Maximum Product Subarray', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/maximum-product-subarray/', 9),

-- Week 10: Advanced Graphs and Algorithms (Medium-Hard)
(101, 'Clone Graph', 'Medium', 'Graph', '30 mins', 'https://leetcode.com/problems/clone-graph/', 10),
(102, 'Pacific Atlantic Water Flow', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/pacific-atlantic-water-flow/', 10),
(103, 'Surrounded Regions', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/surrounded-regions/', 10),
(104, 'All Nodes Distance K in Binary Tree', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/', 10),
(105, 'Shortest Bridge', 'Medium', 'Graph', '40 mins', 'https://leetcode.com/problems/shortest-bridge/', 10),
(106, 'Sliding Puzzle', 'Hard', 'Graph', '45 mins', 'https://leetcode.com/problems/sliding-puzzle/', 10),
(107, 'Minimum Knight Moves', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/minimum-knight-moves/', 10),
(108, 'Open the Lock', 'Medium', 'Graph', '35 mins', 'https://leetcode.com/problems/open-the-lock/', 10),
(109, 'Word Ladder', 'Hard', 'Graph', '40 mins', 'https://leetcode.com/problems/word-ladder/', 10),
(110, 'Word Ladder II', 'Hard', 'Graph', '45 mins', 'https://leetcode.com/problems/word-ladder-ii/', 10),

-- Week 11: Advanced String and Array Problems (Medium-Hard)
(111, 'Longest Substring with At Most Two Distinct Characters', 'Medium', 'String', '25 mins', 'https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/', 11),
(112, 'Longest Substring with At Most K Distinct Characters', 'Medium', 'String', '30 mins', 'https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/', 11),
(113, 'Minimum Window Substring', 'Hard', 'String', '40 mins', 'https://leetcode.com/problems/minimum-window-substring/', 11),
(114, 'Substring with Concatenation of All Words', 'Hard', 'String', '45 mins', 'https://leetcode.com/problems/substring-with-concatenation-of-all-words/', 11),
(115, 'Find All Anagrams in a String', 'Medium', 'String', '30 mins', 'https://leetcode.com/problems/find-all-anagrams-in-a-string/', 11),
(116, 'Permutation in String', 'Medium', 'String', '30 mins', 'https://leetcode.com/problems/permutation-in-string/', 11),
(117, 'Longest Repeating Character Replacement', 'Medium', 'String', '30 mins', 'https://leetcode.com/problems/longest-repeating-character-replacement/', 11),
(118, 'Sliding Window Maximum', 'Hard', 'Array', '30 mins', 'https://leetcode.com/problems/sliding-window-maximum/', 11),
(119, 'Minimum Size Subarray Sum', 'Medium', 'Array', '25 mins', 'https://leetcode.com/problems/minimum-size-subarray-sum/', 11),
(120, 'Subarray Sum Equals K', 'Medium', 'Array', '25 mins', 'https://leetcode.com/problems/subarray-sum-equals-k/', 11),

-- Week 12: Advanced Tree and Binary Search Problems (Medium-Hard)
(121, 'Serialize and Deserialize BST', 'Medium', 'Binary Search Tree', '30 mins', 'https://leetcode.com/problems/serialize-and-deserialize-bst/', 12),
(122, 'Delete Node in a BST', 'Medium', 'Binary Search Tree', '30 mins', 'https://leetcode.com/problems/delete-node-in-a-bst/', 12),
(123, 'Insert into a Binary Search Tree', 'Medium', 'Binary Search Tree', '25 mins', 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', 12),
(124, 'Search in a Binary Search Tree', 'Easy', 'Binary Search Tree', '20 mins', 'https://leetcode.com/problems/search-in-a-binary-search-tree/', 12),
(125, 'Convert Sorted Array to Binary Search Tree', 'Easy', 'Binary Search Tree', '25 mins', 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', 12),
(126, 'Convert Sorted List to Binary Search Tree', 'Medium', 'Binary Search Tree', '30 mins', 'https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/', 12),
(127, 'Binary Search Tree Iterator', 'Medium', 'Binary Search Tree', '30 mins', 'https://leetcode.com/problems/binary-search-tree-iterator/', 12),
(128, 'Kth Smallest Element in a BST', 'Medium', 'Binary Search Tree', '25 mins', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', 12),
(129, 'Lowest Common Ancestor of a Binary Search Tree', 'Easy', 'Binary Search Tree', '20 mins', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', 12),
(130, 'Validate Binary Search Tree', 'Medium', 'Binary Search Tree', '25 mins', 'https://leetcode.com/problems/validate-binary-search-tree/', 12),

-- Week 13: Advanced Linked List Problems (Medium-Hard)
(131, 'Reverse Nodes in k-Group', 'Hard', 'Linked List', '40 mins', 'https://leetcode.com/problems/reverse-nodes-in-k-group/', 13),
(132, 'Merge k Sorted Lists', 'Hard', 'Linked List', '35 mins', 'https://leetcode.com/problems/merge-k-sorted-lists/', 13),
(133, 'Sort List', 'Medium', 'Linked List', '35 mins', 'https://leetcode.com/problems/sort-list/', 13),
(134, 'Reorder List', 'Medium', 'Linked List', '30 mins', 'https://leetcode.com/problems/reorder-list/', 13),
(135, 'Linked List Cycle II', 'Medium', 'Linked List', '25 mins', 'https://leetcode.com/problems/linked-list-cycle-ii/', 13),
(136, 'Copy List with Random Pointer', 'Medium', 'Linked List', '30 mins', 'https://leetcode.com/problems/copy-list-with-random-pointer/', 13),
(137, 'LRU Cache', 'Medium', 'Linked List', '35 mins', 'https://leetcode.com/problems/lru-cache/', 13),
(138, 'LFU Cache', 'Hard', 'Linked List', '45 mins', 'https://leetcode.com/problems/lfu-cache/', 13),
(139, 'All O`one Data Structure', 'Hard', 'Linked List', '45 mins', 'https://leetcode.com/problems/all-oone-data-structure/', 13),
(140, 'Design Linked List', 'Medium', 'Linked List', '30 mins', 'https://leetcode.com/problems/design-linked-list/', 13),

-- Week 14: Advanced Heap and Priority Queue Problems (Medium-Hard)
(141, 'Find Median from Data Stream', 'Hard', 'Heap', '30 mins', 'https://leetcode.com/problems/find-median-from-data-stream/', 14),
(142, 'Top K Frequent Elements', 'Medium', 'Heap', '25 mins', 'https://leetcode.com/problems/top-k-frequent-elements/', 14),
(143, 'Kth Largest Element in an Array', 'Medium', 'Heap', '25 mins', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 14),
(144, 'Merge k Sorted Lists', 'Hard', 'Heap', '35 mins', 'https://leetcode.com/problems/merge-k-sorted-lists/', 14),
(145, 'Ugly Number II', 'Medium', 'Heap', '30 mins', 'https://leetcode.com/problems/ugly-number-ii/', 14),
(146, 'Super Ugly Number', 'Medium', 'Heap', '35 mins', 'https://leetcode.com/problems/super-ugly-number/', 14),
(147, 'Find K Pairs with Smallest Sums', 'Medium', 'Heap', '30 mins', 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/', 14),
(148, 'Kth Smallest Element in a Sorted Matrix', 'Medium', 'Heap', '30 mins', 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/', 14),
(149, 'Smallest Range Covering Elements from K Lists', 'Hard', 'Heap', '40 mins', 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/', 14),
(150, 'Sliding Window Median', 'Hard', 'Heap', '40 mins', 'https://leetcode.com/problems/sliding-window-median/', 14),

-- Week 15: Advanced Backtracking and Recursion (Medium-Hard)
(151, 'N-Queens', 'Hard', 'Backtracking', '45 mins', 'https://leetcode.com/problems/n-queens/', 15),
(152, 'N-Queens II', 'Hard', 'Backtracking', '45 mins', 'https://leetcode.com/problems/n-queens-ii/', 15),
(153, 'Sudoku Solver', 'Hard', 'Backtracking', '50 mins', 'https://leetcode.com/problems/sudoku-solver/', 15),
(154, 'Valid Sudoku', 'Medium', 'Array', '25 mins', 'https://leetcode.com/problems/valid-sudoku/', 15),
(155, 'Generate Parentheses', 'Medium', 'Backtracking', '25 mins', 'https://leetcode.com/problems/generate-parentheses/', 15),
(156, 'Letter Combinations of a Phone Number', 'Medium', 'Backtracking', '25 mins', 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', 15),
(157, 'Combination Sum', 'Medium', 'Backtracking', '30 mins', 'https://leetcode.com/problems/combination-sum/', 15),
(158, 'Combination Sum II', 'Medium', 'Backtracking', '30 mins', 'https://leetcode.com/problems/combination-sum-ii/', 15),
(159, 'Combination Sum III', 'Medium', 'Backtracking', '30 mins', 'https://leetcode.com/problems/combination-sum-iii/', 15),
(160, 'Combination Sum IV', 'Medium', 'Dynamic Programming', '30 mins', 'https://leetcode.com/problems/combination-sum-iv/', 15),

-- Week 16: Advanced Design and System Problems (Medium-Hard)
(161, 'LRU Cache', 'Medium', 'Design', '35 mins', 'https://leetcode.com/problems/lru-cache/', 16),
(162, 'LFU Cache', 'Hard', 'Design', '45 mins', 'https://leetcode.com/problems/lfu-cache/', 16),
(163, 'Design Twitter', 'Medium', 'Design', '40 mins', 'https://leetcode.com/problems/design-twitter/', 16),
(164, 'Design Hit Counter', 'Medium', 'Design', '30 mins', 'https://leetcode.com/problems/design-hit-counter/', 16),
(165, 'Design Snake Game', 'Medium', 'Design', '35 mins', 'https://leetcode.com/problems/design-snake-game/', 16),
(166, 'Design Tic-Tac-Toe', 'Medium', 'Design', '30 mins', 'https://leetcode.com/problems/design-tic-tac-toe/', 16),
(167, 'Design Parking System', 'Easy', 'Design', '20 mins', 'https://leetcode.com/problems/design-parking-system/', 16),
(168, 'Design Underground System', 'Medium', 'Design', '35 mins', 'https://leetcode.com/problems/design-underground-system/', 16); 