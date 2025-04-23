
import axios from 'axios';
import { Reference, Keyword, ArticleTitle, OutlineHeading } from '@/lib/types';

// API keys
const OPENAI_API_KEY = "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";
const SERP_API_KEY = "ab325143079f0c503ec178b08970495d178f2cb7c556dd7b014f459c5b2bad8f";

// API functions for fetching data
export const apiService = {
  // Fetch references based on topic
  fetchReferences: async (topic: string): Promise<Reference[]> => {
    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: topic,
          engine: 'google_scholar',
          api_key: SERP_API_KEY,
          num: 10
        }
      });
      
      const organicResults = response.data.organic_results || [];
      
      return organicResults.map((result: any, index: number) => ({
        id: `ref-${index + 1}`,
        title: result.title,
        url: result.link,
        source: result.publication_info?.summary || 'Unknown Source'
      }));
    } catch (error) {
      console.error('Error fetching references:', error);
      // Fallback to empty array if API fails
      return [];
    }
  },

  // Fetch primary keywords based on topic
  fetchPrimaryKeywords: async (topic: string): Promise<Keyword[]> => {
    try {
      // Using SerpAPI for keywords
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: topic,
          engine: 'google',
          api_key: SERP_API_KEY
        }
      });
      
      // Extract related searches and keywords from the response
      const relatedSearches = response.data.related_searches || [];
      const relatedQuestions = response.data.related_questions || [];
      
      const primaryKeywords: Keyword[] = [];
      
      // Process related searches (better volume/competition estimate)
      relatedSearches.forEach((item: any, index: number) => {
        primaryKeywords.push({
          id: `ks-${index + 1}`,
          text: item.query,
          // Generating mock volume/difficulty as SerpAPI doesn't provide these directly
          volume: Math.floor(Math.random() * 1000) + 500,
          difficulty: Math.floor(Math.random() * 70) + 20,
        });
      });
      
      // Process related questions 
      relatedQuestions.forEach((item: any, index: number) => {
        primaryKeywords.push({
          id: `kq-${index + 1}`,
          text: item.question,
          volume: Math.floor(Math.random() * 800) + 300,
          difficulty: Math.floor(Math.random() * 60) + 30,
        });
      });
      
      // Add the main keyword
      primaryKeywords.unshift({
        id: 'k-main',
        text: topic,
        volume: Math.floor(Math.random() * 2000) + 1000,
        difficulty: Math.floor(Math.random() * 50) + 40,
      });
      
      return primaryKeywords;
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
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert SEO content specialist and copywriter. You create highly engaging, SEO-optimized article titles that drive clicks and conversions. Generate titles that are catchy, include the primary keyword naturally, and have high click-through potential."
            },
            {
              role: "user",
              content: `Generate 5 highly engaging, SEO-optimized titles for an article about "${topic}" targeting the primary keyword "${primaryKeyword}". Each title should be catchy, include the primary keyword naturally, be between 50-60 characters, and be designed to maximize CTR. Format the output as a JSON array with objects containing 'text' and 'score' properties, where score is your estimate of how effective the title will be on a scale of 0-100.`
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

      // Parse the generated titles from the response
      const content = response.data.choices[0].message.content;
      let titles: ArticleTitle[] = [];
      
      try {
        const parsedContent = JSON.parse(content);
        titles = parsedContent.map((item: any, index: number) => ({
          id: `title-${index + 1}`,
          text: item.text,
          score: item.score
        }));
      } catch (parseError) {
        // If JSON parsing fails, try to extract titles manually
        const titleMatches = content.match(/(?:"text": "|title: ")([^"]+)(?:")/g) || [];
        const scoreMatches = content.match(/(?:"score": |score: )(\d+)/g) || [];
        
        titles = titleMatches.slice(0, 5).map((title, index) => {
          const text = title.replace(/(?:"text": "|title: ")/g, "").replace(/"$/g, "");
          const scoreText = scoreMatches[index] ? scoreMatches[index].replace(/(?:"score": |score: )/g, "") : "80";
          const score = parseInt(scoreText, 10);
          
          return {
            id: `title-${index + 1}`,
            text,
            score
          };
        });
      }
      
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
  fetchSecondaryKeywords: async (primaryKeyword: string): Promise<Keyword[]> => {
    try {
      // Using SerpAPI for keywords
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: primaryKeyword,
          engine: 'google',
          api_key: SERP_API_KEY
        }
      });
      
      // Extract related searches from the response
      const relatedSearches = response.data.related_searches || [];
      const relatedQuestions = response.data.related_questions || [];
      
      const secondaryKeywords: Keyword[] = [];
      
      // Process related searches
      relatedSearches.forEach((item: any, index: number) => {
        secondaryKeywords.push({
          id: `sks-${index + 1}`,
          text: item.query,
          volume: Math.floor(Math.random() * 800) + 200,
          difficulty: Math.floor(Math.random() * 60) + 20,
        });
      });
      
      // Process related questions
      relatedQuestions.forEach((item: any, index: number) => {
        secondaryKeywords.push({
          id: `skq-${index + 1}`,
          text: item.question,
          volume: Math.floor(Math.random() * 600) + 100,
          difficulty: Math.floor(Math.random() * 50) + 30,
        });
      });
      
      return secondaryKeywords;
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
              1. Main headings (H2s)
              2. Subheadings (H3s) under each main heading where appropriate
              3. Structure that follows logical progression
              4. Natural inclusion of primary and secondary keywords
              
              Format the response as a JSON array of objects with 'heading' and 'subheadings' properties, where subheadings is an array of strings. Include 7-10 main headings including an introduction and conclusion.`
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
      
      const content = response.data.choices[0].message.content;
      let outline: OutlineHeading[] = [];
      
      try {
        outline = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing outline JSON:', parseError);
        
        // Fallback parsing logic if JSON structure is incorrect
        const headingMatches = content.match(/(?:"heading"|heading): "([^"]+)"/g) || [];
        const subheadingsMatches = content.match(/(?:"subheadings"|subheadings): \[(.*?)\]/gs) || [];
        
        outline = headingMatches.map((heading, index) => {
          const headingText = heading.replace(/(?:"heading"|heading): "/g, "").replace(/"$/g, "");
          
          let subheadings: string[] = [];
          if (subheadingsMatches[index]) {
            const subheadingsText = subheadingsMatches[index].replace(/(?:"subheadings"|subheadings): \[/g, "").replace(/\]$/g, "");
            subheadings = subheadingsText.split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
          }
          
          return {
            heading: headingText,
            subheadings
          };
        });
      }
      
      return outline;
    } catch (error) {
      console.error('Error generating outline:', error);
      
      // Return basic outline if API fails
      return [
        { heading: "Introduction", subheadings: [] },
        { heading: `What is ${primaryKeyword}?`, subheadings: ["Definition", "Key Features"] },
        { heading: `Benefits of ${primaryKeyword}`, subheadings: ["Main Advantages", "Use Cases"] },
        { heading: `How to Use ${primaryKeyword}`, subheadings: ["Step-by-Step Guide", "Best Practices"] },
        { heading: `${topic} Examples`, subheadings: ["Case Study 1", "Case Study 2"] },
        { heading: "Common Challenges and Solutions", subheadings: ["Challenge 1", "Challenge 2"] },
        { heading: "Conclusion", subheadings: [] }
      ];
    }
  },

  // Generate complete article
  generateArticle: async (
    topic: string,
    outline: OutlineHeading[],
    primaryKeyword: string,
    secondaryKeywords: string[],
    writingStyle: string,
    pointOfView: string,
    articleLength: string,
    expertGuidance?: string
  ): Promise<string> => {
    try {
      // Determine word count based on articleLength
      let targetWordCount = "1500";
      if (articleLength === "sm") targetWordCount = "800";
      if (articleLength === "md") targetWordCount = "1500";
      if (articleLength === "lg") targetWordCount = "3000";
      
      // Convert outline to formatted string for the prompt
      const outlineText = outline.map(section => {
        let sectionText = `## ${section.heading}`;
        if (section.subheadings.length > 0) {
          sectionText += '\n' + section.subheadings.map(sub => `### ${sub}`).join('\n');
        }
        return sectionText;
      }).join('\n\n');
      
      // Create detailed prompt for article generation
      const prompt = `Write a comprehensive ${writingStyle} article about "${topic}" using ${pointOfView} point of view, with approximately ${targetWordCount} words.

Primary keyword: "${primaryKeyword}"
Secondary keywords: ${secondaryKeywords.join(", ")}

Follow this outline:
${outlineText}

${expertGuidance ? `Expert guidance to incorporate: ${expertGuidance}` : ''}

Requirements:
1. Write in a ${writingStyle} style that engages readers
2. Naturally incorporate the primary keyword (${primaryKeyword}) at a 1-2% density
3. Include secondary keywords naturally throughout the article
4. Use ${pointOfView} point of view consistently
5. Include a compelling introduction that hooks the reader
6. Provide valuable insights and actionable advice
7. End with a strong conclusion that includes a clear next step or call-to-action
8. Format using Markdown with proper headings, subheadings, bullet points, and emphasis where appropriate`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert content writer who specializes in creating high-quality, SEO-optimized articles that provide exceptional value to readers while maintaining natural readability."
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
      // Craft specific prompts based on enhancement type
      let prompt = "";
      
      switch (enhancementType) {
        case "faq":
          prompt = `Based on this article about "${primaryKeyword}", create a comprehensive FAQ section with 5-7 questions and detailed answers that address common queries readers might have. Format in Markdown with each question as a subheading. The article content is:\n\n${article.substring(0, 4000)}...`;
          break;
          
        case "summary":
          prompt = `Create a concise TL;DR summary (around 150 words) of the key points in this article about "${primaryKeyword}". The summary should capture the most important information while being engaging enough to encourage reading the full article. The article content is:\n\n${article.substring(0, 4000)}...`;
          break;
          
        case "callToAction":
          prompt = `Create a compelling call-to-action section for this article about "${primaryKeyword}". The CTA should motivate readers to take a specific next step related to the topic, whether it's implementing advice, exploring related resources, or contacting for more information. Make it persuasive and specific. The article content is:\n\n${article.substring(0, 4000)}...`;
          break;
          
        case "keyTakeaways":
          prompt = `Create a "Key Takeaways" section for this article about "${primaryKeyword}" with 5-7 bullet points that summarize the most important insights and actionable advice from the article. Format in Markdown with a clear heading and well-structured bullet points. The article content is:\n\n${article.substring(0, 4000)}...`;
          break;
          
        case "expertQuote":
          prompt = `Create a fictional expert quote that could be included in this article about "${primaryKeyword}". The quote should add authority, provide unique insight, and sound authentic. Include the expert's fictional name and relevant credentials. The article content for context is:\n\n${article.substring(0, 4000)}...`;
          break;
          
        default:
          prompt = `Create additional content enhancement for this article about "${primaryKeyword}" focused on ${enhancementType}. Format in Markdown and ensure it adds significant value to the reader. The article content is:\n\n${article.substring(0, 4000)}...`;
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert content strategist who specializes in creating highly valuable content enhancements that improve article quality and SEO performance."
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
      console.error(`Error generating ${enhancementType} enhancement:`, error);
      return `An error occurred while generating the ${enhancementType} enhancement.`;
    }
  },
  
  // Generate article image suggestions using DALL-E
  generateImageSuggestion: async (
    primaryKeyword: string,
    articleTitle: string
  ): Promise<string> => {
    try {
      // First, get image description from GPT
      const promptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert at creating effective image prompts for DALL-E that will generate high-quality, relevant images for blog articles."
            },
            {
              role: "user",
              content: `Create a detailed prompt for DALL-E to generate a featured image for an article titled "${articleTitle}" about "${primaryKeyword}". The image should be professional, relevant to the topic, and visually appealing. Do not include text in the image. The prompt should be specific enough to generate a high-quality, relevant image without being too restrictive. Only return the prompt text, nothing else.`
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
      
      const imagePrompt = promptResponse.data.choices[0].message.content.trim();
      
      // Then, generate the image with DALL-E
      const imageResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      // Return the image URL
      return imageResponse.data.data[0].url;
    } catch (error) {
      console.error('Error generating image suggestion:', error);
      return ""; // Return empty string if image generation fails
    }
  }
};
