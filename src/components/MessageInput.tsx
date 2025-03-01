
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SendIcon, MicIcon, PaperclipIcon, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Attachment } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MessageInput: React.FC = () => {
  const { t } = useTranslation();
  const { addMessage, isLoading } = useChat();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if ((!message.trim() && attachments.length === 0) || isLoading) return;
    
    addMessage(message.trim(), 'user', attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    
    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        // Could use toast notification here
        console.error(`File ${file.name} exceeds the maximum size limit of 5MB`);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      
      newAttachments.push({
        id: uuidv4(),
        name: file.name,
        url: objectUrl,
        type: file.type,
        size: file.size
      });
    });

    setAttachments([...attachments, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    const attachment = attachments.find(att => att.id === id);
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const toggleVoiceRecording = () => {
    // This would need to be connected to a real voice API
    setIsVoiceRecording(!isVoiceRecording);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 pb-4 relative max-w-3xl mx-auto w-full"
    >
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div 
              key={attachment.id} 
              className="relative flex items-center p-2 bg-secondary rounded-md"
            >
              <span className="text-xs mr-8">{attachment.name.length > 20 ? `${attachment.name.substring(0, 20)}...` : attachment.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 absolute right-1"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="relative rounded-xl border bg-background shadow-sm flex items-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 p-2 text-muted-foreground hover:text-foreground"
          onClick={handleFileClick}
        >
          <PaperclipIcon size={20} />
          <span className="sr-only">Attach file</span>
        </Button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        
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
                className={cn(
                  "h-10 w-10 p-2 mr-1 text-muted-foreground hover:text-foreground",
                  isVoiceRecording ? "text-primary" : ""
                )}
                onClick={toggleVoiceRecording}
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
                disabled={(message.trim() === '' && attachments.length === 0) || isLoading}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 p-2 mr-1 text-muted-foreground",
                  (message.trim() !== '' || attachments.length > 0) ? "hover:text-foreground" : "",
                  (message.trim() === '' && attachments.length === 0) || isLoading ? "opacity-50 cursor-not-allowed" : ""
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
