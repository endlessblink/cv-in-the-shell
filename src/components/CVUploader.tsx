import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { pdfjs } from 'react-pdf';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface CVUploaderProps {
  onCVText: (text: string) => void;
}

const CVUploader = ({ onCVText }: CVUploaderProps) => {
  const { toast } = useToast();

  const formatCVText = (text: string): string => {
    // Split into sections based on common CV section headers
    const sectionHeaders = [
      'EDUCATION',
      'EXPERIENCE',
      'SKILLS',
      'SUMMARY',
      'OBJECTIVE',
      'WORK EXPERIENCE',
      'PROFESSIONAL EXPERIENCE',
      'TECHNICAL SKILLS',
      'CERTIFICATIONS',
      'PROJECTS',
      'ACHIEVEMENTS',
      'LANGUAGES',
      'INTERESTS'
    ];

    // Preserve bullet points and section structure
    let formattedText = text
      .replace(/[•·]/g, '•')  // Standardize bullet points
      .replace(/([A-Z][A-Z\s]+)(?=\n)/g, '\n$1')  // Add newline before section headers
      .replace(/([.!?])\s+/g, '$1\n')  // Split sentences
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');

    // Ensure section headers are properly formatted
    sectionHeaders.forEach(header => {
      const headerRegex = new RegExp(`(^|\\n)${header}`, 'gi');
      formattedText = formattedText.replace(headerRegex, `\n\n${header.toUpperCase()}`);
    });

    // Format bullet points
    formattedText = formattedText
      .split('\n')
      .map(line => {
        // If line starts with a number or dash, convert to bullet
        if (/^\s*[\d-]/.test(line)) {
          return '• ' + line.replace(/^\s*[\d-]\s*/, '');
        }
        return line;
      })
      .join('\n');

    // Clean up extra spaces and newlines
    return formattedText
      .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
      .trim();
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert the File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      // Extract text from each page with better formatting
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = null;
        let lineText = '';
        
        // Process each text item
        textContent.items.forEach((item: any) => {
          // Check if this is a new line based on Y position
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            fullText += lineText.trim() + '\n';
            lineText = '';
          }
          
          // Add space if needed
          if (lineText && !lineText.endsWith(' ')) {
            lineText += ' ';
          }
          
          lineText += item.str;
          lastY = item.transform[5];
        });
        
        // Add the last line
        if (lineText.trim()) {
          fullText += lineText.trim() + '\n';
        }
        
        fullText += '\n';  // Add page break
      }

      // Format the extracted text
      const formattedText = formatCVText(fullText);
      onCVText(formattedText);
      
      toast({
        title: "CV uploaded successfully",
        description: "Your CV has been uploaded and parsed",
      });
    } catch (error) {
      console.error('PDF parsing error:', error);
      toast({
        title: "Error parsing PDF",
        description: error instanceof Error ? error.message : "There was an error reading your PDF file",
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone p-8 cursor-pointer text-center ${
        isDragActive ? "bg-secondary" : ""
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
      <p className="text-sm text-muted-foreground">
        {isDragActive
          ? "Drop your CV here"
          : "Drag & drop your CV PDF here, or click to select"}
      </p>
    </div>
  );
};

export default CVUploader;