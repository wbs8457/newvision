# WBS New Vision Photography Website

A professional photography portfolio website built with Bootstrap 5, Lightbox2, and Cloudflare R2 for image storage.

## Features

- **Responsive Design**: Mobile-first design using Bootstrap 5
- **Image Gallery**: Beautiful gallery with category filtering and lightbox viewing
- **Cloudflare R2 Integration**: Fast, cost-effective image storage and delivery
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation
- **Fast Loading**: Optimized images with lazy loading
- **No Build Process**: Simple static HTML/CSS/JS - just upload and go

## Project Structure

```
/
├── index.html          # Homepage
├── portfolio.html     # Gallery/portfolio page
├── about.html         # About page
├── services.html      # Services and contact information
├── css/
│   └── custom.css     # Custom styles
├── js/
│   └── main.js        # Gallery loading and functionality
├── data/
│   └── gallery.json   # Image metadata
└── README.md          # This file
```

## Quick Start (Testing Without R2)

The website is configured to work **immediately** with placeholder images! You can test everything locally without setting up Cloudflare R2 first.

### Local Testing

1. **Option 1: Python HTTP Server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   Then open `http://localhost:8000` in your browser

2. **Option 2: Node.js HTTP Server**
   ```bash
   npx http-server -p 8000
   ```

3. **Option 3: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

The site will automatically use placeholder images from Unsplash until you configure R2.

## Setup Instructions

### 1. Cloudflare R2 Setup (Optional - for production)

1. Create a Cloudflare account (if you don't have one)
2. Navigate to R2 in the Cloudflare dashboard
3. Create a new bucket (e.g., `wbsnewvision-photos`)
4. Configure the bucket for public access:
   - Go to bucket settings
   - Enable public access
   - Note your R2 public URL (format: `https://your-account-id.r2.cloudflarestorage.com/your-bucket-name`)

5. Set up CORS for web access:
   - In bucket settings, add CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

6. Organize your images in the bucket:
   ```
   your-bucket/
   ├── thumbnails/     # Small versions (400px width)
   ├── gallery/        # Medium versions (800px width)
   └── full/           # Full resolution (1200px+ width)
   ```

### 2. Update Configuration

**All site configuration is centralized in `js/config.js`** - update everything in one place!

Edit `js/config.js` to customize:

```javascript
const SITE_CONFIG = {
    // Site Information
    siteName: 'WBS New Vision',
    siteTagline: 'Professional Photography Services',
    
    // Contact Information - UPDATE THESE!
    contact: {
        email: 'contact@wbsnewvision.com',  // Change this
        phone: '(555) 123-4567',              // Change this
    },
    
    // Cloudflare R2 (when ready)
    r2: {
        baseUrl: null,  // Set to your R2 URL when ready
        usePlaceholders: true,  // Set to false when using R2
    },
    
    // Site URL (update with your GitHub Pages URL or custom domain)
    urls: {
        base: 'https://wbsnewvision.github.io',  // Update this
    },
    
    // ... more settings
};
```

**Key Settings to Update:**
1. **Contact Info**: Update `contact.email` and `contact.phone`
2. **Site URL**: Update `urls.base` with your actual GitHub Pages URL
3. **R2 Bucket**: When ready, set `r2.baseUrl` and `r2.usePlaceholders: false`

**Current Behavior**: 
- Contact info, site name, and URLs are automatically updated across all pages
- `r2.baseUrl` is set to `null` by default (uses placeholder images)
- All functionality works perfectly for testing

### 3. Update Gallery Metadata

Edit `data/gallery.json` with your actual images:

```json
{
  "images": [
    {
      "filename": "your-image.webp",
      "category": "portraits",
      "title": "Image Title",
      "alt": "Descriptive alt text",
      "description": "Image description",
      "featured": true,
      "date": "2024-01-15"
    }
  ]
}
```

**Image Categories:**
- `portraits` - Portrait photography
- `events` - Event and wedding photography
- `nature` - Nature and landscape photography
- `commercial` - Commercial and business photography

### 4. Update Contact Information

Edit `services.html` and update the contact information:
- Email address
- Phone number

### 5. Customize Content

- **About Page** (`about.html`): Update the biography and information
- **Services Page** (`services.html`): Customize service descriptions and pricing
- **Homepage** (`index.html`): Update the hero section and featured content

### 6. GitHub Pages Setup

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to repository Settings > Pages
4. Select the branch (usually `main`) and folder (`/` root)
5. Your site will be available at `https://yourusername.github.io/repository-name`

### 7. Custom Domain (Optional)

1. In GitHub Pages settings, add your custom domain
2. Update DNS records as instructed by GitHub
3. The site will be available at your custom domain

## Adding New Photos

1. **Upload to R2**:
   - Upload images to your R2 bucket in the appropriate folders (`thumbnails/`, `gallery/`, `full/`)
   - Use WebP format for best performance (with JPEG fallback if needed)

2. **Update Gallery JSON**:
   - Edit `data/gallery.json`
   - Add new image entries with metadata
   - Commit and push to GitHub

3. **Auto-Deploy**:
   - GitHub Pages will automatically deploy your changes

## Image Optimization

For best performance, optimize images before uploading:

- **Thumbnails**: 400px width, WebP format
- **Gallery**: 800px width, WebP format
- **Full**: 1200px width (or original), WebP format

Use tools like:
- [Squoosh](https://squoosh.app/) - Online image optimizer
- ImageMagick - Command-line tool
- Photoshop/GIMP - Manual optimization

## Libraries Used

- **Bootstrap 5.3.0**: CSS framework (via CDN)
- **Bootstrap Icons 1.10.0**: Icon library (via CDN)
- **Lightbox2 2.11.4**: Image lightbox functionality (via CDN)

All libraries are loaded via CDN - no npm or build process required.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Copyright © 2024 WBS New Vision. All rights reserved.

## Support

For questions or issues, please contact the website administrator.
