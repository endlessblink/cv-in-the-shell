import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OptimizedCVProps {
  content: string;
}

const OptimizedCV = ({ content }: OptimizedCVProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
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

  // Format the content by splitting sections and adding proper spacing
  const formatContent = (text: string) => {
    // Split the content into sections based on the markers we added
    const sections = text.split('\n\n');
    
    return sections.map((section, index) => (
      <div key={index} className="mb-6 last:mb-0">
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
      </div>
    ));
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Optimized CV</h2>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
      <div className="whitespace-pre-line bg-muted p-6 rounded-lg text-sm space-y-4">
        {formatContent(content)}
      </div>
    </Card>
  );
};

export default OptimizedCV;