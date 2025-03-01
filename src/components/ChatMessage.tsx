
import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDirection } from '@/context/DirectionContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from '@/context/ChatContext';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { direction } = useDirection();
  const { isStreaming } = useChat();
  
  const isUser = message.role === 'user';
  const isLast = !isUser && isStreaming;
  
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
        "py-6 px-4 md:px-6 w-full flex flex-col border-b",
        "animate-in fade-in",
        isUser ? "bg-chat-user dark:bg-gray-800/40" : "bg-white dark:bg-gray-900"
      )}
    >
      <div className="max-w-3xl mx-auto w-full flex gap-4 md:gap-6">
        <Avatar className={cn(
          "h-8 w-8",
          isUser 
            ? "bg-gradient-to-br from-primary to-blue-600" 
            : "bg-gradient-to-br from-gray-700 to-gray-900"
        )}>
          {isUser ? (
            <AvatarFallback className="text-white">
              U
            </AvatarFallback>
          ) : (
            <AvatarFallback className="text-white">
              A
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className={cn(
          "flex-1 space-y-2 overflow-hidden",
          direction === 'rtl' ? 'rtl-text' : 'ltr-text'
        )}>
          <div className={cn(
            "prose prose-neutral dark:prose-invert max-w-none",
            isLast && "relative"
          )}>
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative group">
                      <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                          className="p-1 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !mt-0"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={cn(
                      "bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded",
                      className
                    )} {...props}>
                      {children}
                    </code>
                  )
                },
                p({node, children}) {
                  return <p className="mb-2 leading-7">{children}</p>
                },
                ul({node, children}) {
                  return <ul className="my-3 ml-6 list-disc">{children}</ul>
                },
                ol({node, children}) {
                  return <ol className="my-3 ml-6 list-decimal">{children}</ol>
                },
                li({node, children}) {
                  return <li className="mb-1">{children}</li>
                },
                h1({node, children}) {
                  return <h1 className="text-2xl font-bold my-3">{children}</h1>
                },
                h2({node, children}) {
                  return <h2 className="text-xl font-bold my-3">{children}</h2>
                },
                h3({node, children}) {
                  return <h3 className="text-lg font-bold my-2">{children}</h3>
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            
            {isLast && (
              <span className="animate-pulse absolute -bottom-4 ml-1 inline-block w-1.5 h-4 bg-primary"></span>
            )}
          </div>
          
          {/* Attachments section */}
          {hasAttachments && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-2 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <FileText size={16} className="mr-2 text-primary" />
                  <span className="text-sm">{attachment.name}</span>
                  {attachment.url && (
                    <a 
                      href={attachment.url} 
                      download={attachment.name}
                      className="ml-2 p-1 rounded-full hover:bg-muted"
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!isUser && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={copyToClipboard}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="sr-only">Copy message</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  feedback === 'positive' ? "text-green-500 bg-green-50 dark:bg-green-900/20" : ""
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
                  "h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  feedback === 'negative' ? "text-red-500 bg-red-50 dark:bg-red-900/20" : ""
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
