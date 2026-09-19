# AI Hand Gesture Computer Control System

An interactive web application that allows users to control computer interactions and virtual desktop environments using real-time AI hand gesture recognition.

## 🚀 Features

- **Real-Time Hand Tracking:** Built with MediaPipe/TensorFlow integration to track hand landmarks via web camera.
- **Gesture Control System:** Map specific hand gestures to actions like navigation, clicking, and desktop controls.
- **Virtual Desktop Interface:** Interactive UI elements responding dynamically to gesture tracking.
- **Session Management:** Logs and tracks gesture sessions securely using [Supabase](https://supabase.com).
- **Modern Tech Stack:** Developed with React, TypeScript, Vite, and styled with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **State & Routing / Components:** Custom hooks for hand tracking (`useHandTracking.ts`) and gesture detection (`gestureDetection.ts`)
- **Backend & Database:** Supabase (`supabase/migrations/`)

---

## 📦 Project Structure

```text
├── task4-ai/
│   ├── src/
│   │   ├── components/     # UI Components (CameraView, GestureGuide, VirtualDesktop, etc.)
│   │   ├── hooks/          # Custom hooks (useHandTracking.ts)
│   │   ├── lib/            # Utilities (gestureDetection.ts, supabase.ts)
│   │   ├── types/          # TypeScript definitions (gestures.ts)
│   │   └── App.tsx         # Main Application Entry
│   ├── supabase/
│   │   └── migrations/     # Database migration scripts
│   └── package.json
