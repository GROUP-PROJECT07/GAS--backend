// utils/storage.js
const supabase = require('../supabase');

async function uploadToStorage(fileBuffer, filename) {
  const filePath = `correspondence-files/${Date.now()}-${filename}`;

  const { error } = await supabase.storage
    .from('correspondence-files')
    .upload(filePath, fileBuffer, { contentType: 'application/octet-stream' });

  if (error) return { error: error.message };

  const { data: publicUrlData } = supabase
    .storage
    .from('correspondence-files')
    .getPublicUrl(filePath);

  return { url: publicUrlData.publicUrl };
}

module.exports = { uploadToStorage };
