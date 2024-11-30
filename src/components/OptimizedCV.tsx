import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { jsPDF } from 'jspdf';

interface OptimizedCVProps {
  content: string;
  onReset: () => void;
}

const OptimizedCV: React.FC<OptimizedCVProps> = ({ content, onReset }) => {
  useEffect(() => {
    console.log('CV Content:', content); // Debug log
  }, [content]);

  // Format content for preview
  const formattedContent = content
    // Remove introductory text
    .replace(/^Here is the optimized CV:[\n\s]*/i, '')
    .split('\n')
    .map((line, index) => {
      // Skip empty lines
      if (!line.trim()) return null;
      
      // Headers (all caps)
      if (line.trim().match(/^[A-Z][A-Z\s&]+$/)) {
        return (
          <h2 key={index} className="text-lg font-bold mt-4 mb-2 pb-1 border-b border-gray-300">
            {line.trim()}
          </h2>
        );
      }

      // Job titles/positions (first line after company or first line of section)
      if (line.includes('Producer') || 
          line.includes('Designer') || 
          line.includes('Editor') || 
          line.includes('Artist') ||
          line.includes('Department')) {
        return (
          <p key={index} className="text-base font-semibold mb-1 whitespace-pre-wrap">
            {line.trim()}
          </p>
        );
      }
      
      // Regular lines
      return (
        <p key={index} className="text-base mb-1 whitespace-pre-wrap">
          {line.trim()}
        </p>
      );
    }).filter(Boolean); // Remove null entries

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up page dimensions and margins
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = {
      top: 25,
      bottom: 25,
      left: 25,
      right: 25
    };
    const contentWidth = pageWidth - margin.left - margin.right;
    let y = margin.top;

    // Helper function to wrap text
    const wrapText = (text: string, fontSize: number, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = doc.getStringUnitWidth(currentLine + ' ' + word) * fontSize / doc.internal.scaleFactor;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Helper function to check and add page break
    const checkPageBreak = () => {
      if (y + 20 > pageHeight - margin.bottom) {
        doc.addPage();
        y = margin.top;
      }
    };

    try {
      if (!content) {
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
          y += doc.getFontSize() * 1.2;

          // Add underline for section headers
          doc.setDrawColor(100, 100, 100);
          doc.line(margin.left, y - 2, pageWidth - margin.right, y - 2);
          y += 8;

          // Process remaining lines in this section
          lines.slice(1).forEach(line => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            if (line.trim()) {
              const wrappedText = wrapText(line.trim(), doc.getFontSize(), contentWidth);
              wrappedText.forEach(textLine => {
                doc.text(textLine, margin.left, y);
                y += doc.getFontSize() * 1.2;
              });
            }
          });
        }
        // Position headers (job titles with dates)
        else if (firstLine.match(/^[A-Za-z\s,&]+.*\([A-Za-z0-9\s-]+\)$/) || 
                firstLine.includes("Video Editor") || 
                firstLine.includes("Motion Designer")) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          
          // Handle long titles by wrapping
          const wrappedTitle = wrapText(firstLine, doc.getFontSize(), contentWidth);
          wrappedTitle.forEach((titleLine, idx) => {
            doc.text(titleLine, margin.left, y);
            y += doc.getFontSize() * (idx === wrappedTitle.length - 1 ? 1.2 : 1);
          });

          // Process remaining lines in this section
          lines.slice(1).forEach(line => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            if (line.trim()) {
              // Handle bullet points
              if (line.trim().startsWith('•')) {
                const wrappedText = wrapText(line.trim().substring(1).trim(), doc.getFontSize(), contentWidth - 10);
                wrappedText.forEach((textLine, idx) => {
                  if (idx === 0) {
                    doc.text('•', margin.left, y);
                    doc.text(textLine, margin.left + 8, y);
                  } else {
                    doc.text(textLine, margin.left + 8, y);
                  }
                  y += doc.getFontSize() * 1.2;
                });
              } else {
                const wrappedText = wrapText(line.trim(), doc.getFontSize(), contentWidth);
                wrappedText.forEach(textLine => {
                  doc.text(textLine, margin.left, y);
                  y += doc.getFontSize() * 1.2;
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
                y += doc.getFontSize() * 1.2;
              });
            }
          });
        }

        // Add smaller space after section
        y += 6; 
      });

      // Save with a more descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`optimized-cv-${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center my-8">
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button onClick={generatePDF} className="bg-primary">
          Download PDF
        </Button>
      </div>
      
      <ScrollArea className="h-[600px] w-full rounded-md border p-6 bg-white text-black">
        <div className="space-y-1">
          {formattedContent}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OptimizedCV;