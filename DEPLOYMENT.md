# Deployment Guide - Secure R2 Upload Setup

This guide explains how to set up secure image uploads using Cloudflare Workers to keep credentials out of your GitHub repo.

## Problem

- GitHub Pages is static (no server-side code)
- R2 uploads require AWS Signature V4 authentication
- Client-side credentials are insecure and exposed
- Solution: Use Cloudflare Worker as secure backend

## Setup Steps

### 1. Deploy Cloudflare Worker

1. **Install Wrangler CLI** (one-time):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy the Worker**:
   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```

4. **Configure R2 Bucket Binding** (in Cloudflare Dashboard):
   - Go to Workers & Pages > Your Worker > Settings
   - Variables > R2 Bucket Bindings
   - Add: Variable name `R2_BUCKET`, Bucket `newvision`

5. **Get Your Worker URL**:
   - After deployment, you'll get: `https://r2-upload-worker.your-subdomain.workers.dev`
   - Copy this URL

### 2. Update Admin Upload Script

1. Edit `js/admin-upload.js`
2. Find `R2_CONFIG.workerUrl` (around line 14)
3. Set it to your Worker URL:
   ```javascript
   workerUrl: 'https://r2-upload-worker.your-subdomain.workers.dev'
   ```

### 3. Alternative: Use GitHub Secrets (For GitHub Actions)

If you want to use GitHub Secrets instead:

1. **Add Secrets to GitHub**:
   - Go to your repo > Settings > Secrets and variables > Actions
   - Add:
     - `CLOUDFLARE_ACCOUNT_ID`: `a4a6684b586aeee5dafd01cdd8492644`
     - `CLOUDFLARE_R2_TOKEN`: Your R2 token
     - `CLOUDFLARE_WORKER_URL`: Your Worker URL

2. **Create GitHub Actions Workflow** (optional):
   - `.github/workflows/deploy-worker.yml`
   - Automates Worker deployment from secrets

### 4. Local Development

For local admin page development:

1. **Create `tokens.local.js`** (already gitignored):
   ```javascript
   const LOCAL_TOKENS = {
       cloudflareR2Token: 'your-token-here'
   };
   window.LOCAL_TOKENS = LOCAL_TOKENS;
   ```

2. **Set Worker URL** in `js/admin-upload.js`:
   ```javascript
   workerUrl: 'https://your-worker.workers.dev'
   ```

## Security Notes

✅ **DO**:
- Store Worker URL in config (it's public)
- Use Cloudflare Worker for authentication (server-side)
- Keep R2 tokens in Cloudflare Dashboard (never in code)

❌ **DON'T**:
- Commit R2 tokens to GitHub
- Put credentials in client-side code
- Expose AWS access keys publicly

## How It Works

```
Admin Page (admin.html)
    ↓ [Sends image blob]
Cloudflare Worker (upload.js)
    ↓ [Authenticates server-side]
Cloudflare R2 (newvision bucket)
    ↓ [Returns public URL]
Admin Page (shows success)
```

The Worker handles:
- AWS Signature V4 signing
- R2 authentication
- Secure credential storage
- CORS handling

## Troubleshooting

**Worker not working?**
- Check R2 bucket binding in Worker settings
- Verify Worker is deployed and URL is correct
- Check Cloudflare Dashboard logs

**Upload fails?**
- Verify Worker URL in `admin-upload.js`
- Check CORS settings
- Verify R2 bucket allows public writes (if needed)

**Need to update Worker?**
```bash
cd cloudflare-worker
wrangler deploy
```

## Next Steps

1. Deploy Cloudflare Worker
2. Update `js/admin-upload.js` with Worker URL
3. Test uploads in `admin.html`
4. Commit Worker URL (it's safe, no credentials)
