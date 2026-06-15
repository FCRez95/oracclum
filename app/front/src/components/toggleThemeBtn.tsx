'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center p-small rounded-lg bg-bg-primary text-text-on-primary hover:opacity-80 hover:cursor-pointer transition-all"
    >
      {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
      ) : (
          <Moon className="w-5 h-5" />
      )}
    </button>
  );
};
