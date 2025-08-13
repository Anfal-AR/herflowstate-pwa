# HerFlowState PWA 💜

*A modern, scientific, feminine self-care toolkit for tracking moods, goals, finances, and wellness.*

🔗 **Live Demo:** [https://herflowstate.web.app](https://herflowstate.web.app)

![HerFlowState Homepage](./docs/screenshots/homepage.png)

## 📋 Overview

HerFlowState is a Progressive Web Application (PWA) designed to provide women with a comprehensive, accessible wellness toolkit. The application combines modern web technologies with user-centered design to create an intuitive platform for personal wellness management.

## 🚀 Features

- **Mood Tracker**: Daily emotional wellness monitoring with data visualization
- **Goal Tracker**: Personal goal setting and achievement tracking
- **Financial Care**: Financial wellness management tools
- **Digital Journal**: Reflective writing and documentation space
- **Self-Care Planner**: Wellness activity planning and scheduling
- **Progress Analytics**: Comprehensive wellness metrics and insights

## 🛠️ Technology Stack

### Frontend
- **Next.js 14.2.5** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library

### Deployment & Infrastructure
- **Firebase Hosting** - Static site hosting with global CDN
- **PWA Standards** - Offline functionality and installability
- **Responsive Design** - Mobile-first architecture

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Git** - Version control

## 📱 PWA Features

- ✅ Installable on mobile and desktop devices
- ✅ Offline functionality
- ✅ Responsive design across all screen sizes
- ✅ Fast loading with optimized assets
- ✅ Push notification ready

## 🎨 Design Philosophy

HerFlowState embraces a feminine aesthetic with:
- Soft pink and purple gradient color palette
- Glassmorphism design elements with backdrop blur effects
- Intuitive card-based layout
- Smooth animations and micro-interactions
- Accessibility-first approach

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── goal-tracker/      # Goal tracking module
│   ├── mood-tracker/      # Mood tracking module
│   ├── financial-care/    # Financial wellness module
│   └── layout.tsx         # Root layout component
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
└── styles/               # Global styles and Tailwind config
```

## 🚧 Development Challenges Overcome

### 1. Build Configuration Issues
- **Challenge**: Complex dependency conflicts between Next.js, TypeScript, and Tailwind
- **Solution**: Systematic debugging of build pipeline and dependency resolution

### 2. Static Export for Firebase
- **Challenge**: Next.js app router compatibility with static hosting
- **Solution**: Configured proper static export settings and Firebase hosting integration

### 3. PWA Implementation
- **Challenge**: Service worker registration and offline functionality
- **Solution**: Implemented PWA standards with proper manifest and caching strategies

### 4. Responsive Design Complexity
- **Challenge**: Consistent user experience across device types
- **Solution**: Mobile-first approach with Tailwind's responsive utilities

## 📊 Performance Metrics

- **Bundle Size**: Main pages 1-5KB, total shared JS 89.6KB
- **Build Time**: Optimized for fast compilation
- **Lighthouse Score**: [Add after testing]
- **Loading Speed**: [Add after Google Analytics integration]

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase CLI (for deployment)

### Local Development
```bash
# Clone repository
git clone https://github.com/[your-username]/herflowstate-pwa
cd herflowstate-pwa

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Configuration
```bash
# Required for full functionality
NEXT_PUBLIC_FIREBASE_CONFIG=your_config_here
```

## 🎯 Project Goals

This project was developed as part of a comprehensive "Modern Lady Self-care" initiative, including:
- Blog content and educational resources
- YouTube video series
- Digital wellness templates
- This accessible PWA tool

The goal is to provide free, accessible wellness tools while demonstrating technical proficiency in modern web development.

## 🤝 Contributing

While this is primarily a personal project, feedback and suggestions are welcome through GitHub issues.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👩‍💻 Author

Created with ❤️ as part of a volunteer initiative to enhance women's wellness accessibility.

---

**Tech Stack Summary**: Next.js 14 • TypeScript • Tailwind CSS • Firebase • PWA • Recharts

*Last updated: August 2025*
