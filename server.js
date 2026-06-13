const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Feedback = require('./models/Feedback');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedbackDB';

// ── Ensure uploads directory exists ────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Multer config for file uploads ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `feedback-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Accepted: JPG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── In-memory fallback storage ─────────────────────────────────────
const feedbackStoreFallback = [];
let useMongoStorage = false;

// ── Middleware ──────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ── Rate Limiting ──────────────────────────────────────────────────
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 10,                     // max 10 submissions per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many submissions. Please try again later.',
  },
});

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Sanitize a string to prevent stored XSS.
 * Escapes the five dangerous HTML characters.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Very basic RFC-5322-ish email check.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate the incoming feedback payload.
 * Returns an array of human-readable error strings (empty = valid).
 */
function validateFeedback({ name, email, message }) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Name is required.');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  } else if (name.trim().length > 100) {
    errors.push('Name must be 100 characters or fewer.');
  }

  if (!email || !email.trim()) {
    errors.push('Email is required.');
  } else if (!isValidEmail(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!message || !message.trim()) {
    errors.push('Message is required.');
  } else if (message.trim().length < 10) {
    errors.push('Message must be at least 10 characters.');
  } else if (message.trim().length > 2000) {
    errors.push('Message must be 2000 characters or fewer.');
  }

  return errors;
}

// ── Routes ─────────────────────────────────────────────────────────

// Serve the frontend
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Storage status endpoint
app.get('/status', (_req, res) => {
  res.json({
    storage: useMongoStorage ? 'mongodb' : 'memory',
    mongoUri: useMongoStorage ? MONGO_URI.replace(/\/\/.*@/, '//***@') : null,
  });
});

// Accept feedback submissions (with optional file upload)
app.post('/feedback', feedbackLimiter, (req, res, next) => {
  // Only use multer for multipart/form-data (file uploads).
  // For JSON and urlencoded, skip multer entirely to avoid hanging.
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('attachment')(req, res, (multerErr) => {
      if (multerErr) {
        const msg = multerErr instanceof multer.MulterError
          ? (multerErr.code === 'LIMIT_FILE_SIZE'
            ? 'File too large. Maximum size is 5 MB.'
            : multerErr.message)
          : multerErr.message;
        return res.status(400).json({ success: false, errors: [msg] });
      }
      handleFeedback(req, res);
    });
  } else {
    handleFeedback(req, res);
  }
});

// Core feedback handler (called after optional multer processing)
async function handleFeedback(req, res) {
  const { name, email, message } = req.body;

  // Validate
  const errors = validateFeedback({ name, email, message });
  if (errors.length > 0) {
    // Clean up uploaded file if validation fails
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, errors });
  }

  const sanitizedName = sanitize(name.trim());
  const sanitizedEmail = sanitize(email.trim());
  const sanitizedMessage = sanitize(message.trim());

  // Build attachment info if file was uploaded
  let attachment = null;
  if (req.file) {
    attachment = {
      filename: req.file.filename,
      originalName: sanitize(req.file.originalname),
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    };
  }

  try {
    let entry;

    if (useMongoStorage) {
      // ── MongoDB storage ──
      const doc = await Feedback.create({
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        attachment,
      });
      entry = doc.toJSON();
    } else {
      // ── In-memory fallback ──
      entry = {
        id: feedbackStoreFallback.length + 1,
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        attachment,
        timestamp: new Date().toISOString(),
      };
      feedbackStoreFallback.push(entry);
    }

    const storageLabel = useMongoStorage ? 'MongoDB' : 'Memory';
    console.log(`✅  [${storageLabel}] Feedback #${entry.id} stored from ${entry.name} <${entry.email}>${attachment ? ' 📎 ' + attachment.originalName : ''}`);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      storage: useMongoStorage ? 'mongodb' : 'memory',
      data: entry,
    });
  } catch (err) {
    console.error('❌  Storage error:', err.message);
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, errors: ['Internal server error. Please try again.'] });
  }
}

// Retrieve all stored feedback
app.get('/feedback', async (_req, res) => {
  try {
    if (useMongoStorage) {
      const docs = await Feedback.find().sort({ createdAt: -1 }).lean();
      // Transform _id → id and add timestamp alias for API consistency
      const submissions = docs.map(d => ({
        ...d,
        id: d._id,
        timestamp: d.createdAt,
        _id: undefined,
        __v: undefined,
      }));
      return res.json({ total: submissions.length, storage: 'mongodb', submissions });
    } else {
      return res.json({ total: feedbackStoreFallback.length, storage: 'memory', submissions: feedbackStoreFallback });
    }
  } catch (err) {
    console.error('❌  Fetch error:', err.message);
    return res.status(500).json({ success: false, errors: ['Failed to retrieve submissions.'] });
  }
});

// Clear all stored feedback
app.delete('/feedback', async (_req, res) => {
  try {
    if (useMongoStorage) {
      await Feedback.deleteMany({});
    } else {
      feedbackStoreFallback.length = 0; // Empty the in-memory array
    }
    
    // Also clean up uploaded files
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      fs.unlinkSync(path.join(uploadsDir, file));
    }
    
    console.log('🗑️  All feedback submissions and uploads have been cleared.');
    return res.json({ success: true, message: 'All submissions cleared successfully.' });
  } catch (err) {
    console.error('❌  Clear error:', err.message);
    return res.status(500).json({ success: false, errors: ['Failed to clear submissions.'] });
  }
});

// ── MongoDB Connection ─────────────────────────────────────────────
async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    useMongoStorage = true;
    console.log(`✅  Connected to MongoDB → ${MONGO_URI}`);
  } catch (err) {
    useMongoStorage = false;
    console.warn(`⚠️  MongoDB unavailable (${err.message}). Using in-memory storage as fallback.`);
  }
}

// ── Start ──────────────────────────────────────────────────────────
async function start() {
  await connectMongo();

  app.listen(PORT, () => {
    const mode = useMongoStorage ? '🗄️  MongoDB' : '💾  In-Memory (fallback)';
    console.log(`\n🚀  Feedback server running at  http://localhost:${PORT}`);
    console.log(`📦  Storage: ${mode}\n`);
  });
}

start();
