const path = require("path");

import { convertExcelToJson } from "./excelToJson";
import { Id, QuestionFromExcel, RightAnswer } from "./types";

import { normalizeABCTAKNIE, normalizeMediaName } from "./utils";

const LIMIT = 9999999;
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

interface QuestionFromExcelBase {
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
  categories: string[];
  source: string; // what company created this question
  jakiMaZwiazekZBezpieczenstwem: string;
}

export interface QuestionFromExcel1 extends QuestionFromExcelBase {}

export interface QuestionFromExcel2 extends QuestionFromExcelBase {
  score: number;
  oCoChcemyZapytac: string;
}

interface ExcelObject1 {
  [key: Id]: QuestionFromExcel1;
}

interface ExcelObject2 {
  [key: Id]: QuestionFromExcel2;
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

  const excelObject1: ExcelObject1 = {};
  const excelObject2: ExcelObject2 = {};

  excelArray1
    .sort(() => Math.random() - 0.5)
    .slice(0, LIMIT)
    .forEach((question) => {
      const id: Id = `id${question[EXCEL1.NUMER_PYTANIA]}`;
      const isActive = true;

      const questionBigData1: QuestionFromExcel1 = {
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
        categories: question[EXCEL1.KATEGORIE].toLowerCase().split(","),
        source: question[EXCEL1.ZRODLO_PYTANIA],
        jakiMaZwiazekZBezpieczenstwem: question[EXCEL1.JAKI_MA_ZWIAZEK_Z_BEZPIECZENSTWEM],
      };

      excelObject1[id] = questionBigData1;
    });

  excelArray2
    .sort(() => Math.random() - 0.5)
    .slice(0, LIMIT)
    .forEach((question) => {
      const id: Id = `id${question[EXCEL2.NUMER_PYTANIA]}`;
      const isActive = false;

      const questionBigData2: QuestionFromExcel2 = {
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
        categories: question[EXCEL2.KATEGORIE].toLowerCase().split(","),
        score: +question[EXCEL2.LICZBA_PUNKTOW],
        source: question[EXCEL2.ZRODLO_PYTANIA],
        oCoChcemyZapytac: question[EXCEL2.O_CO_CHCEMY_ZAPYTAC],
        jakiMaZwiazekZBezpieczenstwem: question[EXCEL2.JAKI_MA_ZWIAZEK_Z_BEZPIECZENSTWEM],
      };

      excelObject2[id] = questionBigData2;
    });

  // console.log("questionBigDataObject1 ===", questionBigDataObject1);
  // console.log("questionBigDataObject2 ===", questionBigDataObject2);

  const ids1 = Object.keys(excelObject1);
  const ids2 = Object.keys(excelObject2);

  const ids = [...new Set([...ids1, ...ids2])];

  const questionsFromExcel: QuestionFromExcel[] = ids.map((id, index) => {
    const ex1 = excelObject1[id] as QuestionFromExcel1 | undefined;
    const ex2 = excelObject2[id] as QuestionFromExcel2 | undefined;

    // console.log(index, { ex1, ex2 });

    const ERROR = "ERROR - this should not happen";

    const mergedObject: QuestionFromExcel = {
      id: ex1?.id || ex2?.id || ERROR,
      isActive: ex1?.isActive || ex2?.isActive || false,
      text: ex1?.text || ex2?.text || "",
      textEn: ex1?.textEn || ex2?.textEn || "",
      textDe: ex1?.textDe || ex2?.textDe || "",
      a: ex1?.a || ex2?.a || "",
      b: ex1?.b || ex2?.b || "",
      c: ex1?.c || ex2?.c || "",
      r: (ex1?.r || ex2?.r || ERROR) as RightAnswer,
      media: ex1?.media || ex2?.media || "",
      categories: ex1?.categories || ex2?.categories || [],
      score: ex2?.score || 1, // 1 is default score because there is no score in excel1
      source: ex1?.source || ex2?.source || "",
      oCoChcemyZapytac: ex2?.oCoChcemyZapytac || "",
      jakiMaZwiazekZBezpieczenstwem: ex1?.jakiMaZwiazekZBezpieczenstwem || ex2?.jakiMaZwiazekZBezpieczenstwem || "",
    };

    return mergedObject;
  });

  return questionsFromExcel;
};
