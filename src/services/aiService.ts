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

const cleanupCVContent = (content: string): string => {
  if (!content) return '';

  // Basic cleanup while preserving original content
  return content
    .replace(/^Here is the CV text with all content and formatting intact\n*/i, '') // Remove the unwanted header text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines
    .replace(/•\s+/g, '• ') // Clean bullet point spacing
    .trim();
};

export const processCV = async (cvText: string, jobDescription: string) => {
  if (!cvText) {
    throw new Error('CV text is required');
  }

  const provider = localStorage.getItem('aiProvider') || 'openai';
  const apiKey = localStorage.getItem(`${provider}ApiKey`);

  if (!apiKey) {
    throw new Error(`Please configure your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in settings`);
  }

  const systemPrompt = `You are an expert CV optimizer. Enhance this CV to match the job description while following these rules:

1. CONTENT RULES:
   - Do NOT add any introductory or concluding messages
   - Do NOT include phrases like "Here is my optimized version" or "Please let me know"
   - Start directly with the name and contact information
   - End with the last CV section
   - Keep all section headers in UPPERCASE
   - Preserve the professional structure

2. FORMATTING RULES:
   - Use double line breaks between sections
   - Use single line breaks within sections
   - Keep bullet points with proper indentation
   - Maintain consistent spacing

3. OPTIMIZATION RULES:
   - Use keywords from the job description
   - Highlight relevant experience
   - Keep all dates and locations
   - Maintain truthful content

Here's the job description to optimize for:
${jobDescription}

Optimize the following CV:`;

  try {
    let response;
    
    if (provider === 'openai') {
      const openai = getOpenAIClient();
      response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: cvText
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      return response.choices[0]?.message?.content || '';
    } else {
      const anthropic = getAnthropicClient();
      response = await anthropic.messages.create({
        model: "claude-2.1",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `${systemPrompt}\n\n${cvText}`
        }]
      });
      
      return response.content?.[0]?.text || '';
    }
  } catch (error) {
    console.error('Error processing CV:', error);
    throw new Error('Failed to process CV. Please try again or switch AI providers in settings.');
  }
};