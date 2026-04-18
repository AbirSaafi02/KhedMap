# KhedMAP Flask Backend

This folder contains a MongoDB-backed Flask application that matches the marketplace flows already present in the Ionic frontend.

## Features

- Authentication for `client`, `freelancer`, and `admin`
- Client dashboard for posting jobs, browsing gigs, buying products, and messaging sellers
- Freelancer dashboard for publishing gigs/products, applying to jobs, managing orders, and messaging clients
- Admin dashboard for approving accounts, gigs, products, and handling reports
- JSON API under `/api/*` for later Angular integration
- Demo seed data so the simple dashboard is usable immediately

## Architecture

```text
backend/
├── app/
│   ├── repositories/   # MongoDB access per domain
│   ├── routes/         # Web routes and API routes
│   ├── services/       # Dashboard aggregation and seeding
│   ├── utils/          # Auth/session helpers, formatting, serialization
│   ├── config.py
│   ├── extensions.py
│   └── __init__.py     # Flask app factory
├── static/css/app.css  # Dashboard styling
├── templates/          # Jinja pages for auth, dashboards, chat, notifications
├── .env.example
├── requirements.txt
└── run.py
```

## Collections

- `users`
- `jobs`
- `applications`
- `gigs`
- `products`
- `orders`
- `conversations`
- `notifications`
- `reports`

## Run locally

1. Create and activate a virtual environment.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Make sure MongoDB is running locally or update `MONGO_URI`.
4. Start the app:

   ```bash
   python run.py
   ```

The app seeds demo data automatically when `AUTO_SEED=true` and the database is empty.

## Demo users

- `admin@khedmap.local`
- `client@khedmap.local`
- `freelancer@khedmap.local`

Password for all demo users: `demo1234`

## API examples

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/dashboard`
- `GET /api/jobs`
- `POST /api/jobs`
- `POST /api/jobs/<job_id>/apply`
- `GET /api/gigs`
- `POST /api/gigs/<gig_id>/order`
- `GET /api/products`
- `POST /api/products/<product_id>/buy`
- `GET /api/conversations`
- `POST /api/conversations/<partner_id>/messages`
- `GET /api/notifications`
- `GET /api/admin/overview`
