import React from 'react';
import { Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Heart className="text-purple-600 mr-2" size={24} />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Campus Connection
            </span>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  {user?.profileImage && (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  )}
                  <span className="text-gray-700">{user?.name}</span>
                </div>
                <button 
                  className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                  onClick={logout}
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;