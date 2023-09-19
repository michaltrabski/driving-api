const fs = require("fs-extra");
const path = require("path");

import { convertExcelToJson } from "./excelToJson";
import { getAllExams } from "./getAllExams";
import { getAllExplanations } from "./getAllExplanations";
import { getAllQuestionsAndCategories, QuestionFromExcel } from "./getAllQuestions";
import { getAllQuestionsWithExplanations } from "./getAllQuestionsWithExplanations";
import { AllQuestionsData, Explanation } from "./types";
import { normalizeABCTAKNIE, normalizeMediaName } from "./utils";

const SOURCE_DATA_FOLDER = "sourceData";

const EXCEL_NAME_1 = "baza_pytań_dla_mi_27_06_2023.xlsx";
const EXCEL_1_SHEET_NAME = "Arkusz1";

const EXCEL_NAME_2 = "Baza_pytań_na_egzamin_na_prawo_jazdy_22_02_2022r.xlsx";
const EXCEL_2_SHEET_NAME = "Treść pytania";

// michal - there is no score in excel1
enum EXCEL1 {
  LP = "Lp.",
  NUMER_PYTANIA = "Numer pytania",
  PYTANIE = "Pytanie",
  PYTANIE_ENG = "Pytanie ENG",
  PYTANIE_DE = "Pytanie DE",
  ODPOWIEDZ_A = "Odpowiedź A",
  ODPOWIEDZ_B = "Odpowiedź B",
  ODPOWIEDZ_C = "Odpowiedź C",
  POPRAWNA_ODP = "Poprawna odp",
  MEDIA = "Media",
  KATEGORIE = "Kategorie",
  ZRODLO_PYTANIA = "Źródło pytania",
  JAKI_MA_ZWIAZEK_Z_BEZPIECZENSTWEM = "Jaki ma związek z bezpieczeństwem",
}

enum EXCEL2 {
  NAZWA_PYTANIA = "Nazwa pytania",
  NUMER_PYTANIA = "Numer pytania",
  PYTANIE = "Pytanie",
  PYTANIE_ENG = "Pytanie ENG",
  PYTANIE_DE = "Pytanie DE",
  ODPOWIEDZ_A = "Odpowiedź A",
  ODPOWIEDZ_B = "Odpowiedź B",
  ODPOWIEDZ_C = "Odpowiedź C",
  POPRAWNA_ODP = "Poprawna odp",
  MEDIA = "Media",
  ZAKRES_STRUKTURY = "Zakres struktury",
  LICZBA_PUNKTOW = "Liczba punktów",
  KATEGORIE = "Kategorie",
  NAZWA_BLOKU = "Nazwa bloku",
  ZRODLO_PYTANIA = "Źródło pytania",
  O_CO_CHCEMY_ZAPYTAC = "O co chcemy zapytać",
  JAKI_MA_ZWIAZEK_Z_BEZPIECZENSTWEM = "Jaki ma związek z bezpieczeństwem",
  STATUS = "Status",
  PODMIOT = "Podmiot",
}

type Id = string;
export type RightAnswer = "a" | "b" | "c" | "t" | "n";

interface QuestionBigData {
  id: Id;
  isActive: boolean;
  text: string;
  textEn: string;
  textDe: string;
  a: string;
  b: string;
  c: string;
  r: RightAnswer;
  media: string;
  kategorie: string[];
  score: number;
  zrodloPytania: string;
  oCoChcemyZapytac: string;
  jakiMaZwiazekZBezpieczenstwem: string;
}

interface QuestionBigDataObject {
  [key: Id]: QuestionBigData;
}




export const extractExcelData = () => {
  const base = path.resolve(__dirname);
  const excelFile1 = path.resolve(base, "../", SOURCE_DATA_FOLDER, EXCEL_NAME_1);
  const excelFile2 = path.resolve(base, "../", SOURCE_DATA_FOLDER, EXCEL_NAME_2);

  // console.log({base,excel1})
  // console.log("excelFile2 ===", excelFile2);

  const excelJson1 = convertExcelToJson(excelFile1);
  const excelArray1 = excelJson1[EXCEL_1_SHEET_NAME] as any[];

  const excelJson2 = convertExcelToJson(excelFile2);
  const excelArray2 = excelJson2[EXCEL_2_SHEET_NAME] as any[];

  // console.log("excelArray1[0] ===", excelArray1[0]);
  // console.log("excelArray2[0] ===", excelArray2[0]);

  const questionBigDataObject1: QuestionBigDataObject = {};
  const questionBigDataObject2: QuestionBigDataObject = {};

  excelArray1
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .forEach((question) => {
      const id: Id = `id${question[EXCEL1.NUMER_PYTANIA]}`;
      const isActive = true;

      const questionBigData1: QuestionBigData = {
        id,
        isActive,
        text: question[EXCEL1.PYTANIE],
        textEn: question[EXCEL1.PYTANIE_ENG],
        textDe: question[EXCEL1.PYTANIE_DE],
        a: question[EXCEL1.ODPOWIEDZ_A],
        b: question[EXCEL1.ODPOWIEDZ_B],
        c: question[EXCEL1.ODPOWIEDZ_C],
        r: normalizeABCTAKNIE(question[EXCEL1.POPRAWNA_ODP]),
        media: normalizeMediaName(question[EXCEL1.MEDIA]),
        score: -1,
        kategorie: question[EXCEL1.KATEGORIE].toLowerCase().split(","),
        zrodloPytania: question[EXCEL1.ZRODLO_PYTANIA],
        oCoChcemyZapytac: "",
        jakiMaZwiazekZBezpieczenstwem: question[EXCEL1.JAKI_MA_ZWIAZEK_Z_BEZPIECZENSTWEM],
      };

      questionBigDataObject1[id] = questionBigData1;
    });

  // console.log("questionBigDataObject1 ===", questionBigDataObject1);

  excelArray2
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .forEach((question) => {
      const id: Id = `id${question[EXCEL2.NUMER_PYTANIA]}`;
      const isActive = false;

      const questionBigData2: QuestionBigData = {
        id,
        isActive,
        text: question[EXCEL2.PYTANIE],
        textEn: question[EXCEL2.PYTANIE_ENG],
        textDe: question[EXCEL2.PYTANIE_DE],
        a: question[EXCEL2.ODPOWIEDZ_A],
        b: question[EXCEL2.ODPOWIEDZ_B],
        c: question[EXCEL2.ODPOWIEDZ_C],
        r: normalizeABCTAKNIE(question[EXCEL2.POPRAWNA_ODP]),
        media: normalizeMediaName(question[EXCEL2.MEDIA]),
        kategorie: question[EXCEL2.KATEGORIE].toLowerCase().split(","),
        score: question[EXCEL2.LICZBA_PUNKTOW],
        zrodloPytania: question[EXCEL2.ZRODLO_PYTANIA],
        oCoChcemyZapytac: question[EXCEL2.O_CO_CHCEMY_ZAPYTAC],
        jakiMaZwiazekZBezpieczenstwem: question[EXCEL2.JAKI_MA_ZWIAZEK_Z_BEZPIECZENSTWEM],
      };

      questionBigDataObject2[id] = questionBigData2;
    });

  // console.log("questionBigDataObject2 ===", questionBigDataObject2);

  const questionBigDataArray: QuestionBigData[] = []
  return questionBigDataArray;
};
