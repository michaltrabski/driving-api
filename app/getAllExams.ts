import { Exam, Question } from "./types";

const fs = require("fs-extra");
const _ = require("lodash");

export const getAllExams = (allQuestions: Question[]) => {
  const howManyExamsToCreate = 95;

  const examCategory = "b";

  const allExams: Exam[] = [];
  for (let i = 1; i <= howManyExamsToCreate; i++) {
    const examName = `Egzamin nr ${i}`;
    const examSlug = `egzamin-nr-${i}`;
    const minPointsToPass = 68;

    const questionsWithCurrentCategory = allQuestions.filter((q) => q.categories.includes(examCategory));
    const allQuestionsShuffled = questionsWithCurrentCategory.sort(() => Math.random() - 0.5);

    const muttableQuestionsArr = [...allQuestionsShuffled];

    let allPossiblePoints = 0; // should be 74;

    const arr2 = [1, 2];
    const arr4 = [1, 2, 3, 4];
    const arr6 = [1, 2, 3, 4, 5, 6];
    const arr10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const examQuestions32: Question[] = [
      ...arr4.map(() => ({ score: 1, type: "yesno" })),
      ...arr6.map(() => ({ score: 2, type: "yesno" })),
      ...arr10.map(() => ({ score: 3, type: "yesno" })),
      ...arr2.map(() => ({ score: 1, type: "abc" })),
      ...arr4.map(() => ({ score: 2, type: "abc" })),
      ...arr6.map(() => ({ score: 3, type: "abc" })),
    ].map(({ score, type }, index) => {
      // console.log(index, muttableQuestionsArr.length);

      allPossiblePoints += score;

      const questionIndex = muttableQuestionsArr.findIndex((q) => {
        const isTypeOfYesNo = q.r === "t" || q.r === "n";
        const isTypeOfABCD = q.r === "a" || q.r === "b" || q.r === "c";

        if (q.score === score && type === "yesno" && isTypeOfYesNo) {
          return true;
        }

        if (q.score === score && type === "abc" && isTypeOfABCD) {
          return true;
        }

        return false;
      });

      const question = muttableQuestionsArr[questionIndex];
      muttableQuestionsArr.splice(questionIndex, 1);

      return question;
    });

    // const examQuestions32 = allQuestionsShuffled.slice(0, 32);

    const newExam: Exam = {
      examName,
      examSlug,
      examCategory,
      minPointsToPass,
      allPossiblePoints,
      examQuestions32,
    };

    allExams.push(newExam);
  }

  return { allExams };
};
