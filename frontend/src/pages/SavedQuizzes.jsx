import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SavedQuizzes = () => {
  const navigate = useNavigate();
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  useEffect(() => {
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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary-600">
          Saved Quizzes
        </h1>

        {savedQuizzes.length === 0 ? (
          <p className="text-center text-gray-600">No saved quizzes yet.</p>
        ) : (
          <div className="grid gap-6">
            {savedQuizzes.map((quiz, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{quiz.name}</h2>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleStartQuiz(quiz.data)}
                      className="btn btn-primary"
                    >
                      Start Quiz
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(index)}
                      className="btn btn-secondary"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Level: {quiz.data.level}</p>
                  <p>Number of Questions: {quiz.data.questions.length}</p>
                  {quiz.data.score !== undefined && (
                    <p className="font-medium">
                      Score: {quiz.data.score} out of {quiz.data.totalQuestions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedQuizzes; 