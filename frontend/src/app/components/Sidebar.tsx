import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, MessageCircle, Plus, User, Settings, Globe, Sparkles } from 'lucide-react';

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
    <motion.div 
      className="fixed left-0 top-0 h-screen w-56 bg-gradient-to-b from-[#f55c7a] to-[#f57c73] border-r border-black flex flex-col p-4 overflow-hidden"
      initial={{ x: -224 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute w-32 h-32 rounded-full bg-white/5 -top-8 -right-8"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute w-20 h-20 rounded-full bg-white/5 bottom-20 -left-8"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* logo and brand */}
      <motion.div 
        className="mb-8 px-3 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div 
            className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Globe className="w-5 h-5 text-white" />
          </motion.div>
          <h1 className="text-2xl text-white" style={{ fontFamily: 'Castoro, serif' }}>
            Travelmate
          </h1>
        </div>
      </motion.div>

      {/* navigation */}
      <nav className="flex-1 space-y-1.5 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#f55c7a]'
                  : 'text-white hover:bg-white/15'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              whileHover={{ x: isActive ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* active background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-xl"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              {/* icon with animation */}
              <motion.div
                className="relative z-10"
                animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Icon size={20} />
              </motion.div>
              
              <span className="relative z-10 font-medium">{item.label}</span>
              
              {/* active indicator sparkle */}
              {isActive && (
                <motion.div
                  className="absolute right-3 z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
                >
                  <Sparkles size={14} className="text-[#f6ac69]" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* bottom decoration */}
      <motion.div 
        className="relative z-10 mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-white/80 text-center">
          Connect, explore, belong
        </p>
      </motion.div>
    </motion.div>
  );
}
