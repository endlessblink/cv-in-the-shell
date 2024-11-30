import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const getOpenAIClient = () => {
  const apiKey = localStorage.getItem('openai');
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please configure it in settings.');
  }
  return new OpenAI({ apiKey });
};

const getAnthropicClient = () => {
  const apiKey = localStorage.getItem('anthropic');
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
  const apiKey = localStorage.getItem(provider);

  if (!apiKey) {
    throw new Error(`Please configure your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in settings`);
  }

  // Calculate approximate token count (rough estimate)
  const systemPrompt = `You are an expert CV optimizer. Your task is to optimize the CV for the job description while following these STRICT rules:

1. CONTENT PRESERVATION RULES:
   - DO NOT add any new information that's not in the original CV
   - DO NOT modify dates, locations, or job titles
   - DO NOT add or remove sections
   - Keep all original bullet points
   - Maintain the exact same structure

2. FORMATTING RULES:
   - Keep the exact same section headers in UPPERCASE
   - Use consistent spacing (one line break between items)
   - Preserve all bullet points with original indentation
   - Start directly with name and contact info
   - Remove any AI-generated introductory text

3. OPTIMIZATION APPROACH:
   - Only rephrase existing content to highlight relevant skills
   - Use job description keywords where they naturally fit
   - Do not invent or assume any information
   - Keep all content factual and based on the original CV

4. STRICT PROHIBITIONS:
   - NO introductory text or AI commentary
   - NO additional sections or bullet points
   - NO modification of dates or positions
   - NO assumptions about skills or experience

Here's the job description to optimize for:
${jobDescription}

Original CV to optimize (maintain its exact structure and facts):`;
  const totalChars = systemPrompt.length + cvText.length + jobDescription.length;
  const approxTokens = Math.ceil(totalChars / 4); // Rough estimate of chars per token
  
  if (approxTokens > 3000) { // Leave buffer for response
    throw new Error('Input text is too long. Please reduce the CV or job description length.');
  }

  try {
    let response;
    
    if (provider === 'openai') {
      const openai = getOpenAIClient();
      try {
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
      } catch (error: any) {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few moments.');
        } else if (error.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your settings.');
        } else if (error.status === 400 && error.message.includes('max_tokens')) {
          throw new Error('Input text is too long. Please reduce the CV or job description length.');
        }
        throw error;
      }

      return response.choices[0]?.message?.content || '';
    } else {
      const anthropic = getAnthropicClient();
      try {
        response = await anthropic.messages.create({
          model: "claude-2.1",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: `${systemPrompt}\n\n${cvText}`
          }]
        });
      } catch (error: any) {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few moments.');
        } else if (error.status === 401) {
          throw new Error('Invalid Anthropic API key. Please check your settings.');
        } else if (error.message.includes('max_tokens')) {
          throw new Error('Input text is too long. Please reduce the CV or job description length.');
        }
        throw error;
      }
      
      return response.content?.[0]?.text || '';
    }
  } catch (error) {
    console.error('Error processing CV:', error);
    if (error instanceof Error) {
      throw error; // Re-throw our custom errors
    }
    throw new Error('Failed to process CV. Please try again or switch AI providers in settings.');
  }
};