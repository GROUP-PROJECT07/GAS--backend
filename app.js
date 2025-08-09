import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import correspondenceRoutes from './routes/correspondence.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',                               // React dev server
  'https://your-frontend-domain.com',                    // Replace with your real frontend URL if any
  'https://super-duper-space-acorn-pjg79gjg6gjjcr474-3000.app.github.dev'  // Your GitHub Codespaces URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error(`CORS policy does not allow origin: ${origin}`), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
