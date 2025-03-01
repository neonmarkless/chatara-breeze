
import React from 'react';
import { ChatProvider } from '@/context/ChatContext';
import { DirectionProvider } from '@/context/DirectionContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { UserProvider } from '@/context/UserContext';
import ChatSidebar from '@/components/ChatSidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import MessageInput from '@/components/MessageInput';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <DirectionProvider>
      <SettingsProvider>
        <UserProvider>
          <ChatProvider>
            <div className="flex h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              {/* Sidebar - hidden on mobile by default */}
              {!isMobile && <ChatSidebar />}
              
              {/* Main Chat Area */}
              <div className="flex flex-col flex-1 overflow-hidden">
                <ChatHeader />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ChatContainer />
                  <MessageInput />
                </div>
              </div>
            </div>
          </ChatProvider>
        </UserProvider>
      </SettingsProvider>
    </DirectionProvider>
  );
};

export default Index;
