import React, { useState } from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { Avatar, VerificationBadge } from '@/app/components/DesignSystem';
import { mockUsers } from '@/app/data/mockData';
import { Shield, Send } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface MessagesScreenProps {
  onSafetyClick: () => void;
  selectedUserId?: string;
  onBack?: () => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  onSafetyClick,
  selectedUserId,
  onBack
}) => {
  const [view, setView] = useState<'list' | 'chat'>(selectedUserId ? 'chat' : 'list');
  const [activeChat, setActiveChat] = useState(selectedUserId || '2');
  const [messageInput, setMessageInput] = useState('');
  
  const conversations = [
    { userId: '2', lastMessage: 'Sounds good! See you at 3pm', timestamp: '2m ago', unread: 2 },
    { userId: '1', lastMessage: 'Thanks for the food recommendation!', timestamp: '1h ago', unread: 0 },
    { userId: '8', lastMessage: 'Yes! I love salsa dancing', timestamp: '3h ago', unread: 1 },
    { userId: '6', lastMessage: 'The ramen place is near Robson St', timestamp: '1d ago', unread: 0 },
  ];
  
  const mockMessages: Message[] = [
    { id: '1', userId: '2', content: 'Hey! How are you?', timestamp: '10:30 AM', isOwn: false },
    { id: '2', userId: 'me', content: 'Hi! I\'m good, thanks! How about you?', timestamp: '10:32 AM', isOwn: true },
    { id: '3', userId: '2', content: 'Great! Do you want to grab bubble tea today?', timestamp: '10:33 AM', isOwn: false },
    { id: '4', userId: 'me', content: 'That sounds perfect! What time works for you?', timestamp: '10:35 AM', isOwn: true },
    { id: '5', userId: '2', content: 'How about 3pm at the campus bubble tea shop?', timestamp: '10:36 AM', isOwn: false },
    { id: '6', userId: 'me', content: 'Sounds good! See you at 3pm', timestamp: '10:37 AM', isOwn: true },
  ];
  
  const openChat = (userId: string) => {
    setActiveChat(userId);
    setView('chat');
  };
  
  const chatUser = mockUsers.find(u => u.id === activeChat);
  
  if (view === 'chat' && chatUser) {
    return (
      <div className="h-screen bg-[#fef9f6] flex flex-col pb-20">
        <TopAppBar
          title={chatUser.name}
          showBack
          onBackClick={() => {
            setView('list');
            onBack?.();
          }}
          onSafetyClick={onSafetyClick}
        />
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {mockMessages.map(msg => {
            const user = mockUsers.find(u => u.id === msg.userId);
            
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
              >
                {!msg.isOwn && <Avatar emoji={user?.avatar} size="sm" />}
                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div
                    className={`px-4 py-3 rounded-3xl ${
                      msg.isOwn
                        ? 'bg-gradient-to-r from-[#f55c7a] to-[#f6ac69] text-white'
                        : 'bg-white text-[#3d3430] border border-[#f5ede8]'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-xs text-[#8c7a6f] mt-1 px-2">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white border-t border-[#f5ede8] px-4 py-3">
          <div className="flex gap-2 mb-3">
            <button className="px-3 py-2 rounded-2xl bg-[#fff5f0] text-[#f55c7a] text-sm font-medium hover:bg-[#ffebe9] transition-colors">
              📍 Share vibe
            </button>
            <button className="px-3 py-2 rounded-2xl bg-[#fff5f0] text-[#f55c7a] text-sm font-medium hover:bg-[#ffebe9] transition-colors">
              📅 Suggest plan
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors"
            />
            <button className="w-12 h-12 rounded-full bg-gradient-to-r from-[#f55c7a] to-[#f6ac69] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#fef9f6] pb-20">
      <TopAppBar title="Messages" onSafetyClick={onSafetyClick} />
      
      <div className="px-4 pt-4 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-[#f55c7a]/10 to-[#f6ac69]/10 rounded-3xl p-4 mb-4 border border-[#f6ac69]/20 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#f55c7a] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-[#3d3430]">
              <span className="font-semibold">Stay safe:</span> Meet in public places and let friends know your plans.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {conversations.map(conv => {
            const user = mockUsers.find(u => u.id === conv.userId);
            if (!user) return null;
            
            return (
              <div
                key={conv.userId}
                onClick={() => openChat(conv.userId)}
                className="bg-white rounded-3xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar emoji={user.avatar} size="md" />
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#f55c7a] text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#3d3430]">{user.name}</h4>
                      {user.verified.student && <VerificationBadge type="student" />}
                    </div>
                    <p className="text-sm text-[#8c7a6f] truncate mb-1">{conv.lastMessage}</p>
                    <span className="text-xs text-[#8c7a6f]">{conv.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
