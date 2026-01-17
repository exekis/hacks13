import React, { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { LandingPage } from '@/app/screens/LandingPage';
import { ProfileSetup } from '@/app/screens/ProfileSetup';
import { WebFeed } from '@/app/screens/WebFeed';
import { WebProfile } from '@/app/screens/WebProfile';
import { WebMessages } from '@/app/screens/WebMessages';
import { WebCreatePost } from '@/app/screens/WebCreatePost';
import { WebSettings } from '@/app/screens/WebSettings';
import { UserProfile } from '@/app/types/profile';

type MainScreen = 'feed' | 'discover' | 'create' | 'messages' | 'profile' | 'settings';
type AppScreen = 'landing' | 'onboarding' | 'main';

export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<MainScreen>('feed');
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const [selectedMessageUserId, setSelectedMessageUserId] = useState<string | undefined>();
  
  const handleAddFriend = (userId: string) => {
    setFriendRequests(prev => new Set([...prev, userId]));
  };
  
  const handleViewProfile = (userId: string) => {
    setSelectedProfileId(userId);
    setActiveScreen('profile');
  };
  
  const handleMessage = (userId: string) => {
    setSelectedMessageUserId(userId);
    setActiveScreen('messages');
  };

  // show landing page first for new visitors
  if (appScreen === 'landing') {
    return <LandingPage onGetStarted={() => setAppScreen('onboarding')} />;
  }
  
  // show profile setup flow
  if (appScreen === 'onboarding' || !userProfile) {
    return <ProfileSetup onComplete={(profile) => {
      setUserProfile(profile);
      setAppScreen('main');
    }} />;
  }
  
  return (
    <div className="bg-[#FFEBDA] min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeScreen} 
        onTabChange={(tab) => {
          setSelectedProfileId(undefined);
          setSelectedMessageUserId(undefined);
          setActiveScreen(tab as MainScreen);
        }} 
      />
      
      {/* Main content area - offset by sidebar width */}
      <div className="ml-56">
        {(activeScreen === 'feed' || activeScreen === 'discover') && (
          <WebFeed
            onViewProfile={handleViewProfile}
            onMessage={handleMessage}
            friendRequests={friendRequests}
            onAddFriend={handleAddFriend}
          />
        )}
        
        {activeScreen === 'create' && (
          <WebCreatePost onBack={() => setActiveScreen('feed')} />
        )}
        
        {activeScreen === 'messages' && (
          <WebMessages
            selectedUserId={selectedMessageUserId}
            onBack={() => {
              setSelectedMessageUserId(undefined);
            }}
          />
        )}
        
        {activeScreen === 'profile' && (
          <WebProfile
            userId={selectedProfileId}
            userProfile={userProfile}
            onBack={() => {
              setSelectedProfileId(undefined);
              setActiveScreen('feed');
            }}
            onMessage={handleMessage}
            onCreatePost={() => setActiveScreen('create')}
            onUpdateProfile={(updates) => setUserProfile({ ...userProfile, ...updates })}
          />
        )}
        
        {activeScreen === 'settings' && (
          <WebSettings 
            userProfile={userProfile}
            onBack={() => setActiveScreen('profile')}
            onUpdateProfile={(updates) => setUserProfile({ ...userProfile, ...updates })}
          />
        )}
      </div>
    </div>
  );
}