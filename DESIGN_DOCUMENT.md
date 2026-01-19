# WBS New Vision Photography - Design Document

## Executive Summary

This document outlines the design and architecture for **WBS New Vision** photography business website hosted on GitHub Pages, with image storage and delivery via Cloudflare R2 Object Storage. The site is designed to be simple, accessible, and easy to manage for a retired photographer while maintaining a professional appearance.

## Project Overview

### Purpose
Create a modern, accessible photography portfolio website that showcases work, displays contact information, and displays service offerings. The site should be easy to maintain and update with new photography work.

### Target Audience
- Potential clients seeking photography services
- Existing clients viewing their photos
- General visitors interested in photography portfolio

### Key Requirements
- Hosted on GitHub Pages (free hosting)
- Image storage via Cloudflare R2 (cost-effective, fast CDN)
- Simple, accessible design suitable for older users
- Easy content management for non-technical users
- Mobile-responsive design
- Fast loading times

## Assumptions & Decisions

### Photography Type
- **General Photography Portfolio**: Portraits, events, nature/landscapes, and commercial work
- Diverse portfolio showcasing multiple styles and subjects

### Content Volume
- **Initial**: 50-100 curated photos
- **Updates**: Monthly additions of 10-20 new photos
- **Organization**: Photos organized into 4-6 gallery categories

### Features
- **Contact**: Direct email/phone display (no contact form for now)
- **About Page**: Professional bio and background
- **Services**: Service packages and pricing information
- **Image Viewing**: Lightbox/modal for full-size viewing
- **Image Downloads**: View-only (web-optimized images, no high-res downloads)

### Design Preferences
- **Style**: Clean, modern, professional (not overly trendy)
- **Color Scheme**: Neutral palette (whites, grays, blacks) with subtle accent colors
- **Navigation**: Simple horizontal top navigation menu
- **Accessibility**: Larger text, high contrast, clear navigation, keyboard accessible

### Technical Management
- **Content Updates**: Simple upload process via Cloudflare R2 dashboard or simple script
- **Cloudflare R2**: Setup included in implementation
- **Domain**: Initially github.io, designed to support custom domain migration later

## Architecture

### Standard Libraries Overview

To avoid reinventing the wheel, we'll use well-established, battle-tested libraries:

1. **Bootstrap 5** - CSS framework for responsive grid, components, and utilities
2. **Lightbox2 or GLightbox** - Image lightbox/modal functionality
3. **Bootstrap Icons** - Icon library (or Font Awesome)
4. **Native HTML5** - Lazy loading, semantic HTML

All libraries loaded via CDN - no build process or npm required.

### Technology Stack

#### Frontend
- **Framework**: Vanilla JavaScript (no framework needed for static site)
- **CSS Framework**: Bootstrap 5 or Tailwind CSS (via CDN) for responsive grid and components
- **Lightbox Library**: Lightbox2, GLightbox, or PhotoSwipe (popular, well-maintained libraries)
- **Masonry Grid** (if needed): Masonry.js or Isotope for advanced grid layouts
- **Icons**: Font Awesome or Bootstrap Icons (via CDN)
- **Build Tool**: Simple build process compatible with GitHub Pages (Jekyll, or static HTML)
- **Image Optimization**: WebP format with fallbacks, lazy loading

#### Backend/Storage
- **Image Storage**: Cloudflare R2 Object Storage
- **CDN**: Cloudflare CDN (included with R2)
- **API**: Cloudflare R2 REST API or Workers for image listing

#### Hosting
- **Primary**: GitHub Pages
- **Custom Domain**: Support for future custom domain (CNAME configuration)

### System Architecture

```
┌─────────────────┐
│   GitHub Pages  │
│  (Static Site)  │
└────────┬────────┘
         │
         │ Fetches images via
         │ Cloudflare CDN
         │
         ▼
┌─────────────────┐
│ Cloudflare CDN  │
│  (R2 Images)    │
└────────┬────────┘
         │
         │ Serves from
         │
         ▼
┌─────────────────┐
│  Cloudflare R2  │
│  (Object Store) │
└─────────────────┘
```

## Site Structure

### Pages

1. **Home Page** (`/`)
   - Hero section with featured image
   - Brief introduction/welcome message
   - Featured gallery preview (6-9 thumbnails)
   - Call-to-action button (View Portfolio)

2. **Portfolio/Gallery** (`/portfolio` or `/gallery`)
   - Category filter/tabs (e.g., Portraits, Events, Nature, Commercial)
   - Responsive image grid (masonry or uniform grid)
   - Lazy loading for performance
   - Click to open lightbox modal

3. **About** (`/about`)
   - Professional biography
   - Photography background and experience
   - Personal touch (retirement transition, passion for photography)
   - Professional photo of photographer (optional)

4. **Services** (`/services`)
   - Service packages (e.g., Portrait Sessions, Event Photography, etc.)
   - Pricing information (optional - can be "Contact for pricing")
   - What's included in each package
   - Direct contact information (email, phone) for inquiries

### Navigation Structure

```
Home | Portfolio | About | Services
```

## Design Specifications

### Visual Design

#### Color Palette
- **Primary Background**: White (#FFFFFF) or off-white (#FAFAFA)
- **Text**: Dark gray (#2C2C2C) or black (#000000)
- **Accent**: Subtle blue or warm gray (#4A90E2 or #6B7280)
- **Hover States**: Light gray (#E5E7EB)
- **Borders**: Light gray (#D1D5DB)

#### Typography
- **Headings**: Sans-serif (e.g., Inter, Open Sans, or system fonts)
- **Body**: Sans-serif, minimum 16px font size
- **Line Height**: 1.6 for readability
- **Font Weights**: Regular (400) for body, Semi-bold (600) for headings

#### Layout
- **Max Width**: 1200px for content areas
- **Padding**: Generous whitespace (40-60px on desktop, 20px on mobile)
- **Grid**: Responsive grid system (CSS Grid or Flexbox)
- **Image Aspect Ratios**: Maintained, responsive sizing

#### Components

**Header**
- Bootstrap navbar component (fixed or sticky)
- Logo/business name "WBS New Vision" on left
- Navigation menu on right
- Bootstrap collapse for mobile hamburger menu

**Image Gallery**
- Bootstrap grid system (responsive: 3 columns desktop, 2 tablet, 1 mobile)
- Lightbox2/GLightbox for hover effects and click-to-view
- Library handles all lightbox functionality

**Lightbox Modal**
- Provided by Lightbox2/GLightbox library
- Full-screen or large modal overlay
- Navigation arrows (previous/next) - built-in
- Close button (X) - built-in
- Image caption support - built-in
- Keyboard navigation (arrow keys, ESC) - built-in

**Footer**
- Copyright information
- Social media links (if applicable)
- Simple, minimal design

### Accessibility Features

- **WCAG 2.1 AA Compliance**: Target compliance level
- **Keyboard Navigation**: Full site navigable via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Clear focus states on interactive elements
- **Alt Text**: Descriptive alt text for all images
- **Font Scaling**: Respects user font size preferences

### Responsive Design

#### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

#### Mobile Considerations
- Touch-friendly buttons (minimum 44x44px)
- Simplified navigation (hamburger menu)
- Optimized image sizes for mobile
- Single column layout on mobile

## Technical Implementation

### Standard Libraries & CDN Links

#### CSS Framework
- **Bootstrap 5**: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`
- **Bootstrap Icons**: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css`

#### JavaScript Libraries
- **Bootstrap JS**: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js`
- **Lightbox2**: `https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js`
  - CSS: `https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/css/lightbox.min.css`
- **GLightbox** (Alternative): `https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js`
  - CSS: `https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css`

#### Optional Libraries
- **Masonry.js** (if masonry grid needed): `https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js`
- **Isotope** (advanced filtering): `https://cdn.jsdelivr.net/npm/isotope-layout@3.0.6/dist/isotope.pkgd.min.js`

**Note**: All libraries loaded via CDN - no npm/build process required.

### GitHub Pages Setup

1. **Repository Structure**
   ```
   /
   ├── index.html
   ├── portfolio.html
   ├── about.html
   ├── services.html
   ├── css/
   │   └── custom.css (minimal custom styles, mostly using library)
   ├── js/
   │   └── main.js (minimal custom JS, mostly library initialization)
   ├── data/
   │   └── gallery.json (image metadata)
   └── README.md
   ```

2. **Build Process**
   - **Recommended**: Static HTML/CSS/JS (simplest, no build needed)
   - Libraries loaded via CDN (Bootstrap, Lightbox, etc.)
   - Option B: Jekyll (GitHub Pages native support) if templating needed
   - No complex build tools required

3. **GitHub Pages Configuration**
   - Enable GitHub Pages in repository settings
   - Select branch (main/master) and folder (root or /docs)
   - Custom domain support (future)

### Cloudflare R2 Integration

#### R2 Bucket Setup
1. Create Cloudflare account (if not exists)
2. Create R2 bucket (e.g., `photography-portfolio`)
3. Configure CORS for web access
4. Set up public access or signed URLs

#### Image Organization
```
r2-bucket/
├── portraits/
│   ├── portrait-001.webp
│   ├── portrait-001.jpg (fallback)
│   └── portrait-002.webp
├── events/
│   └── ...
├── nature/
│   └── ...
└── thumbnails/
    └── (optional thumbnail versions)
```

#### Image Metadata
- Store image metadata in JSON file (gallery structure)
- Include: filename, category, title, description, date
- Update metadata when adding new images

#### API Integration Options

**Option 1: Direct R2 URLs**
- Public bucket with direct image URLs
- Simple, no API needed
- List images via metadata JSON file

**Option 2: Cloudflare Workers**
- Worker to list/query images
- More control over access
- Can add authentication if needed

**Option 3: Static Metadata**
- JSON file in GitHub repo with image list
- Images served from R2
- Simplest approach for static site

### Image Optimization

1. **Formats**
   - Primary: WebP (modern browsers)
   - Fallback: JPEG (older browsers)
   - Use `<picture>` element for format selection

2. **Sizes**
   - Thumbnails: 400x400px (or maintain aspect ratio)
   - Gallery view: 800px width
   - Lightbox: 1200px width (or original)
   - Mobile: Responsive srcset

3. **Lazy Loading**
   - Native `loading="lazy"` attribute (built into HTML)
   - Lightbox libraries typically handle lazy loading automatically
   - Optional: lozad.js if advanced lazy loading needed

4. **CDN Benefits**
   - Cloudflare CDN provides global distribution
   - Automatic optimization
   - Fast load times worldwide

## Content Management Workflow

### Adding New Photos

1. **Upload to R2**
   - Via Cloudflare dashboard (web interface)
   - Via R2 API (scripted upload)
   - Organize by category folder

2. **Update Metadata**
   - Edit JSON metadata file
   - Add new image entry
   - Commit to GitHub repo

3. **Deploy**
   - GitHub Pages auto-deploys on commit
   - Or manual trigger if using Actions

### Simplified Upload Script (Optional)

Create a simple script for batch uploads:
```bash
# Example: upload-photos.sh
# Uploads photos to R2 and updates metadata
```

## Performance Targets

- **Page Load**: < 2 seconds (Lighthouse score 90+)
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Image Loading**: Progressive loading, lazy load below fold
- **Mobile Performance**: Optimized for 3G connections

## Security Considerations

- **CORS Configuration**: Proper CORS setup for R2 bucket
- **HTTPS**: GitHub Pages provides HTTPS by default
- **Image Access**: Public read access, no write access from web

## SEO Considerations

- **Meta Tags**: Proper title, description, Open Graph tags
- **Structured Data**: Schema.org markup for photography business
- **Alt Text**: Descriptive alt text for all images
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Proper robots.txt configuration

## Future Enhancements

1. **Contact Form**: Add contact form with Formspree or EmailJS integration
2. **Custom Domain**: Migrate from github.io to custom domain
3. **Blog**: Add blog section for photography tips/stories
4. **Client Portal**: Password-protected gallery for clients
5. **Booking System**: Online booking integration
6. **E-commerce**: Sell prints or digital downloads
7. **Analytics**: Google Analytics or privacy-friendly alternative
8. **Search**: Search functionality for gallery
9. **Social Sharing**: Easy sharing of photos/galleries

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up GitHub repository
- Create basic HTML structure with Bootstrap
- Link Bootstrap CSS/JS via CDN
- Set up Cloudflare R2 bucket
- Configure CORS and access

### Phase 2: Core Features (Week 2)
- Implement gallery page with Bootstrap grid
- Integrate Lightbox2/GLightbox library
- Add About and Services pages using Bootstrap components
- Bootstrap navbar for navigation
- Add contact information (email/phone) to Services page

### Phase 3: Integration (Week 3)
- Connect to Cloudflare R2 for images
- Configure Lightbox library with R2 image URLs
- Native lazy loading (HTML attribute)
- Test on GitHub Pages

### Phase 4: Polish (Week 4)
- Accessibility improvements
- Performance optimization
- Cross-browser testing
- Mobile testing
- Content population

### Phase 5: Launch (Week 5)
- Final content review
- SEO optimization
- Analytics setup
- Launch on github.io
- Documentation for content updates

## Testing Strategy

1. **Browser Testing**: Chrome, Firefox, Safari, Edge
2. **Device Testing**: Desktop, tablet, mobile
3. **Accessibility Testing**: Screen reader, keyboard navigation
4. **Performance Testing**: Lighthouse, PageSpeed Insights
5. **Image Loading**: Test with slow connections

## Maintenance Plan

### Regular Updates
- Monthly photo additions
- Quarterly content review
- Annual design refresh consideration

### Monitoring
- GitHub Pages uptime (generally excellent)
- Cloudflare R2 usage and costs
- Broken links check

## Cost Estimate

- **GitHub Pages**: Free
- **Cloudflare R2**: 
  - Storage: ~$0.015/GB/month
  - Egress: First 10GB free, then $0.09/GB
  - Estimated: $1-5/month for typical portfolio
- **Domain** (future): ~$10-15/year
- **Total**: Essentially free to ~$5/month

## Success Metrics

- **Page Views**: Track visitor traffic
- **Gallery Engagement**: Time spent, images viewed
- **Mobile Usage**: Percentage of mobile visitors
- **Load Times**: Monitor performance over time

## Conclusion

This design document provides a comprehensive blueprint for creating a professional, accessible photography business website for **WBS New Vision** using GitHub Pages and Cloudflare R2. The architecture leverages standard, well-maintained CSS/JS libraries (Bootstrap, Lightbox2, etc.) to avoid reinventing the wheel, making it simple, cost-effective, and easy to maintain while providing a modern, professional appearance suitable for a photography business.

The design prioritizes accessibility, performance, and ease of use for both the photographer and website visitors, making it an ideal solution for a retired photographer looking to showcase their work online. By using established libraries, we ensure reliability, browser compatibility, and easier maintenance.
