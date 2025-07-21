import React from 'react';
import { useTheme } from '../types/ThemeContext';
import { Search, User, ShoppingCart, Home, Info, Mail, Grid, Monitor } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';

interface HeaderProps {
  onProfileClick: () => void;
  onNavigate: (section: string) => void;
  currentSection: string;
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onNavigate, currentSection, cartItemCount }) => {
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/20 ${theme === 'night' ? 'bg-slate-900/80 backdrop-blur-xl' : 'bg-yellow-100/80 backdrop-blur-xl'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Monitor className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme === 'night' ? 'text-white' : 'text-yellow-900'}`}>FRIENDS IT ZONE</h1>
              <p className={`text-xs ${theme === 'night' ? 'text-cyan-400' : 'text-yellow-700'}`}>Electronics & IT Solutions</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'home'
                  ? theme === 'night'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-yellow-300/20 text-yellow-700 border border-yellow-400/30 shadow-lg shadow-yellow-500/10'
                  : theme === 'night'
                    ? 'text-white hover:text-cyan-400 hover:bg-white/10'
                    : 'text-yellow-900 hover:text-yellow-700 hover:bg-yellow-100/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'about'
                  ? theme === 'night'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-yellow-300/20 text-yellow-700 border border-yellow-400/30 shadow-lg shadow-yellow-500/10'
                  : theme === 'night'
                    ? 'text-white hover:text-cyan-400 hover:bg-white/10'
                    : 'text-yellow-900 hover:text-yellow-700 hover:bg-yellow-100/10'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'contact'
                  ? theme === 'night'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-yellow-300/20 text-yellow-700 border border-yellow-400/30 shadow-lg shadow-yellow-500/10'
                  : theme === 'night'
                    ? 'text-white hover:text-cyan-400 hover:bg-white/10'
                    : 'text-yellow-900 hover:text-yellow-700 hover:bg-yellow-100/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'categories'
                  ? theme === 'night'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-yellow-300/20 text-yellow-700 border border-yellow-400/30 shadow-lg shadow-yellow-500/10'
                  : theme === 'night'
                    ? 'text-white hover:text-cyan-400 hover:bg-white/10'
                    : 'text-yellow-900 hover:text-yellow-700 hover:bg-yellow-100/10'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Categories</span>
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => onNavigate('cart')}
                  className={`p-3 rounded-xl border transition-all duration-300 hover:scale-105 backdrop-blur-sm relative ${theme === 'night' ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-yellow-200/40 hover:bg-yellow-300/40 border-yellow-400/30'}`}
                >
                  <ShoppingCart className={`w-5 h-5 ${theme === 'night' ? 'text-white' : 'text-yellow-900'}`} />
                  {cartItemCount > 0 && (
                    <span className={`absolute -top-2 -right-2 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg ${theme === 'night' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'}`}>
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <div className="flex items-center space-x-3">
              {user && (
                <div className="hidden md:block text-right">
                  <p className={`font-medium ${theme === 'night' ? 'text-white' : 'text-yellow-900'}`}>{user.name}</p>
                  <p className={`text-sm ${theme === 'night' ? 'text-cyan-400' : 'text-yellow-700'}`}>{user.points} points</p>
                </div>
              )}
              <button
                onClick={onProfileClick}
                className={`p-3 rounded-xl border transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-lg ${theme === 'night' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-500/30 border-cyan-400/30 shadow-cyan-500/10' : 'bg-gradient-to-br from-yellow-200/40 to-yellow-400/40 hover:from-yellow-300/40 hover:to-yellow-500/40 border-yellow-400/30 shadow-yellow-500/10'}`}
              >
                <User className={`w-5 h-5 ${theme === 'night' ? 'text-cyan-400' : 'text-yellow-900'}`} />
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className={`ml-4 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border ${theme === 'night' ? 'bg-slate-800 text-cyan-300 border-cyan-400 hover:bg-slate-700' : 'bg-yellow-200 text-yellow-900 border-yellow-400 hover:bg-yellow-300'}`}
              aria-label="Toggle Day/Night Mode"
            >
              {theme === 'night' ? 'Day Mode ☀️' : 'Night Mode 🌙'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;