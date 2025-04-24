import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true // Allow running in browser
});

export interface TitleSuggestion {
  id: string;
  text: string;
}

export const openaiService = {
  /**
   * Generate creative article title suggestions based on a topic
   * @param topic The main topic for the article
   * @param primaryKeyword Optional primary keyword to include
   * @returns Array of title suggestions
   */
  async generateTitleSuggestions(topic: string, primaryKeyword?: string): Promise<TitleSuggestion[]> {
    try {
      console.log('Calling OpenAI API for topic suggestions:', topic);
      
      const prompt = primaryKeyword 
        ? `Generate 4 highly creative, compelling, and SEO-optimized title suggestions for an article about "${topic}" that strategically incorporate the keyword "${primaryKeyword}".

Each title should:
- Be extremely attention-grabbing and emotionally compelling (use power words, numbers, questions, or curiosity gaps)
- Clearly communicate unique value/benefit to the reader
- Feel fresh and original (avoid generic patterns like "The Ultimate Guide to X")
- Be 40-70 characters long for optimal SEO performance
- Include the primary keyword naturally, ideally near the beginning
- Use formats proven to drive high CTR (clickthrough rates) such as:
  * How-to titles that promise specific results
  * Listicles with specific numbers
  * Titles that challenge common assumptions
  * Problem-solution formats
  * Titles with intriguing statistics or facts
  * Emotional triggers (surprise, curiosity, urgency)

Format your response as a numbered list of 4 titles.`
        : `Generate 4 highly creative, compelling, and SEO-optimized title suggestions for an article about "${topic}".

Each title should:
- Be extremely attention-grabbing and emotionally compelling (use power words, numbers, questions, or curiosity gaps)
- Clearly communicate unique value/benefit to the reader
- Feel fresh and original (avoid generic patterns like "The Ultimate Guide to X")
- Be 40-70 characters long for optimal SEO performance
- Include the main topic naturally, ideally near the beginning
- Use formats proven to drive high CTR (clickthrough rates) such as:
  * How-to titles that promise specific results
  * Listicles with specific numbers
  * Titles that challenge common assumptions
  * Problem-solution formats
  * Titles with intriguing statistics or facts
  * Emotional triggers (surprise, curiosity, urgency)

Format your response as a numbered list of 4 titles.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Upgraded to GPT-4o from GPT-3.5-turbo for better creativity
        messages: [
          {
            role: "system",
            content: "You are an expert copywriter specializing in creating irresistible, highly-clickable article headlines that drive massive engagement while maintaining search engine optimization best practices. You excel at crafting titles that stand out from competitors and compel readers to click immediately."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9 // Increased from 0.8 for more creativity
      });

      const content = response.choices[0]?.message?.content;
      console.log('OpenAI API response content:', content);
      
      if (!content) {
        console.error('Empty response from OpenAI API');
        return fallbackTitles(topic);
      }

      // Parse the response, which might be in various formats
      try {
        // Try to extract titles if they're in a numbered list format (1. Title)
        const numberedTitles = content.match(/\d+\.\s+([^\n]+)/g);
        if (numberedTitles && numberedTitles.length > 0) {
          return numberedTitles.map((title, index) => ({
            id: `ai-title-${index + 1}`,
            text: title.replace(/^\d+\.\s+/, '') // Remove the number prefix
          }));
        }
        
        // Try to extract titles if they're in a bullet point list format (- Title)
        const bulletTitles = content.match(/[-*•]\s+([^\n]+)/g);
        if (bulletTitles && bulletTitles.length > 0) {
          return bulletTitles.map((title, index) => ({
            id: `ai-title-${index + 1}`,
            text: title.replace(/^[-*•]\s+/, '') // Remove the bullet prefix
          }));
        }
        
        // If it's not in a list format, split by newlines and filter empty lines
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          return lines.map((title, index) => ({
            id: `ai-title-${index + 1}`,
            text: title.trim()
          }));
        }
      } catch (parseError) {
        console.error('Error parsing title suggestions:', parseError);
      }
      
      // If all parsing attempts fail, return fallback titles
      return fallbackTitles(topic);
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      return fallbackTitles(topic);
    }
  }
};

// Fallback titles function to ensure we always return something
function fallbackTitles(topic: string): TitleSuggestion[] {
  return [
    { id: 'fallback-1', text: `Understanding the Different Types of ${topic} and Their Applications` },
    { id: 'fallback-2', text: `How to Choose the Right ${topic} for Your Needs` },
    { id: 'fallback-3', text: `The Environmental Impact of ${topic}: Myths and Facts` },
    { id: 'fallback-4', text: `Innovations in Corrosion Prevention: Future Trends in ${topic} Solutions` }
  ];
} 