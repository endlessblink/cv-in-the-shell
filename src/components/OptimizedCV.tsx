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

      // Use the same section splitting as the preview
      const sections = content.split(/\n\n(?=[A-Z][A-Z\s]+(?:\n|:))/).filter(Boolean);

      sections.forEach((section, sectionIndex) => {
        const lines = section.trim().split('\n').filter(line => line.trim());

        // Header section (name and contact)
        if (sectionIndex === 0) {
          const [name, ...contactInfo] = lines;

          // Name with better positioning and larger size
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(24); // Increased from 22 to match preview
          const nameText = name.trim();
          const nameWidth = doc.getTextWidth(nameText);
          doc.text(nameText, (pageWidth - nameWidth) / 2, y);
          y += 15;

          // Contact info with better spacing and alignment
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          const contactText = contactInfo.join(' | ').trim();
          const wrappedContact = wrapText(contactText, 11, contentWidth);
          doc.text(wrappedContact, pageWidth / 2, y, {
            align: 'center',
            maxWidth: contentWidth
          });
          y += wrappedContact.length * 6 + 15; // Increased spacing after header
          return;
        }

        // Add page break if needed before new section
        if (y + 20 > pageHeight - margin.bottom) {
          doc.addPage();
          y = margin.top;
        }

        // Section header with better spacing and border
        const [header, ...contentLines] = lines;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16); // Increased from 14 to match preview
        doc.text(header.trim(), margin.left, y);
        y += 8;
        
        // Add section header underline
        doc.setDrawColor(200, 200, 200); // Light gray color for the line
        doc.line(margin.left, y, pageWidth - margin.right, y);
        y += 6;

        // Process content lines with improved formatting
        contentLines.forEach(line => {
          const trimmedLine = line.trim();

          // Check for page break
          if (y + 15 > pageHeight - margin.bottom) {
            doc.addPage();
            y = margin.top;
          }

          if (trimmedLine.startsWith('•')) {
            // Bullet points with better indentation and spacing
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const bulletText = trimmedLine.substring(1).trim();
            const wrappedText = wrapText(bulletText, 11, contentWidth - 12);
            
            wrappedText.forEach((textLine, index) => {
              if (index === 0) {
                doc.text('•', margin.left + 3, y);
              }
              doc.text(textLine, margin.left + 10, y);
              y += 6;
            });
            y += 3;

          } else if (trimmedLine.includes('Tel Aviv, Israel')) {
            // Job titles with better formatting and spacing
            const [title, location] = trimmedLine.split('Tel Aviv, Israel').map(s => s.trim());
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            const wrappedTitle = wrapText(title, 12, contentWidth);
            doc.text(wrappedTitle, margin.left, y);
            y += wrappedTitle.length * 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100); // Gray color to match preview
            const locationText = `Tel Aviv, Israel${location ? `, ${location}` : ''}`;
            doc.text(locationText, margin.left, y);
            doc.setTextColor(0, 0, 0); // Reset text color
            y += 8;

          } else {
            // Regular text with better line spacing
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const wrappedText = wrapText(trimmedLine, 11, contentWidth);
            doc.text(wrappedText, margin.left, y);
            y += wrappedText.length * 6 + 2;
          }
        });

        y += 12; // Increased spacing between sections
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