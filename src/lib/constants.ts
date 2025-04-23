
import { Step, ArticleType, ArticleLength, WritingStyle, PointOfView, ResearchMethod } from "./types";

export const STEPS: Step[] = [
  { id: 1, name: "Topic" },
  { id: 2, name: "Article Type" },
  { id: 3, name: "References" },
  { id: 4, name: "Primary Keyword" },
  { id: 5, name: "Title" },
  { id: 6, name: "Secondary Keywords" },
  { id: 7, name: "Configuration" },
  { id: 8, name: "Article Outline" },
  { id: 9, name: "Enhancements" },
  { id: 10, name: "Generation" },
];

export const ARTICLE_TYPES: ArticleType[] = [
  { id: "blog", name: "Blog Post", icon: "file-text" },
  { id: "product", name: "Product Description", icon: "box" },
  { id: "guide", name: "How-To Guide", icon: "book-open" },
  { id: "white-paper", name: "White Paper", icon: "clipboard" },
  { id: "packaging", name: "Packaging Solution", icon: "package" },
  { id: "case-study", name: "Case Study", icon: "file-text" },
];

export const ARTICLE_LENGTHS: ArticleLength[] = [
  { id: "sm", name: "Short", wordCount: "500-1000 words" },
  { id: "md", name: "Medium", wordCount: "1000-2500 words", recommended: true },
  { id: "lg", name: "Long", wordCount: "2500-5000 words" },
];

export const WRITING_STYLES: WritingStyle[] = [
  { id: "informative", name: "Informative", description: "Clear, factual, and educational" },
  { id: "persuasive", name: "Persuasive", description: "Convincing and compelling" },
  { id: "conversational", name: "Conversational", description: "Friendly and casual" },
  { id: "professional", name: "Professional", description: "Formal and authoritative" },
  { id: "technical", name: "Technical", description: "Detailed and specialized" },
];

export const POINTS_OF_VIEW: PointOfView[] = [
  { id: "first", name: "First Person (I, We)" },
  { id: "second", name: "Second Person (You)" },
  { id: "third", name: "Third Person (They, It)" },
];

export const RESEARCH_METHODS: ResearchMethod[] = [
  {
    id: "web-search",
    name: "Web Search",
    description: "Gather information from the internet",
    benefits: ["Fast", "Wide coverage"],
  },
  {
    id: "competitor-analysis",
    name: "Competitor Analysis",
    description: "Analyze competing articles on the same topic",
    benefits: ["Identify gaps", "SEO advantage"],
    recommended: true,
  },
  {
    id: "expert-interview",
    name: "Expert Input",
    description: "Include insights from subject-matter experts",
    benefits: ["Credibility", "Unique insights"],
  },
];
