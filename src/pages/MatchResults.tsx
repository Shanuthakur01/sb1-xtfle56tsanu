import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle, Heart, ArrowLeft } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useMatch } from '../context/MatchContext';
import { useMessage } from '../context/MessageContext';
import { profiles } from '../data/profiles';

const MatchResults: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { quizResults } = useQuiz();
  const { likeProfile } = useMatch();
  const { getOrCreateConversation } = useMessage();
  
  const [result, setResult] = useState(
    resultId === 'latest' 
      ? quizResults[quizResults.length - 1] 
      : quizResults.find(r => r.id === resultId)
  );
  
  // Get partner profile
  const partnerProfile = result 
    ? profiles.find(p => p.id.toString() === result.partnerId)
    : null;
  
  useEffect(() => {
    if (resultId === 'latest' && quizResults.length > 0) {
      setResult(quizResults[quizResults.length - 1]);
    } else if (resultId !== 'latest') {
      setResult(quizResults.find(r => r.id === resultId));
    }
  }, [resultId, quizResults]);
  
  const handleMessageClick = () => {
    if (!result) return;
    
    // Create or get conversation
    const conversationId = getOrCreateConversation(result.partnerId);
    navigate(`/messages/${conversationId}`);
  };
  
  const handleLikeClick = () => {
    if (!result || !partnerProfile) return;
    
    // Like profile
    likeProfile(parseInt(result.partnerId));
    navigate('/discover');
  };
  
  if (!result || !partnerProfile) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Result not found</h3>
        <button
          onClick={() => navigate('/discover')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mt-4"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white flex justify-between items-center">
          <button 
            onClick={() => navigate('/discover')}
            className="flex items-center text-white"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <h2 className="text-xl font-bold">Quiz Results</h2>
          <div></div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {result.matchPercentage}%
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full">
                {result.matchPercentage >= 70 ? (
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <Check size={16} />
                  </div>
                ) : (
                  <div className="bg-orange-500 text-white p-1 rounded-full">
                    <X size={16} />
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-1">
              {result.matchPercentage >= 70 
                ? "It's a Match!" 
                : "Not quite a match, but still compatible!"}
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {result.matchPercentage >= 70 
                ? `You and ${partnerProfile.name} have a high compatibility score! You matched on ${result.matchPercentage}% of questions.` 
                : `You and ${partnerProfile.name} have some differences, but that's okay! You still matched on ${result.matchPercentage}% of questions.`}
            </p>
          </div>
          
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
          
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg">Your Answers</h4>
            <div className="space-y-4">
              {result.userAnswers.map((userAnswer, index) => {
                const question = result?.activeQuiz?.questions.find(q => q.id === userAnswer.questionId);
                const partnerAnswer = result.partnerAnswers.find(a => a.questionId === userAnswer.questionId);
                const isMatch = partnerAnswer && partnerAnswer.answer === userAnswer.answer;
                
                return (
                  <div key={userAnswer.questionId} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium mb-2">Question {index + 1}</p>
                        <p className="text-gray-700 mb-2">{question?.question}</p>
                      </div>
                      {isMatch ? (
                        <div className="bg-green-100 text-green-700 p-1 rounded-full">
                          <Check size={16} />
                        </div>
                      ) : (
                        <div className="bg-orange-100 text-orange-700 p-1 rounded-full">
                          <X size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Your Answer:</p>
                        <p className="text-sm bg-purple-100 text-purple-700 p-2 rounded">{userAnswer.answer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{partnerProfile.name}'s Answer:</p>
                        <p className="text-sm bg-pink-100 text-pink-700 p-2 rounded">{partnerAnswer?.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleMessageClick}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <MessageCircle size={20} className="mr-2" />
              Message {partnerProfile.name}
            </button>
            <button
              onClick={handleLikeClick}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <Heart size={20} className="mr-2" />
              Like Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchResults;