export interface NormalizedQuestion {
  id: string;
  text: string;
  textEn: string;
  textDe: string;
  a: string;
  b: string;
  c: string;
  r: string;
  media: string;
  categories: string[];
}

export interface NormalizedQuestionE4 extends NormalizedQuestion {
  score: number;
}

export interface NormalizedQuestionE5 extends NormalizedQuestion {
  score: number;
}

export interface NormalizedQuestionE6 extends NormalizedQuestion {
  questionSource: string;
  relationToSafety: string;
}

export interface QuestionBig {
  isActive: boolean;
  id: string;
  text: string;
  textEn: string;
  textDe: string;
  a: string;
  b: string;
  c: string;
  r: string;
  media: string;
  categories: string[];
  score: number;
  questionSource: string;
  relationToSafety: string;
  explanationTesty360: string;
  explanationGpt3?: string;
}
