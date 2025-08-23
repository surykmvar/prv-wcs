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

// Gen Z style fallback topics with authentic vibe and emojis
const fallbackTopics = [
  {
    keyword: "AI helping vs replacing",
    title: "Is AI helping us or low-key replacing us? 🤖😬",
    description: "Feels smart and super handy, but also kinda scary for jobs. Is AI leveling us up or pushing people out? Drop your hot take. 🔥",
    tags: ["AI", "jobs", "automation", "future", "tech"]
  },
  {
    keyword: "EVs actually greener",
    title: "Are EVs actually greener or just vibes? 🚗⚡",
    description: "Zero tailpipe ≠ zero impact. Batteries + grid matter. Are EVs the real climate win or overhyped? Be honest. 🌍",
    tags: ["EVs", "climate", "environment", "sustainability", "cars"]
  },
  {
    keyword: "social media brain frying",
    title: "Is social media connecting us or frying our brains? 📱🧠",
    description: "Community feels great, doomscrolling doesn't. Are we bonding or burning out? What's your screen-time reality? ⏳",
    tags: ["social-media", "mental-health", "connection", "doomscrolling", "tech"]
  },
  {
    keyword: "streaming subscription chaos",
    title: "Are we watching shows or just hunting for what to watch? 🎬🍿",
    description: "Netflix, Hulu, Disney+, HBO... the list never ends. We spend more time browsing than watching. Is streaming broken? 💸",
    tags: ["streaming", "entertainment", "subscriptions", "decision-fatigue", "TV"]
  },
  {
    keyword: "sneaker drop culture",
    title: "Sneaker drops: culture or controlled chaos? 👟🔥",
    description: "Limited releases got people camping online for hours. Is it about the shoes or the flex? What's your sneaker game? 💯",
    tags: ["sneakers", "fashion", "culture", "hype", "drops"]
  },
  {
    keyword: "remote work pajamas",
    title: "Are we actually productive in pajamas or just pretending? 🏠💼",
    description: "WFH life hits different. Some thrive, others miss the office energy. Is remote work the future or are we losing something? 🤔",
    tags: ["remote-work", "productivity", "lifestyle", "work-culture", "pajamas"]
  },
  {
    keyword: "crypto still relevant",
    title: "Is crypto dead or just taking a nap? 🪙😴",
    description: "From moon shots to major crashes, crypto's been wild. Still believing in digital money or moving on? Where you at? 📈",
    tags: ["crypto", "bitcoin", "investing", "finance", "digital-money"]
  },
  {
    keyword: "influencer authenticity",
    title: "Are influencers actually influential or just really good at selfies? 📸✨",
    description: "Everyone's an influencer now, but who's actually influencing? Is it authentic connection or just aesthetic game? Spill. 💭",
    tags: ["influencers", "social-media", "authenticity", "marketing", "content"]
  }
];

// Enhanced emoji category mapping for Gen Z style generation
const emojiMap: Record<string, string[]> = {
  'AI': ['🤖', '🧠', '⚡'],
  'tech': ['💻', '📱', '🔧'],
  'climate': ['🌍', '♻️', '🌱'],
  'EVs': ['🚗', '⚡', '🔋'],
  'food': ['🍕', '🥑', '🍔'],
  'work': ['💼', '🏠', '💻'],
  'social': ['📱', '💬', '👥'],
  'streaming': ['📺', '🎬', '🍿'],
  'gaming': ['🎮', '🕹️', '👾'],
  'fashion': ['👟', '🔥', '✨'],
  'sneakers': ['👟', '🔥', '💯'],
  'music': ['🎵', '🎤', '🎧'],
  'space': ['🚀', '🌟', '🪐'],
  'crypto': ['🪙', '📈', '💰'],
  'mental': ['🧠', '💙', '😮‍💨'],
  'influencer': ['📸', '✨', '💭'],
  'brain': ['🧠', '😵‍💫', '⏳'],
  'money': ['💸', '💰', '🏦'],
  'chaos': ['🔥', '💀', '😅']
};

async function generateDebateQuestion(
  keyword: string, 
  style: string = 'genz', 
  maxEmojis: number = 2, 
  safeMode: string = 'strict'
): Promise<{ title: string; description: string; tags: string[] }> {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIKey) {
    console.log('No OpenAI key found, using heuristic generation');
    return generateHeuristicQuestion(keyword, maxEmojis, style);
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
            content: style === 'genz' ? 
              `You are a Gen Z debate question generator for "Woices" - a voice social platform. Create authentic, punchy questions that spark genuine debates using current Gen Z language and vibes.

STRICT REQUIREMENTS:
- Use 0-${maxEmojis} emojis MAX (tasteful, not spam)
- NO hashtags in titles or descriptions
- Keep titles ≤ 90-100 characters
- Keep descriptions ≤ 200-240 characters
- Use Gen Z language: "low-key", "no cap", "actually", "kinda", "literally", "vibes", "hits different", "be honest", "spill"
- Be conversational and relatable, avoid corporate tone
${safeMode === 'strict' ? '- STRICTLY avoid: adult content, graphic violence, tragedies, extremist politics, slurs, sensitive topics' : ''}

TONE EXAMPLES:
- "Is AI helping us or low-key replacing us? 🤖😬"
- "Are EVs actually greener or just vibes? 🚗⚡"
- "Is social media connecting us or frying our brains? 📱🧠"

FORMAT (JSON only):
{
  "title": "Short, punchy Gen Z question (90-100 chars with emojis)",
  "description": "Conversational explanation with both sides, ending with engaging question (200-240 chars)",
  "tags": ["5-7 relevant keywords without # symbol"]
}` 
              :
              `You are a professional debate question generator for a voice social platform called "Woices". Generate engaging, thought-provoking debate questions from trending topics. 

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
      
      // Post-process for safety and emoji limits
      let title = parsed.title;
      let description = parsed.description;
      
      // Count and limit emojis
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const titleEmojis = title.match(emojiRegex) || [];
      const descEmojis = description.match(emojiRegex) || [];
      
      if (titleEmojis.length > maxEmojis) {
        title = title.replace(emojiRegex, (match, index) => titleEmojis.slice(0, maxEmojis).includes(match) ? match : '').trim();
      }
      if (descEmojis.length > maxEmojis) {
        description = description.replace(emojiRegex, (match, index) => descEmojis.slice(0, maxEmojis).includes(match) ? match : '').trim();
      }
      
      // Safety filter for blocked content
      const blockedKeywords = ['nsfw', 'adult', 'explicit', 'sexual', 'violence', 'death', 'suicide', 'terrorist', 'bomb', 'gun', 'weapon'];
      const hasBlockedContent = blockedKeywords.some(word => 
        title.toLowerCase().includes(word) || description.toLowerCase().includes(word)
      );
      
      if (hasBlockedContent && safeMode === 'strict') {
        console.log('Blocked content detected, using fallback');
        return generateHeuristicQuestion(keyword, maxEmojis, style);
      }
      
      return {
        title: title.substring(0, style === 'genz' ? 100 : 100),
        description: description.substring(0, style === 'genz' ? 240 : 280),
        tags: parsed.tags.slice(0, 7)
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return generateHeuristicQuestion(keyword, maxEmojis, style);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateHeuristicQuestion(keyword, maxEmojis, style);
  }
}

function generateHeuristicQuestion(keyword: string, maxEmojis: number = 2, style: string = 'genz'): { title: string; description: string; tags: string[] } {
  if (style === 'genz') {
    const genzStarters = [
      "Is", "Are", "Should", "Can", "Will", "Do"
    ];
    
    const genzMiddles = [
      "actually", "really", "low-key", "literally", "kinda"
    ];
    
    const genzEndings = [
      "helping us or replacing us?",
      "worth the hype or overrated?",
      "the future or just vibes?",
      "connecting us or frying our brains?",
      "a flex or just expensive?",
      "genius or chaos?",
      "changing everything or nothing?",
      "authentic or just aesthetic?"
    ];

    // Find relevant emojis based on keyword
    let relevantEmojis: string[] = [];
    for (const [category, emojis] of Object.entries(emojiMap)) {
      if (keyword.toLowerCase().includes(category.toLowerCase())) {
        relevantEmojis = emojis;
        break;
      }
    }
    
    const starter = genzStarters[Math.floor(Math.random() * genzStarters.length)];
    const middle = Math.random() > 0.5 ? genzMiddles[Math.floor(Math.random() * genzMiddles.length)] + ' ' : '';
    const ending = genzEndings[Math.floor(Math.random() * genzEndings.length)];
    
    // Add 1-2 emojis if relevant ones found and maxEmojis allows it
    let emojis = '';
    if (relevantEmojis.length > 0 && maxEmojis > 0) {
      const numEmojis = Math.min(maxEmojis, Math.floor(Math.random() * 2) + 1);
      const selectedEmojis = [];
      for (let i = 0; i < numEmojis; i++) {
        const emoji = relevantEmojis[Math.floor(Math.random() * relevantEmojis.length)];
        if (!selectedEmojis.includes(emoji)) {
          selectedEmojis.push(emoji);
        }
      }
      emojis = ' ' + selectedEmojis.join('');
    }
    
    const title = `${starter} ${keyword} ${middle}${ending}${emojis}`.substring(0, 100);
    
    const genzDescriptions = [
      `Honestly kinda split on this one. Some people are totally here for it, others think it's overrated. What's your take?`,
      `This hits different for everyone. Some say it's the future, others think it's just hype. Where do you stand?`,
      `People have opinions on this one. Some are loving it, others are questioning everything. What's your vibe?`,
      `This topic is literally everywhere right now. Some think it's genius, others are skeptical. Be honest - what do you think?`,
      `Everyone's talking about this but nobody agrees. Some are all in, others are like nah. What's your honest opinion?`
    ];
    
    const description = genzDescriptions[Math.floor(Math.random() * genzDescriptions.length)];
    
    // Generate tags from keyword
    const tags = keyword.toLowerCase()
      .split(/[\s\-]+/)
      .filter(word => word.length > 2)
      .slice(0, 5);
    
    return { title, description, tags };
  } else {
    // Fallback to professional style
    const starters = ["Is", "Should", "Can", "Will", "Are", "Do", "Does"];
    const endings = [
      "the future or just hype?",
      "worth the investment?", 
      "changing everything?",
      "overrated or underrated?",
      "a game changer?"
    ];

    const starter = starters[Math.floor(Math.random() * starters.length)];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    
    const title = `${starter} ${keyword} ${ending}`.substring(0, 100);
    const description = `This topic has people divided. Some believe it's revolutionary, while others remain skeptical. What's your perspective on ${keyword}?`;
    
    const tags = keyword.toLowerCase()
      .split(/[\s\-]+/)
      .filter(word => word.length > 2)
      .slice(0, 5);
    
    return { title, description, tags };
  }
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
    let style = 'genz';  // Default to Gen Z style
    let maxEmojis = 2;
    let forceRefresh = false;
    let safeMode = 'strict';
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        style = body.style || 'genz';
        maxEmojis = body.maxEmojis ?? 2;
        forceRefresh = body.forceRefresh || false;
        safeMode = body.safeMode || 'strict';
      } catch (e) {
        console.log('No valid JSON body, using defaults');
      }
    }
    
    console.log(`Fetching trending topics with style: ${style}, maxEmojis: ${maxEmojis}, forceRefresh: ${forceRefresh}, safeMode: ${safeMode}`);
    
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