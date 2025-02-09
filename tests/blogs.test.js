const supertest = require("supertest");
const app = require("../app"); // Make sure app.js exports your Express app
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const { test, after, beforeEach, before } = require("node:test");
const api = supertest(app);
const assert = require("node:assert");
const User = require("../models/user");

before(async () => {
  await Blog.deleteMany({});
  // Create a new user
  await User.deleteMany({});
  const newUser = {
    username: "newuser",
    name: "New User",
    password: "password123", // Make sure password is hashed in your model
  };

  // Register the new user
  const response = await api
    .post("/api/users") // Assuming you have a user registration endpoint
    .send(newUser)
    .expect(201);

  // Log the user in and get the token
  const loginResponse = await api
    .post("/api/login")
    .send({ username: newUser.username, password: newUser.password })
    .expect(200);

  // Store the token for further use
  token = loginResponse.body.token;
});

beforeEach(async () => {
  //await Blog.deleteMany({});
});

test("creating a blog with a valid token succeeds", async () => {
  const newBlog = {
    title: "New Blog with Token",
    author: "New Author",
    url: "http://newblog.com",
    likes: 5,
  };
  // Send a POST request with the Authorization header and the valid token
  await api
    .post("/api/blogs")
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  // Check that the blog was saved to the database
  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, 1);
  assert.strictEqual(blogsAtEnd[0].title, "New Blog with Token");
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
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
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
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
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

  const response = await api
    .post("/api/blogs")
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(400); // Expect status 400 (Bad Request)

  assert.strictEqual(response.body.error, "title is required"); // Check error message
});

test("responds with 400 Bad Request if url is missing", async () => {
  const newBlog = {
    title: "Test Blog Without URL",
    author: "Jane Doe",
    // Missing url
  };

  const response = await api
    .post("/api/blogs")
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(400); // Expect status 400 (Bad Request)

  assert.strictEqual(response.body.error, "url is required"); // Check error message
});

test("successfully deletes a blog post", async () => {
  // First, create a new blog post to delete later
  const newBlog = {
    title: "Blog to be Deleted",
    author: "John Doe",
    url: "http://delete.com",
    likes: 10,
  };

  const createResponse = await api
    .post("/api/blogs")
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(201); // Check successful creation

  const blogId = createResponse.body.id; // Get the ID of the newly created blog
  // Now, delete the blog by its ID
  await api
    .delete(`/api/blogs/${blogId}`)
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .expect(204); // Expect successful deletion with no content

  // Verify that the blog has been deleted
  const blogsAfterDelete = await api.get("/api/blogs");
  const blogIds = blogsAfterDelete.body.map((blog) => blog.id);
  assert.strictEqual(blogIds.includes(blogId), false); // Check that the deleted blog is not in the list
});

test("returns 400 if blog to delete does not exist", async () => {
  // Try to delete a blog that doesn't exist
  const invalidId = "lol123";

  const response = await api
    .delete(`/api/blogs/${invalidId}`)
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .expect(400); // Expect 400 (Bad request, Invalid blog ID)

  assert.strictEqual(
    response.body.error,
    "Invalid blog ID or something went wrong"
  );
});

test("successfully updates the likes of a blog", async () => {
  const newBlog = {
    title: "Blog to be Updated",
    author: "Jane Doe",
    url: "http://update.com",
    likes: 5,
  };

  const createResponse = await api
    .post("/api/blogs")
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(201); // Check successful creation

  const blogId = createResponse.body.id; // Get the ID of the newly created blog

  const updatedBlogData = {
    likes: 15, // Update the likes
  };

  const updateResponse = await api
    .put(`/api/blogs/${blogId}`)
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(updatedBlogData)
    .expect(200); // Expect the updated blog

  assert.strictEqual(updateResponse.body.likes, 15); // Verify that likes were updated

  // Verify that the updated blog's likes are correct in the system
  const blogsAfterUpdate = await api.get("/api/blogs");
  const updatedBlog = blogsAfterUpdate.body.find((blog) => blog.id === blogId);
  assert.strictEqual(updatedBlog.likes, 15); // Check that the likes were updated
});

test("returns 404 if blog to update does not exist", async () => {
  const nonExistentId = "60f7c3a4c2e15b1b8f4c9a14";
  const updatedBlogData = { likes: 10 };

  const response = await api
    .put(`/api/blogs/${nonExistentId}`)
    .set({ Accept: "application/json", Authorization: `Bearer ${token}` })
    .send(updatedBlogData)
    .expect(404); // Expect 404 (Blog not found)

  assert.strictEqual(response.body.error, "Blog not found");
});

test("returns 401 if auth header is missing", async () => {
  const newBlog = {
    title: "Blog to be Updated",
    author: "Jane Doe",
    url: "http://update.com",
    likes: 5,
  };
  const response = await api
    .post("/api/blogs")
    .send(newBlog) // Send the blog data without likes
    .expect(401) // Expect status 201 (Created)
    .expect("Content-Type", /application\/json/);
});

after(async () => {
  await mongoose.connection.close();
});

return;
