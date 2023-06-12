 
 
import { MODE } from "./types";

const fs = require("fs-extra");
const path = require("path");
 
 
 
 
 

 

 

 
 

export const mediaNameWithoutExtention = (originalMediaName: string) => {
  return originalMediaName.split(".").slice(0, -1).join(".");
};

export const randomizeMediaName = (originalMediaName: string) => {
  const defaultImage = getEnv("PROJECT_1_DEFAULT_MEDIA_FILE");
  if (originalMediaName === defaultImage) {
    return originalMediaName;
  }

 
  const suffix = isVideo(originalMediaName) ? ".mp4" : ".png";

  return originalMediaName + suffix;
};

export const videoNameToMp4DEPRECATED2 = (originalVideoName: string) => {
  let newVideoName = originalVideoName.replace(".wmv", ".mp4");

  return newVideoName;
};

export const imageNameToPngDEPREC2 = (originalImageName: string) => {
  let newImageName = originalImageName.replace(".jpg", ".png");

  return newImageName;
};

interface MediaList {
  media_original_file_name: string;
  media: string;
}

export const removeTransformedMedia = () => {
  // TASK 2 - remove transformation folder and create it again
  const transformationFolder = getEnv("ABSOLUTE_PATH_FOLDER_FOR_TRANSFORMATION");
  fs.removeSync(transformationFolder);
};

export const getEnv = (variableName: string) => {
  if (variableName === undefined) {
    console.log(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
    throw new Error(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
  }

  if (process.env[variableName] === undefined) {
    console.log(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
    throw new Error(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
  }

  return process.env[variableName] ?? "";
};

 

 
 

export const isVideo = (originalFileName: string) => {
  return originalFileName.toLowerCase().endsWith(".wmv") || originalFileName.toLowerCase().endsWith(".mp4");
};

export const normalizeMediaNameDEPRECATED = (originalName: string) => {
  return originalName.trim().replace(/\s+/g, "_");
};

export const imageNameDEPRECATED = (originalImageName: string, size?: number) => {
  const newImageName = normalizeMediaNameDEPRECATED(originalImageName);

  return size ? `size_${size}_${newImageName}` : newImageName;
};

export const videoNameToMp4DEPRECATED = (originalVideoName: string, size?: number) => {
  const newVideoName = normalizeMediaNameDEPRECATED(originalVideoName).replace(".wmv", ".mp4");

  return size ? `size_${size}_${newVideoName}` : newVideoName;
};
 

export const readTextFileSync = (file_location: string | undefined, file_name: string): string => {
  if (!file_location) {
    throw new Error("there is something wrong with file_location");
    return "";
  }

  const text = fs.readFileSync(path.resolve(file_location, file_name), {
    encoding: "utf8",
    flag: "r",
  });

  return text;
};

export const getLimit = (): number => {
  const limitForDev = getEnv("LIMIT_QUESTIONS_FOR_DEVELOPMENT");
  const limitForProd = getEnv("LIMIT_QUESTIONS_FOR_PRODUCTION");

  return process.env.NODE_ENV === MODE.DEVELOPMENT ? +limitForDev : +limitForProd;
};

export const isProduction = () => {
  // console.log(process.env.NODE_ENV === MODE.PRODUCTION)
  return process.env.NODE_ENV === MODE.PRODUCTION;
};

export const michalSlugify = (...args: string[]) => {
  let str = args.join("-");

  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ęóąśłżźćńàáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to__ = "eoaslzzcnaaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to__.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  // replace ending with .html
  if (!str.endsWith(".html")) {
    str = str + ".html";
  }

  return str;
};
