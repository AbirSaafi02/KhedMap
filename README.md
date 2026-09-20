# KhedMAP

KhedMAP is a freelance marketplace application designed to connect clients with freelancers through a mobile-friendly platform.

The app allows clients to publish their needs, explore freelance services, contact freelancers, and place orders. Freelancers can create profiles, publish gigs, apply to job offers, manage orders, and communicate with clients.

## ✨ Features

### For Clients

- Create and manage a profile
- Publish job offers
- Browse freelance services and gigs
- View freelancer profiles
- Order services
- Chat with freelancers
- Receive notifications

### For Freelancers

- Create and manage a profile
- Browse available job offers
- Apply to jobs
- Create and manage gigs
- Offer products and services
- Track received orders
- Communicate with clients

### Platform

- Authentication and role-based access
- Client and freelancer dashboards
- Marketplace experience
- Messaging workflow
- Notifications system
- Administration dashboard

## 🛠️ Tech Stack

### Frontend

- Ionic
- Angular
- TypeScript
- SCSS

### Backend

- Flask
- Python
- REST API

### Database

- MongoDB
- PyMongo

### Other Tools

- Flask-CORS
- Git / GitHub

## 🏗️ Architecture

The project is organized into two main parts:

```text
KhedMAP/
├── frontend/       # Ionic + Angular application
├── backend/        # Flask API + MongoDB backend
├── package.json    # Workspace scripts
├── README.md       # Project documentation
└── .gitignore
```

The Angular/Ionic frontend communicates with the Flask backend through REST API endpoints, while MongoDB stores the application data.

## 🚀 Getting Started

### Prerequisites

- Git
- Node.js and npm
- Python 3
- MongoDB

### Clone the repository

```bash
git clone https://github.com/AbirSaafi02/KhedMap.git
cd KhedMap
```

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

#### Windows

```powershell
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Then install the dependencies:

```bash
pip install -r requirements.txt
```

If a local environment file is required, create it from the example file if available:

```bash
copy .env.example .env
```

### Run the application

From the project root, start the backend in one terminal:

```bash
npm run backend
```

Then start the frontend in another terminal:

```bash
npm run frontend
```

Default local URLs:

- Frontend: http://127.0.0.1:8100
- Backend: http://127.0.0.1:5000

## 📁 Project Structure

```text
frontend/
├── src/app/
│   ├── pages/
│   ├── services/
│   ├── models/
│   └── guards/
├── src/assets/
└── package.json

backend/
├── app/
│   ├── routes/
│   ├── repositories/
│   ├── services/
│   ├── utils/
│   ├── config.py
│   ├── extensions.py
│   └── __init__.py
├── templates/
├── static/
├── requirements.txt
├── run.py
└── .env.example
```

The frontend includes dedicated services for authentication, jobs, marketplace operations, conversations, dashboard data, notifications, and orders.

## 🎯 Project Goal

KhedMAP was developed as a practical full-stack project to explore the implementation of a freelance marketplace, from mobile-oriented frontend interfaces to REST API design, database management, authentication, and role-based workflows.

Computer Engineering Student — ENSIT
