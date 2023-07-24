const fs = require("fs-extra");
const _ = require("lodash");

import { convertExcelToJson } from "./excelToJson";
import { getAllPostsFromOldWordpress } from "./getAllPostsFromOldWordpress";
import { getAllQuestionsAndCategories, QuestionFromExcel } from "./getAllQuestions";
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

  const {allQuestions,allCategories } = getAllQuestionsAndCategories(excelQuestions);
  console.log(1,"allQuestions.length ===", allQuestions.length);
  console.log(2, "allCategories.length ===", allCategories.length);
 


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



  const { allPostsFromOldWordpress } = getAllPostsFromOldWordpress();

  const allQuestionsData: AllQuestionsData = {
    allQuestions,
    allCategories,
    allPostsFromOldWordpress,
    allExplanations,
    allExams,
  };

  return allQuestionsData;
};
