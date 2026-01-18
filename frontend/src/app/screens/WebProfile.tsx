import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPosts, Post } from '@/app/data/mockData';
import { User, MapPin, Edit, Plus, Globe, ArrowLeft, CheckCircle, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { WebPostCard } from '@/app/components/WebPostCard';
import { UserProfile } from '@/app/types/profile';
import { fetchUserPosts, PostResponse } from '@/api/posts';
import { fetchUserProfile } from '@/api/auth';

interface WebProfileProps {
  userId?: string;
  userProfile: UserProfile;
  onBack: () => void;
  onRSVP?: (userId: string) => void;
  onCreatePost?: () => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onMessage?: (userId: string, userName: string, userAvatar?: string) => void;
}

export function WebProfile({ userId, userProfile, onBack, onRSVP, onCreatePost, onUpdateProfile, onMessage }: WebProfileProps) {
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [ownPosts, setOwnPosts] = useState<Post[]>([]);
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
  
  const currentUserId = localStorage.getItem('user_id');
  
  const isOwnProfile = !userId || userId === currentUserId;

  useEffect(() => {
    if (!isOwnProfile && userId) {
      fetchUserProfile(userId)
        .then(profile => setViewedProfile(profile))
        .catch(err => console.error("Failed to fetch user profile", err));
    }
  }, [userId, isOwnProfile]);

  const displayUser = isOwnProfile ? userProfile : viewedProfile;
  
  useEffect(() => {
    if (isOwnProfile && currentUserId) {
      fetchUserPosts(currentUserId).then((posts: PostResponse[]) => {
        
        const transformed: Post[] = posts.map(p => ({
          id: p.id,
            userId: p.user_id,
            content: p.post_content,
            location: p.location_str,
            timestamp: new Date(p.time_posted).toLocaleString(),
            capacity: p.capacity,
            authorName: p.author_name,
            authorLocation: p.author_location,
            dateRange: { from: '', to: '' },
            timeRange: { from: '', to: '' }
        }));
        setOwnPosts(transformed);
      }).catch(() => {
        setOwnPosts([]);
      });
    }
  }, [isOwnProfile, currentUserId, userProfile?.fullName]);
          
  const userPosts = isOwnProfile ? ownPosts : mockPosts.filter(p => p.userId === userId);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  if (isOwnProfile) {
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
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <motion.div 
          className="max-w-3xl mx-auto px-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* profile header */}
          <motion.div 
            className="bg-white border border-black rounded-2xl p-8 mb-6 relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ boxShadow: '0 12px 24px -8px rgba(245, 92, 122, 0.15)' }}
          >
            {/* decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#f55c7a]/10 via-[#f68c70]/10 to-[#f6ac69]/10" />
            
            <div className="relative flex items-start gap-6 mb-6">
              <motion.div 
                className="relative w-24 h-24 bg-gradient-to-br from-[#f6bc66] to-[#f6ac69] border-2 border-black rounded-full flex items-center justify-center text-5xl flex-shrink-0 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <User size={48} className="text-black" />
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] rounded-full flex items-center justify-center border-2 border-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle size={16} className="text-white" />
                </motion.div>
              </motion.div>
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-3xl mb-1" style={{ fontFamily: 'Castoro, serif' }}>{userProfile.fullName}</h2>
                    {userProfile.pronouns && (
                      <p className="text-[#666666] mb-2">{userProfile.pronouns}</p>
                    )}
                  </div>
                  <motion.button 
                    className="px-4 py-2 bg-white border border-black rounded-xl hover:bg-[#FFEBDA] transition-colors flex items-center gap-2 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit size={16} />
                    Edit Profile
                  </motion.button>
                </div>
                <motion.div 
                  className="flex items-center gap-2 text-[#666666] mb-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MapPin size={16} className="text-[#f55c7a]" />
                  <span>{userProfile.currentCity}</span>
                </motion.div>
                {userProfile.travelingTo && (
                  <motion.div 
                    className="flex items-center gap-2 text-[#666666] mb-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Globe size={16} className="text-[#f6ac69]" />
                    <span>Traveling to: {userProfile.travelingTo}</span>
                  </motion.div>
                )}
                {userProfile.isStudent && userProfile.university && (
                  <p className="text-[#666666] mb-2">{userProfile.university}</p>
                )}
                <p className="text-sm text-[#666666]">{userProfile.age} years old</p>
              </div>
            </div>

            {/* bio */}
            <motion.p 
              className="mb-6 text-[#3d3430] leading-relaxed"
              variants={itemVariants}
            >
              {userProfile.bio}
            </motion.p>

            {/* looking for */}
            {userProfile.lookingFor && userProfile.lookingFor.length > 0 && (
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
                  <Heart size={18} className="text-[#f55c7a]" />
                  Looking for
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.lookingFor.map((goal, index) => (
                    <motion.span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-[#f6ac69] to-[#f6bc66] border border-black rounded-full shadow-sm"
                      style={{ fontFamily: 'Castoro, serif' }}
                      variants={tagVariants}
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {goal}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* interests */}
            {userProfile.interests && userProfile.interests.length > 0 && (
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
                  <Sparkles size={18} className="text-[#f68c70]" />
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <motion.span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-[#f68c70] to-[#f6ac69] border border-black rounded-full shadow-sm"
                      style={{ fontFamily: 'Castoro, serif' }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* languages */}
            {userProfile.languages && userProfile.languages.length > 0 && (
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
                  <Globe size={18} className="text-[#f6bc66]" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.languages.map((lang, index) => (
                    <motion.span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-[#f6bc66] to-[#f6ac69] border border-black rounded-full shadow-sm"
                      style={{ fontFamily: 'Castoro, serif' }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {lang}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* cultural background */}
            {userProfile.culturalIdentity && userProfile.culturalIdentity.length > 0 && (
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-lg mb-3" style={{ fontFamily: 'Castoro, serif' }}>Cultural Background</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.culturalIdentity.map((bg, index) => (
                    <motion.span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-[#f57c73] to-[#f68c70] border border-black rounded-full shadow-sm"
                      style={{ fontFamily: 'Castoro, serif' }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {bg}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* badges */}
            {userProfile.badges && userProfile.badges.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-lg mb-3" style={{ fontFamily: 'Castoro, serif' }}>Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.badges.map((badge, index) => (
                    <motion.span
                      key={index}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-full shadow-sm"
                      style={{ fontFamily: 'Castoro, serif' }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* age preferences */}
          <motion.div 
            className="bg-white border border-black rounded-2xl p-6 mb-6 overflow-hidden"
            variants={itemVariants}
            whileHover={{ boxShadow: '0 8px 20px -8px rgba(245, 92, 122, 0.15)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>Match Preferences</h3>
              <motion.button
                onClick={() => setIsEditingAge(!isEditingAge)}
                className="px-4 py-2 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-xl text-sm shadow-sm"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(245, 92, 122, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                {isEditingAge ? 'Save' : 'Edit'}
              </motion.button>
            </div>
            <AnimatePresence mode="wait">
              {isEditingAge && onUpdateProfile ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
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
                      className="w-20 px-3 py-2 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
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
                      className="w-20 px-3 py-2 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                      min="18"
                      max="100"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userProfile.verifiedStudentsOnly}
                      onChange={(e) => onUpdateProfile({ verifiedStudentsOnly: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#f55c7a]"
                    />
                    <span className="text-sm">Verified students only</span>
                  </label>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-[#666666]">
                    Age range: {userProfile.matchFilters.ageRange[0]} - {userProfile.matchFilters.ageRange[1]}
                  </p>
                  {userProfile.verifiedStudentsOnly && (
                    <div className="flex items-center gap-2 text-[#666666]">
                      <CheckCircle size={14} className="text-[#f55c7a]" />
                      <span>Only showing verified students</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* posts section */}
          <motion.div 
            className="mb-6 flex items-center justify-between"
            variants={itemVariants}
          >
            <h3 className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
              <MessageCircle size={24} className="text-[#f55c7a]" />
              My Posts
            </h3>
            <motion.button
              onClick={onCreatePost}
              className="px-5 py-2.5 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-xl flex items-center gap-2 shadow-md"
              whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(245, 92, 122, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} />
              New Post
            </motion.button>
          </motion.div>

          <motion.div className="space-y-4" variants={containerVariants}>
            {ownPosts.length > 0 ? (
              ownPosts.map((post, index) => (
                <motion.div key={post.id} variants={itemVariants}>
                  <WebPostCard
                    post={post}
                    onRSVP={onRSVP}
                    onViewProfile={() => {}}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="bg-white border border-black rounded-2xl p-8 text-center"
                variants={itemVariants}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#f55c7a]/20 to-[#f6ac69]/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Plus className="w-8 h-8 text-[#f55c7a]" />
                </motion.div>
                <p className="text-[#666666]">You haven't created any posts yet</p>
                <p className="text-sm text-[#999] mt-1">Share your travel plans with the community!</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!displayUser) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEBDA] via-[#fff5ef] to-[#FFEBDA] py-8 relative overflow-hidden">
      {/* animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-[#f55c7a]/5 -top-48 -right-48"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div 
        className="max-w-3xl mx-auto px-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* back button */}
        <motion.button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white border border-black rounded-xl flex items-center gap-2 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, x: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* profile header */}
        <motion.div 
          className="bg-white border border-black rounded-2xl p-8 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        >
          {/* decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#f55c7a]/10 via-[#f68c70]/10 to-[#f6ac69]/10" />
          
          <div className="relative flex items-start gap-6 mb-6">
            <motion.div 
              className="relative w-24 h-24 bg-gradient-to-br from-[#f6bc66] to-[#f6ac69] border-2 border-black rounded-full flex items-center justify-center text-5xl flex-shrink-0 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <User size={48} className="text-black" />
              <motion.div 
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] rounded-full flex items-center justify-center border-2 border-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <CheckCircle size={16} className="text-white" />
              </motion.div>
            </motion.div>
            <div className="flex-1 pt-2">
              <motion.h2 
                className="text-3xl mb-1"
                style={{ fontFamily: 'Castoro, serif' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {displayUser.fullName}
              </motion.h2>
              {displayUser.pronouns && (
                <p className="text-[#666666] mb-2">{displayUser.pronouns}</p>
              )}
              {displayUser.currentCity && (
                <motion.div 
                  className="flex items-center gap-2 text-[#666666] mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MapPin size={16} className="text-[#f55c7a]" />
                  <span>{displayUser.currentCity}</span>
                </motion.div>
              )}
              {displayUser.university && (
                <p className="text-[#666666] mb-4">{displayUser.university}</p>
              )}
              
              {/* action buttons for other profiles */}
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={() => onMessage?.(userId || '', displayUser.fullName || '', undefined)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-xl flex items-center gap-2 shadow-md"
                  whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(245, 92, 122, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle size={16} />
                  Message
                </motion.button>
                <motion.button
                  className="px-5 py-2.5 bg-white border border-black rounded-xl flex items-center gap-2"
                  whileHover={{ scale: 1.02, backgroundColor: '#FFEBDA' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart size={16} />
                  Add Friend
                </motion.button>
              </div>
            </div>
          </div>

          {/* bio */}
          <motion.p 
            className="mb-6 text-[#3d3430] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {displayUser.bio}
          </motion.p>

          {/* goals and interests */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
              <Sparkles size={18} className="text-[#f68c70]" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {displayUser.lookingFor.map((goal, index) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-[#f6ac69] to-[#f6bc66] border border-black rounded-full shadow-sm"
                  style={{ fontFamily: 'Castoro, serif' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  {goal}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* languages */}
          {displayUser.languages && displayUser.languages.length > 0 && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
                <Globe size={18} className="text-[#f6bc66]" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayUser.languages.map((lang, index) => (
                  <motion.span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#f68c70] to-[#f6ac69] border border-black rounded-full shadow-sm"
                    style={{ fontFamily: 'Castoro, serif' }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    {lang}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* cultural background */}
          {displayUser.culturalIdentity && displayUser.culturalIdentity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg mb-3" style={{ fontFamily: 'Castoro, serif' }}>Cultural Background</h3>
              <div className="flex flex-wrap gap-2">
                {displayUser.culturalIdentity.map((bg, index) => (
                  <motion.span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#f6bc66] to-[#f6ac69] border border-black rounded-full shadow-sm"
                    style={{ fontFamily: 'Castoro, serif' }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    {bg}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* posts section */}
        <motion.h3 
          className="text-2xl mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Castoro, serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <MessageCircle size={24} className="text-[#f55c7a]" />
          {displayUser.fullName.split(' ')[0]}'s Posts
        </motion.h3>

        <div className="space-y-4">
          {ownPosts.length > 0 ? (
            ownPosts.map((post, index) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <WebPostCard
                  post={post}
                  onRSVP={onRSVP}
                  onViewProfile={() => {}}
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="bg-white border border-black rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-[#666666]">No posts yet</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
