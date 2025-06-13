import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Text as SvgText, Path } from 'react-native-svg';
import { FamilyMember } from '@/types/FamilyMember';
import { getAllRelationships, getRelationshipLabel } from '@/utils/kinshipMapping';

interface RelationshipMapperProps {
  members: FamilyMember[];
  focusMember?: FamilyMember;
  onRelationshipUpdate: (memberId: string, relationships: any) => void;
  style?: any;
}

interface RelationshipNode {
  id: string;
  member: FamilyMember;
  x: number;
  y: number;
  level: number;
  generation: number;
}

interface RelationshipConnection {
  from: string;
  to: string;
  type: 'parent' | 'spouse' | 'sibling' | 'child';
  label: string;
}

const { width: screenWidth } = Dimensions.get('window');
const NODE_SIZE = 60;
const LEVEL_HEIGHT = 120;
const NODE_SPACING = 80;

export default function RelationshipMapper({
  members,
  focusMember,
  onRelationshipUpdate,
  style,
}: RelationshipMapperProps) {
  const [nodes, setNodes] = useState<RelationshipNode[]>([]);
  const [connections, setConnections] = useState<RelationshipConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingMode, setConnectingMode] = useState(false);
  const [connectionType, setConnectionType] = useState<'parent' | 'spouse' | 'sibling' | 'child'>('parent');
  const [mapDimensions, setMapDimensions] = useState({ width: screenWidth - 40, height: 400 });

  useEffect(() => {
    generateRelationshipMap();
  }, [members, focusMember]);

  const generateRelationshipMap = () => {
    if (members.length === 0) return;

    const focus = focusMember || members[0];
    const generatedNodes: RelationshipNode[] = [];
    const generatedConnections: RelationshipConnection[] = [];

    // Create a generation-based layout
    const generations = new Map<number, FamilyMember[]>();
    const memberGenerations = new Map<string, number>();

    // Assign generations based on relationships
    const assignGeneration = (member: FamilyMember, generation: number, visited = new Set<string>()) => {
      if (visited.has(member.id)) return;
      visited.add(member.id);

      const currentGen = memberGenerations.get(member.id) ?? generation;
      memberGenerations.set(member.id, Math.max(currentGen, generation));

      if (!generations.has(generation)) {
        generations.set(generation, []);
      }
      
      const genMembers = generations.get(generation)!;
      if (!genMembers.find(m => m.id === member.id)) {
        genMembers.push(member);
      }

      // Parents are one generation up
      member.relationships.parents.forEach(parentId => {
        const parent = members.find(m => m.id === parentId);
        if (parent) {
          assignGeneration(parent, generation + 1, visited);
        }
      });

      // Children are one generation down
      member.relationships.children.forEach(childId => {
        const child = members.find(m => m.id === childId);
        if (child) {
          assignGeneration(child, generation - 1, visited);
        }
      });

      // Siblings are same generation
      member.relationships.siblings.forEach(siblingId => {
        const sibling = members.find(m => m.id === siblingId);
        if (sibling) {
          assignGeneration(sibling, generation, visited);
        }
      });

      // Spouses are same generation
      member.relationships.spouses.forEach(spouseId => {
        const spouse = members.find(m => m.id === spouseId);
        if (spouse) {
          assignGeneration(spouse, generation, visited);
        }
      });
    };

    // Start with focus member at generation 0
    assignGeneration(focus, 0);

    // Add any remaining members
    members.forEach(member => {
      if (!memberGenerations.has(member.id)) {
        assignGeneration(member, 0);
      }
    });

    // Calculate layout positions
    const sortedGenerations = Array.from(generations.keys()).sort((a, b) => b - a);
    const centerX = mapDimensions.width / 2;
    let maxWidth = 0;

    sortedGenerations.forEach((generation, levelIndex) => {
      const genMembers = generations.get(generation)!;
      const genWidth = genMembers.length * NODE_SPACING;
      maxWidth = Math.max(maxWidth, genWidth);

      const startX = centerX - (genWidth / 2);
      const y = levelIndex * LEVEL_HEIGHT + 50;

      genMembers.forEach((member, index) => {
        const x = startX + (index * NODE_SPACING) + NODE_SPACING / 2;
        
        generatedNodes.push({
          id: member.id,
          member,
          x,
          y,
          level: levelIndex,
          generation,
        });
      });
    });

    // Generate connections
    generatedNodes.forEach(node => {
      const member = node.member;

      // Parent connections
      member.relationships.parents.forEach(parentId => {
        const parentNode = generatedNodes.find(n => n.id === parentId);
        if (parentNode) {
          generatedConnections.push({
            from: parentId,
            to: member.id,
            type: 'parent',
            label: 'Parent',
          });
        }
      });

      // Spouse connections
      member.relationships.spouses.forEach(spouseId => {
        const spouseNode = generatedNodes.find(n => n.id === spouseId);
        if (spouseNode && !generatedConnections.find(c => 
          (c.from === spouseId && c.to === member.id) || 
          (c.from === member.id && c.to === spouseId)
        )) {
          generatedConnections.push({
            from: member.id,
            to: spouseId,
            type: 'spouse',
            label: 'Spouse',
          });
        }
      });

      // Sibling connections
      member.relationships.siblings.forEach(siblingId => {
        const siblingNode = generatedNodes.find(n => n.id === siblingId);
        if (siblingNode && !generatedConnections.find(c => 
          (c.from === siblingId && c.to === member.id) || 
          (c.from === member.id && c.to === siblingId)
        )) {
          generatedConnections.push({
            from: member.id,
            to: siblingId,
            type: 'sibling',
            label: 'Sibling',
          });
        }
      });
    });

    // Update map dimensions
    const totalHeight = sortedGenerations.length * LEVEL_HEIGHT + 100;
    setMapDimensions(prev => ({ ...prev, height: Math.max(totalHeight, 400) }));

    setNodes(generatedNodes);
    setConnections(generatedConnections);
  };

  const handleNodePress = (nodeId: string) => {
    if (connectingMode && selectedNode && selectedNode !== nodeId) {
      // Create connection
      createConnection(selectedNode, nodeId);
      setConnectingMode(false);
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const createConnection = (fromId: string, toId: string) => {
    const fromMember = members.find(m => m.id === fromId);
    const toMember = members.find(m => m.id === toId);

    if (!fromMember || !toMember) return;

    Alert.alert(
      'Create Relationship',
      `Create a ${connectionType} relationship between ${fromMember.name} and ${toMember.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            // Update relationships based on type
            const updatedFromRelationships = { ...fromMember.relationships };
            const updatedToRelationships = { ...toMember.relationships };

            switch (connectionType) {
              case 'parent':
                if (!updatedFromRelationships.children.includes(toId)) {
                  updatedFromRelationships.children.push(toId);
                }
                if (!updatedToRelationships.parents.includes(fromId)) {
                  updatedToRelationships.parents.push(fromId);
                }
                break;
              case 'spouse':
                if (!updatedFromRelationships.spouses.includes(toId)) {
                  updatedFromRelationships.spouses.push(toId);
                }
                if (!updatedToRelationships.spouses.includes(fromId)) {
                  updatedToRelationships.spouses.push(fromId);
                }
                break;
              case 'sibling':
                if (!updatedFromRelationships.siblings.includes(toId)) {
                  updatedFromRelationships.siblings.push(toId);
                }
                if (!updatedToRelationships.siblings.includes(fromId)) {
                  updatedToRelationships.siblings.push(fromId);
                }
                break;
              case 'child':
                if (!updatedFromRelationships.parents.includes(toId)) {
                  updatedFromRelationships.parents.push(toId);
                }
                if (!updatedToRelationships.children.includes(fromId)) {
                  updatedToRelationships.children.push(fromId);
                }
                break;
            }

            onRelationshipUpdate(fromId, updatedFromRelationships);
            onRelationshipUpdate(toId, updatedToRelationships);
          },
        },
      ]
    );
  };

  const getConnectionPath = (from: RelationshipNode, to: RelationshipNode, type: string) => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    switch (type) {
      case 'parent':
        // Curved line from parent to child
        return `M ${from.x} ${from.y + NODE_SIZE/2} Q ${midX} ${midY - 20} ${to.x} ${to.y - NODE_SIZE/2}`;
      case 'spouse':
        // Straight line between spouses
        return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      case 'sibling':
        // Curved line between siblings
        return `M ${from.x} ${from.y} Q ${midX} ${from.y - 30} ${to.x} ${to.y}`;
      default:
        return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'parent': return '#10B981';
      case 'spouse': return '#EF4444';
      case 'sibling': return '#F59E0B';
      case 'child': return '#10B981';
      default: return '#8B5CF6';
    }
  };

  const renderNode = (node: RelationshipNode) => {
    const isSelected = selectedNode === node.id;
    const isFocus = focusMember?.id === node.id;
    
    return (
      <g key={node.id}>
        <Circle
          cx={node.x}
          cy={node.y}
          r={NODE_SIZE / 2}
          fill={isFocus ? '#D2691E' : isSelected ? '#8B4513' : '#FFFFFF'}
          stroke={isFocus ? '#8B4513' : isSelected ? '#D2691E' : '#E0E0E0'}
          strokeWidth={isFocus ? 3 : isSelected ? 2 : 1}
          onPress={() => handleNodePress(node.id)}
        />
        
        {/* Member photo placeholder */}
        <Circle
          cx={node.x}
          cy={node.y}
          r={NODE_SIZE / 2 - 4}
          fill="#F5F5F5"
          onPress={() => handleNodePress(node.id)}
        />
        
        {/* Member initials */}
        <SvgText
          x={node.x}
          y={node.y + 5}
          fontSize="14"
          fontFamily="Inter-Medium"
          fill={isFocus ? '#FFFFFF' : '#333333'}
          textAnchor="middle"
          onPress={() => handleNodePress(node.id)}
        >
          {node.member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </SvgText>
        
        {/* Member name */}
        <SvgText
          x={node.x}
          y={node.y + NODE_SIZE / 2 + 20}
          fontSize="12"
          fontFamily="Inter-Regular"
          fill="#333333"
          textAnchor="middle"
          onPress={() => handleNodePress(node.id)}
        >
          {node.member.name.length > 12 ? 
            node.member.name.substring(0, 12) + '...' : 
            node.member.name
          }
        </SvgText>
      </g>
    );
  };

  const renderConnection = (connection: RelationshipConnection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    const path = getConnectionPath(fromNode, toNode, connection.type);
    const color = getConnectionColor(connection.type);

    return (
      <g key={`${connection.from}-${connection.to}`}>
        <Path
          d={path}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeDasharray={connection.type === 'sibling' ? '5,5' : undefined}
        />
      </g>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Relationship Map</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, connectingMode && styles.activeControlButton]}
            onPress={() => {
              setConnectingMode(!connectingMode);
              setSelectedNode(null);
            }}
          >
            <Ionicons 
              name="link" 
              size={16} 
              color={connectingMode ? '#FFFFFF' : '#D2691E'} 
            />
            <Text style={[
              styles.controlButtonText,
              connectingMode && styles.activeControlButtonText
            ]}>
              {connectingMode ? 'Cancel' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {connectingMode && (
        <View style={styles.connectionTypeSelector}>
          <Text style={styles.selectorLabel}>Connection Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeButtons}>
              {(['parent', 'spouse', 'sibling', 'child'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    connectionType === type && styles.selectedTypeButton,
                  ]}
                  onPress={() => setConnectionType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      connectionType === type && styles.selectedTypeButtonText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView 
        style={styles.mapContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: mapDimensions.height }}
        >
          <Svg width={mapDimensions.width} height={mapDimensions.height}>
            {/* Render connections first (behind nodes) */}
            {connections.map(renderConnection)}
            
            {/* Render nodes */}
            {nodes.map(renderNode)}
          </Svg>
        </ScrollView>
      </ScrollView>

      {selectedNode && !connectingMode && (
        <View style={styles.nodeInfo}>
          <Text style={styles.nodeInfoTitle}>
            {nodes.find(n => n.id === selectedNode)?.member.name}
          </Text>
          <Text style={styles.nodeInfoSubtitle}>
            Tap "Connect" to create relationships
          </Text>
        </View>
      )}

      {connectingMode && selectedNode && (
        <View style={styles.connectingInfo}>
          <Text style={styles.connectingText}>
            Select another person to create a {connectionType} relationship with{' '}
            {nodes.find(n => n.id === selectedNode)?.member.name}
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Parent/Child</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Spouse</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Sibling</Text>
          </View>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2691E',
    backgroundColor: '#FFFFFF',
  },
  activeControlButton: {
    backgroundColor: '#D2691E',
  },
  controlButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  activeControlButtonText: {
    color: '#FFFFFF',
  },
  connectionTypeSelector: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectorLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedTypeButton: {
    borderColor: '#D2691E',
    backgroundColor: '#FFF8F0',
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedTypeButtonText: {
    color: '#D2691E',
  },
  mapContainer: {
    flex: 1,
    minHeight: 400,
  },
  nodeInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF8F0',
  },
  nodeInfoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  nodeInfoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  connectingInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F0F9FF',
  },
  connectingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    textAlign: 'center',
  },
  legend: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
}); 