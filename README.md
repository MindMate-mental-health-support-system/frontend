# MindMate Frontend V2

This is the official React frontend for the MindMate system, built with Vite and designed with a premium, accessible UI/UX.

## 🌟 Key Features

### 1. **Multi-Modal Chat Interface**
- **Text & Voice Input:** Seamlessly switch between typing and speaking (Speech-to-Text).
- **Auto-Play Voice Responses:** AI responses can be played aloud via HTML5 Audio.
- **AI Streaming:** Native support for Server-Sent Events (SSE) allows the Gemini AI to stream its responses word-by-word for a low-latency, dynamic feel.

### 2. **Mental Health Tracking**
- **Mood Selection:** Start a session by declaring your "Today Mood".
- **Dashboard Analytics:** Visual representation (via Recharts) of your emotional journey over past sessions.
- **Crisis Detection:** The UI immediately responds to backend crisis alerts (SEVERE/CRITICAL) and highlights emergency resources for immediate intervention.

### 3. **Premium Design System**
- **Dynamic Themes:** Smoothly toggle between Light Mode and Dark Mode, with preferences persisted in `localStorage`.
- **Responsive & Accessible:** Fully usable on mobile and desktop setups.
- **PWA Ready:** Install MindMate as a native wrapper to your device's home screen.

### 4. **Modern Tech Stack**
- Built with **React** & **Vite**.
- **Lucide React** for crisp, scalable icons.
- **Framer Motion** for fluid animations.
- **Axios** (and native `fetch` for streams) for robust data fetching.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- The MindMate Backend server running on `http://localhost:5000`

### Installation
```bash
cd FRONTEND_V2
npm install
```

### Running Locally
```bash
npm run dev
# Vite will launch on http://localhost:5173
```

### Building for Production
```bash
npm run build
```

## 🛠 Features Breakdown

- **Infinite Scrolling Pagination**: Chat pages lazy-load previous history in batches to save bandwidth.
- **Speech-to-Text**: Uses the browser's native `SpeechRecognition` API (configured for multiple dialects including Malayalam `ml-IN`).
- **AI Session Titles**: The backend triggers Gemini to auto-title new sessions on the fly in the sidebar!

## 🧩 Structure
- `src/pages/` - Core views like `ChatPage`, `DashboardPage`, `Login`, etc.
- `src/index.css` - Centralized CSS variables and thematic structure.
- `src/App.jsx` - Main router.
- `public/` - Static assets including the PWA `manifest.webmanifest`.
