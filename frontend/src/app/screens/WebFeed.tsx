import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockUsers, mockPosts } from '@/app/data/mockData';
import { WebPersonCard } from '@/app/components/WebPersonCard';
import { WebPostCard } from '@/app/components/WebPostCard';
import { Users, FileText, Sparkles, TrendingUp, Globe } from 'lucide-react';

interface WebFeedProps {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
}

export function WebFeed({ onViewProfile, onMessage, friendRequests, onAddFriend }: WebFeedProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'posts'>('people');

  // combine and shuffle people and posts for a mixed feed
  const peopleItems = mockUsers.slice(0, 6);
  const postItems = mockPosts.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEBDA] via-[#fff5ef] to-[#FFEBDA] py-8 relative overflow-hidden">
      {/* animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-[#f55c7a]/5 -top-48 -right-48"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-[#f6ac69]/5 bottom-20 -left-32"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* header with animation */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Globe className="w-8 h-8 text-[#f55c7a]" />
            </motion.div>
            <h1 className="text-4xl bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69] bg-clip-text text-transparent" style={{ fontFamily: 'Castoro, serif' }}>
              Discover
            </h1>
          </div>
          <p className="text-[#666666] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f6ac69]" />
            Connect with travelers and students near you
          </p>
        </motion.div>

        {/* stats bar */}
        <motion.div 
          className="flex items-center gap-4 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-black/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f55c7a]/10 rounded-full">
            <TrendingUp className="w-4 h-4 text-[#f55c7a]" />
            <span className="text-sm font-medium text-[#f55c7a]">6 new matches today</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#666666]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>12 people online nearby</span>
          </div>
        </motion.div>

        {/* tabs with smooth animation */}
        <motion.div 
          className="flex gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => setActiveTab('people')}
            className={`relative flex items-center gap-2 px-6 py-3 border border-black rounded-xl transition-all duration-300 overflow-hidden ${
              activeTab === 'people'
                ? 'text-white'
                : 'bg-white text-black hover:shadow-lg'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === 'people' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#f55c7a] to-[#f68c70]"
                layoutId="tabBg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Users size={20} className="relative z-10" />
            <span className="relative z-10" style={{ fontFamily: 'Castoro, serif' }}>Friends</span>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('posts')}
            className={`relative flex items-center gap-2 px-6 py-3 border border-black rounded-xl transition-all duration-300 overflow-hidden ${
              activeTab === 'posts'
                ? 'text-white'
                : 'bg-white text-black hover:shadow-lg'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === 'posts' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#f55c7a] to-[#f68c70]"
                layoutId="tabBg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <FileText size={20} className="relative z-10" />
            <span className="relative z-10" style={{ fontFamily: 'Castoro, serif' }}>Events</span>
          </motion.button>
        </motion.div>

        {/* content with staggered animation */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
          >
            {activeTab === 'people' && (
              <>
                {peopleItems.map((user, index) => (
                  <motion.div key={user.id} variants={itemVariants}>
                    <WebPersonCard
                      user={user}
                      onViewProfile={onViewProfile}
                      onAddFriend={onAddFriend}
                      isFriendRequested={friendRequests.has(user.id)}
                    />
                  </motion.div>
                ))}
              </>
            )}

            {activeTab === 'posts' && (
              <>
                {postItems.map((post, index) => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <WebPostCard
                      post={post}
                      onMessage={onMessage}
                      onViewProfile={onViewProfile}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
