import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    // Use the service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    logStep('Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const { points, planType, planDetails, region, currency } = await req.json();
    if (!points || points < 10) throw new Error('Invalid points amount');
    if (!region || !currency) throw new Error('Invalid region or currency');
    logStep('Request parsed', { points, planType, planDetails, region, currency });

    // Lookup pricing server-side from regional_pricing table
    const { data: pricingData, error: pricingError } = await supabaseClient
      .from('regional_pricing')
      .select('price_per_point')
      .eq('region', region)
      .eq('currency', currency.toLowerCase())
      .single();
    
    if (pricingError || !pricingData) {
      throw new Error(`Pricing not found for region ${region} with currency ${currency}`);
    }
    
    const pricePerPoint = pricingData.price_per_point;
    logStep('Pricing lookup completed', { region, currency, pricePerPoint });

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('Existing customer found', { customerId });
    } else {
      logStep('No existing customer found');
    }

    // Calculate total price in cents with plan multiplier
    const multiplier = planType === 'usage' ? 1.2 : 1.0;
    const basePrice = Math.round(points * pricePerPoint);
    const totalPrice = Math.round(basePrice * multiplier);
    logStep('Price calculated', { points, pricePerPoint, multiplier, basePrice, totalPrice });

    // Create product name and description based on plan details
    const planName = planDetails?.name || 'Custom Amount';
    const productName = `${planName} - ${points} Woices Credits`;
    const productDescription = planType === 'usage' 
      ? `${planName} usage-based plan with ${points} credits (${region} pricing)`
      : `${planName} annual plan with ${points} credits (${region} pricing)`;

    // Get trusted frontend URL from environment
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://ijtpdrsoddgjwyeiqalg.supabase.co';
    logStep('Using frontend URL', { frontendUrl });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: totalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/`,
      metadata: {
        user_id: user.id,
        points: points.toString(),
        region: region,
        plan_type: planType || 'custom',
        plan_name: planName,
      },
    });
    logStep('Checkout session created', { sessionId: session.id });

    // Create order record
    const { error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount_cents: totalPrice,
        currency: currency,
        points_purchased: points,
        region: region,
        status: 'pending'
      });

    if (orderError) {
      logStep('Order creation failed', { error: orderError });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    logStep('Order record created');

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in create-checkout', { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});