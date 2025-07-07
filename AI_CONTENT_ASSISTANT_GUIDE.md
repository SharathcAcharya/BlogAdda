# 🤖 AI-Powered Content Assistant Implementation

## Overview

Integrate AI capabilities to enhance content creation, optimization, and user experience with OpenAI GPT-4, content analysis, and smart suggestions.

## Installation

```bash
# Backend
cd backend
npm install openai tiktoken compromise natural sentiment

# Frontend
cd frontend
npm install @microsoft/recognizers-text-suite react-markdown-editor-lite
```

## 1. Backend AI Service

### AI Service Core (backend/services/AIService.js)

```javascript
const OpenAI = require("openai");
const natural = require("natural");
const sentiment = require("sentiment");
const compromise = require("compromise");

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.sentimentAnalyzer = new sentiment();
  }

  // Content Generation & Enhancement
  async generateContentIdeas(topic, category, userPreferences = {}) {
    try {
      const prompt = this.buildContentIdeaPrompt(
        topic,
        category,
        userPreferences
      );

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a creative content strategist specializing in blog content ideas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      });

      const ideas = this.parseContentIdeas(response.choices[0].message.content);
      return {
        success: true,
        data: { ideas, topic, category },
      };
    } catch (error) {
      console.error("Error generating content ideas:", error);
      return { success: false, error: error.message };
    }
  }

  async enhanceContent(content, enhancement_type = "improve") {
    try {
      let prompt = "";

      switch (enhancement_type) {
        case "improve":
          prompt = `Improve the following blog content by enhancing clarity, flow, and engagement while maintaining the original meaning:\n\n${content}`;
          break;
        case "expand":
          prompt = `Expand the following blog content with additional details, examples, and insights:\n\n${content}`;
          break;
        case "summarize":
          prompt = `Create a concise summary of the following blog content:\n\n${content}`;
          break;
        case "rephrase":
          prompt = `Rephrase the following content to improve readability and variety:\n\n${content}`;
          break;
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert content editor and writer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      return {
        success: true,
        data: {
          enhanced_content: response.choices[0].message.content,
          enhancement_type,
          original_length: content.length,
          enhanced_length: response.choices[0].message.content.length,
        },
      };
    } catch (error) {
      console.error("Error enhancing content:", error);
      return { success: false, error: error.message };
    }
  }

  // SEO Optimization
  async optimizeForSEO(title, content, targetKeywords = []) {
    try {
      const analysis = await this.analyzeSEO(title, content, targetKeywords);
      const suggestions = await this.generateSEOSuggestions(analysis);

      return {
        success: true,
        data: {
          analysis,
          suggestions,
          seo_score: this.calculateSEOScore(analysis),
        },
      };
    } catch (error) {
      console.error("Error optimizing for SEO:", error);
      return { success: false, error: error.message };
    }
  }

  async analyzeSEO(title, content, targetKeywords) {
    const plainContent = this.stripHtml(content);
    const wordCount = plainContent.split(/\s+/).length;
    const sentences = plainContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Keyword analysis
    const keywordDensity = this.calculateKeywordDensity(
      plainContent,
      targetKeywords
    );

    // Readability analysis
    const readabilityScore = this.calculateReadabilityScore(plainContent);

    // Heading analysis
    const headingStructure = this.analyzeHeadingStructure(content);

    // Meta description analysis
    const metaDescription = this.generateMetaDescription(plainContent);

    return {
      word_count: wordCount,
      sentence_count: sentences.length,
      avg_sentence_length: wordCount / sentences.length,
      keyword_density: keywordDensity,
      readability_score: readabilityScore,
      heading_structure: headingStructure,
      suggested_meta_description: metaDescription,
      content_structure: this.analyzeContentStructure(content),
    };
  }

  async generateSEOSuggestions(analysis) {
    const suggestions = [];

    if (analysis.word_count < 300) {
      suggestions.push({
        type: "warning",
        category: "content_length",
        message:
          "Content is too short. Aim for at least 300 words for better SEO.",
        priority: "high",
      });
    }

    if (analysis.avg_sentence_length > 25) {
      suggestions.push({
        type: "warning",
        category: "readability",
        message:
          "Average sentence length is too long. Break down complex sentences.",
        priority: "medium",
      });
    }

    if (analysis.heading_structure.h1_count === 0) {
      suggestions.push({
        type: "error",
        category: "structure",
        message: "Missing H1 heading. Add a main heading to your content.",
        priority: "high",
      });
    }

    return suggestions;
  }

  // Grammar and Style Checking
  async checkGrammarAndStyle(content) {
    try {
      const plainContent = this.stripHtml(content);

      // Basic grammar check using natural language processing
      const sentences = natural.SentenceTokenizer.tokenize(plainContent);
      const issues = [];

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];

        // Check for passive voice
        if (this.hasPassiveVoice(sentence)) {
          issues.push({
            type: "style",
            category: "passive_voice",
            sentence: sentence,
            suggestion: "Consider using active voice for better engagement.",
            position: i,
          });
        }

        // Check sentence length
        if (sentence.split(/\s+/).length > 30) {
          issues.push({
            type: "readability",
            category: "sentence_length",
            sentence: sentence,
            suggestion:
              "This sentence is quite long. Consider breaking it into shorter sentences.",
            position: i,
          });
        }
      }

      // Advanced grammar check with OpenAI
      const aiResponse = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional proofreader. Identify grammar, spelling, and style issues in the following text. Return a JSON array of issues with type, description, suggestion, and the problematic text.",
          },
          {
            role: "user",
            content: plainContent.substring(0, 2000), // Limit to avoid token limits
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      let aiIssues = [];
      try {
        aiIssues = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.warn("Could not parse AI grammar response");
      }

      return {
        success: true,
        data: {
          total_issues: issues.length + aiIssues.length,
          basic_issues: issues,
          ai_issues: aiIssues,
          readability_score: this.calculateReadabilityScore(plainContent),
          sentiment_analysis: this.sentimentAnalyzer.analyze(plainContent),
        },
      };
    } catch (error) {
      console.error("Error checking grammar:", error);
      return { success: false, error: error.message };
    }
  }

  // Content Personalization
  async personalizeContent(content, userProfile) {
    try {
      const prompt = `
        Personalize the following content for a user with these preferences:
        - Interests: ${userProfile.interests?.join(", ") || "general"}
        - Reading level: ${userProfile.reading_level || "intermediate"}
        - Preferred tone: ${userProfile.preferred_tone || "conversational"}
        - Topics of interest: ${
          userProfile.favorite_categories?.join(", ") || "general"
        }
        
        Content to personalize:
        ${content}
        
        Make the content more engaging and relevant to this user while maintaining the core message.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a content personalization expert.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      });

      return {
        success: true,
        data: {
          personalized_content: response.choices[0].message.content,
          personalization_factors: {
            interests: userProfile.interests,
            reading_level: userProfile.reading_level,
            tone: userProfile.preferred_tone,
          },
        },
      };
    } catch (error) {
      console.error("Error personalizing content:", error);
      return { success: false, error: error.message };
    }
  }

  // Trending Topics Analysis
  async analyzeTrendingTopics(timeframe = "7d") {
    try {
      // This would typically integrate with Google Trends API, Twitter API, etc.
      // For now, we'll simulate with a simple implementation

      const prompt = `
        Based on current trends in technology, lifestyle, business, and general topics, 
        suggest 10 trending blog topics that would be relevant for the next ${timeframe}.
        Focus on topics that are gaining popularity and would generate good engagement.
        
        Format the response as a JSON array with objects containing:
        - topic: the trending topic
        - category: the content category
        - trend_score: estimated popularity (1-100)
        - keywords: relevant keywords array
        - content_angles: suggested approaches to the topic
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a trend analysis expert specializing in content marketing and viral topics.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      });

      let trends = [];
      try {
        trends = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        // Fallback parsing if JSON is malformed
        trends = this.parseTrendsFromText(response.choices[0].message.content);
      }

      return {
        success: true,
        data: {
          trends,
          timeframe,
          generated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error analyzing trending topics:", error);
      return { success: false, error: error.message };
    }
  }

  // Helper Methods
  buildContentIdeaPrompt(topic, category, preferences) {
    return `
      Generate 5 creative and engaging blog post ideas for the topic "${topic}" in the ${category} category.
      
      User preferences:
      - Writing style: ${preferences.style || "informative"}
      - Target audience: ${preferences.audience || "general"}
      - Content format: ${preferences.format || "article"}
      
      For each idea, provide:
      1. A compelling title
      2. Brief description (2-3 sentences)
      3. Key points to cover
      4. Estimated reading time
      5. SEO keywords suggestions
      
      Format as JSON array with these fields: title, description, key_points, reading_time, keywords
    `;
  }

  parseContentIdeas(aiResponse) {
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      // Fallback parsing if JSON is malformed
      const ideas = [];
      const lines = aiResponse.split("\n").filter((line) => line.trim());

      for (let i = 0; i < lines.length; i += 5) {
        if (lines[i]) {
          ideas.push({
            title: lines[i].replace(/^\d+\.\s*/, "").trim(),
            description: lines[i + 1] || "",
            key_points: (lines[i + 2] || "").split(",").map((p) => p.trim()),
            reading_time: 5,
            keywords: (lines[i + 3] || "").split(",").map((k) => k.trim()),
          });
        }
      }

      return ideas;
    }
  }

  calculateKeywordDensity(content, keywords) {
    const density = {};
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    keywords.forEach((keyword) => {
      const keywordCount = words.filter((word) =>
        word.includes(keyword.toLowerCase())
      ).length;
      density[keyword] = (keywordCount / totalWords) * 100;
    });

    return density;
  }

  calculateReadabilityScore(content) {
    // Simplified Flesch Reading Ease score
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const words = content.split(/\s+/);
    const syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const score =
      206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    return Math.max(0, Math.min(100, score));
  }

  countSyllables(text) {
    // Simple syllable counting algorithm
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    words.forEach((word) => {
      const vowelMatches = word.match(/[aeiouy]+/g);
      syllableCount += vowelMatches ? vowelMatches.length : 1;
    });

    return syllableCount;
  }

  analyzeHeadingStructure(content) {
    const headings = {
      h1_count: (content.match(/<h1/g) || []).length,
      h2_count: (content.match(/<h2/g) || []).length,
      h3_count: (content.match(/<h3/g) || []).length,
      h4_count: (content.match(/<h4/g) || []).length,
      h5_count: (content.match(/<h5/g) || []).length,
      h6_count: (content.match(/<h6/g) || []).length,
    };

    return headings;
  }

  analyzeContentStructure(content) {
    return {
      paragraph_count: (content.match(/<p>/g) || []).length,
      list_count: (content.match(/<ul>|<ol>/g) || []).length,
      image_count: (content.match(/<img/g) || []).length,
      link_count: (content.match(/<a\s+href/g) || []).length,
      blockquote_count: (content.match(/<blockquote>/g) || []).length,
    };
  }

  generateMetaDescription(content) {
    const plainText = this.stripHtml(content);
    const sentences = plainText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    if (sentences.length === 0) return "";

    let metaDescription = sentences[0].trim();
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + "...";
    }

    return metaDescription;
  }

  hasPassiveVoice(sentence) {
    // Simple passive voice detection
    const passiveIndicators = /\b(was|were|been|being|be)\s+\w+ed\b/i;
    return passiveIndicators.test(sentence);
  }

  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  calculateSEOScore(analysis) {
    let score = 100;

    // Word count penalty
    if (analysis.word_count < 300) score -= 20;
    else if (analysis.word_count < 500) score -= 10;

    // Readability penalty
    if (analysis.readability_score < 30) score -= 15;
    else if (analysis.readability_score < 50) score -= 10;

    // Heading structure penalty
    if (analysis.heading_structure.h1_count === 0) score -= 15;
    if (analysis.heading_structure.h2_count === 0) score -= 10;

    // Average sentence length penalty
    if (analysis.avg_sentence_length > 25) score -= 10;

    return Math.max(0, score);
  }

  parseTrendsFromText(text) {
    // Fallback method to extract trends from non-JSON response
    const lines = text.split("\n").filter((line) => line.trim());
    const trends = [];

    lines.forEach((line, index) => {
      if (line.match(/^\d+\./) || line.includes("Topic:")) {
        trends.push({
          topic: line
            .replace(/^\d+\.\s*/, "")
            .replace("Topic:", "")
            .trim(),
          category: "general",
          trend_score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          keywords: [],
          content_angles: [],
        });
      }
    });

    return trends.slice(0, 10); // Limit to 10 trends
  }
}

module.exports = new AIService();
```

### AI Routes (backend/routes/ai.js)

```javascript
const express = require("express");
const aiService = require("../services/AIService");
const { protect } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

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
router.post("/content-ideas", protect, aiRateLimit, async (req, res) => {
  try {
    const { topic, category, preferences } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const result = await aiService.generateContentIdeas(
      topic,
      category,
      preferences
    );

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
router.post("/enhance-content", protect, aiRateLimit, async (req, res) => {
  try {
    const { content, enhancement_type } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

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
router.post("/seo-analysis", protect, aiRateLimit, async (req, res) => {
  try {
    const { title, content, target_keywords } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const result = await aiService.optimizeForSEO(
      title,
      content,
      target_keywords
    );

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
router.post("/grammar-check", protect, aiRateLimit, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

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
router.get("/trending-topics", protect, aiRateLimit, async (req, res) => {
  try {
    const { timeframe } = req.query;

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
    res.status(500).json({
      success: false,
      message: "Server error getting trending topics",
      error: error.message,
    });
  }
});

// @desc    Personalize content
// @route   POST /api/ai/personalize-content
// @access  Private
router.post("/personalize-content", protect, aiRateLimit, async (req, res) => {
  try {
    const { content, user_profile } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const result = await aiService.personalizeContent(content, user_profile);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to personalize content",
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error personalizing content",
      error: error.message,
    });
  }
});

module.exports = router;
```

## 2. Frontend AI Components

### AI Content Assistant (frontend/src/components/ai/AIContentAssistant.jsx)

```jsx
import React, { useState } from "react";
import {
  SparklesIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useAI } from "../../hooks/useAI";

const AIContentAssistant = ({ content, onContentUpdate, title = "" }) => {
  const [activeTab, setActiveTab] = useState("ideas");
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    generateIdeas,
    enhanceContent,
    analyzeSEO,
    checkGrammar,
    getTrendingTopics,
    loading,
  } = useAI();

  const tabs = [
    { id: "ideas", label: "Ideas", icon: LightBulbIcon },
    { id: "enhance", label: "Enhance", icon: SparklesIcon },
    { id: "seo", label: "SEO", icon: ChartBarIcon },
    { id: "grammar", label: "Grammar", icon: CheckCircleIcon },
    { id: "trends", label: "Trends", icon: MagnifyingGlassIcon },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50" : "relative"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Assistant
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? "📉" : "📈"}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === "ideas" && (
          <ContentIdeasTab generateIdeas={generateIdeas} loading={loading} />
        )}

        {activeTab === "enhance" && (
          <ContentEnhanceTab
            content={content}
            enhanceContent={enhanceContent}
            onContentUpdate={onContentUpdate}
            loading={loading}
          />
        )}

        {activeTab === "seo" && (
          <SEOAnalysisTab
            title={title}
            content={content}
            analyzeSEO={analyzeSEO}
            loading={loading}
          />
        )}

        {activeTab === "grammar" && (
          <GrammarCheckTab
            content={content}
            checkGrammar={checkGrammar}
            loading={loading}
          />
        )}

        {activeTab === "trends" && (
          <TrendingTopicsTab
            getTrendingTopics={getTrendingTopics}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// Individual Tab Components
const ContentIdeasTab = ({ generateIdeas, loading }) => {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("technology");
  const [ideas, setIdeas] = useState([]);

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) return;

    const result = await generateIdeas(topic, category);
    if (result.success) {
      setIdeas(result.data.ideas);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic for content ideas..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="technology">Technology</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
          <option value="travel">Travel</option>
          <option value="food">Food</option>
        </select>
      </div>

      <button
        onClick={handleGenerateIdeas}
        disabled={loading || !topic.trim()}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generating..." : "Generate Ideas"}
      </button>

      {ideas.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Content Ideas:
          </h4>
          {ideas.map((idea, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                {idea.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {idea.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {idea.keywords?.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ContentEnhanceTab = ({
  content,
  enhanceContent,
  onContentUpdate,
  loading,
}) => {
  const [enhancementType, setEnhancementType] = useState("improve");
  const [enhancedContent, setEnhancedContent] = useState("");

  const handleEnhance = async () => {
    if (!content.trim()) return;

    const result = await enhanceContent(content, enhancementType);
    if (result.success) {
      setEnhancedContent(result.data.enhanced_content);
    }
  };

  const handleApplyEnhancement = () => {
    if (enhancedContent && onContentUpdate) {
      onContentUpdate(enhancedContent);
      setEnhancedContent("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enhancement Type
        </label>
        <select
          value={enhancementType}
          onChange={(e) => setEnhancementType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="improve">Improve Quality</option>
          <option value="expand">Expand Content</option>
          <option value="summarize">Summarize</option>
          <option value="rephrase">Rephrase</option>
        </select>
      </div>

      <button
        onClick={handleEnhance}
        disabled={loading || !content.trim()}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Enhancing..." : "Enhance Content"}
      </button>

      {enhancedContent && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Enhanced Content:
          </h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {enhancedContent}
            </p>
          </div>
          <button
            onClick={handleApplyEnhancement}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Apply Enhancement
          </button>
        </div>
      )}
    </div>
  );
};

// Additional tab components would follow similar patterns...

export default AIContentAssistant;
```

### AI Hook (frontend/src/hooks/useAI.js)

```javascript
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const generateIdeas = async (topic, category, preferences = {}) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/ai/content-ideas", {
        topic,
        category,
        preferences,
      });

      toast.success("Content ideas generated successfully!");
      return response.data;
    } catch (error) {
      toast.error("Failed to generate content ideas");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const enhanceContent = async (content, enhancementType) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/ai/enhance-content", {
        content,
        enhancement_type: enhancementType,
      });

      toast.success("Content enhanced successfully!");
      return response.data;
    } catch (error) {
      toast.error("Failed to enhance content");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const analyzeSEO = async (title, content, targetKeywords = []) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/ai/seo-analysis", {
        title,
        content,
        target_keywords: targetKeywords,
      });

      return response.data;
    } catch (error) {
      toast.error("Failed to analyze SEO");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkGrammar = async (content) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/ai/grammar-check", {
        content,
      });

      return response.data;
    } catch (error) {
      toast.error("Failed to check grammar");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getTrendingTopics = async (timeframe = "7d") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/ai/trending-topics?timeframe=${timeframe}`
      );

      return response.data;
    } catch (error) {
      toast.error("Failed to get trending topics");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    generateIdeas,
    enhanceContent,
    analyzeSEO,
    checkGrammar,
    getTrendingTopics,
    loading,
  };
};
```

## 3. Environment Setup

Add to backend/.env:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Add AI routes to backend/server.js:

```javascript
app.use("/api/ai", require("./routes/ai"));
```

## Expected Features

✅ **Content Idea Generation** - AI-powered blog topic suggestions  
✅ **Content Enhancement** - Improve, expand, or rephrase existing content  
✅ **SEO Optimization** - Analyze and optimize content for search engines  
✅ **Grammar & Style Check** - Professional proofreading assistance  
✅ **Trending Topics** - Discover what's popular in your niche  
✅ **Content Personalization** - Tailor content to specific audiences

This AI implementation will revolutionize content creation on BlogAdda, making it easier for writers to create high-quality, engaging, and optimized content!
