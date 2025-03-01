
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, PenSquare, Menu } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSettings } from '@/context/SettingsContext';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatHeader: React.FC = () => {
  const { t } = useTranslation();
  const { currentConversation } = useChat();
  const { theme, setTheme, language, setLanguage } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu size={20} />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="flex-1 flex items-center justify-center md:justify-start">
          <h1 className="text-xl font-semibold tracking-tight">
            {t('chatGPT')}
          </h1>
          
          {currentConversation && (
            <Button variant="ghost" size="icon" className="ml-2">
              <PenSquare size={16} />
              <span className="sr-only">Edit title</span>
            </Button>
          )}
        </div>
        
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
              <span className="sr-only">{t('settings')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('settings')}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Theme Setting */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('theme.title')}</h3>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="light"
                      id="theme-light"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="theme-light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={theme === 'light' ? 'checked' : 'unchecked'}
                    >
                      <div className="mb-2 rounded-md bg-background p-2">
                        {/* Light theme icon */}
                        <div className="h-6 w-6 rounded-full bg-foreground" />
                      </div>
                      <span>{t('theme.light')}</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="dark"
                      id="theme-dark"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="theme-dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={theme === 'dark' ? 'checked' : 'unchecked'}
                    >
                      <div className="mb-2 rounded-md bg-background p-2">
                        {/* Dark theme icon */}
                        <div className="h-6 w-6 rounded-full bg-foreground" />
                      </div>
                      <span>{t('theme.dark')}</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="system"
                      id="theme-system"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="theme-system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={theme === 'system' ? 'checked' : 'unchecked'}
                    >
                      <div className="mb-2 rounded-md bg-background p-2">
                        {/* System theme icon */}
                        <div className="h-6 w-6 rounded-full bg-foreground/50" />
                      </div>
                      <span>{t('theme.system')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Language Setting */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('language.title')}</h3>
                <RadioGroup
                  value={language}
                  onValueChange={setLanguage}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="en"
                      id="lang-en"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="lang-en"
                      className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={language === 'en' ? 'checked' : 'unchecked'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 overflow-hidden rounded-full">
                          <div className="h-full w-full bg-blue-600" />
                        </div>
                        <span>{t('language.english')}</span>
                      </div>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="ar"
                      id="lang-ar"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="lang-ar"
                      className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={language === 'ar' ? 'checked' : 'unchecked'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 overflow-hidden rounded-full">
                          <div className="h-full w-full bg-green-600" />
                        </div>
                        <span>{t('language.arabic')}</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Avatar className="h-9 w-9 ml-2">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground">AP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default ChatHeader;
