import React, { useState, useEffect } from "react";
import {
  SparklesIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from "@heroicons/react/24/outline";
import { useAI } from "../../hooks/useAI";
import LoadingSpinner from "../common/LoadingSpinner";

const AIContentAssistant = ({ content, onContentUpdate, title = "", isVisible = true, onToggle }) => {
  const [activeTab, setActiveTab] = useState("ideas");
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    generateIdeas,
    enhanceContent,
    analyzeSEO,
    checkGrammar,
    getTrendingTopics,
    loading,
    error,
    clearError
  } = useAI();

  const tabs = [
    { id: "ideas", label: "Ideas", icon: LightBulbIcon },
    { id: "enhance", label: "Enhance", icon: SparklesIcon },
    { id: "seo", label: "SEO", icon: ChartBarIcon },
    { id: "grammar", label: "Grammar", icon: CheckCircleIcon },
    { id: "trends", label: "Trends", icon: MagnifyingGlassIcon },
  ];

  if (!isVisible) return null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 overflow-hidden" : "relative"
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
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <ArrowsPointingInIcon className="h-4 w-4" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4" />
            )}
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Close AI Assistant"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex justify-between items-center">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`p-4 ${isExpanded ? "max-h-[calc(100vh-200px)] overflow-y-auto" : "max-h-96 overflow-y-auto"}`}>
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="technology">Technology</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
          <option value="travel">Travel</option>
          <option value="food">Food</option>
          <option value="finance">Finance</option>
          <option value="education">Education</option>
        </select>
      </div>

      <button
        onClick={handleGenerateIdeas}
        disabled={loading || !topic.trim()}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Generating...</span>
          </>
        ) : (
          "Generate Ideas"
        )}
      </button>

      {ideas.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Content Ideas:
          </h4>
          {ideas.map((idea, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                {idea.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {idea.description}
              </p>
              {idea.key_points && idea.key_points.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key Points:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {idea.key_points.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {idea.keywords && idea.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {idea.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ContentEnhanceTab = ({ content, enhanceContent, onContentUpdate, loading }) => {
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Enhancing...</span>
          </>
        ) : (
          "Enhance Content"
        )}
      </button>

      {enhancedContent && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Enhanced Content:
          </h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {enhancedContent}
            </p>
          </div>
          <button
            onClick={handleApplyEnhancement}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Apply Enhancement
          </button>
        </div>
      )}
    </div>
  );
};

const SEOAnalysisTab = ({ title, content, analyzeSEO, loading }) => {
  const [keywords, setKeywords] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyzeSEO = async () => {
    if (!title.trim() || !content.trim()) return;

    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const result = await analyzeSEO(title, content, keywordArray);
    if (result.success) {
      setAnalysis(result.data);
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target Keywords (comma-separated)
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleAnalyzeSEO}
        disabled={loading || !title.trim() || !content.trim()}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Analyzing...</span>
          </>
        ) : (
          "Analyze SEO"
        )}
      </button>

      {analysis && (
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              SEO Score: {analysis.seo_score}/100
            </h4>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysis.seo_score}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Word Count:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {analysis.analysis.word_count}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Readability:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {Math.round(analysis.analysis.readability_score)}/100
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Sentences:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {analysis.analysis.sentence_count}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Length:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {Math.round(analysis.analysis.avg_sentence_length)} words
                </span>
              </div>
            </div>
          </div>

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Suggestions:
              </h4>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.type)}`}
                  >
                    <p className="text-sm font-medium">{suggestion.category}</p>
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GrammarCheckTab = ({ content, checkGrammar, loading }) => {
  const [grammarResults, setGrammarResults] = useState(null);

  const handleCheckGrammar = async () => {
    if (!content.trim()) return;

    const result = await checkGrammar(content);
    if (result.success) {
      setGrammarResults(result.data);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckGrammar}
        disabled={loading || !content.trim()}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Checking...</span>
          </>
        ) : (
          "Check Grammar & Style"
        )}
      </button>

      {grammarResults && (
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Grammar Check Results
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Issues Found:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {grammarResults.total_issues}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Word Count:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {grammarResults.word_count}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600 dark:text-gray-400">Readability Score:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {Math.round(grammarResults.readability_score)}/100
                </span>
              </div>
            </div>
          </div>

          {grammarResults.issues && grammarResults.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Issues & Suggestions:
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {grammarResults.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {issue.type}: Line {issue.position + 1}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {issue.suggestion}
                    </p>
                    {issue.sentence && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 italic">
                        "{issue.sentence.substring(0, 100)}..."
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TrendingTopicsTab = ({ getTrendingTopics, loading }) => {
  const [timeframe, setTimeframe] = useState("7d");
  const [trends, setTrends] = useState([]);

  const handleGetTrends = async () => {
    const result = await getTrendingTopics(timeframe);
    if (result.success) {
      setTrends(result.data.trends);
    }
  };

  useEffect(() => {
    handleGetTrends();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timeframe
        </label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <button
        onClick={handleGetTrends}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          "Refresh Trends"
        )}
      </button>

      {trends.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Trending Topics:
          </h4>
          {trends.map((trend, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  {trend.topic}
                </h5>
                <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">
                  {trend.trend_score}%
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Category: {trend.category}
              </p>
              {trend.keywords && trend.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {trend.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIContentAssistant;
