import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://ijtpdrsoddgjwyeiqalg.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role for bypassing RLS
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { trendingTopicId } = await req.json();

    if (!trendingTopicId) {
      return new Response(
        JSON.stringify({ error: 'trendingTopicId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Materializing trending topic ${trendingTopicId} for user ${user.id}`);

    // Get the trending topic from cache
    const { data: trendingTopic, error: fetchError } = await supabase
      .from('trending_topics_cache')
      .select('*')
      .eq('id', trendingTopicId)
      .eq('is_active', true)
      .single();

    if (fetchError || !trendingTopic) {
      console.error('Trending topic not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Trending topic not found or expired' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if this trending topic has already been materialized
    const { data: existingThought, error: existingError } = await supabase
      .from('thoughts')
      .select('id')
      .eq('title', trendingTopic.title)
      .eq('status', 'active')
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing thought:', existingError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If thought already exists, return its ID
    if (existingThought) {
      console.log(`Trending topic already materialized as thought ${existingThought.id}`);
      return new Response(
        JSON.stringify({ 
          thoughtId: existingThought.id,
          message: 'Trending topic already materialized',
          alreadyExists: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the thought in the database
    const thoughtData = {
      title: trendingTopic.title,
      description: trendingTopic.description,
      tags: trendingTopic.tags,
      user_id: user.id,
      thought_scope: 'global' as const,
      max_woices_allowed: 10, // This will be enforced by the trigger we created
      status: 'active' as const,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
    };

    const { data: newThought, error: insertError } = await supabase
      .from('thoughts')
      .insert(thoughtData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating thought:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create thought' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully materialized trending topic as thought ${newThought.id}`);

    return new Response(
      JSON.stringify({ 
        thoughtId: newThought.id,
        thought: newThought,
        message: 'Trending topic materialized successfully',
        alreadyExists: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in materialize-trending:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});