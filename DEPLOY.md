# Deploying to Render — Step by Step

## Prerequisites

- A [Render](https://render.com) account (free tier works)
- A [GitHub](https://github.com) account
- Git installed on your machine
- [Docker](https://docs.docker.com/get-docker/) installed (for local development)

---

## Running Locally with Docker

The easiest way to run the app locally — no need to install PostgreSQL or Node.js on your machine.

### Start the app

```bash
docker compose up --build
```

This spins up two containers:
- **PostgreSQL** database on port `5432`
- **App server** (Express + React build) on port `5000`

Open `http://localhost:5000` in your browser.

### Stop the app

```bash
docker compose down
```

To also wipe the database data:

```bash
docker compose down -v
```

---

## Deploying to Render

### Step 1: Initialize a Git Repository

```bash
cd "/home/vaibhav/coding shoding /demo"
git init
git add .
git commit -m "Initial commit: fullstack CRUD app"
```

### Step 2: Push to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `mern-crud-app`)
2. Do **not** initialize with a README or .gitignore (we already have one)
3. Copy the remote URL and run:

```bash
git remote add origin https://github.com/<your-username>/mern-crud-app.git
git branch -M main
git push -u origin main
```

### Step 3: Create a PostgreSQL Database on Render

1. Log in to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Fill in:
   - **Name**: `mern-crud-db`
   - **Database**: `mern_crud`
   - **Plan**: Free
4. Click **Create Database**
5. Once created, go to the database page and copy the **External Database URL** (you'll need it in the next step)

### Step 4: Create a Web Service on Render

1. Click **New** → **Web Service**
2. Connect your GitHub account if you haven't already — when prompted to install Render on GitHub, select **"All repositories"** and click **Install**
3. Select the `first-crud` repository
4. Render will auto-detect **Docker** as the language (because of the `Dockerfile` in the repo) — leave it as Docker
5. Configure the service:
   - **Name**: `first-crud` (or any name you prefer)
   - **Language**: Docker (auto-detected)
   - **Branch**: `main`
   - **Region**: Oregon (US West) or your preferred region
   - **Root Directory**: leave empty
   - **Instance Type**: Free
6. Scroll down to **Environment Variables** and add these four variables:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | paste the **Internal Database URL** from Step 3 |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `RENDER` | `true` |

7. Leave all other fields (Docker Command, Pre-Deploy Command, etc.) empty
8. Click **Deploy Web Service**

> **Tip**: Use the **Internal Database URL** (not External) — Render routes traffic within its own network which is faster and free.

### Alternative: One-Click Deploy with Blueprint

Instead of Steps 3 and 4, you can use the `render.yaml` file already included in the project:

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repo
4. Render reads `render.yaml` and automatically creates both the database and web service with the correct environment variables
5. Click **Apply** and wait for the deploy to finish

### Step 5: Verify the Deployment

1. Render will show build logs — wait for "Build successful" and "Live"
2. Click the URL provided by Render (e.g. `https://mern-crud-app-xxxx.onrender.com`)
3. You should see the CRUD app running
4. Try adding, editing, and deleting items to confirm the database connection works

## Troubleshooting

| Problem | Fix |
|---|---|
| Docker build fails | Check Render build logs — usually a missing dependency or file |
| App crashes with "database connection error" | Verify `DATABASE_URL` is set correctly in Render environment variables |
| App loads but API calls fail | Make sure `NODE_ENV=production` is set so Express serves the React build |
| Free tier app is slow on first load | Free Render services spin down after inactivity — first request takes ~30s to wake up |

## Redeploying After Changes

```bash
git add .
git commit -m "your changes"
git push origin main
```

Render auto-deploys on every push to `main`. You can also trigger a manual deploy from the Render dashboard.
