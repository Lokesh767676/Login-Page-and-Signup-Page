import React from 'react';

const Logo: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" width="40" height="40">
      <circle cx="40" cy="40" r="38" fill="rgba(74,159,58,0.1)" stroke="#4a9f3a" strokeWidth="2"/>
      <path d="M12 52 C20 48, 28 48, 36 52 C44 48, 52 48, 60 52 C64 54, 68 58, 68 62 L68 68 L12 68 L12 62 C12 58, 16 54, 20 52 Z" fill="#8BC34A"/>
      <g transform="translate(20, 15)">
        <path d="M8 35 L8 12 M8 12 C6 12, 4 14, 4 16 C4 18, 6 20, 8 20 M8 20 C6 20, 4 22, 4 24 C4 26, 6 28, 8 28 M8 28 C6 28, 4 30, 4 32 C4 34, 6 36, 8 36" stroke="#FFC107" strokeWidth="2" fill="none"/>
        <path d="M20 38 L20 8 M20 8 C18 8, 16 10, 16 12 C16 14, 18 16, 20 16 M20 16 C18 16, 16 18, 16 20 C16 22, 18 24, 20 24 M20 24 C18 24, 16 26, 16 28 C16 30, 18 32, 20 32 M20 32 C18 32, 16 34, 16 36 C16 38, 18 40, 20 40" stroke="#FFD54F" strokeWidth="2" fill="none"/>
        <path d="M32 35 L32 12 M32 12 C30 12, 28 14, 28 16 C28 18, 30 20, 32 20 M32 20 C30 20, 28 22, 28 24 C28 26, 30 28, 32 28 M32 28 C30 28, 28 30, 28 32 C28 34, 30 36, 32 36" stroke="#FFC107" strokeWidth="2" fill="none"/>
      </g>
    </svg>
  );
};

export default Logo;