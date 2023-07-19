import { MODE } from "./types";

const fs = require("fs-extra");
const path = require("path");

export function getPhpCode(fileName: string) {
  return `<?php
              header('Content-Type: application/json');
              header('Access-Control-Allow-Origin: *');
              header('Access-Control-Allow-Methods: GET, POST');
              header('Access-Control-Allow-Headers: Content-Type');

              $jsonData = file_get_contents('${fileName}.json');

              echo $jsonData;`;
}

export function textToSlug(text: string, id: string) {
  let slug = `${text.slice(0,160)}-id-pytania-${id.replace("id", "")}`;

  slug = slug.replace(/^\s+|\s+$/g, ""); // trim
  slug = slug.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ęóąśłżźćńàáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to__ = "eoaslzzcnaaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    slug = slug.replace(new RegExp(from.charAt(i), "g"), to__.charAt(i));
  }

  slug = slug
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return slug;
}

 

export function convertMediaNameToPngOrMp4(mediaName: string) {
  if (mediaName.endsWith(".jpg")) {
    return mediaName.replace(".jpg", ".png");
  }
  if (mediaName.endsWith(".JPG")) {
    return mediaName.replace(".JPG", ".png");
  }
  if (mediaName.endsWith(".jpeg")) {
    return mediaName.replace(".jpeg", ".png");
  }
  if (mediaName.endsWith(".JPEG")) {
    return mediaName.replace(".JPEG", ".png");
  }
  if (mediaName.endsWith(".wmv")) {
    return mediaName.replace(".wmv", ".mp4");
  }

  return mediaName;
}

// export const mediaNameWithoutExtention = (originalMediaName: string) => {
//   return originalMediaName.split(".").slice(0, -1).join(".");
// };

// interface MediaList {
//   media_original_file_name: string;
//   media: string;
// }

// export const removeTransformedMedia = () => {
//   // TASK 2 - remove transformation folder and create it again
//   const transformationFolder = getEnv("ABSOLUTE_PATH_FOLDER_FOR_TRANSFORMATION");
//   fs.removeSync(transformationFolder);
// };

// export const getEnv = (variableName: string) => {
//   if (variableName === undefined) {
//     console.log(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
//     throw new Error(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
//   }

//   if (process.env[variableName] === undefined) {
//     console.log(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
//     throw new Error(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
//   }

//   return process.env[variableName] ?? "";
// };

// export const getLimit = (): number => {
//   const limitForDev = getEnv("LIMIT_QUESTIONS_FOR_DEVELOPMENT");
//   const limitForProd = getEnv("LIMIT_QUESTIONS_FOR_PRODUCTION");

//   return process.env.NODE_ENV === MODE.DEVELOPMENT ? +limitForDev : +limitForProd;
// };

// export const isProduction = () => {
//   // console.log(process.env.NODE_ENV === MODE.PRODUCTION)
//   return process.env.NODE_ENV === MODE.PRODUCTION;
// };
