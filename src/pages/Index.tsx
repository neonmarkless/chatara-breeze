
import React from 'react';
import { ChatProvider } from '@/context/ChatContext';
import { DirectionProvider } from '@/context/DirectionContext';
import { SettingsProvider } from '@/context/SettingsContext';
import ChatSidebar from '@/components/ChatSidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import MessageInput from '@/components/MessageInput';
import { useIsMobile } from '@/hooks/use-mobile';

// Upload the image provided by the user
import logo from '/public/lovable-uploads/0f134484-91a6-40ac-b2ba-bd16b3b501e0.png';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <DirectionProvider>
      <SettingsProvider>
        <ChatProvider>
          <div className="flex h-screen overflow-hidden bg-background">
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
      </SettingsProvider>
    </DirectionProvider>
  );
};

export default Index;
