import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SavedQuizzes = () => {
  const navigate = useNavigate();
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  // SVG for the Play button
  const playIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );

  // SVG for the Trash button
  const trashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );

  useEffect(() => {
    // Correctly parse the JSON data from localStorage
    const quizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    setSavedQuizzes(quizzes);
  }, []);

  const handleStartQuiz = (quizData) => {
    localStorage.setItem('quizData', JSON.stringify(quizData));
    navigate('/quiz');
  };

  const handleDeleteQuiz = (index) => {
    const updatedQuizzes = savedQuizzes.filter((_, i) => i !== index);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-black text-white">
      <div className="max-w-4xl mx-auto w-full text-center space-y-8 mt-12">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#00a9a5] drop-shadow-lg">
          Saved Quizzes
        </h1>
        <p className="text-xl md:text-2xl font-light text-gray-300">
          Review and practice your quizzes at your own pace.
        </p>

        <div className="w-full space-y-4 pt-8">
          {savedQuizzes.length === 0 ? (
            <div className="bg-gray-800 p-12 rounded-2xl shadow-xl text-center">
              <p className="text-2xl font-semibold text-gray-400">No saved quizzes found.</p>
              <p className="text-lg text-gray-500 mt-2">Generate a new quiz to save it here!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {savedQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between transition-shadow duration-300 ease-in-out hover:shadow-[#00a9a5]/50 transform hover:scale-105"
                >
                  <div className="text-left mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold mb-1">{quiz.name}</h2>
                    <div className="text-gray-400 text-md space-y-1">
                      <p>Level: {quiz.data.level}</p>
                      <p>Number of Questions: {quiz.data.questions.length}</p>
                      {quiz.data.score !== undefined && (
                        <p className="font-medium text-[#00a9a5]">
                          Score: {quiz.data.score} out of {quiz.data.totalQuestions}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStartQuiz(quiz.data)}
                      className="p-3 bg-[#00a9a5] text-white rounded-full shadow-lg hover:bg-[#007a77] transition-colors duration-300"
                      aria-label={`Start quiz: ${quiz.name}`}
                    >
                      {playIcon}
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(index)}
                      className="p-3 bg-black text-white rounded-full shadow-lg hover:bg-red-700 transition-colors duration-300"
                      aria-label={`Delete quiz: ${quiz.name}`}
                    >
                      {trashIcon}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedQuizzes;
