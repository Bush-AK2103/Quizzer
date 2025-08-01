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

  // SVG for the back arrow
  const arrowLeftIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
        <div className="w-full max-w-2xl text-center bg-gray-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-bold mb-4 text-[#00a9a5]">Quiz Results</h2>
          <p className="text-2xl mb-6">
            You scored <span className="font-bold text-[#00a9a5]">{score}</span> out of <span className="font-bold">{quizData.questions.length}</span>
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-300"
            >
              Create New Quiz
            </button>
            <button
              onClick={handleSaveQuiz}
              className="w-full bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300"
            >
              Save Quiz with Score
            </button>
          </div>

          {/* Save Quiz Modal */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
              <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-[#00a9a5]">Save Quiz</h2>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  placeholder="Enter a name for your quiz"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 text-center border-none focus:ring-2 focus:ring-[#00a9a5]/50 rounded-full py-3 px-6 mb-4"
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      setQuizName('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfirm}
                    className="flex-1 bg-[#00a9a5] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300"
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
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-black text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-xl mt-12">
        <div className="mb-6 text-center">
          <p className="text-xl font-medium text-gray-400">
            Question <span className="font-bold text-2xl text-[#00a9a5]">{currentQuestion + 1}</span> of <span className="font-bold text-2xl text-[#00a9a5]">{quizData.questions.length}</span>
          </p>
          <h2 className="text-2xl md:text-3xl font-bold my-4 text-gray-200">{currentQ.question}</h2>
        </div>
        
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ease-in-out
                ${answers[currentQuestion] === index
                  ? 'border-[#00a9a5] bg-[#00a9a5]/20 text-[#00a9a5] font-semibold scale-105'
                  : 'border-gray-700 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-[#00a9a5]'}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={`btn px-6 py-3 rounded-full flex items-center space-x-2 transition-colors duration-200
              ${currentQuestion === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {arrowLeftIcon}
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className={`btn px-6 py-3 rounded-full font-bold transition-colors duration-200
              ${answers[currentQuestion] === undefined
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#00a9a5] text-white hover:bg-[#007a77]'
              }`}
          >
            {currentQuestion === quizData.questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
