const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  try {
    const blogs = await Blog.find({});
    response.json(blogs);
  } catch (error) {
    response
      .status(500)
      .json({ error: "Something went wrong while fetching blogs" });
  }
});

blogRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;

  if (!title) {
    return response.status(400).json({ error: "title is required" });
  }

  if (!url) {
    return response.status(400).json({ error: "url is required" });
  }

  // If likes property is missing, default it to 0
  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
  });

  try {
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    response.status(400).send(error);
  }
});

module.exports = blogRouter;
