
import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  
  const isUser = message.role === 'user';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div
      className={cn(
        "py-6 px-4 md:px-6 w-full flex flex-col",
        "animate-in",
        isUser ? "bg-chat-user" : ""
      )}
    >
      <div className="max-w-3xl mx-auto w-full flex gap-4 md:gap-6">
        <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-black")}>
          <AvatarFallback className={cn("text-sm", isUser ? "bg-primary text-primary-foreground" : "bg-black text-white")}>
            {isUser ? 'U' : 'A'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="prose prose-neutral dark:prose-invert">
            <div className="markdown">{message.content}</div>
          </div>
          
          {!isUser && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
                onClick={copyToClipboard}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="sr-only">Copy message</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md text-muted-foreground hover:text-foreground",
                  feedback === 'positive' ? "text-foreground" : ""
                )}
                onClick={() => setFeedback('positive')}
              >
                <ThumbsUp size={16} />
                <span className="sr-only">Positive feedback</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md text-muted-foreground hover:text-foreground",
                  feedback === 'negative' ? "text-foreground" : ""
                )}
                onClick={() => setFeedback('negative')}
              >
                <ThumbsDown size={16} />
                <span className="sr-only">Negative feedback</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
