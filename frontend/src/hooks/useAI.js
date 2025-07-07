import { useState, useCallback } from 'react';
import aiAPI from '../services/aiAPI';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateIdeas = useCallback(async (topic, category, preferences) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiAPI.generateContentIdeas(topic, category, preferences);
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const enhanceContent = useCallback(async (content, type) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiAPI.enhanceContent(content, type);
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeSEO = useCallback(async (title, content, keywords) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiAPI.analyzeSEO(title, content, keywords);
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkGrammar = useCallback(async (content) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiAPI.checkGrammar(content);
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrendingTopics = useCallback(async (timeframe) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiAPI.getTrendingTopics(timeframe);
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateIdeas,
    enhanceContent,
    analyzeSEO,
    checkGrammar,
    getTrendingTopics,
    loading,
    error,
    clearError: () => setError(null)
  };
};
