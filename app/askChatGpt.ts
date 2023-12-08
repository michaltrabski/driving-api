const fs = require("fs-extra");
import { ChatCompletionMessageParam } from "openai/resources";

import openai from "../gpt/open-ai";
import { QuestionWithExplanation } from "./types";
import { reverseNormalizeABCTAKNIE } from "./utils";

// const question = "test";
// const answer = await askChatGpt(question);
// fs.outputJsonSync(`${CHAT_GPT_ANSWERS}/chat-gpt.json`, {
//   question,
//   answer,
// });
// console.log("Chat GPT: ", { question, answer });

const CHAT_GPT_ANSWERS = "chat-gpt-answers";

export interface QuestionsToChatGpt {
  saveAnswerWithKey: string;
  question: string;
}

export const askChatGpt = async (
  saveAnswerWithKey: string,
  question: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 555));

  // check if answer exists
  try {
    const jsonWithAnswer = fs.readJsonSync(
      `${CHAT_GPT_ANSWERS}/${saveAnswerWithKey}.json`,
      {
        throws: false,
      }
    );

    if (jsonWithAnswer && jsonWithAnswer.answer) {
      console.log(
        "Chat GPT answer from file: ",
        question,
        jsonWithAnswer.answer.slice(0, 100)
      );
      return jsonWithAnswer.answer;
    }
  } catch (error) {
    console.log("Chat GPT jsonWithAnswer error: ", error);
  }

  const message: ChatCompletionMessageParam = {
    role: "user",
    content: question,
  };

  // Call the API with user input
  const chatCompletion = await openai.chat.completions.create({
    messages: [message],
    model: "gpt-3.5-turbo",
  });

  const answer = chatCompletion.choices[0].message.content;

  if (!answer) {
    throw new Error("Chat GPT answer is empty");
  }

  console.log("Chat GPT answer from chat: ", question, answer.slice(0, 100));

  fs.outputJsonSync(`${CHAT_GPT_ANSWERS}/${saveAnswerWithKey}.json`, {
    userQuestion: question,
    answer,
  });

  return answer;
};

export const prepareDataForChatGpt = async (
  allQuestionsBig: QuestionWithExplanation[]
) => {
  // const questions = [
  //   ...allQuestionsBig.filter((q) => q.expl.length > 0).slice(0, 3),
  // ];

  const questions = [...allQuestionsBig];

  const questionsToChatGpt: QuestionsToChatGpt[] = questions.map((q) => {
    const saveAnswerWithKey = q.id;
    const question = `
            Napisz jakie jest wyjaśnienie do pytania z testów na prawo jazdy na podstawie podanego uzasadnienia.

            Pytanie: ${q.text}
            Id pytania: ${q.id}

            Możliwe odpowiedzi:
            a: ${q.a},
            b: ${q.b},
            c: ${q.c}
            tak / nie
            Prawidłowa odpowiedź: ${reverseNormalizeABCTAKNIE(q.r)}

            Uzasadnienie: ${JSON.stringify(q.expl)}

            Podaj odpowiedź w postaci objektu javascript spełniającego interfejs
                interface Explanation {
                    id: string;
                    shortExplnation: string; // odpowiedź krótka długości 1 zdania.
                    longExplanation: string; // odpowiedź długości 5 zdań
                    textSeo: string; // tekst SEO na stronę internetową długości 10 zdań. Powinien zawierać słowa kluczowe i informacje.
                }
        `;

    return {
      saveAnswerWithKey,
      question,
    };
  });

  for (const questionToChatGpt of questionsToChatGpt) {
    const ans = await askChatGpt(
      questionToChatGpt.saveAnswerWithKey,
      questionToChatGpt.question
    );

    console.log(111111111111, ans);
  }
};
