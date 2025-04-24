export type ArticleType = {
  id: string;
  name: string;
  icon?: string;
};

export type ArticleLength = {
  id: string;
  name: string;
  wordCount: string;
  recommended?: boolean;
};

export type PointOfView = {
  id: string;
  name: string;
};

export type ResearchMethod = {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  recommended?: boolean;
};

export type Step = {
  id: number;
  name: string;
};

export type Language = {
  id: string;
  name: string;
  flag: string;
};

export type Country = {
  id: string;
  name: string;
  flag: string;
};

export type EnhancementOption = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type OutlineTemplate = {
  id: string;
  name: string;
  outline: OutlineHeading[];
};

export type OutlineHeading = {
  heading: string;
  subheadings: string[];
};

export type WritingStyle = {
  id: string;
  name: string;
  description: string;
};

export type Reference = {
  id: string;
  title: string;
  url: string;
  source: string;
};

export type Keyword = {
  id: string;
  text: string;
  volume?: number;
  difficulty?: number;
};

export type ArticleTitle = {
  id: string;
  text: string;
  score?: number;
};

export type ArticleState = {
  step: number;
  topic: string;
  articleType: string;
  references: Reference[];
  primaryKeyword: Keyword | null;
  title: ArticleTitle | null;
  secondaryKeywords: Keyword[];
  articleLength: string;
  writingStyle: string;
  pointOfView: string;
  expertGuidance: string;
  outline: OutlineHeading[];
  enhancements: string[];
  enhancementContent: Record<string, string>;
  targetCountry: string;
  language: string;
  generatedArticle: string;
  humanizedArticle: string;
};
