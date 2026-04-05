import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Bookmark, BookmarkCheck, Trash2, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { getCareerAdvice } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { isSupabaseConfigured } from '../lib/supabase';

interface Message {
// ... (rest of the interface)
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface SavedAdvice {
  id: string;
  text: string;
  timestamp: string;
}

export const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedAdviceIds, setSavedAdviceIds] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchSavedAdvice();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.created_at
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchSavedAdvice = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_advice')
        .select('message_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setSavedAdviceIds(data.map(s => s.message_id));
    } catch (error) {
      console.error('Error fetching saved advice:', error);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    try {
      // 1. Save user message to Supabase
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('messages')
        .insert([{ 
          user_id: user.id, 
          role: 'user', 
          text: userText 
        }])
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      const newUserMessage: Message = {
        id: userMsgData.id,
        role: 'user',
        text: userText,
        timestamp: userMsgData.created_at
      };

      setMessages(prev => [...prev, newUserMessage]);

      // 2. Get AI response
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      chatHistory.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      const response = await getCareerAdvice(chatHistory);
      
      // 3. Save AI message to Supabase
      const { data: botMsgData, error: botMsgError } = await supabase
        .from('messages')
        .insert([{ 
          user_id: user.id, 
          role: 'model', 
          text: response 
        }])
        .select()
        .single();

      if (botMsgError) throw botMsgError;

      const botMessage: Message = {
        id: botMsgData.id,
        role: 'model',
        text: response,
        timestamp: botMsgData.created_at
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = async (message: Message) => {
    if (!user) return;

    const isSaved = savedAdviceIds.includes(message.id);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_advice')
          .delete()
          .eq('user_id', user.id)
          .eq('message_id', message.id);
        
        if (error) throw error;
        setSavedAdviceIds(prev => prev.filter(id => id !== message.id));
      } else {
        const { error } = await supabase
          .from('saved_advice')
          .insert([{ 
            user_id: user.id, 
            message_id: message.id,
            text: message.text
          }]);
        
        if (error) throw error;
        setSavedAdviceIds(prev => [...prev, message.id]);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to clear your chat history?')) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-900">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Bot size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Supabase Configuration Required</h3>
        <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
          To enable persistent chat and saved advice, please set your Supabase credentials in the 
          <span className="font-semibold"> Secrets</span> panel:
        </p>
        <div className="mt-6 w-full max-w-sm space-y-2 text-left text-xs font-mono">
          <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800 dark:text-gray-300">VITE_SUPABASE_URL</div>
          <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800 dark:text-gray-300">VITE_SUPABASE_ANON_KEY</div>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Career Counseling Session</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tell me about your skills, year, and interests.</p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 sm:p-6"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Bot size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hi, I'm CareerBuddy!</h3>
            <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
              I'm here to help you find your path. Try saying something like:
              <br />
              <span className="mt-2 block italic text-indigo-600 dark:text-indigo-400">
                "I'm a 3rd year CS student interested in AI and web development. I know Python and React. What should I do next?"
              </span>
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full gap-4",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm",
                message.role === 'user' 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
              )}>
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={cn(
                "group relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%]",
                message.role === 'user'
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <Markdown>{message.text}</Markdown>
                </div>
                
                {message.role === 'model' && (
                  <div className="absolute -right-10 top-0 flex flex-col gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <button
                      onClick={() => toggleSave(message)}
                      className={cn(
                        "p-2 transition-colors",
                        savedAdviceIds.includes(message.id) ? "text-indigo-600 dark:text-indigo-400 opacity-100" : "text-gray-400 hover:text-indigo-600"
                      )}
                      title={savedAdviceIds.includes(message.id) ? "Unsave advice" : "Save advice"}
                    >
                      {savedAdviceIds.includes(message.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(message.text, message.id)}
                      className={cn(
                        "p-2 transition-colors",
                        copiedId === message.id ? "text-green-600 dark:text-green-400" : "text-gray-400 hover:text-indigo-600"
                      )}
                      title="Copy to clipboard"
                    >
                      {copiedId === message.id ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
                
                <span className={cn(
                  "mt-1 block text-[10px] opacity-50",
                  message.role === 'user' ? "text-right" : "text-left"
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400">
              <Bot size={20} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
              <Loader2 size={20} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">CareerBuddy is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <form 
          onSubmit={handleSend}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your skills, year, and interests..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-main text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          CareerBuddy can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};
