import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../socket';

const WaitingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isHost = location.state?.isHost;
  const quizData = location.state?.quizData;
  const username = location.state?.username;
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Join room if not already joined
    if (!isHost) {
      socket.emit('join-room', { roomId, username });
    }
    // Listen for user list updates
    socket.on('user-joined', ({ users }) => {
      setUsers(users);
    });
    socket.on('user-list', ({ users }) => {
      setUsers(users);
    });
    socket.on('quiz-start', ({ quizData }) => {
      localStorage.setItem(`mp_quizData_${roomId}`, JSON.stringify(quizData));
      navigate(`/multiplayer-quiz/${roomId}`, { state: { quizData, isHost, username } });
    });
    socket.on('error', ({ message }) => {
      setError(message || 'An error occurred.');
    });
    // Request user list
    socket.emit('get-user-list', { roomId });
    return () => {
      socket.off('user-joined');
      socket.off('user-list');
      socket.off('quiz-start');
      socket.off('error');
    };
  }, [roomId, isHost, navigate, username]);

  const handleStartQuiz = () => {
    if (isHost) {
      socket.emit('start-quiz', { roomId, quizData });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Waiting Room</h1>
        <div className="mb-4 text-center">
          <span className="font-semibold">Room Code:</span>
          <span className="text-lg font-mono ml-2 bg-gray-100 px-3 py-1 rounded">{roomId}</span>
          <button onClick={handleCopyCode} className="btn btn-secondary ml-2 px-2 py-1 text-sm">{copied ? 'Copied!' : 'Copy Code'}</button>
        </div>
        <div className="mb-2 text-center">
          <span className="text-sm text-gray-600">{`${window.location.origin}/room/${roomId}`}</span>
          <button onClick={handleCopyLink} className="btn btn-secondary ml-2 px-2 py-1 text-sm">{copiedLink ? 'Copied!' : 'Copy Link'}</button>
        </div>
        {username && (
          <div className="mb-2 text-center text-blue-600">You joined as: <span className="font-semibold">{username}</span></div>
        )}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Players:</h2>
          <ul className="list-disc pl-6">
            {users.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
        </div>
        {isHost && (
          <button onClick={handleStartQuiz} className="btn btn-primary w-full mb-2">Start Quiz</button>
        )}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default WaitingRoom; 