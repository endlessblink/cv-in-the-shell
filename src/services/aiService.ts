import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const getOpenAIClient = () => {
  const apiKey = localStorage.getItem('openaiApiKey');
  if (!apiKey) {
    throw new Error(
      'OpenAI API key is missing. Please configure it in settings.'
    );
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

const getAnthropicClient = () => {
  const apiKey = localStorage.getItem('anthropicApiKey');
  if (!apiKey) {
    throw new Error(
      'Anthropic API key is missing. Please configure it in settings.'
    );
  }
  return new Anthropic({
    apiKey
  });
};

export const processCV = async (cvText: string, jobDescription: string): Promise<string> => {
  try {
    const provider = localStorage.getItem('aiProvider') || 'openai';
    
    if (provider === 'openai') {
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
    } else {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `Please optimize and structure this CV content, considering this job description: ${jobDescription}\n\nCV Content: ${cvText}. Format the CV content into clear sections: PERSONAL INFO, PROFESSIONAL SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, and EDUCATION. Maintain all original information but structure it clearly.`
        }]
      });
      return response.content[0].text || cvText;
    }
  } catch (error) {
    console.error('Error processing CV:', error);
    throw error;
  }
};