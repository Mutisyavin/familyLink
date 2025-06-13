# 🌳 LegacyLink - Family Heritage App

**A photo-first, privacy-focused family tree application built with React Native and Expo**

[![Expo](https://img.shields.io/badge/Expo-SDK%2053-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.1-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Overview

LegacyLink is a secure and intelligent family tree app that enables users to:
- 📸 **Photo-first design** - Beautiful visual family trees with member photos
- 🔐 **Privacy-focused** - Secure authentication and family-only access
- 🧠 **Smart relationships** - Automatic kinship mapping based on gender and family structure
- 🎨 **African-inspired UI** - Warm color palette with Inter & Playfair Display fonts
- 📱 **Mobile-first** - Optimized for iOS and Android with web support

## ✨ Features

### Phase 1.5 (Current) ✅
- **User Authentication System**
  - Email/password and social media login options
  - Secure user account management
  - Welcome and onboarding flow

- **Smart Kinship Mapping**
  - Gender-aware relationship labeling
  - Automatic detection of family relationships
  - Extended family support (grandparents, aunts, uncles, in-laws)

- **Tree Privacy & Security**
  - User-owned family trees
  - Authentication required for access
  - Collaborative structure ready

- **Enhanced Member Profiles**
  - Photo upload functionality
  - Comprehensive member information
  - Social media integration

### Phase 2 (Upcoming) 🚧
- 🎤 Voice notes for family members
- 🧠 AI-powered biography generation
- 🗓 Timeline view of family events
- ☁️ Cloud synchronization with Firebase

### Phase 3 (Planned) 📋
- 👥 Multi-user collaboration
- 🔗 Family tree sharing and invitations
- 📊 Advanced family analytics
- 🎨 Custom themes and layouts

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

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
   npx expo start --tunnel
   ```

4. **Run on your device**
   - Install Expo Go on your phone
   - Scan the QR code displayed in the terminal
   - Or use the tunnel URL directly in Expo Go

## 📱 App Flow

1. **Welcome Screen** - Choose to create new tree or join existing
2. **Authentication** - Sign up/login with email or social media
3. **Create Founder** - Add yourself as the first family member
4. **Family Tree** - View, add, and manage family members
5. **Member Profiles** - Detailed information with photos and relationships

## 🏗️ Project Structure

```
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Family tree view
│   │   ├── add.tsx              # Add family member
│   │   ├── members.tsx          # Member list
│   │   └── settings.tsx         # App settings
│   ├── onboarding/              # Onboarding screens
│   │   └── create-founder.tsx   # Create founder profile
│   ├── welcome.tsx              # Welcome screen
│   ├── auth.tsx                 # Authentication
│   └── index.tsx                # App entry point
├── components/                   # Reusable components
│   ├── AuthForm.tsx             # Authentication form
│   ├── FamilyTreeView.tsx       # SVG tree visualization
│   ├── PhotoUpload.tsx          # Photo upload component
│   └── SocialMediaInput.tsx     # Social media inputs
├── types/                       # TypeScript definitions
│   └── FamilyMember.ts          # Data models
├── utils/                       # Utility functions
│   ├── storage.ts               # AsyncStorage helpers
│   ├── treeLayout.ts            # Tree positioning logic
│   └── kinshipMapping.ts        # Relationship mapping
└── assets/                      # Images and fonts
```

## 🎨 Design System

### Color Palette (African-inspired)
- **Primary**: `#D2691E` (Chocolate)
- **Secondary**: `#8B4513` (Saddle Brown)
- **Background**: `#FFFBEB` (Warm White)
- **Accent**: `#FEF3C7` (Light Amber)

### Typography
- **Headers**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Weights**: Regular, Medium, SemiBold, Bold

## 🔧 Development

### Key Technologies
- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React hooks + AsyncStorage
- **UI Components**: Custom design system
- **Type Safety**: TypeScript
- **Storage**: AsyncStorage (Phase 1), Firebase (Phase 2)

### Smart Kinship System
The app automatically determines family relationships based on:
- **Direct relationships**: Parent, child, spouse, sibling
- **Extended family**: Grandparents, aunts, uncles, cousins
- **In-laws**: All marriage-related connections
- **Gender-aware labeling**: Father/Mother, Uncle/Aunt, etc.

### Data Models
```typescript
interface FamilyMember {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  photoUri?: string;
  relationships: {
    parents: string[];
    siblings: string[];
    spouses: string[];
    children: string[];
  };
  // ... additional fields
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Welcome screen displays correctly
- [ ] Authentication flow works
- [ ] Founder creation completes successfully
- [ ] Family tree renders properly
- [ ] Member addition with gender selection
- [ ] Photo upload functionality
- [ ] Relationship mapping accuracy

### Running Tests
```bash
# Run type checking
npx tsc --noEmit

# Run linting
npx expo lint
```

## 📈 Roadmap

### Phase 2 (July 16 - Aug 10)
- [ ] Firebase integration for cloud storage
- [ ] Voice notes recording and playback
- [ ] AI biography generation with OpenAI
- [ ] Timeline view of family events

### Phase 3 (Aug 11 - Sept 5)
- [ ] Multi-user collaboration
- [ ] Real-time synchronization
- [ ] Family tree sharing via QR codes
- [ ] Role-based permissions (Admin, Editor, Viewer)

### Phase 4 (Sept 6 - Oct 5)
- [ ] Export features (PDF, image)
- [ ] Additional themes and customization
- [ ] Advanced search and filtering
- [ ] Family statistics and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- African design inspiration for color palette and UI elements
- Expo team for the excellent development platform
- React Native community for components and libraries

## 📞 Support

For support, email [your-email@example.com] or create an issue in this repository.

---

**Built with ❤️ for preserving family heritage and connecting generations**