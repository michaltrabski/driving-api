 
 
const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");
const sharp = require("sharp");

const excelToJson = require("convert-excel-to-json");

export const convertExcelToJson = (excel: string) => {
  return excelToJson({
    sourceFile: excel,
    columnToKey: { "*": "{{columnHeader}}" },
    header:{
      // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
      rows: 1 // 2, 3, 4, etc.
  }
  });
};
