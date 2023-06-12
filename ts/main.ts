import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { createApp } from "vue";
import { Category, Question } from "../app/types";
import { isProduction } from "../app/utils";

import { auth, getFirebaseUserDocument, mergeFirebaseUserDocument, _logoutUser } from "./firebase";
import {
  getNumber,
  getText,
  getArray,
  _fetchAllQuestionsData,
  getStyczen,
  getStyczniu,
  getBoolean,
  getTemplateForVue,
  sessionStorageGetText,
  sessionStorageSetText,
  sessionStorageGetObj,
  sessionStorageSetObj,
  sessionStorageGetNumber,
  sessionStorageSetNumber,
  localStorageGetText,
  localStorageSetText,
  sessionStorageGetBoolean,
  sessionStorageSetBoolean,
} from "./helpers";

// CONST
const FETCH_ALLQUESTIONSDATASLIM_ENDPOINT = "https://usun.dacmwwxjyw.cfolks.pl/api.php?slug=allQuestionsDataSlim.json";

const INITIAL_USER_DATA = { uid: "", email: "", role: "user" };

const KEYS = {
  UID_FROM_AUTH: "UID_FROM_AUTH",
  USER_DATA: "USER_DATA",
  SELECTED_CATEGORY: "SELECTED_CATEGORY",
  GOOD_ANS: "GOOD_ANS",
  BAD_ANS: "BAD_ANS",
  LOGIN_EMAIL_USED_IN_FORMS: "LOGIN_EMAIL_USED_IN_FORMS",
} as const;

const ALL_QUESTIONS_SLIM = "ALL_QUESTIONS_SLIM";

const USER_ROLE = {
  USER: "user",
  ADMIN: "admin",
} as const;
// setTimeout(() => {
//   callVue();
// }, 333);

const id = document.querySelector("[data-vue-variable-id]")?.getAttribute("data-vue-variable-id") || "";
const correct_answer =
  document.querySelector("[data-vue-variable-correct_answer]")?.getAttribute("data-vue-variable-correct_answer") || "";

callVue();
function callVue() {
  createApp({
    // template: sessionStorageGetText("templateForVue") || "",
    data() {
      return {
        isVueLoaded: true,
        window: { w: 0, h: 0 },

        uidFromAuth: sessionStorageGetText(KEYS.UID_FROM_AUTH),
        // email: sessionStorageGetText(EMAIL),
        // role: sessionStorageGetText("ROLE"),
        // isUserAuthenticated: sessionStorageGetBoolean(IS_USER_AUTHENTICATED),

        userData: sessionStorageGetObj(KEYS.USER_DATA) || INITIAL_USER_DATA,

        userAnswersGood: [],

        LOGIN_EMAIL: localStorageGetText(KEYS.LOGIN_EMAIL_USED_IN_FORMS),
        LOGIN_PASSWORD: "",
        loginErrorResponse: "",
        REGISTER_EMAIL: localStorageGetText(KEYS.LOGIN_EMAIL_USED_IN_FORMS),
        REGISTER_PASSWORD_1: "",
        REGISTER_PASSWORD_2: "",
        registerErrorResponse: "",

        ALL_QUESTIONS: [], // TODO - remove
        allQuestionsSlim: sessionStorageGetObj(ALL_QUESTIONS_SLIM) || [],
        goodAns: sessionStorageGetNumber(KEYS.GOOD_ANS) || 0,
        badAns: sessionStorageGetNumber(KEYS.BAD_ANS) || 0,

        id,

        correct_answer,

        //  CALCULATED DATA FOR VUE
        selectedCategory: localStorage.getItem(KEYS.SELECTED_CATEGORY) || "b",
        clickedVote: sessionStorageGetText(id + "vote"),
        clickedAnswer: null,
        isCorrectAnswerClicked: null,
        isNotCorrectAnswerClicked: null,

        isModalOpen: false,

        // all items belowe must be insluded in main.ts and createPage() function
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        styczen: getStyczen(),
        styczniu: getStyczniu(),

        // // all created pages
        // all_created_pages,
      };
    },
    methods: {
      getUserGoodAnswers() {
        const questions: any = [];
        Object.entries(this.userData).forEach(([key, item]: any) => {
          const question = this.allQuestionsSlim.find((q: any) => q.id === key);

          if (item.clickedCorrectAnswer === true) {
            questions.push(question);
          }
        });

        this.userAnswersGood = questions;
      },
      handleAnswerClick(clickedAnswer: string) {
        this.clickedAnswer = clickedAnswer;
        this.isCorrectAnswerClicked = this.clickedAnswer && this.clickedAnswer === this.correct_answer;
        this.isNotCorrectAnswerClicked = this.clickedAnswer && this.clickedAnswer !== this.correct_answer;

        const clickedCorrectAnswer = clickedAnswer === this.correct_answer;

        this.userData = {
          ...this.userData,
          [this.id]: { ...this.userData[id], clickedAnswer, clickedCorrectAnswer },
        };

        if (this.uidFromAuth) {
          mergeFirebaseUserDocument(this.uidFromAuth, {
            [this.id]: { clickedAnswer, clickedCorrectAnswer },
          });

          sessionStorageSetObj(KEYS.USER_DATA, this.userData);
        }
      },
      // handleVoteClick(vote: string) {
      //   this.clickedVote = vote;

      //   mergeFirebaseUserDocument(this.uidFromAuth, {
      //     [id]: { vote },
      //   });
      //   this.userData = { ...this.userData, [id]: { ...this.userData[id], vote } };
      //   sessionStorageSetObj(USER_DATA, this.userData);

      //   console.log("handleVoteClick", vote);
      // },
      // isVoteClicked(vote: string) {
      //   return this.userData?.[id]?.vote === vote;
      // },
      logoutUser() {
        const res = _logoutUser();
      },
      async submitLoginForm() {
        try {
          const res = await signInWithEmailAndPassword(auth, this.LOGIN_EMAIL, this.LOGIN_PASSWORD);
        } catch (error: any) {
          this.loginErrorResponse = error.code;
        }
      },
      async submitRegisterForm() {
        if (this.REGISTER_PASSWORD_1 !== this.REGISTER_PASSWORD_2) {
          this.registerErrorResponse = "Podane hasła muszą być takie same.";
          return;
        }

        try {
          const res = await createUserWithEmailAndPassword(auth, this.REGISTER_EMAIL, this.REGISTER_PASSWORD_1);
          await mergeFirebaseUserDocument(res.user.uid, { uid: res.user.uid, email: res.user.email });
        } catch (error: any) {
          this.registerErrorResponse = error.code;
        }
      },
      auth() {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
          if (user) {
            this.uidFromAuth = user.uid;
            sessionStorageSetText(KEYS.UID_FROM_AUTH, user.uid);
          } else {
            this.uidFromAuth = "";
            Object.keys(KEYS).forEach((key) => {
              sessionStorage.removeItem(key);
            });
          }
        });
      },
      changeSelectedCategory(cat: string) {
        this.selectedCategory = cat;
        localStorage.setItem(KEYS.SELECTED_CATEGORY, cat);
      },
      isSelectedCategory(cat: string) {
        return this.selectedCategory === cat;
      },
      validateAnswerCss(ans: string) {
        if (!this.clickedAnswer || (ans !== this.clickedAnswer && ans !== this.correct_answer)) {
          return {
            btn: true,
            "btn-secondary": true,
          };
        }
        if (this.clickedAnswer && ans === this.correct_answer) {
          return {
            btn: true,
            "btn-success": true,
          };
        }
        if (ans !== this.correct_answer || (ans === this.clickedAnswer && ans !== this.correct_answer)) {
          return {
            btn: true,
            "btn-danger": true,
          };
        }
        return {};
      },
      async fetchAllQuestionsData() {
        if (this.allQuestionsSlim.length === 0) {
          const allQuestionsDataSlim = await _fetchAllQuestionsData(FETCH_ALLQUESTIONSDATASLIM_ENDPOINT);
          this.allQuestionsSlim = allQuestionsDataSlim.allQuestionsSlim;
          sessionStorageSetObj(ALL_QUESTIONS_SLIM, this.allQuestionsSlim);
        }
      },
    },
    async mounted() {
      this.auth();
      this.fetchAllQuestionsData();
      this.getUserGoodAnswers();
      this.window = { w: window.innerWidth, h: window.innerHeight };
    },
    watch: {
      async uidFromAuth(newUidFromAuth) {
        if (newUidFromAuth) {
          const userData = await getFirebaseUserDocument(this.uidFromAuth);
          console.log("userData from firebase", userData);

          this.userData = userData;

          sessionStorageSetObj(KEYS.USER_DATA, this.userData);
          return;
        }

        this.userData = {};
      },
      userData(newUserData, prevUserData) {
        // TODO - make calculations more efficient
        this.goodAns = Object.values(newUserData).filter((prop: any) => prop.clickedCorrectAnswer === true).length;
        this.badAns = Object.values(newUserData).filter((prop: any) => prop.clickedCorrectAnswer === false).length;

        if (this.uidFromAuth) {
          sessionStorageSetNumber(KEYS.GOOD_ANS, this.goodAns);
          sessionStorageSetNumber(KEYS.BAD_ANS, this.badAns);
        }
      },
      LOGIN_EMAIL(newEmail, prevEmail) {
        localStorageSetText(KEYS.LOGIN_EMAIL_USED_IN_FORMS, newEmail);
      },
    },
  }).mount("#app");
}
