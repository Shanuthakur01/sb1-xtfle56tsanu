import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age?: number;
  college?: string;
  bio?: string;
  interests?: string[];
  location?: string;
  gender?: string;
  profileImage?: string;
  additionalPhotos?: string[];
  coverImage?: string;
  createdAt: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (userData: any) => { success: boolean; message: string };
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('campusConnectionUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const getRegisteredUsers = (): User[] => {
    const users = localStorage.getItem('campusConnectionUsers');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('campusConnectionUsers', JSON.stringify(users));
  };

  const login = (email: string, password: string) => {
    const users = getRegisteredUsers();
    const foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      toast.error('User not found. Please sign up.');
      return { success: false, message: 'User not found. Please sign up.' };
    }
    
    if (foundUser.password !== password) {
      toast.error('Incorrect password.');
      return { success: false, message: 'Incorrect password.' };
    }
    
    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('campusConnectionUser', JSON.stringify(foundUser));
    
    toast.success('Login successful!');
    return { success: true, message: 'Login successful!' };
  };

  const signup = (userData: any) => {
    const users = getRegisteredUsers();
    
    if (users.some(u => u.email === userData.email)) {
      toast.error('Email already registered. Please login.');
      return { success: false, message: 'Email already registered. Please login.' };
    }
    
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password || !userData.age) {
      toast.error('Please fill in all required fields.');
      return { success: false, message: 'Please fill in all required fields.' };
    }

    // Validate photos
    if (!userData.photos || userData.photos.filter((p: string) => p.trim()).length < 3) {
      toast.error('Please add at least three photos.');
      return { success: false, message: 'Please add at least three photos.' };
    }

    // Validate interests
    if (!userData.interests || userData.interests.length < 3) {
      toast.error('Please select at least three interests.');
      return { success: false, message: 'Please select at least three interests.' };
    }
    
    const emailDomain = userData.email.split('@')[1];
    const isCollegeEmail = emailDomain && (
      emailDomain.includes('edu') || 
      emailDomain.includes('ac.in') || 
      emailDomain.includes('college') ||
      emailDomain.includes('university')
    );
    
    const newUser: User = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      age: userData.age ? parseInt(userData.age) : undefined,
      college: userData.college,
      bio: userData.bio || "",
      interests: userData.interests || [],
      location: userData.location || "Indore",
      gender: userData.gender || "Prefer not to say",
      profileImage: userData.photos[0],
      additionalPhotos: userData.photos.slice(1),
      coverImage: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      createdAt: new Date().toISOString(),
      verified: isCollegeEmail
    };
    
    users.push(newUser);
    saveUsers(users);
    
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('campusConnectionUser', JSON.stringify(newUser));
    
    toast.success('Account created successfully!');
    return { success: true, message: 'Account created successfully!' };
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('campusConnectionUser', JSON.stringify(updatedUser));
    
    const users = getRegisteredUsers();
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    saveUsers(updatedUsers);
    
    toast.success('Profile updated successfully!');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('campusConnectionUser');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      signup, 
      logout, 
      updateUserProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};