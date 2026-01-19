// WBS New Vision - Admin Upload Script
// Handles image resizing and R2 uploads

const R2_CONFIG = {
    accountId: 'a4a6684b586aeee5dafd01cdd8492644',
    bucketName: 'newvision',
    endpoint: 'https://a4a6684b586aeee5dafd01cdd8492644.r2.cloudflarestorage.com',
    sizes: {
        thumbnails: 400,
        gallery: 800,
        full: 1200
    },
    // Cloudflare Worker URL for secure uploads
    // Set this to your deployed Worker URL after deploying cloudflare-worker/upload.js
    // Format: https://your-worker.your-subdomain.workers.dev
    // This can also be set via GitHub Secrets (see DEPLOYMENT.md)
    workerUrl: (typeof window !== 'undefined' && window.SECRETS_CONFIG?.workerUrl) 
        ? window.SECRETS_CONFIG.workerUrl 
        : 'https://r2-upload-worker.bill-a4a.workers.dev'
};

// Image resizing function
function resizeImage(file, maxWidth, quality = 0.9) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and resize
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to resize image'));
                    }
                },
                file.type || 'image/jpeg',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Generate all three sizes
async function generateImageSizes(file) {
    const [thumbnail, gallery, full] = await Promise.all([
        resizeImage(file, R2_CONFIG.sizes.thumbnails, 0.85),
        resizeImage(file, R2_CONFIG.sizes.gallery, 0.9),
        resizeImage(file, R2_CONFIG.sizes.full, 0.95)
    ]);

    return { thumbnail, gallery, full };
}

// Upload to R2 via Cloudflare Worker (secure server-side upload)
async function uploadToR2(blob, key, contentType) {
    // Use Cloudflare Worker for secure server-side uploads
    // Worker handles authentication and AWS Signature V4 signing
    
    if (!R2_CONFIG.workerUrl) {
        throw new Error('Worker URL not configured. Please set R2_CONFIG.workerUrl in admin-upload.js after deploying the Cloudflare Worker.');
    }
    
    try {
        // Create form data to send to Worker
        const formData = new FormData();
        formData.append('image', blob, key.split('/').pop());
        formData.append('key', key);
        formData.append('contentType', contentType);
        
        // Send to Cloudflare Worker
        const response = await fetch(R2_CONFIG.workerUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || `Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error(error.message || 'Upload failed. Please check your Worker URL and configuration.');
    }
}

// Selected images
let selectedImages = [];
let uploadedImages = [];

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const imagePreviews = document.getElementById('imagePreviews');
const uploadBtn = document.getElementById('uploadBtn');
const uploadForm = document.getElementById('uploadForm');
const accountId = document.getElementById('accountId');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    accountId.textContent = R2_CONFIG.accountId;
    
    // Wait for gallery select to exist (it's in the password-protected content)
    const gallerySelect = document.getElementById('gallery');
    if (gallerySelect) {
        // Load galleries
        await populateGalleryDropdown();
        // Gallery change
        gallerySelect.addEventListener('change', updateUploadButton);
    }

    // Click to select files
    uploadZone.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
    
    // Form submit
    uploadForm.addEventListener('submit', handleUpload);
});

// Re-initialize galleries when admin content is shown (after password)
function initializeAfterAuth() {
    const gallerySelect = document.getElementById('gallery');
    if (gallerySelect && gallerySelect.options.length <= 1) {
        populateGalleryDropdown();
        gallerySelect.addEventListener('change', updateUploadButton);
    }
}

// Handle file selection
function handleFileSelect(e) {
    handleFiles(e.target.files);
}

// Handle files (from input or drag-drop)
function handleFiles(files) {
    const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
    );
    
    imageFiles.forEach(file => {
        if (!selectedImages.find(img => img.file.name === file.name && img.file.size === file.size)) {
            selectedImages.push({ file, status: 'pending' });
        }
    });
    
    updatePreviews();
    updateUploadButton();
}

// Update image previews
function updatePreviews() {
    imagePreviews.innerHTML = '';
    
    selectedImages.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'image-preview col-md-6 col-lg-4';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(item.file);
        img.className = 'img-fluid';
        img.style.maxHeight = '200px';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-danger btn-sm remove-btn';
        removeBtn.innerHTML = '<i class="bi bi-x"></i>';
        removeBtn.onclick = () => {
            selectedImages.splice(index, 1);
            updatePreviews();
            updateUploadButton();
        };
        
        const info = document.createElement('div');
        info.className = 'mt-2 small';
        info.innerHTML = `
            <div><strong>${item.file.name}</strong></div>
            <div class="text-muted">${(item.file.size / 1024).toFixed(1)} KB</div>
            <div class="resize-preview mt-2">
                <div class="resize-preview-item">
                    <div>Thumb</div>
                    <div class="bg-secondary" style="width: 40px; height: 30px; border-radius: 0.25rem;"></div>
                </div>
                <div class="resize-preview-item">
                    <div>Gallery</div>
                    <div class="bg-secondary" style="width: 80px; height: 60px; border-radius: 0.25rem;"></div>
                </div>
                <div class="resize-preview-item">
                    <div>Full</div>
                    <div class="bg-secondary" style="width: 120px; height: 90px; border-radius: 0.25rem;"></div>
                </div>
            </div>
        `;
        
        div.appendChild(img);
        div.appendChild(removeBtn);
        div.appendChild(info);
        
        imagePreviews.appendChild(div);
    });
}

// Update upload button state
function updateUploadButton() {
    const gallery = document.getElementById('gallery').value;
    uploadBtn.disabled = selectedImages.length === 0 || !gallery;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await populateGalleryDropdown();
    document.getElementById('gallery').addEventListener('change', updateUploadButton);
});

// Load galleries from R2 via Worker or local file
async function loadGalleries() {
    // Try R2 via Worker first (avoids CORS issues)
    const workerUrl = R2_CONFIG.workerUrl;
    if (workerUrl) {
        try {
            const response = await fetch(`${workerUrl}?path=data/galleries.json`);
            if (response.ok) {
                const text = await response.text();
                const data = JSON.parse(text);
                return data.galleries || [];
            }
        } catch (error) {
            console.log('Worker load failed, trying local file:', error);
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

// Populate gallery dropdown
async function populateGalleryDropdown() {
    const gallerySelect = document.getElementById('gallery');
    const galleries = await loadGalleries();
    
    gallerySelect.innerHTML = '<option value="">Select a gallery...</option>';
    galleries.forEach(gallery => {
        const option = document.createElement('option');
        option.value = gallery.id;
        option.textContent = gallery.name;
        gallerySelect.appendChild(option);
    });
    
    updateUploadButton();
}

// Handle upload
async function handleUpload(e) {
    e.preventDefault();
    
    const gallery = document.getElementById('gallery').value;
    const featured = document.getElementById('featured').checked;
    
    if (selectedImages.length === 0 || !gallery) {
        alert('Please select images and a gallery');
        return;
    }
    
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.innerHTML = '';
    
    uploadedImages = [];
    const galleryEntries = [];
    
    try {
        for (let i = 0; i < selectedImages.length; i++) {
            const item = selectedImages[i];
            item.status = 'processing';
            
            // Generate filename
            const originalName = item.file.name;
            const ext = originalName.split('.').pop().toLowerCase();
            const baseName = originalName.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
            const filename = `${baseName}.${ext === 'jpg' ? 'webp' : ext}`;
            
            statusDiv.innerHTML = `<div class="alert alert-info">Processing ${i + 1}/${selectedImages.length}: ${originalName}</div>`;
            
            try {
                // Generate sizes
                const sizes = await generateImageSizes(item.file);
                
                // Try to upload each size (will likely need manual upload)
                let uploadSuccess = false;
                try {
                    await uploadToR2(sizes.thumbnail, `thumbnails/${filename}`, sizes.thumbnail.type);
                    await uploadToR2(sizes.gallery, `gallery/${filename}`, sizes.gallery.type);
                    await uploadToR2(sizes.full, `full/${filename}`, sizes.full.type);
                    uploadSuccess = true;
                } catch (error) {
                    // Direct upload not available - store blobs for download
                    uploadSuccess = false;
                    item.uploadBlobs = {
                        thumbnail: { blob: sizes.thumbnail, key: `thumbnails/${filename}` },
                        gallery: { blob: sizes.gallery, key: `gallery/${filename}` },
                        full: { blob: sizes.full, key: `full/${filename}` }
                    };
                    item.uploadError = error.message || 'Direct upload requires AWS Signature V4. Use manual upload.';
                }
                
                // Generate gallery entry
                const entry = {
                    filename: filename,
                    gallery: gallery, // Changed from category to gallery
                    title: baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    alt: `${gallery} photography - ${baseName.replace(/-/g, ' ')}`,
                    description: `Uploaded ${new Date().toLocaleDateString()}`,
                    featured: featured,
                    date: new Date().toISOString().split('T')[0]
                };
                
                uploadedImages.push({ 
                    ...item, 
                    filename, 
                    entry, 
                    uploadSuccess,
                    sizes: sizes 
                });
                galleryEntries.push(entry);
                
                item.status = uploadSuccess ? 'completed' : 'pending_manual_upload';
            } catch (error) {
                item.status = 'error';
                console.error(`Error processing ${originalName}:`, error);
                throw error;
            }
        }
        
        // Show results
        const successful = uploadedImages.filter(img => img.uploadSuccess).length;
        const needManual = uploadedImages.filter(img => !img.uploadSuccess).length;
        
        let statusHtml = '';
        if (successful > 0) {
            statusHtml += `
                <div class="alert alert-success mb-2">
                    <i class="bi bi-check-circle me-2"></i>
                    Successfully uploaded ${successful} image(s)!
                </div>
            `;
        }
        if (needManual > 0) {
            statusHtml += `
                <div class="alert alert-warning mb-2">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${needManual} image(s) need manual upload. Click "Download Resized Images" below.
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="downloadResizedImages()">
                        <i class="bi bi-download me-2"></i>Download Resized Images for Manual Upload
                    </button>
                </div>
            `;
        }
        
        statusDiv.innerHTML = statusHtml;
        
        // Show gallery entries
        showGalleryEntries(galleryEntries);
        
        // Reset form
        selectedImages = [];
        updatePreviews();
        uploadForm.reset();
        updateUploadButton();
        
    } catch (error) {
        statusDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error: ${error.message}
                <br><small class="mt-2 d-block">Note: Direct R2 upload requires proper authentication. 
                You may need to use Cloudflare Dashboard or a backend service.</small>
            </div>
        `;
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="bi bi-cloud-upload me-2"></i>Upload Images';
    }
}

// Show gallery entries
function showGalleryEntries(entries) {
    const entriesDiv = document.getElementById('galleryEntries');
    const card = document.getElementById('galleryEntriesCard');
    
    const jsonString = JSON.stringify(entries, null, 2);
    entriesDiv.textContent = jsonString;
    entriesDiv.setAttribute('data-entries', jsonString);
    
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth' });
}

// Copy gallery entries to clipboard
function copyGalleryEntries() {
    const entriesDiv = document.getElementById('galleryEntries');
    const entries = entriesDiv.getAttribute('data-entries');
    
    if (entries) {
        navigator.clipboard.writeText(entries).then(() => {
            const btn = event.target.closest('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check me-2"></i>Copied!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-primary');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-primary');
            }, 2000);
        });
    }
}

// Download resized images for manual upload
function downloadResizedImages() {
    uploadedImages.forEach((item, index) => {
        if (!item.uploadSuccess && item.uploadBlobs) {
            // Create download links for each size
            Object.entries(item.uploadBlobs).forEach(([size, data]) => {
                const url = URL.createObjectURL(data.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.key.replace('/', '-'); // thumbnails-filename.webp
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }
    });
    
    // Show instructions
    const instructions = `
Upload Instructions:
1. The resized images have been downloaded to your computer
2. Go to Cloudflare Dashboard > R2 > Bucket: newvision
3. Upload each image to its respective folder:
   - thumbnails-*.webp → thumbnails/
   - gallery-*.webp → gallery/
   - full-*.webp → full/
4. Copy the gallery.json entries (shown below) and add them to data/gallery.json
5. Commit and push to GitHub
    `;
    
    alert(instructions);
}