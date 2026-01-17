import React from 'react';
import { Button } from '@/app/components/DesignSystem';
import { Shield, AlertTriangle } from 'lucide-react';

interface SafetyModalProps {
  onClose: () => void;
}

export const SafetyCheckInModal: React.FC<SafetyModalProps> = ({ onClose }) => {
  const [step, setStep] = React.useState<'checkin' | 'feedback' | 'complete'>('checkin');
  
  if (step === 'complete') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-[#3d3430] mb-2">Thanks for checking in!</h3>
            <p className="text-[#8c7a6f] mb-6">
              Your safety feedback helps us keep the community secure.
            </p>
            <Button variant="gradient" size="md" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (step === 'feedback') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#f55c7a]" />
            <h3 className="text-2xl font-bold text-[#3d3430]">How was your experience?</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setStep('complete')}
              className="w-full p-4 rounded-2xl bg-[#fff5f0] hover:bg-[#ffebe9] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">😊</span>
                <div>
                  <div className="font-semibold text-[#3d3430]">Great experience!</div>
                  <div className="text-sm text-[#8c7a6f]">I had a good time</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setStep('complete')}
              className="w-full p-4 rounded-2xl bg-[#fff5f0] hover:bg-[#ffebe9] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">😐</span>
                <div>
                  <div className="font-semibold text-[#3d3430]">It was okay</div>
                  <div className="text-sm text-[#8c7a6f]">Not great, not bad</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setStep('complete')}
              className="w-full p-4 rounded-2xl bg-[#fee5eb] hover:bg-[#fdd5e0] transition-colors text-left border-2 border-[#f55c7a]/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold text-[#3d3430]">Report an issue</div>
                  <div className="text-sm text-[#8c7a6f]">Something felt off</div>
                </div>
              </div>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full text-center text-[#8c7a6f] hover:text-[#3d3430] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-[#f55c7a]" />
          <h3 className="text-2xl font-bold text-[#3d3430]">Safety check-in</h3>
        </div>
        
        <p className="text-[#3d3430] mb-6 leading-relaxed">
          Did you get home safely after meeting up?
        </p>
        
        <div className="space-y-3 mb-4">
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setStep('feedback')}
            className="w-full"
          >
            ✓ Yes, I'm safe
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={() => alert('Emergency services contacted')}
            className="w-full border-[#d4183d] text-[#d4183d] hover:bg-[#fee5eb]"
          >
            <AlertTriangle className="w-5 h-5" />
            Need help
          </Button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full text-center text-[#8c7a6f] hover:text-[#3d3430] transition-colors"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
};

interface ReportScreenProps {
  onBack: () => void;
  reportedUserId?: string;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ onBack, reportedUserId }) => {
  const [selectedReason, setSelectedReason] = React.useState('');
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [blockUser, setBlockUser] = React.useState(false);
  
  const reasons = [
    'Inappropriate behavior',
    'Harassment or bullying',
    'Fake profile or scam',
    'Spam or advertising',
    'Safety concern',
    'Other'
  ];
  
  const handleSubmit = () => {
    alert('Report submitted. Our team will review this within 24 hours.');
    onBack();
  };
  
  return (
    <div className="min-h-screen bg-[#fef9f6] p-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-6 text-[#f55c7a] flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-[#d4183d]" />
          <h2 className="text-3xl font-bold text-[#3d3430]">Report an issue</h2>
        </div>
        
        <p className="text-[#8c7a6f] mb-6">
          Help us keep Travelmate safe. All reports are confidential and reviewed by our team.
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-3">
              What happened?
            </label>
            <div className="space-y-2">
              {reasons.map(reason => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-[#fee5eb] border-2 border-[#f55c7a]'
                      : 'bg-white border-2 border-[#f5ede8] hover:border-[#f55c7a]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-5 h-5 accent-[#f55c7a]"
                  />
                  <span className="text-[#3d3430]">{reason}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#3d3430] mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Please provide any additional context..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#f5ede8] focus:border-[#f55c7a] outline-none transition-colors resize-none"
            />
          </div>
          
          <div className="bg-white rounded-2xl p-4 border-2 border-[#f5ede8]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={blockUser}
                onChange={(e) => setBlockUser(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded accent-[#f55c7a]"
              />
              <div>
                <div className="font-semibold text-[#3d3430] mb-1">Block this user</div>
                <div className="text-sm text-[#8c7a6f]">
                  They won't be able to see your profile or contact you
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <Button
          variant="gradient"
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedReason}
          className="w-full"
        >
          Submit report
        </Button>
        
        <p className="text-center text-xs text-[#8c7a6f] mt-4">
          Reports are reviewed within 24 hours. For emergencies, please contact local authorities.
        </p>
      </div>
    </div>
  );
};
