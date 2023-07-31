const fs = require("fs-extra");
const _ = require("lodash");

import { convertExcelToJson } from "./excelToJson";
import { getAllExams } from "./getAllExams";
import { getAllQuestionsAndCategories, QuestionFromExcel } from "./getAllQuestions";
import { AllQuestionsData, Explanation } from "./types";

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

  const excelQuestions = excelFile[EXCEL_SHEET_NAME] as QuestionFromExcel[];

  // ----------------------------------------
  const { allQuestions, allCategories } = getAllQuestionsAndCategories(excelQuestions);
  console.log(1, "allQuestions.length ===", allQuestions.length);
  console.log(2, "allCategories.length ===", allCategories.length);

  // ----------------------------------------
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

  const { allExams } = getAllExams(allQuestions);

  const allQuestionsData: AllQuestionsData = {
    allQuestions,
    allCategories,
    allExplanations,
    allExams,
  };

  return allQuestionsData;
};
