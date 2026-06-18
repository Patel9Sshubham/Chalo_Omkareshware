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
  const blogs = await BlogPost.find().sort({ featured: -1, createdAt: -1 });
  res.json({ blogs });
}

export async function createBlog(req, res) {
  const payload = {
    ...req.body,
    slug: req.body.slug || slugify(req.body.title),
    tags: Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  };
  const blog = await BlogPost.create(payload);
  res.status(201).json({ blog });
}

export async function updateBlog(req, res) {
  const updates = { ...req.body };
  if (req.body.title && !req.body.slug) {
    updates.slug = slugify(req.body.title);
  }
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    updates.tags = String(req.body.tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  const blog = await BlogPost.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!blog) {
    return res.status(404).json({ message: "Blog not found." });
  }
  res.json({ blog });
}

export async function deleteBlog(req, res) {
  const blog = await BlogPost.findByIdAndDelete(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found." });
  }
  res.json({ success: true });
}
