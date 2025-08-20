import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://gas-frontend-zeta.vercel.app",
    "https://gas-frontend-9wae.vercel.app",
    "https://www.gascorrespondence.app",
    "https://gas-frontend-v2.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

/* ------------------ Health check ------------------ */
app.get('/', (req, res) => {
  res.send('GAS Backend is running');
});

/* ------------------ Middleware: Require Auth ------------------ */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Bearer token missing' });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

/* ------------------ POST: Save Correspondence ------------------ */
app.post('/correspondence', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const {
      subject,
      sender,
      recipient,
      date,
      department,
      status,
      registry_number
    } = req.body;

    if (!subject || !sender || !recipient || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileUrl = null;
    if (req.file) {
      const filePath = `uploads/${Date.now()}-${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from('correspondence-files')
        .upload(filePath, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('correspondence-files')
        .getPublicUrl(filePath);

      fileUrl = publicUrlData?.publicUrl;
    }

    const { data, error } = await supabase
      .from('correspondence')
      .insert([
        {
          subject,
          sender,
          recipient,
          date,
          department,
          status,
          registry_number,
          file_url: fileUrl,
          created_by: req.user.id
        }
      ])
      .select();

    if (error) {
      console.error('Error saving correspondence:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Correspondence saved successfully', data });
  } catch (err) {
    console.error('POST /correspondence error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------ GET: All Correspondence ------------------ */
app.get('/correspondence', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('correspondence')
      .select('*')
      .order('date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    console.error('GET /correspondence error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------ Auth: Login ------------------ */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: error.message });

    res.json({
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/* ------------------ Protected route: /me ------------------ */
app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
