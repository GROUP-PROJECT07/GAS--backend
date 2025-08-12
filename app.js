import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://gas-frontend-zeta.vercel.app',
  'https://gas-frontend-9wae.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Create Supabase client with anon key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());

// Middleware to extract user from Authorization header
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: no token' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized: invalid token' });

  req.user = user;
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

  const filePath = `correspondence-files/${Date.now()}-${file.originalname}`;

  const { error: uploadError } = await supabase.storage
    .from('correspondence-files')
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: { publicUrl } } = supabase.storage.from('correspondence-files').getPublicUrl(filePath);

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

// List correspondences for authenticated user
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
