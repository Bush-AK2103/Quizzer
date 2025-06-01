# Quizzer - PDF to Quiz Generator

A modern web application that generates quizzes from PDF documents using AI. Built with React, Express, and OpenAI.

## Features

- Upload PDF documents
- Select quiz difficulty level
- Choose number of questions
- Interactive quiz interface
- Real-time scoring
- Modern, responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. In a separate terminal, start the backend server:
   ```bash
   npm run server
   ```

The application will be available at `http://localhost:5173`

## Usage

1. Navigate to the home page
2. Upload a PDF document
3. Select the quiz difficulty level (Easy, Medium, Hard)
4. Choose the number of questions
5. Click "Create Quiz"
6. Take the generated quiz
7. View your results

## Technologies Used

- Frontend:
  - React
  - Tailwind CSS
  - React Router
  - React Dropzone
  - Axios

- Backend:
  - Express.js
  - PDF-parse
  - OpenAI API
  - Multer

## License

MIT
