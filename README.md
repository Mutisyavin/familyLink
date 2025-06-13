# LegacyLink - Interactive Family Tree App

LegacyLink is a beautiful, photo-first family tree application that helps families preserve and celebrate their heritage through interactive digital family trees. Built with React Native and Expo, it provides an intuitive way to document family relationships, stories, and connections across generations.

## 🌟 Features

### Core Functionality
- **Photo-First Experience**: Upload family photos with guided input flow
- **Interactive Relationship Mapping**: Connect family members with visual relationship lines
- **Dynamic Family Tree Visualization**: Automatically arranged generational layout
- **Social Media Integration**: Link family members' social profiles
- **Comprehensive Member Profiles**: Detailed biographical information and stories
- **Secure Local Storage**: Private, device-based data storage
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### User Interface
- **African-Inspired Design**: Warm color palette with gold, brown, and earth tones
- **Elegant Typography**: Custom Google Fonts (Inter & Playfair Display)
- **Smooth Animations**: Micro-interactions and transitions
- **Intuitive Navigation**: Bottom tab-based architecture
- **Modern Card Layouts**: Clean, organized information display

## 🏗️ Project Structure

```
legacylink-family-tree/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with navigation setup
│   ├── (tabs)/                  # Tab-based navigation group
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Home screen with family tree
│   │   ├── add.tsx              # Add family member form
│   │   ├── members.tsx          # Family members list
│   │   └── settings.tsx         # App settings and preferences
│   └── +not-found.tsx           # 404 error page
├── components/                   # Reusable UI components
│   ├── FamilyTreeView.tsx       # Interactive tree visualization
│   ├── PhotoUpload.tsx          # Photo upload component
│   └── SocialMediaInput.tsx     # Social media profile inputs
├── hooks/                       # Custom React hooks
│   └── useFrameworkReady.ts     # Framework initialization hook
├── types/                       # TypeScript type definitions
│   └── FamilyMember.ts          # Family member data structures
├── utils/                       # Utility functions
│   ├── storage.ts               # AsyncStorage data management
│   └── treeLayout.ts            # Tree layout algorithm
└── assets/                      # Static assets
    └── images/                  # App icons and images
```

## 📱 App Screens

### 1. Home Screen (`app/(tabs)/index.tsx`)
- **Purpose**: Main family tree visualization
- **Features**:
  - Interactive tree view with photo nodes
  - Automatic generational layout
  - Node tap interactions for member details
  - Welcome screen for new users
  - Add first member call-to-action

### 2. Add Member Screen (`app/(tabs)/add.tsx`)
- **Purpose**: Add new family members
- **Features**:
  - Photo upload (camera or gallery)
  - Comprehensive member information form
  - Social media profile inputs
  - Form validation and error handling
  - Success confirmation with navigation options

### 3. Members Screen (`app/(tabs)/members.tsx`)
- **Purpose**: Browse and manage family members
- **Features**:
  - Card-based member list
  - Member photos and key information
  - Delete member functionality
  - Social media profile display
  - Biography previews

### 4. Settings Screen (`app/(tabs)/settings.tsx`)
- **Purpose**: App configuration and information
- **Features**:
  - Export options (coming soon)
  - Sharing capabilities (coming soon)
  - Theme settings (coming soon)
  - Privacy controls (coming soon)
  - Help and support
  - About information

## 🔧 Technical Architecture

### Data Management
- **Storage**: AsyncStorage for local data persistence
- **Data Structure**: Hierarchical family member relationships
- **State Management**: React hooks and local component state

### Navigation
- **Primary**: Tab-based navigation using Expo Router
- **Architecture**: File-based routing system
- **Screens**: Four main tabs with stack navigation support

### Styling
- **Approach**: StyleSheet.create for all styling
- **Design System**: Consistent color palette and typography
- **Responsive**: Adaptive layouts for different screen sizes

### Components Architecture

#### FamilyTreeView Component
- Renders interactive family tree visualization
- Uses SVG for connection lines between family members
- Implements scrollable canvas for large family trees
- Handles node positioning and relationship mapping

#### PhotoUpload Component
- Manages photo selection from camera or gallery
- Handles permissions for camera and media library access
- Provides drag-and-drop interface for web
- Includes photo preview and removal functionality

#### SocialMediaInput Component
- Collects social media profile information
- Supports Instagram, Facebook, LinkedIn, and Twitter
- Validates input formats
- Provides platform-specific placeholders

## 🎨 Design System

### Color Palette
- **Primary**: `#92400E` (Deep Brown)
- **Secondary**: `#A16207` (Medium Brown)
- **Accent**: `#F59E0B` (Gold)
- **Background**: `#FFFBEB` (Warm Cream)
- **Surface**: `#FFFFFF` (White)
- **Border**: `#FEF3C7` (Light Gold)

### Typography
- **Display**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, readable)
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)

### Spacing System
- **Base Unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48px
- **Consistent**: Applied throughout all components

## 📊 Data Models

### FamilyMember Interface
```typescript
interface FamilyMember {
  id: string;                    // Unique identifier
  name: string;                  // Full name
  photoUri?: string;             // Photo file path
  dateOfBirth?: string;          // Birth date (ISO string)
  dateOfDeath?: string;          // Death date (ISO string)
  birthPlace?: string;           // Place of birth
  occupation?: string;           // Profession
  biography?: string;            // Life story
  socialMedia: SocialMediaProfiles; // Social media handles
  relationships: {               // Family relationships
    parents: string[];
    siblings: string[];
    spouses: string[];
    children: string[];
  };
  createdAt: string;            // Record creation timestamp
  updatedAt: string;            // Last update timestamp
}
```

### TreeNode Interface
```typescript
interface TreeNode {
  id: string;                   // Member ID
  member: FamilyMember;         // Member data
  x: number;                    // X coordinate in tree
  y: number;                    // Y coordinate in tree
  generation: number;           // Generation level
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for mobile testing)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Development Commands
- `npm run dev` - Start Expo development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint code analysis

## 📱 Platform Support

### Web
- Full functionality available
- Responsive design for desktop and mobile browsers
- Photo upload via file picker
- Local storage for data persistence

### Mobile (iOS/Android)
- Native camera integration
- Photo gallery access
- Touch-optimized interactions
- Device storage for photos and data

## 🔒 Privacy & Security

### Data Storage
- All data stored locally on device
- No cloud synchronization (current version)
- User controls all family information
- Photos stored in app's private directory

### Permissions
- Camera access for taking photos
- Photo library access for selecting images
- No network permissions required for core functionality

## 🛣️ Roadmap

### Phase 2 Features (Coming Soon)
- **Voice Recordings**: Audio notes from family elders
- **Timeline View**: Chronological family history
- **AI Biographies**: Generated family member stories
- **Genealogy Integration**: Connect with ancestry databases
- **Collaborative Editing**: Multi-user family tree building
- **Advanced Relationships**: Extended family connections
- **Export Options**: PDF and image generation
- **Cloud Sync**: Cross-device synchronization
- **Sharing**: Shareable family tree links

### Future Enhancements
- Multiple tree themes (classic, modern, animated)
- Advanced privacy controls
- Integration with social media platforms
- Family event tracking and reminders
- DNA ancestry integration
- Historical document attachment

## 🤝 Contributing

This is a production-ready family tree application designed for families who want to preserve their digital legacy. The codebase follows React Native and Expo best practices with a focus on user experience and data privacy.

### Development Guidelines
- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error handling
- Maintain responsive design principles
- Test on multiple platforms and screen sizes

## 📄 License

This project is designed as a family heritage preservation tool. Please respect user privacy and data security when contributing or deploying.

---

**LegacyLink** - Preserving family stories, one photo at a time. 📸👨‍👩‍👧‍👦🌳