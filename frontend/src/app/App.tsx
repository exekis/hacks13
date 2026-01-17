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
import { Auth } from '@/app/screens/Auth';

type MainScreen = 'feed' | 'discover' | 'create' | 'messages' | 'profile' | 'settings';

type AppScreen = 'landing' | 'onboarding' | 'main' | 'auth';

export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

  // Render the landing page for new visitors
  if (appScreen === 'landing') {
    // onGetStarted will transition the user to the authentication screen
    return <LandingPage onGetStarted={() => setAppScreen('auth')} />;
  }

  // Render the authentication page for users who need to sign in or sign up
  if (appScreen === 'auth') {
    return <Auth
      // On successful sign-in, set the user profile and transition to the main app
      onSignIn={(profile: UserProfile) => {
        setUserProfile(profile);
        setAppScreen('main');
      }}
      // On sign-up, transition the user to the onboarding/profile setup screen
      onSignUp={(authToken: string) => {
        setToken(authToken);
        setAppScreen('onboarding');
      }} />;
  }

  // Render the profile setup flow for new users or if the profile is not set
  if (appScreen === 'onboarding' || !userProfile) {
    return <ProfileSetup
      token={token || ''}
      onComplete={(profile: UserProfile) => {
        setUserProfile(profile);
        setAppScreen('main');
      }} />;
  }

  return (
    <div className="bg-[#FFEBDA] min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeScreen}
        onTabChange={(tab: MainScreen) => {
          setSelectedProfileId(undefined);
          setSelectedMessageUserId(undefined);
          setActiveScreen(tab);
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
            currentUserId="482193"
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
            onUpdateProfile={(updates: Partial<UserProfile>) => setUserProfile({ ...userProfile!, ...updates })}
          />
        )}

        {activeScreen === 'settings' && (
          <WebSettings
            userProfile={userProfile}
            onBack={() => setActiveScreen('profile')}
            onUpdateProfile={(updates: Partial<UserProfile>) => setUserProfile({ ...userProfile!, ...updates })}
          />
        )}
      </div>
    </div>
  );
}
