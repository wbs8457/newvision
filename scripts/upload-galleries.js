// Script to upload default galleries.json to R2
// Run with: node scripts/upload-galleries.js

const fs = require('fs');
const path = require('path');

const GALLERIES_FILE = path.join(__dirname, '../data/galleries.json');
const WORKER_URL = 'https://r2-upload-worker.bill-a4a.workers.dev';

async function uploadGalleries() {
    try {
        // Read galleries.json
        const galleriesData = fs.readFileSync(GALLERIES_FILE, 'utf8');
        const blob = new Blob([galleriesData], { type: 'application/json' });
        
        // Create form data
        const formData = new FormData();
        formData.append('image', blob, 'galleries.json');
        formData.append('key', 'data/galleries.json');
        formData.append('contentType', 'application/json');
        
        // Upload via Worker
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Successfully uploaded galleries.json to R2!');
            console.log('Result:', result);
        } else {
            const error = await response.text();
            console.error('❌ Upload failed:', response.status, error);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

uploadGalleries();
