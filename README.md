# 🦊 Kitsune Planning Poker

A real-time, collaborative SCRUM Poker web app built for agile teams who want fast and delightful estimation sessions — without the login friction.

## ✨ Features

- ✅ Real-time sessions with Supabase
- 🃏 Estimation grid with customizable rounds
- 🔐 No auth required — just join with a name
- 🧠 Jira ticket recognition with smart linking
- 📊 Instant summary of team estimates
- 🔄 Multiple rounds per session
- 🎉 Fun additions like the ADHD corner

## 🛠️ Tech Stack

- **Frontend**: Nuxt 3, TypeScript, Tailwind CSS  
- **Backend / Realtime DB**: Supabase (Postgres + Realtime)  
- **State**: `ref`-based Vue Composition API  
- **Styling**: Utility-first design with Tailwind  
- **Deployment**: Netlify (or Vercel compatible)  

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Add your Supabase project URL and anon key to .env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Start the dev server
npm run dev
## 🧪 Development Notes

- Local participant identity is stored in localStorage per session. 
- Realtime updates are powered by Supabase's channel() subscriptions.
- The host has elevated controls like revealing votes and starting new rounds.


Enjoy lightning-fast agile planning with Kitsune! 🦊✨