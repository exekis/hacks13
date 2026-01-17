import React, { useState } from 'react';
import { mockUsers, mockPosts } from '@/app/data/mockData';
import { WebPersonCard } from '@/app/components/WebPersonCard';
import { WebPostCard } from '@/app/components/WebPostCard';
import { Users, FileText } from 'lucide-react';

interface WebFeedProps {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
}

export function WebFeed({ onViewProfile, onMessage, friendRequests, onAddFriend }: WebFeedProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'posts' | 'all'>('people');

  // Combine and shuffle people and posts for a mixed feed
  const peopleItems = mockUsers.slice(0, 6);
  const postItems = mockPosts.slice(0, 6);
  const allItems = [...peopleItems.map(u => ({type: 'user', data: u})), 
                    ...postItems.map(u => ({type: 'post', data: u}))];
  allItems.sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-[#FFEBDA] py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Discover</h1>
          <p className="text-[#666666]">Connect with travelers and students near you</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-6 py-3 border border-black rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-[#f55c7a] text-white'
                : 'bg-white text-black hover:bg-[#f6bc66]/30'
            }`}
          >
            <span style={{ fontFamily: 'Castoro, serif' }}>All</span>
          </button>
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

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'people' &&
            peopleItems.map((user) => (
              <WebPersonCard
                key={user.id}
                user={user}
                onViewProfile={onViewProfile}
                onAddFriend={onAddFriend}
                isFriendRequested={friendRequests.has(user.id)}
              />
            ))}

          {activeTab === 'posts' &&
            postItems.map((post) => (
              <WebPostCard
                key={post.id}
                post={post}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
              />
            ))}

          {activeTab === 'all' &&
            allItems.map((item) => {
              if (item.type === 'user') {
                return (
                  <WebPersonCard
                    key={item.data.id}
                    user={item.data}
                    onViewProfile={onViewProfile}
                    onAddFriend={onAddFriend}
                    isFriendRequested={friendRequests.has(item.data.id)}
                  />
                );
              } else {
                return (
                  <WebPostCard
                    key={item.data.id}
                    post={item.data}
                    onMessage={onMessage}
                    onViewProfile={onViewProfile}
                  />
                );
              }
            })}
        </div>
      </div>
    </div>
  );
}
