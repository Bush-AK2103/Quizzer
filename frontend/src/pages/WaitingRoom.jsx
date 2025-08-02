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

  // SVG for the Copy icon
  const copyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );

  useEffect(() => {
    console.log('WaitingRoom mounted:', { roomId, isHost, username });
    
    // Clear any existing listeners
    socket.off('user-joined');
    socket.off('user-list');
    socket.off('quiz-start');
    socket.off('error');
    
    // Join room only if not host and a username is provided
    if (!isHost && username) {
      console.log('Joining room as participant:', { roomId, username });
      socket.emit('join-room', { roomId, username });
    }
    
    // Set up listeners for socket events
    socket.on('user-joined', ({ users }) => {
      console.log('User joined event received:', users);
      setUsers(users);
    });
    
    socket.on('user-list', ({ users }) => {
      console.log('User list received:', users);
      setUsers(users);
    });
    
    socket.on('quiz-start', ({ quizData }) => {
      console.log('Quiz starting with data:', quizData);
      localStorage.setItem(`mp_quizData_${roomId}`, JSON.stringify(quizData));
      navigate(`/multiplayer-quiz/${roomId}`, { state: { quizData, isHost, username } });
    });
    
    socket.on('error', ({ message }) => {
      console.log('Error received:', message);
      setError(message || 'An error occurred.');
    });

    // Request user list on component mount
    socket.emit('get-user-list', { roomId });

    // Clean up listeners on component unmount
    return () => {
      socket.off('user-joined');
      socket.off('user-list');
      socket.off('quiz-start');
      socket.off('error');
    };
  }, [roomId, isHost, navigate, username]); // Dependency array to re-run on changes

  const handleStartQuiz = () => {
    if (isHost) {
      socket.emit('start-quiz', { roomId, quizData });
    }
  };

  const copyTextToClipboard = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; 
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      console.error('Failed to copy text', err);
      return false;
    }
  };

  const handleCopyCode = () => {
    if (copyTextToClipboard(roomId)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      alert('Failed to copy code. Please copy manually.'); 
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    if (copyTextToClipboard(link)) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } else {
      alert('Failed to copy link. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-[#00a9a5]/50 transition-shadow duration-300">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#00a9a5] drop-shadow-lg">
          Waiting Room
        </h1>
        {error ? (
          <div className="bg-red-900 p-4 rounded-lg text-red-300 font-medium">
            {error}
            <button 
              onClick={() => navigate('/multiplayer')} 
              className="block w-full mt-4 btn bg-red-700 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition-colors duration-300"
            >
              Back to Multiplayer
            </button>
          </div>
        ) : (
          <p className="text-xl md:text-2xl font-light text-gray-300">
            Waiting for the host to start the quiz...
          </p>
        )}
        {!error && (
          <>
            <div className="bg-gray-700 p-4 rounded-xl flex flex-col space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-4">
                <span className="font-semibold text-gray-400">Room Code:</span>
                <span className="text-lg font-mono bg-gray-600 px-4 py-2 rounded-full text-white">{roomId}</span>
                <button onClick={handleCopyCode} className="btn bg-[#00a9a5] text-white px-4 py-2 rounded-full text-sm hover:bg-[#007a77] transition-colors duration-300 flex items-center space-x-2">
                  {copyIcon}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-4">
                <span className="font-semibold text-gray-400">Invite Link:</span>
                {/* Added a responsive break to prevent overflow on smaller screens */}
                <span className="text-sm text-gray-400 break-all">{`${window.location.origin}/room/${roomId}`}</span>
                <button onClick={handleCopyLink} className="btn bg-[#00a9a5] text-white px-4 py-2 rounded-full text-sm hover:bg-[#007a77] transition-colors duration-300 flex items-center space-x-2">
                  {copyIcon}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
            
            {username && (
              <div className="p-4 bg-[#00a9a5]/20 text-[#00a9a5] rounded-xl font-semibold">
                You have joined as: {username}
              </div>
            )}

            <div className="w-full text-left">
              <h2 className="text-2xl font-bold mb-4 text-gray-200">Players ({users.length}):</h2>
              <ul className="space-y-2">
                {users.map((user, idx) => (
                  <li key={idx} className="bg-gray-700 p-3 rounded-lg text-lg text-gray-300 font-medium">
                    {user}
                  </li>
                ))}
              </ul>
            </div>
            
            {isHost && (
              <button onClick={handleStartQuiz} className="w-full btn bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300">
                Start Quiz
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
