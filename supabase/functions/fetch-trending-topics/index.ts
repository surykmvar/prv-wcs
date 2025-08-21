import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback trending topics if Google Trends or OpenAI fails
const fallbackTopics = [
  {
    keyword: "climate change solutions",
    title: "Is renewable energy truly the answer to climate change?",
    description: "While solar and wind power are booming, critics argue they're unreliable and expensive. Supporters say they're our only hope. What's your take on the green energy revolution?",
    tags: ["climate", "energy", "environment", "renewable", "future"]
  },
  {
    keyword: "artificial intelligence jobs",
    title: "Will AI replace more jobs than it creates?",
    description: "Tech optimists claim AI will create new opportunities, but skeptics worry about mass unemployment. History shows technology can be disruptive—but is this time different?",
    tags: ["AI", "jobs", "technology", "automation", "future"]
  },
  {
    keyword: "remote work productivity",
    title: "Are remote workers actually more productive?",
    description: "Some swear by working from home, citing fewer distractions and better work-life balance. Others argue nothing beats face-to-face collaboration. Where do you stand?",
    tags: ["remote-work", "productivity", "workplace", "hybrid", "collaboration"]
  },
  {
    keyword: "social media mental health",
    title: "Is social media destroying our mental health?",
    description: "Studies link social platforms to anxiety and depression, especially in teens. But others argue social media helps people connect and find communities. What's your experience?",
    tags: ["social-media", "mental-health", "technology", "youth", "connection"]
  },
  {
    keyword: "electric vehicles adoption",
    title: "Are electric cars really better for the environment?",
    description: "EVs promise zero emissions, but manufacturing batteries creates pollution. Plus, the power grid still relies heavily on fossil fuels. Is electric really greener?",
    tags: ["electric-cars", "environment", "transportation", "battery", "green-tech"]
  }
];

async function generateDebateQuestion(keyword: string): Promise<{ title: string; description: string; tags: string[] }> {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIKey) {
    console.log('No OpenAI key found, using heuristic generation');
    return generateHeuristicQuestion(keyword);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a debate question generator for a voice social platform called "Woices". Generate engaging, thought-provoking debate questions from trending topics. 

Format your response as JSON:
{
  "title": "A provocative question that sparks debate (max 100 chars)",
  "description": "A conversational explanation that presents both sides and ends with a question to engage users (max 280 chars)",
  "tags": ["5-7 relevant hashtags without # symbol"]
}

Make questions balanced, avoiding extreme political stances. Focus on topics people genuinely debate about.`
          },
          {
            role: 'user',
            content: `Create a debate question around this trending topic: "${keyword}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title.substring(0, 100),
        description: parsed.description.substring(0, 280),
        tags: parsed.tags.slice(0, 7)
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return generateHeuristicQuestion(keyword);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateHeuristicQuestion(keyword);
  }
}

function generateHeuristicQuestion(keyword: string): { title: string; description: string; tags: string[] } {
  // Simple heuristic question generation based on keyword patterns
  const questionStarters = [
    "Is", "Should", "Will", "Can", "Does", "Are", "Has"
  ];
  
  const engagingEndings = [
    "really worth it?",
    "the right approach?",
    "actually effective?",
    "a good idea?",
    "changing our world?",
    "the future?",
    "helping or hurting us?"
  ];

  const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
  const ending = engagingEndings[Math.floor(Math.random() * engagingEndings.length)];
  
  const title = `${starter} ${keyword} ${ending}`;
  const description = `This trending topic has people divided. Some say it's revolutionary, others aren't convinced. What's your take on ${keyword}?`;
  
  // Generate tags from keyword
  const tags = keyword.toLowerCase()
    .split(/[\s\-]+/)
    .filter(word => word.length > 2)
    .slice(0, 5);
  
  return { title, description, tags };
}

async function fetchGoogleTrends(): Promise<string[]> {
  // Since we can't use Python's pytrends directly in Deno,
  // we'll use a combination of approaches or call an external service
  // For now, return some trending keywords as a placeholder
  // In production, this could call a separate Python service or use Google Trends API
  
  const trendingKeywords = [
    "artificial intelligence",
    "climate change",
    "remote work",
    "electric vehicles",
    "cryptocurrency",
    "social media",
    "renewable energy",
    "space exploration",
    "mental health",
    "automation",
    "streaming services",
    "online education",
    "food delivery",
    "virtual reality",
    "sustainable fashion"
  ];
  
  // Shuffle and return 10-15 keywords
  const shuffled = trendingKeywords.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 12 + Math.floor(Math.random() * 4)); // 12-15 items
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching trending topics...');
    
    // Check if we have recent cached topics (less than 12 hours old)
    const { data: existingTopics, error: fetchError } = await supabase
      .from('trending_topics_cache')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()); // 12 hours ago

    if (fetchError) {
      console.error('Error fetching existing topics:', fetchError);
    }

    // If we have enough recent topics, return them
    if (existingTopics && existingTopics.length >= 10) {
      console.log(`Found ${existingTopics.length} cached topics, skipping refresh`);
      return new Response(
        JSON.stringify({ 
          message: 'Using cached topics',
          topics: existingTopics.slice(0, 15),
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch new trending topics
    console.log('Generating new trending topics...');
    
    let keywords: string[];
    try {
      keywords = await fetchGoogleTrends();
    } catch (error) {
      console.error('Failed to fetch Google Trends, using fallback:', error);
      keywords = fallbackTopics.map(t => t.keyword);
    }

    const newTopics = [];
    
    // Generate debate questions for each keyword
    for (const keyword of keywords) {
      try {
        const question = await generateDebateQuestion(keyword);
        newTopics.push({
          title: question.title,
          description: question.description,
          tags: question.tags,
          google_trends_keyword: keyword,
          region: 'US'
        });
      } catch (error) {
        console.error(`Failed to generate question for "${keyword}":`, error);
        // Use fallback if available
        const fallback = fallbackTopics.find(t => t.keyword.includes(keyword.split(' ')[0]));
        if (fallback) {
          newTopics.push({
            title: fallback.title,
            description: fallback.description,
            tags: fallback.tags,
            google_trends_keyword: keyword,
            region: 'US'
          });
        }
      }
    }

    // Deactivate old topics
    await supabase
      .from('trending_topics_cache')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new topics
    const { data: insertedTopics, error: insertError } = await supabase
      .from('trending_topics_cache')
      .insert(newTopics)
      .select();

    if (insertError) {
      console.error('Error inserting topics:', insertError);
      throw insertError;
    }

    console.log(`Successfully cached ${insertedTopics?.length || 0} new trending topics`);

    return new Response(
      JSON.stringify({ 
        message: 'Successfully refreshed trending topics',
        topics: insertedTopics,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-trending-topics:', error);
    
    // Return fallback topics if everything fails
    const fallbackResponse = fallbackTopics.map((topic, index) => ({
      id: `fallback-${index}`,
      title: topic.title,
      description: topic.description,
      tags: topic.tags,
      google_trends_keyword: topic.keyword,
      region: 'US',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }));
    
    return new Response(
      JSON.stringify({ 
        topics: fallbackResponse,
        fallback: true,
        message: 'Using fallback topics due to service error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});