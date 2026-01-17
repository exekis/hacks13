import React from 'react';
import { User as UserType } from '@/app/data/mockData';
import { User, MapPin } from 'lucide-react';

interface WebPersonCardProps {
  user: UserType;
  onAddFriend?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  isFriendRequested?: boolean;
}

export function WebPersonCard({ user, onAddFriend, onViewProfile, isFriendRequested }: WebPersonCardProps) {
  return (
    <div className="bg-white border border-black rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Header with avatar and name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-[#f6bc66] border border-black rounded-full flex items-center justify-center text-3xl flex-shrink-0">
          <User size={32} className="text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg mb-1 truncate">{user.name}</h3>
          {user.pronouns && (
            <p className="text-sm text-[#666666] mb-1">{user.pronouns}</p>
          )}
          {user.location && (
            <div className="flex items-center gap-1 text-sm text-[#666666]">
              <MapPin size={14} />
              <span className="truncate">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm mb-4 line-clamp-2">{user.bio}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {user.goals.slice(0, 3).map((goal, index) => (
          <span
            key={index}
            className="px-3 py-1 text-sm border border-black rounded-full bg-[#f6ac69]"
            style={{ fontFamily: 'Castoro, serif' }}
          >
            {goal}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewProfile?.(user.id)}
          className="flex-1 px-4 py-2 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors"
        >
          View Profile
        </button>
        {onAddFriend && (
          <button
            onClick={() => onAddFriend(user.id)}
            disabled={isFriendRequested}
            className={`flex-1 px-4 py-2 border border-black rounded-lg transition-colors ${
              isFriendRequested
                ? 'bg-[#666666] text-white cursor-not-allowed'
                : 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
            }`}
          >
            {isFriendRequested ? 'Request Sent' : 'Add Friend'}
          </button>
        )}
      </div>
    </div>
  );
}
