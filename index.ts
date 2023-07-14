const path = require("fs-extra");
const fs = require("fs-extra");
require("dotenv").config();

import { createQuestionsData, ExcelFileInfo, getQuestionsFromExcel } from "./app/createQuestionsData";
import { resizeMedia } from "./app/createQuestionsMedia";
import { unzip } from "./app/unzip";
import { getPhpCode } from "./app/utils";

// https://dacmwwxjyw.cfolks.pl/files/testy-na-prawo-jazdy/size-720/1_1472ztV.mp4

const start = async () => {
  console.log("--------------------------START--------------------------");
  console.log("ENV", {
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    // you can put files in zip folders so I will unzip them
    // resize media
    // upload media to hosting

    // await unzip();
    // await resizeMedia();

    // TAKS - process excel files to create allQuestionsData
    const { allExams, allQuestions, allCategories, allPostsFromOldWordpress, allExplanations } = createQuestionsData(
      getExcels()
    );

    // console.log(1, "allQuestions", allQuestions.slice(0, 1));
    // console.log(2, "allCategories", allCategories);
    // console.log(3, "allPostsFromOldWordpress", allPostsFromOldWordpress.slice(0, 1));
    // console.log(4, "allExplanations", allExplanations.slice(0, 1));
    // console.log(5, "allExams", allExams.slice(0, 1));

    // remove folder sync
    fs.removeSync("php/api");

 
    const fileNameAllQuestions ="all-questions";
    const fileNameAllQuestionsObj = {
      allQuestionsCount: allQuestions.length,
      allCategoriesCount: allCategories.length,
      allCategories,
      allQuestions,
    };
    fs.outputJsonSync(`php/api/${fileNameAllQuestions}.json`, fileNameAllQuestionsObj);
    fs.outputFileSync(`php/api/${fileNameAllQuestions}.php`, getPhpCode(fileNameAllQuestions));
 
    // TODO - remove duplicates and questions that are created form allQuestions
    const fileNameWordpress = "all-posts-from-old-wordpress";
    const fileNameWordpressObj = {
      allPostsFromOldWordpressCount: allPostsFromOldWordpress.length,
      allPostsFromOldWordpress
    };
    fs.outputJsonSync(`php/api/${fileNameWordpress}.json`, fileNameWordpressObj);
    fs.outputFileSync(`php/api/${fileNameWordpress}.php`, getPhpCode(fileNameWordpress));

 
 
    const fileNameAllExplanations  = "all-explanations";
    const fileNameAllExplanationsObj = {
      allExplanationsCount: allExplanations.length,
      allExplanations
    };
    fs.outputJsonSync(`php/api/${fileNameAllExplanations}.json`, fileNameAllExplanations);
    fs.outputFileSync(`php/api/${fileNameAllExplanations}.php`, getPhpCode(fileNameAllExplanations));

 
    const fileNameAllExams = "all-exams";
    const fileNameAllExamsObj = {
      allExamsCount: allExams.length,
      allExams
    };
    fs.outputJsonSync(`php/api/${fileNameAllExams}.json`, fileNameAllExamsObj);
    fs.outputFileSync(`php/api/${fileNameAllExams}.php`, getPhpCode(fileNameAllExams));
  } catch (err) {
    console.log("FAIL BECAUSE OF CATCH ERROR", err);
    // start();
  }

  console.log("---------------------------END---------------------------");
};

start();

function getExcels(): ExcelFileInfo[] {
  const excels: ExcelFileInfo[] = [
    {
      excelSource: "sourceData/Baza_pytań_na_egzamin_na_prawo_jazdy_22_02_2022r.xlsx",
      isNewest: true,
    },
    {
      excelSource: "sourceData/baza_pytań_na_prawo_jazdy__05.xlsx",
      isNewest: false,
    },
  ];

  return excels;
}
