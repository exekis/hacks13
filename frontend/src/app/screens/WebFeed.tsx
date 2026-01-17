import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockUsers, mockPosts, User, Post } from '@/app/data/mockData';
import { WebPersonCard } from '@/app/components/WebPersonCard';
import { WebPostCard } from '@/app/components/WebPostCard';
import { Users, FileText, Sparkles, TrendingUp, Globe, Loader2, AlertCircle } from 'lucide-react';
import { 
  fetchPeopleRecommendations, 
  fetchPostRecommendations,
  backendPersonToMockUser,
  backendPostToMockPost,
  checkApiHealth
} from '@/api/recommendations';

interface WebFeedProps {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
  onRSVP: (userId: string) => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
  currentUserId?: string;
}

export function WebFeed({ onViewProfile, onMessage, friendRequests, onAddFriend, onRSVP, currentUserId = '482193' }: WebFeedProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'posts' | 'all'>('people');
  
  const [peopleItems, setPeopleItems] = useState<User[]>([]);
  const [postItems, setPostItems] = useState<(Post & { authorName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      setError(null);
      
      try {
        // check if api is available
        const apiHealthy = await checkApiHealth();
        
        if (!apiHealthy) {
          // fallback to mock data if api is not available
          console.log('API not available, using mock data');
          setUsingMockData(true);
          setPeopleItems(mockUsers);
          setPostItems(mockPosts);
          setLoading(false);
          return;
        }

        // fetch real recommendations from the backend
        const [peopleRecs, postRecs] = await Promise.all([
          fetchPeopleRecommendations(currentUserId, 20),
          fetchPostRecommendations(currentUserId, 20)
        ]);

        // transform backend data to ui-compatible format
        const transformedPeople = peopleRecs.map(backendPersonToMockUser);
        const transformedPosts = postRecs.map(backendPostToMockPost);

        setPeopleItems(transformedPeople as User[]);
        setPostItems(transformedPosts as (Post & { authorName?: string })[]);
        setUsingMockData(false);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        // fallback to mock data on error
        setUsingMockData(true);
        setPeopleItems(mockUsers);
        setPostItems(mockPosts);
        setError('Using offline data - backend unavailable');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [currentUserId]);

  // combine and shuffle people and posts for a mixed feed
  const allItems = [...peopleItems.map(u => ({type: 'user', data: u})), 
                    ...postItems.map(p => ({type: 'post', data: p}))] as any[];
  
  // Only shuffle if not empty/loading
  if (!loading && allItems.length > 0) {
      // Deterministic shuffle or just rely on items order? 
      // For now, simple sort to mix them
      allItems.sort(() => Math.random() - 0.5);
  }

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

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFEBDA] via-[#fff5ef] to-[#FFEBDA] py-8 relative overflow-hidden flex items-center justify-center">
             <div className="flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#f55c7a] mb-4" />
                <p className="text-[#666666]">Loading recommendations...</p>
             </div>
        </div>
    )
  }

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
            onClick={() => setActiveTab('all')}
            className={`relative flex items-center gap-2 px-6 py-3 border border-black rounded-xl transition-all duration-300 overflow-hidden ${
              activeTab === 'all'
                ? 'text-white'
                : 'bg-white text-black hover:shadow-lg'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === 'all' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#f55c7a] to-[#f68c70]"
                layoutId="tabBg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Users size={20} className="relative z-10" />
            <span className="relative z-10" style={{ fontFamily: 'Castoro, serif' }}>All</span>
          </motion.button>
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

            {activeTab === 'all' &&
            allItems.map((item) => {
              if (item.type === 'user') {
                return (
                  <motion.div key={item.data.id} variants={itemVariants}><WebPersonCard
                    key={item.data.id}
                    user={item.data}
                    onViewProfile={onViewProfile}
                    onAddFriend={onAddFriend}
                    isFriendRequested={friendRequests.has(item.data.id)}
                  /></motion.div>
                );
              } else {
                return (
                  <motion.div key={item.data.id} variants={itemVariants}>
                    <WebPostCard
                      key={item.data.id}
                      post={item.data}
                      onRSVP={onRSVP}
                      onMessage={onMessage}
                      onViewProfile={onViewProfile}
                  /></motion.div>
                );
              }
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
