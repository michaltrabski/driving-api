const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

import { log } from "../ts/helpers";
import {
  getEnv,
  isVideo,
  mediaNameWithoutExtention,
} from "./utils";

export const resizeMedia = async () => {
  const mediaWidth = +getEnv("TRANSFORMED_MEDIA_WIDTH");
  const inputFolder = path.resolve(__dirname, '../',getEnv("FOLDER_WITH_FILES_BEFORE_PROCESSING"))
  const outputFolder = path.resolve(__dirname, '../',getEnv("FOLDER_WITH_FILES_AFTER_PROCESSING"))

  fs.ensureDirSync(inputFolder);
  fs.ensureDirSync(outputFolder);
  console.log("inputFolder", inputFolder);

  // TASK 1 - start processing media
  for await (const originalFileName of fs.readdirSync(inputFolder)) {
    const ext = isVideo(originalFileName) ? ".mp4" : ".png";
    const newFileName = mediaNameWithoutExtention(originalFileName) + ext;
    const newFileNameWidthPath = path.resolve(outputFolder, newFileName);

    if (!fs.existsSync(newFileNameWidthPath)) {
      log("I TRY TO RESIZE THIS VIDEO / IMAGE",`originalFileName===${originalFileName}` , 
      `if there is an error maybe a file ${originalFileName} is broken, so remove this file maybe`,
      `Go to the folder: ${inputFolder}`,
      `and remove file: ${originalFileName}`
      
      )
      if (isVideo(originalFileName)) {
        // TASK 2 - process videos

        await resizeVideo(inputFolder, outputFolder, originalFileName, newFileName, mediaWidth);
      } else {
        // TASK 3 - process images
        const ImageObjectFromSharp = await sharp(path.resolve(inputFolder, originalFileName))
          .resize(mediaWidth)
          .png()
          .toBuffer();
        fs.writeFileSync(newFileNameWidthPath, ImageObjectFromSharp);
      }
    }
  }
  log(`ALL FILES RESIZED:`, `--- NEW WIDTH ==> ${mediaWidth}px`, `--- FROM FOLDER ==> ${inputFolder}`,`--- TO FOLDER ==> ${outputFolder}`);
};

const resizeVideo = async (
  inputFolder: string,
  outputFolder: string,
  originalFileName: string,
  newFileName: string,
  width: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileToProcess = path.resolve(inputFolder, originalFileName);

    const output = path.resolve(outputFolder, newFileName);

    ffmpeg.ffprobe(fileToProcess, (err: any, metaData: any) => {
      if (err) return console.log("error 246346745675", { fileToProcess, err });

      ffmpeg()
        .input(fileToProcess)
        // .inputOptions([`-ss ${start}`])
        // .outputOptions([`-t ${endMinusStart}`])
        .output(output)
        .on("end", () => resolve(newFileName))
        .on("error", (err: any) => reject())
        // .on("progress", (progress: any) => console.log(progress.percent, Math.floor(progress.percent) + "%"))
        // .videoCodec("libx264")
        // .videoBitrate(1000)
        // .fps(29.97)
        // .noAudio()
        .size(`${width}x?`)
        // .videoFilters("fade=in:0:30")
        // .videoFilters("fade=in:0:30", "pad=640:480:0:40:violet")
        .run();
    });
  });
};
