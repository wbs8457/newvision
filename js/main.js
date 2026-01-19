// WBS New Vision - Main JavaScript

// Configuration is loaded from config.js
// Access via SITE_CONFIG (loaded globally)
const CONFIG = {
    R2_BASE_URL: window.SITE_CONFIG?.r2?.baseUrl || null,
    GALLERY_DATA_URL: window.SITE_CONFIG?.gallery?.dataUrl || 'data/gallery.json',
    FEATURED_COUNT: window.SITE_CONFIG?.gallery?.featuredCount || 6,
    USE_PLACEHOLDERS: window.SITE_CONFIG?.r2?.usePlaceholders !== false,
};

// Initialize Lightbox2
if (typeof lightbox !== 'undefined' && window.SITE_CONFIG?.lightbox) {
    lightbox.option(window.SITE_CONFIG.lightbox);
}

// Load gallery data
async function loadGalleryData() {
    try {
        const response = await fetch(CONFIG.GALLERY_DATA_URL);
        if (!response.ok) {
            throw new Error('Failed to load gallery data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading gallery data:', error);
        return null;
    }
}

// Get image URL from R2 or use placeholder
function getImageUrl(filename, size = 'gallery', imageIndex = 0) {
    // If R2 is not configured, use placeholder images
    if (!CONFIG.R2_BASE_URL || CONFIG.R2_BASE_URL.includes('your-account-id') || CONFIG.USE_PLACEHOLDERS) {
        // Use Picsum Photos for beautiful placeholder images
        // Different sizes for different use cases
        const sizeMap = {
            'thumbnail': 400,
            'gallery': 800,
            'full': 1200
        };
        
        const width = sizeMap[size] || 800;
        const height = Math.round(width * 0.75); // 4:3 aspect ratio
        
        // Use different image IDs based on filename or index for variety
        // This ensures we get different placeholder images (Picsum has 1000+ images)
        const imageId = (imageIndex % 1000) + 1; // Cycle through different images
        
        // Use Picsum Photos (free, reliable placeholder service)
        return `https://picsum.photos/id/${imageId}/${width}/${height}`;
    }
    
    // Use R2 bucket
    const sizeMap = {
        'thumbnail': 'thumbnails',
        'gallery': 'gallery',
        'full': 'full'
    };
    
    const folder = sizeMap[size] || 'gallery';
    return `${CONFIG.R2_BASE_URL}/${folder}/${filename}`;
}

// Create gallery item HTML
function createGalleryItem(image, index) {
    const imageUrl = getImageUrl(image.filename, 'gallery', index);
    const fullImageUrl = getImageUrl(image.filename, 'full', index);
    
    const galleryId = image.gallery || 'all';
    const galleryClass = galleryId ? `gallery-${galleryId}` : '';
    
    return `
        <div class="col-md-6 col-lg-4 mb-4 gallery-item ${galleryClass}" data-gallery="${galleryId}" data-index="${index}">
            <a href="${fullImageUrl}" data-lightbox="gallery" data-title="${image.title || ''}">
                <div class="ratio ratio-4x3">
                    <img src="${imageUrl}" 
                         alt="${image.alt || image.title || 'Gallery image'}" 
                         class="img-fluid rounded"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/800x600/cccccc/666666?text=Image+Loading'">
                </div>
            </a>
        </div>
    `;
}

// Load and display gallery
async function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    // Show loading state
    galleryGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading gallery...</p>
        </div>
    `;
    
    const galleryData = await loadGalleryData();
    
    if (!galleryData || !galleryData.images || galleryData.images.length === 0) {
        galleryGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-image display-1 text-muted mb-3"></i>
                <h3 class="h5 mb-3">No Images Found</h3>
                <p class="text-muted">Please add images to the gallery or check your configuration.</p>
            </div>
        `;
        return;
    }
    
    // Handle case where images array exists but is empty
    if (galleryData.images.length === 0) {
        galleryGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-image display-1 text-muted mb-3"></i>
                <h3 class="h5 mb-3">Gallery Empty</h3>
                <p class="text-muted">Add images to your gallery.json file to get started.</p>
            </div>
        `;
        return;
    }
    
    // Clear loading state
    galleryGrid.innerHTML = '';
    
    // Create gallery items
    galleryData.images.forEach((image, index) => {
        const itemHTML = createGalleryItem(image, index);
        galleryGrid.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    // Initialize gallery filter
    initializeGalleryFilter();
}

// Load galleries and create filter buttons
async function loadGalleriesForFilter() {
    // Try R2 first
    const r2BaseUrl = window.SITE_CONFIG?.r2?.baseUrl;
    if (r2BaseUrl) {
        try {
            const r2Url = `${r2BaseUrl}/data/galleries.json`;
            const response = await fetch(r2Url);
            if (response.ok) {
                const data = await response.json();
                return data.galleries || [];
            }
        } catch (error) {
            console.log('R2 load failed, trying local file:', error);
        }
    }
    
    // Fallback to local file
    try {
        const galleriesUrl = window.SITE_CONFIG?.gallery?.galleriesUrl || 'data/galleries.json';
        const response = await fetch(galleriesUrl);
        if (!response.ok) throw new Error('Failed to load galleries');
        const data = await response.json();
        return data.galleries || [];
    } catch (error) {
        console.error('Error loading galleries:', error);
        return [];
    }
}

// Initialize gallery filter
async function initializeGalleryFilter() {
    const filterContainer = document.querySelector('.btn-group[role="group"]');
    if (!filterContainer) return;
    
    // Load galleries dynamically
    const galleries = await loadGalleriesForFilter();
    
    // Clear existing buttons (except "All")
    const allButton = filterContainer.querySelector('[data-gallery="all"]');
    filterContainer.innerHTML = '';
    
    // Add "All" button
    if (allButton) {
        filterContainer.appendChild(allButton);
    } else {
        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'btn btn-outline-primary active';
        allBtn.setAttribute('data-gallery', 'all');
        allBtn.textContent = 'All';
        filterContainer.appendChild(allBtn);
    }
    
    // Add gallery buttons
    galleries.forEach(gallery => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-primary';
        btn.setAttribute('data-gallery', gallery.id);
        btn.textContent = gallery.name;
        filterContainer.appendChild(btn);
    });
    
    // Attach event listeners
    const filterButtons = filterContainer.querySelectorAll('[data-gallery]');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const galleryId = this.getAttribute('data-gallery');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const itemGallery = item.getAttribute('data-gallery');
                if (galleryId === 'all' || itemGallery === galleryId) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Load featured images on homepage
async function loadFeaturedImages() {
    const featuredGallery = document.getElementById('featured-gallery');
    if (!featuredGallery) return;
    
    const galleryData = await loadGalleryData();
    
    if (!galleryData || !galleryData.images || galleryData.images.length === 0) {
        return;
    }
    
    // Get featured images (first N images, or marked as featured)
    const featuredImages = galleryData.images
        .filter(img => img.featured !== false)
        .slice(0, CONFIG.FEATURED_COUNT);
    
    if (featuredImages.length === 0) {
        return;
    }
    
    featuredGallery.innerHTML = '';
    
    featuredImages.forEach((image, index) => {
        const imageUrl = getImageUrl(image.filename, 'gallery', index);
        const fullImageUrl = getImageUrl(image.filename, 'full', index);
        
        const itemHTML = `
            <div class="col-md-6 col-lg-4 mb-4">
                <a href="${fullImageUrl}" data-lightbox="featured" data-title="${image.title || ''}">
                    <div class="ratio ratio-4x3 gallery-item">
                        <img src="${imageUrl}" 
                             alt="${image.alt || image.title || 'Featured image'}" 
                             class="img-fluid rounded"
                             loading="lazy"
                             onerror="this.src='https://via.placeholder.com/800x600/cccccc/666666?text=Image+Loading'">
                    </div>
                </a>
            </div>
        `;
        featuredGallery.insertAdjacentHTML('beforeend', itemHTML);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load featured images on homepage
    if (document.getElementById('featured-gallery')) {
        loadFeaturedImages();
    }
    
    // Load full gallery on portfolio page
    if (document.getElementById('gallery-grid')) {
        loadGallery();
    }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadGallery,
        loadFeaturedImages,
        loadGalleryData,
        getImageUrl
    };
}
