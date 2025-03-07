import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  createdAt: string;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => void;
  getOrCreateConversation: (participantId: string) => string;
  markConversationAsRead: (conversationId: string) => void;
  getUnreadCount: (conversationId: string) => number;
  getTotalUnreadCount: () => number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // Load conversations and messages from localStorage
  useEffect(() => {
    if (user) {
      const storedConversations = localStorage.getItem(`campusConnection_conversations_${user.id}`);
      const storedMessages = localStorage.getItem(`campusConnection_messages_${user.id}`);
      
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
      
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, [user]);

  // Save conversations and messages to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`campusConnection_conversations_${user.id}`, JSON.stringify(conversations));
      localStorage.setItem(`campusConnection_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [conversations, messages, user]);

  // Get or create a conversation with a participant
  const getOrCreateConversation = (participantId: string): string => {
    if (!user) return '';
    
    // Check if conversation already exists
    const existingConversation = conversations.find(c => 
      c.participants.includes(user.id) && 
      c.participants.includes(participantId)
    );
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const newConversationId = uuidv4();
    const newConversation: Conversation = {
      id: newConversationId,
      participants: [user.id, participantId],
      createdAt: new Date().toISOString()
    };
    
    setConversations(prev => [...prev, newConversation]);
    setMessages(prev => ({ ...prev, [newConversationId]: [] }));
    
    return newConversationId;
  };

  // Send a message
  const sendMessage = (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;
    
    // Create new message
    const newMessage: Message = {
      id: uuidv4(),
      conversationId,
      senderId: user.id,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));
    
    // Update conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: {
                content,
                timestamp: newMessage.timestamp,
                senderId: user.id
              } 
            } 
          : conv
      )
    );
  };

  // Mark all messages in a conversation as read
  const markConversationAsRead = (conversationId: string) => {
    if (!user) return;
    
    setMessages(prev => {
      const conversationMessages = prev[conversationId] || [];
      const updatedMessages = conversationMessages.map(msg => 
        msg.senderId !== user.id && !msg.read 
          ? { ...msg, read: true } 
          : msg
      );
      
      return {
        ...prev,
        [conversationId]: updatedMessages
      };
    });
  };

  // Get unread message count for a conversation
  const getUnreadCount = (conversationId: string): number => {
    if (!user) return 0;
    
    const conversationMessages = messages[conversationId] || [];
    return conversationMessages.filter(msg => msg.senderId !== user.id && !msg.read).length;
  };

  // Get total unread message count
  const getTotalUnreadCount = (): number => {
    if (!user) return 0;
    
    return Object.values(messages).reduce((total, conversationMessages) => {
      return total + conversationMessages.filter(msg => msg.senderId !== user.id && !msg.read).length;
    }, 0);
  };

  return (
    <MessageContext.Provider value={{
      conversations,
      messages,
      sendMessage,
      getOrCreateConversation,
      markConversationAsRead,
      getUnreadCount,
      getTotalUnreadCount
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};