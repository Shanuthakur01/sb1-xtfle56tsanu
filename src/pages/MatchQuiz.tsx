import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { profiles } from '../data/profiles';

const MatchQuiz: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { 
    activeQuiz, 
    startQuiz, 
    answerQuestion, 
    completeQuiz, 
    cancelQuiz,
    timeRemaining
  } = useQuiz();
  
  // Get partner profile
  const partnerProfile = profiles.find(p => p.id.toString() === partnerId);
  
  // Start quiz if not already started
  useEffect(() => {
    if (!activeQuiz && partnerId) {
      startQuiz(partnerId);
    }
  }, [activeQuiz, partnerId, startQuiz]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle quiz completion
  const handleComplete = () => {
    completeQuiz();
    // Navigate to results page
    navigate('/results/latest');
  };
  
  // Handle quiz cancellation
  const handleCancel = () => {
    cancelQuiz();
    navigate('/discover');
  };
  
  if (!partnerProfile) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile not found</h3>
        <button
          onClick={() => navigate('/discover')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mt-4"
        >
          Back to Discover
        </button>
      </div>
    );
  }
  
  if (!activeQuiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white flex justify-between items-center">
          <button 
            onClick={handleCancel}
            className="flex items-center text-white"
          >
            <ArrowLeft size={20} className="mr-1" />
            Cancel
          </button>
          <h2 className="text-xl font-bold">Compatibility Quiz</h2>
          <div className="flex items-center">
            <Clock size={20} className="mr-1" />
            <span className={`font-mono ${timeRemaining < 30 ? 'text-red-300 animate-pulse' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            <img 
              src={partnerProfile.image} 
              alt={partnerProfile.name} 
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
              <h3 className="font-semibold text-lg">{partnerProfile.name}, {partnerProfile.age}</h3>
              <p className="text-gray-600 text-sm">{partnerProfile.college}</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Answer these questions to see how compatible you are with {partnerProfile.name}. 
            You have 3 minutes to complete the quiz.
          </p>
          
          <div className="space-y-8">
            {activeQuiz.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                <h4 className="font-semibold mb-3">
                  {index + 1}. {question.question}
                </h4>
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = activeQuiz.answers.some(
                      a => a.questionId === question.id && a.answer === option
                    );
                    
                    return (
                      <button
                        key={option}
                        className={`w-full text-left p-3 rounded-lg border ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => answerQuestion(question.id, option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              disabled={activeQuiz.answers.length < activeQuiz.questions.length}
            >
              Complete Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchQuiz;