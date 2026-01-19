// Gallery Management Functions
// Handles CRUD operations for galleries

let currentGalleries = [];

// Load galleries from R2 or local file
async function loadGalleriesForManagement() {
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

// Save galleries to R2 or generate download
async function saveGalleriesToR2(galleries) {
    const galleriesData = { galleries };
    const jsonString = JSON.stringify(galleriesData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Try to upload via Worker
    if (R2_CONFIG.workerUrl) {
        try {
            const formData = new FormData();
            formData.append('image', blob, 'galleries.json');
            formData.append('key', 'data/galleries.json');
            formData.append('contentType', 'application/json');
            
            const response = await fetch(R2_CONFIG.workerUrl, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                return { success: true, method: 'r2' };
            }
        } catch (error) {
            console.error('R2 upload failed:', error);
        }
    }
    
    // Fallback: download file for manual upload
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'galleries.json';
    a.click();
    URL.revokeObjectURL(url);
    
    return { success: true, method: 'download', message: 'File downloaded. Upload to R2 bucket at data/galleries.json' };
}

// Show gallery manager modal
async function showGalleryManager() {
    currentGalleries = await loadGalleriesForManagement();
    renderGalleriesList();
    const modal = new bootstrap.Modal(document.getElementById('galleryManagerModal'));
    modal.show();
}

// Render galleries list
function renderGalleriesList() {
    const listDiv = document.getElementById('galleriesList');
    listDiv.innerHTML = '';
    
    if (currentGalleries.length === 0) {
        listDiv.innerHTML = '<p class="text-muted">No galleries yet. Click "Add New Gallery" to create one.</p>';
        return;
    }
    
    currentGalleries.forEach((gallery, index) => {
        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'card mb-3';
        galleryDiv.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label small">Gallery ID</label>
                        <input type="text" class="form-control form-control-sm" value="${gallery.id}" 
                               onchange="updateGallery(${index}, 'id', this.value)" 
                               placeholder="e.g., portraits">
                    </div>
                    <div class="col-md-5">
                        <label class="form-label small">Gallery Name</label>
                        <input type="text" class="form-control form-control-sm" value="${gallery.name || ''}" 
                               onchange="updateGallery(${index}, 'name', this.value)" 
                               placeholder="e.g., Portraits">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small">&nbsp;</label>
                        <button class="btn btn-danger btn-sm w-100" onclick="removeGallery(${index})">
                            <i class="bi bi-trash me-1"></i>Remove
                        </button>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <label class="form-label small">Description</label>
                        <input type="text" class="form-control form-control-sm" value="${gallery.description || ''}" 
                               onchange="updateGallery(${index}, 'description', this.value)" 
                               placeholder="Optional description">
                    </div>
                </div>
            </div>
        `;
        listDiv.appendChild(galleryDiv);
    });
}

// Add new gallery
function addNewGallery() {
    const newGallery = {
        id: '',
        name: '',
        description: ''
    };
    currentGalleries.push(newGallery);
    renderGalleriesList();
}

// Update gallery property
function updateGallery(index, property, value) {
    if (currentGalleries[index]) {
        currentGalleries[index][property] = value;
    }
}

// Remove gallery
function removeGallery(index) {
    if (confirm('Are you sure you want to remove this gallery?')) {
        currentGalleries.splice(index, 1);
        renderGalleriesList();
    }
}

// Save galleries
async function saveGalleries() {
    // Validate galleries
    const validGalleries = currentGalleries.filter(g => g.id && g.name);
    const invalid = currentGalleries.filter(g => !g.id || !g.name);
    
    if (invalid.length > 0) {
        alert(`Please fill in ID and Name for all galleries. ${invalid.length} gallery(ies) are incomplete.`);
        return;
    }
    
    // Check for duplicate IDs
    const ids = validGalleries.map(g => g.id.toLowerCase());
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
        alert(`Duplicate gallery IDs found: ${[...new Set(duplicates)].join(', ')}. Please use unique IDs.`);
        return;
    }
    
    // Save
    const result = await saveGalleriesToR2(validGalleries);
    
    if (result.success) {
        if (result.method === 'r2') {
            alert('Galleries saved successfully to R2!');
            // Reload dropdown
            await populateGalleryDropdown();
            bootstrap.Modal.getInstance(document.getElementById('galleryManagerModal')).hide();
        } else {
            alert('Galleries file downloaded. Please upload it to your R2 bucket at data/galleries.json, then refresh the page.');
        }
    } else {
        alert('Failed to save galleries. Please try again.');
    }
}
