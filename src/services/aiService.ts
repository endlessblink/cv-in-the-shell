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
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const processCV = async (cvText: string, jobDescription: string): Promise<string> => {
  if (!cvText || !jobDescription) {
    throw new Error('CV text and job description are required');
  }

  const provider = localStorage.getItem('aiProvider') || 'openai';
  const apiKey = localStorage.getItem(`${provider}ApiKey`);

  if (!apiKey) {
    throw new Error(`Please configure your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in settings`);
  }
  
  try {
    if (provider === 'openai') {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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

      if (!response.choices[0]?.message?.content) {
        throw new Error('No response received from OpenAI');
      }

      return response.choices[0].message.content;
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
      
      const content = response.content[0];
      if (!content || !('value' in content) || typeof content.value !== 'string') {
        throw new Error('Invalid response received from Anthropic');
      }

      return content.value;
    }
  } catch (error) {
    console.error('Error processing CV:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to process CV: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while processing your CV');
  }
};