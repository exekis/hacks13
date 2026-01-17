import React, { useState } from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { PersonCard } from '@/app/components/PersonCard';
import { PostCard } from '@/app/components/PostCard';
import { mockUsers, mockPosts } from '@/app/data/mockData';

interface FeedScreenProps {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
  onSafetyClick: () => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  onViewProfile,
  onMessage,
  onSafetyClick,
  friendRequests,
  onAddFriend
}) => {
  const [activeTab, setActiveTab] = useState<'people' | 'posts'>('people');
  
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
            👥 People
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-[#f55c7a] to-[#f6ac69] text-white shadow-md'
                : 'bg-white text-[#8c7a6f] border-2 border-[#f5ede8]'
            }`}
          >
            📝 Posts
          </button>
        </div>
      </div>
      
      <div className="px-4 pt-4 space-y-4 max-w-md mx-auto">
        {activeTab === 'people' ? (
          <>
            {mockUsers.map(user => (
              <PersonCard
                key={user.id}
                user={user}
                onViewProfile={onViewProfile}
                onAddFriend={onAddFriend}
                friendRequested={friendRequests.has(user.id)}
              />
            ))}
          </>
        ) : (
          <>
            {mockPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onAddFriend={onAddFriend}
                onMessage={onMessage}
                friendRequested={friendRequests.has(post.userId)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
