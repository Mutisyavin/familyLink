import { FamilyMember, TreeNode, TreeConnection } from '@/types/FamilyMember';

export const TreeLayoutService = {
  generateTreeLayout(members: FamilyMember[]): { nodes: TreeNode[], connections: TreeConnection[] } {
    if (!members.length) return { nodes: [], connections: [] };

    // Find root members (those with no parents)
    const rootMembers = members.filter(member => 
      !member.relationships.parents.length
    );

    // If no root members, use the oldest member
    const roots = rootMembers.length > 0 ? rootMembers : [members[0]];

    const nodes: TreeNode[] = [];
    const connections: TreeConnection[] = [];
    const visited = new Set<string>();

    // Layout parameters
    const nodeWidth = 120;
    const nodeHeight = 160;
    const horizontalSpacing = 40;
    const verticalSpacing = 80;

    let currentY = 50;

    // Process each generation
    const processGeneration = (memberIds: string[], generation: number) => {
      const validMembers = memberIds
        .map(id => members.find(m => m.id === id))
        .filter((m): m is FamilyMember => m !== undefined && !visited.has(m.id));

      if (!validMembers.length) return [];

      const totalWidth = validMembers.length * nodeWidth + (validMembers.length - 1) * horizontalSpacing;
      let currentX = -totalWidth / 2;

      validMembers.forEach(member => {
        visited.add(member.id);
        
        nodes.push({
          id: member.id,
          member,
          x: currentX + nodeWidth / 2,
          y: currentY,
          generation,
        });

        currentX += nodeWidth + horizontalSpacing;
      });

      return validMembers.flatMap(member => member.relationships.children);
    };

    // Start with root generation
    let currentGeneration = roots.map(r => r.id);
    let generation = 0;

    while (currentGeneration.length > 0) {
      const nextGeneration = processGeneration(currentGeneration, generation);
      currentGeneration = nextGeneration;
      generation++;
      currentY += nodeHeight + verticalSpacing;
    }

    // Generate connections
    members.forEach(member => {
      // Parent-child connections
      member.relationships.children.forEach(childId => {
        connections.push({
          from: member.id,
          to: childId,
          type: 'parent',
        });
      });

      // Spouse connections
      member.relationships.spouses.forEach(spouseId => {
        if (member.id < spouseId) { // Avoid duplicate connections
          connections.push({
            from: member.id,
            to: spouseId,
            type: 'spouse',
          });
        }
      });
    });

    return { nodes, connections };
  },
};