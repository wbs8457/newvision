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
        // Set to null to use placeholder images, or provide your R2 bucket URL
        // Format: 'https://your-account-id.r2.cloudflarestorage.com/your-bucket-name'
        baseUrl: null,
        usePlaceholders: true, // Set to false when using R2
    },
    
    // Gallery Configuration
    gallery: {
        dataUrl: 'data/gallery.json',
        featuredCount: 6, // Number of featured images on homepage
    },
    
    // Site URLs (update when you have a custom domain)
    urls: {
        base: 'https://wbsnewvision.github.io', // Update with your GitHub Pages URL or custom domain
        // base: 'https://wbsnewvision.com', // Custom domain example
    },
    
    // Lightbox Settings
    lightbox: {
        resizeDuration: 200,
        wrapAround: true,
        showImageNumberLabel: true,
        alwaysShowNavOnTouchDevices: true,
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
