const fs = require("fs-extra");
const _ = require("lodash");

import { getAllExamsByCategory } from "./getAllExams";
import { getAllExplanations } from "./getAllExplanations";
import { getAllQuestionsAndCategories } from "./getAllQuestions";
import { getAllQuestionsSmall } from "./getAllQuestionsSmall";
import { getAllQuestionsWithExplanations } from "./getAllQuestionsWithExplanations";
import { AllQuestionsData, QuestionFromExcel } from "./types";

export const getQuestionsData = (questionsFromExcel: QuestionFromExcel[]): AllQuestionsData => {
  const { allQuestions, allCategories } = getAllQuestionsAndCategories(questionsFromExcel);

  const allExplanations = getAllExplanations();

  const allQuestionsWithExplanations = getAllQuestionsWithExplanations(
    allQuestions,
    allExplanations,
    questionsFromExcel
  );

  const { allExams } = getAllExamsByCategory(allQuestionsWithExplanations);

  const allQuestionsSmall = getAllQuestionsSmall(allQuestionsWithExplanations);

  const allQuestionsData: AllQuestionsData = {
    allQuestionsSmall,
    allCategories,
    allExplanations,
    allQuestionsWithExplanations,
    allExams,
  };

  return allQuestionsData;
};
