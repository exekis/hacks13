import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockUsers } from '@/app/data/mockData';
import { Send, ArrowLeft, MessageCircle, Search, Loader2 } from 'lucide-react';
import { fetchConversations, fetchConversation, sendMessage, ConversationPreview, Message as ApiMessage } from '@/api/conversations';
import { Avatar } from '@/app/components/DesignSystem';

interface WebMessagesProps {
  selectedUserId?: string;
  selectedUserName?: string;  // optional name of the selected user
  selectedUserAvatar?: string;  // optional avatar url of the selected user
  onBack?: () => void;
  currentUserId?: string;
}

interface UiMessage {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
}

// info about the friend in the currently selected chat
interface ChatFriendInfo {
  userId: string;
  name: string;
  avatar?: string;
}

export function WebMessages({ selectedUserId, selectedUserName, selectedUserAvatar, onBack, currentUserId }: WebMessagesProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | undefined>(selectedUserId);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [currentChatFriend, setCurrentChatFriend] = useState<ChatFriendInfo | null>(
    // initialize from props if provided
    selectedUserId && selectedUserName ? { userId: selectedUserId, name: selectedUserName, avatar: selectedUserAvatar } : null
  );
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // get user id from prop or localStorage
  const effectiveUserId = currentUserId || localStorage.getItem('user_id') || '100000';
  const userIdInt = parseInt(effectiveUserId, 10);

  // sync selectedChat with selectedUserId prop when it changes
  useEffect(() => {
    if (selectedUserId) {
      setSelectedChat(selectedUserId);
    }
  }, [selectedUserId]);

  // fetch conversations list
  useEffect(() => {
    async function loadConversations() {
      setConversationsLoading(true);
      try {
        console.log("user id in WebMessages.tsx")
        console.log(userIdInt)
        const data = await fetchConversations(userIdInt);
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setConversationsLoading(false);
      }
    }
    loadConversations();
  }, [userIdInt]);

  // fetch messages when chat is selected
  useEffect(() => {
    async function loadMessages() {
      if (!selectedChat) return;

      setLoading(true);
      try {
        const friendId = parseInt(selectedChat, 10);
        const data = await fetchConversation(userIdInt, friendId);
        
        // store friend info from the conversation response
        if (data.friend_name) {
          setCurrentChatFriend({
            userId: selectedChat,
            name: data.friend_name,
          });
        }
        
        // transform api messages to ui messages
        const uiMessages: UiMessage[] = data.messages.map(m => ({
          id: m.messageid.toString(),
          text: m.message_content,
          sent: m.senderid === userIdInt, // if senderid matches current user, it's sent by us
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setMessages(uiMessages);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [selectedChat, userIdInt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedChat) {
      try {
        const friendId = parseInt(selectedChat, 10);
        const resp = await sendMessage(userIdInt, friendId, messageText);
        
        const newMessage: UiMessage = {
          id: resp.messageid.toString(),
          text: resp.message_content,
          sent: true,
          timestamp: new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
        
        // refresh conversations list to update last message snippet
        const updatedConvs = await fetchConversations(userIdInt);
        setConversations(updatedConvs);

      } catch (err) {
        console.error('Failed to send message', err);
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const displayName = conv.friend_name || 'Traveler';
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
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
                const isSelected = selectedChat === conv.friend_user_id.toString();
                // get display name with fallback
                const displayName = conv.friend_name || 'Traveler';
                // try to find mock user for avatar if possible
                const mockUser = mockUsers.find(u => u.id === conv.friend_user_id.toString());
                
                return (
                  <motion.button
                    key={conv.conversationid}
                    onClick={() => setSelectedChat(conv.friend_user_id.toString())}
                    className={`w-full p-4 border-b border-black/10 transition-all text-left ${
                      isSelected ? 'bg-gradient-to-r from-[#f6bc66]/20 to-[#f6ac69]/10' : 'hover:bg-[#FFEBDA]/50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                      >
                        <Avatar 
                          src={mockUser?.avatar}
                          name={displayName}
                          size="md"
                          className="border border-black"
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold truncate">{displayName}</h4>
                          <span className="text-xs text-[#666666] ml-2">
                            {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-[#666666] truncate">{conv.last_message || 'Start a conversation'}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {conversationsLoading && (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-[#f55c7a]" size={24} />
              </div>
            )}
            {!conversationsLoading && filteredConversations.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                    No conversations found.
                </div>
            )}
          </div>
        </motion.div>

        {/* chat area */}
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
          {selectedChat ? (
            (() => {
              // get friend info for chat header - check multiple sources
              const conv = conversations.find(c => c.friend_user_id.toString() === selectedChat);
              const mockUser = mockUsers.find(u => u.id === selectedChat);
              const currentFriend = currentChatFriend?.userId === selectedChat ? currentChatFriend : null;
              // prioritize: conversation data > current chat friend info > mock user > fallback
              const chatName = conv?.friend_name || 
                currentFriend?.name || 
                mockUser?.name || 
                'Traveler';
              const chatAvatar = currentFriend?.avatar || mockUser?.avatar;
              
              return (
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
                    whileHover={{ scale: 1.1 }}
                  >
                    <Avatar 
                      src={chatAvatar}
                      name={chatName}
                      size="sm"
                      className="border border-black"
                    />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: 'Castoro, serif' }}>
                      {chatName}
                    </h3>
                  </div>
                </div>
              </motion.div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-[#f55c7a]" size={32} />
                    </div>
                ) : (
                <>
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
                </>
                )}
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
              );
            })()
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
