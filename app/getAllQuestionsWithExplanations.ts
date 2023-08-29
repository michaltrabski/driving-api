import { Explanation, Question, QuestionWithExplanation } from "./types";

const fs = require("fs-extra");
const _ = require("lodash");

export const getAllQuestionsWithExplanations = (
  allQuestions: Question[],
  allExplanations: Explanation[]
): QuestionWithExplanation[] => {
  console.log(allQuestions[0], allExplanations[0]);

  const allQuestionsWithExplanations: QuestionWithExplanation[] = allQuestions.map((question) => {
    const explanation = allExplanations.find((explanation) => explanation.id === question.id);

    return {
      ...question,
      expl: explanation ? explanation.expl : [],
      topicId: explanation ? explanation.topicId : "",
      author: explanation ? explanation.author : "",
      lowNameOld: explanation ? explanation.lowNameOld : "",
      lowName: explanation ? explanation.lowName : "",
      low: explanation ? explanation.low : [],
      lowNames: explanation ? explanation.lowNames : [],
    };
  });

  return allQuestionsWithExplanations;
};
