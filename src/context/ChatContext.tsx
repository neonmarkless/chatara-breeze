
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, ChatContextType, Attachment } from '@/types/chat';

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Flowise API configuration
const FLOWISE_API_HOST = "https://flowiseai-railway-production-bdd9.up.railway.app";
const FLOWISE_CHATFLOW_ID = "e28d78ce-c925-46ba-814b-590bf34bd951";

// Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

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

  // Search conversations
  const searchConversations = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
      
      // Search in messages
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
    });
    
    setSearchResults(results);
  };

  // Stream a response from Flowise
  const streamResponse = async (
    conversationId: string, 
    conversationHistory: { role: string; content: string }[]
  ) => {
    try {
      const response = await fetch(`${FLOWISE_API_HOST}/api/v1/prediction/${FLOWISE_CHATFLOW_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: conversationHistory[conversationHistory.length - 1].content,
          history: conversationHistory.slice(0, -1),
          streaming: true
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      // Initialize streaming
      setIsStreaming(true);
      setStreamingContent('');
      
      // Get message ID that will be updated with streaming content
      const messageId = uuidv4();
      
      // Add initial empty assistant message
      const initialAssistantMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      
      // Update current conversation with empty message
      const updatedConversation = {
        ...currentConversation!,
        messages: [...currentConversation!.messages, initialAssistantMessage],
        updatedAt: new Date()
      };
      
      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => conv.id === conversationId ? updatedConversation : conv)
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (done) break;
        
        const chunkText = decoder.decode(value);
        accumulatedContent += chunkText;
        setStreamingContent(accumulatedContent);
        
        // Update the assistant message with the latest content
        const updatedMessage = {
          ...initialAssistantMessage,
          content: accumulatedContent
        };
        
        const updatedConversationWithStream = {
          ...updatedConversation,
          messages: updatedConversation.messages.map(msg => 
            msg.id === messageId ? updatedMessage : msg
          ),
          updatedAt: new Date()
        };
        
        setCurrentConversation(updatedConversationWithStream);
        setConversations(prev => 
          prev.map(conv => conv.id === conversationId ? updatedConversationWithStream : conv)
        );
      }
      
      // Streaming complete
      setIsStreaming(false);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error with streaming response:', error);
      setIsStreaming(false);
      setIsLoading(false);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      
      const conversationWithError = {
        ...currentConversation!,
        messages: [...currentConversation!.messages, errorMessage],
        updatedAt: new Date()
      };
      
      setCurrentConversation(conversationWithError);
      setConversations(prev => 
        prev.map(conv => conv.id === conversationId ? conversationWithError : conv)
      );
    }
  };

  // Add a message to the current conversation
  const addMessage = async (content: string, role: 'user' | 'assistant' | 'system', attachments: Attachment[] = []) => {
    if (!currentConversation) return;
    
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
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
        // Prepare conversation history for Flowise API
        const conversationHistory = currentConversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add the current message to history
        conversationHistory.push({
          role: 'user',
          content
        });
        
        // Stream the response
        await streamResponse(currentConversation.id, conversationHistory);
        
      } catch (error) {
        console.error('Error generating response:', error);
        setIsLoading(false);
        
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
    deleteConversation,
    searchConversations,
    searchResults,
    isStreaming,
    streamingContent
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
