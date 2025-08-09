import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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

interface TravelPostProps {
  post: Post;
  isActive: boolean;
  onToggle3D: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}

export default function TravelPost({ post, isActive, onToggle3D }: TravelPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when post becomes active
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Check out this travel post from ${post.user.username}`,
        text: post.content.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={post.content.video}
        loop
        muted
        playsInline
        onClick={handleVideoClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Top bar - User info */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={post.user.avatar}
              alt={post.user.username}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-white font-semibold">{post.user.username}</span>
                {post.user.verified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <span>📍 {post.location.name}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.timestamp)}</span>
              </div>
            </div>
          </div>
          <button className="bg-travel-blue text-white px-4 py-1 rounded-full text-sm font-medium">
            Follow
          </button>
        </div>
      </div>

      {/* Right side actions */}
      <div className="absolute right-4 bottom-20 z-20 flex flex-col space-y-4">
        {/* Like button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="flex flex-col items-center space-y-1"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isLiked ? 'bg-red-500' : 'bg-black bg-opacity-50'
          }`}>
            <svg className={`w-6 h-6 ${isLiked ? 'text-white' : 'text-white'}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">
            {formatNumber(post.stats.likes + (isLiked ? 1 : 0))}
          </span>
        </motion.button>

        {/* Comments button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center space-y-1"
        >
          <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">
            {formatNumber(post.stats.comments)}
          </span>
        </motion.button>

        {/* Share button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="flex flex-col items-center space-y-1"
        >
          <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">
            {formatNumber(post.stats.shares)}
          </span>
        </motion.button>

        {/* 3D View button (if available) */}
        {post.featured3D && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggle3D}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-travel-purple bg-opacity-90 flex items-center justify-center">
              <span className="text-white text-lg">🌍</span>
            </div>
            <span className="text-white text-xs font-medium">3D</span>
          </motion.button>
        )}
      </div>

      {/* Bottom content area */}
      <div className="absolute bottom-4 left-4 right-20 z-20">
        {/* Description */}
        <div className="mb-3">
          <p className="text-white text-sm leading-relaxed">
            {post.content.description}
          </p>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-travel-blue text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Music info */}
        <div className="flex items-center space-x-2 text-white/80 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{post.content.music}</span>
        </div>

        {/* View count */}
        <div className="mt-2 text-white/60 text-xs">
          {formatNumber(post.stats.views)} views
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          className="absolute inset-x-0 bottom-0 z-30 bg-black bg-opacity-90 backdrop-blur-lg rounded-t-3xl max-h-[70vh]"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                {formatNumber(post.stats.comments)} comments
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {/* Mock comments */}
              <div className="flex space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="text-white font-medium text-sm">@traveler_mike</span>
                  <p className="text-white/80 text-sm">This place looks incredible! Adding to my bucket list 🌟</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="text-white font-medium text-sm">@adventure_emma</span>
                  <p className="text-white/80 text-sm">I was there last month! The sunset is even better in person 🌅</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}