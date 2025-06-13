import { FamilyMember } from '@/types/FamilyMember';

export interface RelationshipLabel {
  relationship: string;
  description: string;
}

/**
 * Determines the relationship label between two family members
 * @param person The person whose relationship we're determining
 * @param relativeTo The person we're determining the relationship relative to
 * @param allMembers All family members for context
 * @returns The relationship label and description
 */
export function getRelationshipLabel(
  person: FamilyMember,
  relativeTo: FamilyMember,
  allMembers: FamilyMember[]
): RelationshipLabel {
  // Direct relationships
  if (relativeTo.relationships.parents.includes(person.id)) {
    return {
      relationship: person.gender === 'male' ? 'Father' : person.gender === 'female' ? 'Mother' : 'Parent',
      description: 'Parent'
    };
  }

  if (relativeTo.relationships.children.includes(person.id)) {
    return {
      relationship: person.gender === 'male' ? 'Son' : person.gender === 'female' ? 'Daughter' : 'Child',
      description: 'Child'
    };
  }

  if (relativeTo.relationships.spouses.includes(person.id)) {
    return {
      relationship: person.gender === 'male' ? 'Husband' : person.gender === 'female' ? 'Wife' : 'Spouse',
      description: 'Spouse'
    };
  }

  if (relativeTo.relationships.siblings.includes(person.id)) {
    return {
      relationship: person.gender === 'male' ? 'Brother' : person.gender === 'female' ? 'Sister' : 'Sibling',
      description: 'Sibling'
    };
  }

  // Extended relationships
  const extendedRelationship = getExtendedRelationship(person, relativeTo, allMembers);
  if (extendedRelationship) {
    return extendedRelationship;
  }

  return {
    relationship: 'Family Member',
    description: 'Related'
  };
}

/**
 * Determines extended family relationships (grandparents, aunts, uncles, etc.)
 */
function getExtendedRelationship(
  person: FamilyMember,
  relativeTo: FamilyMember,
  allMembers: FamilyMember[]
): RelationshipLabel | null {
  const memberMap = new Map(allMembers.map(m => [m.id, m]));

  // Check for grandparent relationship
  for (const parentId of relativeTo.relationships.parents) {
    const parent = memberMap.get(parentId);
    if (parent && parent.relationships.parents.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Grandfather' : person.gender === 'female' ? 'Grandmother' : 'Grandparent',
        description: 'Grandparent'
      };
    }
  }

  // Check for grandchild relationship
  for (const childId of relativeTo.relationships.children) {
    const child = memberMap.get(childId);
    if (child && child.relationships.children.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Grandson' : person.gender === 'female' ? 'Granddaughter' : 'Grandchild',
        description: 'Grandchild'
      };
    }
  }

  // Check for aunt/uncle relationship (parent's sibling)
  for (const parentId of relativeTo.relationships.parents) {
    const parent = memberMap.get(parentId);
    if (parent && parent.relationships.siblings.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Uncle' : person.gender === 'female' ? 'Aunt' : 'Aunt/Uncle',
        description: 'Parent\'s sibling'
      };
    }
  }

  // Check for nephew/niece relationship (sibling's child)
  for (const siblingId of relativeTo.relationships.siblings) {
    const sibling = memberMap.get(siblingId);
    if (sibling && sibling.relationships.children.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Nephew' : person.gender === 'female' ? 'Niece' : 'Nephew/Niece',
        description: 'Sibling\'s child'
      };
    }
  }

  // Check for cousin relationship (parent's sibling's child)
  for (const parentId of relativeTo.relationships.parents) {
    const parent = memberMap.get(parentId);
    if (parent) {
      for (const parentSiblingId of parent.relationships.siblings) {
        const parentSibling = memberMap.get(parentSiblingId);
        if (parentSibling && parentSibling.relationships.children.includes(person.id)) {
          return {
            relationship: 'Cousin',
            description: 'Parent\'s sibling\'s child'
          };
        }
      }
    }
  }

  // Check for in-law relationships
  const inLawRelationship = getInLawRelationship(person, relativeTo, allMembers);
  if (inLawRelationship) {
    return inLawRelationship;
  }

  return null;
}

/**
 * Determines in-law relationships
 */
function getInLawRelationship(
  person: FamilyMember,
  relativeTo: FamilyMember,
  allMembers: FamilyMember[]
): RelationshipLabel | null {
  const memberMap = new Map(allMembers.map(m => [m.id, m]));

  // Check through spouse's family
  for (const spouseId of relativeTo.relationships.spouses) {
    const spouse = memberMap.get(spouseId);
    if (!spouse) continue;

    // Spouse's parents = in-laws
    if (spouse.relationships.parents.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Father-in-law' : person.gender === 'female' ? 'Mother-in-law' : 'Parent-in-law',
        description: 'Spouse\'s parent'
      };
    }

    // Spouse's siblings = in-laws
    if (spouse.relationships.siblings.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Brother-in-law' : person.gender === 'female' ? 'Sister-in-law' : 'Sibling-in-law',
        description: 'Spouse\'s sibling'
      };
    }
  }

  // Check if person is married to relativeTo's sibling
  for (const siblingId of relativeTo.relationships.siblings) {
    const sibling = memberMap.get(siblingId);
    if (sibling && sibling.relationships.spouses.includes(person.id)) {
      return {
        relationship: person.gender === 'male' ? 'Brother-in-law' : person.gender === 'female' ? 'Sister-in-law' : 'Sibling-in-law',
        description: 'Sibling\'s spouse'
      };
    }
  }

  return null;
}

/**
 * Gets all relationships for a person relative to all other family members
 */
export function getAllRelationships(
  person: FamilyMember,
  allMembers: FamilyMember[]
): Array<{ member: FamilyMember; relationship: RelationshipLabel }> {
  return allMembers
    .filter(member => member.id !== person.id)
    .map(member => ({
      member,
      relationship: getRelationshipLabel(member, person, allMembers)
    }));
}

/**
 * Suggests potential relationships when adding a new family member
 */
export function suggestRelationships(
  newMember: FamilyMember,
  existingMembers: FamilyMember[]
): Array<{ member: FamilyMember; suggestedRelationship: string; confidence: 'high' | 'medium' | 'low' }> {
  const suggestions: Array<{ member: FamilyMember; suggestedRelationship: string; confidence: 'high' | 'medium' | 'low' }> = [];

  // Simple heuristics for relationship suggestions
  existingMembers.forEach(member => {
    // Same last name might indicate family relationship
    const newMemberLastName = newMember.name.split(' ').pop()?.toLowerCase();
    const memberLastName = member.name.split(' ').pop()?.toLowerCase();
    
    if (newMemberLastName && memberLastName && newMemberLastName === memberLastName) {
      // Could be sibling, parent, child, etc.
      suggestions.push({
        member,
        suggestedRelationship: 'sibling',
        confidence: 'medium'
      });
    }

    // Age-based suggestions (if birth dates are available)
    if (newMember.dateOfBirth && member.dateOfBirth) {
      const newMemberYear = new Date(newMember.dateOfBirth).getFullYear();
      const memberYear = new Date(member.dateOfBirth).getFullYear();
      const ageDiff = Math.abs(newMemberYear - memberYear);

      if (ageDiff >= 20 && ageDiff <= 40) {
        // Potential parent-child relationship
        suggestions.push({
          member,
          suggestedRelationship: newMemberYear < memberYear ? 'parent' : 'child',
          confidence: 'medium'
        });
      } else if (ageDiff <= 10) {
        // Potential sibling relationship
        suggestions.push({
          member,
          suggestedRelationship: 'sibling',
          confidence: 'low'
        });
      }
    }
  });

  return suggestions;
} 