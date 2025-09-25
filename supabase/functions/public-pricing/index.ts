import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublicPricingResponse {
  regionalPricing: {
    region: string;
    currency: string;
    price_per_point: number;
  } | null;
  creditPackages: Array<{
    id: string;
    name: string;
    points: number;
    price_cents: number;
    currency: string;
    region: string;
    is_popular: boolean;
    seasonal_offer_percentage: number | null;
    seasonal_offer_expires_at: string | null;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { region } = await req.json();
    
    console.log('Fetching public pricing for region:', region);

    // Fetch regional pricing
    let regionalPricing = null;
    const { data: pricingData, error: pricingError } = await supabaseAdmin
      .from('regional_pricing')
      .select('region, currency, price_per_point')
      .eq('region', region)
      .single();

    if (pricingError) {
      console.log('Region not found, falling back to Europe');
      // Fallback to Europe pricing
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from('regional_pricing')
        .select('region, currency, price_per_point')
        .eq('region', 'Europe')
        .single();

      if (!fallbackError && fallbackData) {
        regionalPricing = fallbackData;
      }
    } else {
      regionalPricing = pricingData;
    }

    // Fetch active credit packages for the region
    const { data: packagesData, error: packagesError } = await supabaseAdmin
      .from('credit_packages')
      .select(`
        id,
        name,
        points,
        price_cents,
        currency,
        region,
        is_popular,
        seasonal_offer_percentage,
        seasonal_offer_expires_at
      `)
      .eq('is_active', true)
      .eq('region', region)
      .order('points', { ascending: true });

    if (packagesError) {
      console.error('Error fetching credit packages:', packagesError);
      throw packagesError;
    }

    const response: PublicPricingResponse = {
      regionalPricing,
      creditPackages: packagesData || []
    };

    console.log('Successfully fetched public pricing data');

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in public-pricing function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch pricing data',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});