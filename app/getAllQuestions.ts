const fs = require("fs-extra");
const _ = require("lodash");

import { Question } from "./types";
import { convertMediaNameToPngOrMp4, textToSlug } from "./utils";

const NUMER_PYTANIA = "Numer pytania";
const PYTANIE = "Pytanie";
const MEDIA = "Media";
const ODPOWIEDZ_A = "Odpowiedź A";
const ODPOWIEDZ_B = "Odpowiedź B";
const ODPOWIEDZ_C = "Odpowiedź C";
const KATEGORIE = "Kategorie";
const POPRAWNA_ODP = "Poprawna odp";
const SCORE = "Liczba punktów";

export interface QuestionFromExcel {
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

export const getAllQuestionsAndCategories = (excelQuestions: QuestionFromExcel[]) => {
  const allCategoriesSet = new Set<string>();

  const allQuestions = excelQuestions.map((excelQuestion) => {
    const categories: string[] = excelQuestion[KATEGORIE].toLowerCase().split(",");
    categories.forEach((cat) => allCategoriesSet.add(cat));

    const text = excelQuestion[PYTANIE];
    const id = `id${excelQuestion[NUMER_PYTANIA]}`;
    const m = convertMediaNameToPngOrMp4(excelQuestion[MEDIA]) || "";

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

  const allCategories = _.sortBy([...allCategoriesSet]);

  const allQuestionsShuffled = allQuestions.sort(() => Math.random() - 0.5);

  const allQuestionsB = allQuestionsShuffled.filter((q) => q.categories.includes("b"));
  const allQuestionsWithoutB = allQuestionsShuffled.filter((q) => !q.categories.includes("b"));

  const allQuestionsWhereBisFirst = [...allQuestionsB, ...allQuestionsWithoutB];

  return { allQuestions: allQuestionsWhereBisFirst, allCategories };
};
