import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import random_page from './pages/random';
import Quiz from './pages/Quiz';
import SavedQuizzes from './pages/SavedQuizzes';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center w-screen ">
        <Navbar />
        <main className="flex-1 w-full flex items-center justify-center px-6 py-8">
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
            </div> */}
              <Routes>
                <Route path="/" element={<Home />} />
                {/* <Route path="/" element={<random_page />} /> */}
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/saved-quizzes" element={<SavedQuizzes />} />
              </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
