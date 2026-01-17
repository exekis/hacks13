import React from 'react';
import { Home, Search, MessageCircle, Plus, User, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'discover', label: 'Search', icon: Search },
    { id: 'messages', label: 'DMs', icon: MessageCircle },
    { id: 'create', label: 'New Post', icon: Plus },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-56 bg-[#f55c7a] border-r border-black flex flex-col p-4">
      {/* Logo/Brand */}
      <div className="mb-8 px-3">
        <h1 className="text-2xl text-black">Travelmate</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black/10'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
