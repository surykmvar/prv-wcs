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

// Goofy fallback topics with emojis and fun tone
const fallbackTopics = [
  {
    keyword: "AI taking over",
    title: "Will AI robots steal our jobs or just help us work in pajamas? 🤖",
    description: "Some say robots will replace us all, others think they'll just make life easier. Maybe they'll just remind us to take more coffee breaks?",
    tags: ["AI", "jobs", "robots", "automation", "future"]
  },
  {
    keyword: "pineapple pizza debate",
    title: "Is pineapple on pizza a crime against humanity? 🍕",
    description: "The eternal food fight continues. Team pineapple says it's sweet perfection, while purists claim it's absolute chaos. Where do you stand in this delicious war?",
    tags: ["pizza", "pineapple", "food", "debate", "taste"]
  },
  {
    keyword: "remote work pajamas",
    title: "Should pajama pants be considered business attire? 👔",
    description: "Working from home has blurred the lines between sleepwear and office wear. Some say comfort equals productivity, others miss actual pants.",
    tags: ["remote-work", "fashion", "comfort", "productivity", "workplace"]
  },
  {
    keyword: "social media scrolling",
    title: "Is endless scrolling turning us into phone zombies? 📱",
    description: "We scroll, we like, we scroll some more. But are we actually connecting with people or just feeding the algorithm monster?",
    tags: ["social-media", "technology", "scrolling", "connection", "habits"]
  },
  {
    keyword: "avocado toast economics",
    title: "Did avocado toast really kill the housing market? 🥑",
    description: "Millennials love their green gold on bread, but some say this breakfast trend cost them homeownership. Is brunch really that powerful?",
    tags: ["avocado", "millennials", "housing", "food-trends", "economics"]
  },
  {
    keyword: "streaming subscription chaos",
    title: "Do we need 47 different streaming services to watch TV? 📺",
    description: "Remember when Netflix had everything? Now we need a spreadsheet to track our subscriptions. Is convenience becoming inconvenient?",
    tags: ["streaming", "subscriptions", "entertainment", "netflix", "TV"]
  }
];

// Emoji category mapping for heuristic generation
const emojiMap: Record<string, string[]> = {
  'AI': ['🤖', '🧠', '⚡'],
  'tech': ['💻', '📱', '🔧'],
  'climate': ['🌍', '♻️', '🌱'],
  'food': ['🍕', '🥑', '🍔'],
  'work': ['💼', '👔', '💻'],
  'social': ['📱', '💬', '👥'],
  'streaming': ['📺', '🎬', '🍿'],
  'gaming': ['🎮', '🕹️', '👾'],
  'fashion': ['👕', '👟', '✨'],
  'music': ['🎵', '🎤', '🎧'],
  'space': ['🚀', '🌟', '🪐'],
  'crypto': ['💰', '📈', '🪙']
};

async function generateDebateQuestion(
  keyword: string, 
  style: string = 'goofy', 
  maxEmojis: number = 2, 
  safeMode: boolean = true
): Promise<{ title: string; description: string; tags: string[] }> {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIKey) {
    console.log('No OpenAI key found, using heuristic generation');
    return generateHeuristicQuestion(keyword, maxEmojis);
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
            content: style === 'goofy' ? 
              `You are a fun, goofy debate question generator for "Woices" - a voice social platform. Create lighthearted, playful questions that spark friendly debates.

STYLE GUIDELINES:
- Keep it fun and goofy, but not childish
- Use 0-${maxEmojis} emojis MAX (keep it balanced, not emoji spam)
- Avoid sensitive topics like politics, religion, serious social issues
- Focus on everyday debates, pop culture, food, tech, lifestyle
- Make it conversational and relatable
${safeMode ? '- Keep content family-friendly and non-controversial' : ''}

FORMAT (JSON only):
{
  "title": "A fun, goofy question that sparks debate (max 90 chars including emojis)",
  "description": "A playful explanation presenting both sides, ending with an engaging question (max 240 chars)",
  "tags": ["5-7 relevant hashtags without # symbol"]
}

EXAMPLES:
- "Is cereal soup or just breakfast? 🥣"
- "Should socks with sandals be illegal? 👡"
- "Are hot dogs sandwiches or their own thing? 🌭"` 
              :
              `You are a debate question generator for a voice social platform called "Woices". Generate engaging, thought-provoking debate questions from trending topics. 

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
        title: parsed.title.substring(0, style === 'goofy' ? 90 : 100),
        description: parsed.description.substring(0, style === 'goofy' ? 240 : 280),
        tags: parsed.tags.slice(0, 7)
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return generateHeuristicQuestion(keyword, maxEmojis);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateHeuristicQuestion(keyword, maxEmojis);
  }
}

function generateHeuristicQuestion(keyword: string, maxEmojis: number = 2): { title: string; description: string; tags: string[] } {
  const goofyStarters = [
    "Is", "Should", "Can", "Will", "Are", "Do", "Does"
  ];
  
  const goofyEndings = [
    "actually a thing? 🤔",
    "the future or just hype?",
    "worth the drama? 😅", 
    "genius or madness?",
    "changing everything? ✨",
    "overrated or underrated?",
    "a game changer? 🎮"
  ];

  // Find relevant emojis based on keyword
  let relevantEmojis: string[] = [];
  for (const [category, emojis] of Object.entries(emojiMap)) {
    if (keyword.toLowerCase().includes(category)) {
      relevantEmojis = emojis;
      break;
    }
  }
  
  const starter = goofyStarters[Math.floor(Math.random() * goofyStarters.length)];
  const ending = goofyEndings[Math.floor(Math.random() * goofyEndings.length)];
  
  // Add emoji if we found relevant ones and maxEmojis allows it
  let emoji = '';
  if (relevantEmojis.length > 0 && maxEmojis > 0 && Math.random() > 0.3) {
    emoji = ' ' + relevantEmojis[Math.floor(Math.random() * relevantEmojis.length)];
  }
  
  const title = `${starter} ${keyword} ${ending}${emoji}`.substring(0, 90);
  const description = `People are split on this one! Some are totally here for it, others think it's overrated. What's your hot take on ${keyword}?`;
  
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
    // Parse request parameters
    let style = 'goofy';
    let maxEmojis = 2;
    let forceRefresh = false;
    let safeMode = true;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        style = body.style || 'goofy';
        maxEmojis = body.maxEmojis ?? 2;
        forceRefresh = body.forceRefresh || false;
        safeMode = body.safeMode ?? true;
      } catch (e) {
        console.log('No valid JSON body, using defaults');
      }
    }
    
    console.log(`Fetching trending topics with style: ${style}, maxEmojis: ${maxEmojis}, forceRefresh: ${forceRefresh}`);
    
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

    // If we have enough recent topics and not forcing refresh, return them
    if (!forceRefresh && existingTopics && existingTopics.length >= 10) {
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
        const question = await generateDebateQuestion(keyword, style, maxEmojis, safeMode);
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