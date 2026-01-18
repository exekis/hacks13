import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false
}) => {
  const baseStyles = 'font-semibold rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };
  
  const variantStyles = {
    primary: 'bg-[#f55c7a] text-white hover:bg-[#f6ac69] shadow-md hover:shadow-lg',
    secondary: 'bg-white text-[#f55c7a] border-2 border-[#f55c7a] hover:bg-[#fff5f0]',
    gradient: 'bg-gradient-to-r from-[#f55c7a] via-[#f68c70] to-[#f6ac69] text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

interface TagProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  color?: 'pink' | 'coral' | 'orange' | 'amber' | 'yellow';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  icon,
  color = 'pink',
  size = 'sm',
  className = ''
}) => {
  const colorStyles = {
    pink: 'bg-[#fee5eb] text-[#f55c7a]',
    coral: 'bg-[#ffebe9] text-[#f57c73]',
    orange: 'bg-[#fff0e8] text-[#f68c70]',
    amber: 'bg-[#fff5e5] text-[#f6ac69]',
    yellow: 'bg-[#fff9e5] text-[#f6bc66]'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm'
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]} ${className}`}>
      {icon}
      {children}
    </span>
  );
};

interface BadgeProps {
  type: 'student' | 'age';
  className?: string;
}

export const VerificationBadge: React.FC<BadgeProps> = ({ type, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#f55c7a] to-[#f6ac69] text-white ${className}`}>
      {type === 'student' ? '🎓 Student' : '✓ Age'}
    </span>
  );
};

interface AvatarProps {
  src?: string;
  emoji?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// helper to get initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  emoji,
  name, 
  size = 'md', 
  className = '' 
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };
  
  // determine what to render: image, initials, emoji, or default
  const renderContent = () => {
    if (src) {
      return (
        <img src={src} alt="avatar" className="w-full h-full rounded-full object-cover" />
      );
    }
    if (name) {
      return (
        <span className="font-semibold text-white">{getInitials(name)}</span>
      );
    }
    return <span>{emoji || '👤'}</span>;
  };
  
  return (
    <div className={`${sizeStyles[size]} rounded-full bg-gradient-to-br from-[#f55c7a] to-[#f6ac69] flex items-center justify-center shadow-md ${className}`}>
      {renderContent()}
    </div>
  );
};
