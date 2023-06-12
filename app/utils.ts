import { getStyczen, getStyczniu, log } from "../ts/helpers";
import { resizeMedia } from "./createQuestionsMedia";
import { AllQuestionsData, Category, MODE, Question } from "./types";

const fs = require("fs-extra");
const path = require("path");
const slugify = require("slugify");
const cheerio = require("cheerio");
const pretty = require("pretty");
const request = require("request");
const md5 = require("md5");
const _ = require("lodash");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const FormData = require("form-data");

export const helpersLikeYear = () => {
  return {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    styczen: getStyczen(),
    styczniu: getStyczniu(),
  };
};

export const uploadProject = async (endpoint: string, buildLocation: string, statusFile: string) => {
  const mediaUploadStatuses = fs.readJsonSync(statusFile, { throws: false }) ?? {};

  for (const fileName of fs.readdirSync(buildLocation)) {
    const fileContentAsMd5 = md5(fs.readFileSync(path.join(buildLocation, fileName)));
    if (mediaUploadStatuses[fileName + "_" + fileContentAsMd5] !== true) {
      try {
        const res = await uploadToPhPserver(endpoint, buildLocation, fileName);
        console.log("FILE UPLOADED", fileName, res);
        mediaUploadStatuses[fileName + "_" + fileContentAsMd5] = true;
        fs.writeJsonSync(statusFile, mediaUploadStatuses);
      } catch (error) {
        console.log("FILE NOT UPLOADED", fileName, error);
      }
    } else {
      console.log(`FILE ALLREADY UPLOADED`, `-- fileName ==> ${fileName}`);
    }
  }
};

export const uploadMedia = async () => {
  const endpoint = getEnv("MEDIA_UPLOAD_ENDPOINT");
  const statusFile = getEnv("ABSOLUTE_PATH_TO_MEDIA_UPLOAD_STATUS_JSON");
  const mediaUploadStatuses = fs.readJsonSync(statusFile, { throws: false }) ?? {};

  const mediaLocation = getEnv("ABSOLUTE_PATH_FOLDER_FILES_AFTER_PROCESSING");

  for (const fileName of fs.readdirSync(mediaLocation)) {
    if (mediaUploadStatuses[fileName] !== true) {
      try {
        const res = await uploadToPhPserver(endpoint, mediaLocation, fileName);
        console.log("FILE UPLOADED", `-- fileName ==> ${fileName}`, res);
        mediaUploadStatuses[fileName] = true;
        fs.writeJsonSync(statusFile, mediaUploadStatuses);
      } catch (error) {
        console.log("ERROR FILE NOT UPLOADED", fileName, error);
      }
    } else {
      console.log(`FILE ALLREADY UPLOADED`, `-- fileName ==> ${fileName}`);
    }
  }
};

export const uploadToPhPserver = (endpoint: string, mediaLocation: string, fileName: string) => {
  return new Promise(async (resolve, reject) => {
    const fileWithPath = mediaLocation + "/" + fileName;

    // TODO 1 - check if file exists in mediaLocation
    if (!fs.existsSync(fileWithPath)) {
      reject({ message: `FILE NOT EXISTS ${fileWithPath}` });
      return;
    }

    // TODO 2 - check if file is not too big
    {
      const fileStatistics = fs.statSync(fileWithPath);
      const fileSizeInBytes = fileStatistics["size"];
      //Convert the file size to megabytes (optional)
      const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

      if (fileSizeInMegabytes > 6) {
        reject({ message: `FILE IS TOO BIG: ${fileWithPath}` });
        return;
      }
    }

    // const fileContentAsMd5 = md5(fs.readFileSync(fileWithPath));
    // if (mediaUploadStatus[fileName + "_" + fileContentAsMd5]) {
    //   resolve({ message: "FILE ALLREADY UPLOADED" });
    //   return;
    // }

    // TODO 3 - read file and add it to form data
    const readedFile = fs.readFileSync(fileWithPath);
    const form = new FormData();
    form.append("file", readedFile, fileName);

    // TODO 4 - send request to server
    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // TODO 5 - check if response is ok
    if (response.status === 200) {
      // mediaUploadStatus[fileName + "_" + fileContentAsMd5] = true;
      // fs.writeJsonSync("./media-upload-status.json", mediaUploadStatus);
      resolve({ uploadSuccess: true, message: "File uploaded", status: response.status });
    } else {
      reject({ message: `SERVER RESPONSE IS: ${response.status}` });
    }
  });
};

export const mediaNameWithoutExtention = (originalMediaName: string) => {
  return originalMediaName.split(".").slice(0, -1).join(".");
};

export const randomizeMediaName = (originalMediaName: string) => {
  const defaultImage = getEnv("PROJECT_1_DEFAULT_MEDIA_FILE");
  if (originalMediaName === defaultImage) {
    return originalMediaName;
  }

  const randomizeMediaName = md5(originalMediaName).slice(0, 10);
  const suffix = isVideo(originalMediaName) ? ".mp4" : ".png";

  return randomizeMediaName + suffix;
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

export const getHtmlElementFromHeaderById = (id: string) => {
  const folder = process.env.PROJECT_1_TEMPLATES ?? "";

  if (!folder) {
    throw new Error(`getHtmlElementFromHeaderById folder not found with id===${id}`);
  }

  const htmlAsText = fs.readFileSync(path.join(folder, "header.html"));
  const $ = cheerio.load(htmlAsText);
  const element = $(`#${id}`).prop("outerHTML");

  if (!element) {
    throw new Error(`getHtmlElementFromHeaderById element not found with id===${id}`);
  }

  return element;
};

export function updateTemplates(templatesLocation: string, buildLocation: string) {
  const templatesObj: any = {};

  const filenames = fs.readdirSync(templatesLocation);

  filenames.forEach((templateName: string) => {
    templatesObj[templateName] = readTextFileSync(templatesLocation, templateName);
  });

  // TODO - rafactor this

  const $HEADER = cheerio.load(templatesObj["header.html"]);
  // const $FOOTER = cheerio.load(templatesObj["header.html"]);

  const head = $HEADER("head").html();
  const app_selector = "body > #app";
  const navbar_selector = "body > #app > nav";
  // const navbar = $HEADER(navbar_selector).prop("outerHTML");

  const footer_selector = "body > #app > footer";
  // const footer = $HEADER(footer_selector).prop("outerHTML");

  const modal_selector = "body > #app #change-category-modal";
  // const modal = $HEADER(modal_selector).prop("outerHTML");

  const class_list_for_body_tag = $HEADER("body").attr("class");
  const class_list_for_main_tag = $HEADER("body > #app > main").attr("class");
  const class_list_for_main_div_tag = $HEADER("body > #app > main > div").attr("class");
  const htmlLang = $HEADER("html").attr("lang");

  filenames.forEach((templateName: string) => {
    if (templateName === "category.html") {
      // console.log("TEMPLATE category.html", "templateName ===", templateName);
      // console.log("templatesObj[templateName]===", templatesObj[templateName]);
    }

    const $ANY_TEMPLATE_PAGE = cheerio.load(templatesObj[templateName]);

    // 1. htaccess
    if (templateName === ".htaccess") {
      fs.copySync(path.resolve(templatesLocation, ".htaccess"), path.resolve(buildLocation, ".htaccess"));
      return;
    }

    // 1. Check if <div id="app"> tag exists in current html template
    const divApp = $ANY_TEMPLATE_PAGE(app_selector).prop("outerHTML");
    if (!divApp) {
      throw new Error(`there in no html like: ${app_selector} !!! => ${templateName}`);
    }

    // 2. Check if <main> tag exists in current html template
    const main_selector = "body #app main";
    const main = $ANY_TEMPLATE_PAGE(main_selector).prop("outerHTML");
    if (!main) {
      throw new Error(`there in no html like: ${main_selector} !!! => ${templateName}`);
    }

    // 3. Check if div tag exists inside <main> in current html template
    const main_div_selector = "body > #app > main > div";
    const main_div = $ANY_TEMPLATE_PAGE(main_div_selector).prop("outerHTML");
    if (!main_div) {
      throw new Error(`there in no html like: ${main_div_selector} !!! => ${templateName}`);
    }

    // 1. UPDATE head
    $ANY_TEMPLATE_PAGE("head").html(head);

    // 2. update class list
    $ANY_TEMPLATE_PAGE("body").attr("class", class_list_for_body_tag);
    $ANY_TEMPLATE_PAGE(main_selector).attr("class", class_list_for_main_tag);
    $ANY_TEMPLATE_PAGE(main_div_selector).attr("class", class_list_for_main_div_tag);
    $ANY_TEMPLATE_PAGE("html").attr("lang", htmlLang);

    let resultHtmlAsString = $ANY_TEMPLATE_PAGE.html();

    fs.writeFileSync(path.resolve(templatesLocation, templateName), prettyHtml(resultHtmlAsString));
  });
}

const prettyHtml = (html: string) => {
  return pretty(html, {
    ocd: true,
    indent_size: 2,
    indent_char: " ",
    unformatted: ["code", "pre"],
    indent_inner_html: true,
    preserve_newlines: false,
    max_preserve_newlines: 0,
    indent_scripts: "normal",
    keep_array_indentation: false,
    brace_style: "collapse",
    space_before_conditional: true,
    unescape_strings: false,
    wrap_line_length: 0,
    e4x: false,
    end_with_newline: false,
    extra_liners: ["html", "head", "body", "main", "button", "/button", "strong", "u", "a", "/a", "br"],
    eol: "\n",
    indent_handlebars: false,
    space_after_anon_function: true,
    space_after_named_function: true,
  });
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

// export const filterAndSortQuestionsDEPRECATED = (allQuestions: Question[], currentCategory: Category): Question[] => {
//   // 1. in this function I filter allQuestions by category to have them for specific category
//   const questions1 = allQuestions.filter((question) =>
//     question.question_belongs_to_categories.includes(currentCategory)
//   );

//   // 2. I generate md5 key to sort by it and have different order in different categories
//   const questions2 = questions1.map((question) => ({ ...question, md5: md5(`${currentCategory}${question.id}`) }));

//   // 3. I sort questions by md5 property
//   const questions3: Question[] = _.sortBy(questions2, ["md5"]);

//   // 4. I map questions again to give them number in right order
//   const questions4 = questions3.map((question, i) => ({ ...question, nr: i + 1 }));

//   return questions4;
// };

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
