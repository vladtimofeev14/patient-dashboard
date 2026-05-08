# Patient Dashboard

Full-stack Patient Registration Dashboard built with Angular 21, Node.js 24, Express, TypeScript 5.9, MongoDB Atlas, Mongoose, and PrimeNG.

## Project Structure

```text
patient-dashboard/
├── backend/
└── frontend/
```

## Requirements

- Node.js 24 LTS
- npm
- MongoDB Atlas Free Tier cluster

## Backend Setup

Install dependencies:

```bash
cd backend
npm install
```

Create `backend/.env` and add:

```env
MONGODB_URI=
PORT=3000
```

Set `MONGODB_URI` to your MongoDB Atlas connection string. The URI should include the database name `patient-dashboard`, for example the path after the cluster host should be `/patient-dashboard`.

Build the backend:

```bash
npm run build
```

Seed the database with 20 sample patients:

```bash
npm run seed
```

Start the backend API:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

## Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Build the frontend:

```bash
npm run build
```

Start the Angular app:

```bash
npm run start
```

The frontend runs on:

```text
http://localhost:4200
```

The Angular dev server proxies `/api` requests to `http://localhost:3000`.

## Running The App Locally

Use two terminal windows.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run start
```

Open:

```text
http://localhost:4200
```

## Available API Endpoints

```text
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
GET    /api/stats
```