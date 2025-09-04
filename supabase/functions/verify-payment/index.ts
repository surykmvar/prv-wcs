import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://ijtpdrsoddgjwyeiqalg.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication failed');
    }

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error('Session ID is required');
    logStep('Session ID received', { sessionId, userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep('Session retrieved', { status: session.payment_status });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false, 
        status: session.payment_status 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get order from database and verify it belongs to the authenticated user
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (orderError) {
      logStep('Order not found or unauthorized', { error: orderError });
      throw new Error('Order not found or you are not authorized to access this order');
    }

    // Check if already processed
    if (order.status === 'completed') {
      logStep('Order already processed');
      return new Response(JSON.stringify({ 
        success: true, 
        alreadyProcessed: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Update order status
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id);

    if (updateError) throw new Error(`Failed to update order: ${updateError.message}`);

    // Add credits to user account
    const { data: creditsUpdated, error: creditsError } = await supabaseClient.rpc('update_user_credits', {
      user_uuid: order.user_id,
      credit_amount: order.points_purchased,
      transaction_type: 'purchase',
      description: `Purchased ${order.points_purchased} credits`,
      reference_uuid: order.id
    });

    if (creditsError) throw new Error(`Failed to add credits: ${creditsError.message}`);
    if (!creditsUpdated) throw new Error('Failed to update credits balance');

    logStep('Credits added successfully', { 
      userId: order.user_id, 
      points: order.points_purchased 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      pointsAdded: order.points_purchased 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in verify-payment', { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});