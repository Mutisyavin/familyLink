import OpenAI from 'openai';
import { FamilyMember } from '@/types/FamilyMember';
import { getRelationshipLabel, getAllRelationships } from './kinshipMapping';

// Note: In production, this should be stored securely and not in the client code
// For demo purposes, we'll use a placeholder. In a real app, this would be handled by a backend service.
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here';

interface BiographyGenerationOptions {
  style: 'formal' | 'casual' | 'storytelling' | 'historical';
  length: 'short' | 'medium' | 'long';
  includeRelationships: boolean;
  culturalContext?: string;
}

export class AIBiographyService {
  private openai: OpenAI | null = null;

  constructor() {
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }
  }

  /**
   * Generates a biography for a family member using AI
   */
  async generateBiography(
    member: FamilyMember,
    allMembers: FamilyMember[],
    options: BiographyGenerationOptions = {
      style: 'storytelling',
      length: 'medium',
      includeRelationships: true,
    }
  ): Promise<string> {
    if (!this.openai) {
      // Fallback to template-based biography if OpenAI is not configured
      return this.generateTemplateBiography(member, allMembers, options);
    }

    try {
      const prompt = this.buildPrompt(member, allMembers, options);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a skilled family historian and storyteller who creates engaging, respectful, and culturally sensitive biographies for family tree applications. Focus on celebrating the person\'s life, relationships, and legacy.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.getMaxTokens(options.length),
        temperature: 0.7,
      });

      const biography = completion.choices[0]?.message?.content?.trim();
      
      if (!biography) {
        throw new Error('No biography generated');
      }

      return biography;
    } catch (error) {
      console.error('Error generating AI biography:', error);
      // Fallback to template-based biography
      return this.generateTemplateBiography(member, allMembers, options);
    }
  }

  /**
   * Builds the prompt for AI biography generation
   */
  private buildPrompt(
    member: FamilyMember,
    allMembers: FamilyMember[],
    options: BiographyGenerationOptions
  ): string {
    const relationships = options.includeRelationships 
      ? getAllRelationships(member, allMembers)
      : [];

    let prompt = `Create a ${options.length} ${options.style} biography for a family member with the following information:\n\n`;
    
    // Basic information
    prompt += `Name: ${member.name}\n`;
    prompt += `Gender: ${member.gender}\n`;
    
    if (member.dateOfBirth) {
      prompt += `Date of Birth: ${member.dateOfBirth}\n`;
    }
    
    if (member.dateOfDeath) {
      prompt += `Date of Death: ${member.dateOfDeath}\n`;
    }
    
    if (member.birthPlace) {
      prompt += `Place of Birth: ${member.birthPlace}\n`;
    }
    
    if (member.occupation) {
      prompt += `Occupation: ${member.occupation}\n`;
    }

    // Existing biography as context
    if (member.biography && member.biography.trim()) {
      prompt += `\nExisting notes: ${member.biography}\n`;
    }

    // Family relationships
    if (relationships.length > 0) {
      prompt += `\nFamily Relationships:\n`;
      relationships.forEach(({ member: relatedMember, relationship }) => {
        prompt += `- ${relationship.relationship}: ${relatedMember.name}`;
        if (relatedMember.dateOfBirth) {
          const birthYear = new Date(relatedMember.dateOfBirth).getFullYear();
          prompt += ` (born ${birthYear})`;
        }
        prompt += `\n`;
      });
    }

    // Cultural context
    if (options.culturalContext) {
      prompt += `\nCultural Context: ${options.culturalContext}\n`;
    }

    // Style guidelines
    prompt += `\nStyle Guidelines:\n`;
    switch (options.style) {
      case 'formal':
        prompt += `- Write in a formal, respectful tone suitable for official records\n`;
        break;
      case 'casual':
        prompt += `- Write in a warm, conversational tone as if sharing with family\n`;
        break;
      case 'storytelling':
        prompt += `- Write as an engaging narrative that brings the person to life\n`;
        break;
      case 'historical':
        prompt += `- Write with historical context and significance\n`;
        break;
    }

    prompt += `- Focus on celebrating their life and contributions\n`;
    prompt += `- Include family relationships naturally in the narrative\n`;
    prompt += `- Be respectful and sensitive\n`;
    prompt += `- Make it personal and meaningful for family members\n`;
    
    switch (options.length) {
      case 'short':
        prompt += `- Keep it to 2-3 sentences, highlighting key aspects\n`;
        break;
      case 'medium':
        prompt += `- Write 1-2 paragraphs covering their life story\n`;
        break;
      case 'long':
        prompt += `- Write 3-4 paragraphs with rich detail about their life journey\n`;
        break;
    }

    return prompt;
  }

  /**
   * Fallback template-based biography generation
   */
  private generateTemplateBiography(
    member: FamilyMember,
    allMembers: FamilyMember[],
    options: BiographyGenerationOptions
  ): string {
    const relationships = options.includeRelationships 
      ? getAllRelationships(member, allMembers)
      : [];

    let biography = '';

    // Opening
    if (member.dateOfBirth) {
      const birthYear = new Date(member.dateOfBirth).getFullYear();
      const birthPlace = member.birthPlace ? ` in ${member.birthPlace}` : '';
      biography += `${member.name} was born in ${birthYear}${birthPlace}. `;
    } else {
      biography += `${member.name} is a cherished member of our family. `;
    }

    // Occupation
    if (member.occupation) {
      biography += `${this.getGenderPronoun(member.gender, 'subject')} worked as ${member.occupation}. `;
    }

    // Family relationships
    if (relationships.length > 0) {
      const parents = relationships.filter(r => r.relationship.relationship.includes('Father') || r.relationship.relationship.includes('Mother'));
      const spouses = relationships.filter(r => r.relationship.relationship.includes('Husband') || r.relationship.relationship.includes('Wife'));
      const children = relationships.filter(r => r.relationship.relationship.includes('Son') || r.relationship.relationship.includes('Daughter'));

      if (parents.length > 0) {
        const parentNames = parents.map(p => p.member.name).join(' and ');
        biography += `${this.getGenderPronoun(member.gender, 'subject')} was the child of ${parentNames}. `;
      }

      if (spouses.length > 0) {
        const spouseName = spouses[0].member.name;
        biography += `${this.getGenderPronoun(member.gender, 'subject')} was married to ${spouseName}. `;
      }

      if (children.length > 0) {
        const childCount = children.length;
        const childText = childCount === 1 ? 'child' : 'children';
        biography += `${this.getGenderPronoun(member.gender, 'subject')} had ${childCount} ${childText}. `;
      }
    }

    // Existing biography
    if (member.biography && member.biography.trim()) {
      biography += member.biography + ' ';
    }

    // Closing
    if (member.dateOfDeath) {
      const deathYear = new Date(member.dateOfDeath).getFullYear();
      biography += `${this.getGenderPronoun(member.gender, 'subject')} passed away in ${deathYear}. `;
    }

    biography += `${this.getGenderPronoun(member.gender, 'subject')} will always be remembered as an important part of our family's story.`;

    return biography.trim();
  }

  /**
   * Gets appropriate pronouns based on gender
   */
  private getGenderPronoun(gender: string, type: 'subject' | 'object' | 'possessive'): string {
    switch (gender.toLowerCase()) {
      case 'male':
        return type === 'subject' ? 'He' : type === 'object' ? 'him' : 'his';
      case 'female':
        return type === 'subject' ? 'She' : type === 'object' ? 'her' : 'her';
      default:
        return type === 'subject' ? 'They' : type === 'object' ? 'them' : 'their';
    }
  }

  /**
   * Gets max tokens based on length preference
   */
  private getMaxTokens(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 100;
      case 'medium':
        return 300;
      case 'long':
        return 500;
      default:
        return 300;
    }
  }

  /**
   * Checks if AI service is available
   */
  isAvailable(): boolean {
    return this.openai !== null;
  }

  /**
   * Suggests biography improvements
   */
  async suggestImprovements(
    currentBiography: string,
    member: FamilyMember
  ): Promise<string[]> {
    const suggestions: string[] = [];

    if (!member.dateOfBirth) {
      suggestions.push('Add birth date for more context');
    }

    if (!member.birthPlace) {
      suggestions.push('Add birth place to enrich the story');
    }

    if (!member.occupation) {
      suggestions.push('Add occupation or profession');
    }

    if (currentBiography.length < 50) {
      suggestions.push('Consider adding more details about their life');
    }

    if (!currentBiography.includes('family') && !currentBiography.includes('relationship')) {
      suggestions.push('Include family relationships and connections');
    }

    return suggestions;
  }
}

// Export singleton instance
export const aiService = new AIBiographyService(); 