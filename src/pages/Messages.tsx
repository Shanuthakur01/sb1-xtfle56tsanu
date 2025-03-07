import React, { useState, useRef, useEffect } from 'react';
import { User, Send, Smile, Paperclip, Image, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ConversationStarter from '../components/ConversationStarter';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { profiles } from '../data/profiles';
import { format } from 'date-fns';

const Messages: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    sendMessage, 
    markConversationAsRead,
    getUnreadCount
  } = useMessage();
  
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mark conversation as read when viewing
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, markConversationAsRead, messages]);
  
  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, conversationId]);
  
  // Get conversation partner
  const getConversationPartner = (conversation: any) => {
    if (!user) return null;
    
    const partnerId = conversation.participants.find((id: string) => id !== user.id);
    
    // Check if partner is a profile from our data
    const profile = profiles.find(p => p.id.toString() === partnerId);
    if (profile) {
      return {
        id: profile.id.toString(),
        name: profile.name,
        avatar: profile.image
      };
    }
    
    // If not found in profiles, it might be a user
    return {
      id: partnerId,
      name: 'User',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
    };
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    }
    
    // Otherwise show full date
    return format(date, 'MMM d, yyyy');
  };
  
  const handleSendMessage = () => {
    if (messageInput.trim() && conversationId) {
      // Send message
      sendMessage(conversationId, messageInput);
      
      // Clear input
      setMessageInput('');
      
      // Show typing indicator
      setTimeout(() => {
        setIsTyping(true);
      }, 500);
      
      // Simulate response after 1-3 seconds
      const responseTime = Math.floor(Math.random() * 2000) + 1000;
      setTimeout(() => {
        setIsTyping(false);
        
        const responses = [
          "That's interesting! Tell me more.",
          "I agree with you on that!",
          "Sounds good to me!",
          "I've been thinking about that too.",
          "That's a great point!",
          "I'd love to discuss that further.",
          "What else have you been up to?",
          "Have you been to any good events lately?",
          "Do you have any recommendations for good places to study?",
          "What are your plans for the weekend?"
        ];
        
        const responseMessage = responses[Math.floor(Math.random() * responses.length)];
        sendMessage(conversationId, responseMessage);
      }, responseTime);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleUseConversationStarter = (topic: string) => {
    if (conversationId) {
      setMessageInput(topic);
    }
  };
  
  // Get current conversation
  const currentConversation = conversationId 
    ? conversations.find(c => c.id === conversationId)
    : null;
  
  // Get conversation partner
  const conversationPartner = currentConversation 
    ? getConversationPartner(currentConversation)
    : null;
  
  // Get conversation messages
  const conversationMessages = conversationId 
    ? messages[conversationId] || []
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Messages</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[70vh]">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {conversations.map(conversation => {
              const partner = getConversationPartner(conversation);
              const unreadCount = getUnreadCount(conversation.id);
              const lastMessage = conversation.lastMessage;
              
              return (
                <div 
                  key={conversation.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors ${conversationId === conversation.id ? 'bg-purple-50' : ''}`}
                  onClick={() => navigate(`/messages/${conversation.id}`)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={partner?.avatar} 
                        alt={partner?.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-purple-600 rounded-full"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{partner?.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {conversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations yet.</p>
                <p className="mt-2 text-sm">Start chatting with someone from the Discover page!</p>
              </div>
            )}
          </div>
          
          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {conversationId && conversationPartner ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button 
                    className="mr-2 md:hidden"
                    onClick={() => navigate('/messages')}
                  >
                    <ArrowLeft size={20} className="text-gray-500" />
                  </button>
                  <img 
                    src={conversationPartner.avatar} 
                    alt={conversationPartner.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <h3 className="ml-3 font-semibold">
                    {conversationPartner.name}
                  </h3>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  <div className="flex flex-col space-y-3">
                    {conversationMessages.map(message => (
                      <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : ''}`}>
                        <div className={`rounded-lg p-3 max-w-[80%] ${
                          message.senderId === user?.id ? 'bg-purple-100' : 'bg-white border border-gray-200'
                        }`}>
                          <p className="text-gray-800">{message.content}</p>
                          <span className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="flex space-x-2 mr-2">
                      <button className="text-gray-500 hover:text-purple-600" title="Add emoji">
                        <Smile size={20} />
                      </button>
                      <button className="text-gray-500 hover:text-purple-600" title="Attach file">
                        <Paperclip size={20} />
                      </button>
                      <button className="text-gray-500 hover:text-purple-600" title="Send image">
                        <Image size={20} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      className="bg-purple-600 text-white p-3 rounded-r-lg hover:bg-purple-700"
                      onClick={handleSendMessage}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-8 bg-purple-50 rounded-lg p-4">
                    <ConversationStarter onSelectTopic={handleUseConversationStarter} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <User size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">Select a conversation to start chatting</p>
                {conversations.length === 0 && (
                  <button
                    onClick={() => navigate('/discover')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Find people to chat with
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;