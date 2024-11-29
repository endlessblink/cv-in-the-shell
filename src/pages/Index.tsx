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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            CV In The Shell
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
            Command-line inspired CV builder and manager
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="prose prose-blue max-w-none text-center">
            <h2 className="text-2xl font-semibold text-primary mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
              <div className="flex flex-col items-center text-center p-4 max-w-xs">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary text-xl font-semibold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Paste Your CV</h3>
                <p className="text-gray-600 text-sm">Upload your existing CV in any format. Our AI will preserve its core content.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 max-w-xs">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary text-xl font-semibold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Add Job Description</h3>
                <p className="text-gray-600 text-sm">Include the target job description to optimize your CV for the role.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 max-w-xs">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary text-xl font-semibold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Get Optimized CV</h3>
                <p className="text-gray-600 text-sm">Receive your enhanced, ATS-friendly CV tailored to the position.</p>
              </div>
            </div>
          </div>
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

        <div className="flex justify-center gap-4 mt-12 mb-16">
          <Button
            onClick={handleOptimize}
            size="lg"
            className="min-w-[200px] font-semibold"
            disabled={isProcessing || !cvText || !jobDescription}
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