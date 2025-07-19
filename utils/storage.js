const fs = require('fs');
const supabase = require('../supabase');

exports.uploadToStorage = async (filePath, filename) => {
  const file = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from('correspondence-files')
    .upload(filename, file, {
      contentType: 'application/octet-stream',
      upsert: true
    });

  if (error) return { error };

  const { data: publicURL } = supabase
    .storage
    .from('correspondence-files')
    .getPublicUrl(filename);

  return { url: publicURL.publicUrl };
};
