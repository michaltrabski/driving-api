export enum MODE {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  PREBUILD = "prebuild",
}

export interface AllQuestionsData {
  allQuestions: Question[];
  allCategories: Category[];
  allPostsFromOldWordpress: PostFromOldWordpress[];
}

export interface AllQuestionsDataSlim {
  allQuestionsSlim: QuestionSlim[];
}

export interface Question {
  id: string;
  text: string;
  slug: string;
  media: string;
  a: string;
  b: string;
  c: string;
  r: string;
  categories: string[];
  score: number;
  topic_id?: string;
  expl?: any[];
  author?: string;
  low_name_old?: string;
  low_name?: string;
  low?: any[];
  low_names?: any[];
}

export interface QuestionSlim {
  id: string;
  t: string;
  m: string;
  a?: string;
  b?: string;
  c?: string;
  right: CorrectAnswer;
  cats: Category[];
  s: number;
}

export interface QuestionData extends Question {
  nr: number;
  category: Category;
  slug: string;
  prev_question_slug: string;
  next_question_slug: string;

  next_10_question_slug: string;
  nr_10: number;
  next_20_question_slug: string;
  nr_20: number;
  // repeat 10 times
  next_30_question_slug: string;
  nr_30: number;
  next_40_question_slug: string;
  nr_40: number;
  next_50_question_slug: string;
  nr_50: number;
  next_60_question_slug: string;
  nr_60: number;
  next_70_question_slug: string;
  nr_70: number;
  next_80_question_slug: string;
  nr_80: number;
  next_90_question_slug: string;
  nr_90: number;
  next_100_question_slug: string;
  nr_100: number;

  explanation: string;

  question_data_keys: string[];
}

export interface PostFromOldWordpress {
  slug: string;
  date: string;
  title: string;
  html: string;
}

export type Vote = "good" | "average" | "bad";

export enum FIREBASE_ITEM_KEY {
  SEEN = "seen",

  VOTE_GOOD = "vote_good",
  VOTE_AVERAGE = "vote_average",
  VOTE_BAD = "vote_bad",

  MISTAKE = "mistake",

  KNOWN = "known",
  UNKNOWN = "unknown",

  REPETITION = "repetition",
}

export interface FirebaseItem {
  [FIREBASE_ITEM_KEY.SEEN]?: boolean;

  [FIREBASE_ITEM_KEY.VOTE_GOOD]?: boolean;
  [FIREBASE_ITEM_KEY.VOTE_AVERAGE]?: boolean;
  [FIREBASE_ITEM_KEY.VOTE_BAD]?: boolean;

  [FIREBASE_ITEM_KEY.MISTAKE]?: boolean;

  [FIREBASE_ITEM_KEY.KNOWN]?: boolean;
  [FIREBASE_ITEM_KEY.UNKNOWN]?: boolean;

  [FIREBASE_ITEM_KEY.REPETITION]?: boolean;
}

export enum KEY {
  UID = "uid",
  USERS_ANSWERS = "user_answers",
  USERS_ANSWERS_SENT_TO_FIREBASE = "user_answers_sent_to_firebase",
  IS_USER_LOGGED_IN = "is_user_logged_in_once",
  DATA_FROM_FB_DOWNLOADED = "data_from_firebase_downladed_once",
  QUESTIONS = "questions",
  QUESTIONS_DOWNLOADED = "questions_downloaded",
  CURRENT_CATEGORY = "current_category",
}

export interface SimpleObject {
  [key: string]: any;
}

export interface SimpleNotNestedObject {
  [key: string]: string | number | boolean | Array<string | number>;
}

export interface Data {
  pageType: PageType;
  pageData: SimpleNotNestedObject;
  userAnswers: UserAnswers;
  firebaseUser: FirebaseUser;
  // questions: SimpleObject| null;
  currentCategory: Category;
  current_category: Category;
  update: (key: string, value: FirebaseItem) => void;
}

export enum FIREBASE_DOCUMENT {
  USERS = "users",
}

export interface FirebaseUser {
  // isUserLoggedIn: boolean;
  uid: string;
  // email: string;
  // [key: string]: any;
}

export type Category = "a" | "a1" | "a2" | "am" | "b" | "b1" | "c" | "c1" | "d" | "d1" | "pt" | "t";

export type CorrectAnswer = "a" | "b" | "c" | "t" | "n";

export type Lang = "pl" | "en" | "de";

export enum PageType {
  Home = "home",
  Question = "question",
  Login = "login",
  Register = "register",
  UserAccount = "useraccount",
  Pricing = "pricing",
  Categories = "categories",
}

export interface TechnicalPageData {
  allCategories: Category[];
  all_questions_count: number;
  b_first_question_url: string;
}

export interface PageData {
  all_categories: Category[];
  all_questions_count: number;
  a_first_question_url: string;
  a1_first_question_url: string;
  a2_first_question_url: string;
  am_first_question_url: string;
  b_first_question_url: string;
  b1_first_question_url: string;
  c_first_question_url: string;
  c1_first_question_url: string;
  d_first_question_url: string;
  d1_first_question_url: string;
  pt_first_question_url: string;
  t_first_question_url: string;

  a_questions_count: number;
  a1_questions_count: number;
  a2_questions_count: number;
  am_questions_count: number;
  b_questions_count: number;
  b1_questions_count: number;
  c_questions_count: number;
  c1_questions_count: number;
  d_questions_count: number;
  d1_questions_count: number;
  pt_questions_count: number;
  t_questions_count: number;

  post_1_title: string;
  post_1_slug: string;

  post_2_title: string;
  post_2_slug: string;

  post_3_title: string;
  post_3_slug: string;

  post_4_title: string;
  post_4_slug: string;
  post_5_title: string;
  post_5_slug: string;
  post_6_title: string;
  post_6_slug: string;
  post_7_title: string;
  post_7_slug: string;
  post_8_title: string;
  post_8_slug: string;
  post_9_title: string;
  post_9_slug: string;
  post_10_title: string;
  post_10_slug: string;

  question_title_100: string;
  question_title_200: string;
  question_title_300: string;
  question_title_400: string;
  question_title_500: string;
  question_title_600: string;
  question_title_700: string;
  question_title_800: string;
  question_title_900: string;
  question_title_1000: string;
  question_title_1100: string;
  question_title_1200: string;
  question_title_1300: string;
  question_title_1400: string;
  question_title_1500: string;

  question_slug_100: string;
  question_slug_200: string;
  question_slug_300: string;
  question_slug_400: string;
  question_slug_500: string;
  question_slug_600: string;
  question_slug_700: string;
  question_slug_800: string;
  question_slug_900: string;
  question_slug_1000: string;
  question_slug_1100: string;
  question_slug_1200: string;
  question_slug_1300: string;
  question_slug_1400: string;
  question_slug_1500: string;

  question_nr_100: number;
  question_nr_200: number;
  question_nr_300: number;
  question_nr_400: number;
  question_nr_500: number;
  question_nr_600: number;
  question_nr_700: number;
  question_nr_800: number;
  question_nr_900: number;
  question_nr_1000: number;
  question_nr_1100: number;
  question_nr_1200: number;
  question_nr_1300: number;
  question_nr_1400: number;
  question_nr_1500: number;

  page_data_keys: string[];
}

export const PAGE = {
  HOME: {
    TYPE: "home",
    TEMPLATE: "index.html",
    URL: "index.html",
  },
  QUESTION: {
    TYPE: "question",
    TEMPLATE: "question.html",
    URL: "question.html",
  },
  USER_ANSWERS_GOOD: {
    TYPE: "useranswersgood",
    TEMPLATE: "useranswersgood.html",
    URL: "twoje-dobre-odpowiedzi.html",
  },
} as const;

export enum PAGE_TYPE {
  HOME = "home",
  QUESTION = "question",
  LOGIN = "login",
  REGISTER = "register",
  USER_ACCOUNT = "useraccount",
  PRICING = "pricing",
  CATEGORY = "categories",
  INFO = "info",
  VOTE = "vote",
  NOTFOUND404 = "notfound404",
  MAP = "map",
  POST = "post",
  GOOD_ANSWERS = "goodanswers",
  BAD_ANSWERS = "badanswers",
}

export enum TEMPLATE_FILE_NAME {
  HOME = "index.html",
  QUESTION = "question.html",
  LOGIN = "login.html",
  REGISTER = "register.html",
  USER_ACCOUNT = "useraccount.html",
  PRICING = "pricing.html",
  CATEGORY = "category.html",
  INFO = "info.html",
  VOTE = "vote.html",
  NOTFOUND404 = "404.html",
  MAP = "map.html",
  POST = "post.html",
  BLOG = "blog.html",
  GOOD_ANSWERS = "goodanswers.html",
  BAD_ANSWERS = "badanswers.html",
  CONTACT = "contact.html",
  TERMS = "terms.html",
  PRIVACY = "privacy.html",
}

export enum PAGE_URL {
  HOME = "index.html",
  LOGIN = "logowanie.html",
  REGISTER = "rejestracja.html",
  USER_ACCOUNT = "twoje-konto.html",
  PRICING = "cennik.html",
  CATEGORY = "kategorie-prawa-jazdy.html",
  INFO = "informacje.html",
  VOTE_GOOD = "dobrze-znasz.html",
  NOTFOUND404 = "404.html",
  MAP = "mapa-strony.html",
  POST = "artykuly.html",
  BLOG = "blog.html",
  GOOD_ANSWERS = "pytania-testowe-dobra-odpowiedz.html",
  BAD_ANSWERS = "pytania-testowe-zla-odpowiedz.html",
  CONTACT = "kontakt.html",
  TERMS = "regulamin.html",
  PRIVACY = "polityka-prywatnosci.html",
}

export interface TechnicalPage {
  pageType: PAGE_TYPE;
  templateName: TEMPLATE_FILE_NAME;
  slug: PAGE_URL;
  pageData: PageData;
}

// export interface QuestionPageData extends Question {
//   lang: string;
//   current_category: string;
//   slug: string;
//   prev_question_slug: string;
//   next_question_slug: string;
// }

export interface UserAnswers {
  [key: string]: any;
}
