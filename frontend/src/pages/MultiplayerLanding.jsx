import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';

const MultiplayerLanding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(null); // 'create' or 'join'
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [username, setUsername] = useState('');
  const [showShare, setShowShare] = useState(false);

  // Host: Generate quiz and create room
  const handleCreateRoom = async (e) => {
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
      const quizData = response.data;
      // Emit create-room with quizData
      socket.emit('create-room', { quizData });
      socket.once('room-created', ({ roomId }) => {
        setRoomCode(roomId);
        setShowShare(true);
        // Don't navigate yet; let user copy/share code first
        // navigate(`/room/${roomId}`, { state: { isHost: true, quizData } });
        // Save quizData for navigation
        window._mpQuizData = quizData;
      });
    } catch (err) {
      setError('Failed to generate quiz or create room.');
    } finally {
      setLoading(false);
    }
  };

  // After sharing, go to waiting room
  const handleGoToRoom = () => {
    if (roomCode && window._mpQuizData) {
      navigate(`/room/${roomCode}`, { state: { isHost: true, quizData: window._mpQuizData } });
    }
  };

  // Join as participant
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    socket.emit('join-room', { roomId: joinCode.trim(), username: username.trim() });
    socket.once('user-joined', ({ roomId, quizData }) => {
      navigate(`/room/${roomId}`, { state: { isHost: false, quizData, username: username.trim() } });
    });
    socket.once('error', ({ message }) => {
      setError(message || 'Failed to join room.');
      setLoading(false);
    });
  };

  // Copy helpers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Multiplayer Quiz</h1>
        {!step && (
          <div className="flex flex-col space-y-4">
            <button
              className="btn btn-primary w-full py-4 text-lg"
              onClick={() => setStep('create')}
            >
              Create Quiz Room
            </button>
            <button
              className="btn btn-secondary w-full py-4 text-lg"
              onClick={() => setStep('join')}
            >
              Join Quiz Room
            </button>
          </div>
        )}
        {step === 'create' && !showShare && (
          <form onSubmit={handleCreateRoom} className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Create Quiz Room</h2>
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="block w-full" />
            <div className="flex space-x-2">
              <select value={level} onChange={e => setLevel(e.target.value)} className="border rounded px-2 py-1">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input type="number" min={1} max={20} value={numQuestions} onChange={e => setNumQuestions(e.target.value)} className="border rounded px-2 py-1 w-20" />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Quiz Room'}</button>
              <button type="button" className="btn btn-secondary w-full" onClick={() => setStep(null)}>Back</button>
            </div>
          </form>
        )}
        {step === 'create' && showShare && (
          <div className="mt-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Room Created!</h2>
            <div className="mb-2 text-yellow-700 text-sm font-medium">⚠️ Do not refresh or close the backend server, or the room will be lost. If all users leave, the room will be deleted.</div>
            <div className="mb-2">Share this code or link with friends:</div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">{roomCode}</span>
              <button onClick={handleCopyCode} className="btn btn-secondary px-2 py-1 text-sm">Copy Code</button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">{`${window.location.origin}/room/${roomCode}`}</span>
              <button onClick={handleCopyLink} className="btn btn-secondary px-2 py-1 text-sm">Copy Link</button>
            </div>
            <button onClick={handleGoToRoom} className="btn btn-primary w-full">Go to Waiting Room</button>
          </div>
        )}
        {step === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Join Quiz Room</h2>
            <input type="text" placeholder="Enter Room Code" value={joinCode} onChange={e => { setJoinCode(e.target.value); setError(''); }} className="border rounded px-2 py-1 w-full" />
            <input type="text" placeholder="Your Name" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} className="border rounded px-2 py-1 w-full" />
            <div className="flex space-x-2">
              <button type="submit" className="btn btn-secondary w-full" disabled={loading}>{loading ? 'Joining...' : 'Join Room'}</button>
              <button type="button" className="btn btn-secondary w-full" onClick={() => { setStep(null); setError(''); }}>Back</button>
            </div>
            {error && <div className="text-red-500 text-center mt-2">{error === 'Room not found.' ? 'Room not found. Please check the code or ask the host to create a new room.' : error}</div>}
          </form>
        )}
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default MultiplayerLanding; 