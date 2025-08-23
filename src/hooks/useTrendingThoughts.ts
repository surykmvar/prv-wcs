import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [feedThoughts, setFeedThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedThought, setShowFeedThought] = useState(false);
  const { toast } = useToast();

  const fetchFeedThoughts = async () => {
    try {
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      // If user is authenticated, exclude thoughts they've already replied to
      if (user) {
        const { data: userReplies } = await supabase
          .from('voice_responses')
          .select('thought_id')
          .eq('user_id', user.id);

        if (userReplies && userReplies.length > 0) {
          const repliedThoughtIds = userReplies.map(r => r.thought_id);
          query = query.not('id', 'in', `(${repliedThoughtIds.join(',')})`);
        }
      }

      const { data: thoughts, error } = await query;

      if (error) {
        console.error('Error fetching feed thoughts:', error);
        return;
      }

      setFeedThoughts(thoughts || []);
    } catch (error) {
      console.error('Error fetching feed thoughts:', error);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);

      // Fetch both trending and feed thoughts in parallel
      await Promise.all([
        fetchCachedTrendingTopics(),
        fetchFeedThoughts()
      ]);
    } catch (error) {
      console.error('Error in fetchTrendingTopics:', error);
      await setFallbackTopics();
    } finally {
      setLoading(false);
    }
  };

  const fetchCachedTrendingTopics = async () => {
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
      // Shuffle the topics for variety
      const shuffled = [...cachedTopics].sort(() => 0.5 - Math.random());
      setTrendingTopics(shuffled);
      return;
    }

    // If no cached topics, trigger refresh
    console.log('No cached topics found, triggering refresh...');
    const { data, error } = await supabase.functions.invoke('fetch-trending-topics', {
      body: { 
        style: 'genz', 
        maxEmojis: 2, 
        forceRefresh: true, // Force refresh initially to see new Gen Z style
        safeMode: 'strict' 
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      await setFallbackTopics();
      return;
    }

    if (data?.topics) {
      const shuffled = [...data.topics].sort(() => 0.5 - Math.random());
      setTrendingTopics(shuffled);
    }
  };

  const setFallbackTopics = async () => {
    const fallbackTopics = [
      {
        id: 'fallback-1',
        title: 'Is AI helping us or low-key replacing us? 🤖😬',
        description: 'Feels smart and super handy, but also kinda scary for jobs. Is AI leveling us up or pushing people out? Drop your hot take. 🔥',
        tags: ['AI', 'jobs', 'automation', 'future', 'tech'],
        google_trends_keyword: 'AI helping vs replacing',
        region: 'US',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        id: 'fallback-2',
        title: 'Are EVs actually greener or just vibes? 🚗⚡',
        description: 'Zero tailpipe ≠ zero impact. Batteries + grid matter. Are EVs the real climate win or overhyped? Be honest. 🌍',
        tags: ['EVs', 'climate', 'environment', 'sustainability', 'cars'],
        google_trends_keyword: 'EVs actually greener',
        region: 'US',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        id: 'fallback-3',
        title: 'Is social media connecting us or frying our brains? 📱🧠',
        description: 'Community feels great, doomscrolling doesn\'t. Are we bonding or burning out? What\'s your screen-time reality? ⏳',
        tags: ['social-media', 'mental-health', 'connection', 'doomscrolling', 'tech'],
        google_trends_keyword: 'social media brain frying',
        region: 'US',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        id: 'fallback-4',
        title: 'Sneaker drops: culture or controlled chaos? 👟🔥',
        description: 'Limited releases got people camping online for hours. Is it about the shoes or the flex? What\'s your sneaker game? 💯',
        tags: ['sneakers', 'fashion', 'culture', 'hype', 'drops'],
        google_trends_keyword: 'sneaker drop culture',
        region: 'US',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }
    ];
    setTrendingTopics(fallbackTopics);
  };

  const refreshCurrentTopic = () => {
    // Alternate between showing trending topics and feed thoughts
    if (showFeedThought && feedThoughts.length > 0) {
      // Switch back to trending topics
      setShowFeedThought(false);
      // Shuffle trending topics for variety
      const shuffled = [...trendingTopics].sort(() => 0.5 - Math.random());
      setTrendingTopics(shuffled);
      setCurrentIndex(0);
    } else if (feedThoughts.length > 0) {
      // Switch to feed thoughts
      setShowFeedThought(true);
      setCurrentIndex(Math.floor(Math.random() * feedThoughts.length));
    } else {
      // Just cycle through trending topics
      if (trendingTopics.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % trendingTopics.length);
      } else {
        fetchTrendingTopics();
      }
    }
  };

  const getCurrentTopic = (): (TrendingTopic & { isFromFeed?: boolean }) | null => {
    if (showFeedThought && feedThoughts.length > 0) {
      const feedThought = feedThoughts[currentIndex];
      if (feedThought) {
        return {
          id: feedThought.id,
          title: feedThought.title,
          description: feedThought.description || 'A thought from the community feed',
          tags: (feedThought.tags || []).slice(0, 3), // Limit to 3 tags
          google_trends_keyword: '',
          region: feedThought.country_code || 'US',
          created_at: feedThought.created_at,
          expires_at: feedThought.expires_at,
          is_active: true,
          isFromFeed: true
        };
      }
    }
    
    const trendingTopic = trendingTopics[currentIndex];
    if (trendingTopic) {
      return {
        ...trendingTopic,
        tags: (trendingTopic.tags || []).slice(0, 3), // Limit to 3 tags
        isFromFeed: false
      };
    }
    
    return null;
  };

  const materializeTrendingTopic = async (trendingTopicId: string, userId: string): Promise<string | null> => {
    try {
      const currentTopic = getCurrentTopic();
      
      // If it's from feed, return the existing thought ID
      if (currentTopic?.isFromFeed) {
        return trendingTopicId; // The ID is already a thought ID
      }

      // Check if we already have a materialized thought for this trending topic
      const { data: existingThought, error: checkError } = await supabase
        .from('thoughts')
        .select('id')
        .eq('title', currentTopic?.title)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing thought:', checkError);
      }

      // If we found an existing thought, return its ID
      if (existingThought) {
        return existingThought.id;
      }

      // Otherwise, materialize the trending topic via edge function
      const { data, error } = await supabase.functions.invoke('materialize-trending', {
        body: {
          trendingTopicId,
          userId
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        // If materialization fails, create a fallback thought
        const { data: fallbackThought, error: fallbackError } = await supabase
          .from('thoughts')
          .insert({
            title: currentTopic?.title || 'Untitled Thought',
            description: currentTopic?.description || '',
            tags: currentTopic?.tags || [],
            user_id: userId,
            thought_scope: 'global',
            max_woices_allowed: 10,
            status: 'active'
          })
          .select()
          .single();

        if (fallbackError) {
          throw fallbackError;
        }

        return fallbackThought.id;
      }

      if (data?.thoughtId) {
        return data.thoughtId;
      }

      throw new Error('No thought ID returned');
    } catch (error) {
      console.error('Error materializing trending topic:', error);
      toast({
        title: 'Error',
        description: 'Unable to start recording. Please try again.',
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
    feedThoughts,
    loading,
    currentTopic: getCurrentTopic(),
    refreshCurrentTopic,
    materializeTrendingTopic,
    fetchTrendingTopics,
    showFeedThought
  };
}