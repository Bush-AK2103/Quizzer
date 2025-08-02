import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../socket';

const MultiplayerQuiz = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(location.state?.quizData || null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [myResult, setMyResult] = useState(null);

  // SVG for the back arrow
  const arrowLeftIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );

  useEffect(() => {
    if (!quizData) {
      // Try to load from localStorage
      const stored = localStorage.getItem(`mp_quizData_${roomId}`);
      if (stored) {
        setQuizData(JSON.parse(stored));
      } else {
        setError('Quiz data not found. Please rejoin the room or contact the host.');
        return;
      }
    }
    // Listen for leaderboard updates
    socket.on('user-score', ({ leaderboard }) => {
      setLeaderboard(leaderboard);
    });
    // Listen for my result
    socket.on('quiz-result', ({ score, total }) => {
      setMyResult({ score, total });
    });
    return () => {
      socket.off('user-score');
      socket.off('quiz-result');
    };
  }, [quizData, roomId]);

  const handleAnswer = (optionIdx) => {
    // Allows user to change their selection before moving to the next question
    setSelected(optionIdx);
  };
  
  const handleNext = () => {
    // Only proceed if an option is selected
    if (selected === null) {
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selected;
    setAnswers(newAnswers);

    // If it's the last question, submit the final answer and show results
    if (currentQuestion === quizData.questions.length - 1) {
      socket.emit('submit-answer', {
        roomId,
        questionIndex: currentQuestion,
        answer: selected,
      });
      setShowResults(true);
    } else {
      // For all other questions, submit the answer and move to the next question
      socket.emit('submit-answer', {
        roomId,
        questionIndex: currentQuestion,
        answer: selected,
      });
      setCurrentQuestion(currentQuestion + 1);
      // Reset selected option for the next question
      setSelected(answers[currentQuestion + 1] !== undefined ? answers[currentQuestion + 1] : null);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelected(answers[currentQuestion - 1]);
    }
  };

  // Check if an answer has already been submitted for the current question
  const isAnswerSubmitted = answers[currentQuestion] !== undefined;

  if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-xl">{error}</div>;
  if (!quizData) return <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-xl">Loading...</div>;

  if (showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
        <div className="w-full max-w-2xl text-center bg-gray-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-bold mb-4 text-[#00a9a5]">Quiz Complete!</h2>
          {myResult && (
            <p className="text-2xl mb-6">
              Your Score: <span className="font-bold text-[#00a9a5]">{myResult.score}</span> out of <span className="font-bold">{myResult.total}</span>
            </p>
          )}
          <h3 className="text-2xl font-bold mb-4 text-gray-200">Leaderboard</h3>
          <ul className="space-y-2 mb-6">
            {leaderboard.map((user, idx) => (
              <li 
                key={idx} 
                className={`text-lg p-3 rounded-lg flex items-center justify-between transition-colors duration-200 
                  ${user.finished ? 'bg-[#00a9a5]/20 font-bold text-[#00a9a5] ' : 'bg-gray-700 text-gray-300'}
                `}
              >
                <span>{user.name}</span>
                <span className="font-bold">{user.score} {user.finished ? '(Finished)' : ''}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/multiplayer')} className="w-full bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300">
            Back to Multiplayer
          </button>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-black text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-xl mt-12">
        <div className="mb-6 text-center">
          <p className="text-xl font-medium text-gray-400">
            Question <span className="font-bold text-2xl text-[#00a9a5]">{currentQuestion + 1}</span> of <span className="font-bold text-2xl text-[#00a9a5]">{quizData.questions.length}</span>
          </p>
          <h2 className="text-2xl md:text-3xl font-bold my-4 text-gray-200">{question.question}</h2>
        </div>
        <div className="space-y-3 mb-6">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ease-in-out
                ${selected === idx
                  ? 'border-[#00a9a5] bg-[#00a9a5]/20 text-[#00a9a5] font-semibold scale-105'
                  : 'border-gray-700 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-[#00a9a5]'}
                ${isAnswerSubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswerSubmitted}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
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
            disabled={selected === null}
            className={`btn px-6 py-3 rounded-full font-bold transition-colors duration-200
              ${selected === null
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#00a9a5] text-white hover:bg-[#007a77]'
              }`}
          >
            {currentQuestion < quizData.questions.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-200">Leaderboard</h3>
          <ul className="space-y-2">
            {leaderboard.map((user, idx) => (
              <li 
                key={idx} 
                className={`text-lg p-3 rounded-lg flex items-center justify-between transition-colors duration-200 
                  ${user.finished ? 'bg-[#00a9a5]/20 font-bold text-[#00a9a5]' : 'bg-gray-700 text-gray-300'}
                `}
              >
                <span>{user.name}</span>
                <span className="font-bold">{user.score} {user.finished ? '(Finished)' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerQuiz;
