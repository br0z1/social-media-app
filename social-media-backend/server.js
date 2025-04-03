const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// File path for posts data
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Load posts from file or initialize empty array
let posts = [];
try {
  if (fs.existsSync(POSTS_FILE)) {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    console.log('Loaded posts from file:', posts.length);
  }
} catch (error) {
  console.error('Error loading posts:', error);
}

// Save posts to file
const savePosts = () => {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    console.log('Saved posts to file:', posts.length);
  } catch (error) {
    console.error('Error saving posts:', error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Routes
app.get('/api/posts', (req, res) => {
  console.log('GET /api/posts - Current posts:', posts);
  res.json(posts);
});

app.post('/api/posts', upload.array('media'), (req, res) => {
  console.log('Received POST request to /api/posts');
  console.log('Request body:', req.body);
  console.log('Files:', req.files);
  
  try {
    const { content, location } = req.body;
    const mediaFiles = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video'
    })) : [];

    const newPost = {
      id: Date.now().toString(),
      author: {
        id: 'edgar',
        username: 'edgar',
        profileImage: '/assets/profiles/default.jpg'
      },
      content,
      mediaFiles,
      location: location ? {
        coordinates: JSON.parse(location),
        name: 'Current Location'
      } : null,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString()
    };

    console.log('Creating new post:', JSON.stringify(newPost, null, 2));
    posts.push(newPost);
    savePosts(); // Save posts after adding new one
    console.log('Current posts array:', JSON.stringify(posts, null, 2));
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Serve static files from the React app in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../social-media-app/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../social-media-app/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
}); 