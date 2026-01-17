import React, { useState, useCallback, useRef } from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { PersonCard } from '@/app/components/PersonCard';
import { PostCard } from '@/app/components/PostCard';
import { mockUsers, mockPosts, User, Post } from '@/app/data/mockData';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  fetchPeopleRecommendations, 
  fetchPostRecommendations,
  backendPersonToMockUser,
  backendPostToMockPost,
  checkApiHealth
} from '@/api/recommendations';

interface FeedScreenProps {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
  onSafetyClick: () => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
  currentUserId?: string; // the logged-in user id for fetching recommendations
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  onViewProfile,
  onMessage,
  onSafetyClick,
  friendRequests,
  onAddFriend,
  currentUserId = '482193'
}) => {
  const [activeTab, setActiveTab] = useState<'people' | 'posts'>('people');
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
        fetchPeopleRecommendations(currentUserId, 20),
        fetchPostRecommendations(currentUserId, 20)
      ]);

      // transform backend data to ui-compatible format
      const transformedPeople = peopleRecs.map(backendPersonToMockUser);
      const transformedPosts = postRecs.map(backendPostToMockPost);

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
  }, [currentUserId, isRefreshing, peopleItems.length, postItems.length]);
  
  return (
    <div className="min-h-screen bg-[#fef9f6] pb-20">
      <TopAppBar 
        title="Travelmate" 
        onSafetyClick={onSafetyClick}
        onSearchClick={() => {}}
      />
      
      <div className="sticky top-[72px] z-10 bg-[#fef9f6] pt-4 pb-2">
        <div className="flex gap-2 px-4 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
              activeTab === 'people'
                ? 'bg-gradient-to-r from-[#f55c7a] to-[#f6ac69] text-white shadow-md'
                : 'bg-white text-[#8c7a6f] border-2 border-[#f5ede8]'
            }`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-[#f55c7a] to-[#f6ac69] text-white shadow-md'
                : 'bg-white text-[#8c7a6f] border-2 border-[#f5ede8]'
            }`}
          >
            Posts
          </button>
        </div>
        
        {/* Refresh Feed Button */}
        <div className="px-4 max-w-md mx-auto mt-3">
          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className={`w-full py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isRefreshing
                ? 'bg-[#f5ede8] text-[#8c7a6f] cursor-not-allowed'
                : 'bg-white text-[#f55c7a] border-2 border-[#f55c7a] hover:bg-[#f55c7a] hover:text-white active:scale-[0.98]'
            }`}
          >
            <RefreshCw 
              size={18} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>
        
        {/* Status indicators */}
        <div className="px-4 max-w-md mx-auto mt-2 flex items-center justify-center gap-2">
          {usingMockData && (
            <span className="text-xs text-[#f55c7a] bg-[#f55c7a]/10 px-2 py-1 rounded-full">Demo data</span>
          )}
          {hasLoadedOnce && !usingMockData && lastRefreshTime.current && (
            <span className="text-xs text-[#8c7a6f]">
              Last refreshed: {lastRefreshTime.current.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 max-w-md mx-auto mt-2">
          <div className="p-2 bg-[#f6bc66]/20 border border-[#f6bc66] rounded-lg flex items-center gap-2">
            <AlertCircle size={14} className="text-[#f55c7a]" />
            <span className="text-xs">{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#f55c7a] mb-3" />
          <p className="text-sm text-[#8c7a6f]">Loading recommendations...</p>
        </div>
      )}

      {/* Initial state - prompt user to refresh */}
      {!loading && !hasLoadedOnce && (
        <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#f55c7a]/20 to-[#f6ac69]/20 flex items-center justify-center mb-4">
            <RefreshCw size={32} className="text-[#f55c7a]" />
          </div>
          <h3 className="text-lg font-semibold text-[#3d3028] mb-2">Ready to Discover</h3>
          <p className="text-sm text-[#8c7a6f] text-center mb-4">
            Tap the Refresh Feed button above to load personalized recommendations for travelers and posts
          </p>
        </div>
      )}
      
      {/* Content - only show after first load */}
      {!loading && hasLoadedOnce && (
        <div className="px-4 pt-4 space-y-4 max-w-md mx-auto">
          {activeTab === 'people' ? (
            <>
              {peopleItems.length === 0 ? (
                <div className="text-center py-8 text-[#8c7a6f]">
                  <p>No recommendations found. Try refreshing!</p>
                </div>
              ) : (
                peopleItems.map(user => (
                  <PersonCard
                    key={user.id}
                    user={user}
                    onViewProfile={onViewProfile}
                    onAddFriend={onAddFriend}
                    friendRequested={friendRequests.has(user.id)}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {postItems.length === 0 ? (
                <div className="text-center py-8 text-[#8c7a6f]">
                  <p>No posts to show. Try refreshing!</p>
                </div>
              ) : (
                postItems.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onAddFriend={onAddFriend}
                    onMessage={onMessage}
                    friendRequested={friendRequests.has(post.userId)}
                  />
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
