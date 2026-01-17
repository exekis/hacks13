import React, { useState } from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { Button } from '@/app/components/DesignSystem';
import { Image, MapPin } from 'lucide-react';

interface CreatePostScreenProps {
  onBack: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onBack }) => {
  const [hideLocation, setHideLocation] = useState(true);
  const [content, setContent] = useState('');
  
  const handlePost = () => {
    alert('Post created! 🎉');
    onBack();
  };
  
  return (
    <div className="min-h-screen bg-[#fef9f6] pb-20">
      <TopAppBar title="Create an event" showBack onBackClick={onBack} />
      
      <div className="px-4 pt-6 max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-5 shadow-md mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your plans, ask for recommendations and find activity buddies..."
            rows={6}
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors resize-none"
          />
          
          <div className="flex items-center gap-3 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-[#f5ede8] hover:border-[#f55c7a] transition-colors">
              <Image className="w-5 h-5 text-[#f55c7a]" />
              <span className="text-sm text-[#3d3430]">Add image</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-md mb-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">
              Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors text-sm"
              />
              <input
                type="date"
                className="px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g., Downtown Toronto"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors"
            />
          </div>
          
          <div className="bg-[#fff5f0] rounded-2xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hideLocation}
                onChange={(e) => setHideLocation(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded accent-[#f55c7a]"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#f55c7a]" />
                  <span className="text-sm font-semibold text-[#3d3430]">Hide exact location until friends</span>
                </div>
                <p className="text-xs text-[#8c7a6f]">
                  Your specific location will only be shared with people you connect with.
                </p>
              </div>
            </label>
          </div>
        </div>
        
        <Button
          variant="gradient"
          size="lg"
          onClick={handlePost}
          className="w-full"
        >
          Post to feed ✨
        </Button>
        
        <p className="text-center text-xs text-[#8c7a6f] mt-4 px-4">
          By posting, you agree to keep the community safe and respectful.
        </p>
      </div>
    </div>
  );
};
