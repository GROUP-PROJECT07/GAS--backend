import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const upload = multer({ storage: multer.memoryStorage() });


app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = `uploads/${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from('correspondence-files')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true, 
    });

  if (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }

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

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
