 
import extract from "extract-zip";
 
import { PageType } from "./types";
import { getEnv, isProduction, readTextFileSync } from "./utils";

const fs = require("fs-extra");
const path = require("path");
 

const listOfMediaExtensionsFoundInZipFolders = new Set();

export const unzip = async () => {
  const folderWithZippedFiles = path.resolve(__dirname, '../',getEnv("FOLDER_WITH_ZIPPED_FILES"))

  const unzipToFolder = path.resolve(__dirname, '../', getEnv("FOLDER_WITH_FILES_BEFORE_PROCESSING"))
  fs.ensureDirSync(unzipToFolder);

 
 console.log("1 take zipped files from folder folderWithZippedFiles:",folderWithZippedFiles, "2 and unzip them to folder unzipToFolder", unzipToFolder);
  await unzipFiles(folderWithZippedFiles, unzipToFolder);
  console.log(`ALL FILES UNZIPED:`, `--- FROM FOLDER ==> ${folderWithZippedFiles}`,`--- TO FOLDER ==> ${unzipToFolder}`);
};

async function extractZip(source: string, target: string) {
  try {
    await extract(source, { dir: target });
    // console.log("extractZip() ==> Extraction complete");
  } catch (err) {
    console.log("Oops: extractZip failed", err);
  }
}

const unzipFiles = async function (unzipFrom: string, unzipTo: string) {
  const files = fs.readdirSync(unzipFrom);

  await Promise.all(
    files.map(async (file: any) => {
      if (fs.statSync(unzipFrom + "/" + file).isDirectory()) {
        await unzipFiles(unzipFrom + "/" + file, unzipTo);
      } else {
        const fullFilePath = path.join(unzipFrom, "/", file);
        const folderName = file.replace(".zip", "");
        if (file.endsWith(".zip")) {
          const unzippedFilesTo = path.join(unzipFrom, "/", folderName);
          await extractZip(fullFilePath, unzippedFilesTo);
          // log("FILES UNZIPPED TO FOLDER ==>", path.resolve(unzippedFilesTo));


          for (const fileName of fs.readdirSync(unzippedFilesTo)) {
            const fileExtension = fileName.split(".").pop();
            listOfMediaExtensionsFoundInZipFolders.add(fileExtension);

            if ([".jpg", ".png", ".wmv", ".mp4"].some((ext) => fileName.toLowerCase().endsWith(ext))) {
              const extension = fileName.split(".").pop();
              const newFileName = fileName.replace(extension, extension.toLowerCase());
              fs.copySync(path.resolve(unzippedFilesTo, fileName), path.resolve(unzipTo, newFileName));
            }
          }

          console.log("FILES COPIED TO FOLDER ==>", unzipTo);
          console.log("listOfMediaExtensionsFoundInZipFolders ==>", listOfMediaExtensionsFoundInZipFolders);

          await unzipFiles(path.join(unzipFrom, "/", folderName), unzipTo);
        }
      }
    })
  );
};