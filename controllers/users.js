const express = require("express");
const User = require("../models/user"); // Assuming User schema is in models/user
const usersRouter = express.Router();

// Create new user
usersRouter.post("/", async (request, response) => {
  const { username, password, name } = request.body;

  // Validate input fields
  if (!username || !password || !name) {
    return response
      .status(400)
      .json({ error: "Username, password, and name are required" });
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: "Username and password must be at least 3 characters long",
    });
  }

  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return response.status(400).json({ error: "Username must be unique" });
  }

  try {
    // Create new user with hashed password
    const user = new User({
      username,
      passwordHash: password, // Password will be hashed in the pre-save hook
      name,
    });

    const savedUser = await user.save();
    response.status(201).json({
      id: savedUser._id,
      username: savedUser.username,
      name: savedUser.name,
    });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error: "Something went wrong while creating user" });
  }
});

usersRouter.get("/", async (request, response) => {
  try {
    // Fetch all users and only select id, name, and username
    const users = await User.find({})
      .select("id name username")
      .populate("blogs", { title: 1, author: 1, url: 1, likes: 1, _id: 1 }); // Only include these fields

    response.json(users); // Return the filtered list of users as JSON
  } catch (error) {
    response.status(500).json({ error: "Error fetching users" });
  }
});

module.exports = usersRouter;
