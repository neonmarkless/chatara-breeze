
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  isLoading: boolean;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', attachments?: Attachment[]) => Promise<void>;
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  searchConversations: (query: string) => void;
  searchResults: Conversation[];
  isStreaming: boolean;
  streamingContent: string;
}
