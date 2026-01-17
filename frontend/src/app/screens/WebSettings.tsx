import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Bell, Lock, HelpCircle, LogOut, ChevronRight, ArrowLeft, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { UserProfile } from '@/app/types/profile';

interface WebSettingsProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export function WebSettings({ userProfile, onBack, onUpdateProfile }: WebSettingsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
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
        {/* header */}
        <motion.button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-white border border-black rounded-xl flex items-center gap-2 shadow-sm"
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <motion.div
          className="flex items-center gap-3 mb-8"
          variants={itemVariants}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <SettingsIcon className="w-8 h-8 text-[#f55c7a]" />
          </motion.div>
          <h2 className="text-3xl bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69] bg-clip-text text-transparent" style={{ fontFamily: 'Castoro, serif' }}>
            Settings
          </h2>
        </motion.div>

        {/* safety and privacy settings */}
        <motion.div
          className="bg-white border border-black rounded-2xl mb-6 overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 20px -8px rgba(245, 92, 122, 0.15)' }}
        >
          <div className="p-4 border-b border-black bg-gradient-to-r from-[#f6bc66]/20 to-[#f6ac69]/10 flex items-center gap-3">
            <Shield size={20} className="text-[#f6bc66]" />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Safety & Privacy
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* who can message */}
            <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <label className="block mb-2 font-medium">Who can message you?</label>
              <select


                className="w-full px-4 py-2.5 border border-black rounded-xl bg-white focus:ring-2 focus:ring-[#f55c7a]/30 outline-none transition-all"
              >
                <option value="friends">Friends only</option>
                <option value="friends-of-friends">Friends-of-friends</option>
                <option value="anyone-verified">Anyone verified</option>
              </select>
            </motion.div>

            {/* who can see posts */}
            <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <label className="block mb-2 font-medium">Who can see your posts?</label>
              <select
                value={userProfile.whoCanSeePosts}
                onChange={(e) => onUpdateProfile({ whoCanSeePosts: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-black rounded-xl bg-white focus:ring-2 focus:ring-[#f55c7a]/30 outline-none transition-all"
              >
                <option value="friends">Friends</option>
                <option value="friends-of-friends">Friends-of-friends</option>
                <option value="everyone-verified">Everyone verified</option>
              </select>
            </motion.div>

            {/* hide location */}
            <motion.label
              className="flex items-center gap-3 cursor-pointer p-3 bg-gradient-to-r from-[#FFEBDA] to-[#fff5ef] border border-black rounded-xl"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="checkbox"
                checked={userProfile.hideLocationUntilFriends}
                onChange={(e) => onUpdateProfile({ hideLocationUntilFriends: e.target.checked })}
                className="w-5 h-5 rounded accent-[#f55c7a]"
              />
              <span>Hide exact location until we're friends</span>
            </motion.label>

            {/* meetup preference */}
            <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <label className="block mb-2 font-medium">Preferred meetup type</label>
              <select
                value={userProfile.meetupPreference}
                onChange={(e) => onUpdateProfile({ meetupPreference: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-black rounded-xl bg-white focus:ring-2 focus:ring-[#f55c7a]/30 outline-none transition-all"
              >
                <option value="public-only">Public places only</option>
                <option value="public-first">Public first, open later</option>
                <option value="comfortable-either">I'm comfortable either way</option>
              </select>
            </motion.div>

            {/* boundaries */}
            <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <label className="block mb-2 font-medium">Boundaries (optional)</label>
              <textarea
                value={userProfile.boundaries || ''}
                onChange={(e) => onUpdateProfile({ boundaries: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-xl bg-white resize-none focus:ring-2 focus:ring-[#f55c7a]/30 outline-none transition-all"
                rows={3}
                placeholder='e.g., "No bars", "No late-night meets"'
              />
            </motion.div>
          </div>
        </motion.div>

        {/* match preferences */}
        <motion.div
          className="bg-white border border-black rounded-2xl mb-6 overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 20px -8px rgba(245, 92, 122, 0.15)' }}
        >
          <div className="p-4 border-b border-black bg-gradient-to-r from-[#f68c70]/20 to-[#f6ac69]/10 flex items-center gap-3">
            <Bell size={20} className="text-[#f68c70]" />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Match Preferences
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* age range */}
            <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
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
                  className="w-24 px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
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
                  className="w-24 px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
              </div>
            </motion.div>

            {/* verified students only */}
            <motion.label
              className="flex items-center gap-3 cursor-pointer p-3 bg-gradient-to-r from-[#FFEBDA] to-[#fff5ef] border border-black rounded-xl"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="checkbox"
                checked={userProfile.verifiedStudentsOnly}
                onChange={(e) => onUpdateProfile({ verifiedStudentsOnly: e.target.checked })}
                className="w-5 h-5 rounded accent-[#f55c7a]"
              />
              <span>Only show verified students</span>
            </motion.label>

            {/* cultural similarity */}
            <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
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
                className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-[#f6bc66] to-[#f55c7a] cursor-pointer"
              />
              <div className="flex justify-between text-sm text-[#666666] mt-1">
                <span>Not important</span>
                <span>Very important</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* account settings */}
        <motion.div
          className="bg-white border border-black rounded-2xl mb-6 overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 20px -8px rgba(245, 92, 122, 0.15)' }}
        >
          <div className="p-4 border-b border-black bg-gradient-to-r from-[#f6ac69]/20 to-[#f6bc66]/10 flex items-center gap-3">
            <Lock size={20} className="text-[#f6ac69]" />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Account
            </h3>
          </div>
          <div className="divide-y divide-black/10">
            {['Change password', 'Email preferences'].map((item, index) => (
              <motion.button
                key={item}
                className="w-full p-4 text-left hover:bg-[#FFEBDA]/50 transition-colors flex items-center justify-between"
                whileHover={{ x: 4, backgroundColor: 'rgba(255, 235, 218, 0.5)' }}
                whileTap={{ scale: 0.99 }}
              >
                <span>{item}</span>
                <ChevronRight size={20} className="text-[#666666]" />
              </motion.button>
            ))}
            <motion.button
              className="w-full p-4 text-left text-[#f55c7a] flex items-center justify-between"
              whileHover={{ x: 4, backgroundColor: 'rgba(245, 92, 122, 0.05)' }}
              whileTap={{ scale: 0.99 }}
            >
              <span>Delete account</span>
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* support */}
        <motion.div
          className="bg-white border border-black rounded-2xl mb-6 overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 8px 20px -8px rgba(245, 92, 122, 0.15)' }}
        >
          <div className="p-4 border-b border-black bg-gradient-to-r from-[#f57c73]/20 to-[#f68c70]/10 flex items-center gap-3">
            <HelpCircle size={20} className="text-[#f57c73]" />
            <h3 className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Support
            </h3>
          </div>
          <div className="divide-y divide-black/10">
            {['Help center', 'Contact us', 'Terms of service', 'Privacy policy'].map((item) => (
              <motion.button
                key={item}
                className="w-full p-4 text-left hover:bg-[#FFEBDA]/50 transition-colors flex items-center justify-between"
                whileHover={{ x: 4, backgroundColor: 'rgba(255, 235, 218, 0.5)' }}
                whileTap={{ scale: 0.99 }}
              >
                <span>{item}</span>
                <ChevronRight size={20} className="text-[#666666]" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* logout button */}
        <motion.button
          className="w-full mt-6 p-4 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-xl flex items-center justify-center gap-2 shadow-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.01, boxShadow: '0 8px 20px rgba(245, 92, 122, 0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </motion.button>
      </motion.div>
    </div>
  );
}