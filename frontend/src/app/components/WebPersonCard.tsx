import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserType } from '@/app/data/mockData';
import { User, MapPin, Heart, CheckCircle, Sparkles } from 'lucide-react';
import { Avatar } from '@/app/components/DesignSystem';

interface WebPersonCardProps {
  user: UserType;
  onAddFriend?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  isFriendRequested?: boolean;
}

export function WebPersonCard({ user, onAddFriend, onViewProfile, isFriendRequested }: WebPersonCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAddFriend = (userId: string) => {
    setShowConfetti(true);
    onAddFriend?.(userId);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  // color variants for tags
  const tagColors = [
    'bg-[#f6ac69]',
    'bg-[#f6bc66]',
    'bg-[#f68c70]',
  ];

  return (
    <motion.div 
      className="relative bg-white border border-black rounded-2xl p-5 overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -4,
        boxShadow: '0 12px 24px -8px rgba(245, 92, 122, 0.2)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* animated gradient border on hover */}
      <motion.div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69] opacity-0 -z-10"
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* confetti effect on add friend */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#f55c7a', '#f6ac69', '#f6bc66', '#f68c70'][i % 4],
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      {/* header with avatar and name */}
      <div className="flex items-start gap-4 mb-4">
        <motion.div 
          className="relative flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Avatar 
            src={user.avatar} 
            name={user.name}
            size="lg"
            className="border border-black"
          />
          {/* online indicator */}
          <motion.div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg truncate" style={{ fontFamily: 'Castoro, serif' }}>{user.name}</h3>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle size={16} className="text-[#f55c7a]" />
            </motion.div>
          </div>
          {user.pronouns && (
            <p className="text-sm text-[#666666] mb-1">{user.pronouns}</p>
          )}
          {user.location && (
            <motion.div 
              className="flex items-center gap-1 text-sm text-[#666666]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MapPin size={14} className="text-[#f55c7a]" />
              <span className="truncate">{user.location}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* bio */}
      <motion.p 
        className="text-sm mb-4 line-clamp-2 text-[#3d3430]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {user.bio}
      </motion.p>

      {/* tags with stagger animation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {user.goals.slice(0, 3).map((goal, index) => (
          <motion.span
            key={index}
            className={`px-3 py-1.5 text-sm border border-black rounded-full ${tagColors[index % tagColors.length]}`}
            style={{ fontFamily: 'Castoro, serif' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index + 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            {goal}
          </motion.span>
        ))}
      </div>

      {/* actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => onViewProfile?.(user.id)}
          className="flex-1 px-4 py-2.5 bg-white border border-black rounded-xl font-medium transition-all duration-200"
          whileHover={{ 
            backgroundColor: '#FFEBDA',
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
        >
          View Profile
        </motion.button>
        {onAddFriend && (
          <motion.button
            onClick={() => handleAddFriend(user.id)}
            disabled={isFriendRequested}
            className={`flex-1 px-4 py-2.5 border border-black rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
              isFriendRequested
                ? 'bg-[#666666] text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white'
            }`}
            whileHover={!isFriendRequested ? { scale: 1.02, boxShadow: '0 4px 12px rgba(245, 92, 122, 0.4)' } : {}}
            whileTap={!isFriendRequested ? { scale: 0.98 } : {}}
          >
            {isFriendRequested ? (
              <>
                <CheckCircle size={16} />
                Sent
              </>
            ) : (
              <>
                <Heart size={16} />
                Add Friend
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
