import axios from 'axios';
import { Reference, Keyword, ArticleTitle, OutlineHeading } from '@/lib/types';
import { serpApiService } from './serpApiService';
import { openaiService } from './openaiService';
import { AxiosError } from 'axios';

// API keys - using the ones provided
const OPENAI_API_KEY = "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";
const SERP_API_KEY = "68112bfd05d0c4991f37cb9953f25811d5d345aa142beac859f22e031865fdb7";

// API functions for fetching data
export const apiService = {
  // Fetch references based on topic
  fetchReferences: async (topic: string): Promise<Reference[]> => {
    console.log('Fetching references for topic:', topic);
    
    try {
      // Get competitor articles directly from the SERP API
      const references = await serpApiService.getCompetitorArticles(topic);
      
      console.log('References fetched successfully:', references.length);
      
      if (references && references.length > 0) {
        return references;
      }
      
      // If we get here, we have empty results but no error was thrown
      console.warn('No references found for topic:', topic);
      throw new Error('No references found for the given topic');
    } catch (error) {
      console.error('Error fetching references:', error);
      
      // Return high-quality fallbacks only as a last resort
      return [
        {
          id: 'fallback-1',
          title: `${topic} - The Definitive Guide (Temporary Result)`,
          url: 'https://example.com',
          source: 'example.com'
        },
        {
          id: 'fallback-2',
          title: `How to Research ${topic} - Temporary Fallback`,
          url: 'https://example.org',
          source: 'example.org'
        },
        {
          id: 'fallback-3',
          title: `Understanding ${topic} - Data Temporarily Unavailable`,
          url: 'https://example.net',
          source: 'example.net'
        }
      ];
    }
  },

  // Fetch primary keywords based on topic
  fetchPrimaryKeywords: async (topic: string): Promise<Keyword[]> => {
    try {
      console.log('Fetching primary keywords for topic:', topic);
      
      // Use the serpApiService to get primary keywords
      const keywords = await serpApiService.getPrimaryKeywords(topic);
      
      console.log('Primary keywords processed:', keywords.length);
      
      // Add the main keyword at the top if it's not already included
      const mainKeywordExists = keywords.some(k => k.text.toLowerCase() === topic.toLowerCase());
      
      if (!mainKeywordExists) {
        keywords.unshift({
        id: 'k-main',
        text: topic,
        volume: Math.floor(Math.random() * 2000) + 1000,
        difficulty: Math.floor(Math.random() * 50) + 40,
      });
      }
      
      return keywords;
    } catch (error) {
      console.error('Error fetching primary keywords:', error);
      // Return basic keyword if API fails
      return [{
        id: 'k-main',
        text: topic,
        volume: 1000,
        difficulty: 45
      }];
    }
  },

  // Generate titles based on topic and primary keyword
  generateTitles: async (topic: string, primaryKeyword: string): Promise<ArticleTitle[]> => {
    try {
      console.log('Generating titles for topic:', topic, 'with keyword:', primaryKeyword);
      
      // Use the openaiService to generate title suggestions
      const suggestions = await openaiService.generateTitleSuggestions(topic, primaryKeyword);
      
      // Convert to ArticleTitle format with scores
      const titles: ArticleTitle[] = suggestions.map(suggestion => ({
        id: suggestion.id,
        text: suggestion.text,
        score: Math.floor(Math.random() * 15) + 85 // Random score between 85-100
      }));
      
      console.log('Generated titles:', titles.length);
      return titles;
    } catch (error) {
      console.error('Error generating titles:', error);
      // Return basic titles if API fails
      return [
        { id: '1', text: `The Complete Guide to ${primaryKeyword}`, score: 85 },
        { id: '2', text: `${primaryKeyword}: Everything You Need to Know About ${topic}`, score: 82 },
        { id: '3', text: `How to Use ${primaryKeyword} Effectively in 2025`, score: 80 }
      ];
    }
  },

  // Fetch secondary keywords based on primary keyword
  fetchSecondaryKeywords: async (primaryKeyword: string, topic: string): Promise<Keyword[]> => {
    try {
      console.log('Fetching secondary keywords for:', primaryKeyword);
      
      // Use the serpApiService to get secondary keywords
      const keywords = await serpApiService.getSecondaryKeywords(topic, primaryKeyword);
      
      console.log('Secondary keywords processed:', keywords.length);

      console.log(`[API Service] ${keywords.length} unique secondary keywords after filtering`);

      // --- Keyword Volume Simulation --- 
      const keywordObjects: Keyword[] = keywords
        .slice(0, 20) // Increased limit to 20
        .map((keyword: Keyword, index: number): Keyword => {
          const volumeBase = 5000 - index * 400;
          const volumeVariance = Math.floor(Math.random() * 800);
          const volume = Math.max(volumeBase + volumeVariance, 100);
          const difficultyBase = 20 + index * 2;
          const difficultyVariance = Math.floor(Math.random() * 10);
          const difficulty = Math.min(difficultyBase + difficultyVariance, 60);
          return {
            ...keyword,
            volume,
            difficulty,
          };
        });
      // --- End Simulation --- 

      console.log(`[API Service] Returning ${keywordObjects.length} secondary keyword objects with simulated volume/difficulty`);
      
      if (keywordObjects.length === 0) {
        console.warn('[API Service] No secondary keywords found after filtering. Returning fallback data.');
        return getFallbackSecondaryKeywords(topic, primaryKeyword); // Use original topic for fallback
      }
      
      return keywordObjects;
    } catch (error) {
      console.error('Error fetching secondary keywords:', error);
      // Return empty array if API fails
      return [];
    }
  },

  // Generate article outline
  generateOutline: async (
    topic: string,
    primaryKeyword: string,
    secondaryKeywords: string[],
    articleType: string
  ): Promise<OutlineHeading[]> => {
    try {
      console.log('Generating outline for topic:', topic);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert SEO content strategist who creates comprehensive, well-structured article outlines. Your outlines maximize search engine visibility while providing exceptional value to readers."
            },
            {
              role: "user",
              content: `Create a detailed outline for a ${articleType} about "${topic}". The primary keyword is "${primaryKeyword}" and the secondary keywords are: ${secondaryKeywords.join(", ")}. 

              The outline should include:
              1. Main headings (H2s) covering the key aspects of the topic.
              2. Subheadings (H3s) under each main heading *only where necessary* for clarity and logical flow. Avoid excessive subdivision.
              3. A logical structure that flows well from introduction to conclusion.
              4. Natural inclusion of primary and secondary keywords within the headings/subheadings where appropriate.
              
              Format your response strictly as a JSON array of objects, where each object represents an H2 heading with properties:
              - "heading": the heading text
              - "subheadings": an array of strings for the H3 subheadings under this section (can be empty)
              
              Example JSON structure:
              [
                {
                  "heading": "Main Section 1 Title",
                  "subheadings": ["Subsection 1.1", "Subsection 1.2"]
                },
                {
                  "heading": "Main Section 2 Title",
                  "subheadings": [] // No subheadings needed here
                },
                ...
              ]`
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      console.log('Outline API response received');
      let content = response.data.choices[0].message.content;
      
      try {
        // Attempt to clean the response and extract JSON
        if (content) {
          content = content.trim();
          // Use a more robust regex to find JSON block, allowing optional 'json' tag
          const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
          if (jsonMatch && jsonMatch[1]) {
            content = jsonMatch[1].trim();
          } 
          // Additional check: sometimes the LLM might just return the JSON without fences
          // If it doesn't look like JSON after potential fence removal, log a warning but try parsing anyway
          // as the check might be too strict.
          if (!content.startsWith('[') && !content.startsWith('{')) {
            console.warn('Cleaned content does not immediately look like JSON (may still be valid):', content);
            // Let's remove the strict check and let JSON.parse handle it, 
            // but keep the warning. The catch block will handle true failures.
            // throw new Error('Response content is not valid JSON after cleaning');
          }
        } else {
          // Handle case where content is null or empty
          throw new Error('Received empty content from OpenAI for outline.');
        }
        
        // Parse the potentially cleaned JSON response
        const outline = JSON.parse(content);
        console.log('Successfully parsed outline JSON. Headings:', outline.length);
        return outline;
      } catch (parseError) {
        console.error('Error parsing outline JSON:', parseError, '\nRaw content:', response.data.choices[0].message.content);
        // Basic outline if parsing fails
        return [
          {
            heading: `Introduction to ${topic}`,
            subheadings: [`What is ${primaryKeyword}?`, `Why ${primaryKeyword} is Important`]
          },
          {
            heading: `Benefits of ${primaryKeyword}`,
            subheadings: [`Key Advantages of Using ${primaryKeyword}`, `How ${primaryKeyword} Solves Common Problems`]
          },
          {
            heading: `Types of ${primaryKeyword}`,
            subheadings: [`Most Common ${primaryKeyword} Options`, `Comparing Different ${primaryKeyword} Solutions`]
          },
          {
            heading: `How to Choose the Right ${primaryKeyword}`,
            subheadings: [`Factors to Consider When Selecting ${primaryKeyword}`, `Common Mistakes to Avoid`]
          },
          {
            heading: `Conclusion`,
            subheadings: [`Final Thoughts on ${primaryKeyword}`, `Next Steps`]
          }
        ];
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      // Basic outline if API fails
      return [
        {
          heading: `Introduction to ${topic}`,
          subheadings: [`What is ${primaryKeyword}?`, `Why ${primaryKeyword} is Important`]
        },
        {
          heading: `Benefits of ${primaryKeyword}`,
          subheadings: [`Key Advantages of Using ${primaryKeyword}`, `How ${primaryKeyword} Solves Common Problems`]
        },
        {
          heading: `Types of ${primaryKeyword}`,
          subheadings: [`Most Common ${primaryKeyword} Options`, `Comparing Different ${primaryKeyword} Solutions`]
        },
        {
          heading: `How to Choose the Right ${primaryKeyword}`,
          subheadings: [`Factors to Consider When Selecting ${primaryKeyword}`, `Common Mistakes to Avoid`]
        },
        {
          heading: `Conclusion`,
          subheadings: [`Final Thoughts on ${primaryKeyword}`, `Next Steps`]
        }
      ];
    }
  },

  // Generate complete article
  generateArticle: async (
    topic: string,
    outline: OutlineHeading[],
    primaryKeyword: string,
    secondaryKeywords: string[],
    articleType: string,
    writingStyle: string,
    pointOfView: string,
    articleLength: string,
    expertGuidance?: string,
    enhancements?: { ids: string[], content: Record<string, string> }
  ): Promise<string> => {
    try {
      // Determine word count and heading count based on articleLength
      let targetWordCount = "1500";
      let headingGuidance = "";
      
      if (articleLength === "sm") {
        targetWordCount = "800";
        headingGuidance = "Keep the article concise with around 3-4 main headings and minimal subheadings. Each section should be focused and brief.";
        
        // Limit outline to 3-4 headings for small articles
        if (outline.length > 4) {
          console.log("[API Service] Limiting outline for small article");
          outline = outline.slice(0, 4);
        }
      } else if (articleLength === "md") {
        targetWordCount = "1500";
        headingGuidance = "Use 5-6 main headings with relevant subheadings. Ensure balanced section lengths of around 200-250 words per section.";
      } else if (articleLength === "lg") {
        targetWordCount = "3000";
        headingGuidance = "Develop a comprehensive structure with 7-10 main headings and detailed subheadings. Each section should provide in-depth coverage.";
      }
      
      // Convert outline to formatted string for the prompt
      const outlineText = outline.map(section => {
        let sectionText = `## ${section.heading}`;
        if (section.subheadings.length > 0) {
          sectionText += '\n' + section.subheadings.map(sub => `### ${sub}`).join('\n');
        }
        return sectionText;
      }).join('\n\n');
      
      // Process enhancements to include directly in the article
      let enhancementInstructions = "";
      let enhancementContent = "";
      
      if (enhancements && enhancements.ids && enhancements.ids.length > 0) {
        enhancementInstructions = "\n\nIncorporate the following enhancements directly within the article structure:";
        
        // Map enhancement IDs to readable names and positions
        const enhancementDetails: {[key: string]: {name: string, position: 'beginning' | 'end' | 'appropriate'}} = {
          "summary": {name: "TL;DR Summary", position: 'beginning'},
          "keyTakeaways": {name: "Key Takeaways", position: 'beginning'},
          "faq": {name: "FAQ Section", position: 'end'},
          "callToAction": {name: "Call to Action", position: 'end'},
          "expertQuote": {name: "Expert Quote", position: 'appropriate'},
          "tableOfContents": {name: "Table of Contents", position: 'beginning'},
          "socialQuotes": {name: "Social Media Quotes", position: 'appropriate'}
        };
        
        // First collect all the enhancement content to provide as context
        if (enhancements.ids.length > 0 && enhancements.content) {
          enhancementContent = "\n\nHere are the enhancement contents to integrate as instructed:\n\n";
          
          // First mention the featured image if it exists
          if (enhancements.ids.includes('featuredImage') && enhancements.content['featuredImage']) {
            enhancementContent += `--- Featured Image ---\nA featured image is available for the article. Please add a reference to it as [Featured Image: AI-generated image for ${topic}] at the beginning of the article.\n\n`;
          }
          
          // Then add the other enhancements
          enhancements.ids.forEach(id => {
            if (id !== 'featuredImage' && enhancements.content[id]) {
              enhancementContent += `--- ${enhancementDetails[id]?.name || id} ---\n${enhancements.content[id]}\n\n`;
            }
          });
        }
        
        // Then provide specific instructions for each enhancement
        enhancements.ids.forEach(id => {
          if (id === 'featuredImage') {
            enhancementInstructions += `\n- **Featured Image**: Add a reference to the AI-generated featured image at the beginning of the article, but note that you do not need to include the actual image URL in the article text.`;
            return;
          }
          
          const detail = enhancementDetails[id] || {name: id, position: 'appropriate'};
          
          const position = detail.position === 'beginning' ? 'at the beginning of the article (after the introduction)' : 
                         detail.position === 'end' ? 'at the end of the article (before the conclusion)' : 
                         'at an appropriate place within the article where it fits contextually';
          
          enhancementInstructions += `\n- **${detail.name}**: Include this ${position}. DO NOT remove any of the original content from the enhancement.`;
        });
      }

      // Create detailed prompt for article generation with improved word count guidance
      const prompt = `Generate a comprehensive, deeply researched, and SEO-optimized ${writingStyle} article about "${topic}" using ${pointOfView} point of view. The target audience requires thorough explanations and actionable advice.

STRICT WORD COUNT: This article MUST be ${targetWordCount} words in length (±5%). Not shorter, not longer. This is a hard requirement.

Primary keyword: "${primaryKeyword}"
Secondary keywords: ${secondaryKeywords.join(", ")}

Follow this outline precisely:
${outlineText}

${headingGuidance}

${expertGuidance ? `Expert guidance to incorporate: ${expertGuidance}` : ''}
${enhancementInstructions}
${enhancementContent}

Key Requirements:
1.  **Word Count Control:** The article MUST be ${targetWordCount} words (±5%) in total length. This is extremely important and a key requirement.
2.  **Introduction:** Start with a compelling, detailed introduction (at least 100 words) that clearly defines the topic, hooks the reader, and outlines what the article will cover. This MUST come before any H2 headings.
3.  **Article Type & Structure:** Structure and write the content appropriate for a "${articleType}" with ${articleLength === "sm" ? "3-4 main sections" : articleLength === "md" ? "5-6 main sections" : "7-10 comprehensive sections"}.
4.  **Enhancement Integration:** When including enhancements, preserve their original content exactly as provided, only making minor adjustments for flow and style consistency. Use the exact headings specified for each enhancement.
5.  **Content Depth & Detail:** Under each H2 and H3 heading from the outline, provide substantial, in-depth explanations. ${articleLength === "sm" ? "Keep sections focused and concise." : articleLength === "md" ? "Include examples and details in each section, around 200-250 words per main section." : "Include extensive details, examples, statistics, and deep analysis in each section."} 
6.  **SEO Optimization:** Naturally incorporate the primary keyword (${primaryKeyword}) (1-2% density) and secondary keywords, preferably within H3 subheadings where contextually appropriate.
7.  **Writing Style & Tone:** Maintain a ${writingStyle} style and ${pointOfView} point of view consistently.
8.  **Structure & Flow:** Ensure smooth transitions between sections. Use bullet points or numbered lists where appropriate for clarity.
9.  **Conclusion:** End with a strong conclusion summarizing key points and providing a clear call-to-action or next step.
10. **Formatting:** Use Markdown correctly for headings, lists, bolding, italics.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert SEO content writer and subject matter expert renowned for producing articles that STRICTLY adhere to word count requirements. You follow instructions meticulously, ensuring comprehensive coverage under each heading, adherence to word count, specific article types, and SEO best practices. You NEVER create content that exceeds or falls short of the specified word count. When incorporating enhancement content, you preserve the original content exactly as provided."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating article:', error);
      return "An error occurred while generating the article. Please try again.";
    }
  },

  // Generate humanized version of the article
  humanizeArticle: async (article: string): Promise<string> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional editor who specializes in making content more engaging, conversational, and human-like while preserving key information and SEO value."
            },
            {
              role: "user",
              content: `Improve this article to make it more human-like, conversational, and engaging while keeping all the important information and SEO keywords. Add personal anecdotes, analogies, or examples where appropriate. Maintain the original structure, headings, and overall points, but make the tone warmer and more natural. Here's the article:\n\n${article}`
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error humanizing article:', error);
      return article; // Return original article if humanizing fails
    }
  },

  // Generate article enhancements
  generateEnhancement: async (
    enhancementType: string,
    article: string,
    primaryKeyword: string
  ): Promise<string> => {
    try {
      console.log(`[API Service] Generating ${enhancementType} enhancement with OpenAI for keyword "${primaryKeyword}"`);
      
      // Craft specific prompts based on enhancement type
      let prompt = "";
      let systemPrompt = "You are an expert content strategist specializing in creating high-value article enhancements that improve reader engagement and SEO performance. You excel at creating content that is informative, well-structured, and optimized for search engines while maintaining readability and user value.";
      
      switch (enhancementType) {
        case "faq":
          prompt = `Based on this article about "${primaryKeyword}", create a comprehensive FAQ section with 5-7 specific, detailed questions and answers that address common reader queries.
          
Format in clean Markdown with each question in bold (using **) followed by a detailed answer of at least 3-5 sentences each.

Focus on questions that:
1. Address common misconceptions about ${primaryKeyword}
2. Cover practical implementation details
3. Address potential challenges or obstacles
4. Explore comparisons with alternatives
5. Cover specific use cases or scenarios

The FAQ section should be comprehensive enough to potentially rank in Google's Featured Snippets.

The article content is:\n\n${article.substring(0, 4000)}...`;
          systemPrompt = "You are an expert at creating comprehensive, SEO-optimized FAQ sections that address the most common questions readers have about a topic. You create detailed, informative answers that provide significant value and are designed to rank well in search engines.";
          break;
          
        case "summary":
          prompt = `Create a concise, compelling TL;DR summary (around 150 words) for this article about "${primaryKeyword}".
          
The summary should:
1. Highlight the most valuable insights from the article
2. Include key statistics or data points if present
3. Mention specific actionable takeaways
4. Incorporate the primary keyword naturally
5. End with a sentence that encourages reading the full article

Format in clean Markdown with a clear "TL;DR" heading.

The article content is:\n\n${article.substring(0, 4000)}...`;
          systemPrompt = "You are an expert at creating concise, engaging article summaries that capture the essence of long-form content. You distill complex information into clear, value-packed summaries that encourage readers to continue reading.";
          break;
          
        case "callToAction":
          prompt = `Create a powerful, persuasive call-to-action section for this article about "${primaryKeyword}".
          
The CTA should:
1. Begin with a compelling header that creates urgency
2. Briefly summarize the value proposition related to ${primaryKeyword}
3. Include specific, actionable next steps (not vague "contact us" type directions)
4. Address potential objections or hesitations
5. End with a clear, direct instruction using action verbs
6. Include a benefit statement that reinforces why the reader should act

Format in clean Markdown with strategic use of bold text for emphasis.

The article content is:\n\n${article.substring(0, 4000)}...`;
          systemPrompt = "You are an expert copywriter who specializes in creating persuasive, high-converting calls to action. You craft CTAs that compel readers to take immediate action by clearly communicating value and addressing potential objections.";
          break;
          
        case "keyTakeaways":
          prompt = `Create a highly valuable "Key Takeaways" section for this article about "${primaryKeyword}" with 5-7 specific, actionable insights.
          
Each takeaway should:
1. Be concise but detailed enough to provide real value (1-2 sentences each)
2. Focus on actionable information rather than general facts
3. Include specific numbers, percentages, or statistics where relevant
4. Incorporate the primary keyword naturally
5. Be written in an authoritative, confident tone

Format in clean Markdown with a clear "Key Takeaways" heading followed by bullet points.

The article content is:\n\n${article.substring(0, 4000)}...`;
          systemPrompt = "You are an expert at distilling complex content into clear, actionable takeaways that provide immediate value to readers. You focus on extracting the most important, practical insights that readers can apply immediately.";
          break;
          
        case "expertQuote":
          prompt = `Create a compelling, insightful expert quote that adds authority to this article about "${primaryKeyword}".
          
The expert quote should:
1. Come from a fictional but credible expert with relevant credentials (create a name and title)
2. Provide a unique perspective or insight not explicitly covered in the article
3. Include specific, technical details that demonstrate deep knowledge
4. Incorporate the primary keyword naturally
5. Be 3-5 sentences in length to provide substantial value
6. Sound authentic and conversational (not overly formal or academic)

Format in clean Markdown with the quote in blockquote format and expert credentials clearly noted.

The article content for context is:\n\n${article.substring(0, 4000)}...`;
          systemPrompt = "You are an expert at crafting authoritative, insightful expert quotes that add credibility and depth to content. You create quotes that sound authentic, demonstrate expertise, and provide unique perspectives on topics.";
          break;
          
        case "tableOfContents":
          prompt = `Create a comprehensive table of contents for this article about "${primaryKeyword}" based on the headings present in the article.
          
The table of contents should:
1. Include all major headings and subheadings from the article
2. Use proper hierarchical structure with indentation for subheadings
3. Format each entry as a proper Markdown link with the format: [Heading Text](#heading-text) where the ID part uses kebab-case (lowercase with hyphens)
4. Include a brief (5-7 word) description after each link separated by a dash or colon
5. Have a clear "Table of Contents" heading at the top

For example:
# Table of Contents
- [Introduction](#introduction) - Overview of the topic
- [Key Benefits](#key-benefits) - Major advantages explained
  - [Benefit One](#benefit-one) - Detailed explanation of first benefit
  - [Benefit Two](#benefit-two) - Analysis of second benefit

Make sure the link IDs (in the parentheses after #) match what would be generated in HTML from the heading text - lowercase, spaces replaced with hyphens, and special characters removed.

The article content is:\n\n${article}`;
          systemPrompt = "You are an expert at creating well-structured, user-friendly tables of contents that improve article navigation and user experience. You create proper HTML anchor links that follow web standards for ID naming conventions and create a clear hierarchical structure.";
          break;

        case "socialQuotes":
          prompt = `Create 5 highly shareable social media quotes extracted from this article about "${primaryKeyword}".
          
Each quote should:
1. Be concise enough for Twitter/X (under 280 characters each)
2. Highlight a specific, valuable insight from the article
3. Include the primary keyword when possible
4. Be written in a compelling, attention-grabbing style
5. End with a clear hashtag related to the topic

Format in clean Markdown with each quote as a separate blockquote and include a suggested platform (Twitter/LinkedIn/Facebook) before each quote.

The article content is:\n\n${article.substring(0, 4000)}...`;
          systemPrompt = "You are a social media marketing expert who excels at creating highly shareable, engaging quotes for social platforms. You extract and optimize the most compelling insights from content for maximum engagement.";
          break;
          
        default:
          prompt = `Create additional content enhancement for this article about "${primaryKeyword}" focused on ${enhancementType}.
          
The enhancement should:
1. Provide substantial added value to the reader
2. Incorporate the primary keyword naturally
3. Be formatted in clean Markdown
4. Be between 150-250 words in length
5. Match the tone and style of the main article

The article content is:\n\n${article.substring(0, 4000)}...`;
      }

      try {
        console.log(`[API Service] Sending request to OpenAI for ${enhancementType} enhancement`);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
                content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
            ],
            temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
        console.log(`[API Service] Successfully received ${enhancementType} enhancement from OpenAI`);
      return response.data.choices[0].message.content;
      } catch (apiError: unknown) {
        console.error(`[API Service] OpenAI API error for ${enhancementType} enhancement:`, 
          apiError instanceof AxiosError ? apiError.response?.data : apiError);
        
        // Try a fallback approach with a different model if the first attempt fails
        try {
          console.log(`[API Service] Trying fallback model for ${enhancementType} enhancement`);
          const fallbackResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
              }
            }
          );
          
          console.log(`[API Service] Successfully received ${enhancementType} enhancement from fallback model`);
          return fallbackResponse.data.choices[0].message.content;
        } catch (fallbackError) {
          console.error(`[API Service] Fallback model also failed for ${enhancementType} enhancement:`, fallbackError);
          throw new Error(`Failed to generate ${enhancementType} enhancement, even with fallback model`);
        }
      }
    } catch (error) {
      console.error(`[API Service] General error generating ${enhancementType} enhancement:`, error);
      
      // Return a user-friendly default message
      return `Unable to generate ${enhancementType} enhancement at this time. Please try again later.`;
    }
  },
  
  // Generate article image suggestions using DALL-E
  generateImageSuggestion: async (
    primaryKeyword: string,
    articleTitle: string,
    useStockPhoto: boolean = false // Parameter kept for backward compatibility 
  ): Promise<string> => {
    try {
      console.log("[API Service] Generating image with DALL-E for:", primaryKeyword);
      
      // First, get image description from GPT
      const promptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional photographer and photography director creating detailed instructions for ultra-realistic, high-end photographs. You specialize in creating detailed descriptions that would result in professional, photorealistic photography indistinguishable from a real DSLR camera photo. Focus exclusively on photographic attributes like lighting, composition, depth of field, camera angle, subject positioning, and environment details. Your goal is to create a brief that any photography director could use to create a real-world photograph."
            },
            {
              role: "user",
              content: `Create a detailed photography brief for a professional stock photo that would work perfectly as a featured image for an article titled "${articleTitle}" about "${primaryKeyword}".

Follow these specific guidelines:
1. Describe only a REAL-WORLD photograph that could be taken by a professional photographer
2. Focus on a single clear subject that directly relates to the topic
3. Specify photographic lighting conditions (natural light, golden hour, studio lighting with soft boxes, etc.)
4. Include specific details about camera settings, lens choice (35mm, 85mm, etc.), aperture (f/2.8, etc.)
5. Describe realistic DOF (depth of field), bokeh effects, and composition (rule of thirds, etc.)
6. Reference specific real photography styles (documentary, editorial, commercial)
7. Describe only realistic scenes with actual people, places or objects - nothing fantastical
8. Request specific color grading (warm tones, high contrast, etc.)
9. Only return the photography brief text, nothing else.`
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      const imagePrompt = promptResponse.data.choices[0].message.content.trim();
      console.log("[API Service] Generated image prompt:", imagePrompt);
      
      // Enhanced prompt with stronger photorealistic forcing
      const enhancedPrompt = `${imagePrompt} This must be a 100% photorealistic professional photograph, indistinguishable from a real photograph taken with a high-end DSLR camera. Ultra-detailed 35mm photography with perfect lighting, professional studio quality, shot on Canon EOS R5, no digital art elements. High resolution, perfect exposure, award-winning photography.`;
      
      // Generate the image with DALL-E with higher quality settings
      const imageResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "natural"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          timeout: 60000 // 60 second timeout for image generation
        }
      );
      
      // Return the image URL
      return imageResponse.data.data[0].url;
    } catch (error) {
      console.error('Error generating image suggestion:', error);
      
      // If there's a specific error message from the API, log it
      if (error.response && error.response.data) {
        console.error('API error details:', error.response.data);
      }
      
      // Try a simpler prompt as fallback
      try {
        console.log("[API Service] Trying simplified prompt as fallback");
        
        // Use a simplified prompt directly without GPT-4 intermediary
        const fallbackPrompt = `A professional, high-quality photographic image related to ${primaryKeyword}. This should be a realistic photograph with excellent lighting and composition, suitable for an article titled "${articleTitle}". Photorealistic style, not digital art.`;
        
        const fallbackResponse = await axios.post(
          'https://api.openai.com/v1/images/generations',
          {
            model: "dall-e-3",
            prompt: fallbackPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            timeout: 60000
          }
        );
        
        return fallbackResponse.data.data[0].url;
      } catch (fallbackError) {
        console.error('Fallback image generation also failed:', fallbackError);
        
        // Last resort fallback to a basic stock image
        return "https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg";
      }
    }
  }
};

// --- Mock and Fallback Functions --- 

// Helper function to get mock references
function getMockReferences(topic: string): Reference[] {
  return [
    {
      id: 'mock-api-1',
      title: `${topic} - The Ultimate Guide (2023)`,
      url: 'https://example.com/guide',
      source: 'example.com'
    },
    {
      id: 'mock-api-2',
      title: `How to Understand ${topic} - Complete Tutorial`,
      url: 'https://example.com/tutorial',
      source: 'example.com'
    },
    {
      id: 'mock-api-3',
      title: `${topic}: Everything You Need to Know in 2023`,
      url: 'https://example.com/complete-guide',
      source: 'example.com'
    },
    {
      id: 'mock-api-4',
      title: `The Complete ${topic} Handbook for Beginners`,
      url: 'https://example.com/handbook',
      source: 'example.com'
    },
    {
      id: 'mock-api-5',
      title: `${topic} Trends and Future Outlook`,
      url: 'https://example.com/trends',
      source: 'example.com'
    }
  ];
}

// ... existing getFallbackReferences ...
// function getFallbackReferences(topic: string): Reference[] { /* ... */ }

// ... existing getFallbackKeywords ...
// function getFallbackKeywords(topic: string): Keyword[] { /* ... */ }

// Add missing definition for getFallbackSecondaryKeywords
function getFallbackSecondaryKeywords(topic: string, primaryKeyword?: string): Keyword[] {
  console.warn('Using fallback secondary keywords due to API error');
  const baseKeyword = primaryKeyword || topic;
  return [
    { id: 'fallback-sk-1', text: `${baseKeyword} examples`, volume: 1200, difficulty: 20 },
    { id: 'fallback-sk-2', text: `compare ${baseKeyword}`, volume: 800, difficulty: 15 },
    { id: 'fallback-sk-3', text: `${baseKeyword} alternatives`, volume: 1500, difficulty: 25 },
    { id: 'fallback-sk-4', text: `${baseKeyword} advantages`, volume: 900, difficulty: 18 },
    { id: 'fallback-sk-5', text: `${baseKeyword} disadvantages`, volume: 850, difficulty: 17 }
  ];
}

// Helper function to simplify long topics for keyword searches
function simplifyTopicForKeywords(topic: string): string {
  if (!topic) return '';
  
  // Clean the topic first: remove smart quotes and trim
  const cleanedTopic = topic.replace(/[""]/g, '').trim();
  if (!cleanedTopic) return '';

  // If topic had a colon, try taking the part after it
  const colonIndex = cleanedTopic.indexOf(':');
  if (colonIndex !== -1 && cleanedTopic.length > colonIndex + 1) {
    const simplified = cleanedTopic.substring(colonIndex + 1).trim();
    if (simplified.length > 5) { // Use if reasonably long
      console.log(`[API Service] Simplifying topic "${topic}" to "${simplified}" (after colon) for keyword search.`);
      return simplified;
    }
  }

  // If topic is moderately long (e.g., > 6 words), take the first 5-6 words
  const words = cleanedTopic.split(' ');
  const WORD_LIMIT = 6;
  const SIMPLIFIED_WORD_COUNT = 5; 
  if (words.length > WORD_LIMIT) {
    const simplified = words.slice(0, SIMPLIFIED_WORD_COUNT).join(' ');
    console.log(`[API Service] Simplifying topic "${topic}" to "${simplified}" (first ${SIMPLIFIED_WORD_COUNT} words) for keyword search.`);
    return simplified;
  }
  
  // Otherwise, use the cleaned original topic
  if (cleanedTopic !== topic) {
     console.log(`[API Service] Using cleaned topic "${cleanedTopic}" for keyword search (Original: "${topic}")`);
  }
  return cleanedTopic;
}
