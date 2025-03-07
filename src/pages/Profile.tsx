import React, { useState, useRef } from 'react';
import { Camera, Edit2, Upload, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMatch } from '../context/MatchContext';
import { useQuiz } from '../context/QuizContext';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { matches } = useMatch();
  const { quizResults } = useQuiz();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "User",
    age: user?.age || 22,
    college: user?.college || "College",
    bio: user?.bio || "Architecture student with a passion for sustainable design. Love photography and exploring hidden gems in the city.",
    interests: user?.interests || ["Architecture", "Photography", "Sustainability", "Cycling"],
    location: user?.location || "Bhawarkuan, Indore",
    email: user?.email || "user@example.com",
    gender: user?.gender || "Male",
    profileImage: user?.profileImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
    coverImage: user?.coverImage || "https://images.unsplash.com/photo-1557682250-33bd709cbe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [isChangingProfilePic, setIsChangingProfilePic] = useState(false);
  const [isChangingCoverPic, setIsChangingCoverPic] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const profileUrlInputRef = useRef<HTMLInputElement>(null);
  const coverUrlInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const interests = value.split(',').map(interest => interest.trim());
    setFormData(prev => ({ ...prev, interests }));
  };

  const handleProfileImageChange = () => {
    if (profileUrlInputRef.current && profileUrlInputRef.current.value) {
      const newUrl = profileUrlInputRef.current.value;
      setFormData(prev => ({ ...prev, profileImage: newUrl }));
      setIsChangingProfilePic(false);
      
      toast.success('Profile picture updated!');
    }
  };

  const handleCoverImageChange = () => {
    if (coverUrlInputRef.current && coverUrlInputRef.current.value) {
      const newUrl = coverUrlInputRef.current.value;
      setFormData(prev => ({ ...prev, coverImage: newUrl }));
      setIsChangingCoverPic(false);
      
      toast.success('Cover photo updated!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData(formData);
    setIsEditing(false);
    
    // Update user profile in context and localStorage
    updateUserProfile({
      name: formData.name,
      age: formData.age,
      college: formData.college,
      bio: formData.bio,
      interests: formData.interests,
      location: formData.location,
      gender: formData.gender,
      profileImage: formData.profileImage,
      coverImage: formData.coverImage
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div 
          className="relative h-48 bg-cover bg-center" 
          style={{ backgroundImage: `url(${formData.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img 
                src={formData.profileImage} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              <button 
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full"
                onClick={() => setIsChangingProfilePic(true)}
              >
                <Camera size={16} />
              </button>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex space-x-2">
            <button 
              className="bg-white p-2 rounded-full shadow-md"
              onClick={() => setIsChangingCoverPic(true)}
            >
              <Upload size={16} className="text-purple-600" />
            </button>
            <button 
              className="bg-white p-2 rounded-full shadow-md"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={16} className="text-purple-600" />
            </button>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="pt-20 px-8 pb-8">
          {isChangingProfilePic && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Change Profile Picture</h3>
              <div className="flex">
                <input
                  ref={profileUrlInputRef}
                  type="text"
                  placeholder="Enter image URL (e.g., from Unsplash)"
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleProfileImageChange}
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-lg"
                >
                  Update
                </button>
              </div>
              <button
                onClick={() => setIsChangingProfilePic(false)}
                className="mt-2 text-sm text-purple-600"
              >
                Cancel
              </button>
            </div>
          )}
          
          {isChangingCoverPic && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Change Cover Photo</h3>
              <div className="flex">
                <input
                  ref={coverUrlInputRef}
                  type="text"
                  placeholder="Enter image URL (e.g., from Unsplash)"
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleCoverImageChange}
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-lg"
                >
                  Update
                </button>
              </div>
              <button
                onClick={() => setIsChangingCoverPic(false)}
                className="mt-2 text-sm text-purple-600"
              >
                Cancel
              </button>
            </div>
          )}
          
          {/* Profile Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'matches' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('matches')}
            >
              Matches
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'quizzes' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('quizzes')}
            >
              Quiz Results
            </button>
          </div>
          
          {activeTab === 'profile' && (
            <>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="age" className="block text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="block text-gray-700 mb-2">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="college" className="block text-gray-700 mb-2">College</label>
                      <input
                        type="text"
                        id="college"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-gray-700 mb-2">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="interests" className="block text-gray-700 mb-2">Interests (comma separated)</label>
                      <input
                        type="text"
                        id="interests"
                        name="interests"
                        value={formData.interests.join(', ')}
                        onChange={handleInterestChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-1">{profileData.name}, {profileData.age}</h1>
                  <p className="text-gray-600 mb-4">{profileData.college} • {profileData.location}</p>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">About Me</h2>
                    <p className="text-gray-700">{profileData.bio}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="text-gray-800">{profileData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Gender</p>
                        <p className="text-gray-800">{profileData.gender}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          
          {activeTab === 'matches' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
              
              {matches.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600 mb-3">You don't have any matches yet.</p>
                  <p className="text-gray-500 text-sm">Like profiles and take compatibility quizzes to find matches!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map(match => {
                    const profile = match.matchedUserId ? 
                      profiles.find(p => p.id.toString() === match.matchedUserId.toString()) : null;
                    
                    if (!profile) return null;
                    
                    return (
                      <div key={match.id} className="border border-gray-200 rounded-lg p-4 flex items-center">
                        <img 
                          src={profile.image} 
                          alt={profile.name} 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{profile.name}, {profile.age}</h3>
                          <p className="text-gray-600 text-sm">{profile.college}</p>
                          <div className="flex items-center mt-1">
                            <div className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                              {match.compatibility}% Match
                            </div>
                            <span className="text-gray-400 text-xs ml-2">
                              Matched on {new Date(match.matchedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'quizzes' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
              
              {quizResults.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600 mb-3">You haven't taken any compatibility quizzes yet.</p>
                  <p className="text-gray-500 text-sm">Take quizzes with profiles you're interested in to see your compatibility!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizResults.map(result => {
                    const profile = result.partnerId ? 
                      profiles.find(p => p.id.toString() === result.partnerId) : null;
                    
                    if (!profile) return null;
                    
                    return (
                      <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <img 
                            src={profile.image} 
                            alt={profile.name} 
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                          <div>
                            <h3 className="font-semibold">{profile.name}, {profile.age}</h3>
                            <p className="text-gray-600 text-xs">
                              Quiz taken on {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center">
                            <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white font-bold ${
                              result.matchPercentage >= 70 ? 'bg-green-500' : 'bg-orange-500'
                            }`}>
                              {result.matchPercentage}%
                            </div>
                            {result.matchPercentage >= 70 ? (
                              <Check size={20} className="text-green-500 ml-2" />
                            ) : (
                              <X size={20} className="text-orange-500 ml-2" />
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700 text-sm">
                            {result.matchPercentage >= 70 
                              ? `Great match! You and ${profile.name} are highly compatible.` 
                              : `You and ${profile.name} have some differences, but that's okay!`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Profile;