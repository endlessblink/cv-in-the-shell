import OpenAI from 'openai';

const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.'
    );
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const processCV = async (cvText: string, jobDescription: string): Promise<string> => {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional CV optimizer. Format the provided CV content into clear sections: PERSONAL INFO, PROFESSIONAL SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, and EDUCATION. Maintain all original information but structure it clearly."
        },
        {
          role: "user",
          content: `Please optimize and structure this CV content, considering this job description: ${jobDescription}\n\nCV Content: ${cvText}`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || cvText;
  } catch (error) {
    console.error('Error processing CV:', error);
    throw new Error('Failed to process CV. Please ensure your API key is valid and try again.');
  }
};