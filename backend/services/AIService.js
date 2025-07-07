const OpenAI = require("openai");
const natural = require("natural");
const compromise = require("compromise");

class AIService {
  constructor() {
    // Initialize OpenAI only if API key is provided
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  // Content Generation & Enhancement
  async generateContentIdeas(topic, category, userPreferences = {}) {
    try {
      if (!this.openai) {
        return this.generateFallbackIdeas(topic, category);
      }

      const prompt = this.buildContentIdeaPrompt(topic, category, userPreferences);

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a creative content strategist. Generate engaging blog post ideas in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const ideas = this.parseContentIdeas(response.choices[0].message.content);
      
      return {
        success: true,
        data: {
          ideas,
          topic,
          category,
        },
      };
    } catch (error) {
      console.error("Error generating content ideas:", error);
      return this.generateFallbackIdeas(topic, category);
    }
  }

  async enhanceContent(content, enhancementType = "improve") {
    try {
      if (!this.openai) {
        return this.enhanceContentFallback(content, enhancementType);
      }

      const prompt = this.buildEnhancementPrompt(content, enhancementType);

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional content editor. Enhance the given content while maintaining its original meaning and structure.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.6,
      });

      return {
        success: true,
        data: {
          enhanced_content: response.choices[0].message.content,
          enhancement_type: enhancementType,
          original_length: content.length,
          enhanced_length: response.choices[0].message.content.length,
        },
      };
    } catch (error) {
      console.error("Error enhancing content:", error);
      return this.enhanceContentFallback(content, enhancementType);
    }
  }

  // SEO Analysis
  async analyzeSEO(title, content, targetKeywords = []) {
    try {
      const analysis = this.performSEOAnalysis(title, content, targetKeywords);
      const suggestions = this.generateSEOSuggestions(analysis);

      return {
        success: true,
        data: {
          analysis,
          suggestions,
          seo_score: this.calculateSEOScore(analysis),
        },
      };
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      return { success: false, error: error.message };
    }
  }

  // Grammar and Style Checking
  async checkGrammarAndStyle(content) {
    try {
      const plainContent = this.stripHtml(content);
      const issues = this.performBasicGrammarCheck(plainContent);
      
      return {
        success: true,
        data: {
          total_issues: issues.length,
          issues,
          readability_score: this.calculateReadabilityScore(plainContent),
          word_count: plainContent.split(/\s+/).length,
        },
      };
    } catch (error) {
      console.error("Error checking grammar:", error);
      return { success: false, error: error.message };
    }
  }

  // Trending Topics Analysis
  async analyzeTrendingTopics(timeframe = "7d") {
    try {
      // Fallback implementation with predefined trending topics
      const trendingTopics = this.getFallbackTrendingTopics();
      
      return {
        success: true,
        data: {
          trends: trendingTopics,
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
      Generate 5 creative blog post ideas for "${topic}" in ${category} category.
      
      Requirements:
      - Each idea should be unique and engaging
      - Include a compelling title
      - Provide a brief description
      - Suggest 3-5 key points to cover
      - Recommend relevant keywords
      
      Format response as JSON array with: title, description, key_points, keywords
    `;
  }

  buildEnhancementPrompt(content, type) {
    const enhancements = {
      improve: "Improve the clarity, flow, and engagement of this content while maintaining its original meaning.",
      expand: "Expand this content with additional details, examples, and insights.",
      summarize: "Create a concise summary of this content, highlighting the key points.",
      rephrase: "Rephrase this content using different words while maintaining the same meaning.",
    };

    return `${enhancements[type] || enhancements.improve}\n\nContent:\n${content}`;
  }

  parseContentIdeas(aiResponse) {
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      // Fallback parsing
      return this.parseFallbackIdeas(aiResponse);
    }
  }

  performSEOAnalysis(title, content, targetKeywords) {
    const plainContent = this.stripHtml(content);
    const wordCount = plainContent.split(/\s+/).length;
    const sentences = plainContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      word_count: wordCount,
      sentence_count: sentences.length,
      avg_sentence_length: sentences.length > 0 ? wordCount / sentences.length : 0,
      title_length: title.length,
      keyword_density: this.calculateKeywordDensity(plainContent, targetKeywords),
      readability_score: this.calculateReadabilityScore(plainContent),
      heading_structure: this.analyzeHeadingStructure(content),
    };
  }

  generateSEOSuggestions(analysis) {
    const suggestions = [];

    if (analysis.word_count < 300) {
      suggestions.push({
        type: "warning",
        category: "content_length",
        message: "Content is too short. Aim for at least 300 words for better SEO.",
        priority: "high",
      });
    }

    if (analysis.title_length < 30) {
      suggestions.push({
        type: "info",
        category: "title",
        message: "Title could be longer. Consider adding more descriptive words.",
        priority: "medium",
      });
    }

    if (analysis.avg_sentence_length > 25) {
      suggestions.push({
        type: "warning",
        category: "readability",
        message: "Average sentence length is too long. Consider breaking down complex sentences.",
        priority: "medium",
      });
    }

    return suggestions;
  }

  performBasicGrammarCheck(content) {
    const issues = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

    sentences.forEach((sentence, index) => {
      // Check sentence length
      if (sentence.split(/\s+/).length > 30) {
        issues.push({
          type: "readability",
          sentence: sentence.trim(),
          suggestion: "Consider breaking this long sentence into shorter ones.",
          position: index,
        });
      }

      // Check for passive voice
      if (this.hasPassiveVoice(sentence)) {
        issues.push({
          type: "style",
          sentence: sentence.trim(),
          suggestion: "Consider using active voice for better engagement.",
          position: index,
        });
      }
    });

    return issues;
  }

  calculateKeywordDensity(content, keywords) {
    const density = {};
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    keywords.forEach(keyword => {
      const keywordCount = words.filter(word => 
        word.includes(keyword.toLowerCase())
      ).length;
      density[keyword] = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
    });

    return density;
  }

  calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    const syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    words.forEach(word => {
      const vowelMatches = word.match(/[aeiouy]+/g);
      syllableCount += vowelMatches ? vowelMatches.length : Math.max(1, word.length / 3);
    });

    return syllableCount;
  }

  analyzeHeadingStructure(content) {
    return {
      h1_count: (content.match(/<h1/g) || []).length,
      h2_count: (content.match(/<h2/g) || []).length,
      h3_count: (content.match(/<h3/g) || []).length,
      h4_count: (content.match(/<h4/g) || []).length,
      h5_count: (content.match(/<h5/g) || []).length,
      h6_count: (content.match(/<h6/g) || []).length,
    };
  }

  hasPassiveVoice(sentence) {
    const passiveIndicators = /\b(was|were|been|being|be)\s+\w+ed\b/i;
    return passiveIndicators.test(sentence);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  calculateSEOScore(analysis) {
    let score = 100;

    if (analysis.word_count < 300) score -= 20;
    if (analysis.readability_score < 50) score -= 15;
    if (analysis.heading_structure.h1_count === 0) score -= 10;
    if (analysis.avg_sentence_length > 25) score -= 10;

    return Math.max(0, score);
  }

  // Fallback methods when OpenAI is not available
  generateFallbackIdeas(topic, category) {
    const fallbackIdeas = [
      {
        title: `The Ultimate Guide to ${topic}`,
        description: `A comprehensive guide covering everything you need to know about ${topic}.`,
        key_points: ["Introduction", "Key concepts", "Best practices", "Common mistakes", "Conclusion"],
        keywords: [topic, category, "guide", "tips", "best practices"]
      },
      {
        title: `5 Ways ${topic} Can Transform Your ${category} Experience`,
        description: `Discover how ${topic} can revolutionize your approach to ${category}.`,
        key_points: ["Current challenges", "Transformation methods", "Real examples", "Implementation tips", "Results"],
        keywords: [topic, category, "transform", "improve", "methods"]
      },
      {
        title: `Common Myths About ${topic} Debunked`,
        description: `Separating fact from fiction in the world of ${topic}.`,
        key_points: ["Popular myths", "The truth", "Scientific evidence", "Expert opinions", "Takeaways"],
        keywords: [topic, "myths", "facts", "truth", "debunked"]
      }
    ];

    return {
      success: true,
      data: {
        ideas: fallbackIdeas,
        topic,
        category,
      },
    };
  }

  enhanceContentFallback(content, type) {
    const enhancedContent = type === "summarize" 
      ? this.summarizeContent(content)
      : this.improveContent(content);

    return {
      success: true,
      data: {
        enhanced_content: enhancedContent,
        enhancement_type: type,
        original_length: content.length,
        enhanced_length: enhancedContent.length,
      },
    };
  }

  summarizeContent(content) {
    const plainContent = this.stripHtml(content);
    const sentences = plainContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Return first 3 sentences as summary
    return sentences.slice(0, 3).join('. ') + '.';
  }

  improveContent(content) {
    // Basic content improvement by adding transitions
    return content.replace(/\. /g, '. Furthermore, ').replace(/Furthermore, Furthermore, /g, 'Additionally, ');
  }

  getFallbackTrendingTopics() {
    return [
      {
        topic: "Artificial Intelligence in Daily Life",
        category: "technology",
        trend_score: 95,
        keywords: ["AI", "machine learning", "automation", "future"],
        content_angles: ["Personal assistants", "Smart homes", "Work productivity"]
      },
      {
        topic: "Sustainable Living Practices",
        category: "lifestyle",
        trend_score: 88,
        keywords: ["sustainability", "eco-friendly", "green living", "environment"],
        content_angles: ["Zero waste", "Renewable energy", "Sustainable fashion"]
      },
      {
        topic: "Remote Work Best Practices",
        category: "business",
        trend_score: 92,
        keywords: ["remote work", "productivity", "work-life balance", "digital nomad"],
        content_angles: ["Home office setup", "Communication tools", "Time management"]
      },
      {
        topic: "Mental Health Awareness",
        category: "health",
        trend_score: 90,
        keywords: ["mental health", "wellness", "self-care", "mindfulness"],
        content_angles: ["Stress management", "Meditation", "Professional help"]
      },
      {
        topic: "Cryptocurrency and DeFi",
        category: "finance",
        trend_score: 85,
        keywords: ["cryptocurrency", "bitcoin", "blockchain", "DeFi"],
        content_angles: ["Investment strategies", "Market analysis", "Risk management"]
      }
    ];
  }

  parseFallbackIdeas(text) {
    // Simple parsing for non-JSON responses
    const lines = text.split('\n').filter(line => line.trim());
    const ideas = [];
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      ideas.push({
        title: lines[i].replace(/^\d+\.\s*/, '').trim(),
        description: `An engaging post about ${lines[i]}`,
        key_points: ["Introduction", "Main content", "Key insights", "Conclusion"],
        keywords: ["blog", "content", "insights"]
      });
    }

    return ideas;
  }
}

module.exports = new AIService();
