const fs = require("fs-extra");
const path = require("path");
const md5 = require("md5");

import { newCreatePage } from "../../app/createPage";
import {
  AllQuestionsData,
  Category,
  PAGE_URL,
  TEMPLATE_FILE_NAME,
  Question,
  AllQuestionsDataSlim,
  PAGE,
} from "../../app/types";
import { getEnv, helpersLikeYear, isProduction, michalSlugify, updateTemplates, uploadProject } from "../../app/utils";
import { getStyczen, getStyczniu, log } from "../../ts/helpers";

const customSlugForProject1 = (category: Category, questions: Question[] | undefined, index: number = 0) => {
  let slug = "";

  if (!questions) return slug;

  if (index < 0 || index >= questions.length) return slug; // if there is no questions with this index then return slug = ""

  const suffix = `-id-pytania-${questions[index].id.replace("id", "")}`;

  category === "b"
    ? (slug = michalSlugify(questions[index].text, suffix))
    : (slug = michalSlugify("kat", category, questions[index].text, suffix));

  return slug;
};

export const project1 = async (
  PROJECT_NR: string,
  allQuestionsData: AllQuestionsData,
  allQuestionsDataSlim: AllQuestionsDataSlim
) => {

  const PROJECT_1_VERION = getEnv(`${PROJECT_NR}_VERION`);
  
  const HOSTNAME = getEnv(`${PROJECT_NR}_HOSTNAME`);
  const projectLocation = getEnv(`${PROJECT_NR}_LOCATION`);
  const defaultFile = getEnv(`${PROJECT_NR}_DEFAULT_MEDIA_FILE`);
  const endpoint = getEnv(`${PROJECT_NR}_UPLOAD_ENDPOINT`);
  const statusFile = getEnv(`${PROJECT_NR}_UPLOAD_STATUS_JSON`);
  const templatesLocation = getEnv(`${PROJECT_NR}_TEMPLATES`);
  const buildLocation = getEnv(`${PROJECT_NR}_BUILD_LOCATION`);
  const t = templatesLocation;
  const b = buildLocation;
  
  const { allQuestions, allCategories, postsFromOldWordpress } = allQuestionsData;

  // TASK 1 - remove all files from buildLocation to create new ones from scratch
  fs.removeSync(buildLocation);

    // TASK 10 - put allQuestionsDataSlim.json file in build folder to be able to fetch allQuestionsDataSlim on frontend
    fs.outputJsonSync(path.resolve(buildLocation, "allQuestionsDataSlim.json"), allQuestionsDataSlim);
    // fs.outputJsonSync(path.resolve(buildLocation, "allQuestionsData.json"), allQuestionsData);


    log("przerywam projekt w tym momencie bo potrzebuję tylko allQuestionsDataSlim.json")
    return


  // TASK 2. update templates
  updateTemplates(templatesLocation, buildLocation);

  // data
  const data: any = {
    page_slug_pl_category: PAGE_URL.CATEGORY,
    PAGE_URL_GOOD_ANSWERS: PAGE_URL.GOOD_ANSWERS,
    PAGE_URL_BAD_ANSWERS: PAGE_URL.BAD_ANSWERS,
    PAGE_URL_PRICING: PAGE_URL.PRICING,
    PAGE_URL_INFO: PAGE_URL.INFO,
    PAGE_URL_MAP: PAGE_URL.MAP,
    PAGE_URL_USER_ACCOUNT: PAGE_URL.USER_ACCOUNT,
    PAGE_URL_REGISTER: PAGE_URL.REGISTER,
    PAGE_URL_LOGIN: PAGE_URL.LOGIN,
    PAGE_URL_BLOG: PAGE_URL.BLOG,
    PAGE_URL_CONTACT: PAGE_URL.CONTACT,
    PAGE_URL_TERMS: PAGE_URL.TERMS,
    PAGE_URL_PRIVACY: PAGE_URL.PRIVACY,
    PAGE_URL_HOME: PAGE_URL.HOME,

    HOSTNAME,
    PROJECT_1_VERION,

    video_autoplay: isProduction() ? 'autoplay="true"' : '', // not working in html

    PAGE_TITLE: `Darmowe testy na prawo jazdy z ${new Date().getFullYear()} roku wszystkich kategorii a, b, c, d, a1, a2, am, b1, c1, d1, pt, t.`,

    all_categories: allCategories,
    all_questions_count: allQuestions.length,
    goodAns: 0,
    badAns: 0,

    ...helpersLikeYear(),
  };

  // TAKS 5. add some properties to data based on categories
  allCategories.forEach((category) => {
    const prop1 = `${category}_questions_count`;
    data[prop1] = allQuestions.filter((q) => q.question_belongs_to_categories.indexOf(category) > -1).length;

    const prop2 = `${category}_first_question_url`;
    data[prop2] = customSlugForProject1(
      category,
      allQuestions.filter((q) => q.question_belongs_to_categories.indexOf(category) > -1),
      0
    );
  });

  // TASK 6. add some properties to data based on postsFromOldWordpress
  postsFromOldWordpress.forEach((post, index) => {
    data[`post_${index}_title`] = post.title;
    data[`post_${index}_slug`] = michalSlugify(post.slug);
    data[`post_${index}_date`] = post.date;
    data[`post_${index}_html`] = post.html;
  });

  allCategories.forEach((category) => {
    allQuestions.forEach((question, index) => {
      const templateName = TEMPLATE_FILE_NAME.QUESTION;
      const slug = customSlugForProject1(category, allQuestions, index);
      const pageData = {
        ...data,
        ...question,
        nr: index + 1,
        category,
        next_question_url: customSlugForProject1(category, allQuestions, index + 1),
        prev_question_url: customSlugForProject1(category, allQuestions, index - 1),

        PAGE_TITLE: `${
          question.text
        } | Pytanie do nauki na egzamin teoretyczny na prawo jazdy kategorii ${category.toUpperCase()} | ${
          data.PAGE_TITLE
        }`,
      };

      newCreatePage(templatesLocation, buildLocation, templateName, slug, pageData);
    });
  });

  postsFromOldWordpress.forEach((post) => {
    const slug = michalSlugify(post.slug);
    const pageData = {
      ...data,
      title: post.title,
      slug,
      date: post.date,
      html: post.html,
      PAGE_TITLE: post.title + " - " + data.PAGE_TITLE,
    };

    newCreatePage(t, b, TEMPLATE_FILE_NAME.POST, slug, pageData);
  });

  // TASK 6. Create pages like home, login, register, etc.

  newCreatePage(t, b, TEMPLATE_FILE_NAME.NOTFOUND404, PAGE_URL.NOTFOUND404, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.BLOG, PAGE_URL.BLOG, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.CATEGORY, PAGE_URL.CATEGORY, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.BAD_ANSWERS, PAGE_URL.BAD_ANSWERS, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.GOOD_ANSWERS, PAGE_URL.GOOD_ANSWERS, data);

  newCreatePage(t, b, PAGE.USER_ANSWERS_GOOD.TEMPLATE, PAGE.USER_ANSWERS_GOOD.URL, data);

  newCreatePage(t, b, TEMPLATE_FILE_NAME.HOME, PAGE_URL.HOME, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.LOGIN, PAGE_URL.LOGIN, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.PRICING, PAGE_URL.PRICING, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.REGISTER, PAGE_URL.REGISTER, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.TERMS, PAGE_URL.TERMS, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.CONTACT, PAGE_URL.CONTACT, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.PRIVACY, PAGE_URL.PRIVACY, data);
  newCreatePage(t, b, TEMPLATE_FILE_NAME.USER_ACCOUNT, PAGE_URL.USER_ACCOUNT, data);

  // TASK 9. copy js bundle file to build folder
  fs.copySync(path.resolve("js", "bundle.js"), path.resolve(buildLocation, "bundle.js"));



  // TASK 11 - copy default images to build folder

  fs.copySync(path.resolve(projectLocation, defaultFile), path.resolve(buildLocation, defaultFile));

  log(`${PROJECT_NR} CREATED`);

  if (isProduction()) {
    await uploadProject(endpoint, buildLocation, statusFile);
  } else {
    log(`HTML FILES FROM ${PROJECT_NR} NOT UPLOADED BECAUSE IT IS NOT PRODUCTION`);
  }
};

