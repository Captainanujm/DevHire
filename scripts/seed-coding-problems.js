/**
 * Seed script: Inserts 30 coding problems into the database.
 * Run: node scripts/seed-coding-problems.js
 * 
 * Uses ES module syntax. Requires dotenv for DB connection string.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
}

// Inline schema to avoid import issues with Next.js aliases
const CodingProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    description: { type: String, required: true },
    example: { type: String, default: "" },
    testCases: [{
        input: { type: String, default: "" },
        expectedOutput: { type: String, default: "" },
        isHidden: { type: Boolean, default: false }
    }],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const CodingProblem = mongoose.models.CodingProblem || mongoose.model("CodingProblem", CodingProblemSchema);

const PROBLEMS = [
    // ==================== EASY (10) ====================
    {
        title: "Two Sum",
        difficulty: "Easy",
        tags: ["Array", "Hash Map"],
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer in any order.",
        example: "Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9, so return [0, 1].",
        testCases: [
            { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
            { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
            { input: "[3,3]\n6", expectedOutput: "[0,1]" },
        ],
    },
    {
        title: "Reverse String",
        difficulty: "Easy",
        tags: ["String", "Two Pointers"],
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        example: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
        testCases: [
            { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
        ],
    },
    {
        title: "FizzBuzz",
        difficulty: "Easy",
        tags: ["Math", "String"],
        description: "Given an integer `n`, return a string array `answer` (1-indexed) where:\n\n- `answer[i] == \"FizzBuzz\"` if `i` is divisible by 3 and 5.\n- `answer[i] == \"Fizz\"` if `i` is divisible by 3.\n- `answer[i] == \"Buzz\"` if `i` is divisible by 5.\n- `answer[i] == i` (as a string) otherwise.",
        example: 'Input: n = 5\nOutput: ["1","2","Fizz","4","Buzz"]',
        testCases: [
            { input: "3", expectedOutput: '["1","2","Fizz"]' },
            { input: "5", expectedOutput: '["1","2","Fizz","4","Buzz"]' },
            { input: "15", expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
        ],
    },
    {
        title: "Palindrome Number",
        difficulty: "Easy",
        tags: ["Math"],
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\n\nFor example, 121 is a palindrome while 123 is not.",
        example: "Input: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and from right to left.",
        testCases: [
            { input: "121", expectedOutput: "true" },
            { input: "-121", expectedOutput: "false" },
            { input: "10", expectedOutput: "false" },
        ],
    },
    {
        title: "Roman to Integer",
        difficulty: "Easy",
        tags: ["Hash Map", "Math", "String"],
        description: "Roman numerals are represented by seven symbols: I, V, X, L, C, D, and M.\n\nGiven a roman numeral, convert it to an integer.\n\nSymbol → Value: I=1, V=5, X=10, L=50, C=100, D=500, M=1000\n\nRoman numerals are usually written largest to smallest from left to right. However, there are six subtraction cases (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900).",
        example: 'Input: s = "MCMXCIV"\nOutput: 1994\nExplanation: M=1000, CM=900, XC=90, IV=4.',
        testCases: [
            { input: "III", expectedOutput: "3" },
            { input: "LVIII", expectedOutput: "58" },
            { input: "MCMXCIV", expectedOutput: "1994" },
        ],
    },
    {
        title: "Valid Anagram",
        difficulty: "Easy",
        tags: ["Hash Map", "String", "Sorting"],
        description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
        example: 'Input: s = "anagram", t = "nagaram"\nOutput: true',
        testCases: [
            { input: "anagram\nnagaram", expectedOutput: "true" },
            { input: "rat\ncar", expectedOutput: "false" },
        ],
    },
    {
        title: "Missing Number",
        difficulty: "Easy",
        tags: ["Array", "Math", "Bit Manipulation"],
        description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
        example: "Input: nums = [3, 0, 1]\nOutput: 2\nExplanation: n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number.",
        testCases: [
            { input: "[3,0,1]", expectedOutput: "2" },
            { input: "[0,1]", expectedOutput: "2" },
            { input: "[9,6,4,2,3,5,7,0,1]", expectedOutput: "8" },
        ],
    },
    {
        title: "Power of Two",
        difficulty: "Easy",
        tags: ["Math", "Bit Manipulation"],
        description: "Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`.\n\nAn integer `n` is a power of two if there exists an integer `x` such that `n == 2^x`.",
        example: "Input: n = 16\nOutput: true\nExplanation: 2^4 = 16",
        testCases: [
            { input: "1", expectedOutput: "true" },
            { input: "16", expectedOutput: "true" },
            { input: "3", expectedOutput: "false" },
        ],
    },
    {
        title: "Contains Duplicate",
        difficulty: "Easy",
        tags: ["Array", "Hash Map", "Sorting"],
        description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        example: "Input: nums = [1, 2, 3, 1]\nOutput: true\nExplanation: The element 1 occurs at indices 0 and 3.",
        testCases: [
            { input: "[1,2,3,1]", expectedOutput: "true" },
            { input: "[1,2,3,4]", expectedOutput: "false" },
            { input: "[1,1,1,3,3,4,3,2,4,2]", expectedOutput: "true" },
        ],
    },
    {
        title: "Plus One",
        difficulty: "Easy",
        tags: ["Array", "Math"],
        description: "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order.\n\nIncrement the large integer by one and return the resulting array of digits.",
        example: "Input: digits = [1, 2, 3]\nOutput: [1, 2, 4]\nExplanation: The array represents the integer 123. Incrementing by one gives 124.",
        testCases: [
            { input: "[1,2,3]", expectedOutput: "[1,2,4]" },
            { input: "[4,3,2,1]", expectedOutput: "[4,3,2,2]" },
            { input: "[9]", expectedOutput: "[1,0]" },
        ],
    },

    // ==================== MEDIUM (12) ====================
    {
        title: "Valid Parentheses",
        difficulty: "Medium",
        tags: ["String", "Stack"],
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        example: "Input: s = \"()[]{}\"\nOutput: true",
        testCases: [
            { input: "()", expectedOutput: "true" },
            { input: "()[]{}", expectedOutput: "true" },
            { input: "(]", expectedOutput: "false" },
        ],
    },
    {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        tags: ["String", "Hash Map", "Sliding Window"],
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        example: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
        testCases: [
            { input: "abcabcbb", expectedOutput: "3" },
            { input: "bbbbb", expectedOutput: "1" },
            { input: "pwwkew", expectedOutput: "3" },
        ],
    },
    {
        title: "Group Anagrams",
        difficulty: "Medium",
        tags: ["Array", "Hash Map", "String", "Sorting"],
        description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
        example: 'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]',
        testCases: [
            { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
            { input: '[""]', expectedOutput: '[[""]]' },
            { input: '["a"]', expectedOutput: '[["a"]]' },
        ],
    },
    {
        title: "Merge Intervals",
        difficulty: "Medium",
        tags: ["Array", "Sorting"],
        description: "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        example: "Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
        testCases: [
            { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
            { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" },
        ],
    },
    {
        title: "Product of Array Except Self",
        difficulty: "Medium",
        tags: ["Array", "Prefix Sum"],
        description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
        example: "Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]",
        testCases: [
            { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" },
            { input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]" },
        ],
    },
    {
        title: "3Sum",
        difficulty: "Medium",
        tags: ["Array", "Two Pointers", "Sorting"],
        description: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
        example: "Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]",
        testCases: [
            { input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]" },
            { input: "[0,1,1]", expectedOutput: "[]" },
            { input: "[0,0,0]", expectedOutput: "[[0,0,0]]" },
        ],
    },
    {
        title: "Container With Most Water",
        difficulty: "Medium",
        tags: ["Array", "Two Pointers", "Greedy"],
        description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `ith` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container that holds the most water.\n\nReturn the maximum amount of water a container can store.",
        example: "Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: The vertical lines at index 1 and 8 form a container with area = min(8,7) * (8-1) = 49.",
        testCases: [
            { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" },
            { input: "[1,1]", expectedOutput: "1" },
        ],
    },
    {
        title: "Rotate Image",
        difficulty: "Medium",
        tags: ["Array", "Math", "Matrix"],
        description: "You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n\nYou have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.",
        example: "Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]",
        testCases: [
            { input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[[7,4,1],[8,5,2],[9,6,3]]" },
        ],
    },
    {
        title: "Spiral Matrix",
        difficulty: "Medium",
        tags: ["Array", "Matrix", "Simulation"],
        description: "Given an `m x n` matrix, return all elements of the matrix in spiral order.",
        example: "Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]",
        testCases: [
            { input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[1,2,3,6,9,8,7,4,5]" },
            { input: "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]", expectedOutput: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
        ],
    },
    {
        title: "Set Matrix Zeroes",
        difficulty: "Medium",
        tags: ["Array", "Hash Map", "Matrix"],
        description: "Given an `m x n` integer matrix, if an element is `0`, set its entire row and column to `0's`.\n\nYou must do it in place.",
        example: "Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]",
        testCases: [
            { input: "[[1,1,1],[1,0,1],[1,1,1]]", expectedOutput: "[[1,0,1],[0,0,0],[1,0,1]]" },
            { input: "[[0,1,2,0],[3,4,5,2],[1,3,1,5]]", expectedOutput: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
        ],
    },
    {
        title: "Jump Game",
        difficulty: "Medium",
        tags: ["Array", "Dynamic Programming", "Greedy"],
        description: "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn `true` if you can reach the last index, or `false` otherwise.",
        example: "Input: nums = [2,3,1,1,4]\nOutput: true\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.",
        testCases: [
            { input: "[2,3,1,1,4]", expectedOutput: "true" },
            { input: "[3,2,1,0,4]", expectedOutput: "false" },
        ],
    },
    {
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        tags: ["Array", "Binary Search"],
        description: "There is an integer array `nums` sorted in ascending order (with distinct values). Prior to being passed to your function, `nums` is possibly rotated at an unknown pivot.\n\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not.\n\nYou must write an algorithm with O(log n) runtime complexity.",
        example: "Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4",
        testCases: [
            { input: "[4,5,6,7,0,1,2]\n0", expectedOutput: "4" },
            { input: "[4,5,6,7,0,1,2]\n3", expectedOutput: "-1" },
            { input: "[1]\n0", expectedOutput: "-1" },
        ],
    },

    // ==================== HARD (8) ====================
    {
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        tags: ["Array", "Binary Search", "Divide and Conquer"],
        description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
        example: "Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.0\nExplanation: merged = [1,2,3] and median is 2.",
        testCases: [
            { input: "[1,3]\n[2]", expectedOutput: "2.0" },
            { input: "[1,2]\n[3,4]", expectedOutput: "2.5" },
        ],
    },
    {
        title: "Merge K Sorted Lists",
        difficulty: "Hard",
        tags: ["Linked List", "Divide and Conquer", "Heap"],
        description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
        example: "Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\nExplanation: Merging the linked lists into one sorted list.",
        testCases: [
            { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" },
            { input: "[]", expectedOutput: "[]" },
        ],
    },
    {
        title: "Trapping Rain Water",
        difficulty: "Hard",
        tags: ["Array", "Two Pointers", "Stack", "Dynamic Programming"],
        description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        example: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: 6 units of rain water are trapped.",
        testCases: [
            { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
            { input: "[4,2,0,3,2,5]", expectedOutput: "9" },
        ],
    },
    {
        title: "Minimum Window Substring",
        difficulty: "Hard",
        tags: ["Hash Map", "String", "Sliding Window"],
        description: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window.\n\nIf there is no such substring, return the empty string \"\".",
        example: 'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"\nExplanation: The minimum window substring "BANC" includes A, B, and C.',
        testCases: [
            { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC" },
            { input: "a\na", expectedOutput: "a" },
            { input: "a\naa", expectedOutput: "" },
        ],
    },
    {
        title: "Longest Valid Parentheses",
        difficulty: "Hard",
        tags: ["String", "Stack", "Dynamic Programming"],
        description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
        example: 'Input: s = "(()"\nOutput: 2\nExplanation: The longest valid parentheses substring is "()".',
        testCases: [
            { input: "(()", expectedOutput: "2" },
            { input: ")()())", expectedOutput: "4" },
            { input: "", expectedOutput: "0" },
        ],
    },
    {
        title: "N-Queens",
        difficulty: "Hard",
        tags: ["Array", "Backtracking"],
        description: "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.\n\nGiven an integer `n`, return all distinct solutions to the n-queens puzzle. Each solution contains a distinct board configuration with 'Q' and '.' representing a queen and empty space respectively.",
        example: 'Input: n = 4\nOutput: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]\nExplanation: There exist two distinct solutions.',
        testCases: [
            { input: "4", expectedOutput: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
            { input: "1", expectedOutput: '[["Q"]]' },
        ],
    },
    {
        title: "Word Ladder",
        difficulty: "Hard",
        tags: ["Hash Map", "String", "BFS"],
        description: "A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that:\n\n- Every adjacent pair of words differs by a single letter.\n- Every `si` is in `wordList`.\n- `sk == endWord`.\n\nGiven `beginWord`, `endWord`, and `wordList`, return the number of words in the shortest transformation sequence, or 0 if none exists.",
        example: 'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5\nExplanation: hit → hot → dot → dog → cog',
        testCases: [
            { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: "5" },
            { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: "0" },
        ],
    },
    {
        title: "Regular Expression Matching",
        difficulty: "Hard",
        tags: ["String", "Dynamic Programming", "Recursion"],
        description: "Given an input string `s` and a pattern `p`, implement regular expression matching with support for '.' and '*' where:\n\n- '.' Matches any single character.\n- '*' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
        example: 'Input: s = "aa", p = "a*"\nOutput: true\nExplanation: \'*\' means zero or more of the preceding element, \'a\'. Therefore, by repeating \'a\' once, it becomes "aa".',
        testCases: [
            { input: "aa\na", expectedOutput: "false" },
            { input: "aa\na*", expectedOutput: "true" },
            { input: "ab\n.*", expectedOutput: "true" },
        ],
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const existingCount = await CodingProblem.countDocuments();
        console.log(`📊 Existing problems: ${existingCount}`);

        let inserted = 0;
        for (const prob of PROBLEMS) {
            const exists = await CodingProblem.findOne({ title: prob.title });
            if (!exists) {
                await CodingProblem.create({ ...prob, isActive: true });
                inserted++;
                console.log(`  ✅ Inserted: ${prob.title}`);
            } else {
                console.log(`  ⏭️  Skipped (exists): ${prob.title}`);
            }
        }

        const finalCount = await CodingProblem.countDocuments();
        console.log(`\n🎉 Done! Inserted ${inserted} new problems. Total: ${finalCount}`);
    } catch (err) {
        console.error("❌ Seed error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
