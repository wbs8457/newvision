# Complete Setup Guide - WBS New Vision R2 Upload

This guide walks you through setting up the complete upload system step by step.

## Prerequisites

- ✅ GitHub repo: `wbs8457/newvision`
- ✅ GitHub token with workflow permissions: Already updated
- ✅ Cloudflare account with R2 bucket: `newvision`
- ✅ R2 Account ID: `a4a6684b586aeee5dafd01cdd8492644`

## Step-by-Step Setup

### Step 1: Deploy Cloudflare Worker (5 minutes)

1. **Install Wrangler CLI** (if not installed):
   ```bash
   npm install -g wrangler
   ```
   Or use npx (no install):
   ```bash
   npx wrangler --version
   ```

2. **Login to Cloudflare**:
   ```bash
   cd cloudflare-worker
   npx wrangler login
   ```
   This will open a browser to authenticate.

3. **Deploy the Worker**:
   ```bash
   npx wrangler deploy
   ```
   
   **Expected output:**
   ```
   ╭─────────────────────────────────────╮
   │ ✨ Total Upload: xxx B / xxx B     │
   │ ✨ Workers Deployment Complete!     │
   │ ✨ Deployment ID: xxxxx             │
   │                                     │
   │ 🎉 Published r2-upload-worker       │
   │   https://r2-upload-worker.your-subdomain.workers.dev
   ```

4. **Copy your Worker URL** - You'll see it in the output like:
   ```
   https://r2-upload-worker.your-subdomain.workers.dev
   ```
   **Save this URL - you'll need it in Step 3!**

### Step 2: Configure R2 Bucket Binding (2 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **r2-upload-worker** (or your worker name)
3. Go to **Settings** tab
4. Scroll to **Variables** section
5. Find **R2 Bucket Bindings**
6. Click **Add binding**
7. Configure:
   - **Variable name**: `R2_BUCKET` (exact, case-sensitive)
   - **R2 bucket**: Select `newvision`
8. Click **Save**

✅ **Verification**: Your Worker can now access the R2 bucket!

### Step 3: Set Worker URL in Admin Upload (1 minute)

1. **Edit `js/admin-upload.js`**
2. **Find line ~16** where it says:
   ```javascript
   workerUrl: null // Set this manually or via GitHub Secrets
   ```
3. **Replace with your Worker URL** from Step 1:
   ```javascript
   workerUrl: 'https://r2-upload-worker.your-subdomain.workers.dev'
   ```
4. **Save the file**

### Step 4: Configure GitHub Secrets (Optional but Recommended) (2 minutes)

This allows the Worker URL to be injected automatically via GitHub Actions.

1. Go to your GitHub repo: `https://github.com/wbs8457/newvision`
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add these secrets:

   **Secret 1:**
   - Name: `CLOUDFLARE_WORKER_URL`
   - Value: Your Worker URL from Step 1
     ```
     https://r2-upload-worker.your-subdomain.workers.dev
     ```

   **Secret 2 (optional):**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: `a4a6684b586aeee5dafd01cdd8492644`

5. **Save each secret**

### Step 5: Commit and Push Changes (1 minute)

```bash
git add js/admin-upload.js
git commit -m "Configure Worker URL for R2 uploads"
git push
```

### Step 6: Test the Upload System (5 minutes)

1. **Open `admin.html` locally** in your browser:
   ```
   file:///D:/Personal/newvision/admin.html
   ```
   Or use a local server:
   ```bash
   # Python
   python -m http.server 8000
   # Then open: http://localhost:8000/admin.html
   ```

2. **Test upload:**
   - Select a category (e.g., "Portraits")
   - Click the upload zone and select an image
   - Click "Upload Images"
   - Watch for success message

3. **Verify in Cloudflare:**
   - Go to Cloudflare Dashboard > R2 > newvision bucket
   - Check folders: `thumbnails/`, `gallery/`, `full/`
   - Your images should appear there!

### Step 7: Update Gallery.json (Manual for now)

After uploading images:

1. The admin page will generate gallery.json entries
2. Copy the entries from the right panel
3. Add them to `data/gallery.json`
4. Commit and push:
   ```bash
   git add data/gallery.json
   git commit -m "Add new gallery images"
   git push
   ```

## Troubleshooting

### ❌ "Worker URL not configured" error
- **Fix**: Make sure you set `R2_CONFIG.workerUrl` in `js/admin-upload.js`

### ❌ "Upload failed" error
- **Check**: R2 bucket binding is configured (Step 2)
- **Check**: Worker URL is correct (no typos)
- **Check**: CORS settings in R2 bucket allow your domain

### ❌ Worker deployment fails
- **Check**: You're logged in: `wrangler whoami`
- **Check**: You have Cloudflare Workers plan (Free tier works)
- **Check**: `wrangler.toml` has correct bucket name

### ❌ Can't see images after upload
- **Check**: Images are in correct folders (`thumbnails/`, `gallery/`, `full/`)
- **Check**: Filenames match what's in `gallery.json`
- **Check**: R2 bucket has public read access configured

## Quick Reference

| Item | Value |
|------|-------|
| R2 Account ID | `a4a6684b586aeee5dafd01cdd8492644` |
| R2 Bucket | `newvision` |
| Worker Variable | `R2_BUCKET` |
| GitHub Repo | `wbs8457/newvision` |
| Admin Page | `admin.html` |

## What's Next?

- ✅ Upload your first batch of images
- ✅ Test on GitHub Pages: `https://wbs8457.github.io/newvision/admin.html`
- ✅ Automate gallery.json updates (future enhancement)
- ✅ Add authentication to admin page (future enhancement)

## Security Notes

✅ **Secure**:
- R2 credentials stay in Cloudflare Dashboard (server-side)
- Worker URL is public (safe to commit)
- GitHub Secrets are encrypted

❌ **Don't commit**:
- `tokens.local.js` (already in .gitignore)
- R2 auth tokens
- Any credentials

---

**Need help?** Check `DEPLOYMENT.md` for more details or check Cloudflare Worker logs in the Dashboard.
