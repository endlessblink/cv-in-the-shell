import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { pdfjs } from 'react-pdf';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface CVUploaderProps {
  onCVText: (text: string) => void;
}

const CVUploader = ({ onCVText }: CVUploaderProps) => {
  const { toast } = useToast();

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
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      // Format the text to be more readable
      const formattedText = fullText
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .split(/\n\s*\n/)      // Split on empty lines
        .filter(section => section.trim()) // Remove empty sections
        .join('\n\n');         // Join with double newlines

      onCVText(formattedText);
      
      toast({
        title: "CV uploaded successfully",
        description: "Your CV has been uploaded and parsed",
      });
    } catch (error) {
      toast({
        title: "Error parsing PDF",
        description: "There was an error reading your PDF file",
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