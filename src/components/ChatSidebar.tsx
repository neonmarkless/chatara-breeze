
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SquarePlusIcon, ChevronDownIcon } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { formatDate } from '@/lib/utils';
import { useDirection } from '@/context/DirectionContext';
import { cn } from '@/lib/utils';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ChatSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation, 
    newConversation,
    deleteConversation
  } = useChat();
  
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Group conversations by month
  const groupedConversations = conversations.reduce((acc, conversation) => {
    const date = new Date(conversation.createdAt);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        monthName: t(date.toLocaleString('default', { month: 'long' }).toLowerCase()),
        conversations: []
      };
    }
    
    acc[key].conversations.push(conversation);
    return acc;
  }, {} as Record<string, { monthName: string; conversations: typeof conversations }>);

  // Convert to array and sort by date (most recent first)
  const groupedConversationsArray = Object.entries(groupedConversations)
    .map(([key, value]) => ({
      key,
      ...value,
    }))
    .sort((a, b) => {
      const [yearA, monthA] = a.key.split('-').map(Number);
      const [yearB, monthB] = b.key.split('-').map(Number);
      
      if (yearA !== yearB) {
        return yearB - yearA; // Most recent year first
      }
      return monthB - monthA; // Most recent month first
    });

  return (
    <aside className="w-72 h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* New Chat Button */}
      <div className="p-3">
        <Button 
          onClick={newConversation}
          variant="outline" 
          className="w-full justify-start gap-3 border border-sidebar-border hover:bg-sidebar-accent"
        >
          <PlusIcon size={16} />
          <span>{t('newChat')}</span>
        </Button>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groupedConversationsArray.map((group) => (
          <div key={group.key} className="mb-4">
            <h3 className="px-3 py-2 text-xs font-medium text-sidebar-foreground/60">
              {group.monthName}
            </h3>
            <ul>
              {group.conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    onClick={() => setCurrentConversation(conversation)}
                    className={cn(
                      "w-full text-start px-3 py-2 text-sm truncate hover:bg-sidebar-accent",
                      "transition-colors duration-200 ease-in-out",
                      currentConversation?.id === conversation.id 
                        ? "bg-sidebar-accent font-medium" 
                        : ""
                    )}
                  >
                    <div className="flex w-full items-center">
                      <span className="flex-1 truncate">{conversation.title}</span>
                      {currentConversation?.id === conversation.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                        >
                          <span className="sr-only">Delete</span>
                          {/* You can add an X icon here */}
                        </Button>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 border border-sidebar-border hover:bg-sidebar-accent"
        >
          <SquaresPlusIcon size={16} />
          <span>{t('explorGPTs')}</span>
        </Button>
        
        {/* Upgrade plan */}
        <div className="mt-3 rounded-lg bg-sidebar-accent p-3 text-sm">
          <p className="font-medium">{t('upgradePlan')}</p>
          <p className="text-xs text-sidebar-foreground/70 mt-1">{t('moreAccess')}</p>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
