import BlogPost from "../models/BlogPost.js";

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getBlogs(req, res) {
  const blogs = await BlogPost.find({ published: true }).sort({ featured: -1, createdAt: -1 });
  res.json({ blogs });
}

export async function getBlogBySlug(req, res) {
  const blog = await BlogPost.findOne({ slug: req.params.slug, published: true });
  if (!blog) {
    return res.status(404).json({ message: "Blog not found." });
  }

  const related = await BlogPost.find({
    published: true,
    _id: { $ne: blog._id }
  })
    .sort({ featured: -1, createdAt: -1 })
    .limit(4);

  res.json({
    blog,
    related,
    seo: {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt || ""
    }
  });
}

export async function getBlogSeed(req, res) {
  const featured = await BlogPost.find({ published: true }).sort({ featured: -1, createdAt: -1 }).limit(3);
  res.json({ blogs: featured });
}
