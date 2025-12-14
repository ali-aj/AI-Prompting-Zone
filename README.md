# Kids-Stem-Zone

A full-stack web application designed to provide engaging STEM activities and resources for kids. The project is divided into a React + TypeScript frontend and a Node.js + Express backend.

---

## Features

- User authentication (students, admins, agents, clubs)
- Dynamic prompts and chat with agents
- Student progress tracking
- Club and agent management
- Email notifications
- Responsive, modern UI

---

## Tech Stack

**Frontend:**
- React
- TypeScript
- Tailwind CSS
- Vite

**Backend:**
- Node.js
- Express
- MongoDB (via Mongoose)
- JWT Authentication

---

## Project Structure

```
Kids-Stem-Zone/
  ├── backend/      # Express API, models, controllers, routes
  └── frontend/     # React app, components, pages, assets
```

---

## Getting Started

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the `backend` directory.
   - Add your MongoDB URI, JWT secret, and email credentials.

3. **Run the backend server:**
   ```bash
   npm run dev
   ```
   The backend will start on the port specified in your `.env` (default: 5000).

---

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the frontend development server:**
   ```bash
   npm run dev
   ```
   The frontend will start on [http://localhost:8080](http://localhost:8080) by default.

---