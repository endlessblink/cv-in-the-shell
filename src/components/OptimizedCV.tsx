import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFDownloadLinkProps } from '@react-pdf/renderer';
import { ReactElement } from 'react';

interface OptimizedCVProps {
  content: string;
}

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

// PDF Document component
const CVDocument = ({ content }: { content: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {content.split('\n\n').map((section, index) => (
        <View key={index} style={styles.section}>
          {section.split('\n').map((line, lineIndex) => (
            <Text key={lineIndex} style={styles.text}>
              {line}
            </Text>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

const OptimizedCV = ({ content }: OptimizedCVProps) => {
  const { toast } = useToast();

  const handleTextDownload = () => {
    const element = document.createElement("a");
    const formattedContent = content
      .replace(/[^\w\s.,()-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const file = new Blob([formattedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "optimized-cv.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "CV Downloaded",
      description: "Your optimized CV has been downloaded",
    });
  };

  const formatContent = (text: string) => {
    const sections = text.split('\n\n');
    
    return sections.map((section, index) => (
      <section key={index} className="mb-6 last:mb-0">
        {section.split('\n').map((line, lineIndex) => (
          <p 
            key={lineIndex} 
            className={`mb-2 last:mb-0 text-left ${
              line.includes(':') ? 'font-semibold' : ''
            }`}
          >
            {line}
          </p>
        ))}
      </section>
    ));
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">ATS-Optimized CV</h2>
        <div className="flex gap-2">
          <Button onClick={handleTextDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Text
          </Button>
          <PDFDownloadLink
            document={<CVDocument content={content} />}
            fileName="optimized-cv.pdf"
          >
            {({ loading }) => (
              <Button variant="default" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <article className="whitespace-pre-line bg-muted p-6 rounded-lg text-sm space-y-4">
        {formatContent(content)}
      </article>
    </Card>
  );
};

export default OptimizedCV;