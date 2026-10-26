import React, { useState } from 'react';

export default function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const [hasError, setHasError] = useState(false);

  // Compute initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-2xl font-bold',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className={`${currentSizeClass} rounded-full object-cover border border-[#EAE5DE] shadow-xs ${className}`}
      />
    );
  }

  // Graceful initials avatar
  return (
    <div
      className={`${currentSizeClass} rounded-full bg-[#E4ECE7] text-[#19382C] border border-[#7D9D8B]/30 flex items-center justify-center font-serif tracking-wider shadow-xs select-none ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
