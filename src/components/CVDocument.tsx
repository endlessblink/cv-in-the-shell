import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/helvetica@0.1.3/fonts/helvetica-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/helvetica@0.1.3/fonts/helvetica-bold.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  header: {
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 5,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    marginRight: 5,
  },
  bulletText: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  location: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
  },
  text: {
    marginBottom: 4,
  },
});

interface CVDocumentProps {
  content: string;
}

const CVDocument: React.FC<CVDocumentProps> = ({ content }) => {
  // Clean up the content first
  const cleanContent = content
    .replace(/^Here is (?:my|the|an?) (?:optimized )?version of the CV:?\s*/i, '')
    .replace(/^Here is (?:my|the|an?) CV:?\s*/i, '')
    .replace(/^Here is the online version:?\s*/i, '')
    .trim();

  // Split into sections with proper spacing
  const sections = cleanContent
    .split(/\n{2,}(?=[A-Z][A-Z\s]+(?:\n|:))/)
    .filter(Boolean);

  const renderSection = (section: string, index: number) => {
    const lines = section.trim().split('\n').filter(line => line.trim());

    // Header section (name and contact)
    if (index === 0) {
      const [name, ...contactInfo] = lines;
      return (
        <View style={styles.header} key={index}>
          <Text style={styles.name}>{name.trim()}</Text>
          <Text style={styles.contactInfo}>
            {contactInfo.join(' | ')}
          </Text>
        </View>
      );
    }

    // Regular sections
    const [header, ...contentLines] = lines;
    return (
      <View style={styles.section} key={index}>
        <Text style={styles.sectionTitle}>{header.trim()}</Text>
        <View>
          {contentLines.map((line, lineIndex) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('•')) {
              return (
                <View style={styles.bulletPoint} key={lineIndex}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    {trimmedLine.substring(1).trim()}
                  </Text>
                </View>
              );
            }

            if (trimmedLine.includes('Tel Aviv, Israel')) {
              const [title, location] = trimmedLine.split('Tel Aviv, Israel').map(s => s.trim());
              return (
                <View key={lineIndex}>
                  <Text style={styles.jobTitle}>{title}</Text>
                  <Text style={styles.location}>
                    Tel Aviv, Israel{location ? `, ${location}` : ''}
                  </Text>
                </View>
              );
            }

            return (
              <Text style={styles.text} key={lineIndex}>
                {trimmedLine}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sections.map((section, index) => renderSection(section, index))}
      </Page>
    </Document>
  );
};

export default CVDocument;
