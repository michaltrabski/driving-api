import { AllQuestionsData, AllQuestionsDataSlim } from "../app/types";

// console log helper
export const log = (...args: any[]) => {
  console.log();
  args.forEach((arg) => {
    console.log(arg);
  });
  console.log();
  console.log();
};

export const _fetchAllQuestionsData = async (
  FETCH_ALLQUESTIONSDATA_ENDPOINT: string
): Promise<AllQuestionsDataSlim> => {
  try {
    const res = await fetch(FETCH_ALLQUESTIONSDATA_ENDPOINT);
    const allQuestionsData = await res.json();

    return allQuestionsData;
  } catch (err) {
    log(err);
    return {
      allQuestionsSlim: [],
    };
  }
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

export const getText = (id: string) => {
  const p = document.getElementById(id.toLowerCase()) as HTMLParagraphElement | null;
  return p?.innerText || "";
};

export const getTemplateForVue = () => {
  const footer = document.querySelector("footer");
  const htmlAsString = footer?.getAttribute("data-vue-template");

  return htmlAsString || "";
};

export const getBoolean = (id: string) => {
  const p = document.getElementById(id.toLowerCase()) as HTMLParagraphElement | null;
  return p?.innerText || "";
};

export const getNumber = (id: string) => {
  const p = document.getElementById(id.toLowerCase()) as HTMLParagraphElement | null;
  const number = p ? parseInt(p.innerText) : null;
  return number;
};

export const getArray = (id: string) => {
  try {
    const arr = getText(id).split(`,`);
    if (arr instanceof Array) {
      return arr;
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const sessionStorageSetNumber = (key: string, value: number) => {
  sessionStorage.setItem(key, value.toString());
};

export const sessionStorageGetNumber = (key: string): number | null => {
  try {
    const str = sessionStorage.getItem(key);
    if (!str) {
      return null;
    }

    const num = Number(str);
    if (num !== NaN) {
      return num;
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const sessionStorageSetText = (key: string, value: string) => {
  sessionStorage.setItem(key, value.toString());
};

export const sessionStorageGetText = (key: string): string => {
  try {
    return sessionStorage.getItem(key) || "";
  } catch (err) {
    return "";
  }
};

export const localStorageSetText = (key: string, value: string) => {
  localStorage.setItem(key, value.toString());
};

export const sessionStorageGetBoolean = (key: string): boolean | null => {
  try {
    const val = sessionStorage.getItem(key);
    if (!val) {
      return null;
    }
    return val === "true" ? true : false;
  } catch (err) {
    return null;
  }
};

export const sessionStorageSetBoolean = (key: string, value: boolean) => {
  sessionStorage.setItem(key, value.toString());
};

export const localStorageGetText = (key: string): string => {
  try {
    return localStorage.getItem(key) || "";
  } catch (err) {
    return "";
  }
};

export const sessionStorageSetObj = (
  key: string,
  value: {
    [key: string]: any;
  }
) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const sessionStorageGetObj = (key: string): { [key: string]: any } | null => {
  const str = sessionStorage.getItem(key);
  try {
    return JSON.parse(str || "");
  } catch (err) {
    return null;
  }
};

export const getStyczen = () => {
  return [
    "styczeń",
    "luty",
    "marzec",
    "kwiecień",
    "maj",
    "czerwiec",
    "lipiec",
    "sierpień",
    "wrzesień",
    "październik",
    "listopad",
    "grudzień",
  ][new Date().getMonth()];
};

export const getStyczniu = () => {
  return [
    "styczniu",
    "lutym",
    "marcu",
    "kwietniu",
    "maju",
    "czerwcu",
    "lipcu",
    "sierpniu",
    "wrześniu",
    "październiku",
    "listopadu",
    "grudniu",
  ][new Date().getMonth()];
};
