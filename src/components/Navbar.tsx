import React, { useState, useEffect } from 'react';
import { Sun, Moon, GraduationCap, Bookmark, MessageSquare, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activeTab: 'home' | 'chat' | 'saved';
  setActiveTab: (tab: 'home' | 'chat' | 'saved') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div 
          className="flex cursor-pointer items-center gap-2" 
          onClick={() => setActiveTab('home')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-main text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Career<span className="text-indigo-600 dark:text-indigo-400">Buddy</span>
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'home' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400'
            }`}
          >
            Get Advice
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'saved' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400'
            }`}
          >
            Saved Advice
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 sm:flex">
                <UserIcon size={20} />
              </div>
              <button
                onClick={() => signOut()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('chat')}
              className="hidden rounded-full bg-gradient-main px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 sm:block"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Icons */}
          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                activeTab === 'chat' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                activeTab === 'saved' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <Bookmark size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
