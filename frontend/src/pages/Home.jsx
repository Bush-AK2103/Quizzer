import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CubeScene from './CubeScene';

const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [quizData, setQuizData] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setQuizGenerated(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('level', level);
    formData.append('numQuestions', numQuestions);

    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      await axios.get(`${BASE_URL}/api/health`);

      const response = await axios.post(`${BASE_URL}/api/generate-quiz`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;
      localStorage.setItem('quizData', JSON.stringify(data));
      setQuizData(data);
      setQuizGenerated(true);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Failed to generate quiz. Please try again.');
      } else if (err.request) {
        setError('Could not connect to the server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  const handleSaveQuiz = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = () => {
    if (!quizName.trim()) {
      setError('Please enter a name for the quiz');
      return;
    }

    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    savedQuizzes.push({ name: quizName, data: quizData });
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));

    setShowSaveModal(false);
    setQuizName('');
    setError('');
  };

  return (
    <div className="w-full max-h-screen flex flex-col items-center justify-center">
      {/* 3D Cube Dropzone */}
      <div className="w-full h-[300px] rounded-lg overflow-hidden">
        <CubeScene onFileSelect={handleFileSelect} loading={loading} />
      </div>

      <div className="text-center mt-2">
        {file ? (
          <p className="text-sm text-gray-600 font-medium">
            Uploaded File: <span className="text-gray-800">{file.name}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">No file uploaded yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
        <div className='flex flex-row px-12 py-12'>
          <div className='flex flex-col'>
            <label className="block text-sm font-medium text-gray-700 mb-1 px-2">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field pr-10">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className='flex flex-col px-10'>
            <label className="block text-sm font-medium text-gray-700 mb-1 px-2">Number of Questions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !file || quizGenerated}
          className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Generating Quiz...' : 'Create Quiz'}
        </button>

        {quizGenerated && (
          <>
            <button
              type="button"
              onClick={handleStartQuiz}
              className="btn btn-primary w-full bg-green-600 hover:bg-green-700"
            >
              Start Quiz
            </button>
            <button
              type="button"
              onClick={handleSaveQuiz}
              className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700"
            >
              Save Quiz
            </button>
          </>
        )}
      </form>

      {/* Save Quiz Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Save Quiz</h2>
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Enter quiz name"
              className="input-field mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setQuizName('');
                  setError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSaveConfirm} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
