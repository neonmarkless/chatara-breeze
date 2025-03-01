
import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Monitor, Settings, LogOut } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/context/UserContext';

type Theme = 'light' | 'dark' | 'system';

const ChatHeader: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useUser();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // You would typically emit an event or call a function passed as prop to toggle the sidebar
  };
  
  const getThemeIcon = () => {
    switch(theme) {
      case 'light': return <Sun className="h-5 w-5" />;
      case 'dark': return <Moon className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };
  
  return (
    <header className="border-b border-border bg-card text-card-foreground px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
        )}
        <div className="text-lg font-semibold">ChatAI</div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {getThemeIcon()}
              <span className="sr-only">{t('toggleTheme')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('theme')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              <DropdownMenuRadioItem value="light">{t('light')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">{t('dark')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">{t('system')}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
              <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ar">العربية</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Settings and User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">{t('settings')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.email || 'User'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;
