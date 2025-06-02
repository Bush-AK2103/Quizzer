import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Debug environment variables
console.log('Environment variables loaded:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
  PORT: process.env.PORT || 3001
});

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
  });
});

// Function to clean JSON string
function cleanJsonString(str) {
  // Remove markdown code block markers
  str = str.replace(/```json\n?/g, '');
  str = str.replace(/```\n?/g, '');
  // Remove any other markdown formatting
  str = str.replace(/`/g, '');
  return str.trim();
}

app.post('/api/generate-quiz', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { level, numQuestions } = req.body;
    const pdfBuffer = req.file.buffer;

    // Save the PDF buffer to a temporary file
    const tempPdfPath = path.join(__dirname, 'temp.pdf');
    const tempTxtPath = path.join(__dirname, 'temp.txt');
    
    try {
      // Write the buffer to a temporary file
      await writeFile(tempPdfPath, pdfBuffer);

      // Use pdftotext to extract text from PDF
      await execAsync(`pdftotext "${tempPdfPath}" "${tempTxtPath}"`);
      
      // Read the extracted text
      const text = await readFile(tempTxtPath, 'utf8');

      // Generate quiz questions using Gemini
      const prompt = `Create ${numQuestions} ${level} difficulty multiple choice questions based on the following text. 
      For each question, provide 4 options and indicate the correct answer. Format the response as JSON:
      {
        "questions": [
          {
            "question": "question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": 0
          }
        ]
      }
      
      Text: ${text}`;

      console.log('Sending request to Gemini...');
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      const responseText = response.text();
      console.log('Raw response:', responseText);
      
      // Clean the response and parse JSON
      const cleanedJson = cleanJsonString(responseText);
      console.log('Cleaned JSON:', cleanedJson);
      const quizData = JSON.parse(cleanedJson);
      
      console.log('Received response from Gemini');
      res.json(quizData);
    } finally {
      // Clean up temporary files
      try {
        await unlink(tempPdfPath);
        await unlink(tempTxtPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files:', cleanupError);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 