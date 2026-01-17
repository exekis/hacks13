import React, { useState, useEffect } from 'react';
import { mockUsers, mockPosts, User, Post } from '@/app/data/mockData';
import { WebPersonCard } from '@/app/components/WebPersonCard';
import { WebPostCard } from '@/app/components/WebPostCard';
import { Users, FileText, Loader2, AlertCircle } from 'lucide-react';
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
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
  currentUserId?: string; // the logged-in user id for fetching recommendations
}

export function WebFeed({ onViewProfile, onMessage, friendRequests, onAddFriend, currentUserId = '482193' }: WebFeedProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'posts'>('people');
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
          setPeopleItems(mockUsers.slice(0, 6));
          setPostItems(mockPosts.slice(0, 6));
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
        setPeopleItems(mockUsers.slice(0, 6));
        setPostItems(mockPosts.slice(0, 6));
        setError('Using offline data - backend unavailable');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-[#FFEBDA] py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Discover</h1>
          <p className="text-[#666666]">Connect with travelers and students near you</p>
          {usingMockData && !error && (
            <p className="text-xs text-[#f55c7a] mt-1">Using demo data</p>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-[#f6bc66]/20 border border-[#f6bc66] rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-[#f55c7a]" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 px-6 py-3 border border-black rounded-lg transition-colors ${
              activeTab === 'people'
                ? 'bg-[#f55c7a] text-white'
                : 'bg-white text-black hover:bg-[#f6bc66]/30'
            }`}
          >
            <Users size={20} />
            <span style={{ fontFamily: 'Castoro, serif' }}>Friends</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-6 py-3 border border-black rounded-lg transition-colors ${
              activeTab === 'posts'
                ? 'bg-[#f55c7a] text-white'
                : 'bg-white text-black hover:bg-[#f6bc66]/30'
            }`}
          >
            <FileText size={20} />
            <span style={{ fontFamily: 'Castoro, serif' }}>Events</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#f55c7a] mb-4" />
            <p className="text-[#666666]">Loading recommendations...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-4">
            {activeTab === 'people' && (
              <>
                {peopleItems.length === 0 ? (
                  <div className="text-center py-8 text-[#666666]">
                    <p>No recommendations found. Check back later!</p>
                  </div>
                ) : (
                  peopleItems.map((user) => (
                    <WebPersonCard
                      key={user.id}
                      user={user}
                      onViewProfile={onViewProfile}
                      onAddFriend={onAddFriend}
                      isFriendRequested={friendRequests.has(user.id)}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'posts' && (
              <>
                {postItems.length === 0 ? (
                  <div className="text-center py-8 text-[#666666]">
                    <p>No posts to show. Check back later!</p>
                  </div>
                ) : (
                  postItems.map((post) => (
                    <WebPostCard
                      key={post.id}
                      post={post}
                      onMessage={onMessage}
                      onViewProfile={onViewProfile}
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
