import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create service role client for privileged operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log(`Ensuring initial credits for user: ${user.id}`);

    // Check if user already has a subscription record (meaning they've already received initial credits)
    const { data: existingSubscription } = await supabaseService
      .from("user_subscriptions")
      .select("id, credits_balance")
      .eq("user_id", user.id)
      .single();

    // If no subscription exists, this is a first-time login
    if (!existingSubscription) {
      console.log("First-time user detected, allocating 50 initial credits");
      
      // Allocate initial 50 credits
      const { error: creditError } = await supabaseService.rpc(
        "allocate_activity_credits",
        {
          user_uuid: user.id,
          activity_type: "first_login_bonus"
        }
      );

      if (creditError) {
        console.error("Error allocating initial credits:", creditError);
        throw new Error("Failed to allocate initial credits");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Initial 50 credits allocated",
          credits_allocated: 50
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User already has credits",
        existing_balance: existingSubscription.credits_balance
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in ensure-initial-credits:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});