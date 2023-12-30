const fs = require("fs-extra");
import { ChatCompletionMessageParam } from "openai/resources";
require("dotenv").config();

import openai from "../gpt/open-ai";
import { QuestionBig } from "./types";
import { reverseNormalizeABCTAKNIE } from "./utils";

export const CHAT_GPT_ANSWERS = "chat-gpt-answers";

export interface QuestionsToChatGpt {
  saveAnswerWithKey: string;
  question: string;
}

export const askChatGpt = async (saveAnswerWithKey: string, question: string, i: number) => {
  await new Promise((resolve) => setTimeout(resolve, 1));

  // console.log("I blocked askChatGpt function, check it and uncomment");
  // return;

  try {
    const jsonWithAnswer = fs.readJsonSync(`${CHAT_GPT_ANSWERS}/${saveAnswerWithKey}.json`, {
      throws: false,
    });

    if (jsonWithAnswer && jsonWithAnswer.answer) {
      console.log(i, "Chat GPT answer from file");
      return jsonWithAnswer.answer;
    }
  } catch (error) {
    console.log("Chat GPT jsonWithAnswer error: ", error);
  }

  const message: ChatCompletionMessageParam = {
    role: "user",
    content: question,
  };

  const chatCompletion = await openai.chat.completions.create({
    messages: [message],
    model: "gpt-3.5-turbo",
  });

  const answer = chatCompletion.choices[0].message.content;

  if (!answer) {
    throw new Error("Chat GPT answer is empty");
  }

  console.log(i, "Chat GPT answer from chat");

  fs.outputJsonSync(`${CHAT_GPT_ANSWERS}/${saveAnswerWithKey}.json`, {
    userQuestion: question,
    answer,
  });

  return answer;
};

export const prepareDataForChatGpt = async (questionsBig: QuestionBig[]) => {
  const questions = questionsBig.filter((q) => q.explanationTesty360); // .slice(0, 999999);
  console.log("questions.length", questions.length);

  const questionsToChatGpt: QuestionsToChatGpt[] = questions.map((q) => {
    const saveAnswerWithKey = q.id;
    const question = `
            Napisz jakie jest wyjaśnienie do pytania z testów na prawo jazdy na podstawie podanych informacji.

            Podaj odpowiedź w formacie:
            shortExplanation: Krótkie wyjaśnienie długości około 2 zdania.
            longExplanation: Długie wyjaśnienie długości 10 zdań.
            textSeo: Tekst SEO długości 20 zdań.

            Pytanie: ${q.text}
            Id pytania: ${q.id}

            Możliwe odpowiedzi:
            a: ${q.a},
            b: ${q.b},
            c: ${q.c}
            tak / nie
            Prawidłowa odpowiedź: ${reverseNormalizeABCTAKNIE(q.r)}
            ${JSON.stringify(q.explanationTesty360)}
          `;

    return {
      saveAnswerWithKey,
      question: question.slice(0, 4097 - 1),
    };
  });

  let i = 0;
  for (const questionToChatGpt of questionsToChatGpt) {
    i++;
    const ans = await askChatGpt(questionToChatGpt.saveAnswerWithKey, questionToChatGpt.question, i);
  }
};
