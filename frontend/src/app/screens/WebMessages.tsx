import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockUsers } from '@/app/data/mockData';
import { User, Send, ArrowLeft, MessageCircle, Sparkles, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // mock conversations
  const conversations = mockUsers.slice(0, 5).map(user => ({
    userId: user.id,
    lastMessage: 'Hey! Looking forward to meeting up',
    timestamp: '2h ago',
    unread: user.id === '2',
  }));

  // mock messages for selected chat
  const initialMessages: Message[] = selectedChat ? [
    { id: '1', text: 'Hey! I saw your post about exploring Toronto', sent: false, timestamp: '10:30 AM' },
    { id: '2', text: 'Hi! Yes, I\'m planning to visit next week', sent: true, timestamp: '10:32 AM' },
    { id: '3', text: 'That sounds great! I know some amazing spots', sent: false, timestamp: '10:35 AM' },
    { id: '4', text: 'Would love to hear your recommendations!', sent: true, timestamp: '10:36 AM' },
  ] : [];

  useEffect(() => {
    setMessages(initialMessages);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const user = mockUsers.find(u => u.id === conv.userId);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEBDA] via-[#fff5ef] to-[#FFEBDA]">
      <div className="flex h-screen">
        {/* conversations list */}
        <motion.div 
          className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-96 bg-white border-r border-black`}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-6 border-b border-black bg-gradient-to-r from-white to-[#fff5ef]">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <MessageCircle className="w-7 h-7 text-[#f55c7a]" />
              </motion.div>
              <h2 className="text-2xl" style={{ fontFamily: 'Castoro, serif' }}>Messages</h2>
            </div>
            
            {/* search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 border border-black/20 rounded-xl bg-[#FFEBDA]/30 focus:outline-none focus:ring-2 focus:ring-[#f55c7a]/30 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-140px)]">
            <AnimatePresence>
              {filteredConversations.map((conv, index) => {
                const user = mockUsers.find(u => u.id === conv.userId);
                if (!user) return null;
                
                return (
                  <motion.button
                    key={conv.userId}
                    onClick={() => setSelectedChat(conv.userId)}
                    className={`w-full p-4 border-b border-black/10 transition-all text-left ${
                      selectedChat === conv.userId ? 'bg-gradient-to-r from-[#f6bc66]/20 to-[#f6ac69]/10' : 'hover:bg-[#FFEBDA]/50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="relative w-12 h-12 bg-gradient-to-br from-[#f6bc66] to-[#f6ac69] border border-black rounded-full flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <User size={24} className="text-black" />
                        {conv.unread && (
                          <motion.div 
                            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#f55c7a] border border-white rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold truncate">{user.name}</h4>
                          <span className="text-xs text-[#666666] ml-2">{conv.timestamp}</span>
                        </div>
                        <p className="text-sm text-[#666666] truncate">{conv.lastMessage}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* chat area */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
          {selectedChat ? (
            <>
              {/* chat header */}
              <motion.div 
                className="bg-white border-b border-black p-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => {
                      setSelectedChat(undefined);
                      onBack?.();
                    }}
                    className="md:hidden p-2 hover:bg-[#FFEBDA] rounded-xl transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft size={20} />
                  </motion.button>
                  <motion.div 
                    className="relative w-10 h-10 bg-gradient-to-br from-[#f6bc66] to-[#f6ac69] border border-black rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <User size={20} className="text-black" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: 'Castoro, serif' }}>
                      {mockUsers.find(u => u.id === selectedChat)?.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <motion.div 
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-xs text-[#666666]">Active now</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <div className={`max-w-md ${msg.sent ? 'order-2' : 'order-1'}`}>
                        <motion.div
                          className={`px-4 py-3 rounded-2xl border border-black ${
                            msg.sent
                              ? 'bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white'
                              : 'bg-white text-black'
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p>{msg.text}</p>
                        </motion.div>
                        <p className="text-xs text-[#666666] mt-1 px-1">{msg.timestamp}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* message input */}
              <motion.div 
                className="bg-white border-t border-black p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f55c7a]/30 transition-all"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-xl flex items-center gap-2"
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(245, 92, 122, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center text-[#666666]">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#f55c7a]/20 to-[#f6ac69]/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <MessageCircle className="w-10 h-10 text-[#f55c7a]" />
                </motion.div>
                <p className="text-xl mb-2" style={{ fontFamily: 'Castoro, serif' }}>Select a conversation</p>
                <p className="text-sm">Choose a chat from the list to start messaging</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
