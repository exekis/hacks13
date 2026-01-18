import React from 'react';
import { User } from '@/app/data/mockData';
import { Button, Tag, VerificationBadge, Avatar } from '@/app/components/DesignSystem';
import { MapPin, Users } from 'lucide-react';

interface PersonCardProps {
  user: User;
  onAddFriend?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  friendRequested?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  user,
  onAddFriend,
  onViewProfile,
  friendRequested = false
}) => {
  return (
    <div 
      className="bg-white rounded-3xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewProfile?.(user.id)}
    >
      <div className="flex items-start gap-4">
        <Avatar src={user.avatar} name={user.name} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-lg text-[#3d3430]">{user.name}</h3>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            {user.verified.student && <VerificationBadge type="student" />}
            {user.verified.age && <VerificationBadge type="age" />}
          </div>
          
          <p className="text-sm text-[#8c7a6f] mb-3 line-clamp-2">{user.bio}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {user.culturalBackground.slice(0, 2).map((bg, i) => (
              <Tag key={i} color="pink" size="sm">{bg}</Tag>
            ))}
            {user.languages.slice(0, 2).map((lang, i) => (
              <Tag key={i} color="coral" size="sm">{lang}</Tag>
            ))}
            {user.goals.slice(0, 2).map((goal, i) => (
              <Tag key={i} color="amber" size="sm">{goal}</Tag>
            ))}
          </div>
          
          {user.mutualFriends && user.mutualFriends > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#f6ac69] mb-3">
              <Users className="w-3 h-3" />
              <span>{user.mutualFriends} mutual friends</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-[#8c7a6f] mb-3">
            <MapPin className="w-3 h-3" />
            <span className="italic">Location hidden until you connect</span>
          </div>
          
          <Button
            variant={friendRequested ? 'secondary' : 'primary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddFriend?.(user.id);
            }}
            className="w-full"
          >
            {friendRequested ? '✓ Requested' : '+ Add friend'}
          </Button>
        </div>
      </div>
    </div>
  );
};
