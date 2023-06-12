import { attr } from "cheerio/lib/api/attributes";
import { getStyczen, getStyczniu, log } from "../ts/helpers";
import {
  PageData,
  PageType,
  PAGE_TYPE,
  PostFromOldWordpress,
  QuestionData,
  SimpleNotNestedObject,
  TechnicalPageData,
  TEMPLATE_FILE_NAME,
} from "./types";
import { getHtmlElementFromHeaderById, readTextFileSync } from "./utils";

const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const templateObj: { [key: string]: string } = {};

// export interface CreatePage {
//   page_type: PageType,
//   PROJECT_LOCATION: string,
//   PROJECT_BUILD_LOCATION: string,
//   slug: string,
//   template_name: string,
//   page_data: any,
//   extra_data: any
// }

export const newCreatePage = (
  templatesLocation: string,
  buildLocation: string,
  templateName: string,
  slug: string,
  data: SimpleNotNestedObject
) => {
  // if (templateName === TEMPLATE_FILE_NAME.QUESTION) {
  //   console.log("newCreatePage() => ", templatesLocation, buildLocation, templateName, slug, data);
  // }

  // TASK 1 - put all templates in one object - so I get html as string inside templateObj
  if (!templateObj[templateName]) {
    templateObj[templateName] = readTextFileSync(templatesLocation, templateName);
  }
  templateObj["header.html"] = readTextFileSync(templatesLocation, "header.html");

  let templateHtmlAsString = templateObj[templateName];

  // replace htmlpageelements first
  {
    const htmlPageElements = {
      navbar: getHtmlElementFromHeaderById("navbar"),
      footer: getHtmlElementFromHeaderById("footer"),
      right_sidebar: getHtmlElementFromHeaderById("right_sidebar"),
    };

    Object.entries(htmlPageElements).forEach(([key, val]) => {
      const regex1 = new RegExp(`\\[\\[${key}\\]\\]`, "g");

      // console.log(888888888888,key, val, templateHtmlAsString.match(regex2))

      templateHtmlAsString = templateHtmlAsString.replace(regex1, (val as string).toString());
    });
  }

  // fs.outputFileSync(path.resolve(`${buildLocation}${slug}`), templateHtmlAsString);
  // return

  // TASK 2 - make michal loop inside html M-LOOP
  {
    // if there is something dynamic inside m-loop="[[key_from_data_object]]" replace that before executing loop
    Object.entries(data).forEach(([key, val]) => {
      const regex1 = new RegExp(`m-loop=\\"\\[\\[${key}\\]\\]\\"`, "g");
      const valAsString = `m-loop="` + (val as string).toString() + `"`;

      // console.log(888888888888,key, val, templateHtmlAsString.match(regex1))

      templateHtmlAsString = templateHtmlAsString.replace(regex1, valAsString);

      // console.log(888888888888,templateHtmlAsString)
    });

    const $ = cheerio.load(templateHtmlAsString);
    const elements = $("[m-loop]");
    elements.each(function (index: number, el: HTMLElement) {
      const htmlContentAsString = $(el).html();
      const arrToLoopAsString = $(el).attr()["m-loop"];

      let str = "";
      if (arrToLoopAsString) {
        arrToLoopAsString.split(",").forEach((_item: string) => {
          const item = _item.trim();

          str += htmlContentAsString
            .replace(new RegExp("xxx", "g"), item.toLowerCase())
            .replace(new RegExp("XXX", "g"), item.toUpperCase())
            .replace(new RegExp("Xxx", "g"), item[0].toUpperCase() + item.slice(1).toLowerCase());
        });
      }
      templateHtmlAsString = templateHtmlAsString.replace(htmlContentAsString, str);
    });
  }

  // console.log(555555555, templateHtmlAsString);

  // TASK 2 - replace all data that is inside double square brackets, example: [[my_name]] will be replaced with "Piotr"
  Object.entries(data).forEach(([key, val]) => {
    const regex1 = new RegExp(`\\[\\[${key}\\]\\]`, "g");
    const regex2 = new RegExp(`\\[\\[${key}\\.toUpperCase\\(\\)\\]\\]`, "g");

    const regex3 = new RegExp(`\\_\\_${key}\\_\\_\\=\\"\\"`, "g"); // replace tag: __video_autoplay__="" to controls="true"

    // console.log(888888888888,key, val, templateHtmlAsString.match(regex2))

    templateHtmlAsString = templateHtmlAsString
      .replace(regex1, (val as string).toString())
      .replace(regex2, (val as string).toString().toUpperCase())
      .replace(regex3, (val as string).toString());
  });

  // TASK 3 - replace all data that is inside double curly brackets, example: {{year}} will be replaced with "2022"
  Object.entries(data).forEach(([key, val]) => {
    const regex1 = new RegExp(`{{${key}}}`, "g");
    const valAsString = (val as string).toString();
    // const regex2 = new RegExp(`{{${key}\\.toUpperCase\\(\\)}}`, "g");

    // if (key === "goodAns") {
    //   console.log("TASK 3 - replace all dynamic data |", key, "|", val, "|", templateHtmlAsString.match(regex1));
    // }
  
    // i have replace values for just html not for vue template
    templateHtmlAsString = templateHtmlAsString
      // .replace(regex1, (val as string).toString())
      .replace(
        regex1,
        `<span v-show="!isVueLoaded" key="${key}">${valAsString}</span><span class="__none" :class="{__inline:true}" data-vue-variable-${key}="${valAsString}">{{${key}}}</span>`
      );
    // .replace(regex2, (val as string).toString().toUpperCase());
  });

  {
    const $ = cheerio.load(templateHtmlAsString);

    ["m-if", "m-text", "m-src", "m-href"].forEach((attrName) => {
      const htmlElements = $(`[${attrName}]`);

      htmlElements.each((index: number, el: HTMLElement) => {
        const key = $(el).attr(`${attrName}`); // m-if="key" so key in data object is taken from attr value
        const value = data[key as keyof TechnicalPageData]; // value in data object

        // if (attrName === "m-if") {
        //   console.log(index, " | ", key, " | ", value);
        // }

        const negation = key[0] === "!";
        const newKey = key.slice(1);
        const newValue = data[newKey as keyof TechnicalPageData]; // value in data object

        if (attrName === "m-if" && negation && newValue) return $(el).remove();
        if (attrName === "m-if" && !negation && !value) return $(el).remove();
        if (attrName === "m-text" && value) {
          if (value instanceof Array) return $(el).text(value.join(", "));
          if (typeof value === "number") return $(el).text((value as number).toString());
          if (typeof value === "string") return $(el).text(value as string);
          return $(el).text(JSON.stringify(value));
        }
        if (attrName === "m-src" && value) $(el).attr("src", value);
        if (attrName === "m-href" && value) $(el).attr("href", value);
      });
    });

    templateHtmlAsString = $.html();
  }
  // console.log("templateObj", templateObj[templateName]);

  fs.outputFileSync(path.resolve(`${buildLocation}${slug}`), templateHtmlAsString);

  // 10. page is created, just return slug
  return slug;
};
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

// export const createPage = (
//   pageType: PageType | PAGE_TYPE,
//   PROJECT_LOCATION: string | undefined, // because it is from .env file
//   PROJECT_BUILD_LOCATION: string | undefined, // because it is from .env file
//   slug: string,
//   templateName: string,
//   questionData: QuestionData | { question_data_keys: "" },
//   pageData: PageData,
//   dataXxx?: SimpleNotNestedObject,
//   allCreatedPages?: string[] | null,
//   postFromOldWordpress?: PostFromOldWordpress | null
// ) => {
//   // CHECK 1
//   if (!PROJECT_LOCATION) {
//     throw Error("there is something wrong with PROJECT_LOCATION");
//   }

//   // CHECK 2
//   if (!PROJECT_BUILD_LOCATION) {
//     throw Error("there is something wrong with PROJECT_BUILD_LOCATION");
//   }

//   // CHECK 3
//   if (!templateName) {
//     throw Error("there is something wrong with templateName");
//   }

//   // TASK 1 - put all templates in one object - so I get html as string inside templateObj
//   if (!templateObj[templateName]) {
//     templateObj[templateName] = readTextFileSync(path.resolve(PROJECT_LOCATION, "templates"), templateName);
//   }
//   templateObj["header.html"] = readTextFileSync(path.resolve(PROJECT_LOCATION, "templates"), "header.html");

//   // TASK 2 - get current template html as string
//   let html = templateObj[templateName];

//   if (templateName === "index.html") {
//     console.log("INDEX.HTML TEMPLATE FILE LOOKS LIKE THIS", "templates/index.html===", html);
//   }

//   // TASK 3 - find all elements inside [[double brackets]] inside current template file
//   const snippets = html.match(/\[\[(.*?)\]\]/g);
//   const trimedSnippets = snippets?.map((snippet: string) => snippet.replace(/\[\[/g, "").replace(/\]\]/g, ""));

//   trimedSnippets?.forEach((snippet: string) => {
//     // snippets are located inside templates/header.html and I look for them by id
//     // example: if I have [[navbar]] then I will get content of element with id="navbar" from templates/header.html file
//     const snippetHtml = cheerio.load(templateObj["header.html"])(`#${snippet}`).prop("outerHTML");

//     if (snippetHtml) {
//       html = html.replace(`[[${snippet}]]`, snippetHtml);
//     }
//   });

//   let htmlTemplateAsString_999 = html;
//   // console.log(7777777777, htmlTemplateAsString_0);

//   // Object.entries(dataXxx).forEach(([key, val]) => {
//   //   console.log(888888888888,key, val);
//   //   const regex1 = new RegExp(`{{${key}}}`, "g");
//   //   htmlTemplateAsString_999 = htmlTemplateAsString_999
//   //     .replace(regex1, (val as string).toString())
//   // });

//   const allData: SimpleNotNestedObject = {
//     // all items belowe must be insluded in main.ts and createPage() function
//     year: new Date().getFullYear(),
//     month: new Date().getMonth() + 1,
//     styczen: getStyczen(),
//     styczniu: getStyczniu(),
//     ...pageData,
//     ...questionData, // there is bug with questionHtml - you cant spread it if it is null
//   };

//   let htmlTemplateAsString_0 = htmlTemplateAsString_999;
//   // console.log(7777777777, htmlTemplateAsString_0);

//   Object.entries(allData).forEach(([key, val]) => {
//     // console.log(888888888888,allData.page_data_keys);
//     const regex1 = new RegExp(`{{${key}}}`, "g");
//     const regex2 = new RegExp(`{{${key}.toUpperCase\\(\\)}}`, "g");
//     htmlTemplateAsString_0 = htmlTemplateAsString_0
//       .replace(regex1, (val as string).toString())
//       .replace(regex2, (val as string).toString().toUpperCase());
//   });

//   if (postFromOldWordpress) {
//     Object.entries(postFromOldWordpress).forEach(([key, val]) => {
//       const regex1 = new RegExp(`{{${key}}}`, "g");
//       const regex2 = new RegExp(`{{${key}.toUpperCase\\(\\)}}`, "g");
//       htmlTemplateAsString_0 = htmlTemplateAsString_0
//         .replace(regex1, (val as string).toString())
//         .replace(regex2, (val as string).toString().toUpperCase());
//     });
//   }

//   // console.log(7777777777, htmlTemplateAsString_0);
//   // 5. replace strings in html taken as string

//   let templateHtmlAsTextBeforeLoop = htmlTemplateAsString_0;
//   const $template = cheerio.load(htmlTemplateAsString_0);

//   // console.log(88888888888888, $template.html());

//   // M-LOOP
//   const elements = $template("[m-loop]");
//   elements.each(function (index: number, el: HTMLElement) {
//     const htmlContentAsString = $template(el).html();
//     const arrToLoopAsString = $template(el).attr()["m-loop"];

//     let str = "";
//     if (arrToLoopAsString) {
//       arrToLoopAsString.split(",").forEach((_item: string) => {
//         const item = _item.trim();

//         str += htmlContentAsString
//           .replace(new RegExp("xxx", "g"), item.toLowerCase())
//           .replace(new RegExp("XXX", "g"), item.toUpperCase())
//           .replace(new RegExp("Xxx", "g"), item[0].toUpperCase() + item.slice(1).toLowerCase());
//       });
//     }
//     templateHtmlAsTextBeforeLoop = templateHtmlAsTextBeforeLoop.replace(htmlContentAsString, str);
//   });
//   // console.log(1, templateHtmlAsTextBeforeLoop);

//   const templateHtmlAsTextAfterLoop = templateHtmlAsTextBeforeLoop;

//   // 5a. work with html
//   // ---------------------------------
//   const $m = cheerio.load(templateHtmlAsTextAfterLoop);

//   ["m-if", "m-text", "m-src", "m-href"].forEach((attrName) => {
//     const htmlElements = $m(`[${attrName}]`);

//     htmlElements.each((index: number, el: HTMLElement) => {
//       // console.log(index, " | ", $(el).html(), $(el).attr(m));

//       const key = $m(el).attr(`${attrName}`); // m-if="key" so key in allData object is taken from attr value
//       const value = allData[key as keyof TechnicalPageData]; // value in allData object

//       const negation = key[0] === "!";
//       const newKey = key.slice(1);
//       const newValue = allData[newKey as keyof TechnicalPageData]; // value in allData object

//       if (attrName === "m-if" && negation && newValue) return $m(el).remove();
//       if (attrName === "m-if" && !negation && !value) return $m(el).remove();
//       if (attrName === "m-text" && value) {
//         if (value instanceof Array) return $m(el).text(value.join(", "));
//         if (typeof value === "number") return $m(el).text((value as number).toString());
//         if (typeof value === "string") return $m(el).text(value as string);
//         return $m(el).text(JSON.stringify(value));
//       }
//       if (attrName === "m-src" && value) $m(el).attr("src", value);
//       if (attrName === "m-href" && value) $m(el).attr("href", value);
//     });
//   });
//   // ---------------------------------

//   const templateHtmlAsTextAfterMichalChanges = $m.html();

//   // 6. create vueTemplate and store it in footer data-vue-template
//   const $vueTemplate = cheerio.load(templateHtmlAsTextAfterMichalChanges);
//   $vueTemplate(`[html]`).each((index: number, el: HTMLElement) => $vueTemplate(el).remove());

//   // 7. create htmlTemplate
//   const $htmlTemplate = cheerio.load(templateHtmlAsTextAfterMichalChanges);
//   $htmlTemplate(`[vue]`).each((index: number, el: HTMLElement) => $htmlTemplate(el).remove());

//   // 8. replace flags in htmlTemplate like {{slug}} - to that what is on allData object
//   let htmlTemplateAsString = $htmlTemplate.html();
//   Object.entries(allData).forEach(([key, val]) => {
//     const regex1 = new RegExp(`{{${key}}}`, "g");
//     const regex2 = new RegExp(`{{${key}.toUpperCase\\(\\)}}`, "g");
//     htmlTemplateAsString = htmlTemplateAsString
//       .replace(regex1, (val as string).toString())
//       .replace(regex2, (val as string).toString().toUpperCase());
//   });
//   const $htmlTemplateWithReplacedFlags = cheerio.load(htmlTemplateAsString);

//   // 9. add data-vue-template to footer
//   $htmlTemplateWithReplacedFlags("footer").attr("data-vue-template", $vueTemplate("#app").html());

//   //allCreatedPages
//   if (allCreatedPages) {
//     $htmlTemplateWithReplacedFlags("body").attr("data-all-created-pages", JSON.stringify(allCreatedPages));
//   }

//   // add some attr to body
//   $htmlTemplateWithReplacedFlags("body").attr("data-slug", slug);

//   fs.ensureDirSync(path.resolve(PROJECT_BUILD_LOCATION));
//   fs.writeFileSync(path.resolve(`${PROJECT_BUILD_LOCATION}${slug}`), $htmlTemplateWithReplacedFlags.html());

//   // 10. page is created, just return slug
//   return slug;
// };
