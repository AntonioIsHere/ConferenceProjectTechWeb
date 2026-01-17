# Conference Management Application

A full-stack Single Page Application for organizing scientific conferences, managing paper submissions, and peer review workflows.

## Features

### User Roles
- **Organizer**: Create/edit/delete conferences, assign reviewers
- **Author**: Submit papers (max 10MB), view status, upload revisions
- **Reviewer**: Review assigned papers, accept or request revisions

### Core Functionality
- JWT-based authentication
- Role-based access control
- File upload with size validation (10MB limit)
- Automatic reviewer assignment (2 per paper)
- Paper versioning with revision workflow

## Tech Stack
- **Frontend**: React 18, Vite, React Router
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: SQLite

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AntonioIsHere/ConferenceProjectTechWeb.git
cd ConferenceProjectTechWeb
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd server
node server.js
# Runs on http://localhost:5001
```

2. In a new terminal, start the frontend:
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

3. Open http://localhost:3000 in your browser

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/conferences | List all conferences |
| POST | /api/conferences | Create conference (Organizer) |
| POST | /api/papers | Submit paper (Author) |
| GET | /api/reviews/my | Get my reviews (Reviewer) |

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   └── pages/       # Page components
│   └── package.json
├── server/              # Express backend
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── uploads/         # Paper uploads
│   └── package.json
└── README.md
```
