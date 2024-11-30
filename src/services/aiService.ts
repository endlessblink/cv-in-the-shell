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

  const systemPrompt = `You are an expert CV optimizer. Enhance this CV for the job description while following these rules:

1. TRUTHFUL OPTIMIZATION:
   - Reorder bullet points to prioritize experience most relevant to the job
   - Emphasize existing skills that match job requirements
   - Use industry-standard terminology for skills you already have
   - Highlight transferable skills from your actual experience
   - Keep all content 100% truthful and based on real experience

2. CONTENT PRESERVATION:
   - Keep all original sections and experiences
   - Maintain exact dates and positions
   - Preserve all locations and company names
   - Keep original qualifications and certifications
   - Don't remove any experience, even if seems less relevant

3. ENHANCEMENT TECHNIQUES:
   - Move most relevant achievements to the top of each section
   - Replace weak verbs with strong action verbs for existing achievements
   - Add specific metrics or numbers if they were implied in original
   - Align your existing technical terms with job requirements
   - Expand abbreviations to match job description terminology

4. STRICT PROHIBITIONS:
   - NO inventing new experiences or achievements
   - NO adding skills or technologies not mentioned in original
   - NO modifying dates, titles, or positions
   - NO exaggerating responsibilities
   - NO removing valid experience
   - NO making assumptions about capabilities
   - NO adding certifications or qualifications

5. FORMATTING:
   - Keep section headers in UPPERCASE
   - Maintain professional structure
   - Use consistent spacing
   - Preserve bullet point style
   - Remove any AI commentary or introductions

Here's the job description to optimize for:
${jobDescription}

Original CV to optimize (maintain complete truthfulness):`;

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