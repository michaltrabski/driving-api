const path = require("fs-extra");
const fs = require("fs-extra");
require("dotenv").config();

import { createQuestionsData, ExcelFileInfo } from "./app/createQuestionsData";
import { resizeMedia } from "./app/createQuestionsMedia";
import { extractExcelData } from "./app/extractExcelData";
import { unzip as unzipToFolder } from "./app/unzip";
import { getPhpCode } from "./app/utils";

const start = async () => {
  console.log("--------------------------START--------------------------");
  console.log("ENV", {
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    // need to be fixed to move files to destination folder, npw it omit files not in zip folders
    // await unzipToFolder();
    // await resizeMedia();

    const questionBigDataArray =  extractExcelData();
    console.log("questionBigDataArray.length", questionBigDataArray.length);

    return;

    // TAKS - process excel files to create allQuestionsData
    const { allQuestions, allCategories, allExplanations, allQuestionsWithExplanations, allExams } = createQuestionsData(getExcels());

    // remove folder sync
    fs.removeSync("php/api");

    const fileNameAllQuestions = "all-questions";
    const fileNameAllQuestionsObj = {
      allQuestionsCount: allQuestions.length,
      allCategoriesCount: allCategories.length,
      allCategories,
      allQuestions,
    };
    fs.outputJsonSync(`php/api/${fileNameAllQuestions}.json`, fileNameAllQuestionsObj);
    fs.outputFileSync(`php/api/${fileNameAllQuestions}.php`, getPhpCode(fileNameAllQuestions));

    // all-explanations
    [1, 2, 3, 4, 5].forEach((nr, index, arr) => {
      const fileName = `all-explanations-${nr}`;
      const sliceBy = Math.ceil(allExplanations.length / arr.length);

      const sliceFrom = sliceBy * index;
      const sliceTo = index === arr.length - 1 ? allExplanations.length : sliceBy + sliceBy * index;

      // console.log(fileName, "sliceFrom", sliceFrom);
      // console.log(fileName, "sliceTo", sliceTo);

      const allExplanationsSliced = allExplanations.slice(index === 0 ? 0 : sliceFrom, sliceTo);
      const data = {
        allExplanationsCount: allExplanationsSliced.length,
        allExplanations: allExplanationsSliced,
      };
      createApiFile(fileName, data);
    });

    // all-questions-with-explanations
    [1, 2, 3, 4, 5].forEach((nr, index, arr) => {
      const fileName = `all-questions-with-explanations-${nr}`;
      const sliceBy = Math.ceil(allQuestionsWithExplanations.length / arr.length);

      const sliceFrom = sliceBy * index;
      const sliceTo = index === arr.length - 1 ? allQuestionsWithExplanations.length : sliceBy + sliceBy * index;

      // console.log(fileName, "sliceFrom", sliceFrom);
      // console.log(fileName, "sliceTo", sliceTo);

      const allQuestionsWithExplanationsSliced = allQuestionsWithExplanations.slice(index === 0 ? 0 : sliceFrom, sliceTo);
      const data = {
        allQuestionsWithExplanationsCount: allQuestionsWithExplanationsSliced.length,
        allQuestionsWithExplanations: allQuestionsWithExplanationsSliced,
      };
      createApiFile(fileName, data);
    });

    // all-exams
    const fileName5 = "all-exams";
    const data5 = {
      allExamsCount: allExams.length,
      allExams,
    };
    createApiFile(fileName5, data5);
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
      excelSource: "sourceData/baza_pytań_dla_mi_27_06_2023.xlsx",
      isNewest: true,
    },
    {
      excelSource: "sourceData/Baza_pytań_na_egzamin_na_prawo_jazdy_22_02_2022r.xlsx",
      isNewest: false,
    },
    {
      excelSource: "sourceData/baza_pytań_na_prawo_jazdy__05.xlsx",
      isNewest: false,
    },
  ];

  return excels;
}

function createApiFile(fileName: string, data: any) {
  fs.outputJsonSync(`php/api/${fileName}.json`, data);
  fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));
}
