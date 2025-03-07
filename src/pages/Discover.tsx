import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import { profiles } from '../data/profiles';
import { useAuth } from '../context/AuthContext';
import { useMatch } from '../context/MatchContext';
import ConversationStarter from '../components/ConversationStarter';

const Discover: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { calculateCompatibility } = useMatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    college: '',
    minAge: '',
    maxAge: '',
    interests: [] as string[]
  });
  
  // Extract all unique colleges and interests for filter options
  const allColleges = [...new Set(profiles.map(profile => profile.college))];
  const allInterests = [...new Set(profiles.flatMap(profile => profile.interests))];
  
  // Apply filters and search
  const filteredProfiles = profiles.filter(profile => {
    // Search query filter
    const matchesSearch = 
      searchQuery === '' || 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // College filter
    const matchesCollege = filters.college === '' || profile.college === filters.college;
    
    // Age range filter
    const matchesMinAge = filters.minAge === '' || profile.age >= parseInt(filters.minAge);
    const matchesMaxAge = filters.maxAge === '' || profile.age <= parseInt(filters.maxAge);
    
    // Interests filter
    const matchesInterests = 
      filters.interests.length === 0 || 
      filters.interests.some(interest => profile.interests.includes(interest));
    
    return matchesSearch && matchesCollege && matchesMinAge && matchesMaxAge && matchesInterests;
  });
  
  // Sort profiles by compatibility if user is authenticated
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (isAuthenticated) {
      return calculateCompatibility(b.id) - calculateCompatibility(a.id);
    }
    return 0;
  });
  
  const handleInterestToggle = (interest: string) => {
    setFilters(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };
  
  const clearFilters = () => {
    setFilters({
      college: '',
      minAge: '',
      maxAge: '',
      interests: []
    });
  };
  
  // Welcome notification for first-time visitors
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedCampusConnection');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedCampusConnection', 'true');
      
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {showWelcome && (
        <div className="fixed top-20 right-4 p-4 bg-purple-100 text-purple-800 rounded-lg shadow-lg z-50 max-w-md animate-fade-in">
          <h3 className="font-bold mb-2">Welcome to Campus Connection!</h3>
          <p>Discover and connect with students from colleges across Indore. Start exploring profiles and make meaningful connections!</p>
          <button 
            onClick={() => setShowWelcome(false)}
            className="absolute top-2 right-2 text-purple-800"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, college, or interests..."
              className="w-full p-3 pl-10 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          <button 
            className={`p-3 rounded-r-full border border-l-0 border-gray-300 ${showFilters ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-500'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">College</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={filters.college}
                  onChange={(e) => setFilters(prev => ({ ...prev, college: e.target.value }))}
                >
                  <option value="">All Colleges</option>
                  {allColleges.map((college, index) => (
                    <option key={index} value={college}>{college}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Age Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={filters.minAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                    min="18"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                    min={filters.minAge || "18"}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-gray-600 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {allInterests.map((interest, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.interests.includes(interest)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {isAuthenticated && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <ConversationStarter />
          </div>
        )}
      </div>
      
      {sortedProfiles.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters to see more profiles.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {isAuthenticated && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Top Matches for You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProfiles.slice(0, 3).map((profile) => (
                  <ProfileCard 
                    key={profile.id} 
                    profile={profile} 
                    compatibility={calculateCompatibility(profile.id)}
                    showCompatibility={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-bold mb-4">All Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProfiles.map((profile) => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  compatibility={calculateCompatibility(profile.id)}
                  showCompatibility={isAuthenticated}
                />
              ))}
            </div>
          </div>
        </>
      )}
      
      {!isAuthenticated && filteredProfiles.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 text-center">
          <p className="font-medium">Sign up to connect with these profiles and more!</p>
        </div>
      )}
    </>
  );
};

export default Discover;

