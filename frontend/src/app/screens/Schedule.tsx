import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, MessageCircle, CalendarDays, MapPin } from 'lucide-react';
import { WebPostCard } from '@/app/components/WebPostCard';
import { fetchHostedPosts, fetchAttendingPosts, PostEvent } from '@/api/posts';
import { Post } from '@/app/data/mockData';

interface ScheduleProps {
  userId?: string;
  onBack: () => void;
  onRSVP?: (postId: string, userId: string, userName?: string, userAvatar?: string) => void;
  onMessage?: (userId: string, userName?: string, userAvatar?: string) => void;
}

// helper to convert api post to Post type for WebPostCard
function convertToPost(apiPost: PostEvent): Post & { authorName?: string; authorLocation?: string } {
  return {
    id: String(apiPost.postid),
    userId: String(apiPost.user_id),
    content: apiPost.post_content,
    location: apiPost.location_str || '',
    dateRange: {
      from: apiPost.start_time ? new Date(apiPost.start_time).toLocaleDateString() : '',
      to: apiPost.end_time ? new Date(apiPost.end_time).toLocaleDateString() : ''
    },
    timeRange: {
      from: apiPost.start_time ? new Date(apiPost.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      to: apiPost.end_time ? new Date(apiPost.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    },
    timestamp: apiPost.time_posted || '',
    capacity: apiPost.capacity || 0,
    authorName: apiPost.author_name,
    authorLocation: apiPost.author_location || undefined
  };
}

export function Schedule({ userId, onRSVP, onMessage }: ScheduleProps) {  
  const [attendingPosts, setAttendingPosts] = useState<PostEvent[]>([]);
  const [hostedPosts, setHostedPosts] = useState<PostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const numericUserId = parseInt(userId, 10);
        
        const [attending, hosted] = await Promise.all([
          fetchAttendingPosts(numericUserId),
          fetchHostedPosts(numericUserId)
        ]);
        
        setAttendingPosts(attending);
        setHostedPosts(hosted);
        setError(null);
      } catch (err) {
        console.error('Error loading schedule posts:', err);
        setError('Failed to load your schedule');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [userId]);

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
            <CalendarDays size={24} className="text-[#f55c7a]" />
            Events I'm Attending
        </h3>
        {loading ? (
            <motion.div 
            className="bg-white border border-black rounded-2xl p-8 text-center"
            variants={itemVariants}
            >
            <p className="text-[#666666]">Loading your schedule...</p>
            </motion.div>
        ) : attendingPosts.length > 0 ? (
            attendingPosts.map((apiPost) => {
            const post = convertToPost(apiPost);
            return (
                <motion.div key={post.id} variants={itemVariants}>
                <WebPostCard
                    post={post}
                    onRSVP={onRSVP}
                    onMessage={onMessage}
                    onViewProfile={() => {}}
                />
                {apiPost.location_str && (
                    <div className="mt-2 ml-4 flex items-center gap-2 text-sm text-[#666666]">
                    <MapPin size={14} className="text-[#f55c7a]" />
                    <span>{apiPost.location_str}</span>
                    </div>
                )}
                </motion.div>
            );
            })
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
            <p className="text-[#666666]">You haven't RSVP'd to any events yet</p>
            <p className="text-sm text-[#999] mt-1">Browse the feed and RSVP to events that interest you!</p>
            </motion.div>
        )}
        </motion.div>
        
            
        {/* hosting events section */}
        <motion.div className="space-y-4" variants={containerVariants}>
        <h3 className="text-2xl flex items-center gap-2 pt-10" style={{ fontFamily: 'Castoro, serif' }}>
            <MessageCircle size={24} className="text-[#f55c7a]" />
            Events I'm Hosting
        </h3>

        {loading ? (
            <motion.div 
            className="bg-white border border-black rounded-2xl p-8 text-center"
            variants={itemVariants}
            >
            <p className="text-[#666666]">Loading your events...</p>
            </motion.div>
        ) : hostedPosts.length > 0 ? (
            hostedPosts.map((apiPost) => {
            const post = convertToPost(apiPost);
            return (
                <motion.div key={post.id} variants={itemVariants}>
                <WebPostCard
                    post={post}
                    onViewProfile={() => {}}
                />
                {apiPost.location_str && (
                    <div className="mt-2 ml-4 flex items-center gap-2 text-sm text-[#666666]">
                    <MapPin size={14} className="text-[#f55c7a]" />
                    <span>{apiPost.location_str}</span>
                    </div>
                )}
                </motion.div>
            );
            })
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
            <p className="text-[#666666]">You haven't created any events yet</p>
            <p className="text-sm text-[#999] mt-1">Create an event to share your travel plans!</p>
            </motion.div>
        )}
        </motion.div>

    </motion.div>
        
    </div>
);
}
