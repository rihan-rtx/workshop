import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, BookOpen, IndianRupee, ArrowRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const features = [
    {
      icon: <Target className="text-indigo-500" />,
      title: "Career Paths",
      description: "Discover paths that align with your unique skills and interests."
    },
    {
      icon: <BookOpen className="text-purple-500" />,
      title: "Free Courses",
      description: "Get curated links to top-tier free learning resources."
    },
    {
      icon: <IndianRupee className="text-indigo-500" />,
      title: "Salary Insights",
      description: "Know your worth with real-world salary data for the Indian market."
    },
    {
      icon: <Sparkles className="text-purple-500" />,
      title: "AI Powered",
      description: "Personalized guidance powered by advanced AI models."
    }
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900">
      {/* Background blobs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5"></div>
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/5"></div>

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
              Your AI Career <span className="text-gradient-main">Counselor</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              CareerBuddy helps college students find their dream career path, learn new skills, 
              and discover free courses—all tailored to your profile.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={onStart}
                className="group flex items-center gap-2 rounded-full bg-gradient-main px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 active:scale-95"
              >
                Start Counseling Now
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full border border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            id="features"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-sm transition-all hover:border-indigo-100 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-indigo-900/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
