// Cloudflare Worker for R2 Image Upload
// Deploy this to Cloudflare Workers to handle secure R2 uploads

// This worker handles:
// 1. Receiving resized images from the admin page
// 2. Uploading to R2 using server-side credentials
// 3. Returning upload status

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Handle GET requests for reading files (galleries.json, images, etc.)
    if (request.method === 'GET') {
      const path = url.searchParams.get('path') || url.pathname.replace(/^\//, '');
      
      if (!path) {
        return jsonResponse({ error: 'Missing path parameter' }, 400);
      }

      try {
        // Read from R2
        const object = await env.R2_BUCKET.get(path);
        
        if (!object) {
          // Return 404 but with CORS headers so client can handle it
          return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // Determine content type based on file extension or metadata
        let contentType = object.httpMetadata?.contentType;
        if (!contentType) {
          const ext = path.split('.').pop()?.toLowerCase();
          const contentTypes = {
            'json': 'application/json',
            'webp': 'image/webp',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
          };
          contentType = contentTypes[ext] || 'application/octet-stream';
        }

        // For images, return as binary; for JSON, return as text
        const isImage = contentType.startsWith('image/');
        const data = isImage ? await object.arrayBuffer() : await object.text();

        return new Response(data, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31536000', // Cache images for 1 year
          },
        });
      } catch (error) {
        console.error('Read error:', error);
        return jsonResponse({ error: error.message || 'Failed to read file' }, 500);
      }
    }

    // Handle POST requests for uploads
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const formData = await request.formData();
      const image = formData.get('image');
      const key = formData.get('key'); // R2 object key (e.g., "thumbnails/filename.webp")
      const contentType = formData.get('contentType') || 'image/webp';

      if (!image || !key) {
        return jsonResponse({ error: 'Missing image or key' }, 400);
      }

      // Upload to R2
      // env.R2_BUCKET is bound to your R2 bucket in Workers settings
      // Account ID and credentials are configured in Cloudflare dashboard
      
      const arrayBuffer = await image.arrayBuffer();
      
      await env.R2_BUCKET.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: contentType,
        },
        // Optional: Add cache control
        // cacheControl: 'public, max-age=31536000',
      });

      // Get the public URL
      const publicUrl = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.BUCKET_NAME}/${key}`;

      return jsonResponse({
        success: true,
        key: key,
        url: publicUrl,
      }, 200);

    } catch (error) {
      console.error('Upload error:', error);
      return jsonResponse({
        error: error.message || 'Upload failed',
      }, 500);
    }
  },
};

// Helper function for JSON responses with CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
