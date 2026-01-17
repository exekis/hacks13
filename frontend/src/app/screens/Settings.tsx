import React from 'react';
import { TopAppBar } from '@/app/components/Navigation';
import { Shield, Eye, MessageSquare, UserX, HelpCircle } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#fef9f6] pb-20">
      <TopAppBar title="Safety & Settings" showBack onBackClick={onBack} />
      
      <div className="px-4 pt-6 max-w-md mx-auto space-y-4">
        <div className="bg-gradient-to-r from-[#f55c7a]/10 to-[#f6ac69]/10 rounded-3xl p-5 mb-4 border border-[#f6ac69]/20">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-[#f55c7a] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-[#3d3430] mb-1">Your safety matters</h3>
              <p className="text-sm text-[#8c7a6f]">
                Travelmate is designed to keep you safe. Adjust these settings to control your privacy and who can contact you.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h4 className="font-bold text-[#3d3430] mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#f55c7a]" />
            Privacy Settings
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded accent-[#f55c7a]" defaultChecked />
              <div>
                <div className="font-semibold text-[#3d3430]">Hide location until connected</div>
                <div className="text-sm text-[#8c7a6f]">Only friends can see your exact location</div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded accent-[#f55c7a]" defaultChecked />
              <div>
                <div className="font-semibold text-[#3d3430]">Profile visible to verified only</div>
                <div className="text-sm text-[#8c7a6f]">Only verified students can see your profile</div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded accent-[#f55c7a]" />
              <div>
                <div className="font-semibold text-[#3d3430]">Hide online status</div>
                <div className="text-sm text-[#8c7a6f]">Others won't see when you're active</div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h4 className="font-bold text-[#3d3430] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#f57c73]" />
            Message Permissions
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="messages" className="w-5 h-5 accent-[#f55c7a]" defaultChecked />
              <span className="text-[#3d3430]">Anyone can message me</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="messages" className="w-5 h-5 accent-[#f55c7a]" />
              <span className="text-[#3d3430]">Only verified users can message me</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="messages" className="w-5 h-5 accent-[#f55c7a]" />
              <span className="text-[#3d3430]">Only friends can message me</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h4 className="font-bold text-[#3d3430] mb-4 flex items-center gap-2">
            <UserX className="w-5 h-5 text-[#f68c70]" />
            Blocked Users
          </h4>
          
          <p className="text-sm text-[#8c7a6f] mb-3">
            You haven't blocked anyone yet. Blocked users can't see your profile or contact you.
          </p>
          
          <button className="text-[#f55c7a] font-semibold text-sm">
            View blocked list
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h4 className="font-bold text-[#3d3430] mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#f6ac69]" />
            Safety Resources
          </h4>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-2xl hover:bg-[#fff5f0] transition-colors">
              <div className="font-semibold text-[#3d3430]">Safety tips</div>
              <div className="text-sm text-[#8c7a6f]">Learn how to stay safe while meeting new people</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-2xl hover:bg-[#fff5f0] transition-colors">
              <div className="font-semibold text-[#3d3430]">Community guidelines</div>
              <div className="text-sm text-[#8c7a6f]">Read our rules for respectful interactions</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-2xl hover:bg-[#fff5f0] transition-colors">
              <div className="font-semibold text-[#3d3430]">Report a safety issue</div>
              <div className="text-sm text-[#8c7a6f]">Get help if something doesn't feel right</div>
            </button>
          </div>
        </div>
        
        <div className="bg-[#fee5eb] rounded-3xl p-5 border-2 border-[#f55c7a]/20">
          <p className="text-sm text-[#3d3430] leading-relaxed">
            <strong>Important:</strong> Travelmate is not designed for collecting personal identifiable information (PII) or securing highly sensitive data. Always meet in public places and follow safety guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
