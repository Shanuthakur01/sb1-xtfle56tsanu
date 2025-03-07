import React, { useState, useRef } from 'react';
import { Heart, AlertCircle, Plus, X, Upload } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated } = useAuth();
  
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/discover';
  
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    college: '',
    photos: [] as string[],
    bio: '',
    interests: [] as string[]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload only image files');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      const newPhotos = [...formData.photos];
      newPhotos[index] = base64;
      setFormData(prev => ({ ...prev, photos: newPhotos }));
      setError('');
    } catch (err) {
      setError('Error processing image. Please try again.');
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.name || !formData.age) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 2:
        if (formData.photos.length < 3) {
          setError('Please add at least three photos');
          return false;
        }
        break;
      case 3:
        if (!formData.bio || formData.interests.length < 3) {
          setError('Please complete your bio and select at least 3 interests');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const commonInterests = [
    'Music', 'Movies', 'Reading', 'Travel', 'Sports',
    'Photography', 'Art', 'Gaming', 'Cooking', 'Fitness',
    'Technology', 'Fashion', 'Dance', 'Writing', 'Hiking'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = login(formData.email, formData.password);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        setError(result.message);
      }
    } else {
      if (!validateStep(currentStep)) return;
      
      const result = signup({
        ...formData,
        profileImage: formData.photos[0],
        additionalPhotos: formData.photos.slice(1)
      });
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        setError(result.message);
      }
    }
  };

  const renderSignupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="age" className="block text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                min="18"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                minLength={6}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Add Your Photos</h3>
            <p className="text-gray-600 text-sm">Add at least 3 photos to create your profile.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRefs[index]}
                    onChange={(e) => handleFileChange(index, e)}
                    className="hidden"
                  />
                  
                  {formData.photos[index] ? (
                    <div className="relative group">
                      <img
                        src={formData.photos[index]}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = [...formData.photos];
                            newPhotos[index] = '';
                            setFormData(prev => ({ ...prev, photos: newPhotos }));
                          }}
                          className="text-white hover:text-red-500"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs[index].current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-500 transition-colors"
                    >
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Photo</span>
                    </button>
                  )}
                  
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="bio" className="block text-gray-700 mb-2">Bio *</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="Tell us about yourself..."
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Interests (select at least 3) *</label>
              <div className="flex flex-wrap gap-2">
                {commonInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.interests.includes(interest)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleInterestChange(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Heart className="text-purple-600" size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Campus Connection
        </h2>
        
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 text-center ${isLogin ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-l-lg`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-center ${!isLogin ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-r-lg`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
              setCurrentStep(1);
            }}
          >
            Sign Up
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === step
                          ? 'bg-purple-600 text-white'
                          : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step ? '✓' : step}
                      </div>
                      {step < 3 && (
                        <div className={`w-full h-1 ${
                          currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Basic Info</span>
                  <span className="text-xs text-gray-500">Photos</span>
                  <span className="text-xs text-gray-500">Bio & Interests</span>
                </div>
              </div>

              {renderSignupStep()}
              
              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Create Account
                  </button>
                )}
              </div>
            </>
          )}
        </form>
        
        {isLogin && (
          <p className="text-center mt-4 text-gray-600">
            Don't have an account?{' '}
            <button
              className="text-purple-600 hover:underline"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
            >
              Sign up
            </button>
          </p>
        )}
        
        <div className="text-center mt-6">
          <button 
            className="text-purple-600 hover:underline"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;