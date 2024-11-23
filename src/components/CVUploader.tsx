import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CVUploaderProps {
  onCVText: (text: string) => void;
}

const CVUploader = ({ onCVText }: CVUploaderProps) => {
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would use proper PDF parsing
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      onCVText(text);
      toast({
        title: "CV uploaded successfully",
        description: "Your CV has been uploaded and parsed",
      });
    };
    reader.readAsText(file);
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