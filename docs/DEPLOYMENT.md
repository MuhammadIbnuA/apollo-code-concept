# Deployment Guide

This project consists of two parts:
- **Frontend**: Next.js → Deploy to **Vercel**
- **Backend**: Express.js → Deploy to **Railway** or **Render**

---

## 1. Deploy Backend (Railway)

### Option A: Railway CLI

```bash
cd backend
railway login
railway init
railway up
```

### Option B: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select the `backend` folder as root directory
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JUDGE0_URL` | Your Judge0 API URL |
| `PORT` | `4000` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |

5. Railway will automatically build and deploy

### Get Backend URL

After deployment, copy your backend URL (e.g., `https://apollo-backend.railway.app`)

---

## 2. Deploy Frontend (Vercel)

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to the project root (not `backend`)
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |
| `DATABASE_URL` | Your PostgreSQL connection string |

5. Deploy!

---

## Environment Variables Summary

### Frontend (Vercel)

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
DATABASE_URL=postgresql://user:pass@host:5432/database
```

### Backend (Railway/Render)

```
DATABASE_URL=postgresql://user:pass@host:5432/database
JUDGE0_URL=http://your-judge0-server:2358
PORT=4000
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## Testing Production

After both are deployed:

```bash
# Test backend health
curl https://your-backend.railway.app/health

# Test API
curl https://your-backend.railway.app/api

# Run k6 load test against production
k6 run tests/k6/exam_load_15users.js -e BASE_URL=https://your-backend.railway.app -e VUS=10
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel domain exactly
- Check backend logs in Railway dashboard

### Database Connection
- Use `?sslmode=require` in DATABASE_URL for cloud databases
- Ensure database allows connections from Railway/Vercel IPs

### Build Errors
- Frontend: Run `npm run build` locally first to check for errors
- Backend: Run `npm run build` in `backend/` folder to check TypeScript errors
