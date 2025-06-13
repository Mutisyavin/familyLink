import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '@/types/FamilyMember';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'birth' | 'death' | 'marriage' | 'other';
  title: string;
  description: string;
  member: FamilyMember;
  relatedMembers?: FamilyMember[];
}

interface TimelineViewProps {
  members: FamilyMember[];
  onEventPress?: (event: TimelineEvent) => void;
}

export default function TimelineView({ members, onEventPress }: TimelineViewProps) {
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    members.forEach((member) => {
      // Birth events
      if (member.dateOfBirth) {
        const birthDate = new Date(member.dateOfBirth);
        if (!isNaN(birthDate.getTime())) {
          events.push({
            id: `birth-${member.id}`,
            date: birthDate,
            type: 'birth',
            title: `${member.name} was born`,
            description: member.birthPlace ? `Born in ${member.birthPlace}` : 'Birth',
            member,
          });
        }
      }

      // Death events
      if (member.dateOfDeath) {
        const deathDate = new Date(member.dateOfDeath);
        if (!isNaN(deathDate.getTime())) {
          events.push({
            id: `death-${member.id}`,
            date: deathDate,
            type: 'death',
            title: `${member.name} passed away`,
            description: 'Death',
            member,
          });
        }
      }

      // Marriage events (simplified - would need more complex logic for actual marriages)
      if (member.relationships.spouses.length > 0) {
        const spouses = member.relationships.spouses
          .map(spouseId => members.find(m => m.id === spouseId))
          .filter(Boolean) as FamilyMember[];

        spouses.forEach((spouse) => {
          // Use birth date as approximation for marriage date (would need actual marriage dates)
          const memberBirth = member.dateOfBirth ? new Date(member.dateOfBirth) : null;
          const spouseBirth = spouse.dateOfBirth ? new Date(spouse.dateOfBirth) : null;
          
          if (memberBirth && spouseBirth) {
            // Estimate marriage date as 25 years after the younger person's birth
            const youngerBirth = memberBirth > spouseBirth ? memberBirth : spouseBirth;
            const estimatedMarriageDate = new Date(youngerBirth);
            estimatedMarriageDate.setFullYear(estimatedMarriageDate.getFullYear() + 25);

            events.push({
              id: `marriage-${member.id}-${spouse.id}`,
              date: estimatedMarriageDate,
              type: 'marriage',
              title: `${member.name} married ${spouse.name}`,
              description: 'Marriage',
              member,
              relatedMembers: [spouse],
            });
          }
        });
      }
    });

    // Sort events by date (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [members]);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'birth':
        return 'happy-outline';
      case 'death':
        return 'flower-outline';
      case 'marriage':
        return 'heart';
      default:
        return 'calendar-outline';
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'birth':
        return '#10B981'; // Green
      case 'death':
        return '#6B7280'; // Gray
      case 'marriage':
        return '#EF4444'; // Red
      default:
        return '#8B4513'; // Brown
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getYearFromDate = (date: Date) => {
    return date.getFullYear();
  };

  const groupEventsByYear = (events: TimelineEvent[]) => {
    const grouped: { [year: number]: TimelineEvent[] } = {};
    
    events.forEach((event) => {
      const year = getYearFromDate(event.date);
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByYear(timelineEvents);
  const years = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => b - a); // Newest first

  if (timelineEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>No Timeline Events</Text>
        <Text style={styles.emptySubtitle}>
          Add birth dates and other information to family members to see timeline events.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Timeline</Text>
        <Text style={styles.subtitle}>
          {timelineEvents.length} events across {years.length} years
        </Text>
      </View>

      {years.map((year) => (
        <View key={year} style={styles.yearSection}>
          <View style={styles.yearHeader}>
            <Text style={styles.yearText}>{year}</Text>
            <View style={styles.yearLine} />
          </View>

          {groupedEvents[year].map((event, index) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventContainer}
              onPress={() => onEventPress?.(event)}
              activeOpacity={0.7}
            >
              <View style={styles.eventTimeline}>
                <View
                  style={[
                    styles.eventDot,
                    { backgroundColor: getEventColor(event.type) },
                  ]}
                >
                  <Ionicons
                    name={getEventIcon(event.type)}
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                {index < groupedEvents[year].length - 1 && (
                  <View style={styles.eventLine} />
                )}
              </View>

              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                </View>

                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventMembers}>
                  <View style={styles.memberInfo}>
                    {event.member.photoUri ? (
                      <Image
                        source={{ uri: event.member.photoUri }}
                        style={styles.memberPhoto}
                      />
                    ) : (
                      <View style={styles.memberPhotoPlaceholder}>
                        <Ionicons name="person" size={16} color="#8B4513" />
                      </View>
                    )}
                    <Text style={styles.memberName}>{event.member.name}</Text>
                  </View>

                  {event.relatedMembers && event.relatedMembers.length > 0 && (
                    <View style={styles.relatedMembers}>
                      {event.relatedMembers.map((relatedMember) => (
                        <View key={relatedMember.id} style={styles.memberInfo}>
                          {relatedMember.photoUri ? (
                            <Image
                              source={{ uri: relatedMember.photoUri }}
                              style={styles.memberPhoto}
                            />
                          ) : (
                            <View style={styles.memberPhotoPlaceholder}>
                              <Ionicons name="person" size={16} color="#8B4513" />
                            </View>
                          )}
                          <Text style={styles.memberName}>{relatedMember.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Timeline shows major family events and milestones
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  yearSection: {
    marginBottom: 32,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  yearText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginRight: 16,
  },
  yearLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  eventContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  eventTimeline: {
    alignItems: 'center',
    marginRight: 16,
  },
  eventDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    minHeight: 40,
  },
  eventContent: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 12,
  },
  eventMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  memberPhotoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8B4513',
  },
  relatedMembers: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
  },
}); 