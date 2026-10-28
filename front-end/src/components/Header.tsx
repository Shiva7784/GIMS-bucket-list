import React, { useState } from 'react';
import { Globe2, User, LogOut } from 'lucide-react';
import SearchBar from './SearchBar';

interface HeaderProps {
  onOpenProfile?: () => void;
  onNavigate?: (page: string | null) => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenProfile, onNavigate, className }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuth = () => setIsAuthenticated(!isAuthenticated);

  return (
    <header className={`bg-white shadow-sm ${className || ''}`}>
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 whitespace-nowrap">Travel Bucket List</h1>
        </div>

        {onNavigate && (
          <div className="flex-1 w-full order-3 md:order-none md:w-auto">
            <SearchBar onNavigate={onNavigate} />
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <User className="w-5 h-5" /> Profile
              </button>
              <button
                onClick={handleAuth}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </>
          ) : (
            <>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</button>
              <button
                onClick={handleAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
