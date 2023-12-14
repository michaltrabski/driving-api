import { prepareDataForChatGpt } from "./app/askChatGpt";
import { getAllExamsByCategory } from "./app/getAllExams";
import { QuestionBigObj, QuestionSmallObj } from "./app/types";
import { getCategories, getCategoriesObj, getPhpCode, getQuestionsBig, getQuestionsSmall } from "./app/utils";

const path = require("fs-extra");
const fs = require("fs-extra");
require("dotenv").config();

// import {
//   prepareDataForChatGpt,
//   askChatGpt,
//   QuestionsToChatGpt,
// } from "./app/askChatGpt";
// import { getQuestionsData } from "./app/createQuestionsData";
// import { resizeMedia } from "./app/createQuestionsMedia";
// import { extractExcelData } from "./app/extractExcelData";
// import { unzip as unzipToFolder } from "./app/unzip";
// import { getHtmlCode, getPhpCode } from "./app/utils";

const PHP_API = "php/api";

const start = async () => {
  console.log("--------------------------START--------------------------");
  console.log("ENV", {
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    fs.removeSync(PHP_API);

    const questionsBig = getQuestionsBig(555555555);
    const questionsSmall = getQuestionsSmall(questionsBig);
    const categoriesObj = getCategoriesObj(questionsBig);
    const examDataObj_a = getAllExamsByCategory(questionsSmall, "a", 95);
    const examDataObj_b = getAllExamsByCategory(questionsSmall, "b", 95);
    const examDataObj_c = getAllExamsByCategory(questionsSmall, "c", 95);

    // console.log("questionsBig", questionsBig[0]);
    // console.log("questionsSmall", questionsSmall[0]);
    // console.log("categoriesObj", categoriesObj);

    // await prepareDataForChatGpt(questionsBig);

    const questionsBigObj: QuestionBigObj = {
      questionsBigCount: questionsBig.length,
      categoriesObj,
      questionsBig,
    };

    createApiFile(`questions-big`, questionsBigObj);

    const questionsSmallObj: QuestionSmallObj = {
      questionsSmallCount: questionsSmall.length,
      categoriesObj,
      questionsSmall,
    };

    createApiFile(`questions-small`, questionsSmallObj);

    createApiFile(`categories`, categoriesObj);

    createApiFile(`exams-a`, examDataObj_a);
    createApiFile(`exams-b`, examDataObj_b);
    createApiFile(`exams-c`, examDataObj_c);

    // need to be fixed to move files to destination folder, npw it omit files not in zip folders
    // await unzipToFolder();
    // await resizeMedia();
    // const questionsFromExcel = extractExcelData();
    // console.log("questionsFromExcel.length", questionsFromExcel.length,questionsFromExcel[0]);
    // createApiFile("questions-from-excel", { questionsFromExcel });
    // const {
    //   allQuestionsSmall,
    //   allCategories,
    //   allQuestionsWithExplanations,
    //   allExams,
    // } = getQuestionsData(questionsFromExcel);

    // return;
    // createApiFile("all-exams", {
    //   allExamsCount: allExams.length,
    //   allExams,
    // });
    // createApiFile("all-categories", {
    //   allCategoriesCount: allCategories.length,
    //   allCategories,
    // });
    // createApiFile(`all-questions-big`, {
    //   allQuestionsBigCount: allQuestionsWithExplanations.length,
    //   allQuestionsBig: allQuestionsWithExplanations,
    // });
    // createApiFile(`all-questions-small`, {
    //   allQuestionsSmallCount: allQuestionsSmall.length,
    //   allQuestionsSmall: allQuestionsSmall,
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
