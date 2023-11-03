import { Explanation, Question, QuestionFromExcel, QuestionWithExplanation } from "./types";
import { textToSlug } from "./utils";



export const getAllQuestionsWithExplanations = (allQuestions: Question[], allExplanations: Explanation[], questionsFromExcel: QuestionFromExcel[]): QuestionWithExplanation[] => {
  const allQuestionsWithExplanations: QuestionWithExplanation[] = questionsFromExcel.map((question) => {
    const explanation = allExplanations.find((explanation) => explanation.id === question.id);



    return {
      ...question,

      // add part from allQuestions
      slug: textToSlug(question.text, question.id),

      // add part from allExplanations
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
