// WBS New Vision - Centralized Configuration
// Update all site settings in this one file

const SITE_CONFIG = {
    // Site Information
    siteName: 'WBS New Vision',
    siteTagline: 'Professional Photography Services',
    siteDescription: 'Capturing life\'s beautiful moments through professional photography. Specializing in portraits, events, nature, and commercial photography.',
    
    // Contact Information
    contact: {
        email: 'contact@wbsnewvision.com',
        phone: '(555) 123-4567',
        // Add more contact methods as needed
        // address: '123 Main St, City, State 12345',
        // website: 'https://wbsnewvision.com'
    },
    
    // Social Media (optional - uncomment and fill in as needed)
    social: {
        // facebook: 'https://facebook.com/wbsnewvision',
        // instagram: 'https://instagram.com/wbsnewvision',
        // twitter: 'https://twitter.com/wbsnewvision',
    },
    
    // Cloudflare R2 Configuration
    r2: {
        // R2 bucket configuration
        // Account ID: a4a6684b586aeee5dafd01cdd8492644
        // Bucket name: "newvision"
        baseUrl: 'https://a4a6684b586aeee5dafd01cdd8492644.r2.cloudflarestorage.com/newvision',
        usePlaceholders: false, // Using R2 bucket
    },
    
    // Gallery Configuration
    gallery: {
        dataUrl: 'data/gallery.json',
        galleriesUrl: 'data/galleries.json', // Customizable galleries list
        featuredCount: 6, // Number of featured images on homepage
    },
    
    // Site URLs (update when you have a custom domain)
    urls: {
        base: 'https://wbs8457.github.io/newvision', // GitHub Pages URL
        // base: 'https://wbsnewvision.com', // Custom domain example
    },
    
    // Lightbox Settings (GLightbox)
    lightbox: {
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
    },
    
    // SEO Settings
    seo: {
        defaultImage: 'https://picsum.photos/id/1005/1200/630', // Default OG image
        twitterHandle: '@wbsnewvision', // Optional
    },
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.SITE_CONFIG = SITE_CONFIG;
}

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}
