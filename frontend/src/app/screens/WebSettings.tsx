import React, { useState } from 'react';
import { Shield, Bell, Lock, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/app/types/profile';

interface WebSettingsProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export function WebSettings({ userProfile, onBack, onUpdateProfile }: WebSettingsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FFEBDA] py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white border border-black rounded-lg hover:bg-[#f6bc66]/20 transition-colors"
        >
          ← Back
        </button>

        <h2 className="text-3xl mb-8">Settings</h2>

        {/* Safety & Privacy Settings */}
        <div className="bg-white border border-black rounded-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-black bg-[#f6bc66]/20 flex items-center gap-3">
            <Shield size={20} />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Safety & Privacy
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Who Can Message */}
            <div>
              <label className="block mb-2 font-medium">Who can message you?</label>
              <select
                value={userProfile.whoCanMessage}
                onChange={(e) => onUpdateProfile({ whoCanMessage: e.target.value as any })}
                className="w-full px-4 py-2 border border-black rounded-lg bg-white"
              >
                <option value="friends">Friends only</option>
                <option value="friends-of-friends">Friends-of-friends</option>
                <option value="anyone-verified">Anyone verified</option>
              </select>
            </div>

            {/* Who Can See Posts */}
            <div>
              <label className="block mb-2 font-medium">Who can see your posts?</label>
              <select
                value={userProfile.whoCanSeePosts}
                onChange={(e) => onUpdateProfile({ whoCanSeePosts: e.target.value as any })}
                className="w-full px-4 py-2 border border-black rounded-lg bg-white"
              >
                <option value="friends">Friends</option>
                <option value="friends-of-friends">Friends-of-friends</option>
                <option value="everyone-verified">Everyone verified</option>
              </select>
            </div>

            {/* Hide Location */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#FFEBDA] border border-black rounded-lg">
                <input
                  type="checkbox"
                  checked={userProfile.hideLocationUntilFriends}
                  onChange={(e) => onUpdateProfile({ hideLocationUntilFriends: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Hide exact location until we're friends</span>
              </label>
            </div>

            {/* Meetup Preference */}
            <div>
              <label className="block mb-2 font-medium">Preferred meetup type</label>
              <select
                value={userProfile.meetupPreference}
                onChange={(e) => onUpdateProfile({ meetupPreference: e.target.value as any })}
                className="w-full px-4 py-2 border border-black rounded-lg bg-white"
              >
                <option value="public-only">Public places only</option>
                <option value="public-first">Public first, open later</option>
                <option value="comfortable-either">I'm comfortable either way</option>
              </select>
            </div>

            {/* Boundaries */}
            <div>
              <label className="block mb-2 font-medium">Boundaries (optional)</label>
              <textarea
                value={userProfile.boundaries || ''}
                onChange={(e) => onUpdateProfile({ boundaries: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white resize-none"
                rows={3}
                placeholder='e.g., "No bars", "No late-night meets"'
              />
            </div>
          </div>
        </div>

        {/* Match Preferences */}
        <div className="bg-white border border-black rounded-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-black bg-[#f68c70]/20 flex items-center gap-3">
            <Bell size={20} />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Match Preferences
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Age Range */}
            <div>
              <label className="block mb-2 font-medium">Age range</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={userProfile.matchFilters.ageRange[0]}
                  onChange={(e) => onUpdateProfile({ 
                    matchFilters: { 
                      ...userProfile.matchFilters, 
                      ageRange: [parseInt(e.target.value) || 18, userProfile.matchFilters.ageRange[1]] 
                    } 
                  })}
                  min="18"
                  max="100"
                  className="w-24 px-3 py-2 border border-black rounded-lg"
                />
                <span>to</span>
                <input
                  type="number"
                  value={userProfile.matchFilters.ageRange[1]}
                  onChange={(e) => onUpdateProfile({ 
                    matchFilters: { 
                      ...userProfile.matchFilters, 
                      ageRange: [userProfile.matchFilters.ageRange[0], parseInt(e.target.value) || 30] 
                    } 
                  })}
                  min="18"
                  max="100"
                  className="w-24 px-3 py-2 border border-black rounded-lg"
                />
              </div>
            </div>

            {/* Verified Students Only */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#FFEBDA] border border-black rounded-lg">
                <input
                  type="checkbox"
                  checked={userProfile.verifiedStudentsOnly}
                  onChange={(e) => onUpdateProfile({ verifiedStudentsOnly: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Only show verified students</span>
              </label>
            </div>

            {/* Cultural Similarity */}
            <div>
              <label className="block mb-2 font-medium">Cultural similarity importance</label>
              <input
                type="range"
                min="0"
                max="100"
                value={userProfile.matchFilters.culturalSimilarity}
                onChange={(e) => onUpdateProfile({ 
                  matchFilters: { 
                    ...userProfile.matchFilters, 
                    culturalSimilarity: parseInt(e.target.value) 
                  } 
                })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-[#666666] mt-1">
                <span>Not important</span>
                <span>Very important</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white border border-black rounded-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-black bg-[#f6ac69]/20 flex items-center gap-3">
            <Lock size={20} />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Account
            </h3>
          </div>
          <div className="divide-y divide-black">
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors flex items-center justify-between">
              <span>Change password</span>
              <ChevronRight size={20} />
            </button>
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors flex items-center justify-between">
              <span>Email preferences</span>
              <ChevronRight size={20} />
            </button>
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors text-[#f55c7a] flex items-center justify-between">
              <span>Delete account</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white border border-black rounded-lg mb-6 overflow-hidden">
          <div className="p-4 border-b border-black bg-[#f57c73]/20 flex items-center gap-3">
            <HelpCircle size={20} />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Support
            </h3>
          </div>
          <div className="divide-y divide-black">
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors flex items-center justify-between">
              <span>Help center</span>
              <ChevronRight size={20} />
            </button>
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors flex items-center justify-between">
              <span>Contact us</span>
              <ChevronRight size={20} />
            </button>
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors flex items-center justify-between">
              <span>Terms of service</span>
              <ChevronRight size={20} />
            </button>
            <button className="w-full p-4 text-left hover:bg-[#FFEBDA] transition-colors flex items-center justify-between">
              <span>Privacy policy</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full mt-6 p-4 bg-[#f55c7a] text-white border border-black rounded-lg hover:bg-[#f57c73] transition-colors flex items-center justify-center gap-2">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}