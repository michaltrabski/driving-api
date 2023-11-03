const fs = require("fs-extra");
const _ = require("lodash");


import { Question, QuestionFromExcel } from "./types";
import {  textToSlug } from "./utils";

export const getAllQuestionsAndCategories = (excelQuestions: QuestionFromExcel[]) => {
  const allCategoriesSet = new Set<string>();

  const allQuestions = excelQuestions.map((excelQuestion) => {
    const categories: string[] = excelQuestion.categories;
    categories.forEach((cat) => allCategoriesSet.add(cat));

    const { id, text: text, media: media, a, b, c, r, score: score } = excelQuestion;

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
