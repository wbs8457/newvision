// Gallery Management Functions
// Handles CRUD operations for galleries

let currentGalleries = [];

// Load galleries from R2 via Worker or local file
async function loadGalleriesForManagement() {
    // Try R2 via Worker first (avoids CORS issues)
    const workerUrl = R2_CONFIG.workerUrl;
    if (workerUrl) {
        try {
            const response = await fetch(`${workerUrl}?path=data/galleries.json`);
            if (response.ok) {
                const text = await response.text();
                const data = JSON.parse(text);
                return data.galleries || [];
            } else if (response.status === 404) {
                // File doesn't exist in R2 yet, fall through to local file
            }
        } catch (error) {
            // Silently fail and try local file
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

// Load and render galleries in the tab
async function loadAndRenderGalleries() {
    currentGalleries = await loadGalleriesForManagement();
    renderGalleriesList();
}

// Open modal to add new gallery
function openAddGalleryModal() {
    document.getElementById('galleryEditModalTitle').textContent = 'Add New Gallery';
    document.getElementById('editGalleryIndex').value = '';
    document.getElementById('editGalleryId').value = '';
    document.getElementById('editGalleryName').value = '';
    document.getElementById('editGalleryDescription').value = '';
    const modal = new bootstrap.Modal(document.getElementById('galleryEditModal'));
    modal.show();
}

// Open modal to edit existing gallery
function openEditGalleryModal(index) {
    const gallery = currentGalleries[index];
    if (!gallery) return;
    
    document.getElementById('galleryEditModalTitle').textContent = 'Edit Gallery';
    document.getElementById('editGalleryIndex').value = index;
    document.getElementById('editGalleryId').value = gallery.id || '';
    document.getElementById('editGalleryName').value = gallery.name || '';
    document.getElementById('editGalleryDescription').value = gallery.description || '';
    const modal = new bootstrap.Modal(document.getElementById('galleryEditModal'));
    modal.show();
}

// Save gallery from modal form
function saveGalleryFromModal() {
    const index = document.getElementById('editGalleryIndex').value;
    const id = document.getElementById('editGalleryId').value.trim().toLowerCase();
    const name = document.getElementById('editGalleryName').value.trim();
    const description = document.getElementById('editGalleryDescription').value.trim();
    
    if (!id || !name) {
        alert('Please fill in Gallery ID and Name');
        return;
    }
    
    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(id)) {
        alert('Gallery ID can only contain lowercase letters, numbers, and hyphens');
        return;
    }
    
    // Check for duplicate IDs (excluding current gallery)
    const existingIndex = currentGalleries.findIndex((g, i) => 
        g.id.toLowerCase() === id.toLowerCase() && i !== parseInt(index)
    );
    if (existingIndex >= 0) {
        alert('A gallery with this ID already exists');
        return;
    }
    
    const galleryData = {
        id: id,
        name: name,
        description: description
    };
    
    if (index === '' || index === null) {
        // Add new gallery
        currentGalleries.push(galleryData);
    } else {
        // Update existing gallery
        currentGalleries[parseInt(index)] = galleryData;
    }
    
    renderGalleriesList();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('galleryEditModal'));
    if (modal) modal.hide();
}

// Render galleries list
function renderGalleriesList() {
    const listDiv = document.getElementById('galleriesList');
    if (!listDiv) return;
    
    if (currentGalleries.length === 0) {
        listDiv.innerHTML = '<p class="text-muted text-center py-4">No galleries yet. Click "Add New Gallery" to create one.</p>';
        return;
    }
    
    listDiv.innerHTML = currentGalleries.map((gallery, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <strong>ID:</strong><br>
                        <code>${gallery.id || 'N/A'}</code>
                    </div>
                    <div class="col-md-4">
                        <strong>Name:</strong><br>
                        ${gallery.name || 'N/A'}
                    </div>
                    <div class="col-md-3">
                        <strong>Description:</strong><br>
                        <small class="text-muted">${gallery.description || 'None'}</small>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditGalleryModal(${index})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeGallery(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Remove gallery
function removeGallery(index) {
    if (confirm('Are you sure you want to remove this gallery? Images assigned to this gallery will need to be reassigned.')) {
        currentGalleries.splice(index, 1);
        renderGalleriesList();
    }
}


// Upload default galleries to R2
async function uploadDefaultGalleries() {
    const defaultGalleries = {
        "galleries": [
            {
                "id": "portraits",
                "name": "Portraits",
                "description": "Professional portrait photography"
            },
            {
                "id": "events",
                "name": "Events",
                "description": "Wedding and event photography"
            },
            {
                "id": "nature",
                "name": "Nature",
                "description": "Landscape and nature photography"
            },
            {
                "id": "commercial",
                "name": "Commercial",
                "description": "Commercial and business photography"
            }
        ]
    };
    
    const jsonString = JSON.stringify(defaultGalleries, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('image', blob, 'galleries.json');
    formData.append('key', 'data/galleries.json');
    formData.append('contentType', 'application/json');
    
    try {
        const response = await fetch(R2_CONFIG.workerUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('✅ Successfully uploaded default galleries.json to R2!');
            // Reload galleries
            await populateGalleryDropdown();
            // Refresh galleries list if on the galleries tab
            if (typeof loadAndRenderGalleries === 'function') {
                await loadAndRenderGalleries();
            }
        } else {
            alert('❌ Upload failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
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
            alert('✅ Galleries saved successfully to R2!');
            // Reload dropdown
            if (typeof populateGalleryDropdown === 'function') {
                await populateGalleryDropdown();
            }
            // Reload galleries list
            await loadAndRenderGalleries();
        } else {
            alert('Galleries file downloaded. Please upload it to your R2 bucket at data/galleries.json, then refresh the page.');
        }
    } else {
        alert('Failed to save galleries. Please try again.');
    }
}
