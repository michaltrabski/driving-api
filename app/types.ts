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
  whatWeWantToAskFor: string;
  relationToSafety: string;
  questionSource: string;
}

export interface NormalizedQuestionE6 extends NormalizedQuestion {
  questionSource: string;
  relationToSafety: string;
}

export interface QuestionBig {
  slug: string;
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
  whatWeWantToAskFor: string;
  explanationTesty360: string;
  explanationGpt3: {
    shortExplanation: string;
    longExplanation: string;
    textSeo: string;
  };
  deprecated_expl: any;
  deprecated_lowNameOld: any;
  deprecated_lowName: any;
  deprecated_lowNames: any;
  deprecated_low: any;
}

export interface QuestionSmall {
  slug: string;
  isActive: boolean;

  id: string;
  text: string;
  a: string;
  b: string;
  c: string;
  r: string;
  media: string;
  categories: string[];
  score: number;
}
