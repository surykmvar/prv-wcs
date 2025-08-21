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
        console.error('Edge function error:', error);
        // Use fallback topics if the edge function fails
        const fallbackTopics = [
          {
            id: 'fallback-1',
            title: 'Is artificial intelligence truly revolutionizing our world?',
            description: 'AI is everywhere now - from your phone to your job. Some say it\'s the future, others worry about job losses. What\'s your take on the AI revolution?',
            tags: ['AI', 'technology', 'future', 'automation', 'jobs'],
            google_trends_keyword: 'artificial intelligence',
            region: 'US',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            is_active: true
          }
        ];
        setTrendingTopics(fallbackTopics);
        setCurrentIndex(0);
        return;
      }

      if (data?.topics) {
        setTrendingTopics(data.topics);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      
      // Use fallback topics if everything fails
      const fallbackTopics = [
        {
          id: 'fallback-1',
          title: 'Is social media actually connecting us or dividing us?',
          description: 'Social platforms promise to bring us together, but some argue they\'re creating echo chambers. What\'s your experience with social media?',
          tags: ['social-media', 'connection', 'technology', 'society'],
          google_trends_keyword: 'social media impact',
          region: 'US',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        }
      ];
      setTrendingTopics(fallbackTopics);
      setCurrentIndex(0);
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