import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const travelGoalsPrompts = [
  "The goals of my travels are...",
  "I want to find...",
  "My ideal travel companion is...",
  "I'm most excited about...",
];

const aboutMePrompts = [
  "On the weekends, I like to...",
  "My hobbies are...",
  "A fun fact about me is...",
  "I'm passionate about...",
];

export function WebOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'travel-goals' | 'about-me' | 'connect'>('welcome');
  const [selectedTravelGoals, setSelectedTravelGoals] = useState<string[]>([]);
  const [selectedAboutMe, setSelectedAboutMe] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 30]);
  const [userType, setUserType] = useState<string[]>([]);

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-5xl mb-6">Welcome to Travelmate</h1>
          <p className="text-xl mb-8 text-[#666666]">
            Connect with students and travelers who share your cultural background and goals.
            Let's get started!
          </p>
          <button
            onClick={() => setStep('travel-goals')}
            className="px-8 py-4 bg-[#f55c7a] text-white border border-black rounded-lg text-lg hover:bg-[#f57c73] transition-colors inline-flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'travel-goals') {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <h2 className="text-3xl mb-4">Travel Goals</h2>
            <p className="text-[#666666]">Select the prompts that resonate with you (choose at least 2)</p>
          </div>

          <div className="space-y-4 mb-8">
            {travelGoalsPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => toggleSelection(prompt, selectedTravelGoals, setSelectedTravelGoals)}
                className={`w-full p-6 border border-black rounded-lg text-left transition-all ${
                  selectedTravelGoals.includes(prompt)
                    ? 'bg-[#f6ac69] shadow-md'
                    : 'bg-white hover:bg-[#f6bc66]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>{prompt}</span>
                  {selectedTravelGoals.includes(prompt) && (
                    <Check size={24} className="text-black" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('welcome')}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('about-me')}
              disabled={selectedTravelGoals.length < 2}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors ${
                selectedTravelGoals.length >= 2
                  ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                  : 'bg-[#666666] text-white cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'about-me') {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <h2 className="text-3xl mb-4">About Me</h2>
            <p className="text-[#666666]">Tell us more about yourself (choose at least 2)</p>
          </div>

          <div className="space-y-4 mb-8">
            {aboutMePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => toggleSelection(prompt, selectedAboutMe, setSelectedAboutMe)}
                className={`w-full p-6 border border-black rounded-lg text-left transition-all ${
                  selectedAboutMe.includes(prompt)
                    ? 'bg-[#f68c70] shadow-md'
                    : 'bg-white hover:bg-[#f57c73]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg" style={{ fontFamily: 'Castoro, serif' }}>{prompt}</span>
                  {selectedAboutMe.includes(prompt) && (
                    <Check size={24} className="text-black" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('travel-goals')}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('connect')}
              disabled={selectedAboutMe.length < 2}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors ${
                selectedAboutMe.length >= 2
                  ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                  : 'bg-[#666666] text-white cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'connect') {
    const userTypes = ['Student', 'Working professional', 'Recent graduate', 'Gap year traveler'];

    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <h2 className="text-3xl mb-4">Who do you want to connect with?</h2>
            <p className="text-[#666666]">Help us find the right matches for you</p>
          </div>

          {/* Age Range */}
          <div className="mb-8 p-6 bg-white border border-black rounded-lg">
            <label className="block mb-4 text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              Age range
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={ageRange[0]}
                onChange={(e) => setAgeRange([parseInt(e.target.value) || 18, ageRange[1]])}
                className="w-24 px-3 py-2 border border-black rounded-lg"
                min="18"
                max="100"
              />
              <span>to</span>
              <input
                type="number"
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value) || 30])}
                className="w-24 px-3 py-2 border border-black rounded-lg"
                min="18"
                max="100"
              />
            </div>
          </div>

          {/* User Type */}
          <div className="mb-8">
            <label className="block mb-4 text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              I want to connect with...
            </label>
            <div className="space-y-3">
              {userTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleSelection(type, userType, setUserType)}
                  className={`w-full p-4 border border-black rounded-lg text-left transition-all ${
                    userType.includes(type)
                      ? 'bg-[#f6bc66] shadow-md'
                      : 'bg-white hover:bg-[#f6ac69]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{type}</span>
                    {userType.includes(type) && (
                      <Check size={20} className="text-black" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('about-me')}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors"
            >
              Back
            </button>
            <button
              onClick={onComplete}
              disabled={userType.length === 0}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors ${
                userType.length > 0
                  ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                  : 'bg-[#666666] text-white cursor-not-allowed'
              }`}
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
