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
import http from 'http';
import { Server } from 'socket.io';

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
  console.warn('Warning: GEMINI_API_KEY is not set in .env file. Quiz generation will not work, but multiplayer functionality will.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// async function listModels() {
//     const models = await genAI.listModels();
//     console.log(models);
// }
// listModels();

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Please set it in the .env file.' });
    }
    
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

app.get("/", (req, res) => {
  res.send("Quizzer Backend is running ✅");
});


// --- SOCKET.IO MULTIPLAYER LOGIC ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = {}; // { roomId: { quizData, users: [{id, name, score, finished, answers}], started } }

function generateRoomId() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ quizData }) => {
    console.log('Create room request received');
    const roomId = generateRoomId();
    rooms[roomId] = { quizData, users: [], started: false };
    socket.join(roomId);
    rooms[roomId].users.push({ id: socket.id, name: 'Host', score: 0, finished: false, answers: [] });
    console.log('Room created:', { roomId, totalRooms: Object.keys(rooms).length });
    socket.emit('room-created', { roomId });
  });

  socket.once('join-room', ({ roomId, username }) => {
    console.log('Join room request:', { roomId, username });
    
    if (!rooms[roomId]) {
      console.log('Room not found:', roomId);
      socket.emit('error', { message: 'Room not found.' });
      return;
    }
    
    if (rooms[roomId].started) {
      console.log('Room already started:', roomId);
      socket.emit('error', { message: 'Quiz has already started.' });
      return;
    }
    
    socket.join(roomId);
    const name = username || `User-${socket.id.slice(-4)}`;
    rooms[roomId].users.push({ id: socket.id, name, score: 0, finished: false, answers: [] });
    
    console.log('User joined room:', { roomId, name, totalUsers: rooms[roomId].users.length });
    
    // Emit to all users in the room (including the new user)
    io.to(roomId).emit('user-joined', { users: rooms[roomId].users.map(u => u.name) });
    
    // Emit confirmation to the joining user
    console.log('Emitting user-joined event to new user:', { roomId, quizData: rooms[roomId].quizData });
    socket.emit('user-joined', { roomId, quizData: rooms[roomId].quizData });
  });

  socket.on('get-user-list', ({ roomId }) => {
    console.log('Get user list request for room:', roomId);
    if (rooms[roomId]) {
      const userList = rooms[roomId].users.map(u => u.name);
      console.log('Sending user list:', userList);
      socket.emit('user-list', { users: userList });
    } else {
      console.log('Room not found for user list request:', roomId);
      socket.emit('error', { message: 'Room not found.' });
    }
  });

  socket.on('start-quiz', ({ roomId, quizData }) => {
    if (rooms[roomId]) {
      rooms[roomId].started = true;
      io.to(roomId).emit('quiz-start', { quizData });
    }
  });

  socket.on('submit-answer', ({ roomId, questionIndex, answer }) => {
    const room = rooms[roomId];
    if (!room) return;
    const user = room.users.find(u => u.id === socket.id);
    if (!user) return;
    user.answers[questionIndex] = answer;
    // Only update score if this is the last question
    if (questionIndex === room.quizData.questions.length - 1) {
      // Calculate score
      let score = 0;
      room.quizData.questions.forEach((q, idx) => {
        if (user.answers[idx] === q.correctAnswer) score++;
      });
      user.score = score;
      user.finished = true;
      // Emit individual result to user
      socket.emit('quiz-result', { score, total: room.quizData.questions.length });
    }
    // Emit updated leaderboard to all
    io.to(roomId).emit('user-score', {
      leaderboard: room.users.map(u => ({ name: u.name, score: u.score, finished: u.finished }))
    });
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const idx = rooms[roomId].users.findIndex(u => u.id === socket.id);
      if (idx !== -1) {
        rooms[roomId].users.splice(idx, 1);
        io.to(roomId).emit('user-list', { users: rooms[roomId].users.map(u => u.name) });
        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 