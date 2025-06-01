import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [lidOpen, setLidOpen] = useState(false);

  const handleFileClick = () => {
    setLidOpen(true);
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setQuizGenerated(false);
      setTimeout(() => setLidOpen(false), 1500); // auto-close lid
    } else {
      setError('Only PDF files are accepted');
      setLidOpen(false);
    }
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
      await axios.get('http://localhost:3001/api/health');
      const response = await axios.post('http://localhost:3001/api/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;
      localStorage.setItem('quizData', JSON.stringify(data));
      setQuizData(data);
      setQuizGenerated(true);
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        setError(err.response.data.error || 'Failed to generate quiz. Please try again.');
      } else if (err.request) {
        setError('Could not connect to the server. Please make sure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => navigate('/quiz');

  const handleSaveQuiz = () => setShowSaveModal(true);

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
    <div className="w-full flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary-600">Create Quiz from PDF</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 3D Upload Box */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 perspective" onClick={handleFileClick}>
              <div className={`box-lid ${lidOpen ? 'open' : ''}`} />
              <div className="box-body" />
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {file && (
            <p className="text-center text-sm text-gray-600 mt-2">{file.name}</p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="input-field"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
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

          <div className="space-y-4">
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
          </div>
        </form>

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

      {/* 3D Box Styles */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .box-body {
          width: 100%;
          height: 100%;
          background: #d1d5db;
          border: 2px solid #6b7280;
          border-radius: 4px;
          transform-style: preserve-3d;
          position: relative;
        }
        .box-lid {
          width: 100%;
          height: 20px;
          background: #6b7280;
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: top;
          transform: rotateX(0deg);
          transition: transform 0.6s;
        }
        .box-lid.open {
          transform: rotateX(-120deg);
        }
      `}</style>
    </div>
  );
};

export default Home;
