import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "Travel Guides" },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    tags: [{ type: String }],
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);
