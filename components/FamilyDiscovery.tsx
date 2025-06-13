import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '@/types/FamilyMember';

interface FamilyInsight {
  id: string;
  type: 'missing_info' | 'connection_suggestion' | 'milestone' | 'pattern' | 'story_opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  relatedMembers?: string[];
  suggestion?: string;
}

interface FamilyDiscoveryProps {
  members: FamilyMember[];
  onMemberSelect?: (member: FamilyMember) => void;
  onInsightAction?: (insight: FamilyInsight) => void;
}

export default function FamilyDiscovery({
  members,
  onMemberSelect,
  onInsightAction,
}: FamilyDiscoveryProps) {
  const [insights, setInsights] = useState<FamilyInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generate insights based on family data
  useEffect(() => {
    const generatedInsights = generateInsights(members);
    setInsights(generatedInsights);
  }, [members]);

  const generateInsights = (familyMembers: FamilyMember[]): FamilyInsight[] => {
    const insights: FamilyInsight[] = [];

    // Missing Information Insights
    familyMembers.forEach(member => {
      const missingFields = [];
      
      if (!member.dateOfBirth) missingFields.push('birth date');
      if (!member.birthPlace) missingFields.push('birth place');
      if (!member.occupation) missingFields.push('occupation');
      if (!member.photoUri && (!member.mediaItems || member.mediaItems.length === 0)) {
        missingFields.push('photos');
      }
      if (!member.biography) missingFields.push('biography');
      if (!member.voiceNoteUri) missingFields.push('voice story');

      if (missingFields.length > 0) {
        insights.push({
          id: `missing-${member.id}`,
          type: 'missing_info',
          title: `Complete ${member.name}'s Profile`,
          description: `Missing: ${missingFields.join(', ')}`,
          priority: missingFields.length > 3 ? 'high' : 'medium',
          actionable: true,
          relatedMembers: [member.id],
          suggestion: `Add ${missingFields[0]} to enrich ${member.name}'s story`,
        });
      }
    });

    // Connection Suggestions
    const orphanMembers = familyMembers.filter(member => 
      member.relationships.parents.length === 0 && 
      member.relationships.children.length === 0 &&
      member.relationships.siblings.length === 0 &&
      member.relationships.spouses.length === 0
    );

    orphanMembers.forEach(member => {
      insights.push({
        id: `connection-${member.id}`,
        type: 'connection_suggestion',
        title: `Connect ${member.name} to Family`,
        description: `${member.name} has no recorded family connections`,
        priority: 'high',
        actionable: true,
        relatedMembers: [member.id],
        suggestion: 'Add parents, siblings, or spouse relationships',
      });
    });

    // Story Opportunities
    const membersWithoutBiography = familyMembers.filter(m => !m.biography);
    if (membersWithoutBiography.length > 0) {
      insights.push({
        id: 'story-opportunity-biographies',
        type: 'story_opportunity',
        title: 'Capture Life Stories',
        description: `${membersWithoutBiography.length} members need their stories told`,
        priority: 'medium',
        actionable: true,
        relatedMembers: membersWithoutBiography.map(m => m.id),
        suggestion: 'Use AI Biography Generator to create compelling life stories',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  };

  const getInsightIcon = (type: FamilyInsight['type']) => {
    switch (type) {
      case 'missing_info':
        return 'information-circle';
      case 'connection_suggestion':
        return 'link';
      case 'milestone':
        return 'star';
      case 'pattern':
        return 'analytics';
      case 'story_opportunity':
        return 'book';
      default:
        return 'bulb';
    }
  };

  const getInsightColor = (priority: FamilyInsight['priority']) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const categories = [
    { id: 'all', label: 'All Insights', count: insights.length },
    { id: 'missing_info', label: 'Missing Info', count: insights.filter(i => i.type === 'missing_info').length },
    { id: 'connection_suggestion', label: 'Connections', count: insights.filter(i => i.type === 'connection_suggestion').length },
    { id: 'story_opportunity', label: 'Stories', count: insights.filter(i => i.type === 'story_opportunity').length },
  ];

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedCategory);

  const handleInsightPress = (insight: FamilyInsight) => {
    if (insight.actionable && onInsightAction) {
      onInsightAction(insight);
    } else {
      Alert.alert(
        insight.title,
        insight.description + (insight.suggestion ? `\n\nSuggestion: ${insight.suggestion}` : ''),
        [{ text: 'OK' }]
      );
    }
  };

  const renderInsight = (insight: FamilyInsight) => {
    const iconColor = getInsightColor(insight.priority);
    
    return (
      <TouchableOpacity
        key={insight.id}
        style={[styles.insightCard, { borderLeftColor: iconColor }]}
        onPress={() => handleInsightPress(insight)}
      >
        <View style={styles.insightHeader}>
          <View style={styles.insightIcon}>
            <Ionicons 
              name={getInsightIcon(insight.type)} 
              size={20} 
              color={iconColor} 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
            {insight.suggestion && (
              <Text style={styles.insightSuggestion}>{insight.suggestion}</Text>
            )}
          </View>
          <View style={styles.insightMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: iconColor }]}>
              <Text style={styles.priorityText}>{insight.priority.toUpperCase()}</Text>
            </View>
            {insight.actionable && (
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Insights</Text>
        <Text style={styles.subtitle}>Smart suggestions to enrich your family tree</Text>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}>
              {category.label}
            </Text>
            {category.count > 0 && (
              <View style={[
                styles.categoryBadge,
                selectedCategory === category.id && styles.selectedCategoryBadge,
              ]}>
                <Text style={[
                  styles.categoryBadgeText,
                  selectedCategory === category.id && styles.selectedCategoryBadgeText,
                ]}>
                  {category.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Insights List */}
      <ScrollView style={styles.insightsList} showsVerticalScrollIndicator={false}>
        {filteredInsights.length > 0 ? (
          filteredInsights.map(renderInsight)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyDescription}>
              No insights available for this category. Your family tree is looking great!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categories: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  selectedCategoryButton: {
    backgroundColor: '#D2691E',
    borderColor: '#D2691E',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  selectedCategoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#666666',
  },
  selectedCategoryBadgeText: {
    color: '#FFFFFF',
  },
  insightsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 6,
    lineHeight: 20,
  },
  insightSuggestion: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
    fontStyle: 'italic',
  },
  insightMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});