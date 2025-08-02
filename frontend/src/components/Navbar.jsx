import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // SVG for the Hamburger menu icon
  const menuIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );

  // SVG for the Close menu icon
  const closeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-3xl font-extrabold tracking-tight text-[#00a9a5] drop-shadow-lg transition-colors duration-200">
          Quizzer
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 md:space-x-8">
          <Link 
            to="/home" 
            className="text-gray-300 hover:text-[#00a9a5] font-medium transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            to="/quiz" 
            className="text-gray-300 hover:text-[#00a9a5] font-medium transition-colors duration-200"
          >
            Quiz
          </Link>
          <Link 
            to="/saved-quizzes" 
            className="text-gray-300 hover:text-[#00a9a5] font-medium transition-colors duration-200"
          >
            Saved Quizzes
          </Link>
          <Link 
            to="/multiplayer" 
            className="text-gray-300 hover:text-[#00a9a5] font-medium transition-colors duration-200"
          >
            Multiplayer
          </Link>
        </div>
        
        {/* Mobile menu toggle button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-300 hover:text-[#00a9a5] focus:outline-none focus:ring-2 focus:ring-[#00a9a5] rounded-full p-2 transition-colors duration-200"
        >
          {isMenuOpen ? closeIcon : menuIcon}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center space-y-8">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-300 hover:text-[#00a9a5] focus:outline-none focus:ring-2 focus:ring-[#00a9a5] rounded-full p-2 transition-colors duration-200"
          >
            {closeIcon}
          </button>
          <Link 
            to="/home" 
            onClick={() => setIsMenuOpen(false)}
            className="text-3xl font-bold text-white hover:text-[#00a9a5] transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            to="/quiz" 
            onClick={() => setIsMenuOpen(false)}
            className="text-3xl font-bold text-white hover:text-[#00a9a5] transition-colors duration-200"
          >
            Quiz
          </Link>
          <Link 
            to="/saved-quizzes" 
            onClick={() => setIsMenuOpen(false)}
            className="text-3xl font-bold text-white hover:text-[#00a9a5] transition-colors duration-200"
          >
            Saved Quizzes
          </Link>
          <Link 
            to="/multiplayer" 
            onClick={() => setIsMenuOpen(false)}
            className="text-3xl font-bold text-white hover:text-[#00a9a5] transition-colors duration-200"
          >
            Multiplayer
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
