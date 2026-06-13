# Feedback Form Submission (Frontend + Backend)

A complete, full-stack feedback form built with HTML5, CSS3, JavaScript, Express.js, and MongoDB.

## Features
- **Frontend**: Responsive, modern, "dark aurora" theme with real-time character counters, drag-and-drop file uploads, and a submissions viewer.
- **Backend**: Express.js REST API with robust security (express-rate-limit, manual XSS sanitization) and validation.
- **Storage**: Automatically falls back to an in-memory array if MongoDB is not available, ensuring the app never crashes.
- **Uploads**: Supports attachments via `multer`.

---

## ⚠️ Copyright & Ownership

**© 2026 Vedant Khalshinge. All Rights Reserved.**

This project was designed, developed, and architected by **Vedant Khalshinge**. 

The source code, UI designs, and backend architecture contained in this repository are proprietary intellectual property. 
- **NO** unauthorized copying or distribution.
- **NO** reproduction or plagiarism without explicit written permission.
- **NO** commercial use or reselling.

*If you would like to reference or use portions of this code, please contact the author directly.*

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Testing

A comprehensive test suite is included to verify the backend validation, sanitization, storage, and endpoints:
```bash
node test-runner.js
```
