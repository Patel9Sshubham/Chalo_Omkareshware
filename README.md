# Chalo Omkareshwar

Separate user and admin websites for the Chalo Omkareshwar platform.

## Ports

- User frontend: `http://localhost:3000`
- User backend: `http://localhost:4000`
- Admin frontend: `http://localhost:5001`
- Admin backend: `http://localhost:4001`

## Setup

1. Install dependencies in each folder:

```bash
cd backend && npm i
cd ../admin_backend && npm i
cd ../Frontend && npm i
cd ../admin_frontend && npm i
```

2. Create `.env` files from the provided `.env.example` files.
   - If your MongoDB password has special characters like `@`, `:`, `/`, or `#`, encode them in `MONGO_URI`.
   - If you do not want to encode credentials manually, use this format instead:

```env
MONGO_HOST=cluster0.example.mongodb.net
MONGO_USER=your_username
MONGO_PASSWORD=your_password
MONGO_DB_NAME=chaloomkareshwar
```

   - Put the same database config in both `backend/.env` and `admin_backend/.env` if both websites should use the same database.

3. Start the websites:

```bash
npm start
```

If you prefer separate terminals:

```bash
# terminal 1
cd backend && npm start

# terminal 2
cd admin_backend && npm start

# terminal 3
cd Frontend && npm start

# terminal 4
cd admin_frontend && npm start
```

## Default Admin

The default admin credentials are read from `backend/.env` and `admin_backend/.env`.
Check the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in those files before logging in.

## What is included

- Responsive user website
- Separate admin website
- MongoDB auth and booking flow
- Dynamic listings from API
- Admin dashboard with listing and booking management
