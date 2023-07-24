import { PostFromOldWordpress } from "./types";

const fs = require("fs-extra");
const _ = require("lodash");

export const getAllPostsFromOldWordpress = () => {
  // TASK 5
  const postsFromOldWordpress: PostFromOldWordpress[] = fs.readJsonSync(
    "sourceData/postsFromOldWordpress.json"
  ).postsFromOldWordpress;

  const postsFromOldWordpressFiltered = postsFromOldWordpress.filter((post) => {
    if (post.slug.includes("id-pytania-")) {
      return false;
    }

    // remove posts that contains: "data-question-id"
    if (post.html.includes("data-question-id")) {
      return false;
    }

    // remove posts that contains: "atrykul_head"
    if (post.html.includes("atrykul_head")) {
      return false;
    }

    // remove posts that contains: "blog-pytanie"
    if (post.html.includes("blog-pytanie")) {
      return false;
    }

    return true;
  });

  // TASK 6 order posts
  const orderedPostsFromOldWordpress: PostFromOldWordpress[] = [
    ..._.sortBy(postsFromOldWordpressFiltered, ["date"]),
  ].reverse();

  return { allPostsFromOldWordpress: orderedPostsFromOldWordpress };
};
