import React, { useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { UserProfile, defaultProfile } from '@/app/types/profile';
import { saveStep1, saveStep2, saveStep3, saveStep4, saveStep5, saveStep6 } from '@/api/profileSetup';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  token: string;
}

const culturalIdentities = ['Iranian', 'Arab', 'Turkish', 'Chinese', 'Indian', 'Nigerian', 'Latino', 'Korean', 'Japanese', 'Vietnamese', 'Filipino', 'Pakistani', 'Mexican', 'Brazilian', 'Egyptian', 'Indonesian', 'Thai', 'Moroccan', 'Kenyan', 'South African', 'Ethiopian', 'Ghanaian', 'Colombian', 'Peruvian', 'Persian', 'Afghan', 'Iraqi', 'Syrian', 'Lebanese', 'Jordanian', 'Palestinian', 'Saudi', 'Yemeni', 'Emirati', 'Kuwaiti', 'Qatari', 'Omani', 'Armenian', 'Azerbaijani', 'Kurdish', 'Bangladeshi', 'Sri Lankan', 'Nepali', 'Bhutanese', 'Maldivian', 'Taiwanese', 'Hong Konger', 'Singaporean', 'Malaysian', 'Cambodian', 'Laotian', 'Burmese', 'Hmong', 'Somali', 'Sudanese', 'Ugandan', 'Tanzanian', 'Rwandan', 'Burundian', 'Zimbabwean', 'Zambian', 'Malawian', 'Mozambican', 'Angolan', 'Congolese', 'Cameroonian', 'Ivorian', 'Senegalese', 'Malian', 'Burkinabe', 'Beninese', 'Togolese', 'Sierra Leonean', 'Liberian', 'British', 'Irish', 'Scottish', 'Welsh', 'French', 'German', 'Italian', 'Spanish', 'Portuguese', 'Dutch', 'Belgian', 'Swiss', 'Austrian', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Slovak', 'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Serbian', 'Croatian', 'Bosnian', 'Albanian', 'Ukrainian', 'Russian', 'American', 'Canadian', 'Chilean', 'Argentinian', 'Uruguayan', 'Venezuelan', 'Ecuadorian', 'Bolivian', 'Paraguayan', 'Guatemalan', 'Salvadoran', 'Honduran', 'Nicaraguan', 'Costa Rican', 'Panamanian', 'Cuban', 'Dominican', 'Puerto Rican', 'Haitian', 'Jamaican', 'Indigenous', 'Native American', 'First Nations', 'Aboriginal Australian', 'Maori', 'Pacific Islander', 'Jewish', 'Ashkenazi Jewish', 'Sephardic Jewish', 'Mizrahi Jewish'];

const languages = ['English', 'Spanish', 'Mandarin', 'French', 'Arabic', 'Portuguese', 'Hindi', 'Russian', 'Japanese', 'Korean', 'Vietnamese', 'Turkish', 'Italian', 'German', 'Urdu', 'Punjabi', 'Farsi', 'Tagalog', 'Thai', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Burmese', 'Khmer', 'Lao', 'Malay', 'Indonesian', 'Javanese', 'Sundanese', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Amharic', 'Somali', 'Zulu', 'Xhosa', 'Afrikaans', 'Nepali', 'Sinhala', 'Pashto', 'Kurdish', 'Hebrew', 'Greek', 'Polish', 'Czech', 'Slovak', 'Hungarian', 'Romanian', 'Bulgarian', 'Serbian', 'Croatian', 'Bosnian', 'Slovenian', 'Albanian', 'Ukrainian', 'Belarusian', 'Lithuanian', 'Latvian', 'Estonian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Icelandic', 'Irish', 'Welsh', 'Scottish Gaelic', 'Basque', 'Catalan', 'Galician', 'Armenian', 'Georgian', 'Azerbaijani', 'Kazakh', 'Uzbek', 'Turkmen', 'Mongolian', 'Tibetan', 'Uyghur', 'Hmong', 'Maori', 'Samoan', 'Tongan', 'Fijian', 'Haitian Creole', 'Quechua', 'Aymara', 'Guarani', 'Nahuatl', 'Maya'];

const religions = ['No Religion', 'Christianity', 'Catholicism', 'Protestantism', 'Orthodox Christianity', 'Islam', 'Sunni Islam', 'Shia Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Sikhism', 'Taoism', 'Confucianism', 'Shinto', 'Jainism', 'Bahai Faith', 'Zoroastrianism', 'Druze', 'Yazidism', 'Rastafarianism', 'African Traditional Religions', 'Native American Spirituality', 'Indigenous Spirituality', 'Paganism', 'Neo-Paganism', 'Wicca', 'Celtic Paganism', 'Norse Paganism', 'Hellenism', 'Roman Paganism', 'Spiritual but not Religious', 'Unitarian Universalism', 'Deism', 'Agnosticism', 'Atheism', 'Humanism', 'Secular'];

const languageOptions = languages.map(lang => ({
  value: lang,
  label: lang,
}));

const culturalIdentityOptions = culturalIdentities.map(identity => ({
  value: identity,
  label: identity,
}));

const religionOptions = religions.map(religion => ({
  value: religion,
  label: religion,
}));

const goals = [
  'Friends', 'Exploring the city', 'Food buddies', 'Coffee chats',
  'Study pals', 'Events / nightlife', 'Gym / sports',
  'Roommates / housing advice', 'Language exchange'
];

const interests = [
  'Music', 'Food', 'Photography', 'Gaming', 'Hiking', 'Museums',
  'Cafes', 'Art', 'Sports', 'Reading', 'Cooking', 'Dancing',
  'Travel', 'Movies', 'Theater', 'Technology', 'Fitness'
];

const badges = [
  'New in town', 'Studying abroad', 'Language buddy', 'Food explorer',
  'Gym buddy', 'Coffee enthusiast', 'Culture vulture', 'Night owl'
];

const animatedComponents = makeAnimated();

export function ProfileSetup({ onComplete, token }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    ...defaultProfile,
    fullName: '',
    age: 18,
    currentCity: '',
    languages: [],
    culturalIdentity: [],
    lookingFor: [],
    socialVibe: [],
    availability: [],
    bio: '',
    interests: [],
    badges: [],
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  const toggleInArray = (array: string[], item: string): string[] => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  // Step 1: Basic Information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl mb-2">Basic Information</h2>
          <p className="text-[#666666] mb-8">Mandatory information marked with *</p>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Full Name
              </label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white"
                placeholder="Enter your name"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Age (must be 18+)
              </label>
              <input
                type="number"
                value={profile.age || 18}
                onChange={(e) => updateProfile({ age: parseInt(e.target.value) || 18 })}
                min="18"
                max="100"
                className="w-full px-4 py-3 border border-black rounded-lg bg-white"
              />
            </div>

            {/* Pronouns */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Pronouns
              </label>
              <select
                value={profile.pronouns || ''}
                onChange={(e) => updateProfile({ pronouns: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white"
              >
                <option value="">Prefer not to say</option>
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="other">other</option>
              </select>
            </div>

            {/* Student Status */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Student status
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateProfile({ isStudent: true })}
                  className={`flex-1 px-4 py-3 border border-black rounded-lg transition-colors ${profile.isStudent
                    ? 'bg-[#f55c7a] text-white'
                    : 'bg-white hover:bg-[#f6bc66]/20'
                    }`}
                >
                  Student
                </button>
                <button
                  onClick={() => updateProfile({ isStudent: false })}
                  className={`flex-1 px-4 py-3 border border-black rounded-lg transition-colors ${profile.isStudent === false
                    ? 'bg-[#f55c7a] text-white'
                    : 'bg-white hover:bg-[#f6bc66]/20'
                    }`}
                >
                  Not a student
                </button>
              </div>
            </div>

            {/* University (if student) */}
            {profile.isStudent && (
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                  University / School
                </label>
                <input
                  type="text"
                  value={profile.university || ''}
                  onChange={(e) => updateProfile({ university: e.target.value })}
                  className="w-full px-4 py-3 border border-black rounded-lg bg-white"
                  placeholder="Enter your university"
                />
              </div>
            )}

            {/* Current City */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Current City
              </label>
              <input
                type="text"
                value={profile.currentCity || ''}
                onChange={(e) => updateProfile({ currentCity: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white"
                placeholder="e.g., Toronto, ON"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Languages
              </label>

              <Select
                isMulti
                options={languageOptions}
                value={languageOptions.filter(option =>
                  profile.languages?.includes(option.value)
                )}
                onChange={(selected) =>
                  updateProfile({ languages: selected.map(option => option.value,) })
                }
                placeholder="Select language(s)"
                classNamePrefix="react-select"
                styles={{
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#f68c70',
                    borderRadius: '15px',
                    border: '1px solid black'
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'black'
                  }),
                }}
              />
            </div>

            {/* Hometown */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Hometown / where you grew up
              </label>
              <input
                type="text"
                value={profile.hometown || ''}
                onChange={(e) => updateProfile({ hometown: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white"
                placeholder="Enter your hometown"
              />
            </div>
          </div>

          <button
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                await saveStep1({
                  fullName: profile.fullName || '',
                  age: profile.age || 18,
                  pronouns: profile.pronouns,
                  isStudent: profile.isStudent || false,
                  university: profile.university,
                  currentCity: profile.currentCity || '',
                  languages: profile.languages || [],
                  hometown: profile.hometown,
                }, token);
                setStep(2);
              } catch (err) {
                setError('Failed to save profile data. Please try again.');
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            disabled={!profile.fullName || !profile.age || !profile.currentCity || (profile.languages?.length || 0) === 0 || loading}
            className={`w-full mt-8 px-6 py-3 border border-black rounded-lg transition-colors flex items-center justify-center gap-2 ${profile.fullName && profile.currentCity && (profile.languages?.length || 0) > 0 && !loading
              ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
              : 'bg-[#666666] text-white cursor-not-allowed'
              }`}
          >
            {loading ? 'Saving...' : 'Continue'}
            <ArrowRight size={20} />
          </button>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        </div>
      </div>
    );
  }

  // Step 2: Cultural Information
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl mb-2">Cultural Information</h2>
          <p className="text-[#666666] mb-8">Help us understand your background</p>

          <div className="space-y-6">
            {/* Cultural Identity */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Cultural identity / background
              </label>

              <Select
                isMulti
                options={culturalIdentityOptions}
                value={culturalIdentityOptions.filter(option =>
                  profile.culturalIdentity?.includes(option.value)
                )}
                onChange={(selected) =>
                  updateProfile({ culturalIdentity: selected.map(option => option.value,) })
                }
                placeholder="Select cultural background(s)"
                classNamePrefix="react-select"
                styles={{
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#f68c70',
                    borderRadius: '15px',
                    border: '1px solid black'
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'black'
                  }),
                }}
              />
            </div>

            {/* Religion */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Religion / spiritual identity
              </label>
              <Select
                isMulti
                options={religionOptions}
                value={religionOptions.filter(option =>
                  profile.religion?.includes(option.value)
                )}
                onChange={(selected) =>
                  updateProfile({ religion: selected.map(option => option.value,) })
                }
                placeholder="Select religion"
                classNamePrefix="react-select"
                styles={{
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#f68c70',
                    borderRadius: '15px',
                    border: '1px solid black'
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'black'
                  }),
                }}
              />
            </div>

            {/* Cultural Similarity Importance */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                How important is cultural similarity to you?
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={profile.culturalSimilarityImportance || 50}
                onChange={(e) => updateProfile({ culturalSimilarityImportance: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-[#666666] mt-1">
                <span>Not important</span>
                <span>Somewhat</span>
                <span>Very important</span>
              </div>
            </div>

            {/* Comfort Level */}
            <div>
              <label className="block mb-3" style={{ fontFamily: 'Castoro, serif' }}>
                Comfort level with culture mixing
              </label>
              <div className="space-y-2">
                {[
                  { value: 'open', label: "I'm open to anyone" },
                  { value: 'prefer-similar', label: 'Prefer similar background' },
                  { value: 'strong-preference', label: 'Strong preference for similar background' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateProfile({ culturalComfortLevel: option.value as any })}
                    className={`w-full px-4 py-3 border border-black rounded-lg text-left transition-colors ${profile.culturalComfortLevel === option.value
                      ? 'bg-[#f6bc66] text-black'
                      : 'bg-white hover:bg-[#f6ac69]/20'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Match */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white border border-black rounded-lg">
                <input
                  type="checkbox"
                  checked={profile.languageMatchImportant || false}
                  onChange={(e) => updateProfile({ languageMatchImportant: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>I want to meet people who speak my language</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await saveStep2({
                    culturalIdentity: profile.culturalIdentity || [],
                    ethnicity: profile.ethnicity ? [profile.ethnicity] : undefined,
                    religion: profile.religion,
                    culturalSimilarityImportance: profile.culturalSimilarityImportance || 50,
                    culturalComfortLevel: profile.culturalComfortLevel || '',
                    languageMatchImportant: profile.languageMatchImportant || false,
                  }, token);
                  setStep(3);
                } catch (err) {
                  setError('Failed to save profile data. Please try again.');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={(profile.culturalIdentity?.length || 0) === 0 || loading}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors flex items-center justify-center gap-2 ${(profile.culturalIdentity?.length || 0) > 0 && !loading
                ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                : 'bg-[#666666] text-white cursor-not-allowed'
                }`}
            >
              {loading ? 'Saving...' : 'Continue'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Travel + Intent
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl mb-2">Travel + Intent</h2>
          <p className="text-[#666666] mb-8">Tell us about your plans</p>

          <div className="space-y-6">

            {/* Looking For (Goals) */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *What are you looking for right now? (select all that match)
              </label>
              <div className="flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => updateProfile({
                      lookingFor: toggleInArray(profile.lookingFor || [], goal)
                    })}
                    className={`px-3 py-1.5 text-sm border border-black rounded-full transition-colors ${profile.lookingFor?.includes(goal)
                      ? 'bg-[#f6ac69] text-black'
                      : 'bg-white hover:bg-[#f6bc66]/20'
                      }`}
                  >
                    {goal}
                    {profile.lookingFor?.includes(goal) && <Check size={14} className="inline ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Vibe */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Your social vibe (select 1-2)
              </label>
              <div className="space-y-2">
                {['Chill / lowkey', 'Extroverted / outgoing', 'Down to explore', 'More introverted', 'Depends on the day'].map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => {
                      const current = profile.socialVibe || [];
                      if (current.includes(vibe)) {
                        updateProfile({ socialVibe: current.filter(v => v !== vibe) });
                      } else if (current.length < 2) {
                        updateProfile({ socialVibe: [...current, vibe] });
                      }
                    }}
                    className={`w-full px-4 py-3 border border-black rounded-lg text-left transition-colors ${profile.socialVibe?.includes(vibe)
                      ? 'bg-[#f68c70] text-black'
                      : 'bg-white hover:bg-[#f57c73]/20'
                      }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Availability
              </label>
              <div className="flex flex-wrap gap-2">
                {['Weekdays', 'Weekends', 'Evenings'].map((time) => (
                  <button
                    key={time}
                    onClick={() => updateProfile({
                      availability: toggleInArray(profile.availability || [], time)
                    })}
                    className={`px-4 py-2 border border-black rounded-lg transition-colors ${profile.availability?.includes(time)
                      ? 'bg-[#f6bc66] text-black'
                      : 'bg-white hover:bg-[#f6ac69]/20'
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await saveStep3({
                    lookingFor: profile.lookingFor || [],
                    socialVibe: profile.socialVibe || [],
                    availability: profile.availability,
                    purposeOfStay: profile.purposeOfStay,
                  }, token);
                  setStep(4);
                } catch (err) {
                  setError('Failed to save profile data. Please try again.');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={(profile.lookingFor?.length || 0) === 0 || loading}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors flex items-center justify-center gap-2 ${(profile.lookingFor?.length || 0) > 0 && !loading
                ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                : 'bg-[#666666] text-white cursor-not-allowed'
                }`}
            >
              {loading ? 'Saving...' : 'Continue'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Safety + Comfort
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl mb-2">Safety + Comfort</h2>
          <p className="text-[#666666] mb-8">Your safety is our priority</p>

          <div className="space-y-6">

            {/* Who Can See Posts */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Who can see your posts?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'friends', label: 'Friends' },
                  { value: 'friends-of-friends', label: 'Friends-of-friends' },
                  { value: 'everyone-verified', label: 'Everyone verified' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateProfile({ whoCanSeePosts: option.value as any })}
                    className={`w-full px-4 py-3 border border-black rounded-lg text-left transition-colors ${profile.whoCanSeePosts === option.value
                      ? 'bg-[#f55c7a] text-white'
                      : 'bg-white hover:bg-[#f6bc66]/20'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hide Location */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white border border-black rounded-lg">
                <input
                  type="checkbox"
                  checked={profile.hideLocationUntilFriends ?? true}
                  onChange={(e) => updateProfile({ hideLocationUntilFriends: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Hide exact location until we're friends (recommended)</span>
              </label>
            </div>

            {/* Meetup Preference */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Preferred meetup type
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public-only', label: 'Public places only' },
                  { value: 'public-first', label: 'Public first, open later' },
                  { value: 'comfortable-either', label: "I'm comfortable either way" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateProfile({ meetupPreference: option.value as any })}
                    className={`w-full px-4 py-3 border border-black rounded-lg text-left transition-colors ${profile.meetupPreference === option.value
                      ? 'bg-[#f6ac69] text-black'
                      : 'bg-white hover:bg-[#f6bc66]/20'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boundaries */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Any boundaries you want respected?
              </label>
              <textarea
                value={profile.boundaries || ''}
                onChange={(e) => updateProfile({ boundaries: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white resize-none"
                rows={3}
                placeholder='e.g., "No bars", "No late-night meets", "Group hangouts only"'
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await saveStep4({

                    whoCanSeePosts: profile.whoCanSeePosts || 'friends',
                    hideLocationUntilFriends: profile.hideLocationUntilFriends ?? true,
                    meetupPreference: profile.meetupPreference || 'public-first',
                    boundaries: profile.boundaries,
                  }, token);
                  setStep(5);
                } catch (err) {
                  setError('Failed to save profile data. Please try again.');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 px-6 py-3 bg-[#f55c7a] text-white border border-black rounded-lg hover:bg-[#f57c73] transition-colors flex items-center justify-center gap-2 disabled:bg-[#666666] disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Profile Customization
  if (step === 5) {
    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl mb-2">Profile Customization</h2>
          <p className="text-[#666666] mb-8">Show your personality</p>

          <div className="space-y-6">
            {/* Bio */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Bio - What's your story?
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                className="w-full px-4 py-3 border border-black rounded-lg bg-white resize-none"
                rows={4}
                placeholder="Tell people about yourself..."
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                *Interests (select all that match)
              </label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => updateProfile({
                      interests: toggleInArray(profile.interests || [], interest)
                    })}
                    className={`px-3 py-1.5 text-sm border border-black rounded-full transition-colors ${profile.interests?.includes(interest)
                      ? 'bg-[#f6ac69] text-black'
                      : 'bg-white hover:bg-[#f6bc66]/20'
                      }`}
                  >
                    {interest}
                    {profile.interests?.includes(interest) && <Check size={14} className="inline ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await saveStep5({
                    bio: profile.bio || '',
                    interests: profile.interests || [],
                    badges: profile.badges,
                    AboutMe: profile.AboutMe,
                  }, token);
                  setStep(6);
                } catch (err) {
                  setError('Failed to save profile data. Please try again.');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={!profile.bio || (profile.interests?.length || 0) === 0 || loading}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors flex items-center justify-center gap-2 ${profile.bio && (profile.interests?.length || 0) > 0 && !loading
                ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                : 'bg-[#666666] text-white cursor-not-allowed'
                }`}
            >
              {loading ? 'Saving...' : 'Continue'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Match Filters
  if (step === 6) {
    const ageRange = profile.matchFilters?.ageRange || [18, 30];

    return (
      <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl mb-2">Match Filters</h2>
          <p className="text-[#666666] mb-8">Customize who you want to see</p>

          <div className="space-y-6">


            {/* Age Preference Toggle */}
            <div>
              {profile.agePreference?.enabled && (() => {
                const minLimit = 18;
                const maxLimit = 50;

                const [minAge, maxAge] = profile.matchFilters?.ageRange ?? [18, 30];

                const clamp = (v: number) => Math.max(minLimit, Math.min(maxLimit, v));

                const setAgeRange = (nextMin: number, nextMax: number) => {
                  const clampedMin = clamp(nextMin);
                  const clampedMax = clamp(nextMax);
                  const orderedMin = Math.min(clampedMin, clampedMax);
                  const orderedMax = Math.max(clampedMin, clampedMax);

                  updateProfile({
                    matchFilters: {
                      ...(profile.matchFilters ?? {}),
                      ageRange: [orderedMin, orderedMax],
                    },
                  });
                };

                return (
                  <div>
                    <label className="block mb-2 text-sm text-[#666666]">
                      Age range (18–50)
                    </label>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-[#666666]">Min</label>
                        <input
                          type="number"
                          min={minLimit}
                          max={maxLimit}
                          value={minAge}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (Number.isNaN(v)) return;
                            setAgeRange(v, maxAge);
                          }}
                          className="w-full px-4 py-3 border border-black rounded-lg bg-white"
                          placeholder="18"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-[#666666]">Max</label>
                        <input
                          type="number"
                          min={minLimit}
                          max={maxLimit}
                          value={maxAge}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (Number.isNaN(v)) return;
                            setAgeRange(minAge, v);
                          }}
                          className="w-full px-4 py-3 border border-black rounded-lg bg-white"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>


            {/* Verified Only */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white border border-black rounded-lg">
                <input
                  type="checkbox"
                  checked={profile.verifiedStudentsOnly ?? false}
                  onChange={(e) => updateProfile({ verifiedStudentsOnly: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>I prefer meeting other verified students only</span>
              </label>
            </div>

            {/* Cultural Similarity Slider */}
            <div>
              <label className="block mb-2" style={{ fontFamily: 'Castoro, serif' }}>
                Cultural similarity influence on recommendations
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={profile.matchFilters?.culturalSimilarity || 50}
                onChange={(e) => updateProfile({
                  matchFilters: {
                    ...profile.matchFilters!,
                    culturalSimilarity: parseInt(e.target.value)
                  }
                })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-[#666666] mt-1">
                <span>Not important</span>
                <span>Somewhat</span>
                <span>Very important</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await saveStep6({
                    agePreference: profile.agePreference,
                    verifiedStudentsOnly: profile.verifiedStudentsOnly ?? false,
                    culturalSimilarity: profile.matchFilters?.culturalSimilarity || 50,
                  }, token);
                  onComplete(profile as UserProfile);
                } catch (err) {
                  setError('Failed to save profile data. Please try again.');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 px-6 py-3 bg-[#f55c7a] text-white border border-black rounded-lg hover:bg-[#f57c73] transition-colors flex items-center justify-center gap-2 disabled:bg-[#666666] disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
              <Check size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
