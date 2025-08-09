import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TravelPost from './TravelPost';

interface User {
  username: string;
  avatar: string;
  verified: boolean;
}

interface Location {
  name: string;
  coordinates: [number, number];
  country: string;
}

interface Content {
  video: string;
  description: string;
  music: string;
}

interface Stats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface Post {
  id: number;
  user: User;
  location: Location;
  content: Content;
  stats: Stats;
  tags: string[];
  timestamp: string;
  featured3D: boolean;
}

interface TravelFeedProps {
  posts: Post[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onToggle3D: () => void;
}

export default function TravelFeed({ posts, currentIndex, onIndexChange, onToggle3D }: TravelFeedProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle wheel/scroll events for navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      
      setIsScrolling(true);
      
      if (e.deltaY > 0 && currentIndex < posts.length - 1) {
        // Scroll down
        onIndexChange(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll up
        onIndexChange(currentIndex - 1);
      }
      
      // Reset scrolling flag after a delay
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (feedElement) {
        feedElement.removeEventListener('wheel', handleWheel);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, posts.length, onIndexChange, isScrolling]);

  // Handle touch events for mobile navigation
  useEffect(() => {
    let startY: number = 0;
    let endY: number = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;
      
      if (Math.abs(deltaY) > 50) { // Minimum swipe distance
        if (deltaY > 0 && currentIndex < posts.length - 1) {
          // Swipe up - next post
          onIndexChange(currentIndex + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          // Swipe down - previous post
          onIndexChange(currentIndex - 1);
        }
      }
    };

    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('touchstart', handleTouchStart);
      feedElement.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (feedElement) {
        feedElement.removeEventListener('touchstart', handleTouchStart);
        feedElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, posts.length, onIndexChange]);

  return (
    <div 
      ref={feedRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Posts container */}
      <div className="relative w-full h-full">
        {posts.map((post, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === currentIndex - 1;
          const isNext = index === currentIndex + 1;
          
          // Only render current, previous, and next posts for performance
          if (!isActive && !isPrev && !isNext) {
            return null;
          }

          let yOffset = 0;
          if (isPrev) yOffset = -100;
          if (isNext) yOffset = 100;

          return (
            <motion.div
              key={post.id}
              className="absolute inset-0 w-full h-full"
              initial={{ y: '100vh' }}
              animate={{ 
                y: `${yOffset}vh`,
                scale: isActive ? 1 : 0.95,
                opacity: isActive ? 1 : 0.7
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.6
              }}
              style={{ zIndex: isActive ? 10 : 1 }}
            >
              <TravelPost 
                post={post} 
                isActive={isActive}
                onToggle3D={onToggle3D}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Scroll indicators */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="glass rounded-full px-4 py-2 text-white text-sm flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-xs">↑↓</span>
            <span>Scroll</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs">Space</span>
            <span>3D View</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isScrolling && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}