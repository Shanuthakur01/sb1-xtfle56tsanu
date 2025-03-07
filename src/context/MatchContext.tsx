import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { profiles } from '../data/profiles';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

interface Match {
  id: string;
  userId: string;
  matchedUserId: number | string;
  matchedAt: string;
  compatibility: number;
  status: 'pending' | 'accepted' | 'rejected';
  isMutual: boolean;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
}

interface MatchContextType {
  matches: Match[];
  pendingMatches: Match[];
  acceptedMatches: Match[];
  likeProfile: (profileId: number, onMatch?: (matchId: string) => void) => void;
  acceptMatch: (matchId: string, onAccept?: (matchId: string) => void) => void;
  rejectMatch: (matchId: string) => void;
  calculateCompatibility: (profileId: number) => number;
  getMatchByProfileId: (profileId: number | string) => Match | undefined;
  checkMutualMatch: (profileId: number | string) => boolean;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);

  // Load matches from localStorage
  useEffect(() => {
    if (user) {
      const storedMatches = localStorage.getItem(`campusConnection_matches_${user.id}`);
      if (storedMatches) {
        setMatches(JSON.parse(storedMatches));
      }
    }
  }, [user]);

  // Save matches to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`campusConnection_matches_${user.id}`, JSON.stringify(matches));
    }
  }, [matches, user]);

  // Filter matches by status
  const pendingMatches = matches.filter(match => match.status === 'pending');
  const acceptedMatches = matches.filter(match => match.status === 'accepted');

  // Calculate compatibility between user and a profile
  const calculateCompatibility = (profileId: number): number => {
    if (!user) return 0;
    
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return 0;
    
    // Enhanced compatibility algorithm based on shared interests and other factors
    const userInterests = user.interests || [];
    const profileInterests = profile.interests;
    
    if (userInterests.length === 0) return 50;
    
    const sharedInterests = profileInterests.filter(interest => 
      userInterests.includes(interest)
    );
    
    // Calculate base compatibility from shared interests
    let compatibility = Math.min(
      Math.round((sharedInterests.length / Math.max(userInterests.length, 1)) * 100),
      100
    );
    
    // Boost compatibility if they're from the same college
    if (user.college && profile.college && user.college === profile.college) {
      compatibility = Math.min(compatibility + 10, 100);
    }
    
    return compatibility;
  };

  // Check if there's a mutual match
  const checkMutualMatch = (profileId: number | string): boolean => {
    if (!user) return false;
    
    const userMatch = matches.find(m => m.matchedUserId === profileId);
    // Simulate the other user's match (in a real app, this would check the other user's matches)
    const otherUserMatch = Math.random() > 0.3; // 70% chance of mutual match for demo
    
    return !!(userMatch && otherUserMatch);
  };

  // Like a profile (create a match)
  const likeProfile = (profileId: number, onMatch?: (matchId: string) => void) => {
    if (!user) return;
    
    // Check if match already exists
    const existingMatch = matches.find(m => m.matchedUserId === profileId);
    if (existingMatch) return;
    
    // Calculate compatibility
    const compatibility = calculateCompatibility(profileId);
    
    // Check for mutual match
    const isMutual = checkMutualMatch(profileId);
    
    // Create new match
    const newMatch: Match = {
      id: uuidv4(),
      userId: user.id,
      matchedUserId: profileId,
      matchedAt: new Date().toISOString(),
      compatibility,
      status: 'pending',
      isMutual
    };
    
    // Add to matches
    setMatches(prev => [...prev, newMatch]);
    
    // If mutual match or high compatibility, notify and trigger callback
    if (isMutual || compatibility >= 80) {
      const profile = profiles.find(p => p.id === profileId);
      
      toast.success(
        isMutual 
          ? `It's a match! You and ${profile?.name} liked each other. Start chatting now!` 
          : `High compatibility match! Start chatting with ${profile?.name}!`,
        { autoClose: 5000 }
      );
      
      if (onMatch) {
        onMatch(newMatch.id);
      }
    }
  };

  // Accept a match
  const acceptMatch = (matchId: string, onAccept?: (matchId: string) => void) => {
    setMatches(prev => 
      prev.map(match => {
        if (match.id === matchId) {
          const updatedMatch = { ...match, status: 'accepted' as const };
          
          // Show notification
          const profile = profiles.find(p => p.id === match.matchedUserId);
          toast.success(`You've accepted the match with ${profile?.name}! Start chatting now.`);
          
          // Trigger callback
          if (onAccept) {
            onAccept(matchId);
          }
          
          return updatedMatch;
        }
        return match;
      })
    );
  };

  // Reject a match
  const rejectMatch = (matchId: string) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, status: 'rejected' as const } 
          : match
      )
    );
  };

  // Get match by profile ID
  const getMatchByProfileId = (profileId: number | string) => {
    return matches.find(match => match.matchedUserId === profileId);
  };

  return (
    <MatchContext.Provider value={{
      matches,
      pendingMatches,
      acceptedMatches,
      likeProfile,
      acceptMatch,
      rejectMatch,
      calculateCompatibility,
      getMatchByProfileId,
      checkMutualMatch
    }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};