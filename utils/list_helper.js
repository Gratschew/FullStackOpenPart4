const dummy = (blogs) => {
    return 1
  }
  
  const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }
  
  const favoriteBlog = (blogs) => {
    return blogs.reduce((favorite, blog) => {
      return (favorite.likes > blog.likes) ? favorite : blog
    })
  }
  
  const mostBlogs = (blogs) => {
    const authorCount = blogs.reduce((count, blog) => {
      count[blog.author] = (count[blog.author] || 0) + 1
      return count
    }, {})
  
    const mostBlogsAuthor = Object.entries(authorCount)
      .reduce((max, [author, blogsCount]) => {
        return blogsCount > max.blogs ? { author, blogs: blogsCount } : max
      }, { author: '', blogs: 0 })
  
    return mostBlogsAuthor
  }
  
  const mostLikes = (blogs) => {
    const authorLikes = blogs.reduce((sum, blog) => {
      sum[blog.author] = (sum[blog.author] || 0) + blog.likes
      return sum
    }, {})
  
    const mostLikedAuthor = Object.entries(authorLikes)
      .reduce((max, [author, likes]) => {
        return likes > max.likes ? { author, likes } : max
      }, { author: '', likes: 0 })
  
    return mostLikedAuthor
  }
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }
  