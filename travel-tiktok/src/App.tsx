import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import TravelFeed from './components/TravelFeed';
import TravelPost from './components/TravelPost';
import Navigation from './components/Navigation';
import Scene3D from './components/Scene3D';
import UploadModal from './components/UploadModal';
import { postsAPI, TravelPost as TravelPostType } from './services/api';
import './App.css';

// Mock travel data (fallback)
const mockTravelPosts: TravelPostType[] = [
  {
    id: 1,
    user: {
      username: '@wanderlust_sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face',
      verified: true
    },
    location: {
      name: 'Santorini, Greece',
      coordinates: [25.4615, 36.3932],
      country: 'Greece'
    },
    content: {
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      description: 'Sunset vibes in Santorini 🌅 The most magical place on earth! #santorini #greece #sunset #travel',
      music: 'Summer Vibes - Chill Mix'
    },
    stats: {
      likes: 125400,
      comments: 3200,
      shares: 890,
      views: 2300000
    },
    tags: ['#santorini', '#greece', '#sunset', '#travel'],
    timestamp: '2024-01-15T18:30:00Z',
    featured3D: true
  },
  {
    id: 2,
    user: {
      username: '@adventure_alex',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      verified: false
    },
    location: {
      name: 'Machu Picchu, Peru',
      coordinates: [-72.5450, -13.1631],
      country: 'Peru'
    },
    content: {
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      description: 'Finally made it to Machu Picchu! 4-day trek was worth every step 🏔️ #machupicchu #peru #hiking #adventure',
      music: 'Adventure Awaits - Epic Mix'
    },
    stats: {
      likes: 89300,
      comments: 2100,
      shares: 567,
      views: 1800000
    },
    tags: ['#machupicchu', '#peru', '#hiking', '#adventure'],
    timestamp: '2024-01-14T14:22:00Z',
    featured3D: false
  },
  {
    id: 3,
    user: {
      username: '@tokyo_tales',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      verified: true
    },
    location: {
      name: 'Tokyo, Japan',
      coordinates: [139.6917, 35.6895],
      country: 'Japan'
    },
    content: {
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      description: 'Cherry blossom season in Tokyo is unreal! 🌸 Traditional meets modern everywhere you look ✨ #tokyo #japan #sakura #culture',
      music: 'Japanese Lofi - Peaceful'
    },
    stats: {
      likes: 156700,
      comments: 4800,
      shares: 1200,
      views: 3100000
    },
    tags: ['#tokyo', '#japan', '#sakura', '#culture'],
    timestamp: '2024-01-13T09:15:00Z',
    featured3D: true
  }
];

function App() {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [show3DScene, setShow3DScene] = useState(false);
  const [posts, setPosts] = useState<TravelPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getFeed(0, 10);
        if (response.results && response.results.length > 0) {
          setPosts(response.results);
        } else {
          // Fallback to mock data if no posts from API
          setPosts(mockTravelPosts);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        // Fallback to mock data on error
        setPosts(mockTravelPosts);
        setError('Failed to load posts. Using demo data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle keyboard navigation (like TikTok)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setCurrentPostIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setCurrentPostIndex(prev => Math.min(posts.length - 1, prev + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setShow3DScene(!show3DScene);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [posts.length, show3DScene]);

  const currentPost = posts[currentPostIndex];

  // Loading state
  if (loading) {
    return (
      <div className="App relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-travel-blue border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-white text-xl font-bold mb-2">Loading Travel Stories...</h2>
          <p className="text-gray-400">Discovering amazing destinations for you</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App relative w-full h-screen overflow-hidden bg-black">
        {/* Error notification */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-500 bg-opacity-90 text-white p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
        <Routes>
          <Route path="/" element={
            <div className="relative w-full h-full">
              {/* Main Feed */}
              <TravelFeed 
                posts={posts}
                currentIndex={currentPostIndex}
                onIndexChange={setCurrentPostIndex}
                onToggle3D={() => setShow3DScene(!show3DScene)}
              />

              {/* 3D Scene Overlay */}
              <AnimatePresence>
                {show3DScene && currentPost?.featured3D && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-50"
                  >
                    <div className="w-full h-full">
                      <Canvas>
                        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                        <Scene3D location={currentPost.location} />
                      </Canvas>
                      
                      {/* Close button */}
                      <button
                        onClick={() => setShow3DScene(false)}
                        className="absolute top-4 right-4 z-60 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        ✕
                      </button>
                      
                      {/* 3D Scene Info */}
                      <div className="absolute bottom-4 left-4 right-4 z-60">
                        <div className="glass rounded-xl p-4 text-white">
                          <h3 className="text-xl font-bold">{currentPost.location.name}</h3>
                          <p className="text-sm opacity-80">Explore this destination in 3D</p>
                          <div className="flex items-center mt-2 text-xs opacity-60">
                            <span>🌐 {currentPost.location.coordinates[1].toFixed(4)}, {currentPost.location.coordinates[0].toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <Navigation 
                onUploadClick={() => setIsUploadModalOpen(true)}
                onHomeClick={() => setCurrentPostIndex(0)}
              />

              {/* Upload Modal */}
              <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={(newPost) => {
                  setPosts([newPost, ...posts]);
                  setIsUploadModalOpen(false);
                }}
              />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
