# ⚡ Nerofea – The Ultimate DSA Note-Taking & Study App

**Nerofea** is a modern, AI-powered note-taking and DSA study app crafted specifically for learners of **Data Structures & Algorithms**. It offers smart notes, AI support, curated questions, personalized study plans, and progress tracking — all in one sleek platform.

---

## 🚀 Features

- 🔖 **Smart Note-Taking**  
  Rich editor with topic-based organization, concept linking, and custom writing.

- 🤖 **AI-Powered Help**  
  Get concept explanations, doubt resolution, research, and summarizations — powered by AI.

- 🧠 **Personalized Study Plans**  
  Create DSA study plans tailored to your schedule and skill level.

- 📚 **DSA Question Bank**  
  169+ curated problems with filters by topic & difficulty for focused practice.

- 📎 **File Attachments**  
  Attach images, PDFs, and files to your notes seamlessly.

- 📈 **Progress Tracking**  
  Track your study plan progress and DSA problem-solving journey.

- 🔍 **Instant Search**  
  Lightning-fast search across notes and questions.

- 🎨 **Beautiful UI**  
  Minimal, modern, and responsive design for a distraction-free experience.

---

## 🧭 App Flow

1. **Take Notes** → Use rich editor + topic organization + concept linking  
2. **Get AI Help** → Ask questions, clear doubts, get explanations or summaries  
3. **Study Planning** → Generate a custom DSA study plan with AI  
4. **Practice & Track** → Solve questions and monitor your progress over time

---

## 🛠️ Tech Stack

| Layer      | Tech                                                                 |
|------------|----------------------------------------------------------------------|
| Frontend   | Next.js 14 (App Router), React, TailwindCSS, shadcn/ui, Framer Motion, GSAP |
| Backend    | Supabase (Auth, Database, Storage, Edge Functions)                  |
| AI         | OpenAI, Groq, HuggingFace, Tavily (via Supabase Edge Functions)     |

---

## 📁 Folder Structure
```
new/
├── src/
│ ├── app/ # Next.js app routes & layout
│ ├── components/ # UI components (Notes, Editor, Sidebar, etc.)
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utility functions/helpers
│ └── supabaseClient.ts # Supabase initialization
├── supabase/ # Edge functions, SQL migrations
├── public/ # Static files (logo, images)
├── .env.local # Environment variables (after setup)
├── package.json # Project dependencies & scripts
└── README.md # Project documentation 

---
```
## ⚡ Getting Started

### 1. Clone the Repo & Install Dependencies

```bash
git clone <repo-url>
cd new
npm install
```

### 2. Setup Supabase
Go to Supabase and create a new project.

Copy .env.example → .env.local and paste your Supabase credentials.

Run the SQL migrations inside the supabase/migrations/ folder.

### 3. Run Locally
bash
Copy
Edit
npm run dev


## ❤️ Made for DSA Learners

**Smart Notes. Smart Study. Smart Future.**
by karn
