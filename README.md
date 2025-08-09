# 🌍 3D Travel TikTok

A revolutionary social media platform that combines TikTok-style short-form videos with immersive 3D travel experiences. Users can share their travel adventures and explore destinations in stunning 3D environments.

## ✨ Features

### 🎥 TikTok-Style Feed
- **Vertical video scrolling** with smooth animations
- **Auto-playing videos** when posts become active
- **Infinite scroll** with real-time loading
- **Keyboard navigation** (Arrow keys, Space for 3D view)
- **Mobile-optimized** touch gestures

### 🌟 3D Travel Experiences
- **Interactive 3D destinations** using Three.js and React Three Fiber
- **Location-specific 3D models** (Greek temples, Japanese pagodas, mountain landscapes)
- **Floating islands** with atmospheric particles and dynamic lighting
- **Immersive environments** with realistic clouds, oceans, and weather effects
- **Smooth camera controls** with orbit, zoom, and pan

### 🚀 Social Features
- **User profiles** with follower/following system
- **Like, comment, and share** functionality
- **Travel tags** and hashtag discovery
- **Location-based content** discovery
- **Trending destinations** algorithm

### 🎨 Modern UI/UX
- **Glass morphism** design elements
- **Smooth animations** with Framer Motion
- **Travel-focused color palette** (ocean blues, sunset oranges)
- **Responsive design** for all screen sizes
- **Dark theme** optimized for video content

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Three.js** for 3D graphics
- **React Three Fiber** for React-Three.js integration
- **React Three Drei** for 3D helpers and controls
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling
- **Axios** for API communication

### Backend
- **Django 5.0** with Python
- **Django REST Framework** for API
- **SQLite** database (easily upgradeable to PostgreSQL)
- **Django CORS Headers** for cross-origin requests
- **Token Authentication** for secure API access
- **Django Filters** for advanced filtering

## 📁 Project Structure

```
workspace/
├── travel-tiktok/          # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Scene3D.tsx       # 3D environment renderer
│   │   │   ├── TravelFeed.tsx    # Main feed container
│   │   │   ├── TravelPost.tsx    # Individual post component
│   │   │   ├── Navigation.tsx    # Bottom navigation
│   │   │   └── UploadModal.tsx   # Video upload interface
│   │   ├── services/       # API services
│   │   │   └── api.ts            # Django backend integration
│   │   └── App.tsx         # Main application
│   └── public/
├── staple/                 # Django Project Settings
├── works/                  # Django App
│   ├── models.py          # Database models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   ├── urls.py            # URL routing
│   └── management/        # Custom commands
└── manage.py              # Django management
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Install Python dependencies:**
```bash
cd workspace
pip install --break-system-packages djangorestframework django-cors-headers django-filter Pillow
```

2. **Run database migrations:**
```bash
python3 manage.py migrate
```

3. **Create sample data:**
```bash
python3 manage.py populate_data
```

4. **Start Django server:**
```bash
python3 manage.py runserver 8000
```

### Frontend Setup

1. **Install Node dependencies:**
```bash
cd travel-tiktok
npm install
```

2. **Start React development server:**
```bash
npm start
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Django Admin:** http://localhost:8000/admin

## 🎮 How to Use

### Basic Navigation
- **Scroll** up/down or use **arrow keys** to navigate between posts
- **Click videos** to play/pause
- **Press Space** to toggle 3D view (on supported posts)
- **Click user avatars** to view profiles

### 3D Features
- **Mouse/touch controls** to rotate, zoom, and pan in 3D scenes
- **Location-specific models** render based on destination type
- **Interactive elements** with realistic physics and lighting

### Social Interactions
- **Double-tap** or click heart to like posts
- **Tap comment** button to view and add comments
- **Share** posts across different platforms
- **Follow users** to see their content in your feed

## 🎯 Key Features Implemented

### ✅ Completed Features
- [x] **3D Scene Rendering** with location-specific models
- [x] **TikTok-style Feed** with smooth scrolling
- [x] **Video Player** with auto-play functionality
- [x] **User Authentication** and profiles
- [x] **Like/Comment/Share** system
- [x] **Travel Destinations** database
- [x] **Tag-based Discovery** system
- [x] **Responsive Design** for mobile/desktop
- [x] **API Integration** between frontend and backend

### 🚧 Future Enhancements
- [ ] **Video Upload** with file processing
- [ ] **Real-time Chat** for travel communities
- [ ] **AR Integration** for location-based experiences
- [ ] **Travel Planning** tools and itineraries
- [ ] **Social Groups** for travel enthusiasts
- [ ] **Live Streaming** from travel locations

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `GET /api/users/profile/` - Get user profile

### Posts & Feed
- `GET /api/feed/` - Main TikTok-style feed
- `GET /api/posts/` - List posts with filters
- `POST /api/posts/` - Create new post
- `POST /api/posts/{id}/like/` - Like/unlike post
- `POST /api/posts/{id}/share/` - Share post

### Destinations
- `GET /api/destinations/` - List travel destinations
- `GET /api/destinations/trending/` - Trending destinations
- `GET /api/search/` - Global search

## 🎨 Design Philosophy

This app combines the addictive vertical scrolling of TikTok with the wanderlust-inspiring visuals of travel content. The 3D elements aren't just gimmicks—they provide genuine value by letting users virtually "visit" destinations before planning real trips.

### Color Palette
- **Travel Blue:** `#0EA5E9` - Ocean and sky inspiration
- **Travel Green:** `#10B981` - Nature and adventure
- **Travel Orange:** `#F97316` - Sunset and warmth
- **Travel Purple:** `#8B5CF6` - Mystery and exploration

### Typography
- **Inter Font Family** - Clean, modern, highly legible
- **Responsive sizing** from mobile to desktop
- **Weight variations** for hierarchy and emphasis

## 🔧 Technical Highlights

### 3D Rendering Pipeline
1. **Location Detection** - Posts tagged with destination data
2. **Model Selection** - Algorithm chooses appropriate 3D scene type
3. **Environment Generation** - Procedural clouds, water, and atmosphere
4. **Interactive Controls** - Smooth camera movement with physics
5. **Performance Optimization** - Efficient rendering for mobile devices

### Feed Algorithm
1. **Engagement Scoring** - Likes, comments, shares, and view duration
2. **Personalization** - User preferences and follow relationships
3. **Trending Detection** - Recent high-engagement content
4. **3D Content Boost** - Enhanced discovery for immersive posts

### Real-time Features
- **Auto-playing videos** when posts enter viewport
- **Smooth transitions** between posts
- **Lazy loading** for optimal performance
- **Background loading** of 3D assets

## 🤝 Contributing

This is a demonstration project showcasing modern web development techniques. The codebase demonstrates:

- **Clean Architecture** with separated concerns
- **Type Safety** with TypeScript throughout
- **Modern React Patterns** with hooks and context
- **RESTful API Design** with Django REST Framework
- **Responsive Design** with Tailwind CSS
- **3D Graphics Programming** with Three.js

## 📄 License

This project is for demonstration purposes. Feel free to explore the code and use it as inspiration for your own projects!

---

## 🎥 Demo Highlights

The app includes sample data with:
- **5 Travel Destinations** (Santorini, Machu Picchu, Tokyo, Bali, Iceland)
- **5 Sample Users** with varied follower counts
- **Multiple Post Types** showcasing different 3D models
- **Interactive 3D Scenes** for each major destination
- **Realistic Engagement Metrics** for demonstration

**Ready to explore the world in 3D?** 🌍✈️🎥
