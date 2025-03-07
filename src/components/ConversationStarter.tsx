import React, { useState } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';

interface ConversationStarterProps {
  onSelectTopic?: (topic: string) => void;
}

const ConversationStarter: React.FC<ConversationStarterProps> = ({ onSelectTopic }) => {
  const topics = [
    "What's your favorite spot in college?",
    "What do you love doing in your free time?",
    "Do you like reading books or watching movies? Any favorites?",
    "Do you enjoy traveling? Which place is on your bucket list?",
    "What was your favorite childhood game?",
    "Did you have any funny childhood nicknames?",
    "What is the most memorable moment from your school days?",
    "Do you like cooking, or do you prefer eating out?",
    "What's your favorite cuisine or dish?",
    "Coffee or tea – what's your go-to drink?",
    "If you could have any job in the world, what would it be?",
    "Do you believe in destiny or making your own path?",
    "What's one dream you are working towards right now?",
    "What kind of music do you listen to? Any favorite artists?",
    "Do you like romantic movies or thrillers?",
    "If you could act in any movie, which one would it be?",
    "If you had a superpower, what would it be?",
    "What's the weirdest food combination you've ever tried?",
    "If we were in a zombie apocalypse, what would be your survival plan?"
  ];

  const [currentTopic, setCurrentTopic] = useState(topics[Math.floor(Math.random() * topics.length)]);

  const getRandomTopic = () => {
    let newTopic;
    do {
      newTopic = topics[Math.floor(Math.random() * topics.length)];
    } while (newTopic === currentTopic);
    setCurrentTopic(newTopic);
  };

  const handleUseTopic = () => {
    if (onSelectTopic) {
      onSelectTopic(currentTopic);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-3">
        <MessageCircle className="text-purple-600 mr-2" size={20} />
        <h3 className="font-semibold text-purple-800">Conversation Starter</h3>
      </div>
      <p className="text-gray-700 mb-3 italic">"{currentTopic}"</p>
      <div className="flex justify-between">
        <button 
          onClick={getRandomTopic}
          className="flex items-center text-sm text-purple-600 hover:text-purple-800"
        >
          <RefreshCw size={16} className="mr-1" />
          Get another topic
        </button>
        
        {onSelectTopic && (
          <button 
            onClick={handleUseTopic}
            className="text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700"
          >
            Use this topic
          </button>
        )}
      </div>
    </div>
  );
};

export default ConversationStarter;