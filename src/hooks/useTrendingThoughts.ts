import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrendingTopic {
  id: string;
  title: string;
  description: string;
  tags: string[];
  google_trends_keyword: string;
  region: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export function useTrendingThoughts() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);

      // First try to get cached topics
      const { data: cachedTopics, error: cacheError } = await supabase
        .from('trending_topics_cache')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(15);

      if (cacheError) {
        console.error('Error fetching cached topics:', cacheError);
      }

      if (cachedTopics && cachedTopics.length > 0) {
        setTrendingTopics(cachedTopics);
        setCurrentIndex(0);
        return;
      }

      // If no cached topics, trigger refresh
      console.log('No cached topics found, triggering refresh...');
      const { data, error } = await supabase.functions.invoke('fetch-trending-topics', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (data?.topics) {
        setTrendingTopics(data.topics);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trending topics. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentTopic = () => {
    if (trendingTopics.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % trendingTopics.length);
    } else {
      // If only one topic or none, fetch new ones
      fetchTrendingTopics();
    }
  };

  const getCurrentTopic = (): TrendingTopic | null => {
    return trendingTopics[currentIndex] || null;
  };

  const materializeTrendingTopic = async (trendingTopicId: string, userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('materialize-trending', {
        body: {
          trendingTopicId,
          userId
        }
      });

      if (error) {
        throw error;
      }

      if (data?.thoughtId) {
        return data.thoughtId;
      }

      throw new Error('No thought ID returned');
    } catch (error) {
      console.error('Error materializing trending topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to create thought. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  return {
    trendingTopics,
    loading,
    currentTopic: getCurrentTopic(),
    refreshCurrentTopic,
    materializeTrendingTopic,
    fetchTrendingTopics
  };
}