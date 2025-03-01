
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, ChatContextType } from '@/types/chat';

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize with a demo conversation or load from storage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const savedCurrentId = localStorage.getItem('currentConversationId');
    
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      // Convert string timestamps back to Date objects
      const conversationsWithDates = parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      
      setConversations(conversationsWithDates);
      
      if (savedCurrentId) {
        const current = conversationsWithDates.find((c: Conversation) => c.id === savedCurrentId);
        if (current) {
          setCurrentConversation(current);
        }
      }
    } else {
      // Create a default conversation
      newConversation();
    }
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
    if (currentConversation) {
      localStorage.setItem('currentConversationId', currentConversation.id);
    }
  }, [conversations, currentConversation]);

  // Create a new conversation
  const newConversation = () => {
    const conversation: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations(prev => [conversation, ...prev]);
    setCurrentConversation(conversation);
  };

  // Delete a conversation
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    if (currentConversation?.id === id) {
      if (conversations.length > 1) {
        // Set the first remaining conversation as current
        const remainingConvs = conversations.filter(conv => conv.id !== id);
        setCurrentConversation(remainingConvs[0]);
      } else {
        // If no conversations remain, create a new one
        newConversation();
      }
    }
  };

  // Add a message to the current conversation
  const addMessage = async (content: string, role: 'user' | 'assistant' | 'system') => {
    if (!currentConversation) return;
    
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    
    // Create updated conversation
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      updatedAt: new Date()
    };
    
    // Update title if this is the first user message
    let finalConversation = updatedConversation;
    if (role === 'user' && currentConversation.messages.length === 0) {
      // Use the first ~20 characters of the message as the title
      const newTitle = content.substring(0, 20) + (content.length > 20 ? '...' : '');
      finalConversation = {
        ...updatedConversation,
        title: newTitle
      };
    }
    
    // Update the current conversation
    setCurrentConversation(finalConversation);
    
    // Update the conversations array
    setConversations(prev => 
      prev.map(conv => (conv.id === currentConversation.id ? finalConversation : conv))
    );
    
    // If it's a user message, generate a response
    if (role === 'user') {
      setIsLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulated response for demo (would normally come from API)
        let aiResponse = "I'm a virtual assistant ready to help with any questions or tasks. What else would you like to know?";
        
        // Create more contextual responses based on user input
        if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
          aiResponse = "Hello! How can I assist you today?";
        } else if (content.toLowerCase().includes('help')) {
          aiResponse = "I'd be happy to help. Could you provide more details about what you need assistance with?";
        } else if (content.toLowerCase().includes('thank')) {
          aiResponse = "You're welcome! Is there anything else I can help you with?";
        } else if (content.toLowerCase().includes('weather')) {
          aiResponse = "I don't have real-time access to weather data, but I can help you understand weather patterns or direct you to reliable weather services.";
        } else if (content.includes('?')) {
          aiResponse = "That's an interesting question. While I don't have access to real-time information, I can provide general guidance on this topic.";
        }
        
        // Add the AI response
        const aiMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        
        const conversationWithResponse = {
          ...finalConversation,
          messages: [...finalConversation.messages, aiMessage],
          updatedAt: new Date()
        };
        
        setCurrentConversation(conversationWithResponse);
        setConversations(prev => 
          prev.map(conv => (conv.id === currentConversation.id ? conversationWithResponse : conv))
        );
      } catch (error) {
        console.error('Error generating response:', error);
        // Add an error message
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date()
        };
        
        const conversationWithError = {
          ...finalConversation,
          messages: [...finalConversation.messages, errorMessage],
          updatedAt: new Date()
        };
        
        setCurrentConversation(conversationWithError);
        setConversations(prev => 
          prev.map(conv => (conv.id === currentConversation.id ? conversationWithError : conv))
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const value = {
    conversations,
    currentConversation,
    setCurrentConversation,
    isLoading,
    addMessage,
    newConversation,
    deleteConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
