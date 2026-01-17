import React, { useState } from 'react';
import { mockUsers, mockPosts } from '@/app/data/mockData';
import { User, MapPin, Edit, Plus, Globe } from 'lucide-react';
import { WebPostCard } from '@/app/components/WebPostCard';
import { UserProfile } from '@/app/types/profile';

interface WebProfileProps {
  userId?: string;
  userProfile: UserProfile;
  onBack: () => void;
  onMessage?: (userId: string) => void;
  onCreatePost?: () => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export function WebProfile({ userId, userProfile, onBack, onMessage, onCreatePost, onUpdateProfile }: WebProfileProps) {
  const [isEditingAge, setIsEditingAge] = useState(false);
  
  // If viewing someone else's profile, show their mock data
  const isOwnProfile = !userId || userId === '1';
  const displayUser = isOwnProfile ? null : mockUsers.find(u => u.id === userId);
  
  // Get user's posts
  const userPosts = mockPosts.filter(p => p.userId === (userId || '1'));

  // For own profile, use userProfile data
  if (isOwnProfile) {
    return (
      <div className="min-h-screen bg-[#FFEBDA] py-8">
        <div className="max-w-3xl mx-auto px-6">
          {/* Profile Header */}
          <div className="bg-white border border-black rounded-lg p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center text-5xl flex-shrink-0">
                <User size={48} className="text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-3xl mb-1">{userProfile.fullName}</h2>
                    {userProfile.pronouns && (
                      <p className="text-[#666666] mb-2">{userProfile.pronouns}</p>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center gap-2">
                    <Edit size={16} />
                    Edit Profile
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[#666666] mb-2">
                  <MapPin size={16} />
                  <span>{userProfile.currentCity}</span>
                </div>
                {userProfile.travelingTo && (
                  <div className="flex items-center gap-2 text-[#666666] mb-2">
                    <Globe size={16} />
                    <span>Traveling to: {userProfile.travelingTo}</span>
                  </div>
                )}
                {userProfile.isStudent && userProfile.university && (
                  <p className="text-[#666666] mb-2">{userProfile.university}</p>
                )}
                <p className="text-sm text-[#666666]">{userProfile.age} years old</p>
              </div>
            </div>

            {/* Bio */}
            <p className="mb-6">{userProfile.bio}</p>

            {/* Looking For */}
            {userProfile.lookingFor && userProfile.lookingFor.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg mb-3">Looking for</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.lookingFor.map((goal, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#f6ac69] border border-black rounded-full"
                      style={{ fontFamily: 'Castoro, serif' }}
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {userProfile.interests && userProfile.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#f68c70] border border-black rounded-full"
                      style={{ fontFamily: 'Castoro, serif' }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {userProfile.languages && userProfile.languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#f6bc66] border border-black rounded-full"
                      style={{ fontFamily: 'Castoro, serif' }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Background */}
            {userProfile.culturalIdentity && userProfile.culturalIdentity.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg mb-3">Cultural Background</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.culturalIdentity.map((bg, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#f57c73] border border-black rounded-full"
                      style={{ fontFamily: 'Castoro, serif' }}
                    >
                      {bg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {userProfile.badges && userProfile.badges.length > 0 && (
              <div>
                <h3 className="text-lg mb-3">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-[#f55c7a] text-white border border-black rounded-full"
                      style={{ fontFamily: 'Castoro, serif' }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Age Preferences */}
          <div className="bg-white border border-black rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Match Preferences</h3>
              <button
                onClick={() => setIsEditingAge(!isEditingAge)}
                className="px-3 py-1.5 bg-[#f55c7a] text-white border border-black rounded-lg text-sm hover:bg-[#f57c73] transition-colors"
              >
                {isEditingAge ? 'Save' : 'Edit'}
              </button>
            </div>
            {isEditingAge && onUpdateProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm">Age range:</label>
                  <input
                    type="number"
                    value={userProfile.matchFilters.ageRange[0]}
                    onChange={(e) => onUpdateProfile({ 
                      matchFilters: { 
                        ...userProfile.matchFilters, 
                        ageRange: [parseInt(e.target.value) || 18, userProfile.matchFilters.ageRange[1]] 
                      } 
                    })}
                    className="w-20 px-3 py-2 border border-black rounded-lg"
                    min="18"
                    max="100"
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
                    className="w-20 px-3 py-2 border border-black rounded-lg"
                    min="18"
                    max="100"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userProfile.verifiedStudentsOnly}
                    onChange={(e) => onUpdateProfile({ verifiedStudentsOnly: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Verified students only</span>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[#666666]">
                  Age range: {userProfile.matchFilters.ageRange[0]} - {userProfile.matchFilters.ageRange[1]}
                </p>
                {userProfile.verifiedStudentsOnly && (
                  <p className="text-[#666666]">Only showing verified students</p>
                )}
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl">My Posts</h3>
            <button
              onClick={onCreatePost}
              className="px-4 py-2 bg-[#f55c7a] text-white border border-black rounded-lg hover:bg-[#f57c73] transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Post
            </button>
          </div>

          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <WebPostCard
                  key={post.id}
                  post={post}
                  onMessage={onMessage}
                  onViewProfile={() => {}}
                />
              ))
            ) : (
              <div className="bg-white border border-black rounded-lg p-8 text-center">
                <p className="text-[#666666]">You haven't created any posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Viewing someone else's profile - show mock data
  if (!displayUser) return null;

  return (
    <div className="min-h-screen bg-[#FFEBDA] py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white border border-black rounded-lg hover:bg-[#f6bc66]/20 transition-colors"
        >
          ← Back
        </button>

        {/* Profile Header */}
        <div className="bg-white border border-black rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center text-5xl flex-shrink-0">
              <User size={48} className="text-black" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl mb-1">{displayUser.name}</h2>
              {displayUser.pronouns && (
                <p className="text-[#666666] mb-2">{displayUser.pronouns}</p>
              )}
              {displayUser.location && (
                <div className="flex items-center gap-2 text-[#666666] mb-4">
                  <MapPin size={16} />
                  <span>{displayUser.location}</span>
                </div>
              )}
              {displayUser.university && (
                <p className="text-[#666666] mb-4">{displayUser.university}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="mb-6">{displayUser.bio}</p>

          {/* Goals/Interests */}
          <div className="mb-6">
            <h3 className="text-lg mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {displayUser.goals.map((goal, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#f6ac69] border border-black rounded-full"
                  style={{ fontFamily: 'Castoro, serif' }}
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          {displayUser.languages && displayUser.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {displayUser.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#f68c70] border border-black rounded-full"
                    style={{ fontFamily: 'Castoro, serif' }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Background */}
          {displayUser.culturalBackground && displayUser.culturalBackground.length > 0 && (
            <div>
              <h3 className="text-lg mb-3">Cultural Background</h3>
              <div className="flex flex-wrap gap-2">
                {displayUser.culturalBackground.map((bg, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#f6bc66] border border-black rounded-full"
                    style={{ fontFamily: 'Castoro, serif' }}
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <h3 className="text-2xl mb-6">{displayUser.name.split(' ')[0]}'s Posts</h3>

        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <WebPostCard
                key={post.id}
                post={post}
                onMessage={onMessage}
                onViewProfile={() => {}}
              />
            ))
          ) : (
            <div className="bg-white border border-black rounded-lg p-8 text-center">
              <p className="text-[#666666]">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}