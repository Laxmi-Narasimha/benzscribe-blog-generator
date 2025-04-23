
export const ARTICLE_TYPES = [
  { id: 'blog', name: 'Blog Posts', icon: 'pencil' },
  { id: 'news', name: 'News Articles', icon: 'newspaper' },
  { id: 'howto', name: 'How-To Guides', icon: 'book-open' },
  { id: 'listicle', name: 'Listicles', icon: 'list' },
  { id: 'comparison', name: 'Comparison Blogs', icon: 'git-compare' },
  { id: 'technical', name: 'Technical Articles', icon: 'code' },
  { id: 'product', name: 'Product Reviews', icon: 'package' },
  { id: 'case-study', name: 'Case Studies', icon: 'file-text' },
  { id: 'whitepaper', name: 'Whitepapers', icon: 'file' },
];

export const ARTICLE_LENGTHS = [
  { id: 'xs', name: '4-5 headings (500-1000 words)', wordCount: '500-1000', recommended: true },
  { id: 'sm', name: '5-6 headings (1000-2000 words)', wordCount: '1000-2000' },
  { id: 'md', name: '7-8 headings (2000-3000 words)', wordCount: '2000-3000' },
  { id: 'lg', name: '8-9 headings (3000-4000 words)', wordCount: '3000-4000' },
  { id: 'xl', name: '9-10 headings (4000-5000 words)', wordCount: '4000-5000' },
];

export const WRITING_POINTS_OF_VIEW = [
  { id: 'first', name: 'First Person (I, me, mine, we, us, our)' },
  { id: 'second', name: 'Second Person (you, your)' },
  { id: 'third', name: 'Third Person (he, she, they, it)' },
];

export const RESEARCH_METHODS = [
  { id: 'ai', name: 'AI Web Research', description: 'Analyzes hundreds of relevant articles', benefits: ['Includes Competitor Analysis', 'Provides up-to-date information', 'Best for new or broad topics'], recommended: true },
  { id: 'custom', name: 'Custom Sources', description: 'Upload your own files or links', benefits: ['Use your existing content', 'Ensure brand consistency', 'Best for specific or proprietary info'] },
];

export const STEPS = [
  { id: 1, name: 'Enter a Topic' },
  { id: 2, name: 'Select Article Type' },
  { id: 3, name: 'Select References' },
  { id: 4, name: 'Select Primary Keyword' },
  { id: 5, name: 'Select a Title' },
  { id: 6, name: 'Select Secondary Keywords' },
  { id: 7, name: 'Configurations' },
  { id: 8, name: 'Select headings' },
  { id: 9, name: 'Additional Enhancements' },
  { id: 10, name: 'Generate Article' },
];

export const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { id: 'ru', name: 'Russian', flag: '🇷🇺' },
  { id: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { id: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { id: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

export const COUNTRIES = [
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦' },
  { id: 'au', name: 'Australia', flag: '🇦🇺' },
  { id: 'in', name: 'India', flag: '🇮🇳' },
  { id: 'de', name: 'Germany', flag: '🇩🇪' },
  { id: 'fr', name: 'France', flag: '🇫🇷' },
  { id: 'es', name: 'Spain', flag: '🇪🇸' },
  { id: 'it', name: 'Italy', flag: '🇮🇹' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵' },
];

export const ENHANCEMENT_OPTIONS = [
  { id: 'humanize', name: 'Generate Humanized Article', description: 'Generate a humanized version of your article while maintaining authenticity.', icon: 'user' },
  { id: 'quotes', name: 'Include Expert Quotes', description: 'Incorporate quotes by famous people to add credibility and depth to your article.', icon: 'quote' },
  { id: 'images', name: 'Include Images in Article', description: 'Select copyright options and image count. Copyright images often provide better relevancy.', icon: 'image' },
  { id: 'internal-linking', name: 'Internal Linking', description: 'Boost SEO with automatic relevant links.', icon: 'link' },
  { id: 'external-links', name: 'External Links', description: 'Links to pages on external websites, offering additional resources or references to support your content.', icon: 'external-link' },
  { id: 'cover-image', name: 'Generate a cover image', description: 'Get an AI generated image for your article.', icon: 'image' },
  { id: 'cta', name: 'Include a Call-to-action', description: 'Encourage your users to take an action.', icon: 'mouse-pointer' },
  { id: 'faqs', name: 'Generate FAQs', description: 'Address common queries at the end.', icon: 'help-circle' },
];

export const SAMPLE_PACKAGING_TOPICS = [
  'Sustainable Packaging Solutions for E-commerce',
  'How to Choose the Right Packaging for Fragile Items',
  'The Future of Smart Packaging: Trends and Innovations',
  'Cost-Effective Packaging Strategies for Small Businesses',
  'Biodegradable Packaging Materials: A Comprehensive Guide',
  'Custom Packaging Solutions for Brand Identity',
  'Protective Packaging for Electronics and Sensitive Equipment',
  'Food-Grade Packaging: Safety Standards and Regulations',
  'VCI Packaging: Protecting Metal Products from Corrosion',
  'Eco-Friendly Alternatives to Traditional Plastic Packaging',
];

export const OUTLINE_TEMPLATES = [
  {
    id: 'product-guide',
    name: 'Product Guide',
    outline: [
      { heading: 'Introduction', subheadings: [] },
      { heading: 'What is [Product]?', subheadings: ['Key Features', 'Benefits'] },
      { heading: 'Types of [Product]', subheadings: ['Type 1', 'Type 2', 'Type 3'] },
      { heading: 'How to Choose the Right [Product]', subheadings: ['Factors to Consider', 'Common Mistakes to Avoid'] },
      { heading: 'Best Practices for Using [Product]', subheadings: [] },
      { heading: 'Case Studies', subheadings: [] },
      { heading: 'Conclusion', subheadings: [] },
    ]
  },
  {
    id: 'industry-trends',
    name: 'Industry Trends',
    outline: [
      { heading: 'Introduction', subheadings: [] },
      { heading: 'Current State of the [Industry]', subheadings: ['Market Size', 'Key Players'] },
      { heading: 'Emerging Trends in [Industry]', subheadings: ['Trend 1', 'Trend 2', 'Trend 3'] },
      { heading: 'Challenges and Opportunities', subheadings: [] },
      { heading: 'Future Outlook', subheadings: [] },
      { heading: 'How [Company] is Adapting', subheadings: [] },
      { heading: 'Conclusion', subheadings: [] },
    ]
  },
];

export const WRITING_STYLES = [
  { id: 'informative', name: 'Informative', description: 'Clear, factual, and educational' },
  { id: 'persuasive', name: 'Persuasive', description: 'Convincing and compelling' },
  { id: 'conversational', name: 'Conversational', description: 'Friendly and approachable' },
  { id: 'technical', name: 'Technical', description: 'Detailed and specialized' },
  { id: 'storytelling', name: 'Storytelling', description: 'Narrative-driven and engaging' },
  { id: 'authoritative', name: 'Authoritative', description: 'Expert and commanding' },
];
