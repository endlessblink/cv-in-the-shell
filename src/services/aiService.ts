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

  // Remove any header text variations
  return content
    .replace(/^Here is (?:my|the|an?) (?:optimized )?version of the CV:?\s*/i, '')
    .replace(/^Here is (?:my|the|an?) CV:?\s*/i, '')
    .replace(/^Here is the online version:?\s*/i, '')
    .replace(/^\s*NAME AND CONTACT INFO\s*/, '')  // Remove if it's the first line
    .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newlines
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
   - Start directly with the name and contact information
   - Do NOT add any introductory text or headers
   - Do NOT include phrases like "Here is my optimized version" or "Please let me know"
   - Keep all section headers in UPPERCASE
   - Preserve the professional structure

2. FORMATTING RULES:
   - Use single line breaks between sections
   - Use single line breaks within sections
   - Keep bullet points with proper indentation
   - Maintain consistent spacing
   - Do NOT add extra blank lines

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