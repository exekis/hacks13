import React from 'react';
import { Post, mockUsers } from '@/app/data/mockData';
import { User, Clock, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface WebPostCardProps {
  post: Post;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function WebPostCard({ post, onMessage, onViewProfile }: WebPostCardProps) {
  const user = mockUsers.find(u => u.id === post.userId);
  
  if (!user) return null;

  return (
    <div className="bg-white border border-black rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div 
          className="w-12 h-12 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => onViewProfile?.(user.id)}
        >
          <User size={24} className="text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 
            className="text-base mb-0.5 cursor-pointer hover:underline"
            onClick={() => onViewProfile?.(user.id)}
          >
            {user.name}
          </h4>
          <div className="flex items-center gap-1 text-xs text-[#666666]">
            <Clock size={12} />
            <span>{post.timestamp}</span>
          </div>
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

      {/* Date range if present */}
      {post.dateRange && (
        <div className="mb-4 px-3 py-2 bg-[#f68c70] border border-black rounded-lg inline-block">
          <p className="text-sm" style={{ fontFamily: 'Castoro, serif' }}>
            {post.dateRange.from} - {post.dateRange.to}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-black">
        <p className="text-xs text-[#666666]">
          Location revealed after connection
        </p>
        {onMessage && (
          <button
            onClick={() => onMessage(user.id)}
            className="flex items-center gap-2 px-4 py-2 bg-[#f55c7a] text-white border border-black rounded-lg hover:bg-[#f57c73] transition-colors"
          >
            <MessageCircle size={16} />
            <span className="text-sm">Message</span>
          </button>
        )}
      </div>
    </div>
  );
}
