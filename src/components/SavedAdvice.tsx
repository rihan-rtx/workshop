import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Calendar, MessageSquare, Copy, Check, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { isSupabaseConfigured } from '../lib/supabase';

interface SavedAdvice {
// ... (rest of the interface)
  id: string;
  text: string;
  timestamp: string;
}

export const SavedAdvice: React.FC = () => {
  const { user } = useAuth();
  const [savedAdvice, setSavedAdvice] = useState<SavedAdvice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSavedAdvice();
    }
  }, [user]);

  const fetchSavedAdvice = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_advice')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAdvice(data.map(s => ({
        id: s.id,
        text: s.text,
        timestamp: s.created_at
      })));
    } catch (error) {
      console.error('Error fetching saved advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeAdvice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_advice')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSavedAdvice(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error removing advice:', error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearAll = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to clear all saved advice?')) {
      try {
        const { error } = await supabase
          .from('saved_advice')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
        setSavedAdvice([]);
      } catch (error) {
        console.error('Error clearing saved advice:', error);
      }
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-900">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Bookmark size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Supabase Configuration Required</h3>
        <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
          Please configure Supabase to view and manage your saved career advice.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Advice</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Your bookmarked career guidance and recommendations.</p>
          </div>
          {savedAdvice.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {savedAdvice.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-800 dark:bg-gray-800/50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-gray-800">
              <Bookmark size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No saved advice yet</h3>
            <p className="mt-2 max-w-xs text-gray-600 dark:text-gray-400">
              Bookmark helpful responses from CareerBuddy to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {savedAdvice.map((advice) => (
                <motion.div
                  key={advice.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-4 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        {new Date(advice.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <MessageSquare size={14} />
                        Career Advice
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(advice.text, advice.id)}
                        className={cn(
                          "rounded-full p-2 transition-colors",
                          copiedId === advice.id ? "text-green-600 dark:text-green-400" : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                        )}
                        title="Copy to clipboard"
                      >
                        {copiedId === advice.id ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      <button
                        onClick={() => removeAdvice(advice.id)}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Remove from saved"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="markdown-body">
                    <Markdown>{advice.text}</Markdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
