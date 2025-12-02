# StudyMate 

A Collaborative Study Tracker

## Problem Statement

Students often struggle to stay consistent and accountable with their studies, especially when studying alone.

**StudyMate** helps students create, share, and track study goals with friends — making studying social, interactive, and motivating. Users can set goals, log progress, and see how their peers are performing, encouraging collaboration and accountability through real-time insights and friendly competition.

## System Architecture

**Frontend → Backend (API) → Database**

### Stack Overview

- **Frontend**: HTML, CSS, JavaScript, React.js (for routing + dynamic UI)
- **Backend**: Node.js + Express.js (for REST APIs)
- **Database**: MySQL (Prisma)
- **Authentication**: JWT (JSON Web Token) based authentication and authorization
- **Hosting**:
  - Frontend: Vercel
  - Backend: Render
  - Database: Aiven (MySQL)

## Key Features

1. **Authentication & Authorization**: Custom signup, login, and logout using JWT-based authentication. Passwords hashed with bcrypt. Access to private routes protected using jsonwebtoken middleware.

2. **CRUD Operations**: Users can create, read, update, and delete study goals.

3. **Searching, Sorting, Filtering, Pagination**: 
   - Backend supports:
     - Search by goal title or subject
     - Filter by status (completed/pending) or subject
     - Sort by creation date or completion rate
     - Paginate results for efficient browsing

4. **Frontend Routing**: React Router manages pages: Home, Login, Dashboard, Friends, Profile.

5. **Dynamic Data Fetching**: Real-time data fetched using Axios API calls to backend.

6. **Authorization Control**: Each goal is tied to the authenticated user; only they can modify or delete it.

7. **Hosting & Deployment**: Full-stack deployment with backend and frontend hosted separately but connected via REST APIs.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, React.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Pool)
- **Authentication**: JWT, Bcrypt
- **Hosting**: Vercel (Frontend), Aiven (Database), Render (Backend)

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user (store hashed password) | Public |
| `/api/auth/login` | POST | Login existing user and return JWT | Public |
| `/api/auth/logout` | POST | Logout user | Authenticated |
| `/api/auth/verify` | GET | Verify JWT token | Authenticated |
| `/api/auth/refresh` | POST | Refresh access token | Authenticated |

### Goal Management Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/goals` | GET | Get all study goals (with search, sort, filter, and pagination) | Authenticated |
| `/api/goals` | POST | Add a new study goal | Authenticated |
| `/api/goals/:id` | PUT | Update an existing goal | Authenticated |
| `/api/goals/:id` | DELETE | Delete a goal | Authenticated |
| `/api/users/:id/goals` | GET | Get all goals for a specific user | Authenticated |

### Health Check

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/health` | GET | Server health status | Public |

## Project Structure

```
StudyMate/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── auth.js
│   │   │       └── auth_routes.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   └── auth_middleware.js
│   │   └── server.js
│   ├── create_refresh_tokens_table.sql
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── logo.png
│   └── package.json
└── README.md
```

## Features in Detail

### Dashboard
- **Welcome Section**: Personalized greeting with streak counter
- **Add Goal Form**: Create new goals with title, due date, and collaborators
- **Ongoing Goals**: Display active goals with progress tracking
- **Friend Suggestions**: Discover new study partners
- **Activity Feed**: See what friends are working on in real-time

### Authentication
- Secure JWT-based authentication
- Refresh token mechanism
- Cookie-based session management
- Protected routes

## Hosted Link (Frontend)
- https://study-mate-phi-lac.vercel.app/

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Gauri** <3

---

Made with ❤️ for students who want to study smarter together.
