
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SendIcon, MicIcon, PlusIcon } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

const MessageInput: React.FC = () => {
  const { t } = useTranslation();
  const { addMessage, isLoading } = useChat();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (!textareaRef.current) return;
    
    // Reset height
    textareaRef.current.style.height = 'auto';
    
    // Set new height based on scrollHeight
    const scrollHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = scrollHeight > 200 ? '200px' : `${scrollHeight}px`;
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    addMessage(message.trim(), 'user');
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 pb-4 relative max-w-3xl mx-auto w-full"
    >
      <div className="relative rounded-xl border bg-background shadow-sm flex items-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 p-2 text-muted-foreground hover:text-foreground"
        >
          <PlusIcon size={20} />
          <span className="sr-only">Add attachment</span>
        </Button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('whatCanIHelpWith')}
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent px-3 py-2.5 focus:outline-none",
            "placeholder:text-muted-foreground min-h-[44px] max-h-[200px] overflow-y-auto scrollbar-thin"
          )}
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 p-2 mr-1 text-muted-foreground hover:text-foreground"
              >
                <MicIcon size={20} />
                <span className="sr-only">Voice input</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice input</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={!message.trim() || isLoading}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 p-2 mr-1 text-muted-foreground",
                  message.trim() ? "hover:text-foreground" : "",
                  !message.trim() || isLoading ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <SendIcon size={20} />
                <span className="sr-only">{t('sendMessage')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('sendMessage')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        {t('canMakeMistakes')}
      </p>
    </form>
  );
};

export default MessageInput;
