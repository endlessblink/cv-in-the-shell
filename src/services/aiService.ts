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

  const systemPrompt = `Process this CV text while maintaining ALL original content and formatting. Follow these strict rules:
1. Preserve ALL original content exactly as provided
2. Maintain clear section headers in UPPERCASE (e.g., EDUCATION, EXPERIENCE)
3. Keep all bullet points with proper indentation
4. Ensure double line breaks between sections
5. Maintain the original order of sections
6. Keep contact information at the top
7. Do not add or remove any information
8. Do not modify dates or other details
9. Preserve all technical skills and tools mentioned
10. Return the CV with exact formatting preserved

Here's the job description to optimize for: ${jobDescription}

Format the following CV maintaining ALL content and structure:`;

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
        temperature: 0,
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