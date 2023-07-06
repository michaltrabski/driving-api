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
    const { allQuestions, allCategories, allPostsFromOldWordpress ,allExplanations } = createQuestionsData(getExcels());

    // console.log(1, "allQuestions", allQuestions.slice(0, 1));
    // console.log(2, "allCategories", allCategories);
    // console.log(3, "allPostsFromOldWordpress", allPostsFromOldWordpress.slice(0, 1));
    // console.log(4, "allExplanations", allExplanations.slice(0, 1));

    // remove folder sync
    fs.removeSync("php/api");

    let fileName = "all-questions";
    fs.outputJsonSync(`php/api/${fileName}.json`, {count: allQuestions.length, allCategories, allQuestions});
    fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));

    fileName = "all-questions-300";
    fs.outputJsonSync(`php/api/${fileName}.json`, { count: allQuestions.slice(0, 300).length,allCategories, allQuestions: allQuestions.slice(0, 300)});
    fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));   


    fileName = "all-categories";
    fs.outputJsonSync(`php/api/${fileName}.json`, { count: allCategories.length, allCategories});
    fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));   


    // TODO - remove duplicates and questions that are created form allQuestions 
    fileName = "all-posts-from-old-wordpress";
    fs.outputJsonSync(`php/api/${fileName}.json`, { count: allPostsFromOldWordpress.length,allPostsFromOldWordpress});
    fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));   

    fileName = "all-posts-from-old-wordpress-50";
    fs.outputJsonSync(`php/api/${fileName}.json`, {count: allPostsFromOldWordpress.slice(0, 50).length,allPostsFromOldWordpress50: allPostsFromOldWordpress.slice(0, 50)});
    fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));  
    
    fileName = "all-explanations";
    fs.outputJsonSync(`php/api/${fileName}.json`, {count: allExplanations.length, allExplanations});
    fs.outputFileSync(`php/api/${fileName}.php`, getPhpCode(fileName));


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
