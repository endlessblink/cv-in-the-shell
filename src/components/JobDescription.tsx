import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionProps {
  value: string;
  onChange: (value: string) => void;
}

const JobDescription = ({ value, onChange }: JobDescriptionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary">Job Description</h2>
      <Textarea
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default JobDescription;