import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      }
    });

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Sales inquiry submission from IP:', clientIP);

    // Parse request body
    const { name, email, message, companyName } = await req.json();

    // Validate input data using database function
    const { data: isValid, error: validationError } = await supabase
      .rpc('validate_sales_inquiry_data', {
        p_name: name,
        p_email: email,
        p_message: message,
        p_company_name: companyName
      });

    if (validationError || !isValid) {
      console.error('Validation failed:', validationError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid submission data. Please check all fields.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting - max 3 submissions per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentSubmissions, error: rateCheckError } = await supabase
      .from('sales_inquiries')
      .select('id')
      .gte('created_at', oneHourAgo)
      .eq('email', email);

    if (rateCheckError) {
      console.error('Rate limit check failed:', rateCheckError);
    } else if (recentSubmissions && recentSubmissions.length >= 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many submissions. Please wait before submitting again.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 255),
      message: message.trim().substring(0, 2000),
      company_name: companyName ? companyName.trim().substring(0, 100) : null,
    };

    // Insert the sales inquiry
    const { data, error } = await supabase
      .from('sales_inquiries')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      console.error('Database insert failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit inquiry. Please try again.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Sales inquiry submitted successfully:', data.id);

    // Log the submission for audit purposes
    await supabase.rpc('log_sensitive_data_access', {
      table_name: 'sales_inquiries',
      operation: 'INSERT',
      record_id: data.id,
      user_id: null
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thank you for your inquiry! We will get back to you soon.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});