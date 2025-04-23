
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ArticleState, Reference, Keyword, ArticleTitle, OutlineHeading } from '@/lib/types';

type ArticleAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_TOPIC'; payload: string }
  | { type: 'SET_ARTICLE_TYPE'; payload: string }
  | { type: 'SET_REFERENCES'; payload: Reference[] }
  | { type: 'SET_PRIMARY_KEYWORD'; payload: Keyword | null }
  | { type: 'SET_TITLE'; payload: ArticleTitle | null }
  | { type: 'SET_SECONDARY_KEYWORDS'; payload: Keyword[] }
  | { type: 'SET_ARTICLE_LENGTH'; payload: string }
  | { type: 'SET_WRITING_STYLE'; payload: string }
  | { type: 'SET_POINT_OF_VIEW'; payload: string }
  | { type: 'SET_EXPERT_GUIDANCE'; payload: string }
  | { type: 'SET_OUTLINE'; payload: OutlineHeading[] }
  | { type: 'SET_ENHANCEMENTS'; payload: string[] }
  | { type: 'SET_TARGET_COUNTRY'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_GENERATED_ARTICLE'; payload: string }
  | { type: 'SET_HUMANIZED_ARTICLE'; payload: string }
  | { type: 'RESET' };

const initialState: ArticleState = {
  step: 1,
  topic: '',
  articleType: '',
  references: [],
  primaryKeyword: null,
  title: null,
  secondaryKeywords: [],
  articleLength: 'md',
  writingStyle: 'informative',
  pointOfView: 'third',
  expertGuidance: '',
  outline: [],
  enhancements: [],
  targetCountry: 'us',
  language: 'en',
  generatedArticle: '',
  humanizedArticle: '',
};

const articleReducer = (state: ArticleState, action: ArticleAction): ArticleState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_TOPIC':
      return { ...state, topic: action.payload };
    case 'SET_ARTICLE_TYPE':
      return { ...state, articleType: action.payload };
    case 'SET_REFERENCES':
      return { ...state, references: action.payload };
    case 'SET_PRIMARY_KEYWORD':
      return { ...state, primaryKeyword: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_SECONDARY_KEYWORDS':
      return { ...state, secondaryKeywords: action.payload };
    case 'SET_ARTICLE_LENGTH':
      return { ...state, articleLength: action.payload };
    case 'SET_WRITING_STYLE':
      return { ...state, writingStyle: action.payload };
    case 'SET_POINT_OF_VIEW':
      return { ...state, pointOfView: action.payload };
    case 'SET_EXPERT_GUIDANCE':
      return { ...state, expertGuidance: action.payload };
    case 'SET_OUTLINE':
      return { ...state, outline: action.payload };
    case 'SET_ENHANCEMENTS':
      return { ...state, enhancements: action.payload };
    case 'SET_TARGET_COUNTRY':
      return { ...state, targetCountry: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_GENERATED_ARTICLE':
      return { ...state, generatedArticle: action.payload };
    case 'SET_HUMANIZED_ARTICLE':
      return { ...state, humanizedArticle: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

type ArticleContextType = {
  state: ArticleState;
  dispatch: React.Dispatch<ArticleAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
};

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(articleReducer, initialState);

  const nextStep = () => {
    if (state.step < 10) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1 });
    }
  };

  const prevStep = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1 });
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 10) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  };

  return (
    <ArticleContext.Provider value={{ state, dispatch, nextStep, prevStep, goToStep }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticle = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticle must be used within an ArticleProvider');
  }
  return context;
};
