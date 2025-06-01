import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate-quiz', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { level, numQuestions } = req.body;
    const pdfBuffer = req.file.buffer;

    // Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Generate quiz questions using OpenAI
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

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const quizData = JSON.parse(completion.choices[0].message.content);
    res.json(quizData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 