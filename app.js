import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create Supabase client with anon key (used for client-side operations with RLS)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());

// Middleware to extract user from Authorization header (Bearer token)
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: no token' });

  // Verify JWT and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized: invalid token' });

  req.user = user; // Attach user to request
  next();
}

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// Test route
app.get('/', (req, res) => {
  res.send('GAS Backend is running');
});

// Protected route example: get user profile
app.get('/profile', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Upload correspondence file and create correspondence record
app.post('/correspondences', authenticate, upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  // Upload file to Supabase Storage
  const filePath = `correspondence-files/${Date.now()}-${file.originalname}`;

  const { error: uploadError } = await supabase.storage
    .from('correspondence-files')
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  // Get public URL
  const { data: { publicUrl } } = supabase.storage.from('correspondence-files').getPublicUrl(filePath);

  // Insert correspondence record linked to logged-in user
  const { subject, sender, recipient, date_received, department, status, registry_number } = req.body;

  const { data, error } = await supabase
    .from('correspondences')
    .insert([{
      subject,
      sender,
      recipient,
      date_received,
      department,
      status: status || 'pending',
      registry_number,
      file_url: publicUrl,
      created_by: req.user.id,
    }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Correspondence created', data });
});

// List correspondences for authenticated user (RLS policies apply)
app.get('/correspondences', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('correspondences')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
