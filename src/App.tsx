import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Heart, MessageCircle, User } from 'lucide-react';
import Navbar from './components/Navbar';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Login from './pages/Login';
import MatchQuiz from './pages/MatchQuiz';
import MatchResults from './pages/MatchResults';
import { useAuth } from './context/AuthContext';
import { useMessage } from './context/MessageContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { getTotalUnreadCount } = useMessage();
  
  // Determine which tab is active based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/discover') return 'discover';
    if (path.startsWith('/messages')) return 'messages';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';
  const isQuizPage = location.pathname.startsWith('/quiz');
  const isResultsPage = location.pathname.startsWith('/results');

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && isLoginPage) {
      navigate('/discover');
    }
  }, [isAuthenticated, isLoginPage, navigate]);

  // Get unread message count
  const unreadCount = getTotalUnreadCount();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {!isLoginPage && !isQuizPage && !isResultsPage && <Navbar />}
      
      <main className="container mx-auto px-4 py-8 pb-20">
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/messages/:conversationId" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/quiz/:partnerId" element={
            <ProtectedRoute>
              <MatchQuiz />
            </ProtectedRoute>
          } />
          <Route path="/results/:resultId" element={
            <ProtectedRoute>
              <MatchResults />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      {!isLoginPage && !isQuizPage && !isResultsPage && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
          <div className="flex justify-around py-3">
            <button 
              className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-purple-600' : 'text-gray-500'}`}
              onClick={() => navigate('/discover')}
            >
              <Heart size={24} />
              <span className="text-xs mt-1">Discover</span>
            </button>
            <button 
              className={`flex flex-col items-center ${activeTab === 'messages' ? 'text-purple-600' : 'text-gray-500'} relative`}
              onClick={() => navigate('/messages')}
            >
              <MessageCircle size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className="text-xs mt-1">Messages</span>
            </button>
            <button 
              className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-500'}`}
              onClick={() => navigate('/profile')}
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;