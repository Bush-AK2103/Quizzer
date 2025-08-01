import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import random_page from './pages/random';
import Quiz from './pages/Quiz';
import SavedQuizzes from './pages/SavedQuizzes';
import Navbar from './components/Navbar';
import MultiplayerLanding from './pages/MultiplayerLanding';
import WaitingRoom from './pages/WaitingRoom';
import MultiplayerQuiz from './pages/MultiplayerQuiz';
import Desc from './pages/Desc';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black flex flex-col  w-screen ">
        <Navbar />
        <main className="flex-1 w-screen flex items-center justify-center ">
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
            </div> */}
              <Routes>
                <Route path="/" element={<Desc />} />
                <Route path="/home" element={<Home />} />
                {/* <Route path="/" element={<random_page />} /> */}
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/saved-quizzes" element={<SavedQuizzes />} />
                <Route path="/multiplayer" element={<MultiplayerLanding />} />
                <Route path="/room/:roomId" element={<WaitingRoom />} />
                <Route path="/multiplayer-quiz/:roomId" element={<MultiplayerQuiz />} />
              </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
