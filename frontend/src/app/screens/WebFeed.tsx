import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockUsers, mockPosts, User, Post } from '@/app/data/mockData';
import { WebPersonCard } from '@/app/components/WebPersonCard';
import { WebPostCard } from '@/app/components/WebPostCard';
import { Users, FileText, Sparkles, TrendingUp, Globe, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  fetchPeopleRecommendations, 
  fetchPostRecommendations,
  backendPersonToMockUser,
  backendPostToMockPost,
  checkApiHealth
} from '@/api/recommendations';

interface WebFeedProps {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string, userName?: string, userAvatar?: string) => void;
  onRSVP: (postId: string, userId: string, userName?: string, userAvatar?: string) => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
  currentUserId?: string;
}

export function WebFeed({ onViewProfile, onMessage, onRSVP, friendRequests, onAddFriend, currentUserId }: WebFeedProps) {
  // use provided userid or fallback to localstorage
  const effectiveUserId = currentUserId || localStorage.getItem('user_id') || '482193';
  
  const [activeTab, setActiveTab] = useState<'people' | 'posts' | 'all'>('people');
  
  // state for api-powered recommendations
  const [peopleItems, setPeopleItems] = useState<User[]>([]);
  const [postItems, setPostItems] = useState<(Post & { authorName?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshTime = useRef<Date | null>(null);

  // manual refresh function - only called when user clicks refresh button
  const handleRefreshFeed = useCallback(async () => {
    // prevent multiple simultaneous refreshes
    if (isRefreshing) return;
    
    setIsRefreshing(true);
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
        setHasLoadedOnce(true);
        setError('Backend unavailable - showing demo data');
        return;
      }

      // fetch real recommendations from the backend
      const [peopleRecs, postRecs] = await Promise.all([
        fetchPeopleRecommendations(effectiveUserId, 20),
        fetchPostRecommendations(effectiveUserId, 20)
      ]);

      console.log('[WebFeed] received peopleRecs:', peopleRecs.length);
      console.log('[WebFeed] received postRecs:', postRecs.length);

      // transform backend data to ui-compatible format
      const transformedPeople = peopleRecs.map(backendPersonToMockUser);
      const transformedPosts = postRecs.map(backendPostToMockPost);

      console.log('[WebFeed] transformed posts:', transformedPosts.length);

      setPeopleItems(transformedPeople as User[]);
      setPostItems(transformedPosts as (Post & { authorName?: string })[]);
      setUsingMockData(false);
      setHasLoadedOnce(true);
      lastRefreshTime.current = new Date();
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      // only fallback to mock data if we have no existing data
      if (peopleItems.length === 0 && postItems.length === 0) {
        setUsingMockData(true);
        setPeopleItems(mockUsers);
        setPostItems(mockPosts);
      }
      setError('Failed to refresh - keeping previous feed');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [effectiveUserId, isRefreshing, peopleItems.length, postItems.length]);

  // combine people and posts for all tab
  const allItems = hasLoadedOnce 
    ? [...peopleItems.map(u => ({type: 'user' as const, data: u})), 
       ...postItems.map(p => ({type: 'post' as const, data: p}))]
    : [];
  // shuffle for variety
  if (allItems.length > 0) {
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

        {/* stats bar with refresh button */}
        <motion.div 
          className="flex items-center justify-between gap-4 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-black/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f55c7a]/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-[#f55c7a]" />
              <span className="text-sm font-medium text-[#f55c7a]">
                {hasLoadedOnce ? `${peopleItems.length} matches` : 'Make some new matches today!'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#666666]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>12 people online nearby</span>
            </div>
            {usingMockData && (
              <span className="text-xs text-[#f55c7a] bg-[#f55c7a]/10 px-2 py-1 rounded-full">Demo data</span>
            )}
            {hasLoadedOnce && !usingMockData && lastRefreshTime.current && (
              <span className="text-xs text-[#666666]">
                Updated: {lastRefreshTime.current.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {/* refresh feed button - right aligned */}
          <motion.button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border-2 ${
              isRefreshing
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-[#f55c7a] border-[#f55c7a] hover:bg-[#f55c7a] hover:text-white'
            }`}
            whileHover={!isRefreshing ? { scale: 1.02 } : {}}
            whileTap={!isRefreshing ? { scale: 0.98 } : {}}
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
            <span className="text-sm" style={{ fontFamily: 'Castoro, serif' }}>
              {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
            </span>
          </motion.button>
        </motion.div>

        {/* error banner */}
        {error && (
          <motion.div 
            className="mb-4 p-3 bg-[#f6bc66]/20 border border-[#f6bc66] rounded-xl flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={16} className="text-[#f55c7a]" />
            <span className="text-sm text-[#3d3028]">{error}</span>
          </motion.div>
        )}

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
          {/* loading state */}
          {loading && (
            <motion.div 
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 size={32} className="animate-spin text-[#f55c7a] mb-3" />
              <p className="text-[#666666]">Loading recommendations...</p>
            </motion.div>
          )}

          {/* initial state - prompt user to refresh */}
          {!loading && !hasLoadedOnce && (
            <motion.div 
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-r from-[#f55c7a]/20 to-[#f6ac69]/20 flex items-center justify-center mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RefreshCw size={40} className="text-[#f55c7a]" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#3d3028] mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Ready to Discover
              </h3>
              <p className="text-[#666666] text-center max-w-sm mb-4">
                Tap the Refresh Feed button above to load personalized recommendations for travelers and events
              </p>
            </motion.div>
          )}

          {/* content - only show after first load */}
          {!loading && hasLoadedOnce && (
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
                  {peopleItems.length === 0 ? (
                    <div className="text-center py-8 text-[#666666]">
                      <p className="mb-2">No recommendations yet!</p>
                      <p className="text-sm">Complete your profile to get personalized matches.</p>
                    </div>
                  ) : (
                    peopleItems.map((user) => (
                      <motion.div key={user.id} variants={itemVariants}>
                        <WebPersonCard
                          user={user}
                          onViewProfile={onViewProfile}
                          onAddFriend={onAddFriend}
                          isFriendRequested={friendRequests.has(user.id)}
                        />
                      </motion.div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'posts' && (
                <>
                  {postItems.length === 0 ? (
                    <div className="text-center py-8 text-[#666666]">
                      <p className="mb-2">No events yet!</p>
                      <p className="text-sm">Complete your profile to see events near you.</p>
                    </div>
                  ) : (
                    postItems.map((post) => (
                      <motion.div key={post.id} variants={itemVariants}>
                        <WebPostCard
                          post={post}
                          onMessage={onMessage}
                          onViewProfile={onViewProfile}
                        />
                      </motion.div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'all' && (
                <>
                  {allItems.length === 0 ? (
                    <div className="text-center py-8 text-[#666666]">
                      <p className="mb-2">No content yet!</p>
                      <p className="text-sm">Complete your profile to get personalized recommendations.</p>
                    </div>
                  ) : (
                    allItems.map((item) => {
                      if (item.type === 'user') {
                        return (
                          <motion.div key={`user-${item.data.id}`} variants={itemVariants}>
                            <WebPersonCard
                              user={item.data as User}
                              onViewProfile={onViewProfile}
                              onAddFriend={onAddFriend}
                              isFriendRequested={friendRequests.has(item.data.id)}
                            />
                          </motion.div>
                        );
                      } else {
                        return (
                          <motion.div key={`post-${item.data.id}`} variants={itemVariants}>
                            <WebPostCard
                              post={item.data as Post}
                              onRSVP={onRSVP}
                              onMessage={onMessage}
                              onViewProfile={onViewProfile}
                            />
                          </motion.div>
                        );
                      }
                    })
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}