import { useState } from 'react';
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
    return (
      <>
        <LandingPage onGetStarted={() => setAppScreen('auth')} />
        <button
          onClick={() => {
            const debugProfile: UserProfile = {
              fullName: "Speedrunner",
              age: 25,
              isStudent: true,
              university: "Debug University",
              currentCity: "Toronto",
              languages: ["English"],
              culturalIdentity: ["Debugger"],
              ethnicity: ["Mixed"],
              culturalSimilarityImportance: 1,
              culturalComfortLevel: 'open',
              languageMatchImportant: false,
              purposeOfStay: "Speedrunning",
              lookingFor: ["Bugs"],
              socialVibe: ["Fast"],
              availability: ["Always"],
              whoCanSeePosts: "everyone-verified",
              hideLocationUntilFriends: false,
              meetupPreference: "public-first",
              bio: "I am a debug user.",
              interests: ["Coding"],
              badges: [],
              matchFilters: { ageRange: [18, 99], culturalSimilarity: 0 },
              agePreference: { enabled: false, range: 10 },
              verifiedStudentsOnly: false
            };
            setUserProfile(debugProfile);
            setAppScreen('main');
          }}
          className="fixed bottom-4 right-4 bg-red-600/80 text-white px-4 py-2 rounded-full z-50 hover:bg-red-500 text-sm font-bold shadow-lg"
        >
          ⚡ Dev: Skip to Feed
        </button>
      </>
    );
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
        onTabChange={(tab: string) => {
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
            currentUserId="482193"
            onRSVP={(postId) => console.log('RSVP', postId)}
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
