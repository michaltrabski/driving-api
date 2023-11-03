const path = require("fs-extra");
const fs = require("fs-extra");
require("dotenv").config();

import { getQuestionsData } from "./app/createQuestionsData";
import { resizeMedia } from "./app/createQuestionsMedia";
import { extractExcelData } from "./app/extractExcelData";
import { unzip as unzipToFolder } from "./app/unzip";
import { getHtmlCode, getPhpCode } from "./app/utils";

const PHP_API = "php/api";

const start = async () => {
  console.log("--------------------------START--------------------------");
  console.log("ENV", {
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    fs.removeSync(PHP_API);
    // need to be fixed to move files to destination folder, npw it omit files not in zip folders
    // await unzipToFolder();
    // await resizeMedia();

    const questionsFromExcel = extractExcelData();
    // console.log("questionsFromExcel.length", questionsFromExcel.length);

    // createApiFile("questions-from-excel", { questionsFromExcel });

    const { allQuestionsSmall, allCategories,  allQuestionsWithExplanations, allExams } = getQuestionsData(questionsFromExcel);

    createApiFile("all-exams", {
      allExamsCount: allExams.length,
      allExams,
    });

    createApiFile("all-categories", {
      allCategoriesCount: allCategories.length,
      allCategories,
    });

    createApiFile(`all-questions-big`, {
      allQuestionsBigCount: allQuestionsWithExplanations.length,
      allQuestionsBig: allQuestionsWithExplanations,
    });

    createApiFile(`all-questions-small`, {
      allQuestionsSmallCount: allQuestionsSmall.length,
      allQuestionsSmall: allQuestionsSmall,
    });

    // createApiFile("all-questions", {
    //   allQuestionsCount: allQuestions.length,
    //   allCategoriesCount: allCategories.length,
    //   allCategories,
    //   allQuestions,
    // });

    // [1, 2, 3, 4, 5].forEach((nr, index, arr) => {
    //   const sliceBy = Math.ceil(allExplanations.length / arr.length);
    //   const sliceFrom = sliceBy * index;
    //   const sliceTo = index === arr.length - 1 ? allExplanations.length : sliceBy + sliceBy * index;
    //   const allExplanationsSliced = allExplanations.slice(index === 0 ? 0 : sliceFrom, sliceTo);
    //   createApiFile(`all-explanations-${nr}`, {
    //     allExplanationsCount: allExplanationsSliced.length,
    //     allExplanations: allExplanationsSliced,
    //   });
    // });

    // [1, 2, 3, 4, 5, 6, 7].forEach((nr, index, arr) => {
    //   const sliceBy = Math.ceil(allQuestionsWithExplanations.length / arr.length);
    //   const sliceFrom = sliceBy * index;
    //   const sliceTo = index === arr.length - 1 ? allQuestionsWithExplanations.length : sliceBy + sliceBy * index;
    //   const allQuestionsWithExplanationsSliced = allQuestionsWithExplanations.slice(index === 0 ? 0 : sliceFrom, sliceTo);
    //   createApiFile(`all-questions-with-explanations-${nr}`, {
    //     allQuestionsWithExplanationsCount: allQuestionsWithExplanationsSliced.length,
    //     allQuestionsWithExplanations: allQuestionsWithExplanationsSliced,
    //   });
    // });
  } catch (err) {
    console.log("FAIL BECAUSE OF CATCH ERROR", err);
    // start();
  }

  console.log("---------------------------END---------------------------");
};

start();

function createApiFile(fileName: string, data: any) {
  fs.outputJsonSync(`${PHP_API}/${fileName}.json`, data);
  fs.outputFileSync(`${PHP_API}/${fileName}.php`, getPhpCode(fileName));
  // fs.outputFileSync(`${PHP_API}/${fileName}-previev.html`, getHtmlCode(JSON.stringify(data, null, 2)));
}
