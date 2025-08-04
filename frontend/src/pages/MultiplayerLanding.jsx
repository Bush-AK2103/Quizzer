import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';

const MultiplayerLanding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(null);
  const [file, setFile] = useState(null);
  const [promptText, setPromptText] = useState('');
  const [mode, setMode] = useState('pdf'); // 'pdf' or 'prompt'
  const [level, setLevel] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [username, setUsername] = useState('');
  const [showShare, setShowShare] = useState(false);

  const addIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );

  const logInIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (mode === 'pdf' && !file) {
      setError('Please upload a PDF file');
      return;
    }
    if (mode === 'prompt' && !promptText.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      await axios.get(`${BASE_URL}/api/health`);

      let quizData;

      if (mode === 'pdf') {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('level', level);
        formData.append('numQuestions', numQuestions);

        const response = await axios.post(`${BASE_URL}/api/generate-quiz`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        quizData = response.data;
      } else {
        const response = await axios.post(`${BASE_URL}/api/generate-quiz-from-prompt`, {
          promptText,
          level,
          numQuestions,
        });
        quizData = response.data;
      }

      socket.emit('create-room', { quizData });
      socket.once('room-created', ({ roomId }) => {
        setRoomCode(roomId);
        setShowShare(true);
        window._mpQuizData = quizData;
      });
    } catch (err) {
      setError('Failed to generate quiz or create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRoom = () => {
    if (roomCode && window._mpQuizData) {
      navigate(`/room/${roomCode}`, { state: { isHost: true, quizData: window._mpQuizData } });
    } else {
      setError('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const roomId = joinCode.trim();
    const userName = username.trim();

    if (!joinCode.trim() || !username.trim()) return;
    if (loading) return;

    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Failed to join room. Please try again.');
    }, 5000);

    socket.emit('join-room', { roomId, username: userName });
    navigate(`/room/${roomId}`, { state: { username: userName } });

    socket.off('user-joined');
    socket.off('error');

    socket.on('error', (errorMessage) => {
      clearTimeout(timeoutId);
      setLoading(false);
      setError(errorMessage);
    });
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
    if (copyTextToClipboard(roomCode)) {
    } else {
      alert('Failed to copy code. Please copy manually.');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomCode}`;
    if (copyTextToClipboard(link)) {
    } else {
      alert('Failed to copy link. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-[#00a9a5]/50 transition-shadow duration-300">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#00a9a5] drop-shadow-lg">
          Multiplayer Quiz
        </h1>
        {error && (
          <div className="bg-red-900 p-4 rounded-lg text-red-300 font-medium">
            {error === 'Room not found.' ? 'Room not found. Please check the code or ask the host to create a new room.' : error}
          </div>
        )}
        {!step && (
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <button
              className="w-full btn bg-[#00a9a5] text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300 transform hover:scale-105"
              onClick={() => setStep('create')}
            >
              <div className="flex items-center justify-center space-x-2">
                {addIcon}
                <span>Create Quiz Room</span>
              </div>
            </button>
            <button
              className="w-full btn bg-gray-700 text-gray-300 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-300 transform hover:scale-105"
              onClick={() => setStep('join')}
            >
              <div className="flex items-center justify-center space-x-2">
                {logInIcon}
                <span>Join Quiz Room</span>
              </div>
            </button>
          </div>
        )}

        {/* Create Quiz Room */}
        {step === 'create' && !showShare && (
          <form onSubmit={handleCreateRoom} className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-200">Create Quiz Room</h2>

            {/* Toggle Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className={`px-6 py-2 rounded-full font-semibold shadow-md ${
                  mode === 'pdf' ? 'bg-[#00a9a5] text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setMode('pdf')}
              >
                Upload PDF
              </button>
              <button
                type="button"
                className={`px-6 py-2 rounded-full font-semibold shadow-md ${
                  mode === 'prompt' ? 'bg-[#00a9a5] text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setMode('prompt')}
              >
                Enter Prompt
              </button>
            </div>

            {/* Conditional Input */}
            {mode === 'pdf' ? (
              <label className="block w-full">
                <span className="sr-only">Choose a PDF file</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
              </label>
            ) : (
              <textarea
                placeholder="Type your quiz topic or text here..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={5}
                required
                className="w-full bg-gray-700 text-white rounded-xl py-3 px-6 placeholder-gray-400 focus:ring-2 focus:ring-[#00a9a5]"
              />
            )}

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-full py-3 px-6 border-none focus:ring-2 focus:ring-[#00a9a5]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-full py-3 px-6 border-none focus:ring-2 focus:ring-[#00a9a5]"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 btn bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Quiz Room'}
              </button>
              <button
                type="button"
                className="flex-1 btn bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-300"
                onClick={() => setStep(null)}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* After Room Creation */}
        {step === 'create' && showShare && (
          <div className="mt-6 flex flex-col items-center text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-200">Room Created!</h2>
            <div className="text-yellow-400 text-sm font-medium p-3 bg-yellow-900 rounded-lg">⚠️ Do not refresh, or the room will be lost. If all users leave, the room will be deleted.</div>
            <p className="text-gray-300">Share this code or link with friends:</p>
            <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-full w-full max-w-sm mx-auto">
              <span className="font-mono text-lg text-white flex-1 truncate">{roomCode}</span>
              <button onClick={handleCopyCode} className="btn bg-[#00a9a5] text-white px-4 py-1 rounded-full text-sm hover:bg-[#007a77]">Copy Code</button>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-full w-full max-w-sm mx-auto">
              <span className="text-sm text-gray-400 flex-1 truncate">{`${window.location.origin}/room/${roomCode}`}</span>
              <button onClick={handleCopyLink} className="btn bg-[#00a9a5] text-white px-4 py-1 rounded-full text-sm hover:bg-[#007a77]">Copy Link</button>
            </div>
            <button onClick={handleGoToRoom} className="btn w-full bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300">Go to Waiting Room</button>
          </div>
        )}

        {/* Join Room */}
        {step === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-200">Join Quiz Room</h2>
            <input type="text" placeholder="Enter Room Code" value={joinCode} onChange={e => { setJoinCode(e.target.value); setError(''); }} className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-full py-3 px-6 border-none focus:ring-2 focus:ring-[#00a9a5]" />
            <input type="text" placeholder="Your Name" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-full py-3 px-6 border-none focus:ring-2 focus:ring-[#00a9a5]" />
            <div className="flex space-x-4">
              <button type="submit" className="flex-1 btn bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300" disabled={loading || !joinCode.trim() || !username.trim()}>{loading ? 'Joining...' : 'Join Room'}</button>
              <button type="button" className="flex-1 btn bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-300" onClick={() => { setStep(null); setError(''); }}>Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLanding;
