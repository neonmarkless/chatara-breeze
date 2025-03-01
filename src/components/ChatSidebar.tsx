
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SquarePlusIcon, ChevronDownIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { formatDate } from '@/lib/utils';
import { useDirection } from '@/context/DirectionContext';
import { cn } from '@/lib/utils';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const ChatSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation, 
    newConversation,
    deleteConversation,
    searchConversations,
    searchResults
  } = useChat();
  
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchConversations(query);
  };

  // Use search results if search is active, otherwise use conversations
  const displayedConversations = searchQuery.trim() ? searchResults : conversations;

  // Group conversations by month
  const groupedConversations = displayedConversations.reduce((acc, conversation) => {
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
      
      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <SearchIcon 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 text-sm bg-sidebar-accent"
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groupedConversationsArray.length > 0 ? (
          groupedConversationsArray.map((group) => (
            <div key={group.key} className="mb-4">
              <h3 className="px-3 py-2 text-xs font-medium text-sidebar-foreground/60">
                {group.monthName}
              </h3>
              <ul>
                {group.conversations.map((conversation) => (
                  <li key={conversation.id} className="group">
                    <button
                      onClick={() => setCurrentConversation(conversation)}
                      className={cn(
                        "w-full text-start px-3 py-2 text-sm truncate hover:bg-sidebar-accent",
                        "transition-colors duration-200 ease-in-out flex items-center justify-between",
                        currentConversation?.id === conversation.id 
                          ? "bg-sidebar-accent font-medium" 
                          : ""
                      )}
                    >
                      <span className="flex-1 truncate">{conversation.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                      >
                        <TrashIcon size={14} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : searchQuery ? (
          <div className="px-3 py-4 text-center text-muted-foreground">
            No conversations match your search
          </div>
        ) : (
          <div className="px-3 py-4 text-center text-muted-foreground">
            No conversations yet
          </div>
        )}
      </div>
      
      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 border border-sidebar-border hover:bg-sidebar-accent"
        >
          <SquarePlusIcon size={16} />
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
