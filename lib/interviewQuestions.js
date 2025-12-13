// lib/interviewQuestions.js

export const INTERVIEW_ROLES = [
  "Full Stack Developer",
  "React Developer",
  ".NET Developer",
  "JavaScript Developer",
  "Android Developer",
  "Data Science",
];

export const INTERVIEW_DIFFICULTIES = ["Easy", "Medium", "Hard"];

// Simple static questions per role + difficulty.
// You can expand these later or move them to DB / Module 4.
const QUESTION_BANK = {
  "Full Stack Developer": {
    Easy: [
      "Introduce yourself and describe your experience with full stack development.",
      "What is the difference between SQL and NoSQL databases?",
      "Explain what REST API is in simple words.",
    ],
    Medium: [
      "How do you design authentication in a MERN stack application?",
      "Explain the concept of middleware in Node.js with an example.",
      "How would you structure a scalable full stack project?",
    ],
    Hard: [
      "Describe how you would design a high-traffic scalable system like an e-commerce platform.",
      "Explain event-driven architecture and where you would use it in full stack apps.",
      "How do you handle security concerns such as XSS, CSRF and SQL injection?",
    ],
  },
  "React Developer": {
    Easy: [
      "Introduce yourself and tell me about your journey with React.",
      "What are React components?",
      "What is the difference between state and props?",
    ],
    Medium: [
      "Explain React reconciliation and keys in lists.",
      "How do you optimize performance in a large React application?",
      "What is React Context and when would you use it?",
    ],
    Hard: [
      "Explain how you would design a large-scale React application with complex state management.",
      "Compare different state management approaches like Context, Redux, and Zustand.",
      "How do you handle code splitting and lazy loading in React?",
    ],
  },
  ".NET Developer": {
    Easy: [
      "Introduce yourself and share your experience with .NET.",
      "What is the Common Language Runtime in .NET?",
      "Explain the difference between a class and an interface.",
    ],
    Medium: [
      "Explain dependency injection in .NET and why it is useful.",
      "How do you design a layered architecture in a .NET application?",
      "Explain Entity Framework and how migrations work.",
    ],
    Hard: [
      "How would you design a microservice architecture using .NET?",
      "Explain how to implement caching and logging in a large .NET system.",
      "How would you handle concurrency and async programming in .NET?",
    ],
  },
  "JavaScript Developer": {
    Easy: [
      "Introduce yourself and your experience with JavaScript.",
      "What is the difference between var, let and const?",
      "Explain what closures are.",
    ],
    Medium: [
      "Explain event loop and call stack in JavaScript.",
      "How do you handle asynchronous operations in JavaScript?",
      "What are higher-order functions?",
    ],
    Hard: [
      "Explain prototype chain and how inheritance works in JavaScript.",
      "How would you structure a large vanilla JavaScript application?",
      "Explain debouncing and throttling with real use cases.",
    ],
  },
  "Android Developer": {
    Easy: [
      "Introduce yourself and describe your Android experience.",
      "What is an Activity in Android?",
      "Explain the difference between an Activity and a Fragment.",
    ],
    Medium: [
      "Explain MVVM architecture in Android.",
      "How do you manage network calls and caching in Android apps?",
      "How do you handle data persistence on Android?",
    ],
    Hard: [
      "Describe how you would design an offline-first Android application.",
      "Explain performance optimization techniques in Android apps.",
      "How would you architect a large modular Android codebase?",
    ],
  },
  "Data Science": {
    Easy: [
      "Introduce yourself and your experience in data science.",
      "What is the difference between supervised and unsupervised learning?",
      "Explain overfitting in simple words.",
    ],
    Medium: [
      "How do you handle missing data in a dataset?",
      "Explain precision, recall and F1-score.",
      "Walk me through a machine learning project you have done.",
    ],
    Hard: [
      "Explain regularization and why it is important.",
      "How do you design an end-to-end ML pipeline for production?",
      "Talk about bias-variance trade-off with an example.",
    ],
  },
};

export function getStaticQuestions(role, difficulty) {
  const roleBank = QUESTION_BANK[role];
  if (!roleBank) return [];

  const list = roleBank[difficulty] || [];
  // Ensure max 15; if you later have more than 15, slice.
  return list.slice(0, 15);
}
