import React from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Download, RotateCcw } from "lucide-react";
import { useToast } from "./ui/use-toast";
import jsPDF from 'jspdf';

interface OptimizedCVProps {
  content: string;
  onReset?: () => void;
}

const OptimizedCV: React.FC<OptimizedCVProps> = ({ content, onReset }) => {
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      // Initialize PDF with better font support
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });

      // Set up dimensions with better margins
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = {
        top: 20,
        bottom: 20,
        left: 25,
        right: 25
      };
      const contentWidth = pageWidth - margin.left - margin.right;
      let y = margin.top;

      // Enhanced helper function for page breaks
      const checkPageBreak = (height: number = 10) => {
        if (y + height >= pageHeight - margin.bottom) {
          doc.addPage();
          y = margin.top;
          return true;
        }
        return false;
      };

      // Improved text wrapping with better line height calculation
      const wrapText = (text: string, fontSize: number, maxWidth: number): string[] => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        return Array.isArray(lines) ? lines : [lines];
      };

      if (!content?.trim()) {
        throw new Error('No content provided');
      }

      // Split content into sections
      const sections = content.split('\n\n');
      
      // Process each section
      sections.forEach((section) => {
        // Skip empty sections
        if (!section.trim()) return;

        // Check for page break
        checkPageBreak();

        // Format headers and positions
        const lines = section.split('\n');
        const firstLine = lines[0].trim();

        // Section headers (all caps like EDUCATION, TECHNOLOGIES & CERTIFICATIONS)
        if (firstLine.match(/^[A-Z\s&]+$/)) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(firstLine, margin.left, y);
          y += doc.getFontSize() * 0.8; // Reduced spacing after section header

          // Add underline for section headers
          doc.setDrawColor(100, 100, 100);
          doc.line(margin.left, y - 2, pageWidth - margin.right, y - 2);
          y += 6; // Reduced spacing after underline

          // Process remaining lines in this section
          lines.slice(1).forEach(line => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            if (line.trim()) {
              doc.text(line.trim(), margin.left, y);
              y += doc.getFontSize() * 0.8; // Reduced line spacing
            }
          });
        }
        // Position headers (job titles with dates)
        else if (firstLine.match(/^[A-Za-z\s,&]+.*\([A-Za-z0-9\s-]+\)$/) || 
                firstLine.includes("Video Editor") || 
                firstLine.includes("Motion Designer")) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(firstLine, margin.left, y);
          y += doc.getFontSize() * 0.8; // Reduced spacing after position title

          // Process remaining lines in this section
          lines.slice(1).forEach(line => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            if (line.trim()) {
              // Handle bullet points
              if (line.trim().startsWith('•')) {
                const wrappedText = wrapText(line.trim(), doc.getFontSize(), contentWidth - 10);
                wrappedText.forEach((textLine, idx) => {
                  if (idx === 0) {
                    doc.text('•', margin.left, y);
                    doc.text(textLine.substring(1).trim(), margin.left + 8, y);
                  } else {
                    doc.text(textLine, margin.left + 8, y);
                  }
                  y += doc.getFontSize() * 0.8; // Reduced spacing between bullet points
                });
              } else {
                const wrappedText = wrapText(line.trim(), doc.getFontSize(), contentWidth);
                wrappedText.forEach(textLine => {
                  doc.text(textLine, margin.left, y);
                  y += doc.getFontSize() * 0.8; // Reduced line spacing
                });
              }
            }
          });
        }
        // Regular text
        else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          lines.forEach(line => {
            if (line.trim()) {
              const wrappedText = wrapText(line.trim(), doc.getFontSize(), contentWidth);
              wrappedText.forEach(textLine => {
                doc.text(textLine, margin.left, y);
                y += doc.getFontSize() * 0.8; // Reduced line spacing
              });
            }
          });
        }

        // Add smaller space after section
        y += 6; // Reduced spacing between sections
      });

      // Save with a more descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`optimized-cv-${timestamp}.pdf`);
      
      toast({
        title: "Success",
        description: "Your CV has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatContent = () => {
    if (!content?.trim()) return null;

    const sections = content.split(/\n\n(?=[A-Z][A-Z\s]+(?:\n|:))/).filter(Boolean);
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());

      // Name and contact section (first section)
      if (index === 0) {
        const [name, ...contactInfo] = lines;
        return (
          <div key={index} className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{name}</h1>
            <div className="text-lg text-gray-600 space-x-4">
              {contactInfo.join(' | ').split('|').map((info, i) => (
                <span key={i} className="whitespace-nowrap">{info.trim()}</span>
              ))}
            </div>
          </div>
        );
      }

      // Other sections
      const [header, ...contentLines] = lines;
      return (
        <div key={index} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
            {header.trim()}
          </h2>
          <div className="space-y-2">
            {contentLines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              
              if (trimmedLine.startsWith('•')) {
                return (
                  <div key={lineIndex} className="flex items-start pl-4 text-gray-700">
                    <span className="text-gray-400 mr-2 mt-1">•</span>
                    <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
                  </div>
                );
              }

              if (trimmedLine.includes('Tel Aviv, Israel')) {
                const [title, location] = trimmedLine.split('Tel Aviv, Israel').map(s => s.trim());
                return (
                  <div key={lineIndex} className="mb-3">
                    <div className="font-semibold text-gray-800">{title}</div>
                    <div className="text-gray-600">Tel Aviv, Israel{location ? `, ${location}` : ''}</div>
                  </div>
                );
              }

              return (
                <p key={lineIndex} className="text-gray-700">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">ATS-Optimized CV</h2>
        <div className="flex gap-2">
          {onReset && (
            <Button onClick={onReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button 
            onClick={generatePDF}
            variant="default" 
            className="gap-2"
            disabled={!content?.trim()}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      <div className="prose max-w-none">
        {formatContent()}
      </div>
    </Card>
  );
};

export default OptimizedCV;