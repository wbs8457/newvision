// Image Management Functions
// Handles listing, editing, and deleting images

let allImages = [];
let currentFilter = 'all';

// Import loadGalleries from gallery-manager.js (assumes it's loaded globally)
async function loadGalleries() {
    if (typeof loadGalleriesForManagement === 'function') {
        return await loadGalleriesForManagement();
    }
    // Fallback
    try {
        const response = await fetch('data/galleries.json');
        if (response.ok) {
            const data = await response.json();
            return data.galleries || [];
        }
    } catch (error) {
        console.error('Error loading galleries:', error);
    }
    return [];
}

// Load all images from gallery.json
async function loadAllImages() {
    const workerUrl = R2_CONFIG.workerUrl;
    let galleryData = { images: [] };
    
    // Try to load from R2 via Worker
    if (workerUrl) {
        try {
            const response = await fetch(`${workerUrl}?path=data/gallery.json`);
            if (response.ok) {
                galleryData = await response.json();
            } else if (response.status === 404) {
                console.log('gallery.json not found in R2');
            }
        } catch (error) {
            console.error('Error loading gallery.json from R2:', error);
        }
    }
    
    // Fallback to local file
    if (galleryData.images.length === 0) {
        try {
            const response = await fetch('data/gallery.json');
            if (response.ok) {
                galleryData = await response.json();
            }
        } catch (error) {
            console.error('Error loading local gallery.json:', error);
        }
    }
    
    allImages = galleryData.images || [];
    return allImages;
}

// Render images list
function renderImagesList(images) {
    const container = document.getElementById('imagesList');
    if (!container) return;
    
    if (images.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-image display-1 text-muted mb-3"></i>
                <h3 class="h5 mb-3">No Images Found</h3>
                <p class="text-muted">Upload some images to get started.</p>
            </div>
        `;
        return;
    }
    
    // Get Worker URL for image proxying
    const workerUrl = R2_CONFIG.workerUrl || 'https://r2-upload-worker.bill-a4a.workers.dev';
    const baseUrl = R2_CONFIG.endpoint ? `${R2_CONFIG.endpoint}/${R2_CONFIG.bucketName || 'newvision'}` : 'https://a4a6684b586aeee5dafd01cdd8492644.r2.cloudflarestorage.com/newvision';
    
    container.innerHTML = images.map((image, index) => {
        // Use Worker to proxy images (handles auth and CORS)
        const thumbnailUrl = workerUrl ? `${workerUrl}/?path=thumbnails/${image.filename}` : `${baseUrl}/thumbnails/${image.filename}`;
        
        // Find the actual index in allImages array (not filtered array)
        const actualIndex = allImages.findIndex(img => img.filename === image.filename && img.gallery === image.gallery);
        const imageIndex = actualIndex >= 0 ? actualIndex : index;
        
        return `
            <div class="col-md-6 col-lg-4" data-image-index="${imageIndex}">
                <div class="card h-100">
                    <div class="position-relative">
                        <img src="${thumbnailUrl}" 
                             class="card-img-top" 
                             alt="${image.alt || image.title || ''}"
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/400x200/cccccc/666666?text=Image+Not+Found'">
                        <span class="badge bg-primary position-absolute top-0 end-0 m-2">${image.gallery || 'uncategorized'}</span>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${image.title || image.filename}</h6>
                        <p class="card-text small text-muted">${image.description || 'No description'}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-fill" onclick="editImage(${imageIndex})">
                                <i class="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger flex-fill" onclick="deleteImage(${imageIndex})">
                                <i class="bi bi-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter images by gallery
function filterImages(galleryId) {
    currentFilter = galleryId;
    const filtered = galleryId === 'all' 
        ? allImages 
        : allImages.filter(img => img.gallery === galleryId);
    renderImagesList(filtered);
}

// Edit image
function editImage(index) {
    const image = allImages[index];
    if (!image) return;
    
    // Create modal for editing
    const modalHtml = `
        <div class="modal fade" id="editImageModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Image</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editImageForm">
                            <input type="hidden" id="editImageIndex" value="${index}">
                            <div class="mb-3">
                                <label for="editTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="editTitle" value="${image.title || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="editDescription" rows="3">${image.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="editGallery" class="form-label">Gallery</label>
                                <select class="form-select" id="editGallery" required>
                                    <option value="">Select Gallery</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editAlt" class="form-label">Alt Text</label>
                                <input type="text" class="form-control" id="editAlt" value="${image.alt || ''}">
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="editFeatured" ${image.featured ? 'checked' : ''}>
                                <label class="form-check-label" for="editFeatured">
                                    Featured Image
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveImageEdit()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.getElementById('editImageModal');
    if (existing) existing.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Populate gallery dropdown and then set current gallery
    populateEditGalleryDropdown().then(() => {
        // Set current gallery after dropdown is populated
        const gallerySelect = document.getElementById('editGallery');
        if (gallerySelect) {
            gallerySelect.value = image.gallery || '';
        }
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editImageModal'));
    modal.show();
}

// Populate gallery dropdown in edit modal
async function populateEditGalleryDropdown() {
    const select = document.getElementById('editGallery');
    if (!select) return;
    
    const galleries = await loadGalleries();
    select.innerHTML = '<option value="">Select Gallery</option>' + 
        galleries.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    
    return Promise.resolve(); // Return promise so we can await it
}

// Save image edit
async function saveImageEdit() {
    const index = parseInt(document.getElementById('editImageIndex').value);
    const image = allImages[index];
    if (!image) return;
    
    // Update image data
    image.title = document.getElementById('editTitle').value;
    image.description = document.getElementById('editDescription').value;
    image.gallery = document.getElementById('editGallery').value;
    image.alt = document.getElementById('editAlt').value;
    image.featured = document.getElementById('editFeatured').checked;
    
    // Save to R2
    await saveGalleryJson();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editImageModal'));
    if (modal) modal.hide();
    
    // Refresh list
    await refreshImagesList();
    
    alert('Image updated successfully!');
}

// Delete image
async function deleteImage(index) {
    const image = allImages[index];
    if (!image) return;
    
    if (!confirm(`Are you sure you want to delete "${image.title || image.filename}"?\n\nThis will remove it from gallery.json but NOT delete the image files from R2.`)) {
        return;
    }
    
    // Remove from array
    allImages.splice(index, 1);
    
    // Save to R2
    await saveGalleryJson();
    
    // Refresh list
    await refreshImagesList();
    
    alert('Image removed from gallery!');
}

// Save gallery.json to R2
async function saveGalleryJson() {
    const galleryData = { images: allImages };
    const jsonString = JSON.stringify(galleryData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('image', blob, 'gallery.json');
    formData.append('key', 'data/gallery.json');
    formData.append('contentType', 'application/json');
    
    const workerUrl = R2_CONFIG.workerUrl;
    if (!workerUrl) {
        alert('Worker URL not configured. Cannot save to R2.');
        return false;
    }
    
    try {
        const response = await fetch(workerUrl, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            return true;
        } else {
            const error = await response.json();
            console.error('Failed to save gallery.json:', error);
            alert('Failed to save changes. Please try again.');
            return false;
        }
    } catch (error) {
        console.error('Error saving gallery.json:', error);
        alert('Error saving changes. Please try again.');
        return false;
    }
}

// Refresh images list
async function refreshImagesList() {
    await loadAllImages();
    filterImages(currentFilter);
}

// Initialize image manager
async function initializeImageManager() {
    // Load images
    await loadAllImages();
    
    // Populate gallery filter
    const filterSelect = document.getElementById('filterGallery');
    if (filterSelect) {
        const galleries = await loadGalleries();
        filterSelect.innerHTML = '<option value="all">All Galleries</option>' + 
            galleries.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
        
        filterSelect.addEventListener('change', (e) => {
            filterImages(e.target.value);
        });
    }
    
    // Render initial list
    renderImagesList(allImages);
}

// Auto-initialize when manage tab is shown
document.addEventListener('DOMContentLoaded', function() {
    const manageTab = document.getElementById('manage-tab');
    if (manageTab) {
        manageTab.addEventListener('shown.bs.tab', function() {
            if (allImages.length === 0) {
                initializeImageManager();
            }
        });
    }
});
