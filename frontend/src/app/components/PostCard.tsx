import React from 'react';
import { Post, mockUsers } from '@/app/data/mockData';
import { Button, VerificationBadge, Avatar } from '@/app/components/DesignSystem';
import { MapPin, Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onAddFriend?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  friendRequested?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onAddFriend,
  onMessage,
  friendRequested = false
}) => {
  const user = mockUsers.find(u => u.id === post.userId);
  
  if (!user) return null;
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md">
      <div className="flex items-start gap-3 mb-3">
        <Avatar emoji={user.avatar} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#3d3430]">{user.name}</h4>
            {user.verified.student && <VerificationBadge type="student" />}
          </div>
          <p className="text-xs text-[#8c7a6f]">{post.timestamp}</p>
        </div>
      </div>
      
      <p className="text-[#3d3430] mb-3 leading-relaxed">{post.content}</p>
      
      {post.dateRange && (
        <div className="flex items-center gap-2 text-sm text-[#f68c70] mb-2 bg-[#fff5f0] px-3 py-2 rounded-2xl">
          <Calendar className="w-4 h-4" />
          <span>{post.dateRange.from} - {post.dateRange.to}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 text-xs text-[#8c7a6f] mb-4 italic">
        <MapPin className="w-3 h-3" />
        <span>{post.location} (exact location hidden until friends)</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={friendRequested ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => onAddFriend?.(post.userId)}
          className="flex-1"
        >
          {friendRequested ? '✓ Requested' : '+ Add friend'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onMessage?.(post.userId)}
          className="flex-1"
        >
          💬 Message
        </Button>
      </div>
    </div>
  );
};
