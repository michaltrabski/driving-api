const fs = require("fs-extra");
const _ = require("lodash");

import { Explanation } from "./types";

export const getAllExplanations = ():Explanation[] => {
  const masterQuestions = fs.readJsonSync("./sourceData/masterQuestions.json");
  const allExplanations = masterQuestions.allQuestions.map((q: any) => {
    const newExplanation: Explanation = {
      id: q.id,
      expl: q.expl,
      topicId: q.topicId,
      author: q.author,
      lowNameOld: q.lowNameOld,
      lowName: q.lowName,
      low: q.low,
      lowNames: q.lowNames,
    };

    return newExplanation;
  });

  return allExplanations;
};
