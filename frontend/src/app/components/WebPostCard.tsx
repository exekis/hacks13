import React from 'react';
import { Post, mockUsers } from '@/app/data/mockData';
import { User, Clock, Bell, MapPin, Calendar, Users } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

// extended post type that can include author info from api
interface ExtendedPost extends Post {
  authorName?: string;
  authorLocation?: string;
}

interface WebPostCardProps {
  post: Post;
  onRSVP?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function WebPostCard({ post, onRSVP, onViewProfile }: WebPostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const user = mockUsers.find(u => u.id === post.userId);
  
  // use author name from api if available, otherwise from mock data
  const authorName = post.authorName || mockUser?.name || `User ${post.userId}`;
  
  // only render if we have valid author info
  const hasValidAuthor = post.authorName || mockUser;

  return (
    <div className="bg-white border border-black rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div 
          className="w-12 h-12 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => onViewProfile?.(post.userId)}
        >
          <User size={24} className="text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 
            className="text-base mb-0.5 cursor-pointer hover:underline"
            onClick={() => onViewProfile?.(post.userId)}
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
      </div>

      {/* Content */}
      <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Image if present */}
      {post.image && (
        <div className="mb-4 border border-black rounded-lg overflow-hidden">
          <ImageWithFallback 
            src={post.image} 
            alt="Post image"
            className="w-full h-48 object-cover"
          />
        </div>
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
