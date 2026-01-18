import React, { useState } from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { Button, Avatar, Tag, VerificationBadge } from '@/app/components/DesignSystem';
import { mockUsers } from '@/app/data/mockData';
import { MapPin, Languages, Target, Edit2, Settings } from 'lucide-react';

interface ProfileScreenProps {
  userId?: string;
  onBack?: () => void;
  onSettingsClick?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId = '1',
  onBack,
  onSettingsClick
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'photos' | 'badges'>('about');
  const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const isOwnProfile = userId === '1'; // Assume user 1 is logged in user
  
  return (
    <div className="min-h-screen bg-[#fef9f6] pb-20">
      <TopAppBar
        title={isOwnProfile ? 'My Profile' : user.name}
        showBack={!isOwnProfile}
        onBackClick={onBack}
      />
      
      <div className="max-w-md mx-auto">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69]"></div>
        
        {/* Profile header */}
        <div className="px-4 -mt-12 pb-4">
          <div className="flex items-end justify-between mb-4">
            <Avatar src={user.avatar} name={user.name} size="xl" className="border-4 border-white" />
            {isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={onSettingsClick}
                  className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <Settings className="w-5 h-5 text-[#f55c7a]" />
                </button>
                <button className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                  <Edit2 className="w-5 h-5 text-[#f55c7a]" />
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-md mb-4">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-[#3d3430] mb-1">{user.name}</h2>
              {user.pronouns && (
                <p className="text-sm text-[#8c7a6f] mb-2">{user.pronouns}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {user.verified.student && <VerificationBadge type="student" />}
                {user.verified.age && <VerificationBadge type="age" />}
              </div>
            </div>
            
            <p className="text-[#3d3430] mb-4 leading-relaxed">{user.bio}</p>
            
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button variant="gradient" size="md" className="flex-1">
                  + Add friend
                </Button>
                <Button variant="secondary" size="md" className="flex-1">
                  💬 Message
                </Button>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-white text-[#f55c7a] shadow-md'
                  : 'text-[#8c7a6f]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition-all ${
                activeTab === 'photos'
                  ? 'bg-white text-[#f55c7a] shadow-md'
                  : 'text-[#8c7a6f]'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition-all ${
                activeTab === 'badges'
                  ? 'bg-white text-[#f55c7a] shadow-md'
                  : 'text-[#8c7a6f]'
              }`}
            >
              Badges
            </button>
          </div>
          
          {/* Tab content */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 shadow-md">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-[#f55c7a] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3d3430] mb-1">Location</h4>
                    <p className="text-[#8c7a6f]">{user.location}</p>
                    {user.university && (
                      <p className="text-sm text-[#8c7a6f] mt-1">{user.university}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mb-4">
                  <Languages className="w-5 h-5 text-[#f57c73] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3d3430] mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang, i) => (
                        <Tag key={i} color="coral" size="sm">{lang}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-5 h-5 text-[#f68c70] mt-1 flex-shrink-0">🌍</div>
                  <div>
                    <h4 className="font-semibold text-[#3d3430] mb-2">Cultural background</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.culturalBackground.map((bg, i) => (
                        <Tag key={i} color="pink" size="sm">{bg}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-[#f6ac69] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3d3430] mb-2">Looking for</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.goals.map((goal, i) => (
                        <Tag key={i} color="amber" size="sm">{goal}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'photos' && (
            <div className="bg-white rounded-3xl p-5 shadow-md">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-gradient-to-br from-[#f55c7a]/20 to-[#f6ac69]/20 flex items-center justify-center text-4xl"
                  >
                    📸
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-[#8c7a6f] mt-4">
                {isOwnProfile ? 'Add photos to your profile' : 'No photos yet'}
              </p>
            </div>
          )}
          
          {activeTab === 'badges' && (
            <div className="bg-white rounded-3xl p-5 shadow-md">
              <div className="grid grid-cols-2 gap-3">
                {user.badges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-[#fff5f0] to-[#fff9e5] border-2 border-[#f6ac69]/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f55c7a] to-[#f6ac69] flex items-center justify-center text-2xl">
                      {i === 0 ? '🎓' : i === 1 ? '✈️' : i === 2 ? '🍜' : '⭐'}
                    </div>
                    <span className="text-xs font-semibold text-center text-[#3d3430]">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
