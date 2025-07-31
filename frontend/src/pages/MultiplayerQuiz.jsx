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
    setSelected(optionIdx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    socket.emit('submit-answer', {
      roomId,
      questionIndex: currentQuestion,
      answer: selected,
    });
    setSelected(null);
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!quizData) return <div className="text-center">Loading...</div>;

  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          {myResult && (
            <div className="mb-4 text-lg text-green-700 font-semibold">
              Your Score: {myResult.score} / {myResult.total}
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
          <ul className="mb-4">
            {leaderboard.map((user, idx) => (
              <li key={idx} className={`mb-1 ${user.finished ? 'text-green-700 font-bold' : ''}`}>
                {user.name}: {user.score} {user.finished ? '(Finished)' : ''}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/multiplayer')} className="btn btn-primary">Back to Multiplayer</button>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Question {currentQuestion + 1} / {quizData.questions.length}</h2>
        <div className="mb-4 font-semibold">{question.question}</div>
        <div className="space-y-2 mb-6">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className={`w-full px-4 py-2 rounded border ${selected === idx ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          className="btn btn-primary w-full"
          disabled={selected === null}
        >
          {currentQuestion < quizData.questions.length - 1 ? 'Next' : 'Finish'}
        </button>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Leaderboard</h3>
          <ul>
            {leaderboard.map((user, idx) => (
              <li key={idx} className={user.finished ? 'text-green-700 font-bold' : ''}>
                {user.name}: {user.score} {user.finished ? '(Finished)' : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerQuiz; 