import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import correspondenceRoutes from './routes/correspondence.js';

dotenv.config();

const app = express();

// Allowed origins - add your frontend URLs here
const allowedOrigins = [
  'http://localhost:3000',                              // React dev server
  'https://your-frontend-domain.com',                   // Your deployed frontend URL
  // Allow all GitHub Codespaces subdomains on app.github.dev:
];

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS Origin:', origin);

    if (!origin) {
      // Allow requests with no origin (e.g., Postman, curl)
      return callback(null, true);
    }

    // Allow if origin matches allowed origins array
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all GitHub Codespaces subdomains:
    if (/\.app\.github\.dev$/.test(origin)) {
      return callback(null, true);
    }

    console.log(`Blocked origin: ${origin}`);
    return callback(new Error(`CORS policy does not allow origin: ${origin}`), false);
  },
  credentials: true,               // Allow cookies/auth headers
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS requests explicitly for all routes
app.options('*', cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/\.app\.github\.dev$/.test(origin)) return callback(null, true);
    return callback(new Error(`CORS policy does not allow origin: ${origin}`), false);
  },
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('GAS Backend is running');
});

app.use('/api/users', userRoutes);
app.use('/api/correspondence', correspondenceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
