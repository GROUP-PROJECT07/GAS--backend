import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import correspondenceRoutes from './routes/correspondence.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://preview-frontend-for-cms-kzmowcx6d5gl4sf73iox.vusercontent.net',
  'https://gas-frontend-2-9j.vercel.app',
];

const corsOriginChecker = (origin, callback) => {
  console.log('CORS Origin:', origin);

  if (!origin) {
    // Allow non-browser requests like Postman or curl
    return callback(null, true);
  }

  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  if (/\.app\.github\.dev$/.test(origin)) {
    return callback(null, true);
  }

  console.log(`Blocked origin: ${origin}`);
  return callback(new Error(`CORS policy does not allow origin: ${origin}`), false);
};

const corsOptions = {
  origin: corsOriginChecker,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('GAS Backend is running');
});

app.use('/api/users', userRoutes);
app.use('/api/correspondence', correspondenceRoutes);

app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
