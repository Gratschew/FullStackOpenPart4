const supertest = require("supertest");
const app = require("../app"); // Make sure app.js exports your Express app
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const { test, after, beforeEach } = require("node:test");
const api = supertest(app);
const assert = require("node:assert");

beforeEach(async () => {
  await Blog.deleteMany({});
  const blog = new Blog({
    title: "First Blog",
    author: "John Doe",
    url: "http://example.com",
    likes: 5,
  });
  await blog.save();
});

test("blogs are returned as JSON and the correct number of blogs is returned", async () => {
  const response = await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(response.body.length, 1);
});

test("blogs have an id property", async () => {
  const response = await api
    .get("/api/blogs")
    .expect(200) // Expect HTTP status 200 OK
    .expect("Content-Type", /application\/json/); // Expect JSON content type

  // Check that each blog has an 'id' property and not '_id'
  response.body.forEach((blog) => {
    assert.ok(blog.id); // Make sure 'id' exists
    assert.strictEqual(blog._id, undefined); // Ensure '_id' is not present
  });
});

test("a new blog is added successfully", async () => {
  const newBlog = {
    title: "Test Blog",
    author: "Jane Doe",
    url: "http://test.com",
    likes: 10,
  };

  // Send POST request to add a new blog
  const response = await api
    .post("/api/blogs")
    .send(newBlog) // Send the new blog data
    .expect(201) // Expect status 201 (Created)
    .expect("Content-Type", /application\/json/); // Expect JSON content type

  // Verify the blog was added to the database
  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, 2);
  const titles = blogsAtEnd.map((blog) => blog.title);
  assert.ok(titles.includes(newBlog.title));

  const savedBlog = blogsAtEnd.find((blog) => blog.title === newBlog.title);
  assert.strictEqual(savedBlog.author, newBlog.author);
  assert.strictEqual(savedBlog.url, newBlog.url);
  assert.strictEqual(savedBlog.likes, newBlog.likes);
});

test("likes property defaults to 0 when missing", async () => {
  const newBlog = {
    title: "Test Blog Without Likes",
    author: "Jane Doe",
    url: "http://test.com",
  };

  // Send POST request to add a new blog
  const response = await api
    .post("/api/blogs")
    .send(newBlog) // Send the blog data without likes
    .expect(201) // Expect status 201 (Created)
    .expect("Content-Type", /application\/json/); // Expect JSON content type

  // Verify the likes property is set to 0 if it was not provided
  assert.strictEqual(response.body.likes, 0);
});

test("responds with 400 Bad Request if title is missing", async () => {
  const newBlog = {
    author: "John Doe",
    url: "http://test.com",
    // Missing title
  };

  const response = await api.post("/api/blogs").send(newBlog).expect(400); // Expect status 400 (Bad Request)

  assert.strictEqual(response.body.error, "title is required"); // Check error message
});

test("responds with 400 Bad Request if url is missing", async () => {
  const newBlog = {
    title: "Test Blog Without URL",
    author: "Jane Doe",
    // Missing url
  };

  const response = await api.post("/api/blogs").send(newBlog).expect(400); // Expect status 400 (Bad Request)

  assert.strictEqual(response.body.error, "url is required"); // Check error message
});

after(async () => {
  await mongoose.connection.close();
});
