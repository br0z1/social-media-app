import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts';
import { ddbDocClient } from './config/aws';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'https://spheres.nyc'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Spheres API Server',
    endpoints: {
      health: '/health',
      posts: '/api/posts'
    }
  });
});

// Routes
app.use('/api/posts', postsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  // Test DynamoDB connection
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  if (!tableName) {
    console.error('❌ DYNAMODB_TABLE_NAME environment variable is not set');
    return;
  }

  ddbDocClient.send(new PutCommand({
    TableName: tableName,
    Item: {
      partitionKey: 'test',
      sortKey: Date.now(), // Use numeric timestamp
      postId: 'test',
      timestamp: new Date().toISOString(),
    },
  }))
  .then(() => console.log('✅ DynamoDB connection successful'))
  .catch(err => console.error('❌ DynamoDB connection failed:', err));
}); 