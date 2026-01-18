import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Calendar, Send, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { getUserId, API_URL } from '@/api/auth';

interface WebCreatePostProps {
  onBack: () => void;
  
}

export function WebCreatePost({ onBack }: WebCreatePostProps) {
  const [content, setContent] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const userId = getUserId();
    if (!userId) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const postData = {
      user_id: parseInt(userId, 10),
      post_content: content,
      capacity: capacity || 0,
      start_time: `${dateFrom}T${timeFrom}`,
      end_time: `${dateTo}T${timeTo}`,
      location_str: location,
    };

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        onBack();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Failed to create post');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEBDA] via-[#fff5ef] to-[#FFEBDA] py-8 relative overflow-hidden">
      {/* animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-[#f55c7a]/5 -top-48 -right-48"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-[#f6ac69]/5 bottom-20 -left-32"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <motion.div 
        className="max-w-2xl mx-auto px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Send className="w-7 h-7 text-[#f55c7a]" />
            </motion.div>
            <h2 className="text-3xl bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69] bg-clip-text text-transparent" style={{ fontFamily: 'Castoro, serif' }}>
              Create New Event
            </h2>
          </div>
          <motion.button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-xl transition-colors border border-black"
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={24} />
          </motion.button>
        </motion.div>

        {/* form */}
        <motion.div 
          className="bg-white border border-black rounded-2xl p-6 mb-6 overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 12px 24px -8px rgba(245, 92, 122, 0.15)' }}
        >
          <motion.div className="mb-6" variants={itemVariants}>
            <label className="block mb-2 text-lg flex items-center gap-2" style={{ fontFamily: 'Castoro, serif' }}>
              What do you have in mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your travel plans and find activity partners..."
              className="w-full px-4 py-3 border border-black rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#f55c7a]/30 transition-all"
              rows={6}
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${content.length > 500 ? 'text-[#f55c7a]' : 'text-[#666666]'}`}>
                {content.length}/500
              </span>
            </div>
          </motion.div>

          {/* date range inputs */}
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-[#f68c70]/20 to-[#f6ac69]/10 border border-black rounded-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#f68c70]" />
              <label className="font-medium">Event Dates</label>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-[#666666]">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
                <input 
                  type="time" 
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-[#666666]">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
                <input 
                  type="time" 
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-[#f68c70]/20 to-[#f6ac69]/10 border border-black rounded-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#f68c70]" />
              <label className="font-medium">Capacity</label>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={capacity}
                  min={1}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
              </div>
              
            </div>
          </motion.div>

          <motion.div
            className="mb-6 p-4 bg-gradient-to-r from-[#f68c70]/20 to-[#f6ac69]/10 border border-black rounded-xl"
            >
            <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-[#f68c70]" />
                <label className="font-medium">Location</label>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 border border-black rounded-xl focus:ring-2 focus:ring-[#f55c7a]/30 outline-none"
                />
                </div>
            </div>
            </motion.div>
          
          {/* add image button */}
          <motion.button 
            className="w-full p-4 border border-black border-dashed rounded-xl hover:border-solid transition-all flex items-center justify-center gap-2 mb-6 bg-gradient-to-r from-white to-[#fff5ef]"
            whileHover={{ scale: 1.01, backgroundColor: '#FFEBDA' }}
            whileTap={{ scale: 0.99 }}
          >
            <ImageIcon size={20} className="text-[#f68c70]" />
            <span>Add Image (optional)</span>
          </motion.button>

          {/* action buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-white border border-black rounded-xl transition-colors"
              whileHover={{ scale: 1.02, backgroundColor: '#FFEBDA' }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className={`flex-1 px-6 py-3 border border-black rounded-xl transition-all flex items-center justify-center gap-2 ${                content.trim()
                  ? 'bg-gradient-to-r from-[#f55c7a] to-[#f68c70] text-white shadow-lg'
                  : 'bg-[#666666] text-white cursor-not-allowed'
              }`}
              whileHover={content.trim() ? { scale: 1.02, boxShadow: '0 8px 20px rgba(245, 92, 122, 0.4)' } : {}}
              whileTap={content.trim() ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Post
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
