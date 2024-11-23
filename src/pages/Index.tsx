import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import CVUploader from "@/components/CVUploader";
import JobDescription from "@/components/JobDescription";
import OptimizedCV from "@/components/OptimizedCV";

const Index = () => {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizedCV, setOptimizedCV] = useState("");
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!cvText || !jobDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide both a CV and job description",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // In a real implementation, this would call an API to process the CV
    setTimeout(() => {
      setOptimizedCV(cvText);
      setIsProcessing(false);
      toast({
        title: "Success!",
        description: "Your CV has been optimized for ATS compatibility",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">
          CV Optimizer
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-primary">Upload CV</h2>
            <CVUploader onCVText={setCvText} />
            <div className="my-2">
              <p className="text-sm text-muted-foreground mb-2">Or paste your CV text:</p>
              <Textarea
                placeholder="Paste your CV content here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </Card>

          <Card className="p-6">
            <JobDescription
              value={jobDescription}
              onChange={setJobDescription}
            />
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleOptimize}
            className="w-full md:w-auto"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              "Optimize CV"
            )}
          </Button>
        </div>

        {optimizedCV && <OptimizedCV content={optimizedCV} />}
      </div>
    </div>
  );
};

export default Index;