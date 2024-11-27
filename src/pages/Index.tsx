import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import CVUploader from "@/components/CVUploader";
import JobDescription from "@/components/JobDescription";
import OptimizedCV from "@/components/OptimizedCV";
import { processCV } from "@/services/aiService";
import { AISettings } from "@/components/AISettings";

const Index = () => {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizedCV, setOptimizedCV] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleOptimize = async () => {
    setError(""); // Clear any previous errors
    
    if (!cvText || !jobDescription) {
      setError("Please provide both a CV and job description");
      return;
    }

    const provider = localStorage.getItem("aiProvider") || "openai";
    const apiKey = localStorage.getItem(`${provider}ApiKey`);

    if (!apiKey) {
      setError(`Please configure your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in the settings (gear icon) before proceeding.`);
      return;
    }

    setIsProcessing(true);
    try {
      const processedCV = await processCV(cvText, jobDescription);
      setOptimizedCV(processedCV);
      toast({
        title: "Success!",
        description: "Your CV has been optimized for ATS compatibility",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while processing your CV");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOptimizedCV("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-primary">
            CV Optimizer
          </h1>
          <AISettings />
        </div>
        
        {error && (
          <div className="bg-destructive/15 border-destructive/50 border rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}
        
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

        {optimizedCV && (
          <OptimizedCV content={optimizedCV} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default Index;