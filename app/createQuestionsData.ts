const fs = require("fs-extra");
const _ = require("lodash");

import { QuestionBigData } from "./extractExcelData";
import { getAllExams } from "./getAllExams";
import { getAllExplanations } from "./getAllExplanations";
import { getAllQuestionsAndCategories } from "./getAllQuestions";
import { getAllQuestionsWithExplanations } from "./getAllQuestionsWithExplanations";
import { AllQuestionsData, Explanation } from "./types";

export const getQuestionsData = (questionBigDataArray: QuestionBigData[]): AllQuestionsData => {
  // ----------------------------------------
  const { allQuestions, allCategories } = getAllQuestionsAndCategories(questionBigDataArray);
  console.log(1, "allQuestions.length ===", allQuestions.length);
  console.log(2, "allCategories.length ===", allCategories.length);

  // ----------------------------------------
  const allExplanations = getAllExplanations();
  console.log(3, "allExplanations.length ===", allExplanations.length);

  // ----------------------------------------
  const allQuestionsWithExplanations = getAllQuestionsWithExplanations(allQuestions, allExplanations);
  console.log(4, "allQuestionsWithExplanations.length ===", allQuestionsWithExplanations.length);

  // ----------------------------------------
  const { allExams } = getAllExams(allQuestions);
  console.log(5, "allExams.length ===", allExams.length);

  const allQuestionsData: AllQuestionsData = {
    allQuestions,
    allCategories,
    allExplanations,
    allQuestionsWithExplanations,
    allExams,
  };

  return allQuestionsData;
};
