import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Post, mockUsers } from '@/app/data/mockData';
import { User, Clock, Bell, MapPin, Calendar, Users } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

interface WebPostCardProps {
  post: Post;
  onRSVP?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function WebPostCard({ post, onRSVP, onViewProfile }: WebPostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const user = mockUsers.find(u => u.id === post.userId);
  
  if (!user) {
    user = {
      id: post.userId,
      name: (post as any).authorName || 'Unknown User',
      avatar: '👤',
      verified: { student: false },
      age: 0,
      pronouns: '',
      role: 'Member',
      bio: '',
      interests: [],
      location: '',
      university: '',
      hobbies: []
    } as any;
  }
  
  // if (!user) return null; // Logic handled above

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

      {/* header */}
      <div className="flex items-start gap-3 mb-4">
        <motion.div 
          className="w-12 h-12 bg-gradient-to-br from-[#f6bc66] to-[#f6ac69] border border-black rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => onViewProfile?.(user.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <User size={24} className="text-black" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.h4 
            className="text-base mb-0.5 cursor-pointer hover:text-[#f55c7a] transition-colors"
            onClick={() => onViewProfile?.(user.id)}
            style={{ fontFamily: 'Castoro, serif' }}
          >
            {user.name}
          </motion.h4>
          <motion.div 
            className="flex items-center gap-1 text-xs text-[#666666]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            
          </motion.div>
        </motion.button>

        <div className="flex gap-2">
            <span style={{ fontFamily: 'Castoro, serif' }}>{post.capacity}</span>
            <Users 
              size={20} 
              className={isLiked ? 'text-[#f55c7a] fill-[#f55c7a]' : 'text-[#666666]'} 
            />
        </div>
        
        {/* like button */}
        <motion.button
          onClick={() => setIsLiked(!isLiked)}
          className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-[#f55c7a]/10' : 'hover:bg-[#FFEBDA]'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              size={20} 
              className={isLiked ? 'text-[#f55c7a] fill-[#f55c7a]' : 'text-[#666666]'} 
            />
          </motion.div>
        </motion.button>
      </div>

      {/* content */}
      <motion.p 
        className="text-sm mb-4 whitespace-pre-wrap text-[#3d3430] leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {post.content}
      </motion.p>

      {/* image if present */}
      {post.image && (
        <motion.div 
          className="mb-4 border border-black rounded-xl overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <ImageWithFallback 
            src={post.image} 
            alt="Post image"
            className="w-full h-48 object-cover"
          />
        </motion.div>
      )}

      {/* date range if present */}
      <div className="flex gap-2">
        {post.dateRange && (
          <motion.div 
            className="mb-4 px-4 py-2.5 bg-gradient-to-r from-[#f68c70] to-[#f6ac69] border border-black rounded-xl inline-flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Calendar size={14} className="text-white" />
            <p className="text-sm text-white" style={{ fontFamily: 'Castoro, serif' }}>
              {post.dateRange.from} - {post.dateRange.to}
            </p>
          </motion.div>
        )}

        {post.timeRange && (
          <motion.div 
            className="mb-4 px-4 py-2.5 bg-gradient-to-r from-[#f68c70] to-[#f6ac69] border border-black rounded-xl inline-flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Calendar size={14} className="text-white" />
            <p className="text-sm text-white" style={{ fontFamily: 'Castoro, serif' }}>
              {post.timeRange.from} - {post.timeRange.to}
            </p>
          </motion.div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between pt-4 border-t border-black/10">
        <motion.div 
          className="flex items-center gap-1.5 text-xs text-[#666666]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <MapPin size={12} className="text-[#f55c7a]" />
          <span>{post.location}</span>
        </motion.div>
        
        <motion.button
          onClick={() => onRSVP(user.id)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white border border-black rounded-xl shadow-sm"
          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(245, 92, 122, 0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Bell size={16} />
          <span className="text-sm font-medium">RSVP</span>
        </motion.button>
        
      </div>
    </div>
  );
}
