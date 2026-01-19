// Quick script to upload galleries.json to R2
const fs = require('fs');
const path = require('path');

const galleriesPath = path.join(__dirname, 'data/galleries.json');
const galleriesData = fs.readFileSync(galleriesPath, 'utf8');
const workerUrl = 'https://r2-upload-worker.bill-a4a.workers.dev';

// Create FormData manually
const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
const formData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="key"',
    '',
    'data/galleries.json',
    `--${boundary}`,
    'Content-Disposition: form-data; name="contentType"',
    '',
    'application/json',
    `--${boundary}`,
    'Content-Disposition: form-data; name="image"; filename="galleries.json"',
    'Content-Type: application/json',
    '',
    galleriesData,
    `--${boundary}--`
].join('\r\n');

fetch(workerUrl, {
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: formData
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully uploaded galleries.json to R2!');
        console.log('URL:', data.url);
    } else {
        console.error('❌ Upload failed:', data);
        process.exit(1);
    }
})
.catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
