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
import { convertMediaNameToPngOrMp4, textToSlug } from "./utils";
 

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
): { allQuestions: any; allCategories: any; allPostsFromOldWordpress: any } => {
  const newestExcel = excels.find((excel) => excel.isNewest) || excels[0];

  const { allQuestionsData } = getQuestionsFromExcel(newestExcel);

  return {
    allQuestions: allQuestionsData.allQuestions,
    allCategories: allQuestionsData.allCategories,
    allPostsFromOldWordpress: allQuestionsData.allPostsFromOldWordpress,
  };
};

export const getQuestionsFromExcel = (excel: ExcelFileInfo): { allQuestionsData: AllQuestionsData } => {
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

  // TASK 4
  const allQuestions = excelQuestions.map((excelQuestion) => {
    const categories: Category[] = excelQuestion[KATEGORIE].toLowerCase().split(",") as Category[];
    categories.forEach((cat) => allCategoriesSet.add(cat));

    const text = excelQuestion[PYTANIE]
    const id = `id${excelQuestion[NUMER_PYTANIA]}`;
    const m = convertMediaNameToPngOrMp4(excelQuestion[MEDIA]) || "";

    const newQuestion: Question = {
      id,
      text,
      slug:textToSlug(text, id),
      media: m,
      a: excelQuestion[ODPOWIEDZ_A],
      b: excelQuestion[ODPOWIEDZ_B],
      c: excelQuestion[ODPOWIEDZ_C],
      r: excelQuestion[POPRAWNA_ODP].toLowerCase(),
      categories: categories,
      score: +excelQuestion[SCORE],
      // topic_id: masterQuestions.allQuestions.find((q: any) => q.id === id)?.topicId || "",
      // expl: masterQuestions.allQuestions.find((q: any) => q.id === id)?.expl || [],
      // author: masterQuestions.allQuestions.find((q: any) => q.id === id)?.author || "",
      // low_name_old: masterQuestions.allQuestions.find((q: any) => q.id === id)?.lowNameOld || "",
      // low_name: masterQuestions.allQuestions.find((q: any) => q.id === id)?.lowName || "",
      // low: masterQuestions.allQuestions.find((q: any) => q.id === id)?.low || [],
      // low_names: masterQuestions.allQuestions.find((q: any) => q.id === id)?.lowNames || [],
    };
    return newQuestion;
  });

  // TASK 5
  const postsFromOldWordpress: PostFromOldWordpress[] = fs.readJsonSync(
    "sourceData/postsFromOldWordpress.json"
  ).postsFromOldWordpress;

  // TASK 6 order posts
  const orderedPostsFromOldWordpress = [..._.sortBy(postsFromOldWordpress, ["date"])].reverse();

  const allQuestionsData: AllQuestionsData = {
    allQuestions,
    allCategories: _.sortBy([...allCategoriesSet] as Category[]),
    allPostsFromOldWordpress: orderedPostsFromOldWordpress,
  };

 
  return { allQuestionsData };
};
