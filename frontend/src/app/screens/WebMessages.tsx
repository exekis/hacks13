import React, { useState } from 'react';
import { mockUsers } from '@/app/data/mockData';
import { User, Send, ArrowLeft } from 'lucide-react';

interface WebMessagesProps {
  selectedUserId?: string;
  onBack?: () => void;
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
}

export function WebMessages({ selectedUserId, onBack }: WebMessagesProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | undefined>(selectedUserId);
  
  // Mock conversations
  const conversations = mockUsers.slice(0, 5).map(user => ({
    userId: user.id,
    lastMessage: 'Hey! Looking forward to meeting up',
    timestamp: '2h ago',
    unread: user.id === '2',
  }));

  // Mock messages for selected chat
  const mockMessages: Message[] = selectedChat ? [
    { id: '1', text: 'Hey! I saw your post about exploring Toronto', sent: false, timestamp: '10:30 AM' },
    { id: '2', text: 'Hi! Yes, I\'m planning to visit next week', sent: true, timestamp: '10:32 AM' },
    { id: '3', text: 'That sounds great! I know some amazing spots', sent: false, timestamp: '10:35 AM' },
    { id: '4', text: 'Would love to hear your recommendations!', sent: true, timestamp: '10:36 AM' },
  ] : [];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message
      setMessageText('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFEBDA]">
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-96 bg-white border-r border-black`}>
          <div className="p-6 border-b border-black">
            <h2 className="text-2xl">Messages</h2>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-88px)]">
            {conversations.map(conv => {
              const user = mockUsers.find(u => u.id === conv.userId);
              if (!user) return null;
              
              return (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedChat(conv.userId)}
                  className={`w-full p-4 border-b border-black hover:bg-[#FFEBDA] transition-colors text-left ${
                    selectedChat === conv.userId ? 'bg-[#f6bc66]/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={24} className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold truncate">{user.name}</h4>
                        <span className="text-xs text-[#666666] ml-2">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-[#666666] truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-[#f55c7a] rounded-full mt-2"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-[#FFEBDA]`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-black p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedChat(undefined);
                      onBack?.();
                    }}
                    className="md:hidden p-2 hover:bg-[#FFEBDA] rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center">
                    <User size={20} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {mockUsers.find(u => u.id === selectedChat)?.name}
                    </h3>
                    <p className="text-xs text-[#666666]">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mockMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${msg.sent ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-3 rounded-lg border border-black ${
                          msg.sent
                            ? 'bg-[#f55c7a] text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <p className="text-xs text-[#666666] mt-1 px-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-black p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f55c7a]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-[#f55c7a] text-white border border-black rounded-lg hover:bg-[#f57c73] transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-[#666666]">
                <p className="text-xl mb-2">Select a conversation</p>
                <p className="text-sm">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
