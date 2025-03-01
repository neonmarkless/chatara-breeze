
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, ChatContextType, Attachment } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Flowise API configuration
const FLOWISE_API_HOST = "https://flowiseai-railway-production-bdd9.up.railway.app";
const FLOWISE_CHATFLOW_ID = "e28d78ce-c925-46ba-814b-590bf34bd951";

// Function to parse streaming content - to fix JSON issues
const parseStreamContent = (content: string): string => {
  if (!content || typeof content !== 'string') return '';
  
  // Try to detect JSON in the response
  try {
    // If it's a complete valid JSON, try to extract text or message content
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      const parsed = JSON.parse(content);
      if (parsed.text) return parsed.text;
      if (parsed.data?.text) return parsed.data.text;
      if (parsed.message) return parsed.message;
      if (parsed.content) return parsed.content;
      
      // Return the stringified JSON if we couldn't extract specific text
      return JSON.stringify(parsed, null, 2);
    }
    
    // Try to handle multiple JSON chunks
    if (content.includes('{"event":') || content.includes('{"data":')) {
      // Try to extract message parts from multiple chunks
      let processedContent = '';
      const chunks = content.split('\n').filter(chunk => chunk.trim() !== '');
      
      for (const chunk of chunks) {
        try {
          const parsed = JSON.parse(chunk.trim());
          if (parsed.data?.text) {
            processedContent += parsed.data.text;
          } else if (parsed.text) {
            processedContent += parsed.text;
          }
        } catch (e) {
          // If parsing fails, just add the raw chunk
          processedContent += chunk;
        }
      }
      
      // Return extracted content if we found any, otherwise return original
      return processedContent || content;
    }
  } catch (e) {
    // If JSON parsing fails, return the original content
    console.warn('Error parsing streaming content:', e);
  }
  
  // Return original content if no JSON detected or parsing failed
  return content;
};

// Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useUser();

  // Load conversations from Supabase when user is authenticated
  useEffect(() => {
    if (user) {
      loadConversationsFromSupabase();
    } else {
      // Clear conversations when logged out
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user]);

  // Load conversations from Supabase
  const loadConversationsFromSupabase = async () => {
    try {
      setIsLoading(true);
      
      // Get conversations for the current user
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (conversationsError) throw conversationsError;
      
      // Process each conversation to get its messages
      const processedConversations: Conversation[] = [];
      
      for (const conv of conversationsData) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            role,
            content,
            created_at,
            attachments (*)
          `)
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        // Convert to our Message type
        const messages: Message[] = messagesData.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          attachments: msg.attachments.map((att: any) => ({
            id: att.id,
            name: att.name,
            url: att.url,
            type: att.type,
            size: att.size
          }))
        }));
        
        processedConversations.push({
          id: conv.id,
          title: conv.title,
          messages,
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at)
        });
      }
      
      setConversations(processedConversations);
      
      // Set current conversation
      if (processedConversations.length > 0) {
        setCurrentConversation(processedConversations[0]);
      } else {
        // Create a default conversation if none exist
        newConversation();
      }
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error loading conversations",
        description: "There was a problem loading your chat history.",
        variant: "destructive"
      });
      
      // Create a new conversation as fallback
      newConversation();
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new conversation
  const newConversation = async () => {
    if (!user) return;
    
    try {
      // Create conversation in Supabase
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: 'New Conversation'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create new conversation object
      const conversation: Conversation = {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      
    } catch (error) {
      console.error('Error creating new conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete conversation from Supabase
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update state
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
      
      toast({
        title: "Conversation deleted",
        description: "Your conversation has been removed",
      });
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive"
      });
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
    conversationHistory: { role: string; content: string }[],
    messageId: string
  ) => {
    if (!user) return;
    
    try {
      // Prepare streaming URL
      const apiUrl = `${FLOWISE_API_HOST}/api/v1/prediction/${FLOWISE_CHATFLOW_ID}`;
      
      // Prepare request body
      const body = {
        question: conversationHistory[conversationHistory.length - 1].content,
        history: conversationHistory.slice(0, -1),
        streaming: true
      };

      console.log("Sending request to Flowise API:", body);

      // Make the fetch request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${await response.text()}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser');
      }

      // Initialize streaming
      setIsStreaming(true);
      setStreamingContent('');
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (done) break;
        
        const chunkText = decoder.decode(value);
        
        try {
          // Parse the chunk and handle JSON if present
          const parsedContent = parseStreamContent(chunkText);
          fullResponse += parsedContent;
          
          setStreamingContent(fullResponse);
          
          // Update the assistant message with the latest content
          await updateMessageContent(messageId, fullResponse);
          
        } catch (e) {
          console.warn('Error processing chunk:', e);
          // If there's an issue with parsing, just use the raw chunk
          fullResponse += chunkText;
          setStreamingContent(fullResponse);
          await updateMessageContent(messageId, fullResponse);
        }
      }
      
      // Streaming complete - store the final message in Supabase
      const finalParsedResponse = parseStreamContent(fullResponse);
      await updateMessageContent(messageId, finalParsedResponse, true);
      
      // Update UI state
      setIsStreaming(false);
      setIsLoading(false);
      
      console.log("Streaming complete, final response:", finalParsedResponse);
      
    } catch (error) {
      console.error('Error with streaming response:', error);
      setIsStreaming(false);
      setIsLoading(false);
      
      // Add error message to Supabase
      const errorMessage = "I'm sorry, I encountered an error processing your request. Please try again.";
      await updateMessageContent(messageId, errorMessage, true);

      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update message content in Supabase during streaming
  const updateMessageContent = async (messageId: string, content: string, isFinal: boolean = false) => {
    if (!user || !currentConversation) return;
    
    try {
      // Update the message in Supabase
      const { error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Update local state
      const updatedMessages = currentConversation.messages.map(msg => 
        msg.id === messageId ? { ...msg, content } : msg
      );
      
      const updatedConversation = {
        ...currentConversation,
        messages: updatedMessages,
        updatedAt: new Date()
      };
      
      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => conv.id === currentConversation.id ? updatedConversation : conv)
      );
      
      // If this is the final update, also update the conversation title if needed
      if (isFinal && currentConversation.title === 'New Conversation' && updatedMessages.length >= 2) {
        // Use the first few characters of the first user message as the title
        const firstUserMessage = updatedMessages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
          const newTitle = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
          
          // Update title in Supabase
          await supabase
            .from('conversations')
            .update({ title: newTitle, updated_at: new Date().toISOString() })
            .eq('id', currentConversation.id);
          
          // Update local state
          const titleUpdatedConversation = {
            ...updatedConversation,
            title: newTitle
          };
          
          setCurrentConversation(titleUpdatedConversation);
          setConversations(prev => 
            prev.map(conv => conv.id === currentConversation.id ? titleUpdatedConversation : conv)
          );
        }
      }
      
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  // Add a message to the current conversation
  const addMessage = async (content: string, role: 'user' | 'assistant' | 'system', attachments: Attachment[] = []) => {
    if (!currentConversation || !user) return;
    
    try {
      // First save the message to Supabase
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          role,
          content
        })
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      // Save attachments if any
      const savedAttachments: Attachment[] = [];
      
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          const { data: attachmentData, error: attachmentError } = await supabase
            .from('attachments')
            .insert({
              message_id: messageData.id,
              name: attachment.name,
              url: attachment.url,
              type: attachment.type,
              size: attachment.size
            })
            .select()
            .single();
          
          if (attachmentError) {
            console.error('Error saving attachment:', attachmentError);
            continue;
          }
          
          savedAttachments.push({
            id: attachmentData.id,
            name: attachmentData.name,
            url: attachmentData.url,
            type: attachmentData.type,
            size: attachmentData.size
          });
        }
      }
      
      // Create message object for local state
      const message: Message = {
        id: messageData.id,
        role,
        content,
        timestamp: new Date(messageData.created_at),
        attachments: savedAttachments.length > 0 ? savedAttachments : undefined
      };
      
      // Update local state
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, message],
        updatedAt: new Date()
      };
      
      // Update conversation in Supabase 
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation.id);
      
      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => (conv.id === currentConversation.id ? updatedConversation : conv))
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
          
          // Create empty assistant message in Supabase
          const { data: assistantData, error: assistantError } = await supabase
            .from('messages')
            .insert({
              conversation_id: currentConversation.id,
              role: 'assistant',
              content: ''
            })
            .select()
            .single();
          
          if (assistantError) throw assistantError;
          
          // Create assistant message for local state
          const assistantMessage: Message = {
            id: assistantData.id,
            role: 'assistant',
            content: '',
            timestamp: new Date(assistantData.created_at)
          };
          
          // Update conversation with empty assistant message
          const conversationWithAssistant = {
            ...updatedConversation,
            messages: [...updatedConversation.messages, assistantMessage],
            updatedAt: new Date()
          };
          
          setCurrentConversation(conversationWithAssistant);
          setConversations(prev => 
            prev.map(conv => (conv.id === currentConversation.id ? conversationWithAssistant : conv))
          );
          
          // Stream the response
          await streamResponse(currentConversation.id, conversationHistory, assistantMessage.id);
          
        } catch (error) {
          console.error('Error generating response:', error);
          setIsLoading(false);
          
          toast({
            title: "Error",
            description: "Failed to get a response. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to save your message. Please try again.",
        variant: "destructive"
      });
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
