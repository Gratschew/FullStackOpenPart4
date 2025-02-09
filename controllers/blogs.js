const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { userExtractor, tokenExtractor } = require("../utils/middleware");

blogRouter.get("/", async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
      _id: 1,
    });
    response.json(blogs);
  } catch (error) {
    response
      .status(500)
      .json({ error: "Something went wrong while fetching blogs" });
  }
});

blogRouter.post("/", userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body;

  // Validate required fields
  if (!title) {
    return response.status(400).json({ error: "title is required" });
  }

  if (!url) {
    return response.status(400).json({ error: "url is required" });
  }

  try {
    // Verify token and get the user information
    const user = request.user;

    // Create the new blog
    const blog = new Blog({
      title,
      author,
      url,
      likes: likes || 0,
      user: user._id, // Associate the blog with the found user
    });

    // Save the blog to the database
    const savedBlog = await blog.save();

    // Add the saved blog's ID to the user's blogs array
    user.blogs.push(savedBlog._id);

    await user.save();

    // Respond with the saved blog

    response.status(201).json(savedBlog);
  } catch (error) {
    response.status(400).send(error);
  }
});

blogRouter.delete("/:id", userExtractor, async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }

    if (blog.user.toString() !== request.user._id.toString()) {
      return response
        .status(403)
        .json({ error: "You are not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(request.params.id);

    response.status(204).end();
  } catch (error) {
    response
      .status(400)
      .json({ error: "Invalid blog ID or something went wrong" });
  }
});

blogRouter.put("/:id", async (request, response) => {
  const { likes } = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      { new: true } // returns the updated document
    );

    if (!updatedBlog) {
      return response.status(404).json({ error: "Blog not found" });
    }

    response.json(updatedBlog); // Respond with the updated blog
  } catch (error) {
    response.status(400).json({ error: "Invalid blog ID or bad request" });
  }
});

module.exports = blogRouter;
