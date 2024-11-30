import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Terminal, FileText, Sparkles, Download } from "lucide-react";
import { ApiKeyContext } from "@/contexts/ApiKeyContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CVUploader from "@/components/CVUploader";
import JobDescription from "@/components/JobDescription";
import OptimizedCV from "@/components/OptimizedCV";
import { processCV } from "@/services/aiService";
import { AISettings } from "@/components/AISettings";

const Index = () => {
  const { apiKey, setApiKey } = useContext(ApiKeyContext);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [cvContent, setCvContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCvContent, setGeneratedCvContent] = useState<string>('');
  const { toast } = useToast();

  const handleOptimize = async () => {
    setError(null);
    
    if (!cvContent) {
      setError("Please provide your CV content");
      return;
    }

    setIsLoading(true);
    try {
      const processedCV = await processCV(cvContent);
      setGeneratedCvContent(processedCV);
      toast({
        title: "Success!",
        description: "Your CV has been optimized for ATS compatibility",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while processing your CV");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = (content: string) => {
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized_cv.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0118] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0A0118]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-purple-500" />
            <span className="font-bold text-xl">CV in the Shell</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Demo</a>
            <Button 
              variant="default"
              className="bg-gradient-to-r from-primary-gradient-from via-primary-gradient-via to-primary-gradient-to hover:opacity-90 transition-opacity"
            >
              Create Your CV
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Your Professional CV,{' '}
          <span className="bg-gradient-to-r from-primary-gradient-from via-primary-gradient-via to-primary-gradient-to bg-clip-text text-transparent">
            Unleashed
          </span>
        </h1>
        <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
          Create stunning CVs powered by AI. Join our exclusive community of professionals and stand out from the crowd.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-[#1A1127] border-gray-800 p-6">
            <div className="mb-4">
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Templates</h3>
            <p className="text-gray-400">Choose from AI-powered templates or create your custom CV design.</p>
          </Card>
          <Card className="bg-[#1A1127] border-gray-800 p-6">
            <div className="mb-4">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
            <p className="text-gray-400">Let AI optimize your content for maximum impact and professionalism.</p>
          </Card>
          <Card className="bg-[#1A1127] border-gray-800 p-6">
            <div className="mb-4">
              <Download className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Export Options</h3>
            <p className="text-gray-400">Download your CV in multiple formats including PDF and Word.</p>
          </Card>
        </div>

        {/* Main CV Editor */}
        <div className="bg-[#1A1127] border border-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <Label htmlFor="apiKey" className="text-left block mb-2">OpenAI API Key</Label>
            <Input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-[#0A0118] border-gray-800 text-white"
              placeholder="Enter your OpenAI API key"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="model" className="text-left block mb-2">AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-[#0A0118] border-gray-800">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1127] border-gray-800">
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <Label htmlFor="cv-content" className="text-left block mb-2">Your CV Content</Label>
            <Textarea
              id="cv-content"
              value={cvContent}
              onChange={(e) => setCvContent(e.target.value)}
              className="bg-[#0A0118] border-gray-800 h-48"
              placeholder="Paste your current CV content here..."
            />
          </div>

          <Button
            onClick={handleOptimize}
            disabled={isLoading || !apiKey || !cvContent}
            className="w-full bg-gradient-to-r from-primary-gradient-from via-primary-gradient-via to-primary-gradient-to hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </div>
            ) : (
              'Optimize CV'
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {generatedCvContent && (
            <div className="mt-6">
              <Label className="text-left block mb-2">Optimized CV</Label>
              <div className="bg-[#0A0118] border border-gray-800 rounded-lg p-4 whitespace-pre-wrap">
                {generatedCvContent}
              </div>
              <div className="mt-4 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => downloadPDF(generatedCvContent)}
                  className="border-gray-800 hover:bg-[#1A1127]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;