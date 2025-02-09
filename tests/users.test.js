const supertest = require("supertest");
const app = require("../app"); // Your app
const mongoose = require("mongoose");
const User = require("../models/user");
const { test, after, beforeEach } = require("node:test");
const api = supertest(app);
const assert = require("node:assert");

beforeEach(async () => {
  // Ensure the users collection is cleared before each test
  await User.deleteMany({});
});

test("should return 400 if username or password is less than 3 characters", async () => {
  const newUser = {
    username: "ab",
    password: "12",
    name: "John Doe",
  };

  const response = await api.post("/api/users").send(newUser).expect(400);

  assert.strictEqual(
    response.body.error,
    "Username and password must be at least 3 characters long"
  );
});

test("should return 400 if username is not unique", async () => {
  const existingUser = {
    username: "existingUser",
    password: "password123",
    name: "Jane Doe",
  };

  // First, create a user with the username "existingUser"
  await api.post("/api/users").send(existingUser).expect(201);

  const newUser = {
    username: "existingUser", // Same username
    password: "newpassword",
    name: "John Doe",
  };

  const response = await api.post("/api/users").send(newUser).expect(400);

  assert.strictEqual(response.body.error, "Username must be unique");
});

test("should return 400 if username, password or name are missing", async () => {
  const newUser = {
    username: "newUser",
    password: "password123",
    // Missing name
  };

  const response = await api.post("/api/users").send(newUser).expect(400);

  assert.strictEqual(
    response.body.error,
    "Username, password, and name are required"
  );
});

test("should create a new user with valid data", async () => {
  const newUser = {
    username: "validUser",
    password: "validPassword123",
    name: "Valid User",
  };

  const response = await api
    .post("/api/users")
    .send(newUser)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  assert.ok(response.body.id);
  assert.strictEqual(response.body.username, newUser.username);
  assert.strictEqual(response.body.name, newUser.name);

  // Check that the user was actually saved in the database
  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 1);
  assert.strictEqual(usersAtEnd[0].username, newUser.username);
});

after(async () => {
  await mongoose.connection.close(); // Close the connection after the tests
});
