const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");

describe("dummy", () => {
  test("dummy returns one", () => {
    const blogs = [];
    const result = listHelper.dummy(blogs);
    assert.strictEqual(result, 1);
  });
});

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
  ];

  test("when list has only one blog equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });

  const listWithMultipleBlogs = [{ likes: 5 }, { likes: 10 }, { likes: 7 }];

  test("when list has multiple blogs equals the sum of likes", () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs);
    assert.strictEqual(result, 22);
  });
});

describe("favorite blog", () => {
  const listWithBlogs = [
    {
      title: "Blog 1",
      author: "Author 1",
      likes: 3,
    },
    {
      title: "Blog 2",
      author: "Author 2",
      likes: 5,
    },
    {
      title: "Blog 3",
      author: "Author 3",
      likes: 1,
    },
  ];

  test("returns the blog with the most likes", () => {
    const result = listHelper.favoriteBlog(listWithBlogs);
    assert.strictEqual(result.title, "Blog 2");
    assert.strictEqual(result.likes, 5);
  });
});

describe("most blogs", () => {
  const listWithBlogs = [
    { author: "Author 1" },
    { author: "Author 2" },
    { author: "Author 1" },
    { author: "Author 3" },
    { author: "Author 1" },
  ];

  test("returns the author with the most blogs", () => {
    const result = listHelper.mostBlogs(listWithBlogs);
    assert.strictEqual(result.author, "Author 1");
    assert.strictEqual(result.blogs, 3);
  });
});

describe("most likes", () => {
  const listWithBlogs = [
    { author: "Author 1", likes: 3 },
    { author: "Author 2", likes: 5 },
    { author: "Author 1", likes: 2 },
    { author: "Author 3", likes: 7 },
    { author: "Author 1", likes: 4 },
  ];

  test("returns the author with the most likes", () => {
    const result = listHelper.mostLikes(listWithBlogs);
    assert.strictEqual(result.author, "Author 1");
    assert.strictEqual(result.likes, 9);
  });
});
