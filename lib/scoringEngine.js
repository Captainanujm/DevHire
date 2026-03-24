// lib/scoringEngine.js

const FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "actually", "literally",
    "sort of", "kind of", "I mean", "right", "okay so", "so yeah",
    "well", "honestly", "obviously", "anyway", "just",
];

/**
 * Count filler words in text.
 */
export function countFillers(text) {
    const lower = text.toLowerCase();
    let count = 0;
    for (const filler of FILLER_WORDS) {
        const regex = new RegExp(`\\b${filler}\\b`, "gi");
        const matches = lower.match(regex);
        if (matches) count += matches.length;
    }
    return count;
}

/**
 * Calculate words per minute.
 * @param {string} text - The answer text
 * @param {number} durationSeconds - Time spent answering
 */
export function calculateWPM(text, durationSeconds) {
    if (!durationSeconds || durationSeconds <= 0) return 0;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.round((wordCount / durationSeconds) * 60);
}

/**
 * Match keywords relevant to the role and question.
 * Returns a score 0–100 based on keyword density.
 */
export function matchKeywords(text, role) {
    const keywordMap = {
        "Full Stack Developer": ["api", "database", "frontend", "backend", "react", "node", "express", "mongodb", "sql", "rest", "graphql", "authentication", "middleware", "deployment", "scalability", "testing", "ci/cd", "docker", "aws", "microservices"],
        "React Developer": ["component", "state", "props", "hooks", "usestate", "useeffect", "context", "redux", "virtual dom", "jsx", "rendering", "memo", "callback", "ref", "suspense", "lazy", "ssr", "next.js", "typescript", "reconciliation"],
        ".NET Developer": ["c#", "asp.net", "entity framework", "dependency injection", "middleware", "mvc", "razor", "linq", "async", "await", "nuget", "azure", "ef core", "migration", "web api", "controller", "model", "view"],
        "JavaScript Developer": ["closure", "prototype", "async", "await", "promise", "callback", "event loop", "scope", "hoisting", "es6", "arrow function", "destructuring", "spread", "rest", "module", "class", "this", "dom"],
        "Android Developer": ["activity", "fragment", "intent", "viewmodel", "livedata", "room", "retrofit", "recycler", "compose", "kotlin", "coroutine", "navigation", "mvvm", "repository", "dependency injection", "hilt"],
        "Data Science": ["model", "dataset", "feature", "training", "testing", "accuracy", "precision", "recall", "f1", "regression", "classification", "clustering", "neural network", "deep learning", "pandas", "numpy", "scikit", "tensorflow"],
    };

    const keywords = keywordMap[role] || [];
    if (keywords.length === 0) return 50;

    const lower = text.toLowerCase();
    let matched = 0;
    for (const kw of keywords) {
        if (lower.includes(kw)) matched++;
    }

    return Math.min(100, Math.round((matched / Math.min(keywords.length, 8)) * 100));
}

/**
 * Score answer depth based on length, structure, and specificity.
 */
export function scoreDepth(text) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let score = 0;

    // Length scoring
    if (wordCount >= 50) score += 25;
    else if (wordCount >= 30) score += 15;
    else if (wordCount >= 15) score += 8;

    // Example/scenario detection
    const exampleIndicators = ["for example", "for instance", "such as", "like when", "in my project", "in my experience", "i built", "i implemented", "i used", "real-world", "scenario"];
    for (const indicator of exampleIndicators) {
        if (text.toLowerCase().includes(indicator)) { score += 10; break; }
    }

    // Structured thinking detection
    const structureIndicators = ["first", "second", "third", "firstly", "then", "after that", "finally", "in addition", "moreover", "furthermore", "on the other hand", "however", "because", "therefore"];
    let structureHits = 0;
    for (const indicator of structureIndicators) {
        if (text.toLowerCase().includes(indicator)) structureHits++;
    }
    score += Math.min(25, structureHits * 8);

    // Specificity (numbers, metrics, tech names)
    const specificityRegex = /\d+|percent|%|milliseconds|seconds|users|requests|times faster/gi;
    const specificityMatches = text.match(specificityRegex);
    if (specificityMatches) score += Math.min(20, specificityMatches.length * 5);

    // Sentence variety
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    if (sentences.length >= 3) score += 10;
    if (sentences.length >= 5) score += 10;

    return Math.min(100, score);
}

/**
 * Calculate overall technical score.
 */
export function calculateTechnicalScore(answers, role) {
    if (!answers || answers.length === 0) return 0;

    let totalKeyword = 0;
    let totalDepth = 0;

    for (const ans of answers) {
        totalKeyword += matchKeywords(ans.text || "", role);
        totalDepth += scoreDepth(ans.text || "");
    }

    const avgKeyword = totalKeyword / answers.length;
    const avgDepth = totalDepth / answers.length;

    return Math.round(avgKeyword * 0.4 + avgDepth * 0.6);
}

/**
 * Calculate communication score.
 */
export function calculateCommunicationScore(answers) {
    if (!answers || answers.length === 0) return 0;

    let totalWPM = 0;
    let totalFillers = 0;
    let totalWords = 0;

    for (const ans of answers) {
        const text = ans.text || "";
        const duration = ans.duration || 60;
        totalWPM += calculateWPM(text, duration);
        totalFillers += countFillers(text);
        totalWords += text.trim().split(/\s+/).filter(Boolean).length;
    }

    const avgWPM = totalWPM / answers.length;

    // WPM score (ideal: 120-160 WPM)
    let wpmScore;
    if (avgWPM >= 120 && avgWPM <= 160) wpmScore = 100;
    else if (avgWPM >= 90 && avgWPM <= 180) wpmScore = 75;
    else if (avgWPM >= 60) wpmScore = 50;
    else wpmScore = 25;

    // Filler penalty
    const fillerRate = totalWords > 0 ? (totalFillers / totalWords) * 100 : 0;
    let fillerPenalty = 0;
    if (fillerRate > 5) fillerPenalty = 30;
    else if (fillerRate > 3) fillerPenalty = 20;
    else if (fillerRate > 1) fillerPenalty = 10;

    return Math.max(0, Math.min(100, Math.round(wpmScore - fillerPenalty)));
}

/**
 * Generate full score summary for an interview session.
 */
export function generateScoreSummary(answers, role) {
    const technical = calculateTechnicalScore(answers, role);
    const communication = calculateCommunicationScore(answers);
    const overall = Math.round(technical * 0.6 + communication * 0.4);

    let totalWPM = 0;
    let totalFillers = 0;
    let totalKeywords = 0;

    for (const ans of answers) {
        const text = ans.text || "";
        totalWPM += calculateWPM(text, ans.duration || 60);
        totalFillers += countFillers(text);
        totalKeywords += matchKeywords(text, role);
    }

    const avgDepth = answers.length > 0
        ? Math.round(answers.reduce((sum, a) => sum + scoreDepth(a.text || ""), 0) / answers.length)
        : 0;

    return {
        technical,
        communication,
        overall,
        wpm: answers.length > 0 ? Math.round(totalWPM / answers.length) : 0,
        fillerCount: totalFillers,
        keywordMatches: Math.round(totalKeywords / Math.max(1, answers.length)),
        depthScore: avgDepth,
    };
}
