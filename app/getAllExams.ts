import { ALL_EXAMS_LIMIT, arr12, arr20 } from "../constants";
import { Exam, QuestionWithExplanation } from "./types";
import { IsAnswerABC, isAnswerYesNo } from "./utils";

const fs = require("fs-extra");
const _ = require("lodash");
const random = () => Math.random() - 0.5;

export const getAllExams = (allQuestionsWithExplanations: QuestionWithExplanation[]) => {
  const examCategory = "b";
  const minPointsToPass = 68;
  const maxPoints = 74;

  const mutableArr1 = [...allQuestionsWithExplanations.filter((q) => q.categories.includes(examCategory))];
  const arrToSearch1 = mutableArr1.sort(random);

  const mutableArr2 = [...allQuestionsWithExplanations.filter((q) => q.categories.includes(examCategory))];
  const arrToSearch2 = mutableArr2.sort(random);

  const allExams: Exam[] = [];
  for (let i = 1; i <= ALL_EXAMS_LIMIT; i++) {
    const examName = `Egzamin nr ${i}`;
    const examSlug = `kategoria-b-egzamin-nr-${i}`;

    const e20: QuestionWithExplanation[] = arr20.sort(random).map((score) => {
      const question = arrToSearch1.find((q) => q.score === score && isAnswerYesNo(q.r));

      if (question) {
        // remove question from mutableArr1
        const indexToRemove = mutableArr1.findIndex((q) => q.id === question.id);
        mutableArr1.splice(indexToRemove, 1);

        return question;
      }

      const questionSecondChance = arrToSearch2.find((q) => q.score === score && isAnswerYesNo(q.r));
      if (questionSecondChance) {
        // remove question from mutableArr2
        const indexToRemove = mutableArr2.findIndex((q) => q.id === questionSecondChance.id);
        mutableArr2.splice(indexToRemove, 1);

        return questionSecondChance;
      }

      const fallbackQuestion = allQuestionsWithExplanations.sort(random).find((q) => q.score === score && isAnswerYesNo(q.r));
      return fallbackQuestion || allQuestionsWithExplanations[0];
    });

    const e12: QuestionWithExplanation[] = arr12.sort(random).map((score) => {
      const question = arrToSearch1.find((q) => q.score === score && IsAnswerABC(q.r));

      if (question) {
        // remove question from mutableArr1
        const indexToRemove = mutableArr1.findIndex((q) => q.id === question.id);
        mutableArr1.splice(indexToRemove, 1);

        return question;
      }

      const questionSecondChance = arrToSearch2.find((q) => q.score === score && IsAnswerABC(q.r));
      if (questionSecondChance) {
        // remove question from mutableArr2
        const indexToRemove = mutableArr2.findIndex((q) => q.id === questionSecondChance.id);
        mutableArr2.splice(indexToRemove, 1);

        return questionSecondChance;
      }

      const fallbackQuestion = allQuestionsWithExplanations.sort(random).find((q) => q.score === score && isAnswerYesNo(q.r));
      return fallbackQuestion || allQuestionsWithExplanations[0];
    });

    const examQuestions32 = [...e20, ...e12];
    const allPossiblePoints = examQuestions32.reduce((acc, q) => acc + q.score, 0);

    if (maxPoints !== allPossiblePoints) {
      console.log(examSlug, allPossiblePoints);
      throw new Error("maxPoints !== allPossiblePoints");
    }

    const newExam: Exam = {
      examName,
      examSlug,
      examCategory,
      minPointsToPass,
      allPossiblePoints,
      examQuestions32: examQuestions32,
    };

    allExams.push(newExam);
  }

  return { allExams };
};
