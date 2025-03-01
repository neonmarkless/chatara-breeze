
import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDirection } from '@/context/DirectionContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { direction } = useDirection();
  
  const isUser = message.role === 'user';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if there are attachments
  const hasAttachments = message.attachments && message.attachments.length > 0;
  
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
          {isUser ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              U
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-black text-white">
              A
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className={cn(
          "flex-1 space-y-2 overflow-hidden",
          direction === 'rtl' ? 'rtl-text' : 'ltr-text'
        )}>
          <div className="prose prose-neutral dark:prose-invert">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* Attachments section */}
          {hasAttachments && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-2 border rounded-md bg-muted/30"
                >
                  <FileText size={16} className="mr-2" />
                  <span className="text-sm">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
          
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
