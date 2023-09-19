const fs = require("fs-extra");
const _ = require("lodash");

import { QuestionBigData } from "./extractExcelData";
import { Question } from "./types";
import { convertMediaNameToPngOrMp4, textToSlug } from "./utils";

export const getAllQuestionsAndCategories = (excelQuestions: QuestionBigData[]) => {
  const allCategoriesSet = new Set<string>();

  const allQuestions = excelQuestions.map((excelQuestion) => {
    const categories: string[] = excelQuestion.kategorie;
    categories.forEach((cat) => allCategoriesSet.add(cat));

    const { id, text, media, a, b, c, r, score } = excelQuestion;

    const newQuestion: Question = {
      id,
      text,
      slug: textToSlug(text, id),
      media,
      a,
      b,
      c,
      r,
      categories,
      score,
    };
    return newQuestion;
  });

  const allCategories = _.sortBy([...allCategoriesSet]);

  const allQuestionsShuffled = allQuestions.sort(() => Math.random() - 0.5);

  const allQuestionsB = allQuestionsShuffled.filter((q) => q.categories.includes("b"));
  const allQuestionsWithoutB = allQuestionsShuffled.filter((q) => !q.categories.includes("b"));

  const allQuestionsWhereBisFirst = [...allQuestionsB, ...allQuestionsWithoutB];

  return { allQuestions: allQuestionsWhereBisFirst, allCategories };
};
