import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200">
          Quizzer
        </Link>
        <div className="flex space-x-8 -ml-16">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            to="/quiz" 
            className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Quiz
          </Link>
          <Link 
            to="/saved-quizzes" 
            className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Saved Quizzes
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
