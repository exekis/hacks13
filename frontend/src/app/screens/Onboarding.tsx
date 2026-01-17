import React from 'react';
import { Button } from '@/app/components/DesignSystem';

interface OnboardingWelcomeProps {
  onNext: () => void;
  onSkip?: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onNext, onSkip }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f55c7a] via-[#f68c70] to-[#f6ac69] flex flex-col items-center justify-center p-6">
      {onSkip && (
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 text-white/80 hover:text-white font-semibold"
        >
          Skip →
        </button>
      )}
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 animate-bounce">✈️</div>
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
          Meet people who feel like home, anywhere.
        </h1>
        <p className="text-white/90 text-lg mb-8 leading-relaxed">
          Travelmate connects students and travellers with similar backgrounds and goals—safely.
        </p>
        <Button variant="primary" size="lg" onClick={onNext} className="bg-white text-[#f55c7a] hover:bg-white/90 shadow-xl">
          Get started 🚀
        </Button>
      </div>
    </div>
  );
};

interface OnboardingVerificationProps {
  onNext: () => void;
}

export const OnboardingVerification: React.FC<OnboardingVerificationProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-[#fef9f6] p-6 pt-12">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 flex-1 bg-[#f55c7a] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f5ede8] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f5ede8] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f5ede8] rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold text-[#3d3430] mb-2">Safety first! 🛡️</h2>
          <p className="text-[#8c7a6f]">We keep this community safe with student + age checks.</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">
              University email
            </label>
            <input
              type="email"
              placeholder="your.name@university.edu"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors"
            />
          </div>
          
          <div className="bg-white rounded-2xl p-4 border-2 border-[#f5ede8]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded accent-[#f55c7a]" />
              <span className="text-[#3d3430]">I'm currently a student</span>
            </label>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border-2 border-[#f5ede8]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded accent-[#f55c7a]" />
              <span className="text-[#3d3430]">I confirm I'm 18 years or older</span>
            </label>
          </div>
        </div>
        
        <Button variant="gradient" size="lg" onClick={onNext} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
};

interface OnboardingProfileProps {
  onNext: () => void;
}

export const OnboardingProfile: React.FC<OnboardingProfileProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-[#fef9f6] p-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 flex-1 bg-[#f55c7a] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f55c7a] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f5ede8] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f5ede8] rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold text-[#3d3430] mb-2">Tell us about you ✨</h2>
          <p className="text-[#8c7a6f]">
            Help others find you!{' '}
            <span className="text-[#f6ac69] cursor-pointer">Why we ask?</span>
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f55c7a] to-[#f6ac69] flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform">
              📸
            </div>
            <div className="flex-1">
              <button className="text-[#f55c7a] font-semibold">Upload photo</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">Pronouns (optional)</label>
            <input
              type="text"
              placeholder="e.g., she/her, he/him, they/them"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">Bio</label>
            <textarea
              placeholder="Tell us a bit about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">Cultural background</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Indian', 'Chinese', 'Arab', 'Nigerian', 'Mexican', 'Korean', 'Brazilian'].map(bg => (
                <button
                  key={bg}
                  className="px-4 py-2 rounded-full text-sm border-2 border-[#f5ede8] hover:border-[#f55c7a] hover:bg-[#fee5eb] transition-colors"
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">
              {['English', 'Mandarin', 'Spanish', 'Hindi', 'Arabic', 'French'].map(lang => (
                <button
                  key={lang}
                  className="px-4 py-2 rounded-full text-sm border-2 border-[#f5ede8] hover:border-[#f68c70] hover:bg-[#ffebe9] transition-colors"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <Button variant="gradient" size="lg" onClick={onNext} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
};

interface OnboardingGoalsProps {
  onComplete: () => void;
}

export const OnboardingGoals: React.FC<OnboardingGoalsProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-[#fef9f6] p-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 flex-1 bg-[#f55c7a] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f55c7a] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f55c7a] rounded-full"></div>
            <div className="h-2 flex-1 bg-[#f5ede8] rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold text-[#3d3430] mb-2">What brings you here? 🎯</h2>
          <p className="text-[#8c7a6f]">Select all that apply to find your perfect matches!</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-3">I'm looking for...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '👋', label: 'Friends' },
                { icon: '🍜', label: 'Food buddies' },
                { icon: '📚', label: 'Study pals' },
                { icon: '🗺️', label: 'Exploring' },
                { icon: '🎉', label: 'Events' },
                { icon: '🏠', label: 'Roommates' },
                { icon: '💪', label: 'Gym' },
                { icon: '☕', label: 'Coffee chats' }
              ].map(goal => (
                <button
                  key={goal.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-3xl border-2 border-[#f5ede8] hover:border-[#f6ac69] hover:bg-[#fff5e5] transition-colors"
                >
                  <span className="text-3xl">{goal.icon}</span>
                  <span className="text-sm font-medium text-[#3d3430]">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">Where are you?</label>
            <input
              type="text"
              placeholder="City or destination"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors"
            />
          </div>
        </div>
        
        <Button variant="gradient" size="lg" onClick={onComplete} className="w-full">
          Finish & see matches ✨
        </Button>
      </div>
    </div>
  );
};