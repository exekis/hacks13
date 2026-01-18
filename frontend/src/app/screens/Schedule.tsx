import React, { useState } from 'react';
import { motion } from 'motion/react';
import { mockUsers, mockPosts } from '@/app/data/mockData';
import { Plus, MessageCircle } from 'lucide-react';
import { WebPostCard } from '@/app/components/WebPostCard';
import { UserProfile } from '@/app/types/profile';

interface ScheduleProps {
  userId?: string;
  onBack: () => void;
  onRSVP?: (userId: string) => void;
}

export function Schedule({ userId, onRSVP }: ScheduleProps) {  
  // get user's posts
  const userPosts = mockPosts.filter(p => p.userId === (userId || '1'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  // for own profile, use userProfile data
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
        className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        
    {/* attending events section */}
        <motion.div className="space-y-4" variants={containerVariants}>
        <h3 className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
            <MessageCircle size={24} className="text-[#f55c7a]" />
            Events I'm Attending
        </h3>
        {userPosts.length > 0 ? (
            userPosts.map((post, index) => (
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
            <p className="text-[#666666]">You haven't RSVP-ed for any events yet</p>
            <p className="text-sm text-[#999] mt-1">Share your travel plans with the community!</p>
            </motion.div>
        )}
        </motion.div>
        
            
        {/* hosting events section */}
        <motion.div className="space-y-4" variants={containerVariants}>
        <h3 className="text-2xl flex items-center gap-2 pt-10" style={{ fontFamily: 'Castoro, serif' }}>
            <MessageCircle size={24} className="text-[#f55c7a]" />
            Events I'm Hosting
        </h3>

        {userPosts.length > 0 ? (
            userPosts.map((post, index) => (
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
            <p className="text-[#666666]">You haven't created any future events yet</p>
            <p className="text-sm text-[#999] mt-1">Share your travel plans with the community!</p>
            </motion.div>
        )}
        </motion.div>

    </motion.div>
        
    </div>
);
}
