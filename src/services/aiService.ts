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

  const systemPrompt = `You are an expert CV optimizer. Enhance this CV for the job description while following these STRICT rules:

1. FORMATTING REQUIREMENTS:
   - Start DIRECTLY with the name - NO introductory text whatsoever
   - Use EXACTLY one blank line between sections
   - Keep bullet points on single lines - NO wrapping
   - Maintain consistent indentation for all bullet points
   - Use UPPERCASE for all section headers
   - Keep job titles and dates on the same line
   - Remove ALL divider lines

2. CONTENT STRUCTURE:
   - Name and contact info first
   - Each section header in UPPERCASE
   - Job titles followed by company and dates on same line
   - Bullet points for responsibilities and achievements
   - Keep sections in original order
   - NO duplicate section headers

3. TRUTHFUL OPTIMIZATION:
   - Reorder bullet points to prioritize relevant experience
   - Use industry-standard terms for existing skills
   - Highlight transferable skills from actual experience
   - Keep all content 100% truthful

4. STRICT PROHIBITIONS:
   - NO introductory text or commentary
   - NO added skills or technologies
   - NO modified dates or positions
   - NO exaggerated responsibilities
   - NO duplicate content
   - NO wrapped lines for bullet points
   - NO extra spacing

Here's the job description to optimize for:
${jobDescription}

Original CV to optimize (maintain exact formatting rules):`;

  // Calculate approximate token count (rough estimate)
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