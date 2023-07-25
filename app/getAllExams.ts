import { Exam, Question } from "./types";
import { convertMediaNameToPngOrMp4, textToSlug } from "./utils";

const fs = require("fs-extra");
const _ = require("lodash");

export const getAllExams = (howManyExamsToCreate: number, allQuestions: Question[]) => {
  // const scoreArray = [1,1,1,1,1,1,2,2,2,3,3,3,4,4,5];

  const allExams: Exam[] = [];
  const examCategory = "b";
  for (let i = 1; i <= howManyExamsToCreate; i++) {
    const examName = `Egzamin nr ${i}`;
    const examSlug = `egzamin-nr-${i}`;

    const questionsWithCurrentCategory = allQuestions.filter((q) => q.categories.includes(examCategory));
    const allQuestionsShuffled = questionsWithCurrentCategory.sort(() => Math.random() - 0.5);
    const examQuestions32 = allQuestionsShuffled.slice(0, 32);

    const newExam: Exam = {
      examName,
      examSlug,
      examCategory,
      examQuestions32,
    };

    allExams.push(newExam);
  }

  return { allExams };
};
