import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { FamilyMember } from '@/types/FamilyMember';

export interface ExportOptions {
  format: 'pdf' | 'json' | 'image';
  includePhotos: boolean;
  includeVoiceNotes: boolean;
  includeMediaGallery: boolean;
  layout: 'tree' | 'list' | 'timeline' | 'photobook';
  orientation: 'portrait' | 'landscape';
  paperSize: 'A4' | 'Letter' | 'Legal';
}

export interface ShareOptions {
  title: string;
  message?: string;
  url?: string;
  generateQRCode?: boolean;
}

class ExportService {
  // Generate PDF family tree
  async generateFamilyTreePDF(
    members: FamilyMember[],
    options: ExportOptions = {
      format: 'pdf',
      includePhotos: true,
      includeVoiceNotes: false,
      includeMediaGallery: false,
      layout: 'tree',
      orientation: 'portrait',
      paperSize: 'A4',
    }
  ): Promise<string> {
    try {
      const htmlContent = this.generateFamilyTreeHTML(members, options);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: options.paperSize === 'A4' ? 595 : 612,
        height: options.paperSize === 'A4' ? 842 : 792,
        orientation: options.orientation,
      });

      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  // Export family data as JSON backup
  async exportFamilyData(
    members: FamilyMember[],
    options: ExportOptions
  ): Promise<string> {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        familyMembers: members,
        metadata: {
          totalMembers: members.length,
          membersWithPhotos: members.filter(m => m.photoUri || m.mediaItems?.length).length,
          membersWithVoiceNotes: members.filter(m => m.voiceNoteUri).length,
          livingMembers: members.filter(m => !m.dateOfDeath).length,
        },
        options,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `family-tree-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      return fileUri;
    } catch (error) {
      console.error('Error exporting family data:', error);
      throw new Error('Failed to export family data');
    }
  }

  // Capture family tree as image
  async captureTreeAsImage(viewRef: any): Promise<string> {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });
      return uri;
    } catch (error) {
      console.error('Error capturing tree image:', error);
      throw new Error('Failed to capture tree image');
    }
  }

  // Share exported file
  async shareFile(fileUri: string, options: ShareOptions): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: this.getMimeType(fileUri),
        dialogTitle: options.title,
        UTI: this.getUTI(fileUri),
      });
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new Error('Failed to share file');
    }
  }

  // Generate HTML for family tree PDF
  private generateFamilyTreeHTML(members: FamilyMember[], options: ExportOptions): string {
    const styles = this.getBaseStyles(options);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Family Tree</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="header">
            <h1>Family Tree</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="family-tree">
            ${options.layout === 'tree' ? this.generateTreeLayout(members, options) : ''}
            ${options.layout === 'list' ? this.generateListLayout(members, options) : ''}
            ${options.layout === 'timeline' ? this.generateTimelineLayout(members, options) : ''}
          </div>
          
          <div class="footer">
            <p>Created with LegacyLink - Preserving Family Stories</p>
          </div>
        </body>
      </html>
    `;
  }

  // Generate member card HTML
  private generateMemberCard(member: FamilyMember, options: ExportOptions): string {
    const photoHtml = options.includePhotos && member.photoUri 
      ? `<img src="${member.photoUri}" alt="${member.name}" class="member-photo">` 
      : '<div class="photo-placeholder">📷</div>';

    const birthYear = member.dateOfBirth ? new Date(member.dateOfBirth).getFullYear() : 'Unknown';
    const deathYear = member.dateOfDeath ? new Date(member.dateOfDeath).getFullYear() : null;
    const lifespan = deathYear ? `${birthYear} - ${deathYear}` : `${birthYear} - Present`;

    return `
      <div class="member-card">
        ${photoHtml}
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-lifespan">${lifespan}</p>
          ${member.occupation ? `<p class="member-occupation">${member.occupation}</p>` : ''}
          ${member.birthPlace ? `<p class="member-location">📍 ${member.birthPlace}</p>` : ''}
          ${member.biography && options.layout === 'list' ? `<p class="member-bio">${member.biography}</p>` : ''}
        </div>
      </div>
    `;
  }

  // Generate tree layout
  private generateTreeLayout(members: FamilyMember[], options: ExportOptions): string {
    const rootMembers = members.filter(m => m.relationships.parents.length === 0);
    
    return `
      <div class="tree-layout">
        ${rootMembers.map(root => this.generateTreeBranch(root, members, options, 0)).join('')}
      </div>
    `;
  }

  // Generate tree branch recursively
  private generateTreeBranch(member: FamilyMember, allMembers: FamilyMember[], options: ExportOptions, level: number): string {
    const children = allMembers.filter(m => m.relationships.parents.includes(member.id));
    const childrenHtml = children.map(child => this.generateTreeBranch(child, allMembers, options, level + 1)).join('');

    return `
      <div class="tree-branch level-${level}">
        ${this.generateMemberCard(member, options)}
        ${children.length > 0 ? `<div class="children">${childrenHtml}</div>` : ''}
      </div>
    `;
  }

  // Generate list layout
  private generateListLayout(members: FamilyMember[], options: ExportOptions): string {
    const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
    
    return `
      <div class="list-layout">
        ${sortedMembers.map(member => this.generateMemberCard(member, options)).join('')}
      </div>
    `;
  }

  // Generate timeline layout
  private generateTimelineLayout(members: FamilyMember[], options: ExportOptions): string {
    const membersWithDates = members
      .filter(m => m.dateOfBirth)
      .sort((a, b) => new Date(a.dateOfBirth!).getTime() - new Date(b.dateOfBirth!).getTime());

    return `
      <div class="timeline-layout">
        ${membersWithDates.map(member => `
          <div class="timeline-item">
            <div class="timeline-date">${new Date(member.dateOfBirth!).getFullYear()}</div>
            ${this.generateMemberCard(member, options)}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Get base CSS styles
  private getBaseStyles(options: ExportOptions): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }
      
      .header {
        text-align: center;
        padding: 40px 20px;
        border-bottom: 2px solid #D2691E;
        margin-bottom: 40px;
      }
      
      .header h1 {
        font-family: 'Playfair Display', serif;
        font-size: 48px;
        color: #8B4513;
        margin-bottom: 10px;
      }
      
      .subtitle {
        font-size: 18px;
        color: #666;
      }
      
      .member-card {
        display: flex;
        align-items: center;
        background: #FFFBEB;
        border: 1px solid #E0E0E0;
        border-radius: 12px;
        padding: 20px;
        margin: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .member-photo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 20px;
      }
      
      .photo-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #F5F5F5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-right: 20px;
      }
      
      .member-info {
        flex: 1;
      }
      
      .member-name {
        font-size: 24px;
        font-weight: 600;
        color: #8B4513;
        margin-bottom: 5px;
      }
      
      .member-lifespan {
        font-size: 16px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .member-occupation {
        font-size: 14px;
        color: #D2691E;
        font-weight: 500;
        margin-bottom: 5px;
      }
      
      .member-location {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }
      
      .member-bio {
        font-size: 14px;
        color: #555;
        line-height: 1.5;
      }
      
      .tree-layout {
        padding: 20px;
      }
      
      .tree-branch {
        margin-left: 40px;
      }
      
      .tree-branch.level-0 {
        margin-left: 0;
      }
      
      .children {
        border-left: 2px solid #D2691E;
        margin-left: 40px;
        padding-left: 20px;
      }
      
      .list-layout {
        padding: 20px;
      }
      
      .timeline-layout {
        padding: 20px;
      }
      
      .timeline-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .timeline-date {
        width: 100px;
        font-size: 18px;
        font-weight: 600;
        color: #D2691E;
        text-align: center;
        margin-right: 20px;
      }
      
      .footer {
        text-align: center;
        padding: 40px 20px;
        border-top: 1px solid #E0E0E0;
        margin-top: 40px;
        color: #666;
        font-size: 14px;
      }
    `;
  }

  // Get MIME type for file
  private getMimeType(fileUri: string): string {
    const extension = fileUri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'json':
        return 'application/json';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  // Get UTI for file (iOS)
  private getUTI(fileUri: string): string {
    const extension = fileUri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'com.adobe.pdf';
      case 'json':
        return 'public.json';
      case 'png':
        return 'public.png';
      case 'jpg':
      case 'jpeg':
        return 'public.jpeg';
      default:
        return 'public.data';
    }
  }
}

export const exportService = new ExportService();