import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  onUploadClick: () => void;
  onHomeClick: () => void;
}

export default function Navigation({ onUploadClick, onHomeClick }: NavigationProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* Main navigation bar */}
      <div className="bg-black bg-opacity-80 backdrop-blur-lg border-t border-white border-opacity-20">
        <div className="flex items-center justify-around py-3 px-4">
          {/* Home */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onHomeClick}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-white text-xs">Home</span>
          </motion.button>

          {/* Discover */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <svg className="w-6 h-6 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-white opacity-60 text-xs">Discover</span>
          </motion.button>

          {/* Upload - Center button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onUploadClick}
            className="relative"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-travel-blue to-travel-purple rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </motion.button>

          {/* Messages */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <svg className="w-6 h-6 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-white opacity-60 text-xs">Messages</span>
          </motion.button>

          {/* Profile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-travel-green to-travel-orange"></div>
            <span className="text-white opacity-60 text-xs">Profile</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}