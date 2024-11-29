import React from 'react';
import { Button } from '@/components/ui/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { jsPDF } from 'jspdf';

interface OptimizedCVProps {
  content: string;
  onReset: () => void;
}

const OptimizedCV: React.FC<OptimizedCVProps> = ({ content, onReset }) => {
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
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
      </div>
      <div className="flex justify-end space-x-4">
        <Button onClick={onReset} variant="outline">
          Reset
        </Button>
        <Button onClick={generatePDF}>
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default OptimizedCV;