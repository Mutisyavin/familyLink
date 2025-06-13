import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Download, Share, Palette, Shield, CircleHelp as HelpCircle, Heart, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const handleExportPDF = () => {
    Alert.alert(
      'Export as PDF',
      'This feature will generate a beautiful PDF of your family tree.',
      [{ text: 'Coming Soon', style: 'default' }]
    );
  };

  const handleShareTree = () => {
    Alert.alert(
      'Share Family Tree',
      'Create a shareable link to invite family members to view and contribute to your tree.',
      [{ text: 'Coming Soon', style: 'default' }]
    );
  };

  const handleThemeSettings = () => {
    Alert.alert(
      'Tree Themes',
      'Choose from classic, modern, African-inspired, and animated theme options.',
      [{ text: 'Coming Soon', style: 'default' }]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy Settings',
      'Manage who can see your family tree and control data sharing preferences.',
      [{ text: 'Coming Soon', style: 'default' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help getting started? Access our guide on building beautiful family trees.',
      [{ text: 'Coming Soon', style: 'default' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About LegacyLink',
      'LegacyLink helps families preserve and celebrate their heritage through beautiful, interactive family trees.\n\nVersion 1.0.0\nBuilt with love for preserving family legacies.',
      [{ text: 'Close', style: 'default' }]
    );
  };

  const settingsOptions = [
    {
      icon: Download,
      title: 'Export Family Tree',
      subtitle: 'Save as PDF or image',
      onPress: handleExportPDF,
    },
    {
      icon: Share,
      title: 'Share with Family',
      subtitle: 'Invite others to collaborate',
      onPress: handleShareTree,
    },
    {
      icon: Palette,
      title: 'Tree Appearance',
      subtitle: 'Themes and visual options',
      onPress: handleThemeSettings,
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Control your data',
      onPress: handlePrivacySettings,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help using LegacyLink',
      onPress: handleHelp,
    },
    {
      icon: Heart,
      title: 'About LegacyLink',
      subtitle: 'App info and version',
      onPress: handleAbout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your LegacyLink experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          {settingsOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={option.onPress}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <IconComponent size={20} color="#92400E" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{option.title}</Text>
                    <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#A16207" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>LegacyLink</Text>
            <Text style={styles.aboutDescription}>
              Preserving family stories, one photo at a time. LegacyLink helps families 
              create beautiful, interactive family trees that celebrate their heritage 
              and connect generations.
            </Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>Future Features</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• Voice note recordings from elders</Text>
              <Text style={styles.featureItem}>• Timeline view for family history</Text>
              <Text style={styles.featureItem}>• AI-generated family biographies</Text>
              <Text style={styles.featureItem}>• Integration with genealogy databases</Text>
              <Text style={styles.featureItem}>• Real-time family collaboration</Text>
              <Text style={styles.featureItem}>• Advanced relationship mapping</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#92400E',
    fontFamily: 'Playfair-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#A16207',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#92400E',
    fontFamily: 'Inter-Medium',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#A16207',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  aboutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
    fontFamily: 'Playfair-Bold',
  },
  aboutDescription: {
    fontSize: 16,
    color: '#A16207',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#A16207',
    fontFamily: 'Inter-Regular',
  },
  comingSoonContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});