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
    // In a real implementation, this would generate a proper PDF
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

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Optimized CV</h2>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
      <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
        {content}
      </div>
    </Card>
  );
};

export default OptimizedCV;