const fs = require("fs-extra");

const excel4 = require("../sourceData/questionsFromExcel042020.json");
const excel5 = require("../sourceData/questionsFromExcel052020.json");
const excel6 = require("../sourceData/questionsFromExcel27062023.json");
const expl360 = require("../sourceData/wyjasnienia360_08122023.json");

import { CHAT_GPT_ANSWERS } from "./askChatGpt";
import { NormalizedQuestionE4, NormalizedQuestionE5, NormalizedQuestionE6, QuestionBig } from "./types";

const TP = "Treść pytania";
const NR = "Numer pytania";

export const getQuestions = (): QuestionBig[] => {
  const { ids, e4, e5, e6 } = getQuestionsIds();

  console.log(111111111, {
    ids: ids.length,
    e4: e4.length,
    e5: e5.length,
    e6: e6.length,
  });

  const questions = ids.map((id) => {
    const q4 = e4.find((q) => q.id === id);
    const q5 = e5.find((q) => q.id === id);
    const q6 = e6.find((q) => q.id === id);

    const questionBig: QuestionBig = {
      id: "error",
      isActive: false,
      text: "error",
      textEn: "error",
      textDe: "error",
      a: "error",
      b: "error",
      c: "error",
      r: "error",
      media: "error",
      categories: ["error"],
      score: -1,
      questionSource: "error",
      relationToSafety: "error",
      explanationTesty360: "",
    };

    if (q6) {
      questionBig.id = q6.id;
      questionBig.isActive = true;
      questionBig.text = q6.text;
      questionBig.textEn = q6.textEn;
      questionBig.textDe = q6.textDe;
      questionBig.a = q6.a;
      questionBig.b = q6.b;
      questionBig.c = q6.c;
      questionBig.r = q6.r;
      questionBig.media = q6.media;
      questionBig.categories = q6.categories;
      questionBig.score = q5?.score || q4?.score || 3; // there is no score in excel6
      questionBig.questionSource = q6.questionSource;
      questionBig.relationToSafety = q6.relationToSafety;
      questionBig.explanationTesty360 = findExplanationTesty360ByText(q6.text);

      const explanationGpt3 = fs.readJsonSync(`${CHAT_GPT_ANSWERS}/${q6.id}.json`, {
        throws: false,
      });

      if (explanationGpt3 && explanationGpt3.answer) {
        const ans = explanationGpt3.answer;
        const shortExplanation = ans.match(/shortExplanation:([\s\S]*?)longExplanation:/gi);
        const longExplanation = ans.match(/longExplanation:([\s\S]*?)textSeo:/gi);
        const textSeo = ans.match(/textSeo:([\s\S]*?)$/gi);

        console.log(ans, shortExplanation, longExplanation, textSeo);

        questionBig.explanationGpt3 = {
          shortExplanation: shortExplanation
            ? shortExplanation[0]
                .replace("shortExplanation:", "")
                .replace(/\n/g, "")
                .replace("longExplanation:", "")
                .trim()
            : "",
          longExplanation: longExplanation
            ? longExplanation[0].replace("longExplanation:", "").replace(/\n/g, "").replace("textSeo:", "").trim()
            : "",
          textSeo: textSeo ? textSeo[0].replace("textSeo:", "").replace(/\n/g, "").trim() : "",
          other: ans,
        };
      }

      return questionBig;
    }

    if (q5) {
      questionBig.id = q5.id;
      questionBig.isActive = false;
      questionBig.text = q5.text;
      questionBig.textEn = q5.textEn;
      questionBig.textDe = q5.textDe;
      questionBig.a = q5.a;
      questionBig.b = q5.b;
      questionBig.c = q5.c;
      questionBig.r = q5.r;
      questionBig.media = q5.media;
      questionBig.categories = q5.categories;
      questionBig.score = q5.score;
      questionBig.questionSource = "";
      questionBig.relationToSafety = "";
      questionBig.explanationTesty360 = findExplanationTesty360ByText(q5.text);

      return questionBig;
    }

    if (q4) {
      questionBig.id = q4.id;
      questionBig.isActive = false;
      questionBig.text = q4.text;
      questionBig.textEn = q4.textEn;
      questionBig.textDe = q4.textDe;
      questionBig.a = q4.a;
      questionBig.b = q4.b;
      questionBig.c = q4.c;
      questionBig.r = q4.r;
      questionBig.media = q4.media;
      questionBig.categories = q4.categories;
      questionBig.score = q4.score;
      questionBig.questionSource = "";
      questionBig.relationToSafety = "";
      questionBig.explanationTesty360 = findExplanationTesty360ByText(q4.text);

      return questionBig;
    }

    return questionBig;
  });

  return questions;
};

export const getQuestionsIds = () => {
  const e4 = normalizeExcel4Questions();
  const e5 = normalizeExcel5Questions();
  const e6 = normalizeExcel6Questions();

  const ids = Array.from(new Set([...e6.map((q) => q.id), ...e5.map((q) => q.id), ...e4.map((q) => q.id)]));

  return { ids, e4, e5, e6 };
};

export const normalizeExcel4Questions = (): NormalizedQuestionE4[] => {
  const excel4NormalizedQuestions = excel4[TP].map(
    (q: {
      "Numer pytania": string;
      Pytanie: string;
      "Odpowiedź A": string;
      "Odpowiedź B": string;
      "Odpowiedź C": string;
      "Pytanie ENG": string;
      "Odpowiedź ENG A": string;
      "Odpowiedź ENG B": string;
      "Odpowiedź ENG C": string;
      "Pytanie DE": "Bist du in der dargestellten Situation dazu verpflichtet, das Fahrzeug anzuhalten?";
      "Odpowiedź DE A": string;
      "Odpowiedź DE B": string;
      "Odpowiedź DE C": string;
      "Poprawna odp": string;
      Media: string;
      "Zakres struktury": string;
      "Liczba punktów": string;
      Kategorie: string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp B": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp C": string;
    }) => {
      const excel4NormalizedQuestion: NormalizedQuestionE4 = {
        id: `id${q[NR]}`,
        text: q["Pytanie"],
        textEn: q["Pytanie ENG"],
        textDe: q["Pytanie DE"],
        a: q["Odpowiedź A"],
        b: q["Odpowiedź B"],
        c: q["Odpowiedź C"],
        r: normalizeRightAnswer(q["Poprawna odp"]),
        media: normalizeMediaName(q["Media"]),
        categories: q["Kategorie"].toLowerCase().split(","),
        score: +q["Liczba punktów"],
      };

      return excel4NormalizedQuestion;
    }
  );

  return excel4NormalizedQuestions;
};

export const normalizeExcel5Questions = (): NormalizedQuestionE5[] => {
  const excel5NormalizedQuestions = excel5[TP].map(
    (q: {
      "Numer pytania": string;
      Pytanie: string;
      "Odpowiedź A": string;
      "Odpowiedź B": string;
      "Odpowiedź C": string;
      "Pytanie ENG": string;
      "Odpowiedź ENG A": string;
      "Odpowiedź ENG B": string;
      "Odpowiedź ENG C": string;
      "Pytanie DE": string;
      "Odpowiedź DE A": string;
      "Odpowiedź DE B": string;
      "Odpowiedź DE C": string;
      "Poprawna odp": string;
      Media: string;
      "Zakres struktury": string;
      "Liczba punktów": string;
      Kategorie: string;
      "Nazwa bloku": string;
      "Nazwa media tłumaczenie migowe (PJM) treść pyt": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp A": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp B": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp C": string;
    }) => {
      const normalizedQuestionE5: NormalizedQuestionE5 = {
        id: `id${q[NR]}`,
        text: q["Pytanie"],
        textEn: q["Pytanie ENG"],
        textDe: q["Pytanie DE"],
        a: q["Odpowiedź A"],
        b: q["Odpowiedź B"],
        c: q["Odpowiedź C"],
        r: normalizeRightAnswer(q["Poprawna odp"]),
        media: normalizeMediaName(q["Media"]),
        categories: q["Kategorie"].toLowerCase().split(","),
        score: +q["Liczba punktów"],
      };

      return normalizedQuestionE5;
    }
  );

  return excel5NormalizedQuestions;
};

export const normalizeExcel6Questions = (): NormalizedQuestionE6[] => {
  // it cant get type from file because it is too big file!!
  const excel6NormalizedQuestions = excel6["Arkusz1"].map(
    (q: {
      "Lp.": string;
      "Numer pytania": string;
      Pytanie: string;
      "Odpowiedź A": string;
      "Odpowiedź B": string;
      "Odpowiedź C": string;
      "Pytanie ENG": string;
      "Odpowiedź ENG A": string;
      "Odpowiedź ENG B": string;
      "Odpowiedź ENG C": string;
      "Pytanie DE": string;
      "Odpowiedź DE A": string;
      "Odpowiedź DE B": string;
      "Odpowiedź DE C": string;
      "Poprawna odp": string;
      Media: string;
      Kategorie: string;
      "Źródło pytania": string;
      "Jaki ma związek z bezpieczeństwem": string;
      "Nazwa media tłumaczenie migowe (PJM) treść pyt": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp A": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp B": string;
      "Nazwa media tłumaczenie migowe (PJM) treść odp C": string;
    }) => {
      return {
        id: `id${q[NR]}`,
        text: q["Pytanie"],
        textEn: q["Pytanie ENG"],
        textDe: q["Pytanie DE"],
        a: q["Odpowiedź A"],
        b: q["Odpowiedź B"],
        c: q["Odpowiedź C"],
        r: normalizeRightAnswer(q["Poprawna odp"]),
        media: normalizeMediaName(q["Media"]),
        categories: q["Kategorie"].toLowerCase().split(","),
        questionSource: q["Źródło pytania"],
        relationToSafety: q["Jaki ma związek z bezpieczeństwem"],
      };
    }
  );

  return excel6NormalizedQuestions;
};

const normalizeMediaName = (fileName: string) => {
  if (fileName.toLowerCase().endsWith(".wmv")) {
    return fileName.replace(".wmv", ".mp4").replace(".WMV", ".mp4");
  }
  if (fileName.toLowerCase().endsWith(".jpg")) {
    return fileName.replace(".jpg", ".png").replace(".JPG", ".png");
  }
  if (fileName === "") {
    return fileName;
  }

  console.log("CHECK THIS MEDIA FILE NAME", fileName);
  return fileName;
};

const normalizeRightAnswer = (r: string) => {
  if (r.toLowerCase() === "tak" || r.toLowerCase() === "t") {
    return "t";
  }

  if (r.toLowerCase() === "nie" || r.toLowerCase() === "n") {
    return "n";
  }

  if (r.toLowerCase() === "a") {
    return "a";
  }
  if (r.toLowerCase() === "b") {
    return "b";
  }
  if (r.toLowerCase() === "c") {
    return "c";
  }

  console.log("CHECK RIGHT ANSWER", r);
  return r;
};

const findExplanationTesty360ByText = (text: string) => {
  const expl360Arr: {
    idFromTesty360: string;
    text: string;
    topic: string;
    explanationTesty360: string;
  }[] = Object.values(expl360);

  const expl = expl360Arr.find((expl) => expl.text === text);

  if (!expl) {
    return "";
  }

  return expl.explanationTesty360;
};
// // import { RightAnswer } from "./types";

// // const fs = require("fs-extra");
// // const path = require("path");

export function getPhpCode(fileName: string) {
  return `<?php
              header('Content-Type: application/json');
              header('Access-Control-Allow-Origin: *');
              header('Access-Control-Allow-Methods: GET, POST');
              header('Access-Control-Allow-Headers: Content-Type');

              $jsonData = file_get_contents('${fileName}.json');

              echo $jsonData;`;
}

// // export function getHtmlCode(objAsString: string) {
// //   return objAsString;
// // }

// // export function textToSlug(text: string, id: string) {
// //   let slug = `${text.slice(0, 160)}-id-pytania-${id.replace("id", "")}`;

// //   slug = slug.replace(/^\s+|\s+$/g, ""); // trim
// //   slug = slug.toLowerCase();

// //   // remove accents, swap ñ for n, etc
// //   var from = "ęóąśłżźćńàáäâèéëêìíïîòóöôùúüûñç·/_,:;";
// //   var to__ = "eoaslzzcnaaaaeeeeiiiioooouuuunc------";
// //   for (var i = 0, l = from.length; i < l; i++) {
// //     slug = slug.replace(new RegExp(from.charAt(i), "g"), to__.charAt(i));
// //   }

// //   slug = slug
// //     .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
// //     .replace(/\s+/g, "-") // collapse whitespace and replace by -
// //     .replace(/-+/g, "-"); // collapse dashes

// //   return slug;
// // }

// // export function convertMediaNameToPngOrMp4(mediaName: string) {
// //   if (mediaName.endsWith(".jpg")) {
// //     return mediaName.replace(".jpg", ".png");
// //   }
// //   if (mediaName.endsWith(".JPG")) {
// //     return mediaName.replace(".JPG", ".png");
// //   }
// //   if (mediaName.endsWith(".jpeg")) {
// //     return mediaName.replace(".jpeg", ".png");
// //   }
// //   if (mediaName.endsWith(".JPEG")) {
// //     return mediaName.replace(".JPEG", ".png");
// //   }
// //   if (mediaName.endsWith(".wmv")) {
// //     return mediaName.replace(".wmv", ".mp4");
// //   }

// //   return mediaName;
// // }

// // export const getEnv = (variableName: string) => {
// //   if (variableName === undefined) {
// //     console.log(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
// //     throw new Error(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
// //   }

// //   if (process.env[variableName] === undefined) {
// //     console.log(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
// //     throw new Error(`ERROR: ENV VARIABLE: ${variableName} is not set in .env file`);
// //   }

// //   return process.env[variableName] ?? string;
// // };

// // export function isVideo(fileName: string) {
// //   const videoExtensions = [".wmv", ".mp4", ".WMV", ".MP4"];

// //   return videoExtensions.some((ext) => fileName.endsWith(ext));
// // }
// // export function mediaNameWithoutExtention(mediaName: string) {
// //   return mediaName.split(".").slice(0, -1).join(".");
// // }

// // export function normalizeABCTAKNIE(answer: string): RightAnswer | never {
// //   if (answer.toLowerCase() === "tak" || answer.toLowerCase() === "t") {
// //     return "t";
// //   }
// //   if (answer.toLowerCase() === "nie" || answer.toLowerCase() === "n") {
// //     return "n";
// //   }
// //   if (answer.toLowerCase() === "a") {
// //     return "a";
// //   }
// //   if (answer.toLowerCase() === "b") {
// //     return "b";
// //   }
// //   if (answer.toLowerCase() === "c") {
// //     return "c";
// //   }

// //   throw new Error(`ERROR: normalizeABCTAKNIE: answer: ${answer} is not valid`);
// // }
export function reverseNormalizeABCTAKNIE(answer: string): string | never {
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

// // export function normalizeMediaName(mediaName: string) {
// //   if (mediaName === "") {
// //     return string;
// //   }

// //   if (mediaName.endsWith(".jpg") || mediaName.endsWith(".JPG") || mediaName.endsWith(".jpeg") || mediaName.endsWith(".JPEG")) {
// //     // replace last occurence of .jpg
// //     return mediaName.replace(/\.jpg(?!.*\.jpg)/, ".png");
// //   }

// //   if (mediaName.endsWith(".wmv") || mediaName.endsWith(".WMV")) {
// //     // replace last occurence of .wmv
// //     return mediaName.replace(/\.wmv(?!.*\.wmv)/, ".mp4");
// //   }

// //   throw new Error(`ERROR: normalizeMediaName: mediaName: ${mediaName} is not valid`);
// // }

// // export const isAnswerYesNo = (r: RightAnswer) => r === "t" || r === "n";
// // export const IsAnswerABC = (r: RightAnswer) => r === "a" || r === "b" || r === "c";
