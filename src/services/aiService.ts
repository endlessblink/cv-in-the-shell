import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const getOpenAIClient = () => {
  const apiKey = localStorage.getItem('openaiApiKey');
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please configure it in settings.');
  }
  return new OpenAI({ apiKey });
};

const getAnthropicClient = () => {
  const apiKey = localStorage.getItem('anthropicApiKey');
  if (!apiKey) {
    throw new Error('Anthropic API key is missing. Please configure it in settings.');
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

export const processCV = async (cvText: string, jobDescription: string) => {
  if (!cvText || !jobDescription) {
    throw new Error('Both CV and job description are required');
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
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert ATS (Applicant Tracking System) optimization assistant. Your task is to analyze CVs and optimize them for ATS compatibility while maintaining their professional tone and highlighting relevant qualifications based on the job description provided."
          },
          {
            role: "user",
            content: `Please optimize this CV for ATS compatibility based on this job description:\n\nJob Description:\n${jobDescription}\n\nCV:\n${cvText}`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Failed to optimize CV';
    } else {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: "claude-2",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Please optimize this CV for ATS compatibility based on this job description:\n\nJob Description:\n${jobDescription}\n\nCV:\n${cvText}`
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