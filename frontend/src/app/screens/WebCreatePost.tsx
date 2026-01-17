import React, { useState } from 'react';
import { X, Image as ImageIcon, Calendar } from 'lucide-react';

interface WebCreatePostProps {
  onBack: () => void;
}

export function WebCreatePost({ onBack }: WebCreatePostProps) {
  const [content, setContent] = useState('');
  const [hasDateRange, setHasDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSubmit = () => {
    // In a real app, this would create the post
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#FFEBDA] py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl">Create Post</h2>
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-black"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="bg-white border border-black rounded-lg p-6 mb-6">
          <div className="mb-6">
            <label className="block mb-2 text-lg" style={{ fontFamily: 'Castoro, serif' }}>
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your travel plans, find activity partners, or just say hello..."
              className="w-full px-4 py-3 border border-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#f55c7a]"
              rows={6}
            />
          </div>

          {/* Date Range Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDateRange}
                onChange={(e) => setHasDateRange(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Add travel dates</span>
            </label>
          </div>

          {/* Date Range Inputs */}
          {hasDateRange && (
            <div className="mb-6 p-4 bg-[#f68c70]/20 border border-black rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} />
                <label className="font-medium">Travel Dates</label>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-1 text-[#666666]">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-black rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1 text-[#666666]">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-black rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add Image Button */}
          <button className="w-full p-4 border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors flex items-center justify-center gap-2 mb-6">
            <ImageIcon size={20} />
            <span>Add Image (optional)</span>
          </button>

          {/* Info Box */}
          <div className="p-4 bg-[#f6bc66]/20 border border-black rounded-lg mb-6">
            <p className="text-sm text-[#666666]">
              <strong>Privacy Note:</strong> Your exact location will only be shared with people you connect with.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-white border border-black rounded-lg hover:bg-[#FFEBDA] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className={`flex-1 px-6 py-3 border border-black rounded-lg transition-colors ${
                content.trim()
                  ? 'bg-[#f55c7a] text-white hover:bg-[#f57c73]'
                  : 'bg-[#666666] text-white cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
