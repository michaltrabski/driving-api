const fs = require("fs-extra");
import _ from "lodash";
 

import { convertExcelToJson } from "./excelToJson";
import {
  AllQuestionsData,
  AllQuestionsDataSlim,
  Category,
  CorrectAnswer,
  PostFromOldWordpress,
  Question,
  QuestionSlim,
} from "./types";
import {
  imageNameToPngDEPREC2,
  isVideo,
  normalizeMediaNameDEPRECATED,
  randomizeMediaName,
  videoNameToMp4DEPRECATED2,
  videoNameToMp4DEPRECATED,
  getEnv,
  getLimit,
  mediaNameWithoutExtention,
} from "./utils";

const EXCEL_SHEET_NAME = "Treść pytania";

const NUMER_PYTANIA = "Numer pytania";
const PYTANIE = "Pytanie";
const MEDIA = "Media";
const ODPOWIEDZ_A = "Odpowiedź A";
const ODPOWIEDZ_B = "Odpowiedź B";
const ODPOWIEDZ_C = "Odpowiedź C";
const KATEGORIE = "Kategorie";
const POPRAWNA_ODP = "Poprawna odp";
const SCORE = "Liczba punktów";

interface QuestionFromExcel {
  [NUMER_PYTANIA]: string;
  [PYTANIE]: string;
  [MEDIA]: string;
  [ODPOWIEDZ_A]: string;
  [ODPOWIEDZ_B]: string;
  [ODPOWIEDZ_C]: string;
  [KATEGORIE]: string;
  [POPRAWNA_ODP]: string;
  [SCORE]: string;
}

export interface ExcelFileInfo {
  excelSource: string;
  isNewest: boolean;
}

const requiredFields = [
  NUMER_PYTANIA,
  PYTANIE,
  MEDIA,
  ODPOWIEDZ_A,
  ODPOWIEDZ_B,
  ODPOWIEDZ_C,
  POPRAWNA_ODP,
  KATEGORIE,
  SCORE,
];

export const createQuestionsData = (
  excels: ExcelFileInfo[]
): { allQuestionsData: AllQuestionsData; allQuestionsDataSlim: AllQuestionsDataSlim } => {
  const newestExcel = excels.find((excel) => excel.isNewest) || excels[0];

  const olderExcels = excels.filter((excel) => !excel.isNewest);
  // TODO : add old notactive questions to newestExcel just fot history and seo

  const { allQuestionsData, allQuestionsDataSlim } = getQuestionsFromExcel(newestExcel);

  const allQuestionsDataSliced = {
    allQuestions: allQuestionsData.allQuestions.slice(0, getLimit()),
    allCategories: allQuestionsData.allCategories.slice(0, getLimit()),
    postsFromOldWordpress: allQuestionsData.postsFromOldWordpress.slice(0, getLimit()),
  };
  const allQuestionsDataSlimSliced = {
    allQuestionsSlim: allQuestionsDataSlim.allQuestionsSlim.slice(0, getLimit()),
  };

  return { allQuestionsData: allQuestionsDataSliced, allQuestionsDataSlim: allQuestionsDataSlimSliced };
};

export const getQuestionsFromExcel = (
  excel: ExcelFileInfo
): { allQuestionsData: AllQuestionsData; allQuestionsDataSlim: AllQuestionsDataSlim } => {
  const excelFile = convertExcelToJson(excel.excelSource);
  const isNewest = excel.isNewest;

  // TASK 1
  const excelQuestions = excelFile[EXCEL_SHEET_NAME] as QuestionFromExcel[];
  // console.log("CONVERT EXCEL QUESTIONS TO JSON", "excelQuestions ===", excelQuestions[0]);

  // TASK 2
  const missingFields: string[] = [];
  requiredFields.forEach((field) => {
    if (!Object.keys(excelQuestions[0]).includes(field)) missingFields.push(field);
  });
  // console.log("CHECK IF QUESTIONS CONTAINS REQUIRED FIELDS", "requiredFields ===", requiredFields);
  // console.log("CHECK IF QUESTIONS CONTAINS MISSING FIELDS" ,"missingFields ===", missingFields);

  if (missingFields.length > 0) {
    throw new Error(`Missing fields === ${missingFields.join(", ")}`);
  }

  const allCategoriesSet = new Set<string>();

  // TASK 3
  const masterQuestions = fs.readJsonSync("sourceData/masterQuestions.json");

  // console.log(
  //   "masterQuestions.allQuestions.length ===",
  //   masterQuestions.allQuestions.length,
  //   masterQuestions.allQuestions[0]
  // );

 
 
  // TASK 4
  const allQuestions = excelQuestions.map((excelQuestion) => {
    const categories: Category[] = excelQuestion[KATEGORIE].toLowerCase().split(",") as Category[];
    categories.forEach((cat) => allCategoriesSet.add(cat));

    const id = `id${excelQuestion[NUMER_PYTANIA]}`;
    const m = excelQuestion[MEDIA] || "";

    const newQuestion: Question = {
      id,
      text: excelQuestion[PYTANIE],
      media: mediaNameWithoutExtention(m),
      is_video: isVideo(m),
      a: excelQuestion[ODPOWIEDZ_A],
      b: excelQuestion[ODPOWIEDZ_B],
      c: excelQuestion[ODPOWIEDZ_C],
      t: "tak",
      n: "nie",
      correct_answer: excelQuestion[POPRAWNA_ODP].toLowerCase() as CorrectAnswer,
      question_belongs_to_categories: categories,
      score: +excelQuestion[SCORE],
      is_active: isNewest,
      topic_id: masterQuestions.allQuestions.find((q: any) => q.id === id)?.topicId || "",
      expl: masterQuestions.allQuestions.find((q: any) => q.id === id)?.expl || [],
      author: masterQuestions.allQuestions.find((q: any) => q.id === id)?.author || "",
      low_name_old: masterQuestions.allQuestions.find((q: any) => q.id === id)?.lowNameOld || "",
      low_name: masterQuestions.allQuestions.find((q: any) => q.id === id)?.lowName || "",
      low: masterQuestions.allQuestions.find((q: any) => q.id === id)?.low || [],
      low_names: masterQuestions.allQuestions.find((q: any) => q.id === id)?.lowNames || [],
    };
    return newQuestion;
  });

  const allQuestionsSlim = allQuestions.map((q) => {
    const questionSlim: QuestionSlim = {
      id: q.id,
      t: q.text,
      m: `${q.media}${q.is_video ? ".mp4" : ".jpg"}`, 
      right: q.correct_answer,
      cats: q.question_belongs_to_categories,
      s: q.score,
    };

    if (q.a) {
      questionSlim.a = q.a;
      questionSlim.b = q.b;
      questionSlim.c = q.c;
    }

    return questionSlim;
  });

  // TASK 5
  const postsFromOldWordpress: PostFromOldWordpress[] = fs.readJsonSync(
    "sourceData/postsFromOldWordpress.json"
  ).postsFromOldWordpress;
  // console.log("CREATA POSTSFROMOLDWORDPRESS", "postsFromOldWordpress[0] ===", postsFromOldWordpress[0]);

  // TASK 6 order posts
  const orderedPostsFromOldWordpress = [..._.sortBy(postsFromOldWordpress, ["date"])].reverse();

  const allQuestionsData: AllQuestionsData = {
    allQuestions,
    allCategories: _.sortBy([...allCategoriesSet] as Category[]),
    postsFromOldWordpress: orderedPostsFromOldWordpress,
  };

  const allQuestionsDataSlim: AllQuestionsDataSlim = {
    allQuestionsSlim,
  };

  // console.log("ALL QUESTIONS DATA" );
  // console.log( "allQuestionsData.allQuestions[0] ===",allQuestionsData.allQuestions[0]);
  // console.log( "allQuestionsData.allQuestions.length ===",allQuestionsData.allQuestions.length);

  console.log(
    `ALL QUESTIONS DATA CREATED`,
    `---allQuestionsData.allQuestions.length===${allQuestionsData.allQuestions.length}`
  );

  return { allQuestionsData, allQuestionsDataSlim };
};
