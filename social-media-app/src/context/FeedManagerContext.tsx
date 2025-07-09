import React, { createContext, useContext, useEffect, useRef } from 'react';
import { FeedManager } from '../services/FeedManager';

interface FeedManagerContextType {
  feedManager: FeedManager;
}

const FeedManagerContext = createContext<FeedManagerContextType | null>(null);

export const useFeedManager = () => {
  const context = useContext(FeedManagerContext);
  if (!context) {
    throw new Error('useFeedManager must be used within a FeedManagerProvider');
  }
  return context;
};

interface FeedManagerProviderProps {
  children: React.ReactNode;
}

export const FeedManagerProvider: React.FC<FeedManagerProviderProps> = ({ children }) => {
  const feedManagerRef = useRef<FeedManager>(new FeedManager());

  useEffect(() => {
    // Set up event listeners for user activity
    const handleUserActivity = () => {
      feedManagerRef.current.onUserActivity();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, []);

  return (
    <FeedManagerContext.Provider value={{ feedManager: feedManagerRef.current }}>
      {children}
    </FeedManagerContext.Provider>
  );
}; 