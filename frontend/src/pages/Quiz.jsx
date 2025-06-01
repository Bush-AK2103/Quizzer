import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedQuiz = localStorage.getItem('quizData');
    if (!storedQuiz) {
      navigate('/');
      return;
    }
    setQuizData(JSON.parse(storedQuiz));
  }, [navigate]);

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = selectedOption;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
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
    savedQuizzes.push({
      name: quizName,
      data: {
        ...quizData,
        score: score,
        totalQuestions: quizData.questions.length,
        answers: answers
      }
    });
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    
    setShowSaveModal(false);
    setQuizName('');
    setError('');
  };

  if (!quizData) {
    return <div className="text-center">Loading...</div>;
  }

  if (showResults) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
          <p className="text-xl mb-4">
            You scored {score} out of {quizData.questions.length}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Create New Quiz
            </button>
            <button
              onClick={handleSaveQuiz}
              className="btn btn-primary bg-blue-600 hover:bg-blue-700"
            >
              Save Quiz with Score
            </button>
          </div>

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
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
                  <button
                    onClick={handleSaveConfirm}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-primary-400">Question {currentQuestion + 1}</h2>
          <p className="text-lg mb-4 text-primary-400">{currentQ.question}</p>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors
                  ${answers[currentQuestion] === index
                    ? 'border-primary-500 bg-blue-100'
                    : 'border-gray-200 bg-blue-50 hover:bg-blue-100 hover:border-primary-300'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className="btn btn-primary"
          >
            {currentQuestion === quizData.questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 