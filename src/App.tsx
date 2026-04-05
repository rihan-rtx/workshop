/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ChatInterface } from './components/ChatInterface';
import { SavedAdvice } from './components/SavedAdvice';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthUI } from './components/AuthUI';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'saved'>('home');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-gray-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        {activeTab === 'home' && (
          <Hero onStart={() => setActiveTab(user ? 'chat' : 'saved')} />
        )}
        
        {activeTab === 'chat' && (
          user ? <ChatInterface /> : <AuthUI />
        )}
        
        {activeTab === 'saved' && (
          user ? <SavedAdvice /> : <AuthUI />
        )}
      </main>

      {activeTab === 'home' && (
        <footer className="border-t border-gray-100 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} CareerBuddy. Empowering students to build their future.
            </p>
            <div className="mt-4 flex justify-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Contact Us</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
