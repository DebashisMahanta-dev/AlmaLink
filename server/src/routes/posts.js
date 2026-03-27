import express from "express";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

// Posts are visible to: Students and Alumni only
// Posts cannot be viewed by: Admin users

// Get all posts (with pagination) - Visible to students and alumni
router.get("/", requireAuth, requireRole("student", "alumni"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", "name email alumniProfile studentProfile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Create a new post - Students and Alumni only
router.post("/", requireAuth, requireRole("student", "alumni"), async (req, res) => {
  try {
    const { content, images } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Post content is required" });
    }

    const post = new Post({
      content,
      images: images || [],
      author: req.user._id,
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email alumniProfile studentProfile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name");

    res.status(201).json({ post: populatedPost });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Like/Unlike a post - Students and Alumni only
router.post("/:id/like", requireAuth, requireRole("student", "alumni"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.user._id);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email alumniProfile studentProfile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name");

    res.json({ post: populatedPost });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ error: "Failed to like/unlike post" });
  }
});

// Add a comment to a post - Students and Alumni only
router.post("/:id/comment", requireAuth, requireRole("student", "alumni"), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email alumniProfile studentProfile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name");

    res.json({ post: populatedPost });
  } catch (err) {
    console.error("Comment post error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Update a post (only by author) - Students and Alumni only
router.patch("/:id", requireAuth, requireRole("student", "alumni"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to edit this post" });
    }

    const { content, images } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Post content is required" });
    }

    post.content = content;
    if (images !== undefined) {
      post.images = images;
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email alumniProfile studentProfile")
      .populate("likes", "_id name")
      .populate("comments.user", "_id name");

    res.json({ post: populatedPost });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete a post (only by author) - Students and Alumni only
router.delete("/:id", requireAuth, requireRole("student", "alumni"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
