const path = require("fs-extra");
const fs = require("fs-extra");
require("dotenv").config();

import { getQuestionsData } from "./app/createQuestionsData";
import { resizeMedia } from "./app/createQuestionsMedia";
import { extractExcelData } from "./app/extractExcelData";
import { unzip as unzipToFolder } from "./app/unzip";
import { getHtmlCode, getPhpCode } from "./app/utils";

const start = async () => {
  console.log("--------------------------START--------------------------");
  console.log("ENV", {
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    fs.removeSync("php/api");
    // need to be fixed to move files to destination folder, npw it omit files not in zip folders
    // await unzipToFolder();
    // await resizeMedia();

    const questionsBigDataArray = extractExcelData();
    console.log("questionBigDataArray.length", questionsBigDataArray.length);

    // questions-big-array-data
    createApiFile("1-questions-big-array-data", { questionsBigDataArray });

    const { allQuestions, allCategories, allExplanations, allQuestionsWithExplanations, allExams } = getQuestionsData(questionsBigDataArray);

    // all-questions
    createApiFile("all-questions", {
      allQuestionsCount: allQuestions.length,
      allCategoriesCount: allCategories.length,
      allCategories,
      allQuestions,
    });



    // all-explanations
    [1, 2, 3, 4, 5].forEach((nr, index, arr) => {
      const sliceBy = Math.ceil(allExplanations.length / arr.length);
      const sliceFrom = sliceBy * index;
      const sliceTo = index === arr.length - 1 ? allExplanations.length : sliceBy + sliceBy * index;
      const allExplanationsSliced = allExplanations.slice(index === 0 ? 0 : sliceFrom, sliceTo);
      createApiFile(`all-explanations-${nr}`, {
        allExplanationsCount: allExplanationsSliced.length,
        allExplanations: allExplanationsSliced,
      });
    });

    // all-questions-with-explanations
    [1, 2, 3, 4, 5].forEach((nr, index, arr) => {
      const sliceBy = Math.ceil(allQuestionsWithExplanations.length / arr.length);
      const sliceFrom = sliceBy * index;
      const sliceTo = index === arr.length - 1 ? allQuestionsWithExplanations.length : sliceBy + sliceBy * index;
      const allQuestionsWithExplanationsSliced = allQuestionsWithExplanations.slice(index === 0 ? 0 : sliceFrom, sliceTo);
      createApiFile(`all-questions-with-explanations-${nr}`, {
        allQuestionsWithExplanationsCount: allQuestionsWithExplanationsSliced.length,
        allQuestionsWithExplanations: allQuestionsWithExplanationsSliced,
      });
    });

    // all-exams
    createApiFile("all-exams", {
      allExamsCount: allExams.length,
      allExams,
    });
  } catch (err) {
    console.log("FAIL BECAUSE OF CATCH ERROR", err);
    // start();
  }

  console.log("---------------------------END---------------------------");
};

start();

function createApiFile(fileName: string, data: any) {
  fs.outputJsonSync(`php/api/${fileName}.json`, data);
  fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));
  fs.outputFileSync(`php/api/${fileName}-previev.html`, getHtmlCode(JSON.stringify(data)));
}
