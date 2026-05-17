# 🚀 poorplexity — Your Own Perplexity Clone

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Express](https://img.shields.io/badge/Express-111111?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Prisma](https://img.shields.io/badge/Prisma-0C344B?style=for-the-badge&logo=prisma&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge)
![Tavily](https://img.shields.io/badge/Tavily-Web_Search-blue?style=for-the-badge)

### 🔥 A full-stack Perplexity clone built from scratch

**AI-powered conversational search engine with live web search, source citations, follow-up questioning, conversation history, authentication, and streaming AI responses.**

</div>

---

## 🎬 Demo

### 📸 Product Screenshot

![Demo Screenshot](./assets/demo.png)

---

### 🎥 Full Product Walkthrough

👉 [Watch Demo Video](./assets/demoVid.mp4)

### Live Streaming AI Experience

![AI Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHJmMjl5MnQ1MjM2d3JvYnZ1ZGg4bzFrMXNmN2x2MGlmMTRmMGQ2aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/coxQHKASG60HrHtvkt/giphy.gif)

---

## ✨ What this does

This project recreates the **core Perplexity AI experience**.

Ask anything.

The system:

✅ searches the live web  
✅ retrieves relevant sources  
✅ performs context engineering  
✅ sends grounded context to the LLM  
✅ streams the response token-by-token  
✅ shows cited source cards  
✅ supports follow-up questioning  
✅ persists conversations  
✅ supports user authentication  

---

## 🧠 Features

### 🔎 AI Search Engine
Ask natural language questions like:

> "What recent global events could impact crypto in the long run?"

The backend:
- performs live web search via Tavily
- collects trusted sources
- injects retrieved context into prompt templates
- generates grounded answers using LLMs

---

### ⚡ Streaming Responses
Perplexity-style real-time streaming output.

No waiting for the entire response.

Response tokens stream instantly to the frontend.

---

### 📚 Source Attribution
Every answer includes source references gathered from web search.

Users can inspect supporting material.

---

### 🔁 Follow-up Conversations
Maintain conversational context just like Perplexity.

Ask:

> “what about the long-term implications?”

without restating the full question.

---

### 🔐 Authentication
OAuth login via:

- Google
- GitHub

Authenticated users get:

- protected routes
- personal conversations
- user-linked chat persistence

---

### 💾 Persistent Conversations
Conversation history is stored in PostgreSQL via Prisma.

Users can revisit old threads.

---

### 🧱 Middleware-based Auth Architecture
Secure backend auth flow using Supabase JWT verification middleware.

Flow:

```text
Frontend Login
    ↓
Supabase OAuth
    ↓
JWT issued
    ↓
Express middleware verifies JWT
    ↓
User identity attached to request
    ↓
Protected route executes
```

---

## 🏗 Architecture

```text
                ┌────────────────────┐
                │    React Frontend   │
                │   (Vite + TS)       │
                └─────────┬──────────┘
                          │
                          │ HTTP Requests
                          ▼
                ┌────────────────────┐
                │   Express Backend   │
                │      (Bun)          │
                └─────────┬──────────┘
                          │
          ┌───────────────┼────────────────────┐
          │               │                    │
          ▼               ▼                    ▼
 ┌────────────────┐ ┌───────────────┐ ┌─────────────────┐
 │ Supabase Auth  │ │ Tavily Search │ │   Groq LLM API  │
 └────────────────┘ └───────────────┘ └─────────────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   Prompt Grounding │
                │ Context Engineering│
                └────────────────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ PostgreSQL Database │
                │   via Prisma ORM    │
                └────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Supabase Auth

### Backend
- Bun
- Express
- TypeScript
- Prisma ORM

### AI / Search
- Groq
- Tavily Search API

### Database
- PostgreSQL (Supabase)

### Authentication
- Supabase OAuth
- Google OAuth
- GitHub OAuth

---

## 📂 Project Structure

```bash
poorplexity/
│
├── frontend/        # React frontend
├── backend/         # Express + Bun backend
├── dist/            # Build output
├── package.json
└── bun.lock
```

---

## ⚙️ Environment Variables

Create the following environment files before running locally.

---

### Backend `.env`

```env
# Web Search
TAVILY_API_KEY=

# LLM Provider
GROQ_API_KEY=

# Optional (only if using Vercel AI Gateway instead of Groq)
AI_GATEWAY_API_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# Supabase
SUPABASE_URL=
SUPABASE_API_SECRET=

# OAuth Providers
GITHUB_CLIENTID=
GITHUB_OAUTH_SECRET=

GOOGLE_OAUTH_CLIENTID=
GOOGLE_OAUTH_SECRET=
```

Example:

```env
TAVILY_API_KEY=tvly_xxxxxxxxx

GROQ_API_KEY=gsk_xxxxxxxxx

DATABASE_URL=postgresql://username:password@host:5432/postgres
DIRECT_URL=postgresql://username:password@host:5432/postgres

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_SECRET=your_service_role_key

GITHUB_CLIENTID=your_github_client_id
GITHUB_OAUTH_SECRET=your_github_client_secret

GOOGLE_OAUTH_CLIENTID=your_google_client_id
GOOGLE_OAUTH_SECRET=your_google_client_secret
```

---

### Frontend `.env`

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_BACKEND_URL=
```

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_BACKEND_URL=http://localhost:3001
```

## 🚀 Local Setup

### 1. Clone repo

```bash
git clone https://github.com/fasi-0p/poorplexity.git
cd poorplexity
```

---

### 2. Install dependencies

Backend:

```bash
bun install
```

Frontend:

```bash
cd frontend
npm install
```

---

### 3. Setup database

Run Prisma migration / sync:

```bash
cd backend
bunx prisma db push
bunx prisma generate
```

---

### 4. Start backend

```bash
bun --watch backend/index.ts
```

Runs on:

```text
http://localhost:3001
```

---

### 5. Start frontend

```bash
cd frontend
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

## API Endpoints

### AI Query

```http
POST /poorplexity_ask
```

Protected route.

Streams grounded AI response.

---

### Follow-up Query

```http
POST /poorplexity_ask/follow_up
```

Protected route.

Uses prior conversation context.

---

### Conversations

```http
GET /conversations
```

Protected route.

Fetch all user threads.

---

### Single Conversation

```http
POST /conversation/:conversationId
```

Protected route.

Retrieve / continue a thread.

---

## Why this project matters

This is not a toy chatbot.

This is a production-style AI application involving:

- retrieval augmented generation principles
- real-time streaming
- auth middleware
- database persistence
- external API orchestration
- backend-first architecture
- prompt grounding
- full-stack integration

This demonstrates practical AI engineering + product engineering.

---

## Future Improvements

- semantic caching
- vector memory
- citation ranking
- multi-model routing
- rate limiting / credit system
- markdown rendering
- code answer formatting
- conversation sharing
- PDF export
- multi-tenant SaaS deployment

---

## Author

Built by **Fasi Owaiz Ahmed** ⚡

AI Engineer | Full Stack Builder | Applied AI Systems

---

## Star this repo ⭐

If you like the project, drop a star.

```
Built because using Perplexity is cool.

Rebuilding it is cooler.
```
