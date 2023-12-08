import { RightAnswer } from "./types";


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

export function getHtmlCode(objAsString: string) {
  return objAsString;
}

export function textToSlug(text: string, id: string) {
  let slug = `${text.slice(0, 160)}-id-pytania-${id.replace("id", "")}`;

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

export function isVideo(fileName: string) {
  const videoExtensions = [".wmv", ".mp4", ".WMV", ".MP4"];

  return videoExtensions.some((ext) => fileName.endsWith(ext));
}
export function mediaNameWithoutExtention(mediaName: string) {
  return mediaName.split(".").slice(0, -1).join(".");
}

export function normalizeABCTAKNIE(answer: string): RightAnswer | never {
  if (answer.toLowerCase() === "tak" || answer.toLowerCase() === "t") {
    return "t";
  }
  if (answer.toLowerCase() === "nie" || answer.toLowerCase() === "n") {
    return "n";
  }
  if (answer.toLowerCase() === "a") {
    return "a";
  }
  if (answer.toLowerCase() === "b") {
    return "b";
  }
  if (answer.toLowerCase() === "c") {
    return "c";
  }

  throw new Error(`ERROR: normalizeABCTAKNIE: answer: ${answer} is not valid`);
}
export function reverseNormalizeABCTAKNIE(answer: RightAnswer): string | never {
  if (answer === "t") {
    return "tak";
  }
  if (answer === "n") {
    return "nie";
  }
  if (answer === "a") {
    return "a";
  }
  if (answer === "b") {
    return "b";
  }
  if (answer === "c") {
    return "c";
  }

  throw new Error(`ERROR: reverseNormalizeABCTAKNIE: answer: ${answer} is not valid`);
}


export function normalizeMediaName(mediaName: string) {
  if (mediaName === "") {
    return "";
  }

  if (mediaName.endsWith(".jpg") || mediaName.endsWith(".JPG") || mediaName.endsWith(".jpeg") || mediaName.endsWith(".JPEG")) {
    // replace last occurence of .jpg
    return mediaName.replace(/\.jpg(?!.*\.jpg)/, ".png");
  }

  if (mediaName.endsWith(".wmv") || mediaName.endsWith(".WMV")) {
    // replace last occurence of .wmv
    return mediaName.replace(/\.wmv(?!.*\.wmv)/, ".mp4");
  }

  throw new Error(`ERROR: normalizeMediaName: mediaName: ${mediaName} is not valid`);
}


export const isAnswerYesNo = (r: RightAnswer) => r === "t" || r === "n";
export const IsAnswerABC = (r: RightAnswer) => r === "a" || r === "b" || r === "c";
