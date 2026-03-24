// Simple validation utilities (no external dependency needed)

export function validateEmail(email) {
    if (!email || typeof email !== "string") return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

export function validatePassword(password) {
    if (!password || typeof password !== "string") return false;
    return password.length >= 6;
}

export function validateRequired(value, fieldName) {
    if (!value || (typeof value === "string" && !value.trim())) {
        return `${fieldName} is required`;
    }
    return null;
}

export function validateRegister({ name, email, password }) {
    const errors = [];
    const nameErr = validateRequired(name, "Name");
    if (nameErr) errors.push(nameErr);
    if (!validateEmail(email)) errors.push("Valid email is required");
    if (!validatePassword(password)) errors.push("Password must be at least 6 characters");
    return errors;
}

export function validateLogin({ email, password }) {
    const errors = [];
    if (!validateEmail(email)) errors.push("Valid email is required");
    if (!password) errors.push("Password is required");
    return errors;
}

export function validateInterviewCreate({ jobRole, difficulty, numberOfQuestions, vacancyCount }) {
    const errors = [];
    if (!jobRole || !jobRole.trim()) errors.push("Job role is required");
    if (!["Easy", "Medium", "Hard"].includes(difficulty)) errors.push("Difficulty must be Easy, Medium, or Hard");
    const num = parseInt(numberOfQuestions);
    if (isNaN(num) || num < 1 || num > 50) errors.push("Number of questions must be 1-50");
    const vac = parseInt(vacancyCount);
    if (isNaN(vac) || vac < 1) errors.push("Vacancy count must be at least 1");
    return errors;
}

export function sanitizeString(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[${}]/g, "").trim();
}
