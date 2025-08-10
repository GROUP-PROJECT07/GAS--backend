import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(express.json());

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Root route
app.get('/', (req, res) => {
  res.send('GAS Backend is running');
});

// File upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = `uploads/${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from('correspondence-files')
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (error) return res.status(500).json({ error: error.message });

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

// Example DB query endpoint
app.get('/correspondence', async (req, res) => {
  const { data, error } = await supabase
    .from('correspondence')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
