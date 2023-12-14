import { ExamData, ExamDataObj, QuestionSmall } from "./types";

const fs = require("fs-extra");
const _ = require("lodash");
const rnd = () => Math.random() - 0.5;

export const getAllExamsByCategory = (
  questionsSmall: QuestionSmall[],
  examCategory: string,
  limit = 95
): ExamDataObj => {
  const minPointsToPass = 68;
  const maxPoints = 74;

  const questions = questionsSmall
    .filter((q) => q.isActive)
    .filter((q) => q.categories.includes(examCategory))
    .sort(rnd);
  const questionsCopy = [...questions];

  const generateSingleExam = (nr: number): ExamData => {
    console.log(nr, ")", questions.length);
    const examName = `Egzamin nr ${nr} na kategorię ${examCategory.toUpperCase()}`;
    const examSlug = `egzamin-nr-${nr}-na-kategorie-${examCategory}`;

    const yesNo_Score1_count4: QuestionSmall[] = []; // 4 questions with score 1 and answer yesNo
    const yesNo_Score2_count6: QuestionSmall[] = []; // 6 questions with score 2 and answer yesNo
    const yesNo_Score3_count10: QuestionSmall[] = []; // 10 questions with score 3 and answer yesNo

    const abc_Score1_count2: QuestionSmall[] = []; // 2 questions with score 1 and answer ABC
    const abc_Score2_count4: QuestionSmall[] = []; // 4 questions with score 2 and answer ABC
    const abc_Score3_count6: QuestionSmall[] = []; // 6 questions with score 3 and answer ABC

    for (let i = 0; i < 4; i++) {
      const question = questions.find((q) => q.a === "" && q.score === 1);
      if (question) {
        yesNo_Score1_count4.push(question);
        questions.splice(questions.indexOf(question), 1);
      } else {
        const qcs = questionsCopy.sort(rnd);
        const questionFromCopy = qcs.find((q) => q.a === "" && q.score === 1) || qcs[0];
        yesNo_Score1_count4.push(questionFromCopy);
      }
    }

    for (let i = 0; i < 6; i++) {
      const question = questions.find((q) => q.a === "" && q.score === 2);
      if (question) {
        yesNo_Score2_count6.push(question);
        questions.splice(questions.indexOf(question), 1);
      } else {
        const qcs = questionsCopy.sort(rnd);
        const questionFromCopy = qcs.find((q) => q.a === "" && q.score === 2) || qcs[0];
        yesNo_Score2_count6.push(questionFromCopy);
      }
    }

    for (let i = 0; i < 10; i++) {
      const question = questions.find((q) => q.a === "" && q.score === 3);
      if (question) {
        yesNo_Score3_count10.push(question);
        questions.splice(questions.indexOf(question), 1);
      } else {
        const qcs = questionsCopy.sort(rnd);
        const questionFromCopy = qcs.find((q) => q.a === "" && q.score === 3) || qcs[0];
        yesNo_Score3_count10.push(questionFromCopy);
      }
    }

    for (let i = 0; i < 2; i++) {
      const question = questions.find((q) => q.a !== "" && q.score === 1);
      if (question) {
        abc_Score1_count2.push(question);
        questions.splice(questions.indexOf(question), 1);
      } else {
        const qcs = questionsCopy.sort(rnd);
        const questionFromCopy = qcs.find((q) => q.a !== "" && q.score === 1) || qcs[0];
        abc_Score1_count2.push(questionFromCopy);
      }
    }

    for (let i = 0; i < 4; i++) {
      const question = questions.find((q) => q.a !== "" && q.score === 2);
      if (question) {
        abc_Score2_count4.push(question);
        questions.splice(questions.indexOf(question), 1);
      } else {
        const qcs = questionsCopy.sort(rnd);
        const questionFromCopy = qcs.find((q) => q.a !== "" && q.score === 2) || qcs[0];
        abc_Score2_count4.push(questionFromCopy);
      }
    }

    for (let i = 0; i < 6; i++) {
      const question = questions.find((q) => q.a !== "" && q.score === 3);
      if (question) {
        abc_Score3_count6.push(question);
        questions.splice(questions.indexOf(question), 1);
      } else {
        const qcs = questionsCopy.sort(rnd);
        const questionFromCopy = qcs.find((q) => q.a !== "" && q.score === 3) || qcs[0];
        abc_Score3_count6.push(questionFromCopy);
      }
    }

    // [...questions].forEach((question, index) => {
    //   const { a, score } = question;

    //   console.log(index, yesNo_Score1_count4.length, score, a);

    //   if (yesNo_Score1_count4.length < 4) {
    //     if (a === "" && score === 1) {
    //       yesNo_Score1_count4.push(question);
    //       console.log(questions.indexOf(question));
    //       questions.splice(questions.indexOf(question), 1);
    //     } else {
    //       const qcs = questionsCopy.sort(rnd);
    //       const questionFromCopy = qcs.find((q) => q.a === "" && q.score === 1) || qcs[0];
    //       yesNo_Score1_count4.push(questionFromCopy);
    //     }
    //   }

    //   if (yesNo_Score2_count6.length < 6) {
    //     if (a === "" && score === 2) {
    //       yesNo_Score2_count6.push(question);
    //       questions.splice(questions.indexOf(question), 1);
    //     } else {
    //       const qcs = questionsCopy.sort(rnd);
    //       const questionFromCopy = qcs.find((q) => q.a === "" && q.score === 2) || qcs[0];
    //       yesNo_Score2_count6.push(questionFromCopy);
    //     }
    //   }

    //   if (yesNo_Score3_count10.length < 10) {
    //     if (a === "" && score === 3) {
    //       yesNo_Score3_count10.push(question);
    //       questions.splice(questions.indexOf(question), 1);
    //     } else {
    //       const qcs = questionsCopy.sort(rnd);
    //       const questionFromCopy = qcs.find((q) => q.a === "" && q.score === 3) || qcs[0];
    //       yesNo_Score3_count10.push(questionFromCopy);
    //     }
    //   }

    //   if (abc_Score1_count2.length < 2) {
    //     if (a !== "" && score === 1) {
    //       abc_Score1_count2.push(question);
    //       questions.splice(questions.indexOf(question), 1);
    //     } else {
    //       const qcs = questionsCopy.sort(rnd);
    //       const questionFromCopy = qcs.find((q) => q.a !== "" && q.score === 1) || qcs[0];
    //       abc_Score1_count2.push(questionFromCopy);
    //     }
    //   }

    //   if (abc_Score2_count4.length < 4) {
    //     if (a !== "" && score === 2) {
    //       abc_Score2_count4.push(question);
    //       questions.splice(questions.indexOf(question), 1);
    //     } else {
    //       const qcs = questionsCopy.sort(rnd);
    //       const questionFromCopy = qcs.find((q) => q.a !== "" && q.score === 2) || qcs[0];
    //       abc_Score2_count4.push(questionFromCopy);
    //     }
    //   }

    //   if (abc_Score3_count6.length < 6) {
    //     if (a !== "" && score === 3) {
    //       abc_Score3_count6.push(question);
    //       questions.splice(questions.indexOf(question), 1);
    //     } else {
    //       const qcs = questionsCopy.sort(rnd);
    //       const questionFromCopy = qcs.find((q) => q.a !== "" && q.score === 3) || qcs[0];
    //       abc_Score3_count6.push(questionFromCopy);
    //     }
    //   }
    // });

    const yesNo = [...yesNo_Score1_count4, ...yesNo_Score2_count6, ...yesNo_Score3_count10].sort(rnd);

    const yesNo_3png: QuestionSmall[] = []; // 3 questions with score 1 and answer yesNo and media png
    const yesNo_17rest: QuestionSmall[] = []; // 17 questions with score 1 and answer yesNo and media mp4

    yesNo.forEach((q) => {
      if (q.media.endsWith(".png") && yesNo_3png.length < 3) {
        yesNo_3png.push(q);
      } else {
        yesNo_17rest.push(q);
      }
    });

    const abc = [...abc_Score1_count2, ...abc_Score2_count4, ...abc_Score3_count6].sort(rnd);

    const examQuestions32 = [...yesNo_3png, ...yesNo_17rest, ...abc];

    const allPossiblePoints = examQuestions32.reduce((acc, q) => acc + q.score, 0);

    if (maxPoints !== allPossiblePoints) {
      console.log(`maxPoints ${maxPoints} !== allPossiblePoints ${allPossiblePoints}`);
      // throw new Error(`maxPoints ${maxPoints} !== allPossiblePoints ${allPossiblePoints}`);
    }

    const newExam: ExamData = {
      examName,
      examSlug,
      examCategory,
      minPointsToPass,
      allPossiblePoints,
      examQuestions32,
    };

    return newExam;
  };

  const exams: ExamData[] = [];

  for (let i = 1; i <= limit; i++) {
    exams.push(generateSingleExam(i));
  }

  return {
    examsCount: exams.length,
    exams,
  };
};
