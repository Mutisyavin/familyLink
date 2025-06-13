import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '@/types/FamilyMember';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FamilyDiscovery from '@/components/FamilyDiscovery';

interface SearchFilters {
  gender?: 'male' | 'female' | 'other';
  hasPhoto?: boolean;
  hasVoiceNote?: boolean;
  hasMedia?: boolean;
  livingStatus?: 'living' | 'deceased';
}

interface SearchResult {
  member: FamilyMember;
  relevanceScore: number;
  matchedFields: string[];
}

export default function SearchScreen() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'insights'>('search');

  // Load family members
  useEffect(() => {
    loadMembers();
    loadRecentSearches();
  }, []);

  const loadMembers = async () => {
    try {
      const storedMembers = await AsyncStorage.getItem('familyMembers');
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const allSuggestions = new Set<string>();
      
      members.forEach(member => {
        // Add names
        if (member.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          allSuggestions.add(member.name);
        }
        
        // Add occupations
        if (member.occupation?.toLowerCase().includes(searchQuery.toLowerCase())) {
          allSuggestions.add(member.occupation);
        }
        
        // Add birth places
        if (member.birthPlace?.toLowerCase().includes(searchQuery.toLowerCase())) {
          allSuggestions.add(member.birthPlace);
        }
      });
      
      setSuggestions(Array.from(allSuggestions).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, members]);

  // Search algorithm with relevance scoring
  const performSearch = (query: string, searchFilters: SearchFilters) => {
    if (!query.trim() && Object.keys(searchFilters).length === 0) {
      return [];
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase().trim();

    members.forEach(member => {
      let relevanceScore = 0;
      const matchedFields: string[] = [];

      // Text matching
      if (queryLower) {
        // Name matching (highest priority)
        if (member.name.toLowerCase().includes(queryLower)) {
          relevanceScore += 100;
          matchedFields.push('name');
          
          // Exact match bonus
          if (member.name.toLowerCase() === queryLower) {
            relevanceScore += 50;
          }
        }

        // Biography matching
        if (member.biography?.toLowerCase().includes(queryLower)) {
          relevanceScore += 30;
          matchedFields.push('biography');
        }

        // Occupation matching
        if (member.occupation?.toLowerCase().includes(queryLower)) {
          relevanceScore += 40;
          matchedFields.push('occupation');
        }

        // Birth place matching
        if (member.birthPlace?.toLowerCase().includes(queryLower)) {
          relevanceScore += 35;
          matchedFields.push('birthPlace');
        }
      }

      // Filter matching
      let passesFilters = true;

      if (searchFilters.gender && member.gender !== searchFilters.gender) {
        passesFilters = false;
      }

      if (searchFilters.hasPhoto !== undefined) {
        const hasPhoto = !!member.photoUri || (member.mediaItems?.some(item => item.type === 'photo') ?? false);
        if (searchFilters.hasPhoto !== hasPhoto) {
          passesFilters = false;
        }
      }

      if (searchFilters.hasVoiceNote !== undefined) {
        if (searchFilters.hasVoiceNote !== !!member.voiceNoteUri) {
          passesFilters = false;
        }
      }

      if (searchFilters.hasMedia !== undefined) {
        const hasMedia = (member.mediaItems?.length ?? 0) > 0;
        if (searchFilters.hasMedia !== hasMedia) {
          passesFilters = false;
        }
      }

      if (searchFilters.livingStatus) {
        const isDeceased = !!member.dateOfDeath;
        const status = isDeceased ? 'deceased' : 'living';
        if (searchFilters.livingStatus !== status) {
          passesFilters = false;
        }
      }

      // Only include if passes filters and has some relevance
      if (passesFilters && (relevanceScore > 0 || Object.keys(searchFilters).length > 0)) {
        // Boost score for filter-only matches
        if (relevanceScore === 0 && Object.keys(searchFilters).length > 0) {
          relevanceScore = 10;
        }

        results.push({
          member,
          relevanceScore,
          matchedFields,
        });
      }
    });

    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Update search results when query or filters change
  useEffect(() => {
    const results = performSearch(searchQuery, filters);
    setSearchResults(results);
  }, [searchQuery, filters, members]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    return (
      <TouchableOpacity style={styles.resultItem}>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.member.name}</Text>
          <View style={styles.resultDetails}>
            {item.member.dateOfBirth && (
              <Text style={styles.resultDetail}>
                Born {new Date(item.member.dateOfBirth).getFullYear()}
              </Text>
            )}
            {item.member.occupation && (
              <Text style={styles.resultDetail}>{item.member.occupation}</Text>
            )}
            {item.member.birthPlace && (
              <Text style={styles.resultDetail}>{item.member.birthPlace}</Text>
            )}
          </View>
          {item.matchedFields.length > 0 && (
            <View style={styles.matchedFields}>
              {item.matchedFields.map(field => (
                <View key={field} style={styles.matchedField}>
                  <Text style={styles.matchedFieldText}>{field}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.resultActions}>
          <Text style={styles.relevanceScore}>{item.relevanceScore}</Text>
          <Ionicons name="chevron-forward" size={16} color="#999999" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = (search: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentSearchItem}
      onPress={() => handleSearch(search)}
    >
      <Ionicons name="time-outline" size={16} color="#999999" />
      <Text style={styles.recentSearchText}>{search}</Text>
    </TouchableOpacity>
  );

  const renderSuggestion = (suggestion: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestion}
      onPress={() => handleSearch(suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search & Discovery</Text>
        <Text style={styles.subtitle}>Find members, stories, and smart insights</Text>
        
        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Ionicons 
              name="search" 
              size={16} 
              color={activeTab === 'search' ? '#FFFFFF' : '#D2691E'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'search' && styles.activeTabText
            ]}>
              Search
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
            onPress={() => setActiveTab('insights')}
          >
            <Ionicons 
              name="bulb" 
              size={16} 
              color={activeTab === 'insights' ? '#FFFFFF' : '#D2691E'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'insights' && styles.activeTabText
            ]}>
              Insights
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'search' && (
        <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search family members..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.filterButton, getActiveFilterCount() > 0 && styles.activeFilterButton]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons 
              name="options" 
              size={20} 
              color={getActiveFilterCount() > 0 ? "#FFFFFF" : "#D2691E"} 
            />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestions}>
                {suggestions.map(renderSuggestion)}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
      )}

      {activeTab === 'search' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {searchQuery.length > 0 || Object.keys(filters).length > 0 ? (
          // Search Results
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.member.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search" size={48} color="#CCCCCC" />
                <Text style={styles.noResultsText}>No members found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your search terms or filters
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Default State
          <View>
            {/* Quick Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Family Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="people" size={24} color="#D2691E" />
                  <Text style={styles.statNumber}>{members.length}</Text>
                  <Text style={styles.statLabel}>Total Members</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="camera" size={24} color="#D2691E" />
                  <Text style={styles.statNumber}>
                    {members.filter(m => m.photoUri || m.mediaItems?.some(item => item.type === 'photo')).length}
                  </Text>
                  <Text style={styles.statLabel}>With Photos</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="mic" size={24} color="#D2691E" />
                  <Text style={styles.statNumber}>
                    {members.filter(m => m.voiceNoteUri).length}
                  </Text>
                  <Text style={styles.statLabel}>Voice Stories</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="heart" size={24} color="#D2691E" />
                  <Text style={styles.statNumber}>
                    {members.filter(m => !m.dateOfDeath).length}
                  </Text>
                  <Text style={styles.statLabel}>Living</Text>
                </View>
              </View>
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <View style={styles.recentSearches}>
                  {recentSearches.map(renderRecentSearch)}
                </View>
              </View>
            )}

            {/* Quick Filters */}
            <View style={styles.quickFiltersSection}>
              <Text style={styles.sectionTitle}>Quick Filters</Text>
              <View style={styles.quickFilters}>
                <TouchableOpacity
                  style={styles.quickFilter}
                  onPress={() => setFilters({ hasPhoto: true })}
                >
                  <Ionicons name="camera" size={20} color="#D2691E" />
                  <Text style={styles.quickFilterText}>With Photos</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickFilter}
                  onPress={() => setFilters({ hasVoiceNote: true })}
                >
                  <Ionicons name="mic" size={20} color="#D2691E" />
                  <Text style={styles.quickFilterText}>Voice Stories</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickFilter}
                  onPress={() => setFilters({ livingStatus: 'living' })}
                >
                  <Ionicons name="heart" size={20} color="#D2691E" />
                  <Text style={styles.quickFilterText}>Living</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickFilter}
                  onPress={() => setFilters({ livingStatus: 'deceased' })}
                >
                  <Ionicons name="flower" size={20} color="#D2691E" />
                  <Text style={styles.quickFilterText}>Remembered</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      ) : (
        <FamilyDiscovery 
          members={members}
          onMemberSelect={(member) => {
            // Switch to search tab and search for the member
            setActiveTab('search');
            setSearchQuery(member.name);
          }}
          onInsightAction={(insight) => {
            // Handle insight actions - could navigate to relevant screens
            console.log('Insight action:', insight);
          }}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Search Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Gender Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Gender</Text>
                <View style={styles.filterOptions}>
                  {(['male', 'female', 'other'] as const).map(gender => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.filterOption,
                        filters.gender === gender && styles.selectedFilterOption,
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        gender: prev.gender === gender ? undefined : gender,
                      }))}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.gender === gender && styles.selectedFilterOptionText,
                      ]}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Living Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  {(['living', 'deceased'] as const).map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        filters.livingStatus === status && styles.selectedFilterOption,
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        livingStatus: prev.livingStatus === status ? undefined : status,
                      }))}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.livingStatus === status && styles.selectedFilterOptionText,
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Media Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Media</Text>
                <View style={styles.filterToggles}>
                  <TouchableOpacity
                    style={styles.filterToggle}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      hasPhoto: prev.hasPhoto === true ? undefined : true,
                    }))}
                  >
                    <Ionicons 
                      name={filters.hasPhoto ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color="#D2691E" 
                    />
                    <Text style={styles.filterToggleText}>Has Photos</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.filterToggle}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      hasVoiceNote: prev.hasVoiceNote === true ? undefined : true,
                    }))}
                  >
                    <Ionicons 
                      name={filters.hasVoiceNote ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color="#D2691E" 
                    />
                    <Text style={styles.filterToggleText}>Has Voice Notes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.filterToggle}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      hasMedia: prev.hasMedia === true ? undefined : true,
                    }))}
                  >
                    <Ionicons 
                      name={filters.hasMedia ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color="#D2691E" 
                    />
                    <Text style={styles.filterToggleText}>Has Media Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#D2691E',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2691E',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: '#D2691E',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestion: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0369A1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#D2691E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 32,
  },
  recentSearches: {
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  recentSearchText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  quickFiltersSection: {
    marginBottom: 32,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D2691E',
  },
  quickFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  resultsSection: {
    marginBottom: 32,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  resultDetails: {
    marginBottom: 8,
  },
  resultDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 2,
  },
  matchedFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  matchedField: {
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D2691E',
  },
  matchedFieldText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  resultActions: {
    alignItems: 'center',
    gap: 4,
  },
  relevanceScore: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
  },
  noResults: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  selectedFilterOption: {
    borderColor: '#D2691E',
    backgroundColor: '#FFF8F0',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedFilterOptionText: {
    color: '#D2691E',
  },
  filterToggles: {
    gap: 12,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#D2691E',
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});