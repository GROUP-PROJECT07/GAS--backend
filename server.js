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

/* ------------------ File upload ------------------ */
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = `uploads/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
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

/* ------------------ Get correspondence ------------------ */
app.get('/correspondence', async (req, res) => {
  const { data, error } = await supabase
    .from('correspondence')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
});

/* ------------------ Auth Hook: Record new user ------------------ */
app.post('/api/auth/post-signup', async (req, res) => {
  console.log("Incoming post-signup hook");

  if (req.headers.authorization !== `Bearer ${process.env.SUPABASE_HOOK_SECRET}`) {
    console.error("Unauthorized hook request");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Auth hook payload:", req.body);
    const { user } = req.body;

    if (!user) {
      return res.status(400).json({ error: "No user object in payload" });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "Unnamed User",
          created_at: new Date()
        }
      ])
      .select();

    if (error) {
      console.error("Error inserting new user:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("User inserted:", data);
    res.status(200).json({ message: "User recorded successfully", user: data });
  } catch (err) {
    console.error("Post-signup hook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------ Auth: Login ------------------ */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    user: data.user,
    session: data.session,
  });
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

/* ------------------ Protected route: /me ------------------ */
app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
