# 🌳 LegacyLink - Family Tree App

**A photo-first, privacy-focused family tree application with African-inspired design**

LegacyLink is a modern React Native/Expo family tree app that helps you preserve and share your family's stories through photos, voice recordings, and rich biographical information.

## ✨ Features

### 📱 Core Functionality
- **Photo-First Design**: Visual family tree with profile photos
- **Voice Stories**: Record and preserve family stories with voice notes
- **Rich Biographies**: Detailed family member profiles with AI-generated biographies
- **Relationship Mapping**: Advanced relationship visualization and management
- **Media Galleries**: Comprehensive photo, video, and document storage

### 🔍 Advanced Search & Discovery
- **Smart Search**: Intelligent search with relevance scoring
- **Advanced Filtering**: Filter by gender, living status, media presence
- **Family Insights**: AI-powered suggestions for missing information
- **Connection Discovery**: Find isolated family members and suggest connections

### 📤 Export & Sharing
- **PDF Generation**: Professional family tree documents with multiple layouts
- **Data Backup**: Complete JSON export for data portability
- **Image Export**: High-quality family tree images
- **Multiple Formats**: Tree, list, and timeline layouts
- **Sharing Options**: Built-in sharing with future social media integration

### 🔐 Privacy & Security
- **Local Storage**: All data stored locally on device
- **No Cloud Dependency**: Works completely offline
- **Secure Backups**: Encrypted data export options
- **Privacy-First**: No tracking or data collection

### 🎨 Design & UX
- **African-Inspired UI**: Warm color palette (#D2691E, #8B4513, #FFFBEB)
- **Modern Typography**: Inter and Playfair Display fonts
- **Responsive Design**: Optimized for mobile devices
- **Intuitive Navigation**: Tab-based navigation with clear iconography

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mutisyavin/familyLink.git
   cd familyLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (mobile)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## 📁 Project Structure

```
project/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   │   ├── index.tsx      # Home/Tree view
│   │   ├── search.tsx     # Search & Discovery
│   │   ├── export.tsx     # Export & Sharing
│   │   ├── add.tsx        # Add Member
│   │   ├── members.tsx    # Member List
│   │   ├── timeline.tsx   # Timeline View
│   │   ├── relationships.tsx # Relationship Mapping
│   │   └── settings.tsx   # Settings
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ExportShare.tsx    # Export & sharing modal
│   ├── FamilyDiscovery.tsx # Smart insights
│   ├── RelationshipMapper.tsx # SVG relationship visualization
│   ├── MediaGallery.tsx   # Media management
│   ├── VoiceRecorder.tsx  # Voice note recording
│   ├── AIBiographyGenerator.tsx # AI biography generation
│   └── ...
├── types/                 # TypeScript type definitions
│   └── FamilyMember.ts    # Core data types
├── utils/                 # Utility functions
│   ├── exportService.ts   # Export functionality
│   ├── aiService.ts       # AI integration
│   └── ...
└── constants/             # App constants and configuration
```

## 🛠 Technology Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library

### Storage & Data
- **AsyncStorage**: Local data persistence
- **Firebase**: Cloud sync and real-time collaboration
- **Expo FileSystem**: File management

### Media & Export
- **Expo Camera**: Photo capture
- **Expo AV**: Audio recording and playback
- **Expo Print**: PDF generation
- **Expo Sharing**: File sharing capabilities
- **React Native View Shot**: Screenshot capture

### AI & Services
- **OpenAI API**: AI biography generation
- **Expo Speech**: Text-to-speech functionality

### UI & Design
- **Lucide React Native**: Modern icon library
- **React Native SVG**: Vector graphics
- **Expo Linear Gradient**: Gradient backgrounds
- **Expo Blur**: Blur effects

## 📋 Development Phases

### ✅ Phase 1.5: Authentication & Onboarding
- User authentication system
- Welcome screens and onboarding flow
- Founder creation and kinship mapping
- Gender selection and basic profile setup

### ✅ Phase 2: Voice Stories & Timeline
- Voice recording and playback
- Timeline view for chronological family history
- AI biography generation with OpenAI integration
- Firebase cloud sync and real-time collaboration

### ✅ Phase 3: Advanced Relationship Mapping
- SVG-based relationship visualization
- Interactive family tree with zoom and pan
- Complex relationship handling (marriages, adoptions)
- Visual connection indicators

### ✅ Phase 4: Enhanced Media Management
- Comprehensive media gallery
- Photo, video, and document support
- Media categorization and tagging
- Bulk media operations

### ✅ Phase 5: Advanced Search & Discovery
- Smart search with relevance scoring
- Advanced filtering and suggestions
- Family insights and missing information detection
- Connection recommendations

### ✅ Phase 6: Export & Sharing
- PDF family tree generation
- Multiple export formats and layouts
- Data backup and restore
- Sharing capabilities and social features

## 🎯 Key Features by Screen

### 🏠 Home/Tree View
- Visual family tree display
- Photo-based member cards
- Quick navigation to member details
- Family statistics overview

### 🔍 Search & Discovery
- Real-time search with suggestions
- Advanced filtering options
- Smart insights and recommendations
- Recent search history

### 📤 Export & Sharing
- PDF generation with custom layouts
- Data backup and restore
- Image export capabilities
- Sharing options and collaboration tools

### ➕ Add Member
- Comprehensive member creation form
- Photo capture and selection
- Relationship establishment
- Voice note recording

### 👥 Members List
- Alphabetical member listing
- Quick search and filtering
- Bulk operations
- Member statistics

### 📅 Timeline
- Chronological family history
- Birth and death date visualization
- Life event tracking
- Historical context

### 🔗 Relationships
- Advanced relationship mapping
- Visual connection editor
- Relationship type management
- Family tree validation

### ⚙️ Settings
- App preferences and configuration
- Data management options
- Privacy settings
- Export/import tools

## 🎨 Design System

### Color Palette
- **Primary**: #D2691E (Chocolate)
- **Secondary**: #8B4513 (Saddle Brown)
- **Background**: #FFFBEB (Warm White)
- **Accent**: #FEF3C7 (Amber Light)
- **Text**: #333333 (Dark Gray)

### Typography
- **Headers**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Consistent padding, clear hierarchy
- **Icons**: Lucide React Native, 24px standard size
- **Spacing**: 8px grid system

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Add your configuration to the environment variables
4. Set up security rules for data access

### OpenAI Setup
1. Create an OpenAI account
2. Generate an API key
3. Add the key to your environment variables
4. Configure usage limits and monitoring

## 📱 Platform Support

### iOS
- iOS 13.0 and above
- iPhone and iPad support
- Native iOS sharing integration
- Camera and photo library access

### Android
- Android 6.0 (API level 23) and above
- Phone and tablet support
- Android sharing integration
- Camera and storage permissions

### Web (Expo Web)
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and mobile
- Limited camera functionality
- File download for exports

## 🤝 Contributing

We welcome contributions to LegacyLink! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use consistent naming conventions
- Add proper error handling
- Include unit tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the excellent development platform
- **React Native Community**: For the robust ecosystem
- **OpenAI**: For AI-powered biography generation
- **Lucide**: For the beautiful icon library
- **African Design Inspiration**: For the warm, welcoming aesthetic

## 📞 Support

For support, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/Mutisyavin/familyLink/issues)
- **Email**: support@legacylink.app
- **Documentation**: [Wiki](https://github.com/Mutisyavin/familyLink/wiki)

## 🗺 Roadmap

### Future Enhancements
- **Real-time Collaboration**: Live editing with family members
- **Advanced AI Features**: Smart relationship detection, photo tagging
- **Social Features**: Family group chats, event planning
- **Historical Integration**: Connect with historical records and databases
- **Mobile App Store**: Native iOS and Android app distribution
- **Premium Features**: Advanced export options, cloud storage, family websites

---

**LegacyLink** - *Preserving family stories, one connection at a time* 🌳