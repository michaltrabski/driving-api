const fs = require("fs-extra");
const _ = require("lodash");

import { convertExcelToJson } from "./excelToJson";
import { AllQuestionsData, Category, Exam, Explanation, PostFromOldWordpress, Question } from "./types";
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

export const createQuestionsData = (excels: ExcelFileInfo[]): AllQuestionsData => {
  const newestExcel = excels.find((excel) => excel.isNewest) || excels[0];

  const allQuestionsData = getQuestionsFromExcel(newestExcel);

  return allQuestionsData;
};

export const getQuestionsFromExcel = (excel: ExcelFileInfo): AllQuestionsData => {
  const excelFile = convertExcelToJson(excel.excelSource);

  // TASK 1
  const excelQuestions = excelFile[EXCEL_SHEET_NAME] as QuestionFromExcel[];
  // console.log("CONVERT EXCEL QUESTIONS TO JSON", "excelQuestions ===", excelQuestions[0]);

  // TASK 2
  const missingFields: string[] = [];
  requiredFields.forEach((field) => {
    if (!Object.keys(excelQuestions[0]).includes(field)) missingFields.push(field);
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing fields === ${missingFields.join(", ")}`);
  }

  const allCategoriesSet = new Set<string>();

  // TASK 3 - create allExplanations
  const masterQuestions = fs.readJsonSync("sourceData/masterQuestions.json");
  const allExplanations = masterQuestions.allQuestions.map((q: any) => {
    const newExplanation: Explanation = {
      id: q.id,
      expl: q.expl,
      topicId: q.topicId,
      author: q.author,
      lowNameOld: q.lowNameOld,
      lowName: q.lowName,
      low: q.low,
      lowNames: q.lowNames,
    };

    return newExplanation;
  });

  // TASK 4
  const slughLenghtSet = new Set<number>();

  const allQuestions = excelQuestions.map((excelQuestion) => {
    const categories: Category[] = excelQuestion[KATEGORIE].toLowerCase().split(",") as Category[];
    categories.forEach((cat) => allCategoriesSet.add(cat));

    const text = excelQuestion[PYTANIE];
    const id = `id${excelQuestion[NUMER_PYTANIA]}`;
    const m = convertMediaNameToPngOrMp4(excelQuestion[MEDIA]) || "";

    slughLenghtSet.add(textToSlug(text, id).length);

    const newQuestion: Question = {
      id,
      text,
      slug: textToSlug(text, id),
      media: m,
      a: excelQuestion[ODPOWIEDZ_A],
      b: excelQuestion[ODPOWIEDZ_B],
      c: excelQuestion[ODPOWIEDZ_C],
      r: excelQuestion[POPRAWNA_ODP].toLowerCase(),
      categories: categories,
      score: +excelQuestion[SCORE],
    };
    return newQuestion;
  });

  console.log("slug to generate page can not be more that aprox 180 characters");
  console.log("slughLenghtSet ===", [...slughLenghtSet].sort((a, b) => a - b).reverse());

  // TASK 5
  const postsFromOldWordpress: PostFromOldWordpress[] = fs.readJsonSync(
    "sourceData/postsFromOldWordpress.json"
  ).postsFromOldWordpress;

  // TASK 6 order posts
  const orderedPostsFromOldWordpress = [..._.sortBy(postsFromOldWordpress, ["date"])].reverse();

  const examExample: Exam = {
    examName: "",
    examSlug: "",
    examCategory: "b",
    examQuestions32: allQuestions.slice(0, 32),
  };

  const howManyExamsToCreate = 35;
  const arrayToCreateExamsFrom = Array.from(Array(howManyExamsToCreate).keys()).map((i) => i + 1);
  const allExams: Exam[] = arrayToCreateExamsFrom.map((i) => {
    const allQuestionsShuffled = allQuestions.sort(() => Math.random() - 0.5);

    return {
      ...examExample,
      examName: `Egzamin nr ${i}`,
      examSlug: `egzamin-nr-${i}`,
      examCategory: "b",
      examQuestions32: allQuestionsShuffled.slice(0, 32),
    };
  });

  const allQuestionsShuffled = allQuestions.sort(() => Math.random() - 0.5);

  const allQuestionsData: AllQuestionsData = {
    allQuestions: allQuestionsShuffled,
    allCategories: _.sortBy([...allCategoriesSet] as Category[]),
    allPostsFromOldWordpress: orderedPostsFromOldWordpress,
    allExplanations,
    allExams,
  };

  return allQuestionsData;
};
