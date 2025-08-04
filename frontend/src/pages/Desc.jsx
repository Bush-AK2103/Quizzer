import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handleExploreClick = () => {
    navigate('/home');
  };

  const bookOpenIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  const usersIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const lightbulbIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.5.5 2.8 1.5 3.8.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
      {/* Main container for the desc page content */}
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Main heading of the app */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#00a9a5] drop-shadow-lg">
            Quizzer
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-300">
            Create, Share, and Master Quizzes from Your PDFs
          </p>
        </div>
        {/* Call to action button */}
        <button
          onClick={handleExploreClick}
          className="bg-[#00a9a5] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#00a9a5]/50"
        >
          Create Your Quiz
        </button>
        {/* Section describing the core features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1: Instant Quizzes */}
          <div onClick={() => navigate('/home')} className="bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-[#00a9a5]/50 transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
            <div className="flex justify-center mb-4 text-[#00a9a5]">
              {bookOpenIcon}
            </div>
            <h3 className="text-2xl font-bold mb-2">Instant Quizzes</h3>
            <p className="text-gray-400">
              Upload a PDF and instantly generate a quiz. Solve it immediately or save it for later.
            </p>
          </div>

          {/* Feature Card 2: Multiplayer Fun */}
          <div onClick={() => navigate('/multiplayer')} className="bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-[#00a9a5]/50 transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
            <div className="flex justify-center mb-4 text-[#00a9a5]">
              {usersIcon}
            </div>
            <h3 className="text-2xl font-bold mb-2">Multiplayer Mode</h3>
            <p className="text-gray-400">
              Host a quiz and share a link with friends. Compete and see who tops the leaderboard!
            </p>
          </div>

          {/* Feature Card 3: Performance Tracking */}
          <div onClick={() => navigate('/saved-quizzes')} className="bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-[#00a9a5]/50 transition-shadow duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
            <div className="flex justify-center mb-4 text-[#00a9a5]">
              {lightbulbIcon}
            </div>
            <h3 className="text-2xl font-bold mb-2">Track Your Progress</h3>
            <p className="text-gray-400">
              Review your saved quizzes and check your scores to monitor your learning journey.
            </p>
          </div>
        </div>

        {/* Call to action button */}
        
      </div>
    </div>
  );
};

export default Home;
