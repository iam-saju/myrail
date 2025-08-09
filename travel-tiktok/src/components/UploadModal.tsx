import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (post: any) => void;
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [music, setMusic] = useState('');
  const [tags, setTags] = useState('');
  const [featured3D, setFeatured3D] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description || !location) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        user: {
          username: '@your_username',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
          verified: false
        },
        location: {
          name: location,
          coordinates: [0, 0] as [number, number],
          country: 'Unknown'
        },
        content: {
          video: URL.createObjectURL(selectedFile),
          description,
          music: music || 'Original Sound'
        },
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        },
        tags: tags.split(' ').filter(tag => tag.startsWith('#')),
        timestamp: new Date().toISOString(),
        featured3D
      };

      onUpload(newPost);
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      setLocation('');
      setMusic('');
      setTags('');
      setFeatured3D(false);
      setIsUploading(false);
    }, 2000);
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Share Your Journey</h2>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Video Upload */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Upload Video *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-travel-blue transition-colors"
                >
                  {selectedFile ? (
                    <div>
                      <video
                        src={URL.createObjectURL(selectedFile)}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        controls
                      />
                      <p className="text-white text-sm">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v4a1 1 0 01-1 1H7a1 1 0 01-1-1V2m0 2v12a2 2 0 002 2h8a2 2 0 002-2V6" />
                      </svg>
                      <p className="text-gray-400">Click to upload your travel video</p>
                      <p className="text-gray-500 text-sm mt-1">MP4, MOV up to 100MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your amazing travel experience..."
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 focus:border-travel-blue focus:outline-none resize-none"
                  rows={3}
                  maxLength={150}
                />
                <div className="text-right text-gray-400 text-xs mt-1">
                  {description.length}/150
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where was this taken?"
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 focus:border-travel-blue focus:outline-none"
                />
              </div>

              {/* Music/Sound */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Music/Sound
                </label>
                <input
                  type="text"
                  value={music}
                  onChange={(e) => setMusic(e.target.value)}
                  placeholder="Add music or sound description"
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 focus:border-travel-blue focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#travel #adventure #wanderlust"
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 focus:border-travel-blue focus:outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">Separate tags with spaces</p>
              </div>

              {/* 3D Feature Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-white text-sm font-medium">
                    Enable 3D View
                  </label>
                  <p className="text-gray-400 text-xs">Allow users to explore this location in 3D</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatured3D(!featured3D)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    featured3D ? 'bg-travel-purple' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      featured3D ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Upload Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !description || !location}
                className="w-full bg-gradient-to-r from-travel-blue to-travel-purple text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Share Your Journey'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}