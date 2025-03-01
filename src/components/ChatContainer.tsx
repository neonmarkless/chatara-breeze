
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/context/ChatContext';
import ChatMessage from './ChatMessage';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatContainer: React.FC = () => {
  const { t } = useTranslation();
  const { currentConversation, isLoading, isStreaming } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Scroll to the bottom when messages change or during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isStreaming]);
  
  // If there's no conversation or no messages, display welcome screen
  if (!currentConversation || currentConversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="w-20 h-20 mb-8 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-10 h-10 text-primary"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M4.75 9.75a1 1 0 011-1h12.5a1 1 0 011 1v8.5a1 1 0 01-1 1H5.75a1 1 0 01-1-1v-8.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M8 8V5.75A1 1 0 019 4.75h6a1 1 0 011 1V8"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-apple-blue bg-clip-text text-transparent">
          {t('chatGPT')}
        </h2>
        <h3 className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          {t('whatCanIHelpWith')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Start a conversation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Type a message to begin chatting with the AI assistant.</p>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Upload files</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Share documents, images, or other files for analysis.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Messages */}
      {currentConversation.messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {/* Loading indicator */}
      {isLoading && !isStreaming && (
        <div className={cn(
          "py-6 px-4 md:px-6 w-full flex flex-col",
          "animate-in fade-in"
        )}>
          <div className="max-w-3xl mx-auto w-full flex gap-4 md:gap-6">
            <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            
            <div className="flex items-center">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* This div is used to scroll to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
