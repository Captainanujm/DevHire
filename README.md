# DevHire: AI-Powered Hiring & Interview Platform 🚀

DevHire is a cutting-edge, AI-driven hiring platform built with Next.js. It bridges the gap between recruiters and candidates by providing an all-in-one ecosystem for live AI video interviews, coding assessments, resume building, and comprehensive performance analytics.

## ✨ Key Features

- **🤖 AI-Powered Video Interviews:** Replaces traditional MCQ assessments with dynamic, live conversational AI interviews. Uses Gemini & Groq for real-time theoretical and coding question generation and assessment.
- **🧑‍💻 Built-in Coding Environment:** Integrated Monaco editor for live coding problems, complete with a robust anti-cheat system.
- **📄 Smart Resume Builder:** A native tool for candidates to create, validate, and export ATS-friendly resumes (with PDF export support).
- **📊 Role-Based Dashboards:** Distinct, feature-rich dashboards for **Students**, **Recruiters**, and **Admins**. Includes data visualization via Recharts.
- **🛡️ Secure & Scalable:** Custom JWT authentication, role-based access control (RBAC), and MongoDB for reliable data modeling.
- **💅 Premium UI/UX:** Styled with Tailwind CSS, Radix UI primitives, and sophisticated animations via Framer Motion for a deeply engaging user experience.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** MongoDB via Mongoose
- **Styling & UI:** Tailwind CSS, Radix UI, Framer Motion, Recharts, Lucide Icons
- **AI & Integrations:** 
  - `@google/generative-ai` (Gemini)
  - `groq-sdk`
  - `Daily` (Video SDK)
- **Media Storage:** Cloudinary
- **Developer Tools:** `@monaco-editor/react`, `html-pdf-node`, `bcryptjs`, `jose`

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository and install dependencies

```bash
npm install
# or
yarn install
```

### 2. Set up Environment Variables

Create a `.env.local` file in the root directory and add the following keys with your own credentials:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Video & Voice Infrastructure
DAILY_API_KEY=your_daily_api_key
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

```text
├── app/               # Next.js App Router (Pages, API Routes, Layouts)
│   ├── api/           # Backend API routes (Admin, Auth, Student, Practice)
│   ├── dashboard/     # Role-based dashboards (Admin, Recruiter, Student)
│   ├── interview/     # Live AI video interview and assessment views
│   ├── profile/       # User profile management
│   └── resume-builder/# Built-in ATS resume generator
├── components/        # Reusable UI components (Navbars, Sidebars, Cards)
│   ├── resume/        # Specific resume builder components
│   └── ui/            # Base UI primitives (Radix)
├── lib/               # Utility functions, AI Prompts, DB Connection, Rate Limiting
└── models/            # Mongoose schemas (User, InterviewSession, CodingProblem, etc.)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.
