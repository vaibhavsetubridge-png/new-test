# Deploying to DigitalOcean App Platform — Step by Step (A-Z)

DigitalOcean App Platform is a managed cloud hosting service (like Render) — no server management needed.

## Prerequisites

- A [DigitalOcean](https://www.digitalocean.com) account (requires credit card)
- Your code pushed to GitHub

---

## Step 1: Create a Managed MySQL Database

1. Log in to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Click **Databases** in the left sidebar → **Create Database Cluster**
3. Configure:
   - **Engine**: **MySQL 8**
   - **Region**: Choose closest to your users (e.g. Bangalore)
   - **Plan**: **Basic** → **$15/month** (1 GB RAM, 1 vCPU, 10 GB storage)
   - **Name**: `mern-crud-db`
4. Click **Create Database Cluster**
5. Wait for it to finish provisioning (takes ~5 minutes)

### Create a database

1. Once ready, go to **Users & Databases** tab
2. Under **Databases**, click **Add Database** → name it `mern_crud` → **Save**
3. Go to **Overview** tab → copy the **Connection String** (you'll need it later)

> The connection string looks like: `mysql://doadmin:password@host:25060/mern_crud?ssl-mode=REQUIRED`

---

## Step 2: Update Your App for MySQL

Before deploying, switch the app from PostgreSQL to MySQL locally.

### Install MySQL driver

```bash
cd "/home/vaibhav/coding shoding /demo"
npm install mysql2
npm uninstall pg
```

### Update `server/db.js`

Replace contents with:

```javascript
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const Item = require("./models/Item")(sequelize);

module.exports = { sequelize, Item };
```

### Update `package.json`

In the `dependencies` section, replace `"pg"` with `"mysql2"`:

```json
"mysql2": "^3.11.0"
```

(Remove the `"pg"` line)

### Push changes

```bash
git add .
git commit -m "Switch from PostgreSQL to MySQL"
git push origin main
```

---

## Step 3: Create an App on App Platform

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Click **Apps** in the left sidebar → **Create App**
3. **Source**: Select **GitHub** → authorize DigitalOcean → select `first-crud` repo
4. **Branch**: `main`
5. **Source Directory**: `/` (root)
6. **Autodeploy**: Check the box (auto-deploys on every push)

---

## Step 4: Configure the App Component

DigitalOcean will auto-detect your app. You may see multiple components — keep only the **web service**.

1. Click on the web component to edit it:
   - **Type**: Web Service
   - **Build Command**: `npm run render-build`
   - **Run Command**: `npm start`
   - **HTTP Port**: `5000`
2. **Plan**: Basic → **$5/month** (512 MB RAM, 1 vCPU)

---

## Step 5: Add Environment Variables

Click **Environment Variables** and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Paste the **Connection String** from Step 1 (append `/mern_crud` if not included) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

> **Tip**: You can also link the database directly — click **Add Database** in the app settings and select your `mern-crud-db` cluster. This auto-injects the `DATABASE_URL`.

---

## Step 6: Deploy

1. Review everything → click **Create Resources**
2. DigitalOcean will build and deploy your app
3. Watch the **build logs** — wait for "Deployed successfully"
4. Click the provided URL (e.g. `https://mern-crud-xxxxx.ondigitalocean.app`)
5. Your CRUD app should be live

---

## Step 7: Access phpMyAdmin

DigitalOcean doesn't include phpMyAdmin, but you have two options:

### Option A: Use Adminer locally (quick)

```bash
sudo docker run -d -p 8080:8080 adminer
```

Open `http://localhost:8080` and enter your DigitalOcean DB credentials:

| Field | Value |
|---|---|
| **System** | MySQL |
| **Server** | Your DO database host (from connection string) |
| **Username** | `doadmin` |
| **Password** | Your DO database password |
| **Database** | `mern_crud` |

### Option B: Use DBeaver (GUI)

Connect DBeaver to your DigitalOcean MySQL using the connection string details. Same steps as the [DATABASE-VIEW.md](DATABASE-VIEW.md) guide but select MySQL instead of PostgreSQL.

---

## Step 8: Set Up a Custom Domain (Optional)

1. In your App settings → **Domains** → **Add Domain**
2. Enter your domain (e.g. `yourapp.com`)
3. Add the DNS records shown to your domain registrar (Namecheap, GoDaddy, etc.)
4. SSL is **automatic and free**

---

## Step 9: Redeploying After Changes

```bash
git add .
git commit -m "your changes"
git push origin main
```

App Platform auto-deploys on every push to `main`.

---

## File Uploads

App Platform has **ephemeral storage** (like Render) — files are lost on redeploy. For uploads:

- **DigitalOcean Spaces** — S3-compatible object storage, $5/month for 250 GB
- **Supabase Storage** — free tier, 1 GB

---

## Monthly Cost

| Item | Cost |
|---|---|
| App Platform (Basic) | $5/month |
| Managed MySQL (Basic) | $15/month |
| Spaces for file storage (optional) | $5/month |
| Custom domain | ~$10/year |
| SSL | Free (automatic) |
| **Total (minimum)** | **$20/month** |

---

## Comparison: DigitalOcean App Platform vs Render vs DO Droplet

| | **DO App Platform** | **Render** | **DO Droplet** |
|---|---|---|---|
| **Setup** | Easy (PaaS) | Easy (PaaS) | Manual (server) |
| **MySQL** | Yes (managed) | No | Yes (self-hosted) |
| **phpMyAdmin** | No (use Adminer/DBeaver) | No | Yes |
| **Free tier** | No | Yes | No |
| **Min cost** | $20/month | $15/month | $6/month |
| **File uploads** | Need Spaces ($5/mo) | Need external storage | Direct on server |
| **SSH access** | No | Paid only | Always |
| **Auto-deploy** | Yes | Yes | Manual or webhook |
| **SSL** | Free | Free | Free (Let's Encrypt) |

> **Cheapest option**: DO Droplet at $6/month (but you manage everything yourself)
> **Easiest with MySQL**: DO App Platform at $20/month
> **Cheapest managed**: Render at $0-15/month (but no MySQL)
