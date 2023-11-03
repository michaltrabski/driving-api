import { QuestionSmall, QuestionWithExplanation } from "./types";

export const getAllQuestionsSmall = (allQuestionsWithExplanations: QuestionWithExplanation[]): QuestionSmall[] => {
  const allQuestionsSmall: QuestionSmall[] = allQuestionsWithExplanations.map((q) => {
    return {
      id: q.id,
      text: q.text,
      a: q.a,
      b: q.b,
      c: q.c,
      r: q.r,
      media: q.media,
      categories: q.categories,
      score: q.score,
      slug: q.slug,
    };
  });

  return allQuestionsSmall;
};
