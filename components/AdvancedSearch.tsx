import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '@/types/FamilyMember';

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

interface AdvancedSearchProps {
  members: FamilyMember[];
  onMemberSelect: (member: FamilyMember) => void;
  style?: any;
  placeholder?: string;
}

export default function AdvancedSearch({
  members,
  onMemberSelect,
  style,
  placeholder = "Search family members...",
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

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
    setShowResults(searchQuery.length > 0 || Object.keys(filters).length > 0);
  }, [searchQuery, filters, members]);

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          onMemberSelect(item.member);
          setShowResults(false);
          setSearchQuery('');
        }}
      >
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
        <Ionicons name="chevron-forward" size={16} color="#999999" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999999" />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowResults(true)}
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

      {/* Search Results */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity onPress={() => setShowResults(false)}>
                  <Ionicons name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.member.id}
                style={styles.resultsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color="#CCCCCC" />
              <Text style={styles.noResultsText}>No members found</Text>
            </View>
          )}
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
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
  resultsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    maxHeight: 400,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
