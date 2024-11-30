import React from 'react';
import { Button } from '@/components/ui/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { jsPDF } from 'jspdf';
import CVDocument from './CVDocument';

interface OptimizedCVProps {
  content: string;
  onReset: () => void;
}

const OptimizedCV: React.FC<OptimizedCVProps> = ({ content, onReset }) => {
  // Format content for preview
  const formattedContent = content
    // Remove any AI-generated text
    .replace(/^Here is the optimized CV:[\n\s]*/i, '')
    .replace(/^Here's the optimized version:[\n\s]*/i, '')
    .replace(/^Here is my optimized version:[\n\s]*/i, '')
    .split('\n')
    .map((line, index) => {
      // Skip empty lines
      if (!line.trim()) return null;
      
      // Headers (all caps)
      if (line.trim().match(/^[A-Z][A-Z\s&]+$/)) {
        return (
          <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-white border-b border-gray-700 pb-2">
            {line.trim()}
          </h2>
        );
      }

      // Job titles and dates
      if (line.includes('(') && line.includes(')') || 
          line.includes('Producer') || 
          line.includes('Designer') || 
          line.includes('Editor') || 
          line.includes('Artist') ||
          line.includes('Department')) {
        return (
          <p key={index} className="text-lg font-semibold mt-4 mb-2 text-white">
            {line.trim()}
          </p>
        );
      }

      // Bullet points
      if (line.trim().startsWith('•')) {
        return (
          <p key={index} className="text-base mb-2 text-gray-300 pl-4">
            {line.trim()}
          </p>
        );
      }
      
      // Regular lines
      return (
        <p key={index} className="text-base mb-2 text-gray-300">
          {line.trim()}
        </p>
      );
    }).filter(Boolean);

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
        } else {
          // Regular sections
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
        y += 8; // Add space between sections
      });

      // Save with a more descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`optimized-cv-${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="bg-transparent text-white hover:bg-purple-900"
        >
          Reset
        </Button>
        <Button 
          onClick={generatePDF}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          Download PDF
        </Button>
      </div>
      
      <div className="bg-[#12111A] rounded-lg p-8">
        <div className="space-y-2">
          {formattedContent}
        </div>
      </div>
    </div>
  );
};

export default OptimizedCV;