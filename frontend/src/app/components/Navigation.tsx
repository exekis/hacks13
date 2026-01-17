import React from 'react';
import { Home, Compass, PlusCircle, MessageCircle, User } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'create', icon: PlusCircle, label: 'Post' },
    { id: 'messages', icon: MessageCircle, label: 'DMs' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f5ede8] shadow-lg">
      <div className="flex justify-around items-center py-2 max-w-md mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-[#f55c7a] bg-[#fee5eb]' 
                  : 'text-[#8c7a6f] hover:text-[#f55c7a]'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface TopAppBarProps {
  title: string;
  onSafetyClick?: () => void;
  onSearchClick?: () => void;
  showBack?: boolean;
  onBackClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onSafetyClick,
  onSearchClick,
  showBack = false,
  onBackClick
}) => {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69] px-4 py-4 shadow-md">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBackClick} className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {onSearchClick && (
            <button onClick={onSearchClick} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          {onSafetyClick && (
            <button onClick={onSafetyClick} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
