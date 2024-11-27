import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  contactInfo: {
    fontSize: 11,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    color: '#2a2a2a',
    borderBottom: '1 solid #eee',
    paddingBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#2a2a2a',
    marginBottom: 2,
  },
  location: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 12,
  },
  bullet: {
    width: 10,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    paddingLeft: 5,
  },
  text: {
    marginBottom: 4,
  },
});

interface CVDocumentProps {
  content: string;
}

const CVDocument: React.FC<CVDocumentProps> = ({ content }) => {
  const sections = content.split(/\n\n(?=[A-Z][A-Z\s]+(?:\n|:))/).filter(Boolean);

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
