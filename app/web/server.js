const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'saved-images');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `verilens-${timestamp}.jpg`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Serve static files from mobile-camera directory
app.use(express.static(path.join(__dirname)));

// Serve saved images
app.use('/saved-images', express.static(path.join(__dirname, 'saved-images')));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Save image with metadata
app.post('/api/save-image', async (req, res) => {
  try {
    const { imageData, metadata, verificationResult } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `verilens-${timestamp}.jpg`;
    const imagePath = path.join(__dirname, 'saved-images', filename);
    const metadataPath = path.join(
      __dirname,
      'saved-images',
      `${filename}.metadata.json`
    );

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(imagePath), { recursive: true });

    // Convert base64 to buffer and save image
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(imagePath, imageBuffer);

    // Save metadata
    const fullMetadata = {
      filename,
      savedAt: new Date().toISOString(),
      originalMetadata: metadata,
      verificationResult,
      filePath: `/saved-images/${filename}`,
      fileSize: imageBuffer.length,
    };

    await fs.writeFile(metadataPath, JSON.stringify(fullMetadata, null, 2));

    console.log(
      `💾 Image saved: ${filename} (${(imageBuffer.length / 1024).toFixed(
        1
      )} KB)`
    );

    res.json({
      success: true,
      filename,
      filePath: `/saved-images/${filename}`,
      metadataPath: `/saved-images/${filename}.metadata.json`,
      fileSize: imageBuffer.length,
    });
  } catch (error) {
    console.error('Save image error:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// Get saved images list
app.get('/api/saved-images', async (req, res) => {
  try {
    const imagesDir = path.join(__dirname, 'saved-images');

    try {
      const files = await fs.readdir(imagesDir);
      const imageFiles = files
        .filter((f) => f.endsWith('.jpg'))
        .map((f) => ({
          filename: f,
          path: `/saved-images/${f}`,
          metadataPath: `/saved-images/${f}.metadata.json`,
        }));

      res.json({ images: imageFiles });
    } catch (dirError) {
      // Directory doesn't exist yet
      res.json({ images: [] });
    }
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Get specific image metadata
app.get('/api/metadata/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const metadataPath = path.join(
      __dirname,
      'saved-images',
      `${filename}.metadata.json`
    );

    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    res.json(metadata);
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(404).json({ error: 'Metadata not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'VeriLens Mobile Camera',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(port, () => {
  console.log(`\n📱 VeriLens Mobile Camera App`);
  console.log(`🌐 Running at: http://localhost:${port}`);
  console.log(`📸 Simple camera app like iOS/Android`);
  console.log(`🔒 Cryptographic verification with SDK integration\n`);
});

module.exports = app;
