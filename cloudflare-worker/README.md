# Cloudflare Worker for R2 Image Upload

This Worker handles secure server-side uploads to Cloudflare R2, keeping credentials out of your client-side code.

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

Or use npx (no install needed):
```bash
npx wrangler deploy
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Configure R2 Bucket Binding

1. Go to Cloudflare Dashboard > Workers & Pages
2. Create a new Worker or select existing one
3. Go to Settings > Variables > R2 Bucket Bindings
4. Add binding:
   - **Variable name**: `R2_BUCKET`
   - **Bucket**: `newvision`

### 4. Set Environment Variables (Optional)

If you need to reference the account ID or bucket name in the worker:

1. Go to Settings > Variables > Environment Variables
2. Add:
   - `ACCOUNT_ID`: `a4a6684b586aeee5dafd01cdd8492644`
   - `BUCKET_NAME`: `newvision`

### 5. Deploy the Worker

```bash
cd cloudflare-worker
wrangler deploy
```

Or using npx:
```bash
npx wrangler deploy --config cloudflare-worker/wrangler.toml
```

### 6. Get Your Worker URL

After deployment, you'll get a URL like:
`https://r2-upload-worker.your-subdomain.workers.dev`

### 7. Update admin.html

Update `js/admin-upload.js` to use your Worker URL instead of direct R2 upload.

## Security Notes

- R2 credentials are never exposed to the client
- The Worker handles all authentication server-side
- CORS is configured to allow your GitHub Pages domain
- Consider adding authentication/rate limiting for production use
