# Viewing Your Database with DBeaver

## Install DBeaver

```bash
sudo snap install dbeaver-ce --classic
```

## Connect to Render PostgreSQL

1. Open **DBeaver**
2. Click the **plug icon** (top-left) or go to **Database → New Database Connection**
3. Select **PostgreSQL** from the list → click **Next**

## Main Tab — Connection Details

Get these from your Render dashboard → **PostgreSQL database** → **Info** tab:

| Field | Value |
|---|---|
| **Host** | Your Render DB hostname (e.g. `dpg-xxxxx-a.oregon-postgres.render.com`) |
| **Port** | `5432` |
| **Database** | `mern_crud` |
| **Username** | Your Render DB username (e.g. `mern_crud_user`) |
| **Password** | Your Render DB password (check "Save password") |

> **Where to find these:** Render dashboard → click your PostgreSQL database → **Info** tab → click on the credential to expand it.

## SSL Tab — Required for Render

1. Click the **SSL** tab (next to SSH tab)
2. Set **SSL mode** dropdown to **require**
3. Leave CA Certificate, Client Certificate, and Client Private Key **empty**

## Test and Finish

1. Click **Test Connection...** at the bottom-left
2. If it asks to download drivers, click **Download**
3. You should see **"Connected"** — click **OK**
4. Click **Finish**

## Browsing Your Data

In the left sidebar (Database Navigator), expand:

```
PostgreSQL
  └── mern_crud
        └── Schemas
              └── public
                    └── Tables
                          └── Items    ← double-click this
```

Double-clicking **Items** opens a spreadsheet view of all your data.

## Useful Things You Can Do

- **View data:** Double-click any table
- **Edit a row:** Click a cell, modify it, then press `Ctrl+S` to save
- **Run SQL queries:** Click **SQL Editor → New SQL Script** (or `Ctrl+]`), then type and run queries like:
  ```sql
  SELECT * FROM "Items";
  ```
- **Export data:** Right-click a table → **Export Data** → choose CSV, JSON, SQL, etc.
- **See table structure:** Right-click a table → **View Table** → shows columns, types, constraints

## Connecting to Local Docker DB

To connect to your local Docker PostgreSQL instead:

| Field | Value |
|---|---|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `mern_crud` |
| **Username** | `postgres` |
| **Password** | `postgres` |

No SSL needed for local — leave the SSL tab as default.
