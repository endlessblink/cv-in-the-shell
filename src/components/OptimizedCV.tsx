import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Document, Page, Text, View, StyleSheet, BlobProvider } from '@react-pdf/renderer';

interface OptimizedCVProps {
  content: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  contactInfo: {
    fontSize: 12,
    marginBottom: 3,
  },
  bulletPoint: {
    marginLeft: 15,
    fontSize: 12,
    marginBottom: 5,
  },
});

const CVDocument = ({ content }: { content: string }) => {
  const sections = content.split('\n\n');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sections.map((section, index) => {
          const lines = section.split('\n');
          const isHeading = lines[0].toUpperCase() === lines[0];
          
          return (
            <View key={index} style={styles.section}>
              {isHeading ? (
                <>
                  <Text style={styles.heading}>{lines[0]}</Text>
                  {lines.slice(1).map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.text}>
                      {line.startsWith('•') ? line : line}
                    </Text>
                  ))}
                </>
              ) : (
                lines.map((line, lineIndex) => (
                  <Text key={lineIndex} style={styles.text}>
                    {line}
                  </Text>
                ))
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

const OptimizedCV = ({ content }: OptimizedCVProps) => {
  const { toast } = useToast();

  const handleTextDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
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
    
    return sections.map((section, index) => {
      const lines = section.split('\n');
      const isHeading = lines[0].toUpperCase() === lines[0];
      
      return (
        <section key={index} className="mb-6 last:mb-0">
          {isHeading ? (
            <>
              <h3 className="text-xl font-bold mb-3">{lines[0]}</h3>
              <div className="space-y-2">
                {lines.slice(1).map((line, lineIndex) => (
                  <p key={lineIndex} className={`${line.startsWith('•') ? 'ml-4' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
            </>
          ) : (
            lines.map((line, lineIndex) => (
              <p key={lineIndex} className="mb-2 last:mb-0">
                {line}
              </p>
            ))
          )}
        </section>
      );
    });
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
          <BlobProvider document={<CVDocument content={content} />}>
            {({ url, loading }) => (
              <Button 
                variant="default" 
                disabled={loading}
                onClick={() => {
                  if (url) {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'optimized-cv.pdf';
                    link.click();
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'PDF'}
              </Button>
            )}
          </BlobProvider>
        </div>
      </div>
      <article className="whitespace-pre-line bg-muted p-6 rounded-lg text-sm space-y-4">
        {formatContent(content)}
      </article>
    </Card>
  );
};

export default OptimizedCV;