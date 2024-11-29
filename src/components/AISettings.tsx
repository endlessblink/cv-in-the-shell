import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const AISettings = () => {
  const [provider, setProvider] = useState(localStorage.getItem("aiProvider") || "openai");
  const [apiKey, setApiKey] = useState(localStorage.getItem(`${provider}ApiKey`) || "");
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem("aiProvider", provider);
    localStorage.setItem(`${provider}ApiKey`, apiKey);
    toast({
      title: "Settings saved",
      description: "Your AI provider settings have been updated",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-primary/10 hover:bg-primary/20 border-primary/20 hover:border-primary/30"
        >
          <Settings className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API key settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Provider</label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};