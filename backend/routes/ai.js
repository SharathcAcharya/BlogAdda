const express = require("express");
const aiService = require("../services/AIService");
const { protect } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 AI requests per windowMs
  message: "Too many AI requests, please try again later.",
});

// @desc    Generate content ideas
// @route   POST /api/ai/content-ideas
// @access  Private
router.post("/content-ideas", [
  protect,
  aiRateLimit,
  body("topic").isString().isLength({ min: 1, max: 100 }).trim(),
  body("category").optional().isString().isLength({ max: 50 }),
  body("preferences").optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { topic, category = "general", preferences = {} } = req.body;

    const result = await aiService.generateContentIdeas(topic, category, preferences);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate content ideas",
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Content ideas error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating content ideas",
      error: error.message,
    });
  }
});

// @desc    Enhance content
// @route   POST /api/ai/enhance-content
// @access  Private
router.post("/enhance-content", [
  protect,
  aiRateLimit,
  body("content").isString().isLength({ min: 10, max: 10000 }),
  body("enhancement_type").optional().isIn(["improve", "expand", "summarize", "rephrase"])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { content, enhancement_type = "improve" } = req.body;

    const result = await aiService.enhanceContent(content, enhancement_type);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to enhance content",
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Content enhancement error:", error);
    res.status(500).json({
      success: false,
      message: "Server error enhancing content",
      error: error.message,
    });
  }
});

// @desc    SEO optimization analysis
// @route   POST /api/ai/seo-analysis
// @access  Private
router.post("/seo-analysis", [
  protect,
  aiRateLimit,
  body("title").isString().isLength({ min: 1, max: 200 }),
  body("content").isString().isLength({ min: 10, max: 20000 }),
  body("target_keywords").optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { title, content, target_keywords = [] } = req.body;

    const result = await aiService.analyzeSEO(title, content, target_keywords);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to analyze SEO",
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("SEO analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Server error analyzing SEO",
      error: error.message,
    });
  }
});

// @desc    Grammar and style check
// @route   POST /api/ai/grammar-check
// @access  Private
router.post("/grammar-check", [
  protect,
  aiRateLimit,
  body("content").isString().isLength({ min: 10, max: 20000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { content } = req.body;

    const result = await aiService.checkGrammarAndStyle(content);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to check grammar",
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Grammar check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking grammar",
      error: error.message,
    });
  }
});

// @desc    Get trending topics
// @route   GET /api/ai/trending-topics
// @access  Private
router.get("/trending-topics", [
  protect,
  aiRateLimit
], async (req, res) => {
  try {
    const { timeframe = "7d" } = req.query;

    const result = await aiService.analyzeTrendingTopics(timeframe);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to get trending topics",
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Trending topics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting trending topics",
      error: error.message,
    });
  }
});

module.exports = router;
