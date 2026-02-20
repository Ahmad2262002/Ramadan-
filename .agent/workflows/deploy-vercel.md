---
description: Deployment workflow for Ramadan Hub Luxe to Vercel
---

# Deploying to Vercel

Follow these steps to deploy your optimized Next.js application to Vercel.

## 1. Push Code to GitHub
Ensure all your latest changes (including the Next-Gen UI revamp) are pushed to your GitHub repository.

```bash
git add .
git commit -m "feat: next-gen UI revamp and premium aesthetics"
git push origin main
```

## 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New"** > **"Project"**.
3. Import your `ramadan-hub` repository from GitHub.

## 3. Configure Project Settings
Vercel should automatically detect Next.js. Ensure the following:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## 4. Deploy
Click **"Deploy"**. Vercel will build the application and provide you with a production URL.

## 5. Verification
Once deployed, verify:
- The "Celestial Watch" hero is animating smoothly.
- Glassmorphism effects are consistent.
- Language switching (EN/AR) works correctly.
- Mobile Dock and Header are responsive.
