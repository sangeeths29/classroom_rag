# StudySpace - AI-Powered Learning Workspace

A modern, module-centric learning workspace with AI-powered features including RAG (Retrieval-Augmented Generation), flashcards, podcast generation, and interactive learning games.

## Features

### 🤖 RAG Assistant
- Ask questions about your course materials
- Watch AI reasoning in real-time with processing steps
- Streaming responses with typing animation
- Source citations linked to original documents
- Conversation history

### 🃏 Flashcards
- Study mode with flip-card mechanics
- Spaced repetition tracking
- Difficulty levels (easy/medium/hard)
- AI-powered flashcard generation from topics
- Progress tracking and mastery indicators

### 🎧 Podcast Generator
- Transform documents into audio content
- Multiple podcast formats (Lecture, Dialogue, Quick Summary, Deep Dive)
- Various AI voices with different styles
- Built-in audio player with playback controls
- Progress tracking during generation

### 🎮 Learning Games
- **Concept Match**: Match terms with definitions against the clock
- **Knowledge Race**: Rapid-fire quiz with combo multipliers
- Score tracking and leaderboards
- Module-specific content

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- Custom hooks for streaming text

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Project Structure

```
src/
├── components/
│   ├── icons/         # Icon components and mappings
│   ├── layout/        # Sidebar, TopBar, RightPanel
│   └── tabs/          # RAG, Flashcards, Podcast, Games tabs
├── context/           # React Context for global state
├── data/              # Mock data for modules, documents, etc.
├── hooks/             # Custom React hooks
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles and Tailwind config
```

## UI Architecture

### App Shell Layout
- **Left Sidebar**: Module list, document library, recent AI generations
- **Top Bar**: Module selector dropdown with search, upload button
- **Main Area**: Tab navigation (RAG, Flashcards, Podcast, Games)
- **Right Panel**: Citations, activity log, generation settings

### Design System
- Dark theme with slate/gray base colors
- Teal (#14b8a6) as primary accent
- Violet (#8b5cf6) for secondary actions
- Rose/Amber/Emerald for status indicators
- Outfit font for headings, DM Sans for body, JetBrains Mono for code

## Mock Data

All data is currently mocked. The app demonstrates:
- Module switching and context
- Document indexing status
- AI chat interactions
- Flashcard study sessions
- Podcast generation workflow
- Game mechanics

## License

MIT
