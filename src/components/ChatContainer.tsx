
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/context/ChatContext';
import ChatMessage from './ChatMessage';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatContainer: React.FC = () => {
  const { t } = useTranslation();
  const { currentConversation, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);
  
  // If there's no conversation or no messages, display welcome screen
  if (!currentConversation || currentConversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold mb-6">{t('chatGPT')}</h2>
        <h3 className="text-xl mb-8">{t('whatCanIHelpWith')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
          {/* Sample prompts could go here */}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Messages */}
      {currentConversation.messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className={cn(
          "py-6 px-4 md:px-6 w-full flex flex-col",
          "animate-in"
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
