import React, { useState } from 'react';
import Home from './tabs/Home';
import LeaderBoard from './tabs/LeaderBoard';
import Compare from './tabs/Compare';
import logo from './assets/logo.png'; // Make sure to place logo.png in src/assets

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'leaderboard' | 'compare'>('home');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow px-10 py-4 flex items-center space-x-10">
  {/* Logo & Title */}
  <div className="flex items-center space-x-3">
    <img src={logo} alt="Job Fit Logo" className="h-10 w-10" />
    <span className="text-2xl font-bold">
      <span className="text-black">Job</span>{' '}
      <span className="text-red-600">Fit</span>
    </span>
  </div>

  {/* Navigation Tabs */}
  <div className="flex items-center space-x-8">
    {[
      { key: 'home', label: 'Home' },
      { key: 'leaderboard', label: 'Leaderboard' },
      { key: 'compare', label: 'Compare' },
    ].map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key as any)}
        className={`text-lg font-semibold transition-colors ${
          activeTab === tab.key
            ? 'text-red-600 border-b-2 border-red-600 pb-1'
            : 'text-gray-800 hover:text-red-500'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'home' && <Home />}
        {activeTab === 'leaderboard' && <LeaderBoard />}
        {activeTab === 'compare' && <Compare />}
      </main>
    </div>
  );
};

export default App;
