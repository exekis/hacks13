import React, { useState } from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { PersonCard } from '@/app/components/PersonCard';
import { mockUsers } from '@/app/data/mockData';
import { Button } from '@/app/components/DesignSystem';
import { SlidersHorizontal } from 'lucide-react';

interface DiscoverScreenProps {
  onViewProfile: (userId: string) => void;
  friendRequests: Set<string>;
  onAddFriend: (userId: string) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onViewProfile,
  friendRequests,
  onAddFriend
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#fef9f6] pb-20">
      <TopAppBar title="Discover" />
      
      <div className="px-4 pt-4 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-[#f55c7a]/10 to-[#f6ac69]/10 rounded-3xl p-4 mb-4 border border-[#f6ac69]/20">
          <p className="text-sm text-[#3d3430]">
            💡 <span className="font-semibold">Recommendations</span> are based on your goals + profile match.
          </p>
        </div>
        
        <div className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-white rounded-3xl p-5 mb-4 shadow-md space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#3d3430] mb-2">
                Cultural background
              </label>
              <select className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none">
                <option>All backgrounds</option>
                <option>South Asian</option>
                <option>East Asian</option>
                <option>Latin American</option>
                <option>Middle Eastern</option>
                <option>West African</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#3d3430] mb-2">
                Languages
              </label>
              <select className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none">
                <option>All languages</option>
                <option>English</option>
                <option>Spanish</option>
                <option>Mandarin</option>
                <option>French</option>
                <option>Arabic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#3d3430] mb-2">
                Goals
              </label>
              <select className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none">
                <option>All goals</option>
                <option>Friends</option>
                <option>Food buddies</option>
                <option>Study pals</option>
                <option>Exploring the city</option>
                <option>Roommates</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded accent-[#f55c7a]" defaultChecked />
                <span className="text-sm text-[#3d3430]">Verified students only</span>
              </label>
            </div>
            
            <Button variant="gradient" size="sm" className="w-full">
              Apply filters
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          {mockUsers.slice(0, 8).map(user => (
            <PersonCard
              key={user.id}
              user={user}
              onViewProfile={onViewProfile}
              onAddFriend={onAddFriend}
              friendRequested={friendRequests.has(user.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
