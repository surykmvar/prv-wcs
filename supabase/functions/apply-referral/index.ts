import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { referralCode } = await req.json();
    if (!referralCode) throw new Error('Referral code is required');

    console.log(`Processing referral code: ${referralCode} for user: ${userData.user.id}`);

    // Check if user already has a referral (can only be referred once)
    const { data: existingReferral } = await supabaseClient
      .from('user_referrals')
      .select('id')
      .eq('referred_id', userData.user.id)
      .single();

    if (existingReferral) {
      return new Response(
        JSON.stringify({ success: false, message: 'User has already been referred' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Find and validate the referral code
    const { data: codeData, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('id, assigned_to, max_uses, current_uses, expires_at, is_active')
      .eq('code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or inactive referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if code has expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Referral code has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if code has reached max uses
    if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
      return new Response(
        JSON.stringify({ success: false, message: 'Referral code has reached maximum uses' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if user is trying to use their own code
    if (codeData.assigned_to === userData.user.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Cannot use your own referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create referral record and increment usage atomically
    const { error: referralError } = await supabaseClient
      .from('user_referrals')
      .insert({
        referrer_id: codeData.assigned_to,
        referred_id: userData.user.id,
        referral_code_id: codeData.id
      });

    if (referralError) throw referralError;

    // Increment usage count
    const { error: updateError } = await supabaseClient
      .from('referral_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    if (updateError) throw updateError;

    console.log(`Successfully applied referral code for user: ${userData.user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Referral code applied successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error applying referral code:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});