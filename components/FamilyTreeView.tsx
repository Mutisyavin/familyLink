import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { TreeNode, TreeConnection } from '@/types/FamilyMember';
import { User } from 'lucide-react-native';

interface FamilyTreeViewProps {
  nodes: TreeNode[];
  connections: TreeConnection[];
  onNodePress: (nodeId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FamilyTreeView({
  nodes,
  connections,
  onNodePress,
}: FamilyTreeViewProps) {
  if (!nodes.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <User size={48} color="#A16207" />
        </View>
        <Text style={styles.emptyTitle}>Your Family Tree Awaits</Text>
        <Text style={styles.emptySubtitle}>
          Start by adding your first family member to begin building your legacy
        </Text>
      </View>
    );
  }

  // Calculate tree dimensions
  const minX = Math.min(...nodes.map(n => n.x)) - 60;
  const maxX = Math.max(...nodes.map(n => n.x)) + 60;
  const minY = Math.min(...nodes.map(n => n.y)) - 40;
  const maxY = Math.max(...nodes.map(n => n.y)) + 200;

  const treeWidth = Math.max(maxX - minX, SCREEN_WIDTH);
  const treeHeight = maxY - minY;

  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);

      if (!fromNode || !toNode) return null;

      const fromX = fromNode.x - minX;
      const fromY = fromNode.y - minY + 80; // Bottom of parent node
      const toX = toNode.x - minX;
      const toY = toNode.y - minY + 20; // Top of child node

      let strokeColor = '#92400E';
      let strokeWidth = 2;

      if (connection.type === 'spouse') {
        strokeColor = '#DC2626';
        strokeWidth = 3;
      }

      // Create curved path for parent-child connections
      if (connection.type === 'parent') {
        const midY = fromY + (toY - fromY) / 2;
        const path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
        
        return (
          <Path
            key={`connection-${index}`}
            d={path}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        );
      } else {
        // Direct line for spouse connections
        return (
          <Line
            key={`connection-${index}`}
            x1={fromX}
            y1={fromY - 40}
            x2={toX}
            y2={toY - 40}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }
    });
  };

  return (
    <ScrollView
      style={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { width: treeWidth, height: treeHeight },
      ]}
    >
      <View style={styles.treeContainer}>
        <Svg
          width={treeWidth}
          height={treeHeight}
          style={StyleSheet.absoluteFill}
        >
          {renderConnections()}
        </Svg>

        {nodes.map((node) => (
          <TouchableOpacity
            key={node.id}
            style={[
              styles.nodeContainer,
              {
                left: node.x - minX - 60,
                top: node.y - minY,
              },
            ]}
            onPress={() => onNodePress(node.id)}
          >
            <View style={styles.nodeCard}>
              <View style={styles.photoContainer}>
                {node.member.photoUri ? (
                  <Image
                    source={{ uri: node.member.photoUri }}
                    style={styles.nodePhoto}
                  />
                ) : (
                  <View style={styles.placeholderPhoto}>
                    <User size={32} color="#A16207" />
                  </View>
                )}
              </View>
              <Text style={styles.nodeName} numberOfLines={2}>
                {node.member.name || 'Unnamed'}
              </Text>
              {node.member.dateOfBirth && (
                <Text style={styles.nodeDate}>
                  {new Date(node.member.dateOfBirth).getFullYear()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  scrollContent: {
    minWidth: SCREEN_WIDTH,
  },
  treeContainer: {
    flex: 1,
    position: 'relative',
  },
  nodeContainer: {
    position: 'absolute',
    width: 120,
  },
  nodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  photoContainer: {
    marginBottom: 8,
  },
  nodePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  placeholderPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  nodeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#92400E',
    lineHeight: 16,
  },
  nodeDate: {
    fontSize: 10,
    color: '#A16207',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 24,
  },
});