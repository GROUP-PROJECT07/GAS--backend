import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Init Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Setup multer for memory storage (no need to save locally)
const upload = multer({ storage: multer.memoryStorage() });

// POST endpoint to upload file
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = `uploads/${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from('correspondence-files')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error });
  }

  // Optional: return the public URL
  const { data: publicUrlData } = supabase
    .storage
    .from('correspondence-files')
    .getPublicUrl(filePath);

  res.status(200).json({
    message: 'Upload successful',
    filePath,
    publicUrl: publicUrlData?.publicUrl,
  });
});

// Start server
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
