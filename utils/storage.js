// utils/storage.js
const supabase = require('../supabase');

/**
 * Uploads a file buffer to Supabase Storage under 'correspondence-files' folder.
 * Returns a signed URL valid for 1 hour.
 *
 * @param {Buffer} fileBuffer - The file data to upload
 * @param {string} filename - Original file name
 * @returns {Promise<{ url?: string, error?: string }>}
 */
async function uploadToStorage(fileBuffer, filename) {
  try {
    const filePath = `correspondence-files/${Date.now()}-${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('correspondence-files')
      .upload(filePath, fileBuffer, { contentType: 'application/octet-stream', upsert: true });

    if (uploadError) return { error: uploadError.message };

    // Generate signed URL valid for 1 hour (3600 seconds)
    const { data: signedUrlData, error: urlError } = supabase.storage
      .from('correspondence-files')
      .createSignedUrl(filePath, 3600);

    if (urlError) return { error: urlError.message };

    return { url: signedUrlData.signedUrl };
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { uploadToStorage };
