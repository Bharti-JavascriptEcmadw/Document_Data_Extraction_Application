const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Enable CORS to allow communication between frontend and backend
app.use(cors());

// Configure Multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Process the image using Tesseract.js
  Tesseract.recognize(
    req.file.buffer, // Process the uploaded image
    'eng', // Language for OCR is set to English
    {
      logger: (info) => console.log(info), // Log progress in the console
    }
  )
    .then(({ data: { text } }) => {
      console.log('Extracted Text:', text); // Log extracted text to verify

      // Use regular expressions (regex) to extract relevant fields
      const name = text.match(/Name[:\s]*([A-Za-z\s]+)/)?.[1]?.trim() || 'Not found';
      const licenseNumber = text.match(/License No[:\s]*([\w\d]+)/)?.[1]?.trim() || 'Not found';
      const expirationDate = text.match(/Expiration Date[:\s]*([\d\/-]+)/)?.[1]?.trim() || 'Not found';

      // Send the extracted data as JSON response
      res.json({ name, licenseNumber, expirationDate });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to extract data.' });
    });
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
